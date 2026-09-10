import { describe, expect, test } from "vitest";

import { normalisasiJalur } from "./normalisasi";

describe("normalisasiJalur", () => {
  test("komoditas: menit dari menit_ke_poros, poros memuat dirinya sendiri di anggota", () => {
    // Potongan nyata `hasil_komoditas.json`, kabupaten 1801, target
    // `kom_prov_horti_07` ("Pisang Ambon") — rencana § "Bentuk artefak".
    const grup = {
      id_jalur: "1801-kom_prov_horti_07-1",
      volume: 770,
      n_anggota: 2,
      poros: {
        iddesa: "1801062004",
        nmdesa: "TRI MULYO",
        nmkec: "GEDUNG SURIAN",
        lumbung: 0,
        penggilingan: 0,
        koperasi_tani: 0,
        skor_infra: 39.6,
      },
      kecamatan: ["AIR HITAM", "GEDUNG SURIAN"],
      anggota: [
        {
          iddesa: "1801062004",
          nmdesa: "TRI MULYO",
          nmkec: "GEDUNG SURIAN",
          volume: 639,
          menit_ke_poros: 0.0,
        },
        {
          iddesa: "1801064005",
          nmdesa: "SUKA JADI",
          nmkec: "AIR HITAM",
          volume: 131,
          menit_ke_poros: 7.637499809265137,
        },
      ],
    };

    const hasil = normalisasiJalur("komoditas", grup);

    expect(hasil.porosAdalahPeran).toBe(true);
    expect(hasil.pusat).toEqual({ iddesa: "1801062004", nmdesa: "TRI MULYO", nmkec: "GEDUNG SURIAN" });
    expect(hasil.label).toBe("Volume");
    expect(hasil.unit).toBe("rumah tangga");
    expect(hasil.bobot).toBe(770);
    expect(hasil.kecamatan).toEqual(["AIR HITAM", "GEDUNG SURIAN"]);
    expect(hasil.anggota).toHaveLength(2);
    expect(hasil.anggota[0]).toEqual({
      iddesa: "1801062004",
      nmdesa: "TRI MULYO",
      nmkec: "GEDUNG SURIAN",
      bobot: 639,
      menit: 0,
    });
    expect(hasil.anggota[1].menit).toBeCloseTo(7.637499809265137);
    expect(hasil.nAnggota).toBe(2);
  });

  test("gudang-kopdes: menit dari menit_ke_gudang, poros (lokasi) juga anggota dirinya sendiri", () => {
    // Potongan nyata `hasil_gudang.json`, kabupaten 1805 (grup terkecil, 2 desa layanan).
    const grup = {
      id_jalur: "1805-gudang-1",
      volume: 3856,
      n_desa_layanan: 2,
      lokasi: {
        iddesa: "1805121005",
        nmdesa: "BUMI NABUNG ILIR",
        nmkec: "BUMI NABUNG",
        lumbung: 0,
        penggilingan: 15,
        koperasi_tani: 0,
        menit_ke_pusat_kota: 72.1,
        skor_infra: 51.6,
      },
      kecamatan: ["BUMI NABUNG"],
      desa_layanan: [
        {
          iddesa: "1805121005",
          nmdesa: "BUMI NABUNG ILIR",
          nmkec: "BUMI NABUNG",
          volume: 2971,
          menit_ke_gudang: 0.0,
        },
        {
          iddesa: "1805121006",
          nmdesa: "BUMI NABUNG UTARA",
          nmkec: "BUMI NABUNG",
          volume: 885,
          menit_ke_gudang: 15.678333282470703,
        },
      ],
    };

    const hasil = normalisasiJalur("gudang-kopdes", grup);

    expect(hasil.porosAdalahPeran).toBe(true);
    expect(hasil.pusat.iddesa).toBe("1805121005");
    expect(hasil.label).toBe("Volume");
    expect(hasil.unit).toBe("rumah tangga tani");
    expect(hasil.bobot).toBe(3856);
    expect(hasil.anggota).toHaveLength(2);
    expect(hasil.anggota[0].menit).toBe(0);
    expect(hasil.anggota[1].menit).toBeCloseTo(15.678333282470703);
    expect(hasil.nAnggota).toBe(2);
  });

  test("cold-storage unit baru: menit dari menit_ke_cs, bobot grup dari volume", () => {
    // Potongan nyata `hasil_cold_storage.json`, kabupaten 1808 (grup `cs_baru` terkecil).
    const grup = {
      id_jalur: "1808-cs-baru-1",
      volume: 1307,
      n_desa_layanan: 2,
      lokasi: {
        iddesa: "1808054005",
        nmdesa: "BUMI DIPASENA MULYA",
        nmkec: "RAWAJITU TIMUR",
        menit_ke_pusat_kota: 65.0,
        skor_infra: 46.3,
      },
      kecamatan: ["RAWAJITU TIMUR"],
      desa_layanan: [
        {
          iddesa: "1808054005",
          nmdesa: "BUMI DIPASENA MULYA",
          nmkec: "RAWAJITU TIMUR",
          volume: 683,
          menit_ke_cs: 0.0,
        },
        {
          iddesa: "1808054004",
          nmdesa: "BUMI DIPASENA JAYA",
          nmkec: "RAWAJITU TIMUR",
          volume: 624,
          menit_ke_cs: 31.79083251953125,
        },
      ],
    };

    const hasil = normalisasiJalur("cold-storage", grup);

    expect(hasil.porosAdalahPeran).toBe(true);
    expect(hasil.pusat.iddesa).toBe("1808054005");
    expect(hasil.label).toBe("Volume");
    expect(hasil.unit).toBe("rumah tangga rantai dingin");
    expect(hasil.bobot).toBe(1307);
    expect(hasil.anggota[1].menit).toBeCloseTo(31.79083251953125);
    expect(hasil.nAnggota).toBe(2);
  });

  test("cold-storage unit eksisting: porosAdalahPeran false, bobot dari kapasitas_ton, anggota kosong", () => {
    // LEMATANG (1803080002) — rencana § "Bentuk artefak", contoh grup cs-eksisting.
    const grup = {
      id_cs: 300,
      iddesa: "1803080002",
      nmdesa: "LEMATANG",
      kapasitas_ton: 1200.0,
      kapasitas_ruta: 19200,
      dimodelkan: true,
      ruta_terserap: 0,
      n_desa_layanan: 0,
      desa_layanan: [],
      id_jalur: "1803-cs-eksisting-1",
    };

    const hasil = normalisasiJalur("cold-storage", grup);

    expect(hasil.porosAdalahPeran).toBe(false);
    expect(hasil.pusat).toEqual({ iddesa: "1803080002", nmdesa: "LEMATANG", nmkec: null });
    expect(hasil.label).toBe("Kapasitas");
    expect(hasil.unit).toBe("ton");
    expect(hasil.bobot).toBe(1200);
    expect(hasil.anggota).toEqual([]);
    expect(hasil.kecamatan).toEqual([]);
    expect(hasil.nAnggota).toBe(0);
  });

  test("wisata: menit dari menit_ke_basis, bobot anggota dari kunci bobot (bukan volume)", () => {
    // Potongan nyata `hasil_wisata.json`, kabupaten 1801 (kawasan terkecil, 2 desa).
    const grup = {
      id_jalur: "1801-kawasan-1",
      bobot: 16,
      n_desa: 2,
      basis: {
        iddesa: "1801040013",
        nmdesa: "BAHWAY",
        nmkec: "BALIK BUKIT",
        kategori: "BERKEMBANG",
        n_homestay: 1,
        n_paket: 6,
        n_atraksi: 7,
        menit_ke_pusat_kota: 24.4,
        skor_wisata: 74.4,
      },
      kecamatan: ["BALIK BUKIT"],
      desa: [
        {
          iddesa: "1801040013",
          nmdesa: "BAHWAY",
          nmkec: "BALIK BUKIT",
          kategori: "BERKEMBANG",
          bobot: 8,
          n_homestay: 1,
          menit_ke_basis: 0.0,
        },
        {
          iddesa: "1801040009",
          nmdesa: "PADANG CAHYA",
          nmkec: "BALIK BUKIT",
          kategori: "RINTISAN",
          bobot: 7,
          n_homestay: 1,
          menit_ke_basis: 30.267499923706055,
        },
      ],
    };

    const hasil = normalisasiJalur("wisata", grup);

    expect(hasil.porosAdalahPeran).toBe(true);
    expect(hasil.pusat.iddesa).toBe("1801040013");
    expect(hasil.label).toBe("Bobot registri");
    expect(hasil.unit).toBeNull();
    expect(hasil.bobot).toBe(16);
    expect(hasil.anggota[0].bobot).toBe(8);
    expect(hasil.anggota[1].bobot).toBe(7);
    expect(hasil.anggota[1].menit).toBeCloseTo(30.267499923706055);
    expect(hasil.nAnggota).toBe(2);
  });

  test("grup cacat (kunci poros hilang): bentuk seragam bernilai kosong, tidak melempar", () => {
    const grup = { volume: 100, n_anggota: 0 }; // tanpa `poros`, tanpa `anggota`

    expect(() => normalisasiJalur("komoditas", grup)).not.toThrow();

    const hasil = normalisasiJalur("komoditas", grup);
    expect(hasil.porosAdalahPeran).toBe(false);
    expect(hasil.pusat).toEqual({ iddesa: "", nmdesa: "", nmkec: null });
    expect(hasil.anggota).toEqual([]);
    expect(hasil.label).toBe("Volume");
    expect(hasil.unit).toBe("rumah tangga");
    expect(hasil.id_jalur).toBe("");
    expect(hasil.nAnggota).toBe(0);
  });

  // H3: `arr()` (normalisasi.ts:37) jatuh ke `[]` untuk apa pun yang bukan
  // array — payload nyata bisa kehilangan/mengganti nama kunci daftar
  // anggota (`anggota`/`desa_layanan`/`desa`) sementara kunci cacahnya
  // (`n_anggota`/dst.) tetap benar. Sebelum perbaikan `nAnggota` ini, panel
  // memakai `anggota.length` dan akan salah menampilkan "0 desa" walau
  // artefak mencatat 5 — RED dulu (test ini gagal sebelum field `nAnggota`
  // ditambahkan ke `normalisasiJalur`), GREEN setelah field itu ada.
  test("kunci daftar anggota hilang/berganti nama: nAnggota tetap dari artefak, bukan dari panjang array", () => {
    const grup = {
      id_jalur: "1801-kom-rusak-1",
      volume: 900,
      n_anggota: 5,
      poros: { iddesa: "1801000001", nmdesa: "CONTOH", nmkec: "KEC CONTOH" },
      // Kunci seharusnya "anggota" — sengaja ditulis salah untuk mensimulasikan payload cacat.
      anggota_typo: [{ iddesa: "1801000001" }],
    };

    const hasil = normalisasiJalur("komoditas", grup);

    expect(hasil.anggota).toEqual([]);
    expect(hasil.nAnggota).toBe(5);
  });
});
