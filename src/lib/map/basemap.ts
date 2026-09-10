import { setWorkerUrl } from "maplibre-gl";
import type { FitBoundsOptions, LngLatBoundsLike, MapOptions } from "maplibre-gl";

/**
 * URL worker MapLibre HARUS ditunjuk manual di proyek ini. Bawaan v6
 * menurunkannya dari `import.meta.url` modul maplibre lalu membungkusnya
 * blob `import "<url>"` (dist/maplibre-gl-shared: getWorkerUrl) — di bawah
 * Turbopack `import.meta.url` menunjuk URL CHUNK Next, sehingga resolusi
 * `maplibre-gl-worker.mjs` mengarah ke berkas yang tidak pernah dilayani:
 * worker mati saat lahir tanpa satu pun galat di konsol utama, dan SEMUA
 * layer GeoJSON (lingkaran berjenjang, batas desa) tak pernah dirender —
 * basemap raster tetap tampil karena tidak lewat worker. Berkas worker
 * disalin ke `public/` oleh skrip `sync:maplibre-worker` (package.json,
 * dijalankan otomatis `predev`/`prebuild` supaya ikut versi paket).
 */
setWorkerUrl("/maplibre-gl-worker.mjs");

/**
 * Basemap MapLibre dan cakupan peta. Dua style raster inline: Esri World
 * Imagery (satelit, utama) dan OSM (cadangan, dipasang otomatis lewat
 * `map.on('error')` di `map-stage.tsx` bila tile Esri gagal dimuat DAN belum
 * pernah ada tile Esri yang sukses — lihat komentar di `map-stage.tsx`).
 *
 * Tipe style diambil dari `maplibre-gl` sendiri (`MapOptions["style"]`),
 * BUKAN dari `@maplibre/maplibre-gl-style-spec` — paket itu bukan dependensi
 * langsung proyek ini (hanya ketergantungan bayangan lewat `maplibre-gl`),
 * dan `maplibre-gl` sudah mengekspor tipe yang sama.
 */
type GayaPeta = NonNullable<MapOptions["style"]>;

const ATTRIBUSI_ESRI = "Esri, Maxar, Earthstar Geographics, and the GIS User Community";
const ATTRIBUSI_OSM = "© OpenStreetMap contributors";

/**
 * Host glyph MapLibre demo — bebas kunci, cukup untuk label angka fase 1
 * (cacah desa di lingkaran berjenjang, Task 21). Alternatif self-host adalah
 * keputusan nanti, bukan bagian gelombang ini.
 */
const GLYPHS_DEMO = "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf";

/**
 * Basemap satelit utama — fungsi pabrik supaya tiap panggilan (init awal,
 * atau pemasangan ulang setelah fallback) mendapat objek baru, bukan objek
 * bersama yang bisa termutasi MapLibre secara internal. GOTCHA: urutan tile
 * Esri World Imagery adalah `{z}/{y}/{x}` — BUKAN `{z}/{x}/{y}` seperti
 * kebanyakan skema XYZ lain. Menukarnya menghasilkan bumi acak-acakan tanpa
 * satu pun pesan galat. `maxzoom: 19` = level maksimum asli World Imagery;
 * mencegah MapLibre meminta tile z20+ yang selalu 404.
 */
export function buatStyleEsri(): GayaPeta {
  return {
    version: 8,
    sources: {
      esri: {
        type: "raster",
        tiles: [
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        ],
        tileSize: 256,
        maxzoom: 19,
        attribution: ATTRIBUSI_ESRI,
      },
    },
    layers: [{ id: "esri", type: "raster", source: "esri" }],
    glyphs: GLYPHS_DEMO,
  };
}

/** Basemap cadangan — fungsi pabrik (lihat `buatStyleEsri`). OSM memakai urutan `{z}/{x}/{y}` biasa (bukan `{z}/{y}/{x}`). */
export function buatStyleOsm(): GayaPeta {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: ATTRIBUSI_OSM,
      },
    },
    layers: [{ id: "osm", type: "raster", source: "osm" }],
    glyphs: GLYPHS_DEMO,
  };
}

/**
 * Bbox kasar pembungkus lima provinsi percontohan per `data/README.md` §
 * Cakupan: Lampung, Jawa Tengah, NTB, Kalimantan Selatan, Sulawesi Selatan.
 * Satu-satunya sumber cakupan peta — dipakai untuk `bounds` saat init (lihat
 * `map-stage.tsx`) dan untuk tombol locate (fitBounds cakupan penuh), dengan
 * `FIT_OPTIONS` yang sama pada keduanya supaya tidak ada dua nilai cakupan
 * yang bisa saling menyimpang.
 */
export const CAKUPAN_BBOX: LngLatBoundsLike = [
  [103.0, -9.3],
  [122.0, -1.0],
];

/**
 * Padding fitBounds — asimetris: kanan cadangan untuk stack kontrol peta,
 * atas cadangan untuk toolbar (search + tombol), sama dipakai saat init peta
 * (`fitBoundsOptions`) dan tombol locate.
 */
export const FIT_OPTIONS: FitBoundsOptions = {
  padding: { top: 88, right: 96, bottom: 48, left: 24 },
};
