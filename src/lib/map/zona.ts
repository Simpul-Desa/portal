/**
 * Modul layer murni untuk choropleth zona Peta Peran (Task 19). Token
 * DESIGN.md § Map Overlays, subbab "Zone choropleth (Peta Peran)" — nilai hex
 * literal karena MapLibre tidak mengevaluasi custom property CSS (pola
 * `lib/map/circles.ts`). Nilai kembar ada di `src/app/globals.css` `@theme`
 * (kelas `bg-map-zona-*` untuk swatch dot chip); ubah keduanya bersamaan.
 */

import type { BarisPetaPeran, NamaZona } from "@/features/peta-peran/types";
import { SUMBER_DESA } from "@/lib/map/sumber";

/** Hue penuh (bukan hex ber-alpha) untuk tiap zona — dijaga TANPA opacity
 * dibakar ke dalam nilainya sendiri, supaya nilai yang sama bisa dipakai
 * ulang di tempat lain yang butuh hue penuh (mis. garis 2px DESIGN.md).
 * Opacity isi 45% (`OPACITY_ISI_ZONA`) disetel terpisah lewat paint
 * `fill-opacity`, bukan di sini.
 *
 * `"Belum Terpetakan"` di sini adalah token `map-zona-belum` DESIGN.md
 * (putih 75% alpha) — dipakai HANYA sebagai `line-color` garis putus
 * (`layerZonaBelumLine` di bawah). BUKAN dipakai sebagai fill: DESIGN.md §
 * Zone choropleth menyatakan Belum Terpetakan "carries no fill", dan
 * `ekspresiWarnaZona` di bawah memetakan fill-nya ke `WARNA_FALLBACK_IDLE`
 * (review ronde 3 temuan #1) — dua nilai yang SENGAJA berbeda untuk dua
 * tujuan berbeda, jangan disatukan lagi. */
export const WARNA_ZONA: Record<NamaZona, string> = {
  "Zona Pemerintah": "#d6338f",
  "Zona Mitra": "#7d5ae0",
  "Zona Poros": "#00a9bf",
  "Zona Bantuan": "#8d9aab",
  "Belum Terpetakan": "rgba(255,255,255,0.75)",
};

export const LAYER_ZONA_BELUM_LINE = "desa-zona-belum-line";
export const LAYER_ZONA_LINE = "desa-zona-line";

/** Opacity isi choropleth (DESIGN.md § Zone choropleth: "fills its polygon
 * at 45% opacity"). Disetel lewat `fill-opacity` layer `desa-fill` milik
 * base — lihat `features/peta-peran/hooks/use-map-layers.ts`. */
export const OPACITY_ISI_ZONA = 0.45;

/**
 * Ekspresi `case` untuk paint `fill-opacity` layer `desa-fill` (review
 * temuan #5, diperluas review ronde 3 temuan #1): fitur didim ke
 * `OPACITY_ISI_ZONA` HANYA bila berproperti `zona` DAN zonanya BUKAN "Belum
 * Terpetakan" — dua kekecualian, keduanya karena warna fill fitur itu
 * SENDIRI sudah membawa alpha idle-nya, jadi meredupkannya lagi lewat
 * `fill-opacity` menekannya jauh di bawah idle:
 *
 * 1. Fitur semu "KAWASAN" (tanpa `zona`) — warnanya `WARNA_FALLBACK_IDLE`
 *    (alpha 0.06 dibakar ke warna). Opacity 45% tambahan menekannya jadi
 *    ~0.027 efektif.
 * 2. Belum Terpetakan — sejak ronde 3, `ekspresiWarnaZona` di bawah
 *    memetakannya ke `WARNA_FALLBACK_IDLE` yang SAMA (DESIGN.md § Zone
 *    choropleth: "carries no fill", harus terlihat identik idle). Sebelum
 *    perbaikan ini ia dipetakan ke `WARNA_ZONA["Belum Terpetakan"]` (putih
 *    75% alpha, dimaksud untuk garis putus, BUKAN fill) lalu diredupkan lagi
 *    45% di sini — komposit ≈34%, JAUH lebih terang daripada idle (0.06) dan
 *    lebih terang dari keempat zona asli (45% hue saturasi), sampai nyaris
 *    menelan highlight seleksi putih 10%.
 *
 * Tipe balik `unknown`, di-cast `number` di titik pakai — pola yang sama
 * dengan `ekspresiWarnaZona` di bawah.
 */
export function ekspresiOpacityZona(): unknown {
  return [
    "case",
    ["all", ["has", "zona"], ["!=", ["get", "zona"], "Belum Terpetakan"]],
    OPACITY_ISI_ZONA,
    1,
  ];
}

/** Fallback warna fitur tanpa properti `zona` (fitur semu "KAWASAN") — sama
 * dengan `WARNA_DESA_FILL` idle `shared/hooks/use-map-base.ts` (token
 * DESIGN.md `map-fill-idle`), supaya fitur itu tetap tampil quiet default.
 * Sejak review ronde 3 temuan #1, `ekspresiWarnaZona` di bawah memakai nilai
 * yang SAMA ini untuk fill Belum Terpetakan juga — DESIGN.md § Zone
 * choropleth: Belum Terpetakan "carries no fill", jadi fill-nya harus
 * terlihat IDENTIK idle, bukan seolah zona kelima dengan warnanya sendiri.
 * Diekspor supaya `zona.test.ts` bisa menegakkan kesetaraan ini langsung. */
export const WARNA_FALLBACK_IDLE = "rgba(255,255,255,0.06)";

/**
 * Join atribut `zona` ke FeatureCollection batas desa lewat `iddesa` (string,
 * selalu — PRD `api/` §5). Fitur tanpa baris model (fitur semu "KAWASAN"
 * ber-`iddesa` berakhiran `000`) TIDAK diberi properti `zona` —
 * `ekspresiWarnaZona` di bawah jatuh ke fallback idle untuknya, bukan
 * mewarnainya seolah Belum Terpetakan.
 *
 * Fitur BARU dibangun (`{...fitur, properties: {...}}`) — `geo` sumber TIDAK
 * PERNAH dimutasi, karena objek itu milik cache TanStack Query dan dipakai
 * efek lain (`fitBounds` di `use-map-base.ts` membaca `geo` apa adanya).
 */
export function joinZona(
  geo: GeoJSON.FeatureCollection,
  baris: readonly BarisPetaPeran[],
): GeoJSON.FeatureCollection {
  const zonaPerDesa = new Map<string, NamaZona>(baris.map((b) => [b.iddesa, b.zona]));

  return {
    ...geo,
    features: geo.features.map((fitur) => {
      const iddesa = fitur.properties?.iddesa;
      const zona = typeof iddesa === "string" ? zonaPerDesa.get(iddesa) : undefined;
      if (zona === undefined) return fitur;
      return { ...fitur, properties: { ...fitur.properties, zona } };
    }),
  };
}

/**
 * Ekspresi `match` untuk paint `fill-color` layer `desa-fill` (diteruskan
 * lewat seam `warnaFill` `shared/hooks/use-map-base.ts`) — lima cabang
 * `NamaZona` + fallback `WARNA_FALLBACK_IDLE` untuk fitur tanpa properti
 * `zona`. Tipe balik `unknown` (bukan `ExpressionSpecification`) mengikuti
 * kontrak seam `warnaFill` — pemanggil (`useMapBase`) yang men-cast di
 * titik pakai.
 *
 * Cabang "Belum Terpetakan" memetakan ke `WARNA_FALLBACK_IDLE` — SAMA
 * dengan fallback tanpa properti `zona`, BUKAN `WARNA_ZONA["Belum
 * Terpetakan"]` (review ronde 3 temuan #1). DESIGN.md § Zone choropleth:
 * Belum Terpetakan "carries no fill" — token putih 75% alpha `WARNA_ZONA`
 * itu dimaksud untuk garis putus (`layerZonaBelumLine`), dan memakainya
 * sebagai fill di sini (ditambah `fill-opacity` 45% `ekspresiOpacityZona`)
 * dulu membuatnya komposit ≈34%, paling terang di peta — lihat docstring
 * `ekspresiOpacityZona` untuk rincian.
 */
export function ekspresiWarnaZona(): unknown {
  return [
    "match",
    ["get", "zona"],
    "Zona Pemerintah",
    WARNA_ZONA["Zona Pemerintah"],
    "Zona Mitra",
    WARNA_ZONA["Zona Mitra"],
    "Zona Poros",
    WARNA_ZONA["Zona Poros"],
    "Zona Bantuan",
    WARNA_ZONA["Zona Bantuan"],
    "Belum Terpetakan",
    WARNA_FALLBACK_IDLE,
    WARNA_FALLBACK_IDLE,
  ];
}

/**
 * Garis putus "Belum Terpetakan" — layer TERPISAH karena `line-dasharray`
 * bukan properti data-driven di MapLibre; satu layer ber-`filter` adalah
 * satu-satunya cara memberi satu kategori pola garis sendiri. Dipasang di
 * atas sumber `desa` milik base oleh `usePetaPeranLayers`
 * (`features/peta-peran/hooks/use-map-layers.ts`).
 */
export function layerZonaBelumLine(): unknown {
  return {
    id: LAYER_ZONA_BELUM_LINE,
    type: "line",
    source: SUMBER_DESA,
    filter: ["==", ["get", "zona"], "Belum Terpetakan"],
    paint: {
      "line-color": WARNA_ZONA["Belum Terpetakan"],
      "line-width": 1.5,
      "line-dasharray": [3, 3],
    },
  };
}

/**
 * Garis 2px hue penuh untuk EMPAT zona (bukan Belum Terpetakan) (review H5): DESIGN.md §
 * Zone choropleth menyatakan tiap zona "fills its polygon at 45% opacity …
 * with a 2px stroke in the same hue at full opacity" — sebelum temuan ini
 * hanya isi dan garis putus Belum Terpetakan yang terpasang, jadi prosa
 * DESIGN tidak sesuai kode. `line-color` memakai ekspresi `match` YANG SAMA
 * dengan `fill-color` (`ekspresiWarnaZona`) — nilainya sudah hue penuh (bukan
 * hex ber-alpha), jadi garis ini otomatis "full opacity" tanpa paint
 * tambahan. `filter` MENGECUALIKAN Belum Terpetakan (punya garisnya sendiri,
 * `layerZonaBelumLine`, TANPA isi) dan fitur tanpa properti `zona` (fitur
 * semu "KAWASAN", tetap `map-fill-idle` tanpa garis tepi zona). Dipasang DI
 * BAWAH highlight desa terpilih oleh `usePetaPeranLayers`
 * (`features/peta-peran/hooks/use-map-layers.ts`, review L6) — lihat
 * docstring hook itu untuk urutan tumpukan lengkap.
 */
export function layerZonaLine(): unknown {
  return {
    id: LAYER_ZONA_LINE,
    type: "line",
    source: SUMBER_DESA,
    filter: ["all", ["has", "zona"], ["!=", ["get", "zona"], "Belum Terpetakan"]],
    paint: {
      "line-color": ekspresiWarnaZona(),
      "line-width": 2,
    },
  };
}
