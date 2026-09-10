/**
 * Tipe render lensa Citra Potensi Desa (Task 14). Kedua rute
 * `/api/model/citra-potensi` dan `/api/model/citra-potensi/sel` diketik
 * `dict[str, Any]` / `list[dict[str, Any]]` di OpenAPI, jadi tipe di sini
 * DITULIS TANGAN dari bentuk artefak nyata (`api/data-salinan/`
 * 9 September 2026) — pola dan alasannya persis `features/kartu/types.ts`.
 * Rincian bentuk lengkap ada di rencana
 * `.claude/PRPs/plans/fase-5-desa-kembar-citra-potensi.plan.md`
 * § "Bentuk artefak dan respons nyata".
 */

export type SelCitra = {
  prov: string;
  target: string;
  /** BISA membawa spasi ekor pada artefak — selalu lewat `namaKomoditas()`. */
  nama: string;
  subsektor: string;
  /** Internal, TIDAK PERNAH dirender. Diketik supaya pembaca tahu ia ada. */
  mesin: string;
  berkas: string;
  ap_uji_tertahan: number;
  ci_rerata: [number, number];
};

export type SelCitraDetail = SelCitra & {
  format_skor: string[];
  skor: Record<string, number[]>;
};

export type BarisSkorSel = {
  iddesa: string;
  skor100: number;
  peringkat: number;
  nDesaKab: number;
};

/** Enam subsektor ST2023 → nama tema GLOSSARY persis. */
export const TEMA_SUBSEKTOR = {
  tp: "Tanaman Pangan",
  horti: "Hortikultura",
  kebun: "Perkebunan",
  ternak: "Peternakan",
  ikan: "Perikanan Budidaya",
  hutan: "Kehutanan",
} as const;
export const URUTAN_TEMA = ["tp", "horti", "kebun", "ternak", "ikan", "hutan"] as const;
