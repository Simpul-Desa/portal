/**
 * Modul layer murni garis Jalur Ekonomi (Task 29) — dari `JalurTernormalisasi`
 * (`features/jalur-ekonomi/services/normalisasi.ts`) plus indeks koordinat
 * desa, bangun dua FeatureCollection (garis + titik) dan tiga spesifikasi
 * layer MapLibre. Pola modul layer murni sama seperti `lib/map/circles.ts`
 * dan `lib/map/zona.ts`: konstanta hex literal + rujukan token di komentar
 * (MapLibre tidak mengevaluasi custom property CSS), tanpa satu pun sentuhan
 * peta (tidak ada `map.addLayer`/`useEffect` di sini — itu Task 30,
 * `features/jalur-ekonomi/hooks/use-map-layers.ts`).
 *
 * Koordinat pusat desa datang dari properti `pusat` fitur GeoJSON
 * `GET /api/geo/desa/{idkab}` (Blok A) — `indeksPusat` membangun peta
 * `iddesa → [lon, lat]` sekali per kabupaten, dipakai `garisJalur` dan
 * `titikJalur` untuk menghindari mencari fitur berulang.
 */

import type { JalurTernormalisasi } from "@/features/jalur-ekonomi/types";

export const SUMBER_JALUR = "jalur";
export const LAYER_JALUR_LINE = "jalur-line";
export const SUMBER_JALUR_TITIK = "jalur-titik";
export const LAYER_JALUR_ANGGOTA = "jalur-anggota";
export const LAYER_JALUR_POROS = "jalur-poros";

/** Token DESIGN.md § Map Overlays "Route lines (Jalur Ekonomi)"
 * (`components.map-route`): `map-gold-outline` untuk garis + stroke poros,
 * `surface-float` untuk isi lingkaran poros. Hex literal — MapLibre tidak
 * mengevaluasi custom property CSS (pola `circles.ts`). */
const WARNA_GARIS = "#d9a13b";
const WARNA_POROS_ISI = "#f7f7f7";

export type PropertiTitikJalur = { peran: "poros" | "anggota"; nmdesa: string };

/**
 * Indeks `iddesa → pusat` dari properti fitur geo (Blok A `api/`). Fitur
 * tanpa properti `pusat`, atau dengan `pusat` bukan pasangan `[lon, lat]`
 * numerik (`null` — dijaga Task 3 tapi tetap divalidasi runtime di sini,
 * atau arity salah), TIDAK masuk indeks — pemanggil (`garisJalur`/
 * `titikJalur`) memperlakukan desa itu sebagai "tanpa koordinat", bukan
 * melempar.
 */
export function indeksPusat(geo: GeoJSON.FeatureCollection): Map<string, [number, number]> {
  const idx = new Map<string, [number, number]>();

  for (const fitur of geo.features) {
    const props = fitur.properties;
    if (!props) continue;

    const iddesa = props.iddesa;
    if (typeof iddesa !== "string") continue;

    const pusat = props.pusat;
    if (!Array.isArray(pusat) || pusat.length !== 2) continue;

    const [lon, lat] = pusat;
    if (typeof lon !== "number" || typeof lat !== "number") continue;

    idx.set(iddesa, [lon, lat]);
  }

  return idx;
}

/**
 * LineString per anggota (kecuali porosnya sendiri, yang panjang garisnya
 * nol) menuju pusat poros. `n_tanpa_koordinat` menghitung SETIAP desa yang
 * tidak ada di `pusat` — anggota lain yang koordinatnya hilang, DITAMBAH
 * porosnya sendiri bila porosnya jugalah yang tanpa koordinat. Bukan
 * `anggotaLain.length` begitu poros tanpa koordinat: itu menghitung SELURUH
 * anggota lain seolah-olah semuanya ikut tanpa koordinat, padahal anggota
 * yang koordinatnya ADA hanya kehilangan garisnya karena UJUNG LAIN (poros)
 * yang tidak diketahui, bukan karena posisi anggota itu sendiri tidak ada.
 *
 * `porosTanpaKoordinat` (review Jalur Ekonomi #2) memisahkan DUA keadaan
 * yang `n_tanpa_koordinat` sendiri tidak bisa dibedakan pembacanya: poros
 * tanpa koordinat berarti NOL garis di seluruh jalur ini (bukan "sebagian
 * anggota hilang", walau `titikJalur` masih bisa menggambar titik anggota
 * yang koordinatnya sendiri ada — hanya garisnya yang seluruhnya hilang,
 * sebab kedua ujung SETIAP garis butuh posisi poros), sedangkan anggota
 * tanpa koordinat hanya menghilangkan garis MEREKA sendiri, poros dan garis
 * lainnya tetap tergambar. Pemanggil (`panel.tsx`) butuh bendera ini untuk
 * memilih kalimat yang benar, bukan angka yang sama untuk dua arti berbeda.
 */
export function garisJalur(
  jalur: JalurTernormalisasi,
  pusat: Map<string, [number, number]>,
): {
  fc: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  n_tanpa_koordinat: number;
  porosTanpaKoordinat: boolean;
} {
  const anggotaLain = jalur.anggota.filter((a) => a.iddesa !== jalur.pusat.iddesa);
  const posisiPoros = pusat.get(jalur.pusat.iddesa);

  if (!posisiPoros) {
    const nAnggotaTanpaKoordinat = anggotaLain.filter((a) => !pusat.has(a.iddesa)).length;
    return {
      fc: { type: "FeatureCollection", features: [] },
      n_tanpa_koordinat: nAnggotaTanpaKoordinat + 1,
      porosTanpaKoordinat: true,
    };
  }

  const features: GeoJSON.Feature<GeoJSON.LineString>[] = [];
  let n_tanpa_koordinat = 0;

  for (const a of anggotaLain) {
    const posisiAnggota = pusat.get(a.iddesa);
    if (!posisiAnggota) {
      n_tanpa_koordinat += 1;
      continue;
    }
    features.push({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: [posisiAnggota, posisiPoros] },
    });
  }

  return { fc: { type: "FeatureCollection", features }, n_tanpa_koordinat, porosTanpaKoordinat: false };
}

/**
 * Titik poros + titik tiap anggota (kecuali porosnya sendiri, sudah
 * digambar sekali sebagai titik poros). `peran: "poros"` HANYA bila
 * `jalur.porosAdalahPeran` — baris `cs-eksisting` (GLOSSARY: unit yang sudah
 * berdiri bukan temuan model) tetap digambar sebagai titik, tapi bertanda
 * `"anggota"` supaya lingkaran khas Desa Poros tidak diberikan padanya.
 */
export function titikJalur(
  jalur: JalurTernormalisasi,
  pusat: Map<string, [number, number]>,
): GeoJSON.FeatureCollection<GeoJSON.Point, PropertiTitikJalur> {
  const features: GeoJSON.Feature<GeoJSON.Point, PropertiTitikJalur>[] = [];

  const posisiPoros = pusat.get(jalur.pusat.iddesa);
  if (posisiPoros) {
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: posisiPoros },
      properties: {
        peran: jalur.porosAdalahPeran ? "poros" : "anggota",
        nmdesa: jalur.pusat.nmdesa,
      },
    });
  }

  for (const a of jalur.anggota) {
    if (a.iddesa === jalur.pusat.iddesa) continue;
    const posisi = pusat.get(a.iddesa);
    if (!posisi) continue;
    features.push({
      type: "Feature",
      geometry: { type: "Point", coordinates: posisi },
      properties: { peran: "anggota", nmdesa: a.nmdesa },
    });
  }

  return { type: "FeatureCollection", features };
}

/** Layer `line` — emas 2px, opacity 0,85, ujung/sambungan bulat. */
export function layerJalurLine(): unknown {
  return {
    id: LAYER_JALUR_LINE,
    type: "line",
    source: SUMBER_JALUR,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: { "line-color": WARNA_GARIS, "line-width": 2, "line-opacity": 0.85 },
  };
}

/** Layer `circle` anggota — lingkaran emas kecil (radius 4px), `peran === "anggota"`. */
export function layerJalurAnggota(): unknown {
  return {
    id: LAYER_JALUR_ANGGOTA,
    type: "circle",
    source: SUMBER_JALUR_TITIK,
    filter: ["==", ["get", "peran"], "anggota"],
    paint: { "circle-radius": 4, "circle-color": WARNA_GARIS },
  };
}

/** Layer `circle` poros — isi `surface-float`, garis emas 2px (radius 7px), `peran === "poros"`. */
export function layerJalurPoros(): unknown {
  return {
    id: LAYER_JALUR_POROS,
    type: "circle",
    source: SUMBER_JALUR_TITIK,
    filter: ["==", ["get", "peran"], "poros"],
    paint: {
      "circle-radius": 7,
      "circle-color": WARNA_POROS_ISI,
      "circle-stroke-color": WARNA_GARIS,
      "circle-stroke-width": 2,
    },
  };
}
