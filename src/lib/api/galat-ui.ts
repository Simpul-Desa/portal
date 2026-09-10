/**
 * Pemetaan `GalatApi` → pesan antarmuka Indonesia. Satu modul dipakai semua
 * fitur yang menampilkan kegagalan, supaya nada pesan konsisten di seluruh
 * dasbor. Dipetakan lewat status HTTP (bukan `kode` per baris) — satu
 * kategori status HTTP = satu nada UI, tanpa peduli endpoint mana yang
 * gagal; `GALAT_JARINGAN` (status 0, bukan status HTTP asli) satu-satunya
 * pengecualian yang dipetakan lewat `kode`.
 *
 * `galat.kode` mentah TIDAK diulang di sini — pemanggil sudah memegangnya
 * langsung dari `GalatApi` untuk ditampilkan kecil di sisi pesan besar ini.
 */

import type { GalatApi } from "./client";

/**
 * True bila `galat` adalah gangguan SISI SERVER — server tak terjangkau
 * (`GALAT_JARINGAN`, klien tidak bisa membedakannya dari sambungan
 * pengguna sendiri putus, jadi tetap dihitung gangguan server) atau server
 * membalas 5xx — BUKAN kesalahan pengguna (401/403/404/409/422/429).
 * Dipakai `useGangguanServer` (`shared/hooks/use-gangguan-server.ts`) untuk
 * memutuskan kapan pemberitahuan gangguan server tampil ke SEMUA peran,
 * termasuk anonim.
 */
export function adalahGangguanServer(galat: GalatApi): boolean {
  return galat.kode === "GALAT_JARINGAN" || galat.status >= 500;
}

/** Judul + pesan siap-tampil untuk satu `GalatApi`. */
export function pesanGalat(galat: GalatApi): { judul: string; pesan: string } {
  if (galat.kode === "GALAT_JARINGAN") {
    return {
      judul: "Gangguan sambungan",
      pesan: "Server tidak menjawab atau sambungan sedang terputus. Coba lagi sebentar lagi.",
    };
  }

  switch (galat.status) {
    case 401:
      return {
        judul: "Perlu masuk",
        pesan: "Sesi berakhir atau belum masuk. Masuk untuk melanjutkan.",
      };
    case 403:
      return {
        judul: "Fitur terkunci",
        pesan: "Akun ini belum punya akses ke fitur ini.",
      };
    case 404:
      return {
        judul: "Tidak ditemukan",
        pesan: "Wilayah atau desa yang dicari tidak ditemukan.",
      };
    case 409:
      return {
        judul: "Pekerjaan sedang berjalan",
        pesan: "Ada proses lain yang belum selesai. Coba lagi setelah proses itu rampung.",
      };
    case 422:
      // Cacat parameter = bug klien, bukan galat pengguna — tampilkan pesan mentah dari server.
      return { judul: "Parameter tidak valid", pesan: galat.pesan };
    case 429:
      return { judul: "Terlalu banyak permintaan", pesan: "Coba sebentar lagi." };
    default:
      if (galat.status >= 500) {
        return {
          judul: "Gangguan layanan",
          pesan: "Server sedang bermasalah. Coba lagi sebentar lagi.",
        };
      }
      return { judul: "Terjadi kesalahan", pesan: galat.pesan };
  }
}
