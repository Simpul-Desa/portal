import { describe, expect, test } from "vitest";

import type { JalurTernormalisasi } from "@/features/jalur-ekonomi/types";

import { garisJalur, indeksPusat, titikJalur } from "./jalur";

function fiturGeo(iddesa: string, nmdesa: string, pusat: unknown): GeoJSON.Feature {
  return {
    type: "Feature",
    properties: { iddesa, nmdesa, pusat },
    geometry: { type: "Polygon", coordinates: [] },
  };
}

describe("indeksPusat", () => {
  test("fitur pusat null diabaikan, fitur pusat arity salah diabaikan, fitur valid masuk indeks", () => {
    const geo: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        fiturGeo("1801062004", "TRI MULYO", [104.123, -5.123]),
        fiturGeo("1801064005", "SUKA JADI", null),
        fiturGeo("1805121005", "BUMI NABUNG ILIR", [104.5]),
      ],
    };

    const idx = indeksPusat(geo);

    expect(idx.get("1801062004")).toEqual([104.123, -5.123]);
    expect(idx.has("1801064005")).toBe(false);
    expect(idx.has("1805121005")).toBe(false);
  });
});

// Grup komoditas: poros TRI MULYO + anggota dirinya sendiri (menit 0, harus
// dibuang di garisJalur) + SUKA JADI (berkoordinat) + satu desa tanpa
// koordinat batas wilayah.
const JALUR_KOMODITAS: JalurTernormalisasi = {
  id_jalur: "1801-kom_prov_horti_07-1",
  porosAdalahPeran: true,
  pusat: { iddesa: "1801062004", nmdesa: "TRI MULYO", nmkec: "GEDUNG SURIAN" },
  anggota: [
    { iddesa: "1801062004", nmdesa: "TRI MULYO", nmkec: "GEDUNG SURIAN", bobot: 639, menit: 0 },
    { iddesa: "1801064005", nmdesa: "SUKA JADI", nmkec: "AIR HITAM", bobot: 131, menit: 7.6 },
    { iddesa: "9999999999", nmdesa: "TANPA KOORDINAT", nmkec: null, bobot: 50, menit: 12 },
  ],
  nAnggota: 3,
  label: "Volume",
  unit: "rumah tangga",
  bobot: 770,
  kecamatan: ["AIR HITAM", "GEDUNG SURIAN"],
};

const PUSAT_KOMODITAS = new Map<string, [number, number]>([
  ["1801062004", [104.62, -5.12]],
  ["1801064005", [104.7, -5.2]],
]);

// Grup cold-storage eksisting (BAKARAN KULON, 3318080018): porosAdalahPeran
// false, anggota berisi dirinya sendiri (self-service, menit 0).
const JALUR_CS_EKSISTING: JalurTernormalisasi = {
  id_jalur: "3318-cs-eksisting-1",
  porosAdalahPeran: false,
  pusat: { iddesa: "3318080018", nmdesa: "BAKARAN KULON", nmkec: null },
  anggota: [{ iddesa: "3318080018", nmdesa: "BAKARAN KULON", nmkec: "JUWANA", bobot: 301, menit: 0 }],
  nAnggota: 1,
  label: "Kapasitas",
  unit: "ton",
  bobot: 700,
  kecamatan: [],
};

const PUSAT_CS_EKSISTING = new Map<string, [number, number]>([["3318080018", [111.05, -6.72]]]);

// M4: poros TRI MULYO SENGAJA tidak masuk peta pusat (fitur semu tanpa
// geometri), tetapi KEDUA anggota lain berkoordinat — honest count harus
// menghitung porosnya sendiri (1), BUKAN `anggotaLain.length` (2).
const PUSAT_TANPA_POROS = new Map<string, [number, number]>([
  ["1801064005", [104.7, -5.2]],
  ["9999999999", [105.0, -5.5]],
]);

describe("garisJalur", () => {
  test("garis normal ke anggota berkoordinat, anggota == poros dibuang, anggota tanpa koordinat dihitung", () => {
    const { fc, n_tanpa_koordinat, porosTanpaKoordinat } = garisJalur(JALUR_KOMODITAS, PUSAT_KOMODITAS);

    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].geometry.coordinates).toEqual([
      [104.7, -5.2],
      [104.62, -5.12],
    ]);
    // M9: tidak ada handler klik yang membaca properti fitur garis (seam
    // `interaksi` tidak pernah didaftar untuk `jalur-line`) — properti
    // kosong, bukan `{ iddesa }` mati.
    expect(fc.features[0].properties).toEqual({});
    expect(n_tanpa_koordinat).toBe(1);
    expect(porosTanpaKoordinat).toBe(false);
  });

  test("anggota sama dengan poros tidak pernah menghasilkan garis, walau satu-satunya anggota", () => {
    const { fc, n_tanpa_koordinat, porosTanpaKoordinat } = garisJalur(JALUR_CS_EKSISTING, PUSAT_CS_EKSISTING);

    expect(fc.features).toHaveLength(0);
    expect(n_tanpa_koordinat).toBe(0);
    expect(porosTanpaKoordinat).toBe(false);
  });

  // M4: sebelum perbaikan, `n_tanpa_koordinat` di cabang "poros tanpa
  // koordinat" adalah `anggotaLain.length` (2 di sini) — salah, karena
  // KEDUA anggota lain PUNYA koordinat; satu-satunya desa yang benar-benar
  // tanpa koordinat adalah porosnya sendiri. RED dulu (lihat laporan sesi
  // untuk bukti gagal sebelum perbaikan), GREEN dengan hitungan jujur (1).
  //
  // M12 (review Jalur Ekonomi #2): `porosTanpaKoordinat` HARUS `true` di sini
  // — panel butuh bendera ini terpisah dari `n_tanpa_koordinat` supaya bisa
  // membedakan "seluruh jalur tidak tergambar (poros hilang)" dari "sebagian
  // anggota hilang (poros ada)". Tanpa bendera ini, panel hanya punya angka
  // `1`, yang sama persis dengan angka "1 anggota hilang" pada kasus lain —
  // dua keadaan yang tidak bisa dibedakan pembaca hanya dari cacahnya.
  test("poros tanpa koordinat, kedua anggota lain berkoordinat: hitungan jujur (poros saja), bukan anggotaLain.length, dan porosTanpaKoordinat true", () => {
    const { fc, n_tanpa_koordinat, porosTanpaKoordinat } = garisJalur(JALUR_KOMODITAS, PUSAT_TANPA_POROS);

    expect(fc.features).toHaveLength(0);
    expect(n_tanpa_koordinat).toBe(1);
    expect(porosTanpaKoordinat).toBe(true);
  });
});

describe("titikJalur", () => {
  test("titik poros + titik anggota berkoordinat; anggota tanpa koordinat tidak digambar", () => {
    const fc = titikJalur(JALUR_KOMODITAS, PUSAT_KOMODITAS);

    expect(fc.features).toHaveLength(2);
    expect(fc.features.find((f) => f.properties.peran === "poros")?.properties.nmdesa).toBe("TRI MULYO");
    expect(fc.features.find((f) => f.properties.peran === "anggota")?.properties.nmdesa).toBe("SUKA JADI");
  });

  test("cs-eksisting: porosAdalahPeran false, tidak ada titik peran 'poros' walau titiknya tetap digambar", () => {
    const fc = titikJalur(JALUR_CS_EKSISTING, PUSAT_CS_EKSISTING);

    expect(fc.features.some((f) => f.properties.peran === "poros")).toBe(false);
    expect(fc.features).toHaveLength(1);
    expect(fc.features[0].properties).toEqual({ peran: "anggota", nmdesa: "BAKARAN KULON" });
  });
});
