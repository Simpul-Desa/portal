/**
 * Tipe render 11 seksi Kartu Ekonomi Desa (Task 24). Ditulis manual dari
 * struktur artefak nyata (`api/data-salinan/kartu-ekonomi/kartu/*.json`,
 * silang-cek `data/fitur/kartu-ekonomi-desa/bangun_kartu.py`) karena OpenAPI
 * hanya mengetik `GET /api/model/kartu/{iddesa}` sebagai `dict[str, Any]` —
 * lihat rencana Task 10 Notes. Ini BUKAN pelanggaran "tidak ada tipe tulis
 * tangan": OpenAPI memang tidak mengetiknya, jadi tipe ini mengisi yang
 * dikosongkan, bukan menduplikasi kontrak yang sudah ada.
 *
 * Dua pola nullable berbeda dalam satu artefak — jangan disamakan:
 * - **Kosong berkode**: `{nilai: null, kosong: KodeKosong}` (helper
 *   `kosong()` di `bangun_kartu.py`) — dipakai `kesiapan.komponen.*`,
 *   `kesiapan.idm`, `kesiapan.amenitas_poi.*`, dan SELURUH blok
 *   `biofisik`/`logistik` saat desa tanpa geometri.
 * - **Kosong tanpa kode**: `T | null` polos — dipakai `peta_peran` (sp, sk,
 *   desil, peringkat, ambang saat Belum Terpetakan), `identitas`
 *   (lon/lat/luas_km2), `kelembagaan.infra_per_1000_ruta`, field individual
 *   `logistik` (mis. `menit_ke_bandara` tanpa bandara terdekat).
 * - **Sub-skor tema** punya bentuk kosong SENDIRI (`{persentil: null, kosong,
 *   label}` — kunci `persentil`, BUKAN `nilai`) karena ditulis literal, bukan
 *   lewat helper `kosong()`.
 *
 * `0` BUKAN kosong (GLOSSARY, aturan nol 6 Sep 2026) — field begitu tetap
 * `number` biasa; hanya field yang sumbernya sendiri bisa NaN yang nullable.
 */

export type KodeKosong = "TIDAK-DINILAI" | "TIDAK-TERPETAKAN" | "TIDAK-BERLAKU" | "TIDAK-ADA-DATA";

/** Bentuk generik helper `kosong(kode)`: `{nilai: null, kosong: kode}`. */
export type Kosong = { nilai: null; kosong: KodeKosong };

/** Nilai terukur ATAU kosong-berkode generik. Pemakai narrow lewat
 * `"kosong" in x` (TypeScript menyempitkan union lewat cek properti). */
export type KosongDengan<T> = T | Kosong;

/** Kode kosong bila `nilai` kosong-berkode (generik ATAU bentuk sub-skor
 * tema — dua-duanya beda nama kunci nilai tapi sama-sama punya `kosong`);
 * `null` bila `nilai` nilai terukur biasa. Dipakai render label kode kecil
 * tanpa perlu narrow union penuh di tiap titik pakai. */
export function kodeKosong(nilai: unknown): KodeKosong | null {
  if (typeof nilai !== "object" || nilai === null) return null;
  if ("kosong" in nilai) return (nilai as { kosong: KodeKosong }).kosong;
  return null;
}

// --- (1) identitas ---

export type KartuIdentitas = {
  iddesa: string;
  kode_dagri: string | null;
  nama: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  tipe: "desa" | "kelurahan" | "tak diketahui";
  lon: number | null;
  lat: number | null;
  luas_km2: number | null;
};

// --- (2) peta_peran ---

export type Keyakinan = "normal" | "rendah";

export type KartuPetaPeran = {
  /** Nama zona LENGKAP ("Zona Mitra" dst.) atau "Belum Terpetakan" (GLOSSARY). */
  zona: string;
  nomor_zona: 1 | 2 | 3 | 4 | null;
  keyakinan: Keyakinan | null;
  alasan_belum_terpetakan: string | null;
  sp: number | null;
  sk: number | null;
  desil_sp: number | null;
  desil_sk: number | null;
  peringkat_sp_kab: number | null;
  peringkat_sk_kab: number | null;
  ambang_sp: number | null;
  ambang_sk: number | null;
  kelengkapan_bukti_sk: number | null;
};

// --- (4) potensi ---

/** Empat nilai GLOSSARY § Sumber Potensi Dominan, urutan mutu menurun. */
export type SumberDominan =
  | "citra"
  | "heuristik-tervalidasi"
  | "heuristik-belum-teruji"
  | "fallback-heuristik";

/** Hanya terisi saat `sumber_dominan === "citra"` (data nyata: null untuk 3 sumber lain). */
export type KartuDetailDominan = {
  komoditas: string;
  skor100: number;
  peringkat_dlm_kab: number;
  n_desa_kab: number;
  ap_sel: number;
  sumber: string;
};

/** Delapan tema (GLOSSARY § Delapan tema sub-skor), urutan tampil tetap. */
export const KUNCI_TEMA = ["tp", "horti", "kebun", "ternak", "ikan", "hutan", "tangkap", "simpul"] as const;
export type KunciTema = (typeof KUNCI_TEMA)[number];

/** Bentuk kosong sub-skor beda dari `Kosong` generik: kunci nilainya
 * `persentil`, ditulis literal di `bangun_kartu.py` (bukan lewat `kosong()`). */
export type KartuSubSkorTema =
  | { persentil: number; label: string }
  | { persentil: null; kosong: KodeKosong; label: string };

export type KartuPotensi = {
  /** Nama tema persis, varian `Tema — Komoditas` bila `sumber_dominan === "citra"`. */
  dominan: string | null;
  sumber_dominan: SumberDominan | null;
  detail_dominan: KartuDetailDominan | null;
  sub_skor: Record<KunciTema, KartuSubSkorTema>;
};

// --- (5) kesiapan ---

/** Hanya terisi saat desa (bukan kelurahan) punya penilaian IDM Kemendesa. */
export type KartuIdm = {
  idm: number;
  iks: number;
  ike: number;
  ikl: number;
  status: string;
  tahun: number;
};

export type KartuKesiapan = {
  komponen: {
    SK_INDEKS: KosongDengan<number>;
    SK_KELEMBAGAAN: KosongDengan<number>;
    SK_AMENITAS: KosongDengan<number>;
    SK_KONEKTIVITAS: KosongDengan<number>;
  };
  idm: KosongDengan<KartuIdm>;
  kelembagaan: {
    lumbung: number;
    penggilingan: number;
    infra_per_1000_ruta: number | null;
  };
  amenitas_poi: {
    poi_layanan_dasar: KosongDengan<number>;
    poi_keuangan: KosongDengan<number>;
    poi_niaga: KosongDengan<number>;
    poi_logistik: KosongDengan<number>;
    poi_wisata: KosongDengan<number>;
    poi_penginapan: KosongDengan<number>;
  };
};

// --- (6) biofisik — blok UTUH kosong-berkode saat desa tanpa geometri ---

export type KartuBiofisikIsi = {
  /** Pasangan kelas tutupan lahan → proporsi (0–1); hanya kelas > 0 yang ikut (peta sparse). */
  tutupan_lahan: Record<string, number>;
  elevasi_m: number | null;
  relief_m: number | null;
  pantai_km: number | null;
};
export type KartuBiofisik = KosongDengan<KartuBiofisikIsi>;

// --- (7) logistik — blok UTUH kosong-berkode saat desa tanpa geometri ---

export type KartuLogistikIsi = {
  menit_ke_pusat_kota: number | null;
  pusat_kota: string | null;
  menit_ke_bandara: number | null;
  bandara: string | null;
  menit_ke_pelabuhan: number | null;
  pelabuhan: string | null;
  km_lurus_ke_pusat_kota: number | null;
  /** Label tampil "sentralitas" (bukan nama field) — Task 24. */
  sentralitas_menit: number | null;
};
export type KartuLogistik = KosongDengan<KartuLogistikIsi>;

// --- (8) jalur_ekonomi — TIDAK dirender fase 1 (fase 3-5), tipe sengaja longgar ---

/** Peran per varian Jalur Ekonomi (mis. `komoditas: [...]`, `gudang_kopdes: {...}`).
 * Belum dirender fase 1 — bentuk penuh diperjelas saat fitur itu dibangun. */
export type KartuJalurEkonomi = Record<string, unknown> | null;

// --- (9) desa_kembar ---

export type KartuDesaKembarBaris = {
  iddesa: string;
  nmdesa: string;
  nmkec: string;
  /** Persen kemiripan (GLOSSARY § Kemiripan Desa Kembar) — dibaca apa adanya, tanpa hitung ulang. */
  kemiripan: number;
  /** Null bila desa target sempat tak punya baris peta_peran (kasus langka). */
  zona: string | null;
};

// --- (10) fakta_program — 6 registri GLOSSARY + 1 fakta keterlayanan terpisah ---

export type FaktaJadesta = {
  kategori: string;
  n_atraksi: number;
  n_paket: number;
  n_homestay: number;
  sumber: string;
};
export type FaktaDesaWisataSisparnas = { n_terdaftar: number; nama: string; sumber: string };
export type FaktaKampungBudidaya = { komoditas: string; sumber: string };
export type FaktaKampungNelayan = { program: string; tahun: number; sumber: string };
export type FaktaColdStorageUnit = {
  jenis: string | null;
  kapasitas_ton: number | null;
  status: string | null;
  sumber: string;
};
/** Fakta BERBEDA dari `cold_storage_eksisting` (GLOSSARY, jangan disamakan):
 * keterlayanan oleh unit yang bisa berdiri di desa LAIN. */
export type FaktaColdStorageTerlayani = {
  unit_di_desa: string | null;
  unit_di_desa_ini: boolean;
  kapasitas_ton: number | null;
  menit_ke_unit: number | null;
  sumber: string;
};

export type KartuFaktaProgram = {
  jadesta: FaktaJadesta | null;
  desa_wisata_sisparnas: FaktaDesaWisataSisparnas | null;
  n_daya_tarik_wisata: number | null;
  kampung_budidaya: FaktaKampungBudidaya | null;
  kampung_nelayan: FaktaKampungNelayan | null;
  cold_storage_eksisting: FaktaColdStorageUnit[] | null;
  cold_storage_terlayani: FaktaColdStorageTerlayani | null;
  belum_tersentuh: boolean;
  catatan: string;
};

// --- (11) mutu_data ---

export type KartuMutuData = {
  punya_geometri: boolean;
  punya_st2023: boolean;
  punya_idm: boolean;
  kelengkapan_bukti_sk: number | null;
};

/** Kartu Ekonomi Desa utuh — 11 seksi, urutan field mengikuti artefak asli.
 * (3) `rekomendasi_aksi` adalah string apa adanya, bukan objek. */
export type KartuDesa = {
  identitas: KartuIdentitas;
  peta_peran: KartuPetaPeran;
  rekomendasi_aksi: string;
  potensi: KartuPotensi;
  kesiapan: KartuKesiapan;
  biofisik: KartuBiofisik;
  logistik: KartuLogistik;
  jalur_ekonomi: KartuJalurEkonomi;
  desa_kembar: KartuDesaKembarBaris[];
  fakta_program: KartuFaktaProgram;
  mutu_data: KartuMutuData;
};
