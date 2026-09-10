import { describe, expect, test } from "vitest";

import { titikKabupaten, titikProvinsi } from "./circles";

const PUSAT_CONTOH = {
  provinsi: [
    { idprov: "18", nama: "Lampung", pusat: [105.0, -5.0] as [number, number], n_desa: 2656, n_kabupaten: 15 },
    { idprov: "33", nama: "Jawa Tengah", pusat: [110.2, -7.2] as [number, number], n_desa: 8562, n_kabupaten: 35 },
  ],
  kabupaten: [
    { idkab: "1801", nmkab: "LAMPUNG BARAT", idprov: "18", pusat: [104.2, -5.0] as [number, number], n_desa: 136 },
    { idkab: "1802", nmkab: "TANGGAMUS", idprov: "18", pusat: [104.6, -5.3] as [number, number], n_desa: 299 },
    { idkab: "3301", nmkab: "CILACAP", idprov: "33", pusat: [109.0, -7.5] as [number, number], n_desa: 269 },
  ],
};

describe("titikProvinsi", () => {
  test("satu feature per provinsi, label diformat dari n_desa", () => {
    const fc = titikProvinsi(PUSAT_CONTOH);

    expect(fc.type).toBe("FeatureCollection");
    expect(fc.features).toHaveLength(2);
    expect(fc.features[0]).toEqual({
      type: "Feature",
      geometry: { type: "Point", coordinates: [105.0, -5.0] },
      properties: { id: "18", n_desa: 2656, label: "2.656" },
    });
    expect(fc.features[1].properties.label).toBe("8.562");
  });
});

describe("titikKabupaten", () => {
  test("hanya kabupaten milik provinsi aktif yang ikut", () => {
    const fc = titikKabupaten(PUSAT_CONTOH, "18");

    expect(fc.features).toHaveLength(2);
    expect(fc.features.map((f) => f.properties.id)).toEqual(["1801", "1802"]);
  });

  test("provinsi tanpa kabupaten menghasilkan FeatureCollection kosong", () => {
    const fc = titikKabupaten(PUSAT_CONTOH, "52");

    expect(fc.features).toHaveLength(0);
  });
});
