/**
 * Logika murni tab Berita halaman admin: daftar desa terpilih untuk
 * penyegaran, label pencacah, dan ringkasan hasil per desa. Nol React, nol
 * DOM — semuanya diuji Vitest.
 */

import type { HasilPenyegaranDesa } from "../types";

/** Cermin `MAKS_DESA_SEGARKAN` di `api/src/admin/constants.py`. */
export const MAKS_DESA_SEGARKAN = 50;

export type DesaTerpilih = { iddesa: string; nmdesa: string; nmkec: string };

/**
 * Tambah `baru` ke ekor `daftar` sebagai array BARU. Duplikat (`iddesa`
 * sudah ada) dan daftar yang sudah penuh dikembalikan APA ADANYA tanpa
 * melempar — batas ini menahan admin sebelum `api/` menolaknya 422, dan
 * menolak dengan diam lebih baik daripada melempar karena pemanggil sudah
 * menampilkan pencacah dan kalimat batas di antarmuka.
 */
export function tambahDesa(
  daftar: readonly DesaTerpilih[],
  baru: DesaTerpilih,
): readonly DesaTerpilih[] {
  if (daftar.some((d) => d.iddesa === baru.iddesa)) return daftar;
  if (daftar.length >= MAKS_DESA_SEGARKAN) return daftar;
  return [...daftar, baru];
}

/** Array BARU tanpa `iddesa` itu. `iddesa` yang tidak ada menghasilkan daftar yang setara asalnya. */
export function hapusDesa(
  daftar: readonly DesaTerpilih[],
  iddesa: string,
): readonly DesaTerpilih[] {
  return daftar.filter((d) => d.iddesa !== iddesa);
}

/**
 * Label pencacah terpilih. `MAKS_DESA_SEGARKAN` tidak ditulis literal di
 * dalam string supaya batas tidak bisa menyimpang dari konstanta. TANPA
 * `formatAngka`: ini cacah bookkeeping antarmuka, bukan angka domain
 * (preseden `shared/components/pagination.tsx`).
 */
export function labelTerpilih(n: number): string {
  return `Terpilih ${n} dari ${MAKS_DESA_SEGARKAN}`;
}

/**
 * Label kemajuan pekerjaan penyegaran. Sama seperti `labelTerpilih`, ini
 * cacah bookkeeping antarmuka — TANPA `formatAngka`.
 */
export function labelKemajuan(selesai: number, total: number): string {
  return `Selesai ${selesai} dari ${total} desa`;
}

/**
 * Ringkasan satu baris hasil penyegaran satu desa. KEEMPAT cacah selalu
 * ditulis termasuk yang bernilai nol — nol adalah jawaban, bukan
 * ketiadaan. Field `galat` sengaja TIDAK masuk string ini; pemanggil
 * merendernya terpisah karena butuh perlakuan visual berbeda (galat).
 */
export function ringkasHasil(hasil: HasilPenyegaranDesa): string {
  return `baru ${hasil.n_baru} · duplikat ${hasil.n_duplikat} · dibuang ${hasil.n_dibuang} · gagal ${hasil.n_gagal}`;
}
