"use client";

import { useEffect } from "react";

import type * as maplibregl from "maplibre-gl";

import {
  LAYER_KEMBAR_FILL,
  LAYER_KEMBAR_LINE,
  layerKembarFill,
  layerKembarLine,
} from "@/lib/map/kembar";
import { LAYER_DESA_TERPILIH_FILL, SUMBER_DESA } from "@/lib/map/sumber";
import { useGeoDesa } from "@/shared/hooks/queries-wilayah";

type UseKembarLayersOpsi = {
  map: maplibregl.Map | null;
  styleVersion: number;
  /** `true` hanya saat lensa Desa Kembar sedang dirender — hook TETAP
   * dipanggil TANPA SYARAT di `dashboard-shell.tsx` (Rules of Hooks); `aktif`
   * yang mengontrol isi efeknya, bukan pemanggilannya. */
  aktif: boolean;
  /** `?kembar=` (`iddesa` desa kembar terpilih) — `undefined` bila belum ada
   * kembar dipilih. */
  kembar: string | undefined;
  /** `?kab=` aktif — diteruskan HANYA ke `useGeoDesa` di bawah, sebagai sinyal
   * "sumber `desa` sudah terpasang", BUKAN untuk logika lain di hook ini.
   * BUKAN permintaan baru: `queryKey: ["geo", kab]` sama dengan yang sudah
   * diminta `useMapBase`, cache TanStack Query dibagi (pola
   * `features/jalur-ekonomi/hooks/use-jalur-data.ts`). */
  kab?: string;
};

/**
 * Sorotan Desa Kembar terpilih (Task 10): dua layer (`desa-kembar-fill`,
 * `desa-kembar-line`, `lib/map/kembar.ts`) di atas `SUMBER_DESA` milik base
 * (`shared/hooks/use-map-base.ts`) — SATU-satunya sumber geo dipakai, karena
 * seluruh 12 tetangga Desa Kembar SELALU satu kabupaten dengan acuannya
 * (GLOSSARY § Kemiripan Desa Kembar), jadi geo yang sudah dimuat base cukup
 * tanpa permintaan tambahan.
 *
 * `beforeId: LAYER_DESA_TERPILIH_FILL` (GOTCHA 2 rencana) supaya sorotan
 * putih desa ACUAN tetap paling atas — layer itu dijamin ada begitu
 * `SUMBER_DESA` ada (base memasang keempat layernya dalam satu blok
 * `addLayer`, `use-map-base.ts` efek 3).
 *
 * BONGKAR LEWAT CLEANUP, BUKAN CABANG "TIDAK AKTIF" (Task 10 GOTCHA 1,
 * CRITICAL — jebakan yang sama persis mengapa garis zona Peta Peran gagal di
 * fase 3-4, `app/CLAUDE.md` §10): kedua layer di sini hidup di `SUMBER_DESA`
 * milik base, BUKAN sumber milik hook ini sendiri. `removeSource` maplibre-gl
 * 6.8.0 menolak DIAM-DIAM (fire `ErrorEvent`, TIDAK melempar) selama masih
 * ada layer yang merujuk sumbernya, dan listener `map.on("error", …)` di
 * `map-stage.tsx` menelan event itu tanpa satu baris konsol. Bila kedua layer
 * ini dilepas di cabang `if (!aktif || !kembar) return;` (badan efek, bukan
 * cleanup), urutannya BISA terbalik dengan pembongkaran `SUMBER_DESA` di efek
 * 3 `useMapBase` — React menjalankan SELURUH fase cleanup lintas hook lebih
 * dulu, BARU seluruh fase badan baru, dalam satu commit. Menaruh pembongkaran
 * di fungsi yang DIKEMBALIKAN efek ini (bukan di badan) membuatnya SELALU
 * berada di fase cleanup — SEBELUM badan efek 3 `useMapBase` sempat mencoba
 * `removeSource` — sehingga urutannya terbalik dengan sendirinya tanpa
 * bergantung urutan panggil hook. Tanpa ini, `SUMBER_DESA` bertahan yatim
 * tanpa layer, dan SELURUH lapisan desa (base + lensa lain) mati sampai
 * halaman dimuat ulang.
 *
 * TANPA `fitBounds` di sini (GOTCHA 4) — base sudah memegang kamera; kamera
 * kedua yang berebut melempar peta (pelajaran Task 30 fase 4).
 *
 * `geoSiap` DI DEP ARRAY (review ronde 2 fase 5, B1 — MEDIUM): penjaga
 * `getSource` di atas bisa early-return TERUS TANPA PERNAH JALAN LAGI selama
 * sesi, karena dep array lama (`[map, styleVersion, aktif, kembar]`) tidak
 * memuat apa pun yang berubah saat sumber `desa` akhirnya terpasang
 * `useMapBase` — kasus deep-link dingin: `aktif` naik lebih dulu sementara
 * geo kabupaten masih diunduh, efek ini jalan sekali, early-return, lalu diam
 * selamanya begitu geo tiba. `usePetaPeranLayers`/`useCitraLayers` sembuh
 * sendiri karena keduanya membawa `fiturDesa` di dep array; hook ini tidak
 * punya seam serupa, jadi `geoSiap` (`Boolean(geo.data)`) ditambahkan SEBAGAI
 * DEPENDENCY SAJA supaya efek jalan ulang begitu geo siap — nilainya sendiri
 * TIDAK dibaca di badan efek, penjaga `getSource` tetap sabuk pengaman yang
 * sebenarnya. JANGAN membuang `geoSiap` sebagai dependency "tidak terpakai".
 */
export function useKembarLayers({
  map,
  styleVersion,
  aktif,
  kembar,
  kab,
}: UseKembarLayersOpsi): void {
  const geo = useGeoDesa(kab);
  const geoSiap = Boolean(geo.data);

  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    if (!aktif || !kembar) return;
    // Sumber `desa` dipasang base (`useMapBase`), dijamin ada hanya bila hook
    // ini dipanggil SETELAH `useMapBase` (urutan tumpukan layer,
    // `dashboard-shell.tsx`). Belum ada → tunggu render berikutnya (`geoSiap`
    // di dep array memastikan render itu datang), TANPA cleanup terdaftar
    // karena belum ada apa pun dipasang efek ini.
    if (!petaAktif.getSource(SUMBER_DESA)) return;

    // `addLayer` SAJA, tanpa cabang `else setFilter` (review #8): cleanup
    // efek ini SELALU melepas kedua layer lebih dulu setiap `kembar` berganti
    // (React menjalankan seluruh fase cleanup sebelum badan baru), jadi
    // `getLayer` di sini tidak pernah menemukan layer lama yang masih
    // terpasang — cabang `setFilter` tidak pernah tercapai.
    petaAktif.addLayer(
      layerKembarFill(kembar) as maplibregl.AddLayerObject,
      LAYER_DESA_TERPILIH_FILL,
    );
    petaAktif.addLayer(
      layerKembarLine(kembar) as maplibregl.AddLayerObject,
      LAYER_DESA_TERPILIH_FILL,
    );

    return () => {
      if (petaAktif.getLayer(LAYER_KEMBAR_LINE)) petaAktif.removeLayer(LAYER_KEMBAR_LINE);
      if (petaAktif.getLayer(LAYER_KEMBAR_FILL)) petaAktif.removeLayer(LAYER_KEMBAR_FILL);
    };
  }, [map, styleVersion, aktif, kembar, geoSiap]);
}
