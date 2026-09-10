/**
 * Logika murni tab Pengguna halaman admin: validasi kueri cari, label akun
 * baris, dan penjaga tipe peran. Nol React, nol DOM — semuanya diuji Vitest.
 */

import type { PeranBaru } from "../types";

/** Empat peran tersimpan, urutan GLOSSARY § Peran pengguna. */
export const PERAN_PILIHAN: readonly PeranBaru[] = [
  "tamu",
  "pemerintah",
  "swasta",
  "admin",
];

/**
 * Cermin `POLA_CARI_PENGGUNA` di `api/src/admin/constants.py`. Nilai di luar
 * pola ini dijawab 422 oleh `api/` — validasi di sini menahan permintaan
 * yang pasti gagal sebelum sampai ke jaringan.
 */
const POLA_CARI = /^[A-Za-z0-9@._+\- ]+$/;

/** Cermin `Query(min_length=1, max_length=64)` rute daftar pengguna. */
const PANJANG_MAKS_CARI = 64;

/**
 * `true` bila `q` boleh dikirim ke `api/`. Nilai kosong (atau hanya spasi)
 * berarti "tanpa saringan" — pemanggil mem-`trim()` lalu tidak mengirim
 * parameter `q` sama sekali, jadi kasus ini sengaja SAH tanpa syarat panjang
 * minimum. Itu aturan pencarian desa (minimal 2 karakter), bukan aturan
 * pencarian akun.
 */
export function cariPenggunaSah(q: string): boolean {
  const nilai = q.trim();
  if (nilai === "") return true;
  return nilai.length <= PANJANG_MAKS_CARI && POLA_CARI.test(nilai);
}

/**
 * Label akun untuk baris daftar. Baris tanpa email tetap baris yang harus
 * ditampilkan, jadi labelnya keterangan ("Tanpa email"), bukan string kosong
 * — dan fungsi ini tidak pernah mengarang email dari sumber lain.
 */
export function labelAkun(email: string | null): string {
  return email ?? "Tanpa email";
}

/** Penjaga tipe di batas: `peran` respons bertipe `string` divalidasi lewat keanggotaan `PERAN_PILIHAN`. */
export function adalahPeranBaru(nilai: string): nilai is PeranBaru {
  return (PERAN_PILIHAN as readonly string[]).includes(nilai);
}
