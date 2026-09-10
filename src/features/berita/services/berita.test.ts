import { describe, expect, it } from "vitest";

import { catatanTerpotong, labelMeta, labelTombol, urlAman } from "./berita";

describe("urlAman", () => {
  it("skema https dipertahankan apa adanya", () => {
    const hasil = urlAman("https://a.id/x");

    expect(hasil).toBe("https://a.id/x");
  });

  it("skema http dipertahankan apa adanya", () => {
    const hasil = urlAman("http://a.id/x");

    expect(hasil).toBe("http://a.id/x");
  });

  it("skema javascript menghasilkan null", () => {
    const hasil = urlAman("javascript:alert(1)");

    expect(hasil).toBeNull();
  });

  it("skema data URI menghasilkan null", () => {
    const hasil = urlAman("data:text/html,<h1>");

    expect(hasil).toBeNull();
  });

  it("string bukan URL menghasilkan null", () => {
    const hasil = urlAman("bukan url");

    expect(hasil).toBeNull();
  });

  it("string kosong menghasilkan null", () => {
    const hasil = urlAman("");

    expect(hasil).toBeNull();
  });
});

describe("labelMeta", () => {
  it("tanggal terbit ada memakai tanggal terbit", () => {
    const hasil = labelMeta({
      sumber: "Antara",
      terbit_pada: "2026-08-24T03:00:00Z",
      dipanen_pada: "2026-08-25T11:20:41Z",
    });

    expect(hasil).toBe("Antara • 24 Agu 26");
  });

  it("tanggal terbit null jatuh ke dipanen_pada berlabel dipanen", () => {
    const hasil = labelMeta({
      sumber: "Antara",
      terbit_pada: null,
      dipanen_pada: "2026-08-25T11:20:41Z",
    });

    expect(hasil).toBe("Antara • dipanen 25 Agu 26");
  });

  it("tanggal terbit berbentuk asing menghasilkan tanda hubung dari formatTanggal", () => {
    const hasil = labelMeta({
      sumber: "Antara",
      terbit_pada: "kemarin",
      dipanen_pada: "2026-08-25T11:20:41Z",
    });

    expect(hasil).toBe("Antara • —");
  });
});

describe("labelTombol", () => {
  it("tertutup dan daftar lengkap menghasilkan Tampilkan semua (n)", () => {
    const hasil = labelTombol(23, 23, false);

    expect(hasil).toBe("Tampilkan semua (23)");
  });

  it("tertutup dan daftar terpotong menghasilkan Tampilkan n terbaru", () => {
    const hasil = labelTombol(132, 50, false);

    expect(hasil).toBe("Tampilkan 50 terbaru");
  });

  it("terbuka menghasilkan Ringkas lagi", () => {
    const hasil = labelTombol(23, 23, true);

    expect(hasil).toBe("Ringkas lagi");
  });
});

describe("catatanTerpotong", () => {
  it("total sama dengan dimuat menghasilkan null", () => {
    const hasil = catatanTerpotong(23, 23);

    expect(hasil).toBeNull();
  });

  it("total lebih besar dari dimuat menghasilkan catatan terpotong", () => {
    const hasil = catatanTerpotong(132, 50);

    expect(hasil).toBe("Menampilkan 50 dari 132 berita terbaru.");
  });
});
