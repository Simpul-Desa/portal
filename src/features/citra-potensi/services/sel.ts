/**
 * Layanan murni lensa Citra Potensi Desa (Task 15) — trim nama, kelompok
 * tema, dan baris skor per kabupaten. Nol JSX, nol hook, mengikuti pola
 * `features/jalur-ekonomi/services/normalisasi.ts`: meratakan bentuk artefak
 * ke bentuk seragam, TIDAK PERNAH melempar untuk artefak cacat.
 */

import { TEMA_SUBSEKTOR, URUTAN_TEMA, type BarisSkorSel, type SelCitra, type SelCitraDetail } from "../types";

/** Judul kelompok subsektor asing (tidak ada di `TEMA_SUBSEKTOR`) — katalog
 * bisa bertambah (Task 14 GOTCHA 2), jadi kode tak dikenal jatuh ke sini,
 * bukan ditampilkan mentah. */
const KOMODITAS_LAIN = "Komoditas lain";

/** Artefak membawa spasi ekor pada sebagian `nama` (Task 14 catatan) — WAJIB
 * di-`trim()` sebelum tampil, supaya perataan dan perbandingan nama tidak
 * rusak. */
export function namaKomoditas(nama: string): string {
  return nama.trim();
}

/** Nama tema GLOSSARY untuk satu kode subsektor, atau `null` bila kode itu
 * tidak dikenal `TEMA_SUBSEKTOR` (katalog bertambah di luar enam yang
 * diketahui hari ini). */
export function temaDari(subsektor: string): string | null {
  return Object.hasOwn(TEMA_SUBSEKTOR, subsektor)
    ? TEMA_SUBSEKTOR[subsektor as keyof typeof TEMA_SUBSEKTOR]
    : null;
}

/**
 * Kelompokkan sel menurut tema, urutan tetap `URUTAN_TEMA` lalu
 * `KOMODITAS_LAIN` untuk subsektor asing. Kelompok yang tidak punya satu pun
 * baris DIBUANG (bukan judul kosong) — provinsi bisa saja tidak punya sel
 * LAYAK untuk sebuah subsektor.
 */
export function kelompokSel(sel: readonly SelCitra[]): { tema: string; baris: SelCitra[] }[] {
  const grup = new Map<string, SelCitra[]>();

  for (const s of sel) {
    const tema = temaDari(s.subsektor) ?? KOMODITAS_LAIN;
    const daftar = grup.get(tema);
    if (daftar) daftar.push(s);
    else grup.set(tema, [s]);
  }

  const urutanTema = [...URUTAN_TEMA.map((kode) => TEMA_SUBSEKTOR[kode]), KOMODITAS_LAIN];

  return urutanTema
    .filter((tema) => grup.has(tema))
    .map((tema) => ({ tema, baris: grup.get(tema) as SelCitra[] }));
}

/**
 * Baris skor SATU kabupaten dari `SelCitraDetail.skor` (berkunci `iddesa`,
 * bernilai tuple posisional). Indeks kolom DICARI dari `format_skor` (Task
 * 15 GOTCHA 1) — tidak pernah hardcode `[1]`/`[2]`, supaya artefak yang
 * menambah kolom di depan tidak diam-diam menggeser makna indeks.
 *
 * `nDesaKab` dibaca dari kolomnya sendiri (Task 15 GOTCHA 3), BUKAN dari
 * panjang array hasil saringan — kabupaten bisa punya desa yang tidak
 * tersekor, dan hanya kolom artefak yang benar untuk penyebut peringkat.
 */
export function barisSkor(detail: SelCitraDetail, kab: string): BarisSkorSel[] {
  const idxSkor100 = detail.format_skor.indexOf("skor100_dlm_kab");
  const idxPeringkat = detail.format_skor.indexOf("peringkat_dlm_kab");
  const idxNDesaKab = detail.format_skor.indexOf("n_desa_kab");

  if (idxSkor100 === -1 || idxPeringkat === -1 || idxNDesaKab === -1) return [];

  const baris: BarisSkorSel[] = [];

  for (const [iddesa, nilai] of Object.entries(detail.skor)) {
    if (!iddesa.startsWith(kab)) continue;

    const skor100 = nilai[idxSkor100];
    const peringkat = nilai[idxPeringkat];
    const nDesaKab = nilai[idxNDesaKab];
    // Baris cacat (nilai bukan angka) dilewati sendiri — satu baris rusak
    // tidak menjatuhkan seluruh daftar (Task 15 GOTCHA 2).
    if (typeof skor100 !== "number" || typeof peringkat !== "number" || typeof nDesaKab !== "number") {
      continue;
    }

    baris.push({ iddesa, skor100, peringkat, nDesaKab });
  }

  // Pengurutan menurut kolom `peringkat_dlm_kab` yang sudah disediakan
  // artefak — bukan aritmetika domain (Task 15 GOTCHA 4).
  return baris.sort((a, b) => a.peringkat - b.peringkat);
}
