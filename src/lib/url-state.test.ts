import { describe, expect, it } from "vitest";

import { parseWilayahParams, serialize } from "./url-state";

describe("parseWilayahParams", () => {
  it("mengembalikan lensa kartu saat query kosong", () => {
    const hasil = parseWilayahParams(new URLSearchParams(""));

    expect(hasil).toEqual({ lensa: "kartu" });
  });

  it("mengembalikan lensa kartu saat lensa tidak sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("lensa=ngawur"));

    expect(hasil.lensa).toBe("kartu");
  });

  it("meneruskan lensa yang sah apa adanya", () => {
    const hasil = parseWilayahParams(new URLSearchParams("lensa=jalur-ekonomi"));

    expect(hasil.lensa).toBe("jalur-ekonomi");
  });

  it("membuang prov yang bukan 2 digit", () => {
    const hasil = parseWilayahParams(new URLSearchParams("prov=181"));

    expect(hasil.prov).toBeUndefined();
  });

  it("meneruskan prov 2 digit yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("prov=18"));

    expect(hasil.prov).toBe("18");
  });

  it("membuang kab yang bukan 4 digit", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kab=123"));

    expect(hasil.kab).toBeUndefined();
  });

  it("meneruskan kab 4 digit yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kab=1801"));

    expect(hasil.kab).toBe("1801");
  });

  it("membuang desa yang bukan 10 digit", () => {
    const hasil = parseWilayahParams(new URLSearchParams("desa=123"));

    expect(hasil.desa).toBeUndefined();
  });

  it("meneruskan desa 10 digit yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("desa=1801012001"));

    expect(hasil.desa).toBe("1801012001");
  });

  it("menurunkan prov dan kab dari prefix desa yatim (tanpa prov/kab di URL)", () => {
    const hasil = parseWilayahParams(new URLSearchParams("desa=1801012001"));

    expect(hasil).toEqual({ lensa: "kartu", prov: "18", kab: "1801", desa: "1801012001" });
  });

  it("prefix desa menang atas prov yang tidak konsisten di URL", () => {
    const hasil = parseWilayahParams(new URLSearchParams("prov=33&desa=1801012001"));

    expect(hasil.prov).toBe("18");
  });

  it("prefix desa menang atas kab yang tidak konsisten di URL", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kab=9999&desa=1801012001"));

    expect(hasil.kab).toBe("1801");
  });

  it("menurunkan prov dari prefix kab (kab tanpa prov di URL — review ronde 3 temuan #2)", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kab=3306"));

    expect(hasil).toEqual({ lensa: "kartu", prov: "33", kab: "3306" });
  });

  it("prefix kab menang atas prov yang tidak konsisten di URL", () => {
    const hasil = parseWilayahParams(new URLSearchParams("prov=18&kab=3306"));

    expect(hasil.prov).toBe("33");
  });

  it("meneruskan slug zona yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("zona=mitra"));

    expect(hasil.zona).toBe("mitra");
  });

  it("membuang slug zona yang tidak sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("zona=ngawur"));

    expect(hasil.zona).toBeUndefined();
  });

  it("meneruskan varian yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("varian=gudang-kopdes"));

    expect(hasil.varian).toBe("gudang-kopdes");
  });

  it("membuang varian yang tidak sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("varian=ngawur"));

    expect(hasil.varian).toBeUndefined();
  });

  it("meneruskan jalur berbentuk sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("jalur=1801-kom_prov_tp_02-1"));

    expect(hasil.jalur).toBe("1801-kom_prov_tp_02-1");
  });

  it("membuang jalur berbentuk salah (karakter tidak sah)", () => {
    const hasil = parseWilayahParams(new URLSearchParams("jalur=1801%2Fkom"));

    expect(hasil.jalur).toBeUndefined();
  });

  it("membuang jalur berbentuk salah (kosong)", () => {
    const hasil = parseWilayahParams(new URLSearchParams("jalur="));

    expect(hasil.jalur).toBeUndefined();
  });

  it("meneruskan target berbentuk sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("target=kom_prov_horti_01"));

    expect(hasil.target).toBe("kom_prov_horti_01");
  });

  it("membuang target berbentuk salah (spasi dan kapital)", () => {
    const hasil = parseWilayahParams(new URLSearchParams("target=Kom Prov"));

    expect(hasil.target).toBeUndefined();
  });

  it("meneruskan kembar 10 digit yang sah", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kembar=1801040002"));

    expect(hasil.kembar).toBe("1801040002");
  });

  it("membuang kembar yang bukan 10 digit", () => {
    const hasil = parseWilayahParams(new URLSearchParams("kembar=123"));

    expect(hasil.kembar).toBeUndefined();
  });

  it("membuang kembar yang sama dengan desa acuan", () => {
    const hasil = parseWilayahParams(
      new URLSearchParams("desa=1801040001&kembar=1801040001"),
    );

    expect(hasil.kembar).toBeUndefined();
  });

  it("mempertahankan kembar berbeda dari desa acuan, prov/kab tetap turun dari desa", () => {
    const hasil = parseWilayahParams(
      new URLSearchParams("desa=1801040001&kembar=1801040002"),
    );

    expect(hasil).toEqual({
      lensa: "kartu",
      prov: "18",
      kab: "1801",
      desa: "1801040001",
      kembar: "1801040002",
    });
  });
});

describe("serialize", () => {
  it("menjaga urutan param tetap stabil untuk objek penuh, tanpa tergantung urutan properti input", () => {
    const hasil = serialize({
      desa: "1801012001",
      kab: "1801",
      prov: "18",
      lensa: "jalur-ekonomi",
    });

    expect(hasil).toBe("lensa=jalur-ekonomi&prov=18&kab=1801&desa=1801012001");
  });

  it("menghapus nilai kosong/undefined dari hasil", () => {
    const hasil = serialize({ lensa: "jalur-ekonomi", prov: undefined, kab: "", desa: undefined });

    expect(hasil).toBe("lensa=jalur-ekonomi");
  });

  it("tidak menulis lensa saat nilainya default kartu, supaya URL tetap bersih", () => {
    const hasil = serialize({ lensa: "kartu" });

    expect(hasil).toBe("");
  });

  it("tetap bersih setelah reset (wilayah dibuang, lensa default)", () => {
    const hasil = serialize({ lensa: "kartu", prov: undefined, kab: undefined, desa: undefined });

    expect(hasil).toBe("");
  });

  it("tetap menulis lensa non-default meski tanpa wilayah", () => {
    const hasil = serialize({ lensa: "desa-kembar" });

    expect(hasil).toBe("lensa=desa-kembar");
  });

  it("menjaga urutan kunci zona/varian/jalur di ekor, setelah desa", () => {
    const hasil = serialize({
      lensa: "peta-peran",
      prov: "18",
      kab: "1801",
      zona: "mitra",
      varian: "gudang-kopdes",
      jalur: "1801-gudang-1",
    });

    expect(hasil).toBe(
      "lensa=peta-peran&prov=18&kab=1801&zona=mitra&varian=gudang-kopdes&jalur=1801-gudang-1",
    );
  });

  it("tidak menulis varian saat nilainya default komoditas, supaya URL tetap bersih", () => {
    const hasil = serialize({ lensa: "jalur-ekonomi", varian: "komoditas" });

    expect(hasil).toBe("lensa=jalur-ekonomi");
  });

  it("tetap menulis varian non-default", () => {
    const hasil = serialize({ lensa: "jalur-ekonomi", varian: "wisata" });

    expect(hasil).toBe("lensa=jalur-ekonomi&varian=wisata");
  });

  it("menjaga urutan kunci target/kembar di ekor, setelah jalur", () => {
    const hasil = serialize({
      lensa: "desa-kembar",
      prov: "18",
      kab: "1801",
      desa: "1801040001",
      target: "kom_prov_horti_01",
      kembar: "1801040002",
    });

    expect(hasil).toBe(
      "lensa=desa-kembar&prov=18&kab=1801&desa=1801040001&target=kom_prov_horti_01&kembar=1801040002",
    );
  });
});
