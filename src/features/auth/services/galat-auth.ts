/**
 * Pemetaan `AuthError.code` (Supabase Auth) → pesan antarmuka Indonesia.
 * Modul terpisah dari `@/lib/api/galat-ui.ts` karena sumber galatnya
 * berbeda — satu memetakan status HTTP `api/`, satu memetakan
 * `AuthError.code` Supabase — tapi bentuk kembaliannya sama `{judul, pesan}`
 * supaya satu komponen pesan bisa merender keduanya.
 *
 * `code` dipetakan, BUKAN `error.message`: teks Inggris Supabase berubah
 * antarversi, `code` adalah kontraknya. Sumber galat juga bisa bukan
 * `AuthError` (mis. jaringan mati) — `unknown` di-narrow dulu lewat
 * `isAuthError`, tidak diasumsikan bentuknya.
 */

import { isAuthError } from "@supabase/supabase-js";

const GALAT_FALLBACK = {
  judul: "Gagal memproses",
  pesan: "Coba lagi. Kalau tetap gagal, muat ulang halaman.",
};

/** Judul + pesan siap-tampil + kode mentah (ditampilkan kecil, pola `galat-ui.ts`) untuk satu galat Supabase Auth. */
export function pesanGalatAuth(galat: unknown): { judul: string; pesan: string; kode?: string } {
  if (!isAuthError(galat)) return GALAT_FALLBACK;

  const kode = galat.code;

  switch (kode) {
    case "invalid_credentials":
      return { judul: "Gagal masuk", pesan: "Email atau sandi salah.", kode };
    case "email_not_confirmed":
      return {
        judul: "Email belum dikonfirmasi",
        pesan: "Buka tautan konfirmasi di email yang kami kirim, lalu coba lagi.",
        kode,
      };
    case "user_already_exists":
    case "email_exists":
      return {
        judul: "Email sudah punya akun",
        pesan: "Masuk dengan sandi akun itu.",
        kode,
      };
    case "weak_password":
      return {
        judul: "Sandi terlalu pendek",
        pesan: "Pakai minimal 8 karakter.",
        kode,
      };
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return {
        judul: "Terlalu banyak percobaan",
        pesan: "Tunggu beberapa menit, lalu coba lagi.",
        kode,
      };
    case "validation_failed":
      return {
        judul: "Isian belum benar",
        pesan: "Periksa kembali email dan sandinya.",
        kode,
      };
    default:
      return { ...GALAT_FALLBACK, kode };
  }
}
