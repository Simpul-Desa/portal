import { describe, expect, it } from "vitest";

import { formatJawaban } from "./format-jawaban";

describe("formatJawaban", () => {
  it("mengembalikan satu blok paragraf untuk satu baris teks", () => {
    const hasil = formatJawaban("Halo dunia");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "Halo dunia" }]);
  });

  it("dua paragraf dipisah baris kosong menghasilkan dua blok terpisah", () => {
    const hasil = formatJawaban("Paragraf pertama.\n\nParagraf kedua.");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Paragraf pertama." },
      { jenis: "paragraf", teks: "Paragraf kedua." },
    ]);
  });

  it("tiga butir bertanda - digabung jadi satu blok butir", () => {
    const hasil = formatJawaban("- Sukarame\n- Blabak\n- Ciparay");

    expect(hasil).toEqual([{ jenis: "butir", butir: ["Sukarame", "Blabak", "Ciparay"] }]);
  });

  it("penanda butir * dan • dikenali sebagai butir yang sama", () => {
    const hasil = formatJawaban("* Sukarame\n• Blabak");

    expect(hasil).toEqual([{ jenis: "butir", butir: ["Sukarame", "Blabak"] }]);
  });

  it("penanda tebal ** dibuang menjadi teks polos, bukan dibaca sebagai butir", () => {
    const hasil = formatJawaban("**Sukarame** — desil 9");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "Sukarame — desil 9" }]);
  });

  it("pagar judul ### dibuang, baris tetap jadi paragraf", () => {
    const hasil = formatJawaban("### Judul Bagian");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "Judul Bagian" }]);
  });

  it("baris bernomor tetap jadi paragraf dengan nomor utuh", () => {
    const hasil = formatJawaban("1. Poin pertama");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "1. Poin pertama" }]);
  });

  it("urutan butir, paragraf, butir menghasilkan tiga blok berurutan", () => {
    const hasil = formatJawaban("- a\nteks paragraf\n- b");

    expect(hasil).toEqual([
      { jenis: "butir", butir: ["a"] },
      { jenis: "paragraf", teks: "teks paragraf" },
      { jenis: "butir", butir: ["b"] },
    ]);
  });

  it("string kosong menghasilkan array kosong", () => {
    expect(formatJawaban("")).toEqual([]);
  });

  it("teks tanpa baris baru menghasilkan satu paragraf", () => {
    const hasil = formatJawaban("Satu baris tanpa newline sama sekali");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "Satu baris tanpa newline sama sekali" }]);
  });

  it("penanda miring satu bintang dibuang dari paragraf", () => {
    const hasil = formatJawaban("Desil Skor Kesiapan 6 *(Catatan: keyakinan rendah)*");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Desil Skor Kesiapan 6 (Catatan: keyakinan rendah)" },
    ]);
  });

  it("penanda miring dibuang dari isi butir tanpa memakan penanda butirnya", () => {
    const hasil = formatJawaban("* Sukarame *(keyakinan rendah)*");

    expect(hasil).toEqual([{ jenis: "butir", butir: ["Sukarame (keyakinan rendah)"] }]);
  });

  it("backtick di sekitar kode dibuang, isinya tetap utuh", () => {
    const hasil = formatJawaban("Kode BPS: `1802040032` dan kolom `SK_INDEKS`.");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Kode BPS: 1802040032 dan kolom SK_INDEKS." },
    ]);
  });

  it("garis horizontal markdown dibuang, tidak jadi paragraf berisi tiga strip", () => {
    const hasil = formatJawaban("Bagian satu.\n---\nBagian dua.");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Bagian satu." },
      { jenis: "paragraf", teks: "Bagian dua." },
    ]);
  });

  it("garis bawah tiga dan pagar blok kode juga dibuang", () => {
    const hasil = formatJawaban("Satu\n___\n```\nDua");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Satu" },
      { jenis: "paragraf", teks: "Dua" },
    ]);
  });

  it("garis horizontal menutup blok butir yang sedang berjalan", () => {
    const hasil = formatJawaban("- a\n---\n- b");

    expect(hasil).toEqual([
      { jenis: "butir", butir: ["a"] },
      { jenis: "butir", butir: ["b"] },
    ]);
  });

  it("garis bawah di dalam kode target tidak disentuh", () => {
    const hasil = formatJawaban("Sel kom_prov_horti_01 lolos uji tertahan.");

    expect(hasil).toEqual([
      { jenis: "paragraf", teks: "Sel kom_prov_horti_01 lolos uji tertahan." },
    ]);
  });

  it("spasi ganda di dalam kalimat dipertahankan, tidak dirapatkan", () => {
    const hasil = formatJawaban("Kata  dengan  spasi ganda");

    expect(hasil).toEqual([{ jenis: "paragraf", teks: "Kata  dengan  spasi ganda" }]);
  });
});
