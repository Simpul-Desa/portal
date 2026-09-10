import { describe, expect, it } from "vitest";

import { tujuanAman } from "./redirect-aman";

describe("tujuanAman", () => {
  it("meneruskan path relatif apa adanya", () => {
    expect(tujuanAman("/?lensa=jalur-ekonomi")).toBe("/?lensa=jalur-ekonomi");
  });

  it("mengembalikan / saat lanjut null", () => {
    expect(tujuanAman(null)).toBe("/");
  });

  it("menolak URL protokol-relatif //evil.com", () => {
    expect(tujuanAman("//evil.com")).toBe("/");
  });

  it("menolak URL absolut https://evil.com", () => {
    expect(tujuanAman("https://evil.com")).toBe("/");
  });

  it("menolak skema javascript:", () => {
    expect(tujuanAman("javascript:alert(1)")).toBe("/");
  });

  it("menolak path berisi backslash", () => {
    expect(tujuanAman("/\\evil.com")).toBe("/");
  });

  // Empat kasus di bawah adalah cacat yang lolos keempat gerbang sampai
  // tinjauan pra-commit fase 1-8 (temuan K1): parser URL WHATWG membuang
  // TAB, LF, dan CR sebelum mengurai, jadi "/" + karakter itu + "/evil.com"
  // berakhir sebagai URL protokol-relatif walau pemeriksaan prefiks
  // meloloskannya. Sumber nyatanya `?lanjut=%2F%09%2Fevil.com`, yang
  // di-decode `URLSearchParams` menjadi persis string di bawah.
  it("menolak TAB sesudah slash pertama", () => {
    expect(tujuanAman("/\t/evil.com")).toBe("/");
  });

  it("menolak LF sesudah slash pertama", () => {
    expect(tujuanAman("/\n/evil.com")).toBe("/");
  });

  it("menolak CR sesudah slash pertama", () => {
    expect(tujuanAman("/\r/evil.com")).toBe("/");
  });

  it("menolak userinfo yang menyamarkan host", () => {
    expect(tujuanAman("/\t/evil.com/@simpul-desa.example.com")).toBe("/");
  });

  it("mempertahankan query dan fragmen path yang sah", () => {
    expect(tujuanAman("/?lensa=peta-peran&kab=1801#zona")).toBe(
      "/?lensa=peta-peran&kab=1801#zona",
    );
  });

  it("menolak nilai tanpa slash pembuka", () => {
    expect(tujuanAman("lensa")).toBe("/");
  });
});
