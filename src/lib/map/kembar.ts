/**
 * Modul layer murni untuk sorotan dan koneksi garis Desa Kembar:
 * - Dua layer area (isi + garis) yang menyorot desa kembar terpilih di atas SUMBER_DESA.
 * - Layer garis koneksi (halo + garis lurus teranimasi) antardesa yang dibandingkan.
 * - Layer titik pin pusat pada kedua desa yang dibandingkan.
 */

import { SUMBER_DESA } from "@/lib/map/sumber";

export const LAYER_KEMBAR_FILL = "desa-kembar-fill";
export const LAYER_KEMBAR_LINE = "desa-kembar-line";

export const SUMBER_KEMBAR_GARIS = "desa-kembar-garis-sumber";
export const LAYER_KEMBAR_GARIS_HALO = "desa-kembar-garis-halo";
export const LAYER_KEMBAR_GARIS = "desa-kembar-garis";

export const SUMBER_KEMBAR_TITIK = "desa-kembar-titik-sumber";
export const LAYER_KEMBAR_TITIK = "desa-kembar-titik";
export const LAYER_KEMBAR_TITIK_INNER = "desa-kembar-titik-inner";

/** Token warna tema oranye Simpul Desa */
const WARNA_KEMBAR_LINE = "#ff7300";
const WARNA_KEMBAR_FILL = "rgba(255,115,0,0.18)";

/** `iddesa` `undefined` menghasilkan filter yang TIDAK cocok dengan apa pun */
export function filterKembar(iddesa: string | undefined): unknown {
  return ["==", ["get", "iddesa"], iddesa ?? ""];
}

export function layerKembarFill(iddesa: string | undefined): unknown {
  return {
    id: LAYER_KEMBAR_FILL,
    type: "fill",
    source: SUMBER_DESA,
    filter: filterKembar(iddesa),
    paint: { "fill-color": WARNA_KEMBAR_FILL },
  };
}

export function layerKembarLine(iddesa: string | undefined): unknown {
  return {
    id: LAYER_KEMBAR_LINE,
    type: "line",
    source: SUMBER_DESA,
    filter: filterKembar(iddesa),
    paint: { "line-color": WARNA_KEMBAR_LINE, "line-width": 2 },
  };
}

/** Layer halo/glow oranye lembut untuk garis lurus penghubung */
export function layerKembarGarisHalo(): unknown {
  return {
    id: LAYER_KEMBAR_GARIS_HALO,
    type: "line",
    source: SUMBER_KEMBAR_GARIS,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": WARNA_KEMBAR_LINE,
      "line-width": 8,
      "line-opacity": 0.3,
      "line-blur": 3,
    },
  };
}

/** Layer garis lurus oranye dengan pola strip/dashed */
export function layerKembarGaris(): unknown {
  return {
    id: LAYER_KEMBAR_GARIS,
    type: "line",
    source: SUMBER_KEMBAR_GARIS,
    layout: { "line-cap": "round", "line-join": "round" },
    paint: {
      "line-color": WARNA_KEMBAR_LINE,
      "line-width": 3,
      "line-opacity": 0.95,
      "line-dasharray": [3, 2],
    },
  };
}

/** Titik lingkaran luar pada pusat desa yang dibandingkan */
export function layerKembarTitik(): unknown {
  return {
    id: LAYER_KEMBAR_TITIK,
    type: "circle",
    source: SUMBER_KEMBAR_TITIK,
    paint: {
      "circle-radius": 7,
      "circle-color": "#ffffff",
      "circle-stroke-color": WARNA_KEMBAR_LINE,
      "circle-stroke-width": 2.5,
    },
  };
}

/** Titik lingkaran dalam (inti oranye) pada pusat desa */
export function layerKembarTitikInner(): unknown {
  return {
    id: LAYER_KEMBAR_TITIK_INNER,
    type: "circle",
    source: SUMBER_KEMBAR_TITIK,
    paint: {
      "circle-radius": 3.5,
      "circle-color": WARNA_KEMBAR_LINE,
    },
  };
}
