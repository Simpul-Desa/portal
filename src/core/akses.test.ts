import { describe, expect, it } from "vitest";

import { bisa, KEMAMPUAN_LENSA, peranEfektif, type Kemampuan, type Peran } from "./akses";

describe("bisa", () => {
  // Tabel literal, bukan diturunkan dari MATRIKS — supaya tes tidak menyalin
  // implementasinya sendiri. 5 peran × 6 kemampuan = 30 sel, persis
  // `../PRD.md` §3.
  it.each<[Peran, Kemampuan, boolean]>([
    ["anonim", "kartu", true],
    ["anonim", "lensa-lain", false],
    ["anonim", "berita", false],
    ["anonim", "asisten", false],
    ["anonim", "laporan", false],
    ["anonim", "admin", false],

    ["tamu", "kartu", true],
    ["tamu", "lensa-lain", true],
    ["tamu", "berita", true],
    ["tamu", "asisten", false],
    ["tamu", "laporan", false],
    ["tamu", "admin", false],

    ["pemerintah", "kartu", true],
    ["pemerintah", "lensa-lain", true],
    ["pemerintah", "berita", true],
    ["pemerintah", "asisten", true],
    ["pemerintah", "laporan", true],
    ["pemerintah", "admin", false],

    ["swasta", "kartu", true],
    ["swasta", "lensa-lain", true],
    ["swasta", "berita", true],
    ["swasta", "asisten", true],
    ["swasta", "laporan", false],
    ["swasta", "admin", false],

    ["admin", "kartu", true],
    ["admin", "lensa-lain", true],
    ["admin", "berita", true],
    ["admin", "asisten", true],
    ["admin", "laporan", true],
    ["admin", "admin", true],
  ])("bisa(%s, %s) → %s", (peran, kemampuan, hasil) => {
    expect(bisa(peran, kemampuan)).toBe(hasil);
  });
});

describe("peranEfektif", () => {
  it("tanpa sesi selalu anonim, apa pun peranProfil dan adaGalat", () => {
    expect(peranEfektif({ adaSesi: false, peranProfil: "admin", adaGalat: false })).toBe("anonim");
    expect(peranEfektif({ adaSesi: false, peranProfil: undefined, adaGalat: true })).toBe("anonim");
  });

  it("sesi ada dan peran terbaca → peran sungguhan menang, termasuk lebih tinggi dari tamu", () => {
    expect(peranEfektif({ adaSesi: true, peranProfil: "pemerintah", adaGalat: false })).toBe(
      "pemerintah",
    );
    expect(peranEfektif({ adaSesi: true, peranProfil: "admin", adaGalat: true })).toBe("admin");
  });

  it("sesi ada, query GAGAL, peran belum ada → melantai ke tamu", () => {
    expect(peranEfektif({ adaSesi: true, peranProfil: undefined, adaGalat: true })).toBe("tamu");
  });

  it("sesi ada, masih MEMUAT (belum gagal, belum sukses) → tetap anonim, bukan tamu", () => {
    expect(peranEfektif({ adaSesi: true, peranProfil: undefined, adaGalat: false })).toBe("anonim");
  });

  it("peran asing dari server tanpa galat → anonim, bukan tamu", () => {
    expect(peranEfektif({ adaSesi: true, peranProfil: "superadmin", adaGalat: false })).toBe(
      "anonim",
    );
  });
});

describe("KEMAMPUAN_LENSA", () => {
  it("memetakan kelima lensa; kartu memetakan ke kemampuan kartu", () => {
    expect(KEMAMPUAN_LENSA).toEqual({
      kartu: "kartu",
      "peta-peran": "lensa-lain",
      "jalur-ekonomi": "lensa-lain",
      "desa-kembar": "lensa-lain",
      "citra-potensi": "lensa-lain",
    });
  });
});
