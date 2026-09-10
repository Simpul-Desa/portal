import { describe, expect, test } from "vitest";

import type { BarisPetaPeran, NamaZona } from "@/features/peta-peran/types";

import {
  ekspresiOpacityZona,
  ekspresiWarnaZona,
  joinZona,
  layerZonaLine,
  OPACITY_ISI_ZONA,
  WARNA_FALLBACK_IDLE,
  WARNA_ZONA,
} from "./zona";

function baris(iddesa: string, zona: BarisPetaPeran["zona"]): BarisPetaPeran {
  return {
    iddesa,
    nmdesa: "CONTOH",
    nmkec: "CONTOH",
    idkab: "1801",
    nmkab: "LAMPUNG BARAT",
    idprov: "18",
    zona,
    keyakinan: "normal",
    desil_sp: 5,
    desil_sk: 5,
    potensi_dominan: null,
    sumber_dominan: null,
  };
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
      properties: { iddesa: "1801040002", nmdesa: "DESA LAIN" },
      geometry: { type: "Point", coordinates: [104.2, -5.2] },
    },
    {
      type: "Feature",
      properties: { iddesa: "1801040000", nmdesa: "KAWASAN" },
      geometry: { type: "Point", coordinates: [104.3, -5.3] },
    },
  ],
};

const ZONA_ASLI: NamaZona[] = ["Zona Pemerintah", "Zona Mitra", "Zona Poros", "Zona Bantuan"];

describe("joinZona", () => {
  test("fitur dengan baris model mendapat properti zona", () => {
    const hasil = joinZona(GEO_CONTOH, [
      baris("1801040001", "Zona Mitra"),
      baris("1801040002", "Zona Poros"),
    ]);

    expect(hasil.features[0].properties?.zona).toBe("Zona Mitra");
    expect(hasil.features[1].properties?.zona).toBe("Zona Poros");
  });

  test("fitur KAWASAN tanpa baris model TIDAK mendapat properti zona", () => {
    const hasil = joinZona(GEO_CONTOH, [
      baris("1801040001", "Zona Mitra"),
      baris("1801040002", "Zona Poros"),
    ]);

    expect(hasil.features[2].properties).not.toHaveProperty("zona");
    expect(hasil.features[2].properties?.iddesa).toBe("1801040000");
  });

  test("geo sumber tidak termutasi", () => {
    const geoSalinan = structuredClone(GEO_CONTOH);
    joinZona(GEO_CONTOH, [baris("1801040001", "Zona Mitra")]);

    expect(GEO_CONTOH).toEqual(geoSalinan);
  });
});

/**
 * Review ronde 3, temuan #1 (HIGH): Belum Terpetakan sebelumnya dipetakan ke
 * `WARNA_ZONA["Belum Terpetakan"]` (putih 75% alpha) sebagai `fill-color`,
 * lalu `ekspresiOpacityZona` meredupkannya lagi ke 45% — komposit ≈34%,
 * lebih terang dari keempat zona asli (45% hue saturasi) dan nyaris menelan
 * highlight seleksi putih 10%. DESIGN.md § Zone choropleth: Belum Terpetakan
 * TANPA isi — token putih 75% itu hanya untuk garis putus
 * (`layerZonaBelumLine`), bukan untuk fill. Tes di bawah menegakkan bahwa
 * fill-nya sekarang identik idle (`WARNA_FALLBACK_IDLE`), BUKAN token garis
 * putusnya sendiri.
 */
describe("ekspresiWarnaZona", () => {
  test("memuat kelima nama zona dan diakhiri fallback", () => {
    const ekspresi = ekspresiWarnaZona() as unknown[];

    expect(ekspresi[0]).toBe("match");
    for (const nama of Object.keys(WARNA_ZONA)) {
      expect(ekspresi).toContain(nama);
    }
    // Elemen terakhir adalah fallback (bukan salah satu warna zona) —
    // panjang ekspresi genap (match + get + 5 pasang + 1 fallback = 13).
    expect(ekspresi).toHaveLength(13);
  });

  test.each(ZONA_ASLI)("%s dipetakan ke hue penuhnya sendiri", (nama) => {
    const ekspresi = ekspresiWarnaZona() as unknown[];
    const indeks = ekspresi.indexOf(nama);

    expect(ekspresi[indeks + 1]).toBe(WARNA_ZONA[nama]);
  });

  test("Belum Terpetakan dipetakan ke fallback idle, BUKAN token garis putusnya sendiri", () => {
    const ekspresi = ekspresiWarnaZona() as unknown[];
    const indeks = ekspresi.indexOf("Belum Terpetakan");

    expect(ekspresi[indeks + 1]).toBe(WARNA_FALLBACK_IDLE);
    expect(ekspresi[indeks + 1]).not.toBe(WARNA_ZONA["Belum Terpetakan"]);
    // Sama seperti fallback fitur tanpa properti `zona` sama sekali (elemen
    // terakhir) — Belum Terpetakan harus terlihat IDENTIK idle di peta,
    // bukan versi pudarnya sendiri.
    expect(ekspresi[indeks + 1]).toBe(ekspresi[ekspresi.length - 1]);
  });
});

/**
 * Evaluator kecil untuk subset ekspresi MapLibre (`match`/filter) yang
 * dipakai `layerZonaLine` dan `ekspresiOpacityZona` (review temuan #4 dan
 * ronde 3 #1) — `["all", …]`, `["has", …]`, dan `["!=", …]` dengan operand
 * `["get", …]` atau literal. Bukan implementasi spek filter MapLibre penuh:
 * cukup untuk menegakkan bentuk ekspresi modul ini, sengaja tidak
 * digeneralisasi lebih jauh (`app/CLAUDE.md` §2).
 */
type Ekspresi = readonly unknown[];

function nilaiEkspresi(ekspresi: unknown, properties: Record<string, unknown>): unknown {
  if (Array.isArray(ekspresi) && ekspresi[0] === "get") return properties[ekspresi[1] as string];
  return ekspresi;
}

function cocokFilter(filter: Ekspresi, properties: Record<string, unknown>): boolean {
  const [operator, ...argumen] = filter;
  switch (operator) {
    case "all":
      return (argumen as Ekspresi[]).every((f) => cocokFilter(f, properties));
    case "has":
      return Object.hasOwn(properties, argumen[0] as string);
    case "!=":
      return nilaiEkspresi(argumen[0], properties) !== nilaiEkspresi(argumen[1], properties);
    default:
      throw new Error(`operator filter tak dikenal dalam tes: ${String(operator)}`);
  }
}

/**
 * Review ronde 3, temuan #1: `fill-opacity` TIDAK boleh meredupkan Belum
 * Terpetakan ke `OPACITY_ISI_ZONA` lagi — warnanya sendiri (di atas) sudah
 * `WARNA_FALLBACK_IDLE`, jadi meredupkannya lagi menghasilkan komposit jauh
 * lebih pudar dari idle (pola bug yang sama seperti fitur semu "KAWASAN"
 * yang sudah dijaga fungsi ini sebelumnya).
 */
describe("ekspresiOpacityZona", () => {
  function opacityUntuk(properties: Record<string, unknown>): number {
    const [, kondisi, nilaiBenar, nilaiSalah] = ekspresiOpacityZona() as [
      string,
      Ekspresi,
      number,
      number,
    ];
    return cocokFilter(kondisi, properties) ? nilaiBenar : nilaiSalah;
  }

  test.each(ZONA_ASLI)("meredupkan %s ke OPACITY_ISI_ZONA", (zona) => {
    expect(opacityUntuk({ zona })).toBe(OPACITY_ISI_ZONA);
  });

  test("TIDAK meredupkan Belum Terpetakan", () => {
    expect(opacityUntuk({ zona: "Belum Terpetakan" })).toBe(1);
  });

  test("TIDAK meredupkan fitur tanpa properti zona (fitur semu KAWASAN)", () => {
    expect(opacityUntuk({})).toBe(1);
  });
});

describe("layerZonaLine", () => {
  const filter = (layerZonaLine() as { filter: Ekspresi }).filter;

  test("mengecualikan fitur tanpa properti zona (fitur semu KAWASAN)", () => {
    expect(cocokFilter(filter, {})).toBe(false);
  });

  test("mengecualikan Belum Terpetakan (punya garis putusnya sendiri)", () => {
    expect(cocokFilter(filter, { zona: "Belum Terpetakan" })).toBe(false);
  });

  test.each(ZONA_ASLI)("menyertakan %s", (zona) => {
    expect(cocokFilter(filter, { zona })).toBe(true);
  });
});
