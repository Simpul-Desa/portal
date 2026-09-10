import { describe, expect, test } from "vitest";

import type { BarisSkorSel } from "@/features/citra-potensi/types";

import {
  ekspresiOpacityCitra,
  ekspresiWarnaCitra,
  joinSkorCitra,
  OPACITY_ISI_CITRA,
  WARNA_FALLBACK_IDLE,
} from "./citra";

function baris(iddesa: string, skor100: number): BarisSkorSel {
  return { iddesa, skor100, peringkat: 1, nDesaKab: 1 };
}

const GEO_CONTOH: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { iddesa: "1801040001", nmdesa: "KUBU PERAHU" },
      geometry: { type: "Point", coordinates: [104.1, -5.1] },
    },
    {
      type: "Feature",
      properties: { iddesa: "1801040000", nmdesa: "KAWASAN" },
      geometry: { type: "Point", coordinates: [104.3, -5.3] },
    },
  ],
};

describe("joinSkorCitra", () => {
  test("fitur dengan baris skor mendapat properti skor100", () => {
    const hasil = joinSkorCitra(GEO_CONTOH, [baris("1801040001", 72.5)]);

    expect(hasil.features[0].properties?.skor100).toBe(72.5);
  });

  test("fitur KAWASAN tanpa baris skor TIDAK mendapat properti skor100", () => {
    const hasil = joinSkorCitra(GEO_CONTOH, [baris("1801040001", 72.5)]);

    expect(hasil.features[1].properties).not.toHaveProperty("skor100");
    expect(hasil.features[1].properties?.iddesa).toBe("1801040000");
  });

  test("geo sumber tidak termutasi", () => {
    const geoSalinan = structuredClone(GEO_CONTOH);
    joinSkorCitra(GEO_CONTOH, [baris("1801040001", 72.5)]);

    expect(GEO_CONTOH).toEqual(geoSalinan);
  });
});

/**
 * Evaluator kecil untuk subset ekspresi MapLibre (`case`/`has`) dipakai
 * ekspresi ini — mengikuti pola `zona.test.ts` (bukan implementasi spek
 * ekspresi MapLibre penuh, `app/CLAUDE.md` §2).
 */
type Ekspresi = readonly unknown[];

function opacityUntuk(properties: Record<string, unknown>): number {
  const [, kondisi, nilaiBenar, nilaiSalah] = ekspresiOpacityCitra() as [string, Ekspresi, number, number];
  const [operator, kunci] = kondisi;
  const cocok = operator === "has" && Object.hasOwn(properties, kunci as string);
  return cocok ? nilaiBenar : nilaiSalah;
}

describe("ekspresiWarnaCitra", () => {
  test("dibungkus case ber-has untuk properti skor100", () => {
    const ekspresi = ekspresiWarnaCitra() as unknown[];

    expect(ekspresi[0]).toBe("case");
    expect(ekspresi[1]).toEqual(["has", "skor100"]);
  });

  test("fallback (elemen terakhir) identik dengan WARNA_FALLBACK_IDLE map-fill-idle", () => {
    const ekspresi = ekspresiWarnaCitra() as unknown[];

    expect(ekspresi[ekspresi.length - 1]).toBe(WARNA_FALLBACK_IDLE);
  });
});

describe("ekspresiOpacityCitra", () => {
  test("meredupkan fitur berproperti skor100 ke OPACITY_ISI_CITRA", () => {
    expect(opacityUntuk({ skor100: 40 })).toBe(OPACITY_ISI_CITRA);
  });

  test("TIDAK meredupkan fitur tanpa properti skor100 (fitur semu KAWASAN)", () => {
    expect(opacityUntuk({})).toBe(1);
  });
});
