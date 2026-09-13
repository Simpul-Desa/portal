/**
 * Wrapper bertipe endpoint `api/`. Tipe `data` diekstrak langsung dari
 * `paths` (`openapi.d.ts` hasil generate) lewat `DataDari` — TANPA menulis
 * ulang bentuk data manual (PRD §3). Pengecualian: `geoDesa` (OpenAPI
 * mendeklarasikan responsnya `unknown` — payload GeoJSON mentah di luar
 * amplop — jadi `ambilGeo` sudah mengetik `FeatureCollection` sendiri di
 * `client.ts`, bukan diekstrak dari `paths` di sini).
 *
 * Rute Peta Peran, Jalur Ekonomi (fase 3-4, Task 17 dan 27), dan kedua rute
 * Citra Potensi (fase 5, Task 4) adalah pengecualian KEDUA: OpenAPI
 * mengetiknya `dict[str, Any]` / `list[dict[str, Any]]`, jadi wrapper di
 * bawah memakai tipe render tulisan tangan dari `features/peta-peran/types.ts`,
 * `features/jalur-ekonomi/types.ts`, dan `features/citra-potensi/types.ts`
 * (pola dan alasan sama seperti `features/kartu/types.ts`) sebagai parameter
 * generik eksplisit — BUKAN `DataDari`. Desa Kembar (fase 5) TIDAK termasuk
 * pengecualian ini — satu-satunya rute fase 5 dengan skema OpenAPI sungguhan,
 * jadi `modelDesaKembar` tetap memakai `DataDari`. `laporanDesa` (fase 7)
 * adalah pengecualian KETIGA: badan suksesnya byte PDF, bukan amplop, jadi ia
 * memakai `ambilBerkas` — bukan `ambil` — dan tidak berbalik `DataDari` sama
 * sekali. Lima wrapper `/api/admin/*` adalah pengecualian KEEMPAT: rute
 * non-GET (`adminUbahPeran`, `adminSegarkanBerita`, `adminHapusBerita`) tidak
 * bisa memakai `DataDari` karena helper itu hanya membaca cabang `get`, jadi
 * bentuknya diambil dari `components["schemas"]` lewat
 * `features/admin/types.ts`; dua rute GET-nya (`adminPengguna`,
 * `adminStatus`) TETAP memakai `DataDari`.
 *
 * Semua wrapper bertanda `bertoken: true` mengirim `Authorization: Bearer`.
 * Peran minimumnya BERBEDA per rute dan ditegakkan `api/`, bukan di sini:
 * rute lensa, berita, dan chat menuntut minimum tamu; `laporanDesa` minimum
 * pemerintah; kelima rute `/api/admin/*` menuntut admin (PRD `api/` §4).
 */

import type { BeritaTerhapus, PeranBaru, PeranDiubah, TerimaSegarkan } from "@/features/admin/types";
import type { JawabanChat, PesanChat } from "@/features/asisten/types";
import type { SelCitra, SelCitraDetail } from "@/features/citra-potensi/types";
import type { BarisJalur } from "@/features/jalur-ekonomi/types";
import type { BarisPetaPeran, BarisPetaPeranPenuh, NamaZona, RingkasanKab } from "@/features/peta-peran/types";
import type { AIInsightData } from "@/features/kartu/types";
import type { Varian } from "@/lib/url-state";

import { ambil, ambilBerkas, ambilGeo, hapus, kirim } from "./client";
import type { paths } from "./openapi";

/** Tipe `data` (bukan null/undefined) satu endpoint GET, langsung dari `openapi.d.ts`. */
export type DataDari<Path extends keyof paths> = paths[Path] extends {
  get: { responses: { 200: { content: { "application/json": { data?: infer D } } } } };
}
  ? NonNullable<D>
  : never;

export function wilayahProvinsi() {
  return ambil<DataDari<"/api/wilayah/provinsi">>("/api/wilayah/provinsi");
}

export function wilayahRingkasan() {
  return ambil<DataDari<"/api/wilayah/ringkasan">>("/api/wilayah/ringkasan");
}

export function wilayahPusat() {
  return ambil<DataDari<"/api/wilayah/pusat">>("/api/wilayah/pusat");
}

export function wilayahKabupaten(prov?: string) {
  return ambil<DataDari<"/api/wilayah/kabupaten">>("/api/wilayah/kabupaten", {
    params: { prov },
  });
}

export function wilayahDesa(kab: string, params?: { hal?: number; batas?: number }) {
  return ambil<DataDari<"/api/wilayah/desa">>("/api/wilayah/desa", {
    params: { kab, ...params },
  });
}

export function desaCari(q: string, kab?: string) {
  return ambil<DataDari<"/api/desa/cari">>("/api/desa/cari", {
    params: { q, kab },
  });
}

export function modelKartu(iddesa: string) {
  return ambil<DataDari<"/api/model/kartu/{iddesa}">>(`/api/model/kartu/${iddesa}`);
}

export function geoDesa(idkab: string) {
  return ambilGeo(idkab);
}

/**
 * Profil akun yang sedang masuk (id + peran), dibaca dari tabel `profil`
 * lewat `api/` — bukan langsung dari Supabase (RLS mengunci tabel itu tanpa
 * policy). Bertoken: gagal 401 tanpa sesi.
 */
export function profilSaya() {
  return ambil<DataDari<"/api/profil/saya">>("/api/profil/saya", { bertoken: true });
}

/**
 * Daftar baris ringkas Peta Peran, filter `prov`/`kab`/`zona` opsional. `zona`
 * yang dikirim adalah NAMA GLOSSARY lengkap (`NamaZona`), bukan slug URL —
 * pemanggil menerjemahkan lewat `ZONA_SLUG[slug]` (`lib/url-state.ts`)
 * sebelum sampai di sini. `URLSearchParams` (dipakai `buatQuery` di
 * `client.ts`) sudah meng-encode spasi jadi `+`, dan Starlette
 * menerjemahkannya kembali jadi spasi — `zona=Zona+Mitra` sah tanpa
 * penanganan khusus, jangan meng-encode manual dua kali.
 */
export function modelPetaPeran(params: {
  prov?: string;
  kab?: string;
  zona?: NamaZona;
  hal?: number;
  batas?: number;
}) {
  return ambil<BarisPetaPeran[]>("/api/model/peta-peran", { params, bertoken: true });
}

/** Baris penuh (42 kolom) Peta Peran satu desa. */
export function modelPetaPeranDetail(iddesa: string) {
  return ambil<BarisPetaPeranPenuh>(`/api/model/peta-peran/${iddesa}`, { bertoken: true });
}

/**
 * `GET /api/model/peta-peran/ringkasan?kab=` menjawab BENTUK BERBEDA
 * tergantung `kab`: satu objek bila diisi, daftar berpaginasi bila tidak.
 * Ditulis sebagai DUA wrapper bertipe balik pasti, bukan satu fungsi
 * berbalik union — deviasi dari rencana Task 17 (yang menulis satu
 * `modelPetaPeranRingkasan({kab, hal, batas})`), diarahkan Blok B2 supaya
 * pemanggil tidak perlu narrow union di titik pakai.
 */
export function modelPetaPeranRingkasan(kab: string) {
  return ambil<RingkasanKab>("/api/model/peta-peran/ringkasan", { params: { kab }, bertoken: true });
}

/** Daftar ringkasan seluruh kabupaten (berpaginasi) — TANPA `kab`. */
export function modelPetaPeranRingkasanDaftar(params: { hal?: number; batas?: number } = {}) {
  return ambil<RingkasanKab[]>("/api/model/peta-peran/ringkasan", { params, bertoken: true });
}

/** Daftar baris ringkas jalur ekonomi satu varian, filter `kab`/`iddesa` opsional. */
export function modelJalurDaftar(
  varian: Varian,
  params: { kab?: string; iddesa?: string; hal?: number; batas?: number } = {},
) {
  return ambil<BarisJalur[]>(`/api/model/jalur-ekonomi/${varian}`, { params, bertoken: true });
}

/**
 * Grup jalur MENTAH — LIMA bentuk berbeda tergantung `varian` (rencana §
 * "Bentuk artefak dan respons nyata"). Diratakan oleh `normalisasiJalur`
 * (`features/jalur-ekonomi/services/normalisasi.ts`, di luar cakupan Blok
 * B2) di hilir, bukan di sini — wrapper ini hanya membawa objek apa adanya.
 */
export function modelJalurDetail(varian: Varian, idJalur: string) {
  return ambil<Record<string, unknown>>(`/api/model/jalur-ekonomi/${varian}/${idJalur}`, {
    bertoken: true,
  });
}

/**
 * Desa Kembar SATU-SATUNYA rute fase 5 yang punya skema OpenAPI sungguhan —
 * dipakai `DataDari`, bukan tipe tulisan tangan. `keterangan` mentah (desa
 * tanpa vektor fitur) tidak pernah dirender apa adanya — panel menulis
 * kalimatnya sendiri.
 */
export function modelDesaKembar(iddesa: string) {
  return ambil<DataDari<"/api/model/desa-kembar/{iddesa}">>(
    `/api/model/desa-kembar/${iddesa}`,
    { bertoken: true },
  );
}

/**
 * Daftar metadata sel Citra Potensi (dua rute Citra `dict[str, Any]` di
 * OpenAPI, jadi tipe render tulisan tangan dari `features/citra-potensi/types.ts`
 * — alasan yang sama dengan `features/kartu/types.ts`).
 */
export function modelCitraDaftar(params: { prov?: string; target?: string; hal?: number; batas?: number }) {
  return ambil<SelCitra[]>("/api/model/citra-potensi", { params, bertoken: true });
}

/** Metadata sel Citra Potensi DITAMBAH `format_skor` + `skor` per desa. */
export function modelCitraSel(prov: string, target: string) {
  return ambil<SelCitraDetail>("/api/model/citra-potensi/sel", {
    params: { prov, target },
    bertoken: true,
  });
}

/** `temperature` SENGAJA tidak dikirim — bawaannya milik `api/`
 * (`PermintaanChat.temperature = 0.4`); menyalinnya ke klien membuat dua
 * sumber untuk satu nilai. */
export function chatKirim(messages: readonly PesanChat[]) {
  return kirim<JawabanChat, { messages: readonly PesanChat[] }>("/api/chat", {
    badan: { messages },
    bertoken: true,
  });
}

/**
 * Daftar Berita Desa satu desa, berpaginasi, urut tanggal terbit menurun.
 * Bertoken (akses minimum tamu, PRD `api/` §4). Skema OpenAPI-nya sungguhan
 * (`ItemBerita`), jadi `DataDari` dipakai — bukan tipe tulisan tangan.
 */
export function beritaDesa(iddesa: string, params: { hal?: number; batas?: number } = {}) {
  return ambil<DataDari<"/api/berita/{iddesa}">>(`/api/berita/${iddesa}`, {
    params,
    bertoken: true,
  });
}

/**
 * PDF Laporan Desa. SATU-SATUNYA wrapper yang tidak berbalik amplop —
 * `ambilBerkas`, bukan `ambil`. Nama berkasnya dibangun pemanggil
 * (`features/laporan/services/unduh.ts`), bukan dibaca dari header.
 */
export function laporanDesa(iddesa: string) {
  return ambilBerkas(`/api/laporan/${iddesa}`, { bertoken: true });
}

/**
 * Daftar pengguna terdaftar beserta perannya, berpaginasi. `q` menyaring
 * lewat email tanpa peka kapital; nilai di luar pola `api/` ditolak 422,
 * jadi pemanggil menyaringnya lebih dulu (`features/admin/services/pengguna.ts`).
 */
export function adminPengguna(params: { q?: string; hal?: number; batas?: number } = {}) {
  return ambil<DataDari<"/api/admin/pengguna">>("/api/admin/pengguna", {
    params,
    bertoken: true,
  });
}

/** Ubah peran satu pengguna. Mengubah peran DIRI SENDIRI ditolak `api/` dengan
 * 403 `AKSI_DITOLAK`. */
export function adminUbahPeran(idPengguna: string, peran: PeranBaru) {
  return kirim<PeranDiubah, { peran: PeranBaru }>(
    `/api/admin/pengguna/${idPengguna}/peran`,
    { badan: { peran }, bertoken: true },
  );
}

/**
 * Mulai pekerjaan latar penyegaran Berita Desa untuk 1–50 desa. Balasan
 * suksesnya berstatus 202, bukan 200 — `bacaAmplop` meloloskannya karena
 * memeriksa `respons.ok`, jadi JANGAN menambahkan pemeriksaan `status === 200`
 * di mana pun. Pekerjaan kedua saat satu sedang berjalan ditolak 409
 * `PEKERJAAN_BERJALAN`.
 */
export function adminSegarkanBerita(iddesa: readonly string[]) {
  return kirim<TerimaSegarkan, { iddesa: readonly string[] }>(
    "/api/admin/berita/segarkan",
    { badan: { iddesa }, bertoken: true },
  );
}

/** Batalkan pekerjaan latar penyegaran berita yang sedang berjalan bila ada. */
export function adminBatalkanSegarkan() {
  return kirim<{ status: string }>("/api/admin/berita/batal", { bertoken: true });
}

/** Hapus satu berita lewat `id`. SATU-SATUNYA wrapper bermetode DELETE. */
export function adminHapusBerita(idBerita: number) {
  return hapus<BeritaTerhapus>(`/api/admin/berita/${idBerita}`, { bertoken: true });
}

/** Status sistem: versi data, cacah baris, pekerjaan latar, kesiapan
 * konfigurasi. `konfigurasi` hanya bendera boolean — nilai kunci tidak pernah
 * dikirim `api/`. */
export function adminStatus() {
  return ambil<DataDari<"/api/admin/status">>("/api/admin/status", { bertoken: true });
}

/**
 * Buat atau dapatkan AI Insight untuk desa.
 * Mengirim permintaan ke `POST /api/ai-insight`.
 * Menuntut pengguna terotentikasi di atas tamu (pemerintah, swasta, admin).
 */
export function aiInsightBuat(iddesa: string, generateUlang = false) {
  return kirim<AIInsightData, { iddesa: string; generate_ulang: boolean }>(
    "/api/ai-insight",
    { badan: { iddesa, generate_ulang: generateUlang }, bertoken: true },
  );
}
