import { describe, expect, test } from "vitest";

import type { SelCitra, SelCitraDetail } from "../types";
import { barisSkor, kelompokSel, namaKomoditas, temaDari } from "./sel";

function sel(over: Partial<SelCitra> = {}): SelCitra {
  return {
    prov: "18",
    target: "kom_prov_horti_01",
    nama: "Pisang Kepok",
    subsektor: "horti",
    mesin: "greedy",
    berkas: "produksi/18/kom_prov_horti_01.json",
    ap_uji_tertahan: 0.529,
    ci_rerata: [0.4139, 0.6732],
    ...over,
  };
}

describe("namaKomoditas", () => {
  test("membuang spasi ekor artefak", () => {
    expect(namaKomoditas("Pisang Lainnya ")).toBe("Pisang Lainnya");
  });
});

describe("temaDari", () => {
  test("kode subsektor dikenal dipetakan ke nama GLOSSARY", () => {
    expect(temaDari("ikan")).toBe("Perikanan Budidaya");
  });

  test("kode subsektor asing mengembalikan null", () => {
    expect(temaDari("subsektor-baru")).toBeNull();
  });
});

describe("kelompokSel", () => {
  test("subsektor asing masuk kelompok Komoditas lain", () => {
    const hasil = kelompokSel([sel({ target: "a", subsektor: "subsektor-baru" })]);

    expect(hasil).toHaveLength(1);
    expect(hasil[0].tema).toBe("Komoditas lain");
    expect(hasil[0].baris).toHaveLength(1);
  });

  test("kelompok campuran terurut mengikuti URUTAN_TEMA, kelompok kosong dibuang", () => {
    const hasil = kelompokSel([
      sel({ target: "kebun-1", subsektor: "kebun", nama: "Kopi" }),
      sel({ target: "tp-1", subsektor: "tp", nama: "Padi Sawah" }),
      sel({ target: "horti-1", subsektor: "horti", nama: "Pisang" }),
    ]);

    // URUTAN_TEMA: tp, horti, kebun, ternak, ikan, hutan — ternak/ikan/hutan
    // tidak punya baris sama sekali, jadi tidak boleh muncul.
    expect(hasil.map((k) => k.tema)).toEqual(["Tanaman Pangan", "Hortikultura", "Perkebunan"]);
  });
});

const FORMAT_SKOR_LENGKAP = ["skor_mentah", "skor100_dlm_kab", "peringkat_dlm_kab", "n_desa_kab"];

function detail(skor: Record<string, number[]>, formatSkor: string[] = FORMAT_SKOR_LENGKAP): SelCitraDetail {
  return { ...sel(), format_skor: formatSkor, skor };
}

describe("barisSkor", () => {
  test("menyaring hanya iddesa milik kabupaten yang diminta", () => {
    const hasil = barisSkor(
      detail({
        "1801040001": [38.1932, 10, 136, 136],
        "1802010001": [40, 20, 50, 50],
      }),
      "1801",
    );

    expect(hasil).toHaveLength(1);
    expect(hasil[0].iddesa).toBe("1801040001");
  });

  test("terurut naik menurut peringkat_dlm_kab walau urutan input acak", () => {
    const hasil = barisSkor(
      detail({
        "1801040001": [1, 90, 3, 3],
        "1801040002": [1, 95, 1, 3],
        "1801040003": [1, 85, 2, 3],
      }),
      "1801",
    );

    expect(hasil.map((b) => b.iddesa)).toEqual(["1801040002", "1801040003", "1801040001"]);
  });

  test("format_skor tanpa skor100_dlm_kab mengembalikan array kosong, tidak melempar", () => {
    const hasilnya = detail({ "1801040001": [1, 2, 3] }, ["skor_mentah", "peringkat_dlm_kab", "n_desa_kab"]);

    expect(() => barisSkor(hasilnya, "1801")).not.toThrow();
    expect(barisSkor(hasilnya, "1801")).toEqual([]);
  });

  test("baris bernilai bukan angka dilewati sendiri, baris lain tetap muncul", () => {
    const hasil = barisSkor(
      detail({
        // Mensimulasikan artefak cacat: nilai bukan angka.
        "1801040001": ["rusak", "rusak", "rusak", "rusak"] as unknown as number[],
        "1801040002": [1, 40, 5, 100],
      }),
      "1801",
    );

    expect(hasil).toHaveLength(1);
    expect(hasil[0].iddesa).toBe("1801040002");
  });

  test("nDesaKab dibaca dari kolom artefak, bukan dari panjang array hasil saringan", () => {
    const hasil = barisSkor(
      detail({
        "1801040001": [1, 50, 1, 999],
      }),
      "1801",
    );

    expect(hasil[0].nDesaKab).toBe(999);
  });
});
