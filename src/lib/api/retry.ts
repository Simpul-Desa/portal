/**
 * Predikat `retry` untuk `QueryClient` — dipisah dari `providers.tsx` supaya
 * bisa diuji unit murni (`providers.tsx` wajib "use client" dan menarik
 * React + `SesiProvider`, sementara environment Vitest proyek ini `node`).
 *
 * Alasan predikat ini ADA: sebelum ditambahkan, TanStack Query v5 memakai
 * bawaan tiga kali percobaan dengan backoff eksponensial untuk SEMUA galat —
 * termasuk 404 pada kode wilayah yang salah ketik. Akibatnya keadaan kosong
 * baru tampil ±7 detik sesudah klik, padahal 404/401/422 tidak akan pernah
 * berhasil diulang berapa kali pun. `bolehUlang` menghentikan pengulangan
 * untuk seluruh status 4xx (klien salah, mengulang tidak menolong), dan
 * tetap mengulang untuk 5xx serta galat jaringan (server sedang pulih, atau
 * `fetch` gagal sebelum sempat mendapat status HTTP asli — `GalatApi` di
 * kasus itu membawa `status` 0, BUKAN 4xx, sehingga tetap lolos ke jalur
 * ulang).
 */

import { GalatApi } from "@/lib/api/client";

/** Dipakai sebagai `defaultOptions.queries.retry` di `makeQueryClient()`. */
export function bolehUlang(jumlahGagal: number, galat: unknown): boolean {
  if (galat instanceof GalatApi && galat.status >= 400 && galat.status < 500) {
    return false;
  }

  return jumlahGagal < 2;
}
