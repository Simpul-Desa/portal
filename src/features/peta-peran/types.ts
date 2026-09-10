/**
 * Tipe render lensa Peta Peran (Task 16). OpenAPI mengetik seluruh rute Peta
 * Peran `dict[str, Any]` / `list[dict[str, Any]]`, jadi tipe di sini DITULIS
 * TANGAN dari bentuk artefak nyata (`api/data-salinan/` 9 September 2026) —
 * pola dan alasannya persis `features/kartu/types.ts`. Rincian bentuk lengkap
 * ada di rencana `.claude/PRPs/plans/fase-3-4-peta-peran-jalur-ekonomi.plan.md` (lokal saja)
 * § "Bentuk artefak dan respons nyata".
 */

import type { SumberDominan } from "@/features/kartu/types";

/** Urutan GLOSSARY: empat zona lalu Belum Terpetakan — dipakai `filter-zona.tsx`
 * (Task 21) untuk urutan chip. */
export const NAMA_ZONA = [
  "Zona Pemerintah",
  "Zona Mitra",
  "Zona Poros",
  "Zona Bantuan",
  "Belum Terpetakan",
] as const;
export type NamaZona = (typeof NAMA_ZONA)[number];

/** 12 kolom ringkas `GET /api/model/peta-peran` (`api/src/peta_peran/constants.py` `KOLOM_RINGKAS`). */
export type BarisPetaPeran = {
  iddesa: string;
  nmdesa: string;
  nmkec: string;
  idkab: string;
  nmkab: string;
  idprov: string;
  zona: NamaZona;
  keyakinan: "normal" | "rendah" | null;
  /** Datang sebagai float (`9.0`, bukan `9`) — lewatkan ke `formatAngka`
   * (yang sudah membuang `.0`), jangan `parseInt`. */
  desil_sp: number | null;
  desil_sk: number | null;
  potensi_dominan: string | null;
  sumber_dominan: SumberDominan | null;
};

/**
 * Baris penuh `GET /api/model/peta-peran/{iddesa}` — 42 kolom apa adanya,
 * yang dipakai fase ini saja ditambahkan di atas `BarisPetaPeran`. Kolom lain
 * (`SP`, `SK`, `SK_*`, `pSUB_*`, `ambang_*` selain di `RingkasanKab`,
 * `jarak_ke_ambang`, `sentralitas_menit`, `idm`, `idm_status`,
 * `data_geometri`, `data_st2023`, `infra_per_1000_ruta`, `jadesta_kategori`)
 * TIDAK direpresentasikan di sini — skor mentah tampil sebagai desil dan
 * peringkat saja (GLOSSARY § Skor dan ambang Peta Peran). Peringkat kabupaten
 * (`peringkat_sp_kab`/`peringkat_sk_kab`) TIDAK ada di baris ini — hanya di
 * blok `peta_peran` `GET /api/model/kartu/{iddesa}`.
 */
export type BarisPetaPeranPenuh = BarisPetaPeran & {
  tipe_wilayah: "desa" | "kelurahan" | "tak diketahui";
  /** Datang sebagai float (`2.0`) seperti `desil_sp`/`desil_sk` — lewat `formatAngka`. */
  nomor_zona: number | null;
  /** String KOSONG (`""`) saat tidak berlaku — BUKAN `null`. Berbeda dari
   * blok `peta_peran` Kartu (`KartuPetaPeran.alasan_belum_terpetakan`, yang
   * `string | null`) — jangan disamakan. Perlakukan `""` sebagai tidak ada. */
  alasan_belum_terpetakan: string;
  kelengkapan_sk: number | null;
  komponen_sk_hilang: string;
};

/**
 * `GET /api/model/peta-peran/ringkasan?kab=` (satu objek) atau daftar
 * berpaginasi tanpa `kab` (satu elemen per kabupaten, bentuk yang sama).
 */
export type RingkasanKab = {
  idkab: string;
  nmkab: string;
  n_wilayah: number;
  zona: Record<NamaZona, number>;
  n_keyakinan_rendah: number;
  n_jadesta: number;
  /** Median internal model — TIDAK dirender (rencana § "NOT Building": bukan
   * angka yang bermakna bagi pembaca panel). Diketik supaya pembaca tipe tahu
   * kolomnya ada dan sengaja tidak dipakai. */
  ambang_sp: number | null;
  ambang_sk: number | null;
};
