/**
 * Modul layer murni untuk choropleth skor Citra Potensi Desa (Task 17).
 * Token DESIGN.md § Map Overlays, subbab "Score choropleth (Citra Potensi
 * Desa)" — nilai hex literal karena MapLibre tidak mengevaluasi custom
 * property CSS (pola `lib/map/zona.ts`). Nilai kembar ada di
 * `src/app/globals.css` `@theme` (`--color-ramp-1…5`, dipakai juga
 * `shared/components/charts.tsx` `RampMeter`); ubah ketiganya bersamaan.
 */

import type { BarisSkorSel } from "@/features/citra-potensi/types";

/** Lima perhentian ramp DESIGN.md § Data visualisation. */
const RAMP = ["#e15848", "#e26a48", "#ebb568", "#7ed19f", "#2c905a"] as const;

/** Opacity isi choropleth (DESIGN.md § Score choropleth: "filled at 45%
 * opacity") — HANYA untuk fitur berproperti `skor100`; fitur tanpa baris
 * skor tetap opacity 1 (lihat `WARNA_FALLBACK_IDLE` di bawah). */
export const OPACITY_ISI_CITRA = 0.45;

/** Fallback fitur tanpa baris skor (fitur semu "KAWASAN", desa tanpa desa
 * tersekor pada sel ini) — SAMA dengan `WARNA_FALLBACK_IDLE`
 * `lib/map/zona.ts` (token DESIGN.md `map-fill-idle`), supaya fitur itu
 * tetap tampil quiet default, bukan seolah bernilai skor nol. */
export const WARNA_FALLBACK_IDLE = "rgba(255,255,255,0.06)";

/**
 * Join `skor100` ke FeatureCollection batas desa lewat `iddesa` (string,
 * selalu — PRD `api/` §5), pola `joinZona` (`lib/map/zona.ts`). Fitur tanpa
 * baris skor TIDAK diberi properti `skor100` — `ekspresiWarnaCitra` di bawah
 * jatuh ke fallback idle untuknya.
 *
 * Fitur BARU dibangun (`{...fitur, properties: {...}}`) — `geo` sumber TIDAK
 * PERNAH dimutasi, karena objek itu milik cache TanStack Query dan dipakai
 * efek lain (`fitBounds` di `use-map-base.ts` membaca `geo` apa adanya).
 */
export function joinSkorCitra(
  geo: GeoJSON.FeatureCollection,
  baris: readonly BarisSkorSel[],
): GeoJSON.FeatureCollection {
  const skorPerDesa = new Map<string, number>(baris.map((b) => [b.iddesa, b.skor100]));

  return {
    ...geo,
    features: geo.features.map((fitur) => {
      const iddesa = fitur.properties?.iddesa;
      const skor100 = typeof iddesa === "string" ? skorPerDesa.get(iddesa) : undefined;
      if (skor100 === undefined) return fitur;
      return { ...fitur, properties: { ...fitur.properties, skor100 } };
    }),
  };
}

/**
 * Ekspresi `interpolate` untuk paint `fill-color` layer `desa-fill`
 * (diteruskan lewat seam `warnaFill` `shared/hooks/use-map-base.ts`).
 *
 * WAJIB dibungkus `case` ber-`has` (Task 17 GOTCHA 1, CRITICAL): fitur tanpa
 * properti `skor100` (fitur semu "KAWASAN", desa tanpa baris skor) membuat
 * `["get","skor100"]` bernilai `null`; `interpolate` atas masukan
 * non-numerik adalah galat ekspresi MapLibre, dan galat itu ditelan
 * listener `map.on("error", …)` di `map-stage.tsx` — layer diam tanpa satu
 * baris konsol (`app/CLAUDE.md` (lokal saja) §10).
 *
 * Skala 0–100 dipakai APA ADANYA (Task 17 GOTCHA 4) — `skor100_dlm_kab`
 * SUDAH dinormalkan dalam kabupaten oleh `data/`; jangan menormalkan ulang
 * ke rentang min–maks kabupaten di sini.
 *
 * Tipe balik `unknown` (bukan `ExpressionSpecification`), di-cast di titik
 * pakai — kontrak seam `warnaFill` yang sama dengan `ekspresiWarnaZona`.
 */
export function ekspresiWarnaCitra(): unknown {
  return [
    "case",
    ["has", "skor100"],
    [
      "interpolate",
      ["linear"],
      ["get", "skor100"],
      0,
      RAMP[0],
      25,
      RAMP[1],
      50,
      RAMP[2],
      75,
      RAMP[3],
      100,
      RAMP[4],
    ],
    WARNA_FALLBACK_IDLE,
  ];
}

/**
 * Ekspresi `case` untuk paint `fill-opacity` layer `desa-fill`. Fitur
 * berskor diredupkan ke `OPACITY_ISI_CITRA`; fitur tanpa skor TETAP opacity
 * 1 (Task 17 GOTCHA 2) — `WARNA_FALLBACK_IDLE` di atas SUDAH membawa alpha
 * 0,06 di dalam warnanya sendiri, jadi meredupkannya lagi lewat
 * `fill-opacity` menekannya ke ~0,027 efektif dan fitur itu praktis lenyap
 * (cacat yang sama seperti Belum Terpetakan di `lib/map/zona.ts`, review
 * ronde 3 fase 3–4).
 */
export function ekspresiOpacityCitra(): unknown {
  return ["case", ["has", "skor100"], OPACITY_ISI_CITRA, 1];
}
