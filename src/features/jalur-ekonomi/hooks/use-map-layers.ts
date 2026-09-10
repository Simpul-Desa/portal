"use client";

/**
 * Hook layer garis Jalur Ekonomi (Task 30, rencana
 * `fase-3-4-peta-peran-jalur-ekonomi.plan.md`). Beda dari
 * `usePetaPeranData`/`usePetaPeranLayers` (dipecah jadi dua hook karena
 * hasilnya harus DITERUSKAN sebagai opsi `useMapBase`): lensa ini TIDAK
 * menimpa apa pun milik base (tidak ada `fiturDesa`/`warnaFill` yang perlu
 * mengalir ke `useMapBase`), jadi query (`useJalurData`) dan efek peta boleh
 * hidup di SATU hook yang sama, dipanggil SETELAH `useMapBase` di
 * `dashboard-shell.tsx` supaya garis berakhir DI ATAS layer `desa-fill`
 * milik base (Task 10 GOTCHA 2).
 *
 * `useJalurData` sendiri NOL efek peta — query + normalisasi + bangun dua
 * FeatureCollection, semuanya murni (lihat docstring berkas itu). Hook ini
 * HANYA memasang/membongkar tiga layer (`jalur-line`, `jalur-anggota`,
 * `jalur-poros`) dari hasilnya.
 */

import { useEffect } from "react";

import type * as maplibregl from "maplibre-gl";

import {
  LAYER_JALUR_ANGGOTA,
  LAYER_JALUR_LINE,
  LAYER_JALUR_POROS,
  layerJalurAnggota,
  layerJalurLine,
  layerJalurPoros,
  SUMBER_JALUR,
  SUMBER_JALUR_TITIK,
} from "@/lib/map/jalur";
import { bersihkanLapisan, SUMBER_DESA } from "@/lib/map/sumber";
import type { Varian } from "@/lib/url-state";

import { useJalurData } from "./use-jalur-data";

type UseJalurLayersOpsi = {
  map: maplibregl.Map | null;
  styleVersion: number;
  kab?: string;
  varian: Varian;
  idJalur?: string;
  /** `true` hanya saat lensa Jalur Ekonomi sedang dirender — hook TETAP
   * dipanggil tanpa syarat di `dashboard-shell.tsx` (Rules of Hooks); `aktif`
   * yang mengontrol isi efeknya, bukan pemanggilannya. */
  aktif: boolean;
};

/**
 * Pengendali layer garis Jalur Ekonomi (Task 30). WAJIB dipanggil SETELAH
 * `useMapBase` di `dashboard-shell.tsx` (kontrak, bukan sesuatu yang bisa
 * dipaksa dari dalam hook ini) — urutan pemanggilan hook = urutan tumpukan
 * layer, dan garis jalur harus berakhir di atas `desa-fill`.
 *
 * BONGKAR LEWAT CLEANUP, BUKAN CABANG "TIDAK AKTIF" (review Jalur Ekonomi
 * #1, HIGH — pola sama seperti `usePetaPeranLayers`, lihat docstring
 * panjangnya di `features/peta-peran/hooks/use-map-layers.ts` untuk alasan
 * lengkap urutan commit React): kedua sumber DAN ketiga layer dilepas lewat
 * fungsi yang DIKEMBALIKAN efek ini, didaftarkan HANYA setelah keduanya
 * benar-benar dipasang/diperbarui — bukan cabang inline `if (!aktif ||
 * !idJalur)` seperti sebelumnya. `kab` sekarang WAJIB ada di array
 * dependensi: sebelumnya tidak, sehingga mengosongkan `kab` (mis. klik "×"
 * pada chip Kab saat jalur masih terpilih — `pilihProv` menghapus `kab`
 * TANPA menghapus `jalur`) membiarkan garis emas dan lingkaran poros
 * kabupaten lama menggantung di atas tampilan lingkaran provinsi: cabang
 * inline lama hanya memeriksa `aktif`/`idJalur` (keduanya tetap benar), lalu
 * berhenti di penjaga `!map.getSource(SUMBER_DESA)` begitu `useMapBase`
 * (jalan lebih dulu, kontrak di atas) membongkar sumber `desa` pada commit
 * yang SAMA — cabang bongkarnya sendiri tidak pernah tercapai. Dengan
 * cleanup, pembongkaran jalur SELALU jalan di fase cleanup React (sebelum
 * badan efek manapun pada commit itu, termasuk badan efek `useMapBase` yang
 * membongkar `desa`), jadi urutan relatif keduanya tidak lagi jadi masalah.
 *
 * Konsekuensi yang diterima: efek ini kini membongkar-lalu-memasang-ulang
 * KEDUA sumber setiap kali `fcGaris`/`fcTitik` berganti identitas (mis.
 * pilih jalur lain, atau geo baru selesai dimuat untuk jalur yang sama) —
 * bukan `setData` di tempat. Cabang `!getSource → addSource` tetap dijaga
 * untuk mount pertama; cabang `else → setData` yang dipertahankan di bawah
 * jadi jarang tereksekusi dalam praktiknya, tapi tetap aman sebagai
 * pengaman bila suatu saat `styleVersion` berganti tanpa membongkar sumber
 * ini (mis. dipanggil ulang tanpa lewat cleanup). Sumbernya kecil (maksimal
 * 25 desa per jalur, GLOSSARY § Varian Jalur Ekonomi), jadi bongkar-pasang
 * ini tidak mahal.
 *
 * TANPA `fitBounds` (Task 30 GOTCHA 3): base sudah memasang kamera ke bbox
 * kabupaten saat geo dimuat; kamera kedua yang berebut di render yang sama
 * membuat peta melompat.
 */
export function useJalurLayers({
  map,
  styleVersion,
  kab,
  varian,
  idJalur,
  aktif,
}: UseJalurLayersOpsi): void {
  const { fcGaris, fcTitik } = useJalurData({ kab, varian, idJalur, aktif });

  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    if (!aktif || !idJalur) return;

    // H1: sumber `desa` dipasang base (`useMapBase`) di efek yang jalan
    // lebih dulu — dijamin ADA hanya bila hook ini dipanggil SETELAH
    // `useMapBase` (kontrak urutan panggil di atas). Bila belum ada (geo
    // kabupaten masih diunduh saat render yang sama, jalur pilih paling
    // umum: klik baris jalur mengisi `jalur` dan `kab` sekaligus), berhenti
    // dan tunggu render berikutnya — tanpa penjaga ini, layer jalur bisa
    // terpasang duluan lalu tertindih `desa-fill` begitu base menyusul
    // (garis emas dan lingkaran poros terkubur di bawah isi putih desa).
    if (!petaAktif.getSource(SUMBER_DESA)) return;

    if (!petaAktif.getSource(SUMBER_JALUR)) {
      petaAktif.addSource(SUMBER_JALUR, { type: "geojson", data: fcGaris });
      petaAktif.addLayer(layerJalurLine() as maplibregl.AddLayerObject);
    } else {
      (petaAktif.getSource(SUMBER_JALUR) as maplibregl.GeoJSONSource).setData(fcGaris);
    }

    if (!petaAktif.getSource(SUMBER_JALUR_TITIK)) {
      petaAktif.addSource(SUMBER_JALUR_TITIK, { type: "geojson", data: fcTitik });
      petaAktif.addLayer(layerJalurAnggota() as maplibregl.AddLayerObject);
      petaAktif.addLayer(layerJalurPoros() as maplibregl.AddLayerObject);
    } else {
      (petaAktif.getSource(SUMBER_JALUR_TITIK) as maplibregl.GeoJSONSource).setData(fcTitik);
    }

    return () => {
      bersihkanLapisan(petaAktif, [LAYER_JALUR_LINE], SUMBER_JALUR);
      bersihkanLapisan(petaAktif, [LAYER_JALUR_ANGGOTA, LAYER_JALUR_POROS], SUMBER_JALUR_TITIK);
    };
  }, [map, styleVersion, aktif, kab, idJalur, fcGaris, fcTitik]);
}
