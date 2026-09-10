"use client";

import { useEffect, useMemo } from "react";

import type * as maplibregl from "maplibre-gl";

import {
  ekspresiOpacityZona,
  ekspresiWarnaZona,
  joinZona,
  LAYER_ZONA_BELUM_LINE,
  LAYER_ZONA_LINE,
  layerZonaBelumLine,
  layerZonaLine,
} from "@/lib/map/zona";
import { LAYER_DESA_FILL, LAYER_DESA_TERPILIH_FILL, SUMBER_DESA } from "@/lib/map/sumber";
import { useGeoDesa } from "@/shared/hooks/queries-wilayah";

import { usePetaPeranPeta } from "./queries";

/**
 * Task 20 dipecah dua (rencana § "A plan defect you must resolve this way"):
 * Task 15 mewajibkan `useMapBase` dipanggil SEBELUM hook layer lensa (urutan
 * tumpukan layer), sementara Task 20 asli mewajibkan hasil balik
 * (`fiturDesa`/`warnaFill`) DITERUSKAN ke `useMapBase` — dua hook tidak bisa
 * memenuhi keduanya sekaligus untuk satu titik panggil. Dipecah menurut JENIS
 * kerja, bukan menurut lensa:
 *
 * - `usePetaPeranData` — query (`useGeoDesa`, `usePetaPeranPeta`) +
 *   `useMemo` SAJA, NOL efek peta. Dipanggil shell SEBELUM `useMapBase`;
 *   karena tidak menyentuh layer sama sekali, posisi panggilnya tidak
 *   mempengaruhi tumpukan.
 * - `usePetaPeranLayers` — HANYA efek peta (mount/bongkar
 *   `LAYER_ZONA_LINE`/`LAYER_ZONA_BELUM_LINE` + `fill-opacity` `desa-fill`),
 *   NOL query. Dipanggil shell SETELAH `useMapBase`, menjaga urutan tumpukan
 *   Task 10 GOTCHA 2 (kedua layer garis zona berakhir DI ATAS `desa-fill`).
 *
 * ID sumber+layer `desa`/`desa-fill`/`desa-terpilih-fill` diimpor dari
 * `@/lib/map/sumber` (review M8) — sebelumnya direplikasi sebagai literal di
 * sini, sekarang satu sumber kebenaran dipakai bersama `use-map-base.ts` dan
 * `lib/map/zona.ts`.
 */

type UsePetaPeranDataOpsi = {
  kab?: string;
  /** `true` hanya saat lensa Peta Peran sedang dirender — query TETAP
   * dipanggil tanpa syarat (Rules of Hooks); `aktif` yang mengontrol
   * `enabled` query dan nilai balik, bukan pemanggilannya. */
  aktif: boolean;
};

type UsePetaPeranDataHasil = {
  /** Diteruskan ke opsi `fiturDesa` `useMapBase` — `null` saat tidak aktif
   * atau data belum siap, supaya base memakai geo apa adanya (idle). */
  fiturDesa: GeoJSON.FeatureCollection | null;
  /** Diteruskan ke opsi `warnaFill` `useMapBase` — ekspresi `match`
   * (`unknown`, lihat `zona.ts`), `undefined` saat tidak aktif. */
  warnaFill: unknown;
};

/**
 * Modul konstan (review C1): `ekspresiWarnaZona()` tidak menerima input —
 * dipanggil SEKALI di sini, bukan tiap render `usePetaPeranData`. Referensi
 * balik `unknown` ini identik lintas render, sedangkan memanggil
 * `ekspresiWarnaZona()` langsung di badan hook membangun ARRAY BARU tiap
 * kali — array baru itu, walau isinya sama, adalah dependency BARU bagi efek
 * 3 `useMapBase` (`shared/hooks/use-map-base.ts`), yang memicu `setData`
 * (seluruh FeatureCollection kabupaten) dan `fitBounds` ULANG setiap render
 * shell (klik baris daftar, fold panel, drag lebar panel — apa pun yang
 * me-render ulang `DashboardShell`), melempar kamera user kembali ke bbox
 * kabupaten. Alternatif yang setara: `useMemo(() => ekspresiWarnaZona(), [])`
 * di dalam hook — dipilih konstanta modul karena lebih sederhana (tanpa hook
 * tambahan) untuk nilai yang memang tidak pernah berubah seumur modul.
 */
const WARNA_FILL_ZONA = ekspresiWarnaZona();

/** Separuh QUERY Task 20 — lihat docstring modul di atas. */
export function usePetaPeranData({ kab, aktif }: UsePetaPeranDataOpsi): UsePetaPeranDataHasil {
  const { data: geo } = useGeoDesa(kab);
  const { data: peta } = usePetaPeranPeta(kab, aktif);

  const fiturDesa = useMemo(() => {
    if (!aktif || !geo || !peta) return null;
    return joinZona(geo, peta.baris);
  }, [aktif, geo, peta]);

  const warnaFill = fiturDesa ? WARNA_FILL_ZONA : undefined;

  return { fiturDesa, warnaFill };
}

type UsePetaPeranLayersOpsi = {
  map: maplibregl.Map | null;
  styleVersion: number;
  /** `true` hanya saat lensa Peta Peran sedang dirender — hook TETAP
   * dipanggil tanpa syarat di `dashboard-shell.tsx` (Rules of Hooks); `aktif`
   * yang mengontrol isi efeknya, bukan pemanggilannya. */
  aktif: boolean;
  /** Hasil `usePetaPeranData` — dipakai untuk menentukan kapan layer garis
   * putus dipasang (hanya bila join zona sudah tersedia). */
  fiturDesa: GeoJSON.FeatureCollection | null;
};

/**
 * Separuh EFEK Task 20 — lihat docstring modul di atas. Memasang/membongkar
 * `LAYER_ZONA_LINE` (review H5, garis 2px empat zona) DAN
 * `LAYER_ZONA_BELUM_LINE` (garis putus Belum Terpetakan), DAN menyetel
 * `fill-opacity` layer `desa-fill` milik base lewat `ekspresiOpacityZona()`
 * (DESIGN.md § Zone choropleth: isi 45% — HANYA untuk fitur berproperti
 * `zona`; fitur semu "KAWASAN" tanpanya tetap opacity 1, lihat `zona.ts`,
 * review temuan #5). `fill-opacity` disetel TERPISAH dari `fill-color`
 * (bukan hex ber-alpha di `WARNA_ZONA`) persis alasan `zona.ts` — nilai hue
 * di sana tetap penuh, disetel ke 45% hanya lewat paint property ini.
 *
 * URUTAN TUMPUKAN (review L6): kedua layer garis zona dipasang dengan
 * `beforeId: LAYER_DESA_TERPILIH_FILL`, jadi berakhir DI BAWAH highlight
 * desa terpilih — bukan di atasnya (bug sebelumnya: `addLayer` tanpa
 * `beforeId` menaruh garis putus Belum Terpetakan DI ATAS garis putih 2px
 * seleksi, mengubur highlight-nya). Urutan lengkap tumpukan `desa` di peta,
 * bawah ke atas: `desa-fill` (choropleth) → `desa-line` (batas 1px base) →
 * `desa-zona-line` (garis 2px empat zona) → `desa-zona-belum-line` (garis
 * putus Belum Terpetakan — urutan relatif kedua layer zona ini tidak
 * penting, filternya saling eksklusif) → `desa-terpilih-fill` →
 * `desa-terpilih-line` (highlight seleksi, SELALU paling atas dan terbaca).
 * `LAYER_DESA_TERPILIH_FILL` dipasang base BERSAMAAN dengan `LAYER_DESA_FILL`
 * (efek 3 `use-map-base.ts`, satu blok `addLayer` saat sumber belum ada), dan
 * BERSAMAAN pula saat dibongkar (`bersihkanLapisan` melepas keduanya sebelum
 * `removeSource`) — begitu `map.getSource(SUMBER_DESA)` ada, layer itu juga
 * ADA, aman dipakai sebagai `beforeId` tanpa pengecekan tambahan. Invariant
 * itu HANYA benar berkat urutan bongkar di bawah (lihat paragraf berikutnya)
 * — sebelum perbaikan ini, bisa PATAH (review temuan #1, CRITICAL).
 *
 * BONGKAR LEWAT CLEANUP, BUKAN CABANG "TIDAK AKTIF" (review temuan #1,
 * CRITICAL): kedua layer garis zona dilepas lewat fungsi yang DIKEMBALIKAN
 * efek ini (`return () => {...}`), bukan inline di cabang
 * `!aktif || !fiturDesa` seperti sebelumnya. Alasannya urutan commit React:
 * dalam SATU commit, React menjalankan SEMUA fungsi cleanup (lintas
 * komponen/hook, urut panggilan hook) LEBIH DULU, BARU menjalankan semua
 * badan efek yang baru. `useMapBase` dipanggil SEBELUM hook ini (urutan
 * tumpukan layer, docstring `use-map-base.ts`), jadi badan efek 3
 * `useMapBase` — yang membongkar `desa-fill`/`desa-line`/kedua layer
 * terpilih lalu memanggil `removeSource(SUMBER_DESA)` saat `kab` dikosongkan
 * — SELALU berada di fase "badan baru", SETELAH fase cleanup. Sebelum
 * perbaikan ini, pembongkaran garis zona hidup di badan efek (bukan
 * cleanup), jadi ia JUGA jalan di fase "badan baru" — kadang SETELAH
 * `removeSource` sudah dicoba. MapLibre menolak `removeSource` DIAM-DIAM
 * (fire `ErrorEvent`, tidak melempar) selama masih ada layer yang
 * merujuknya, jadi sumber `desa` bertahan tanpa satu layer pun, dan mount
 * berikutnya (`if (!map.getSource(SUMBER_DESA))`) tidak pernah benar lagi —
 * SELURUH lapisan `desa` mati diam untuk sisa sesi. Memindahkan pembongkaran
 * ke cleanup membuatnya SELALU jalan di fase "cleanup", SEBELUM badan efek 3
 * `useMapBase` sempat mencoba `removeSource` — urutannya terbalik dengan
 * sendirinya, dan `removeSource` selalu menemukan sumber tanpa dependan.
 *
 * CATATAN review ronde 3 (temuan #3): urutan efek di atas TETAP benar untuk
 * kasus efek ini yang berhenti jalan (berganti lensa TANPA `kab` berubah —
 * `fiturDesa` jadi `null`, efek ini rerun, cleanup-nya sendiri melepas kedua
 * layer). Tapi ada kasus LAIN yang urutan ini TIDAK menjangkau: `geoError`
 * berubah `true` sementara `geo` (dependency `useMemo` `fiturDesa` di
 * `usePetaPeranData`) masih data lama — `fiturDesa` TIDAK berganti identitas,
 * efek ini TIDAK rerun, cleanup di atas TIDAK jalan sama sekali, padahal
 * `useMapBase` efek 3 TETAP membongkar `SUMBER_DESA` untuk kasus itu. Ronde
 * 3 menutup celah itu di sisi `use-map-base.ts` (`bersihkanSumberDanLayerTerkait`,
 * `lib/map/sumber.ts`, bertanya ke style layer mana yang merujuk sumbernya —
 * bukan bergantung pada cleanup hook ini sudah jalan lebih dulu). Cleanup di
 * atas tetap DIPERTAHANKAN sebagai jalur normalnya (murah, dan satu-satunya
 * yang menjangkau kasus "berganti lensa di kabupaten yang sama" karena
 * `useMapBase` tidak membongkar `SUMBER_DESA` sama sekali di kasus itu) —
 * bukan lagi satu-satunya penjaga terhadap CRITICAL ronde 2.
 */
export function usePetaPeranLayers({ map, styleVersion, aktif, fiturDesa }: UsePetaPeranLayersOpsi): void {
  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    if (!aktif || !fiturDesa) return;

    // Sumber `desa` dipasang base (`useMapBase`) di efek yang jalan lebih
    // dulu — dijamin ADA hanya bila hook ini dipanggil SETELAH `useMapBase`
    // (Task 10 GOTCHA 2, Task 20 GOTCHA 3). Bila belum ada, berhenti dan
    // tunggu render berikutnya — TANPA cleanup terdaftar, karena belum ada
    // apa pun yang dipasang efek ini untuk dibongkar.
    if (!petaAktif.getSource(SUMBER_DESA)) return;

    if (petaAktif.getLayer(LAYER_DESA_FILL)) {
      // GOTCHA: `unknown` di-cast ke `number` di sini, sama seperti
      // `warnaFill` di-cast `string` di `use-map-base.ts` — anotasi lebar
      // membuat pengecekan lawan tipe ekspresi MapLibre yang salah.
      petaAktif.setPaintProperty(LAYER_DESA_FILL, "fill-opacity", ekspresiOpacityZona() as number);
    }
    if (!petaAktif.getLayer(LAYER_ZONA_LINE)) {
      petaAktif.addLayer(layerZonaLine() as maplibregl.AddLayerObject, LAYER_DESA_TERPILIH_FILL);
    }
    if (!petaAktif.getLayer(LAYER_ZONA_BELUM_LINE)) {
      petaAktif.addLayer(layerZonaBelumLine() as maplibregl.AddLayerObject, LAYER_DESA_TERPILIH_FILL);
    }

    // Cleanup — lihat paragraf "BONGKAR LEWAT CLEANUP" di atas untuk alasan
    // ini TIDAK boleh pindah ke cabang `!aktif || !fiturDesa` di atas. Aman
    // dipanggil walau `petaAktif` sudah `.remove()`-ed di antaranya:
    // `getLayer`/`getSource` MapLibre meng-optional-chain `this.style` dan
    // balik `undefined` diam-diam setelah `remove()` (bukan melempar), jadi
    // setiap panggilan di sini sudah dijaga penjaga `if (petaAktif.getLayer(
    // …))` yang ada — tidak perlu try/catch tambahan.
    return () => {
      if (petaAktif.getLayer(LAYER_ZONA_LINE)) petaAktif.removeLayer(LAYER_ZONA_LINE);
      if (petaAktif.getLayer(LAYER_ZONA_BELUM_LINE)) petaAktif.removeLayer(LAYER_ZONA_BELUM_LINE);
      if (petaAktif.getLayer(LAYER_DESA_FILL)) petaAktif.setPaintProperty(LAYER_DESA_FILL, "fill-opacity", 1);
    };
  }, [map, styleVersion, aktif, fiturDesa]);
}
