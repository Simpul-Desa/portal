import { describe, expect, it } from "vitest";
import { parseTeksInsight, stripMarkdown, tebalkanKataKunci } from "./format-insight";

describe("parseTeksInsight", () => {
  it("mengembalikan array kosong jika input kosong", () => {
    expect(parseTeksInsight("")).toEqual([]);
    expect(parseTeksInsight("   ")).toEqual([]);
  });

  it("mengurai paragraf dan butir daftar dengan benar", () => {
    const teks = `Desa Maju berada di zona 1.
Potensi unggulannya adalah kopi.

Berikut rekomendasi:
- **Pemerintah Desa**: Gunakan Dana Desa.
- **Swasta**: Investasi gudang.

Paragraf penutup.`;

    const hasil = parseTeksInsight(teks);
    expect(hasil).toHaveLength(5);
    expect(hasil[0]).toEqual({ type: "p", text: "Desa Maju berada di zona 1." });
    expect(hasil[1]).toEqual({ type: "p", text: "Potensi unggulannya adalah kopi." });
    expect(hasil[2]).toEqual({ type: "p", text: "Berikut rekomendasi:" });
    expect(hasil[3]).toEqual({
      type: "ul",
      items: [
        "**Pemerintah Desa**: Gunakan Dana Desa.",
        "**Swasta**: Investasi gudang.",
      ],
    });
    expect(hasil[4]).toEqual({ type: "p", text: "Paragraf penutup." });
  });
});

describe("stripMarkdown", () => {
  it("membersihkan bold dan strip bullet", () => {
    const teks = "Desa **Kubu Perahu** memiliki potensi tinggi.\n- **Pemerintah**: Dana Desa.";
    const bersih = stripMarkdown(teks);
    expect(bersih).toBe("Desa Kubu Perahu memiliki potensi tinggi. Pemerintah: Dana Desa.");
  });
});

describe("tebalkanKataKunci", () => {
  it("menebalkan program, zona, dan status IDM", () => {
    const input = "Desa berada pada Zona Mitra dengan status 'Maju' dan program Dana Desa.";
    const hasil = tebalkanKataKunci(input);
    expect(hasil).toContain("**Zona Mitra**");
    expect(hasil).toContain("'**Maju**'");
    expect(hasil).toContain("**Dana Desa**");
  });
});
