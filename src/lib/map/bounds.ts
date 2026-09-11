import type { LngLatBoundsLike } from "maplibre-gl";

/**
 * Bbox manual tanpa turf — dipakai `fitBounds` per tingkat lingkaran
 * berjenjang (Task 21). Dua sumber: daftar titik `[lng,lat]` (pusat
 * kabupaten se-provinsi) dan `FeatureCollection` (batas desa kabupaten).
 * Keduanya mengembalikan `null` untuk masukan kosong — pemanggil melewati
 * `fitBounds` saat itu alih-alih memaksa bbox yang tak berarti.
 */

type Posisi = readonly [number, number];

function isPosisi(nilai: unknown): nilai is Posisi {
  return (
    Array.isArray(nilai) &&
    nilai.length >= 2 &&
    typeof nilai[0] === "number" &&
    typeof nilai[1] === "number"
  );
}

/** Telusuri array koordinat GeoJSON rekursif — TANPA asumsi kedalaman
 * nesting, supaya Polygon (3 level) dan MultiPolygon (4 level) sama-sama
 * jalan lewat fungsi yang sama (GOTCHA Task 21, mirror Task 1 `bangun/pusat.py`). */
function telusuriKoordinat(nilai: unknown, tampung: (pos: Posisi) => void): void {
  if (isPosisi(nilai)) {
    tampung(nilai);
    return;
  }
  if (Array.isArray(nilai)) {
    for (const anak of nilai) telusuriKoordinat(anak, tampung);
  }
}

/** Bbox dari daftar titik `[lng,lat]` — dipakai untuk pusat kabupaten
 * se-provinsi (fitBounds tingkat kabupaten, Task 21). */
export function bboxDariTitik(titik: readonly Posisi[]): LngLatBoundsLike | null {
  if (titik.length === 0) return null;

  let minLng = titik[0][0];
  let minLat = titik[0][1];
  let maxLng = titik[0][0];
  let maxLat = titik[0][1];

  for (const [lng, lat] of titik) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}

/** Bbox dari satu `Feature` (Polygon/MultiPolygon/Point) —
 * dipakai untuk auto zoom/flyTo ke desa terpilih. */
export function bboxDariFitur(fitur: GeoJSON.Feature): LngLatBoundsLike | null {
  const titik: Posisi[] = [];
  const geometri = fitur.geometry;
  if (geometri && "coordinates" in geometri) {
    telusuriKoordinat(geometri.coordinates, (pos) => titik.push(pos));
  }
  return bboxDariTitik(titik);
}

/** Bbox dari seluruh geometri `FeatureCollection` (Polygon/MultiPolygon) —
 * dipakai untuk batas desa kabupaten (fitBounds tingkat desa, Task 21). */
export function bboxDariFeatureCollection(
  fc: GeoJSON.FeatureCollection,
): LngLatBoundsLike | null {
  const titik: Posisi[] = [];

  for (const fitur of fc.features) {
    const geometri = fitur.geometry;
    if (geometri && "coordinates" in geometri) {
      telusuriKoordinat(geometri.coordinates, (pos) => titik.push(pos));
    }
  }

  return bboxDariTitik(titik);
}

