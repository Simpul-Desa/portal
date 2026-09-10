/**
 * ID sumber dan layer peta BASE `desa`, dipakai lintas lensa dan lintas
 * modul `lib/` (temuan review M8: sebelumnya diduplikasi di tiga tempat —
 * `shared/hooks/use-map-base.ts` sebagai konstanta privat tak diekspor,
 * direplikasi sebagai literal di `features/peta-peran/hooks/use-map-layers.ts`,
 * dan `source: "desa"` inline di `lib/map/zona.ts`). Satu sumber kebenaran
 * di sini, diimpor di ketiga tempat.
 *
 * Arah impor SENGAJA `lib/` murni: modul ini TIDAK mengimpor `shared/` —
 * `use-map-base.ts` (sebuah `shared/` hook) yang mengimpor konstanta dari
 * sini, bukan sebaliknya, supaya `lib/map/zona.ts` (juga `lib/`) bisa
 * memakai ID yang sama tanpa membuka siklus `lib` → `shared/hooks` → `lib`.
 */
import type * as maplibregl from "maplibre-gl";

export const SUMBER_DESA = "desa";
export const LAYER_DESA_FILL = "desa-fill";
export const LAYER_DESA_LINE = "desa-line";
export const LAYER_DESA_TERPILIH_FILL = "desa-terpilih-fill";
export const LAYER_DESA_TERPILIH_LINE = "desa-terpilih-line";

/**
 * Bongkar idempoten: lepas tiap layer di `layerIds` (bila ada), BARU lepas
 * `sourceId` (bila ada) — urutan ini wajib, MapLibre menolak `removeSource`
 * DIAM-DIAM (fire `ErrorEvent`, tidak melempar) selama masih ada layer yang
 * merujuknya; sumber bertahan tanpa layer, rusak sampai reload (kejadian
 * nyatanya didokumentasikan di `shared/hooks/use-map-base.ts`, review temuan
 * #1). Sebelumnya direplikasi VERBATIM di `use-map-base.ts` DAN
 * `features/jalur-ekonomi/hooks/use-map-layers.ts` (review temuan #5) — satu
 * sumber kebenaran di sini, diimpor di keduanya.
 */
export function bersihkanLapisan(
  map: maplibregl.Map,
  layerIds: readonly string[],
  sourceId: string,
): void {
  for (const id of layerIds) {
    if (map.getLayer(id)) map.removeLayer(id);
  }
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}

/**
 * Bongkar `sourceId` beserta SEMUA layer yang merujuknya — apa pun lensa
 * yang memasangnya — bukan daftar ID tetap seperti `bersihkanLapisan` di
 * atas (review ronde 3, temuan #3). `bersihkanLapisan` cocok untuk sumber
 * yang layernya SELALU persis satu daftar tetap (mis. `SUMBER_LINGKARAN`,
 * `SUMBER_JALUR`); `SUMBER_DESA` bukan begitu — base (`use-map-base.ts`)
 * memasang empat layernya sendiri, tetapi lensa Peta Peran menumpuk DUA
 * layer lagi di atasnya (`desa-zona-line`, `desa-zona-belum-line`,
 * `lib/map/zona.ts`) lewat hook TERPISAH (`usePetaPeranLayers`) yang
 * membongkar keduanya lewat cleanup efeknya sendiri.
 *
 * Sebelum fungsi ini ada, `use-map-base.ts` efek 3 memanggil
 * `bersihkanLapisan` dengan daftar EMPAT layer base saja, lalu
 * `removeSource(SUMBER_DESA)` — benar HANYA selama layer zona lensa itu
 * SUDAH lebih dulu dibongkar oleh hook lensa (invariant tak tertulis:
 * `fiturDesa` lensa Peta Peran berubah identitas PERSIS saat efek 3 ini
 * membongkar). Invariant itu patah saat `geoError` berubah jadi `true`
 * sementara `geo` (dependency `useMemo` `fiturDesa`) masih data lama dari
 * sukses sebelumnya — `fiturDesa` TIDAK berubah identitas, hook lensa tidak
 * rerun, layer zonanya tidak sempat lepas, dan `removeSource` di bawah
 * ditolak DIAM-DIAM oleh MapLibre (fire `ErrorEvent`, tidak melempar)
 * selama masih ada layer yang merujuk sumbernya — sumber `desa` bertahan
 * tanpa layer, dan `if (!map.getSource(SUMBER_DESA))` di efek 3 tidak
 * pernah benar lagi untuk sisa sesi.
 *
 * Fungsi ini menghapus dependensi pada invariant itu SAMA SEKALI, bukan
 * memperpanjang daftar tetap dengan ID layer zona (pilihan lain yang
 * disebut temuan): daftar tetap membuat base tahu nama layer milik lensa
 * tertentu (melanggar prinsip "base lintas lensa, nol pengetahuan lensa"
 * yang didokumentasikan `use-map-base.ts`) dan tetap rapuh terhadap lensa
 * BERIKUTNYA yang menumpuk layer baru di `SUMBER_DESA` tanpa mengingat
 * memperbarui daftar ini. Bertanya ke style (`map.getStyle().layers`,
 * disaring `layer.source === sourceId`) benar untuk siapa pun yang
 * menumpuk apa pun di sumber ini, sekarang maupun nanti.
 */
export function bersihkanSumberDanLayerTerkait(map: maplibregl.Map, sourceId: string): void {
  // `?.layers ?? []` (tinjauan pra-commit temuan T15): tipe maplibre-gl 6.8.0
  // menjanjikan `getStyle(): StyleSpecification` non-opsional
  // (`maplibre-gl.d.ts:14351`), tetapi implementasinya
  // `if (this.style) return this.style.serialize();` — mengembalikan
  // `undefined` bila style belum ada (`maplibre-gl-dev.mjs:25726-25728`).
  // Jadi `getStyle().layers` bisa melempar TypeError yang `tsc` TIDAK bisa
  // lihat. Jalur yang benar-benar bisa dicapai tidak ketemu (peta hanya
  // non-null antara `load` dan `remove()`), jadi penjaga ini menutup KELAS
  // cacatnya, bukan cacat terbukti.
  for (const layer of map.getStyle()?.layers ?? []) {
    if ("source" in layer && layer.source === sourceId) map.removeLayer(layer.id);
  }
  if (map.getSource(sourceId)) map.removeSource(sourceId);
}
