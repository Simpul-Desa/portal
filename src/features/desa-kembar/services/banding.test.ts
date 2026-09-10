import { describe, expect, test } from "vitest";

import type { KartuDesa, KartuKesiapan, KartuPetaPeran } from "@/features/kartu/types";

import { barisBanding, sumbuKesiapan } from "./banding";

const KOMPONEN_PENUH: KartuKesiapan["komponen"] = {
  SK_INDEKS: 60,
  SK_KELEMBAGAAN: 55,
  SK_AMENITAS: 50,
  SK_KONEKTIVITAS: 45,
};

/** Fixture `KartuDesa` minimal-tapi-lengkap — hanya `peta_peran` dan
 * `kesiapan.komponen` yang relevan bagi `banding.ts` diberi jalan override,
 * sisanya nilai dummy tetap agar TypeScript menerima literal utuh. */
function kartuContoh(
  petaPeran: Partial<KartuPetaPeran> = {},
  komponen: Partial<KartuKesiapan["komponen"]> = {},
): KartuDesa {
  return {
    identitas: {
      iddesa: "1801040001",
      kode_dagri: null,
      nama: "CONTOH",
      kecamatan: "CONTOH",
      kabupaten: "CONTOH",
      provinsi: "CONTOH",
      tipe: "desa",
      lon: null,
      lat: null,
      luas_km2: null,
    },
    peta_peran: {
      zona: "Zona Mitra",
      nomor_zona: 2,
      keyakinan: "normal",
      alasan_belum_terpetakan: null,
      sp: 50,
      sk: 50,
      desil_sp: 5,
      desil_sk: 5,
      peringkat_sp_kab: 1,
      peringkat_sk_kab: 1,
      ambang_sp: null,
      ambang_sk: null,
      kelengkapan_bukti_sk: null,
      ...petaPeran,
    },
    rekomendasi_aksi: "",
    potensi: {
      dominan: null,
      sumber_dominan: null,
      detail_dominan: null,
      sub_skor: {
        tp: { persentil: null, kosong: "TIDAK-DINILAI", label: "Tanaman Pangan" },
        horti: { persentil: null, kosong: "TIDAK-DINILAI", label: "Hortikultura" },
        kebun: { persentil: null, kosong: "TIDAK-DINILAI", label: "Perkebunan" },
        ternak: { persentil: null, kosong: "TIDAK-DINILAI", label: "Peternakan" },
        ikan: { persentil: null, kosong: "TIDAK-DINILAI", label: "Perikanan Budidaya" },
        hutan: { persentil: null, kosong: "TIDAK-DINILAI", label: "Kehutanan" },
        tangkap: { persentil: null, kosong: "TIDAK-DINILAI", label: "Perikanan Tangkap" },
        simpul: { persentil: null, kosong: "TIDAK-DINILAI", label: "Simpul" },
      },
    },
    kesiapan: {
      komponen: { ...KOMPONEN_PENUH, ...komponen },
      idm: { nilai: null, kosong: "TIDAK-DINILAI" },
      kelembagaan: { lumbung: 0, penggilingan: 0, infra_per_1000_ruta: null },
      amenitas_poi: {
        poi_layanan_dasar: { nilai: null, kosong: "TIDAK-DINILAI" },
        poi_keuangan: { nilai: null, kosong: "TIDAK-DINILAI" },
        poi_niaga: { nilai: null, kosong: "TIDAK-DINILAI" },
        poi_logistik: { nilai: null, kosong: "TIDAK-DINILAI" },
        poi_wisata: { nilai: null, kosong: "TIDAK-DINILAI" },
        poi_penginapan: { nilai: null, kosong: "TIDAK-DINILAI" },
      },
    },
    biofisik: { nilai: null, kosong: "TIDAK-ADA-DATA" },
    logistik: { nilai: null, kosong: "TIDAK-ADA-DATA" },
    jalur_ekonomi: null,
    desa_kembar: [],
    fakta_program: {
      jadesta: null,
      desa_wisata_sisparnas: null,
      n_daya_tarik_wisata: null,
      kampung_budidaya: null,
      kampung_nelayan: null,
      cold_storage_eksisting: null,
      cold_storage_terlayani: null,
      belum_tersentuh: true,
      catatan: "",
    },
    mutu_data: {
      punya_geometri: true,
      punya_st2023: true,
      punya_idm: false,
      kelengkapan_bukti_sk: null,
    },
  };
}

describe("barisBanding", () => {
  test("dua kartu penuh menghasilkan tujuh baris berurutan tetap", () => {
    const hasil = barisBanding(kartuContoh(), kartuContoh());

    expect(hasil).toHaveLength(7);
    expect(hasil.map((b) => b.label)).toEqual([
      "Zona",
      "Skor Potensi",
      "Skor Kesiapan",
      "Indeks Desa Membangun",
      "Kelembagaan Ekonomi",
      "Amenitas & Keuangan",
      "Konektivitas",
    ]);
  });

  test("baris zona selalu arah null walau kategori berbeda", () => {
    const kiri = kartuContoh({ zona: "Zona Mitra" });
    const kanan = kartuContoh({ zona: "Zona Poros" });
    const baris = barisBanding(kiri, kanan).find((b) => b.label === "Zona");

    expect(baris?.kiri).toBe("Zona Mitra");
    expect(baris?.kanan).toBe("Zona Poros");
    expect(baris?.arah).toBeNull();
  });

  test("desil_sp null menghasilkan \"—\" dan arah null", () => {
    const kiri = kartuContoh({ desil_sp: null });
    const kanan = kartuContoh();
    const baris = barisBanding(kiri, kanan).find((b) => b.label === "Skor Potensi");

    expect(baris?.kiri).toBe("—");
    expect(baris?.kanan).toBe("Desil 5 dari 10");
    expect(baris?.arah).toBeNull();
  });

  test("komponen kosong-berkode menghasilkan \"—\" dan arah null", () => {
    const kiri = kartuContoh();
    const kanan = kartuContoh({}, { SK_INDEKS: { nilai: null, kosong: "TIDAK-DINILAI" } });
    const baris = barisBanding(kiri, kanan).find((b) => b.label === "Indeks Desa Membangun");

    expect(baris?.kanan).toBe("—");
    expect(baris?.arah).toBeNull();
  });

  test("nilai identik menghasilkan arah \"sama\" dan kedua *Kuat false", () => {
    const kiri = kartuContoh({ desil_sk: 7 });
    const kanan = kartuContoh({ desil_sk: 7 });
    const baris = barisBanding(kiri, kanan).find((b) => b.label === "Skor Kesiapan");

    expect(baris?.arah).toBe("sama");
    expect(baris?.kiriKuat).toBe(false);
    expect(baris?.kananKuat).toBe(false);
  });

  test("kanan lebih tinggi menghasilkan arah \"naik\" dan kananKuat true", () => {
    const kiri = kartuContoh({}, { SK_KELEMBAGAAN: 40 });
    const kanan = kartuContoh({}, { SK_KELEMBAGAAN: 70 });
    const baris = barisBanding(kiri, kanan).find((b) => b.label === "Kelembagaan Ekonomi");

    expect(baris?.arah).toBe("naik");
    expect(baris?.kananKuat).toBe(true);
    expect(baris?.kiriKuat).toBe(false);
  });
});

describe("sumbuKesiapan", () => {
  test("membaca peta_peran.sk apa adanya, bukan komponen indeks", () => {
    const kiri = kartuContoh({ sk: 45.83 });
    const kanan = kartuContoh({ sk: 85.72 });

    expect(sumbuKesiapan(kiri, kanan)).toEqual({ kiri: 45.83, kanan: 85.72 });
  });

  test("sk null (Belum Terpetakan) menghasilkan null, tidak melempar", () => {
    const kiri = kartuContoh();
    const kanan = kartuContoh({ sk: null });

    expect(() => sumbuKesiapan(kiri, kanan)).not.toThrow();
    expect(sumbuKesiapan(kiri, kanan)).toEqual({ kiri: 50, kanan: null });
  });
});
