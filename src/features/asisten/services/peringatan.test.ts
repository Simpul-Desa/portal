import { describe, expect, it } from "vitest";

import { peringatanTampil } from "./peringatan";

describe("peringatanTampil", () => {
  it("PUTARAN_ALAT_HABIS menghasilkan satu kalimat", () => {
    const hasil = peringatanTampil(["PUTARAN_ALAT_HABIS"]);

    expect(hasil.kalimat).toHaveLength(1);
    expect(hasil.kodeAsing).toEqual([]);
  });

  it("SUSPEK_INJEKSI adalah sinyal internal, kedua daftar kosong", () => {
    const hasil = peringatanTampil(["SUSPEK_INJEKSI"]);

    expect(hasil.kalimat).toEqual([]);
    expect(hasil.kodeAsing).toEqual([]);
  });

  it("kode baru yang tidak dikenal masuk kodeAsing", () => {
    const hasil = peringatanTampil(["KODE_MASA_DEPAN"]);

    expect(hasil.kodeAsing).toEqual(["KODE_MASA_DEPAN"]);
    expect(hasil.kalimat).toEqual([]);
  });

  it("dua kode sama menghasilkan satu keluaran, bukan dua", () => {
    const hasil = peringatanTampil(["PUTARAN_ALAT_HABIS", "PUTARAN_ALAT_HABIS"]);

    expect(hasil.kalimat).toHaveLength(1);
  });

  it("daftar kosong menghasilkan dua daftar kosong", () => {
    const hasil = peringatanTampil([]);

    expect(hasil.kalimat).toEqual([]);
    expect(hasil.kodeAsing).toEqual([]);
  });

  it("campuran kode terpetakan, internal, dan asing mendarat di tempat yang benar", () => {
    const hasil = peringatanTampil([
      "PUTARAN_ALAT_HABIS",
      "ANGKA_TANPA_ASAL",
      "JAWABAN_KOSONG",
      "BOCOR_PROMPT",
      "KODE_MASA_DEPAN",
    ]);

    expect(hasil.kalimat).toHaveLength(2);
    expect(hasil.kodeAsing).toEqual(["KODE_MASA_DEPAN"]);
  });
});
