/**
 * Logika murni seksi Berita Desa: validasi URL eksternal, label meta baris,
 * dan label tombol buka/tutup. Nol React, nol DOM — semuanya diuji Vitest.
 */

import { formatTanggal } from "@/shared/format";

/** Berita yang tampil sebelum "Tampilkan semua" ditekan (keputusan user 10 September 2026). */
export const PRATINJAU_BERITA = 5;

/**
 * Ukuran satu halaman yang diminta ke `api/`. Sama dengan `BATAS_BAWAAN`
 * `api/` (50). Fase ini sengaja TIDAK berpaginasi: satu halaman diambil,
 * dan bila `total` lebih besar, sisanya dinyatakan terbuka di antarmuka
 * alih-alih disembunyikan di balik pager.
 */
export const BATAS_BERITA = 50;

const SKEMA_AMAN = new Set(["http:", "https:"]);

/**
 * URL berita yang aman dijadikan `href`, atau `null`. `url` datang dari RSS
 * pihak ketiga — `javascript:` dan `data:` di `href` mengeksekusi kode, dan
 * React tidak memblokirnya saat runtime.
 */
export function urlAman(url: string): string | null {
  try {
    return SKEMA_AMAN.has(new URL(url).protocol) ? url : null;
  } catch {
    return null;
  }
}

/**
 * Baris `sumber • tanggal`. `terbit_pada` bisa null (pubDate RSS tak
 * terparse) — jatuh ke `dipanen_pada` DENGAN kata "dipanen", bukan
 * menyamarkannya sebagai tanggal terbit.
 */
export function labelMeta(item: {
  sumber: string;
  terbit_pada: string | null;
  dipanen_pada: string;
}): string {
  return item.terbit_pada
    ? `${item.sumber} • ${formatTanggal(item.terbit_pada)}`
    : `${item.sumber} • dipanen ${formatTanggal(item.dipanen_pada)}`;
}

/** Label tombol buka/tutup. `dimuat` = panjang daftar yang benar-benar ada di klien. */
export function labelTombol(total: number, dimuat: number, terbuka: boolean): string {
  if (terbuka) return "Ringkas lagi";
  return total > dimuat ? `Tampilkan ${dimuat} terbaru` : `Tampilkan semua (${dimuat})`;
}

/** Catatan kaki saat server punya lebih banyak berita daripada satu halaman. */
export function catatanTerpotong(total: number, dimuat: number): string | null {
  return total > dimuat ? `Menampilkan ${dimuat} dari ${total} berita terbaru.` : null;
}
