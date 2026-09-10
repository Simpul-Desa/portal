/**
 * Batas dan konversi riwayat percakapan Asisten Desa — fungsi murni + konstanta
 * berkomentar rujukan, mengikuti pola `features/citra-potensi/services/sel.ts`.
 */

import type { Giliran, PesanChat } from "../types";

/** Cermin `Pengaturan.chat_maks_pesan` `api/` (bawaan 20). Batasnya hidup di
 * skema Pydantic, bukan di OpenAPI hasil generate (openapi-typescript tidak
 * membawa min/maxLength), jadi nilainya HARUS ditulis di sini — beserta
 * rujukan ini, supaya kesenjangannya terlihat saat `api/` berubah. */
export const MAKS_PESAN = 20;

/** Cermin `Pengaturan.chat_maks_karakter` `api/` (bawaan 4000), berlaku PER
 * pesan — bukan per percakapan (Task 14 GOTCHA 2). */
export const MAKS_KARAKTER = 4000;

/** Petik `{role, isi}` saja dari tiap giliran — `jejak`/`peringatan` adalah
 * metadata render, tidak pernah ikut terkirim ke `api/`. */
export function keMessages(riwayat: readonly Giliran[]): PesanChat[] {
  return riwayat.map((g) => ({ role: g.role, isi: g.isi }));
}

/**
 * Masih ada ruang untuk satu pertanyaan lagi? Yang dihitung `api/` adalah
 * cacah `messages` SATU permintaan (giliran user + jawaban model tergabung),
 * bukan cacah giliran user saja (Task 14 GOTCHA 1) — 20 pesan = 10
 * tanya-jawab.
 */
export function bisaKirim(riwayat: readonly Giliran[]): boolean {
  return riwayat.length + 1 <= MAKS_PESAN;
}
