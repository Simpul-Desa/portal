import { describe, expect, it } from "vitest";

import type { Giliran } from "../types";
import { bisaKirim, keMessages } from "./riwayat";

function giliranSejumlah(n: number): Giliran[] {
  return Array.from({ length: n }, (_, i) => ({
    role: i % 2 === 0 ? "user" : "model",
    isi: `pesan ke-${i}`,
  }));
}

describe("keMessages", () => {
  it("membuang jejak dan peringatan, hanya menyisakan role dan isi", () => {
    const riwayat: Giliran[] = [
      { role: "user", isi: "Desa mana yang Zona Poros?" },
      {
        role: "model",
        isi: "Ada 14 desa.",
        jejak: [{ fungsi: "peta_peran", argumen: { iddesa: "3573010001" }, status: "sukses" }],
        peringatan: ["PUTARAN_ALAT_HABIS"],
      },
    ];

    const hasil = keMessages(riwayat);

    expect(hasil).toEqual([
      { role: "user", isi: "Desa mana yang Zona Poros?" },
      { role: "model", isi: "Ada 14 desa." },
    ]);
  });

  it("mempertahankan urutan giliran apa adanya", () => {
    const riwayat = giliranSejumlah(4);

    const hasil = keMessages(riwayat);

    expect(hasil.map((m) => m.isi)).toEqual(["pesan ke-0", "pesan ke-1", "pesan ke-2", "pesan ke-3"]);
  });

  it("riwayat kosong menghasilkan array kosong", () => {
    expect(keMessages([])).toEqual([]);
  });
});

describe("bisaKirim", () => {
  it("true pada 18 pesan — masih ada ruang untuk satu pertanyaan lagi", () => {
    expect(bisaKirim(giliranSejumlah(18))).toBe(true);
  });

  it("true pada 19 pesan — pertanyaan ke-20 masih pas di batas", () => {
    expect(bisaKirim(giliranSejumlah(19))).toBe(true);
  });

  it("false pada 20 pesan — sudah di batas, tidak ada ruang lagi", () => {
    expect(bisaKirim(giliranSejumlah(20))).toBe(false);
  });

  it("false pada 21 pesan (keadaan mustahil) — tetap tidak boleh mengizinkan", () => {
    expect(bisaKirim(giliranSejumlah(21))).toBe(false);
  });
});
