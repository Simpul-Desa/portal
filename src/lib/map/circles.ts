/**
 * Builder lingkaran berjenjang (GLOSSARY § Istilah dasbor) dari payload
 * `GET /api/wilayah/pusat`: mode provinsi (5 titik) dan mode kabupaten
 * (kabupaten milik satu provinsi). Layer pasangan `circle`+`symbol` memakai
 * warna `map-marker` DESIGN.md § Map Overlays — pasangan navy/putih khusus
 * marker peta, TIDAK PERNAH dipakai untuk chrome UI.
 *
 * Radius lingkaran adalah skala VISUAL dari `n_desa`, bukan hitungan domain
 * (Task 21) — domain interpolasi di bawah adalah pilihan presentasi, dikira
 * longgar dari sebaran nyata (provinsi ratusan-ribuan desa, kabupaten
 * puluhan-ratusan), bukan kontrak angka.
 */

import type { AddLayerObject } from "maplibre-gl";

import type { DataDari } from "@/lib/api/endpoints";
import { formatAngka } from "@/shared/format";

type PusatWilayah = DataDari<"/api/wilayah/pusat">;

/** Properti feature titik lingkaran: `id` dipakai `pilihProv`/`pilihKab` saat
 * diklik, `n_desa` dipakai interpolasi radius, `label` teks siap-tampil. */
export type PropertiLingkaran = { id: string; n_desa: number; label: string };

export const SUMBER_LINGKARAN = "lingkaran-wilayah";
export const LAYER_LINGKARAN_CIRCLE = "lingkaran-wilayah-circle";
export const LAYER_LINGKARAN_LABEL = "lingkaran-wilayah-label";

/** Domain interpolasi `[inMin, outMin, inMax, outMax]` radius (px) dari `n_desa`. */
const DOMAIN_RADIUS_PROVINSI = [0, 26, 9000, 56] as const;
const DOMAIN_RADIUS_KABUPATEN = [0, 14, 500, 38] as const;

/** Token DESIGN.md § Map Overlays `map-marker` — pasangan isi putih (`surface-float`) + garis navy. */
const WARNA_LINGKARAN_ISI = "#f7f7f7";
const WARNA_LINGKARAN_GARIS = "#2e5aac";

function titikDari<T extends { pusat: [number, number]; n_desa: number }>(
  entri: readonly T[],
  idDari: (e: T) => string,
): GeoJSON.FeatureCollection<GeoJSON.Point, PropertiLingkaran> {
  return {
    type: "FeatureCollection",
    features: entri.map((e) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: e.pusat },
      properties: { id: idDari(e), n_desa: e.n_desa, label: formatAngka(e.n_desa) },
    })),
  };
}

/** Mode provinsi: 5 titik pusat provinsi percontohan. */
export function titikProvinsi(
  pusat: PusatWilayah,
): GeoJSON.FeatureCollection<GeoJSON.Point, PropertiLingkaran> {
  return titikDari(pusat.provinsi, (p) => p.idprov);
}

/** Mode kabupaten: titik pusat kabupaten milik satu provinsi aktif. */
export function titikKabupaten(
  pusat: PusatWilayah,
  prov: string,
): GeoJSON.FeatureCollection<GeoJSON.Point, PropertiLingkaran> {
  return titikDari(
    pusat.kabupaten.filter((k) => k.idprov === prov),
    (k) => k.idkab,
  );
}

/** Layer `circle` — isi putih, garis navy, radius interpolasi `n_desa` (domain beda per mode, lihat modul ini). */
export function layerLingkaranCircle(mode: "provinsi" | "kabupaten"): AddLayerObject {
  const domain = mode === "provinsi" ? DOMAIN_RADIUS_PROVINSI : DOMAIN_RADIUS_KABUPATEN;

  return {
    id: LAYER_LINGKARAN_CIRCLE,
    type: "circle",
    source: SUMBER_LINGKARAN,
    paint: {
      "circle-color": WARNA_LINGKARAN_ISI,
      "circle-radius": ["interpolate", ["linear"], ["get", "n_desa"], ...domain],
      "circle-stroke-color": WARNA_LINGKARAN_GARIS,
      "circle-stroke-width": 2,
    },
  };
}

/**
 * Font glyph eksplisit (review Blok D #19) — tanpa `text-font`, MapLibre
 * jatuh ke default internal yang tidak dijamin ada di host glyph manapun.
 * Dicek lewat `GLYPHS_DEMO` (`https://demotiles.maplibre.org/font/...`,
 * `basemap.ts`) sebelum diketok: `Open Sans Regular` → 404 (TIDAK tersedia
 * di host demo ini), `Noto Sans Regular` → 200 (tersedia). Cek ulang bila
 * host glyph pernah berganti.
 */
const FONT_LABEL_LINGKARAN = ["Noto Sans Regular"];

/** Layer `symbol` — teks navy `label` (cacah desa siap-format) di atas tiap lingkaran. */
export function layerLingkaranLabel(): AddLayerObject {
  return {
    id: LAYER_LINGKARAN_LABEL,
    type: "symbol",
    source: SUMBER_LINGKARAN,
    layout: {
      "text-field": ["get", "label"],
      "text-font": FONT_LABEL_LINGKARAN,
      "text-size": 13,
      "text-allow-overlap": true,
    },
    paint: {
      "text-color": WARNA_LINGKARAN_GARIS,
    },
  };
}
