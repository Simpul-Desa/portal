import { describe, expect, it } from "vitest";

import { formatAngka, formatPersen, formatSatuan, formatTanggal, strip } from "./format";

describe("formatAngka", () => {
  it("memakai koma sebagai pemisah desimal", () => {
    expect(formatAngka(72.4)).toBe("72,4");
  });

  it("memakai titik sebagai pemisah ribuan", () => {
    expect(formatAngka(1248)).toBe("1.248");
  });

  it("membatasi jumlah desimal sesuai maksDesimal", () => {
    expect(formatAngka(72.456, 1)).toBe("72,5");
  });
});

describe("formatPersen", () => {
  it("menempelkan tanda persen ke angkanya", () => {
    expect(formatPersen(68)).toBe("68%");
  });
});

describe("formatSatuan", () => {
  it("memisahkan angka dan satuan dengan spasi", () => {
    expect(formatSatuan(3.2, "km")).toBe("3,2 km");
  });
});

describe("formatTanggal", () => {
  it("menyingkat bulan Agustus jadi 'Agu', bukan 'Agt'", () => {
    expect(formatTanggal("2025-08-24")).toBe("24 Agu 25");
  });

  it("mengembalikan strip untuk string kosong", () => {
    expect(formatTanggal("")).toBe("—");
  });

  it("mengembalikan strip untuk bulan di luar 1-12", () => {
    expect(formatTanggal("2025-13-01")).toBe("—");
  });

  it("mengembalikan strip untuk format tanggal yang bukan ISO", () => {
    expect(formatTanggal("24/08/2025")).toBe("—");
  });
});

describe("strip", () => {
  it("mengembalikan strip untuk null", () => {
    expect(strip(null)).toBe("—");
  });

  it("mengembalikan strip untuk undefined", () => {
    expect(strip(undefined)).toBe("—");
  });

  it("menampilkan nol apa adanya karena nol bukan kosong", () => {
    expect(strip(0)).toBe("0");
  });

  it("memformat angka desimal sesuai GLOSSARY, bukan lolos mentah", () => {
    expect(strip(72.4)).toBe("72,4");
  });

  it("memformat angka ribuan sesuai GLOSSARY, bukan lolos mentah", () => {
    expect(strip(1248)).toBe("1.248");
  });
});
