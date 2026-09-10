/**
 * Tipe render lensa Jalur Ekonomi (Task 26, bagian tipe). OpenAPI mengetik
 * seluruh rute Jalur Ekonomi `dict[str, Any]` / `list[dict[str, Any]]` — pola
 * dan alasannya sama seperti `features/kartu/types.ts` dan
 * `features/peta-peran/types.ts`. Rincian lima bentuk grup detail satu jalur
 * ada di rencana `.claude/PRPs/plans/fase-3-4-peta-peran-jalur-ekonomi.plan.md` (lokal saja)
 * § "Bentuk artefak dan respons nyata".
 *
 * Fungsi `normalisasiJalur` yang meratakan lima bentuk grup ke
 * `JalurTernormalisasi` hidup di `services/normalisasi.ts` (berkas terpisah,
 * BUKAN bagian berkas ini) — di sini hanya kontrak tipe yang dipakainya.
 */

import type { Varian } from "@/lib/url-state";

/** Empat varian Jalur Ekonomi, urutan tampil GLOSSARY § Varian Jalur Ekonomi
 * — dipakai `pilih-varian.tsx` (Task 28) untuk urutan chip. */
export const VARIAN: readonly { slug: Varian; nama: string }[] = [
  { slug: "komoditas", nama: "Komoditas" },
  { slug: "gudang-kopdes", nama: "Gudang Kopdes" },
  { slug: "cold-storage", nama: "Cold Storage" },
  { slug: "wisata", nama: "Wisata" },
];

/** Baris ringkas `GET /api/model/jalur-ekonomi/{varian}` (`api/src/jalur_ekonomi/service.py` `_baris_ringkas`). */
export type BarisJalur = {
  id_jalur: string;
  idkab: string;
  nmkab: string;
  poros: { iddesa: string; nmdesa: string; nmkec?: string };
  n_anggota: number;
  /** Arti berbeda per varian (rencana § "Bentuk artefak"): volume ruta
   * (komoditas), volume ruta tani (gudang), volume ruta rantai dingin (cs
   * baru), kapasitas ton (cs eksisting), bobot registri (wisata). */
  bobot: number;
  /** Arti berbeda per varian juga: nama komoditas, atau string teknis
   * (`"gudang"`, `"cs-baru"`, `"cs-eksisting"`), atau kategori Jadesta basis.
   * Kunci teknis TIDAK boleh ditampilkan apa adanya — dipetakan ke kalimat
   * Indonesia di komponen daftar (Task 31). */
  label: string;
};

/**
 * Bentuk seragam hasil `normalisasiJalur` — meratakan LIMA bentuk grup
 * `GET /api/model/jalur-ekonomi/{varian}/{id_jalur}` (`komoditas`,
 * `gudang-kopdes`, `cold-storage` unit baru, `cold-storage` unit eksisting,
 * `wisata`) ke satu kontrak dipakai `detail-jalur.tsx` dan `lib/map/jalur.ts`.
 */
export type JalurTernormalisasi = {
  id_jalur: string;
  /** Peran GLOSSARY. `false` untuk baris `cs-eksisting`: GLOSSARY menegaskan
   * Desa Poros varian Cold Storage HANYA diberikan pada unit BARU usulan
   * model — gudang beku yang kebetulan sudah berdiri adalah fakta, bukan
   * peran, dan tidak boleh terbaca sebagai temuan model. */
  porosAdalahPeran: boolean;
  pusat: { iddesa: string; nmdesa: string; nmkec: string | null };
  /** Memuat porosnya sendiri (menit 0,0) pada varian `komoditas` dan
   * `gudang-kopdes` — jangan dikurangi, jangan hitung ulang `n_anggota`. */
  anggota: {
    iddesa: string;
    nmdesa: string;
    nmkec: string | null;
    bobot: number | null;
    menit: number | null;
  }[];
  /** Cacah desa APA ADANYA dari artefak (`n_anggota`/`n_desa_layanan`/
   * `n_desa` tergantung bentuk grup) — BUKAN `anggota.length`. Keduanya
   * biasanya sama, tetapi hanya `nAnggota` benar saat kunci daftar anggota
   * hilang/berganti nama dan `anggota` jatuh ke array kosong (Task 26
   * GOTCHA 1: "tampilkan `n_anggota` apa adanya"). `null` hanya bila grup
   * itu sendiri tidak membawa kunci cacahnya. */
  nAnggota: number | null;
  /** Label singkat DESIGN.md `label` di atas figur bobot (mis. "Volume",
   * "Kapasitas", "Bobot registri") — dipakai apa adanya di
   * `detail-jalur.tsx`, tidak dihitung ulang di komponen. */
  label: string;
  /** Satuan yang BENAR untuk varian ini, tampil SETELAH angka (mis. "rumah
   * tangga", "ton"). `null` untuk `wisata` — bobotnya indeks registri, bukan
   * ukuran fisik. */
  unit: string | null;
  bobot: number | null;
  kecamatan: string[];
};
