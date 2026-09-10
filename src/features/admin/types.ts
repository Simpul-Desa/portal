/**
 * Tipe rute admin. Rute GET dipakai lewat `DataDari` di `endpoints.ts`;
 * rute POST/DELETE tidak bisa memakainya (`DataDari` hanya membaca cabang
 * `get` dan meresolusi `never` untuk yang lain), jadi bentuknya diambil
 * langsung dari `components["schemas"]` — tetap tipe HASIL GENERATE
 * openapi-typescript, bukan tulisan tangan (PRD app §6).
 */
import type { components } from "@/lib/api/openapi";

export type ItemPengguna = components["schemas"]["ItemPengguna"];
export type PeranBaru = components["schemas"]["PermintaanUbahPeran"]["peran"];
export type PeranDiubah = components["schemas"]["PeranDiubah"];
export type TerimaSegarkan = components["schemas"]["TerimaSegarkan"];
export type BeritaTerhapus = components["schemas"]["BeritaTerhapus"];
export type DataStatus = components["schemas"]["DataStatus"];
export type StatusPekerjaan = components["schemas"]["StatusPekerjaan"];
export type HasilPenyegaranDesa = components["schemas"]["HasilPenyegaranDesa"];
export type PenyegaranDesa = components["schemas"]["PenyegaranDesa"];
export type KonfigurasiSiap = components["schemas"]["KonfigurasiSiap"];
