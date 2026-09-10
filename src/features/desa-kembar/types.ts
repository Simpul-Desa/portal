/**
 * Tipe render lensa Desa Kembar (Task 6). `TetanggaKembar`/`DataDesaKembar`
 * TIDAK didefinisikan ulang di sini — keduanya sudah bertipe di
 * `openapi.d.ts` dan diambil lewat `DataDari` (`lib/api/endpoints.ts`,
 * `modelDesaKembar`), rute fase 5 satu-satunya dengan skema OpenAPI
 * sungguhan. Tipe di bawah HANYA mengisi apa yang OpenAPI tidak sediakan:
 * baris banding hasil olah dua `KartuDesa` (murni, `services/banding.ts`).
 */

/** Satu baris banding acuan vs kembar. `kiri`/`kanan` sudah SIAP TAMPIL
 * (string hasil `strip`/`formatAngka`) — komponen tidak memformat sendiri. */
export type BarisBanding = {
  label: string;
  kiri: string;
  kanan: string;
  /** Arah nilai KANAN terhadap KIRI. `null` untuk baris kategorikal (zona)
   * dan untuk baris yang salah satu sisinya kosong. */
  arah: "naik" | "turun" | "sama" | null;
  /** DESIGN.md § Desa Kembar: nilai yang lebih kuat `ink`, yang lemah
   * `body`. Keduanya `false` untuk baris kategorikal dan untuk nilai sama. */
  kiriKuat: boolean;
  kananKuat: boolean;
};

/** Skor Kesiapan 0–100 kedua desa (`peta_peran.sk`) untuk dua `RampMeter`
 * bersumbu sama; `null` polos (TANPA kode kosong) bila Belum Terpetakan. */
export type SumbuKesiapan = { kiri: number | null; kanan: number | null };
