/**
 * Modul layer murni untuk sorotan Desa Kembar (Task 9): dua layer (isi +
 * garis) yang menyorot SATU desa kembar terpilih di atas sumber `desa` milik
 * base. Nol sentuhan peta di sini — pemasangan/pembongkaran ada di
 * `features/desa-kembar/hooks/use-map-layers.ts`.
 */

import { SUMBER_DESA } from "@/lib/map/sumber";

export const LAYER_KEMBAR_FILL = "desa-kembar-fill";
export const LAYER_KEMBAR_LINE = "desa-kembar-line";

/** Token DESIGN.md § Map Overlays "Other areas of interest":
 * `map-outline-alt` #ff7300 2px + `map-fill-alt` rgba(255,115,0,0.18). Hex
 * literal — MapLibre tidak mengevaluasi custom property CSS (pola
 * `lib/map/zona.ts` dan `lib/map/jalur.ts`). Oranye di sini TIDAK melanggar
 * "Orange is a budget" DESIGN.md: anggaran satu aksi utama per layar hanya
 * berlaku untuk `button-primary`, sedangkan `map-outline-alt` memang token
 * peta untuk "other areas of interest". */
const WARNA_KEMBAR_LINE = "#ff7300";
const WARNA_KEMBAR_FILL = "rgba(255,115,0,0.18)";

/** `iddesa` `undefined` menghasilkan filter yang TIDAK cocok dengan apa pun
 * (`""`), bukan filter yang cocok dengan SEMUA fitur — pola yang sama dengan
 * `filterDesaTerpilih` di `shared/hooks/use-map-base.ts`. */
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
