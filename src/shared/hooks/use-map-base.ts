"use client";

import { useEffect, useRef } from "react";

import type * as maplibregl from "maplibre-gl";

import { CAKUPAN_BBOX, FIT_OPTIONS } from "@/lib/map/basemap";
import { bboxDariFeatureCollection, bboxDariFitur, bboxDariTitik } from "@/lib/map/bounds";
import {
  LAYER_LINGKARAN_CIRCLE,
  LAYER_LINGKARAN_LABEL,
  layerLingkaranCircle,
  layerLingkaranLabel,
  SUMBER_LINGKARAN,
  titikKabupaten,
  titikProvinsi,
} from "@/lib/map/circles";
import {
  bersihkanLapisan,
  bersihkanSumberDanLayerTerkait,
  LAYER_DESA_FILL,
  LAYER_DESA_LINE,
  LAYER_DESA_TERPILIH_FILL,
  LAYER_DESA_TERPILIH_LINE,
  SUMBER_DESA,
} from "@/lib/map/sumber";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useGeoDesa, usePusat } from "./queries-wilayah";

type WilayahState = ReturnType<typeof useWilayahParams>;

type UseMapBaseOpsi = {
  map: maplibregl.Map | null;
  /** Naik tiap `style.load` (termasuk fallback OSM, yang membuang semua
   * source/layer lama) — memaksa efek di bawah memasang ulang lapisan. */
  styleVersion: number;
  wilayah: Pick<WilayahState, "prov" | "kab" | "desa" | "pilihProv" | "pilihKab" | "pilihDesa">;
  /** Menimpa FeatureCollection yang dipublikasikan ke sumber `desa` — lensa
   *  Peta Peran mengirim hasil join zona. Default: geo apa adanya. */
  fiturDesa?: GeoJSON.FeatureCollection | null;
  /** Menimpa paint `fill-color` layer `desa-fill` (ekspresi `match` zona). */
  warnaFill?: unknown;
};

/** Token DESIGN.md § Map Overlays: selected = `map-outline-selected` (#ffffff)
 * + `map-fill-selected` (rgba putih 0.10). Fill+line desa BELUM terpilih
 * memakai `map-outline-idle` (rgba putih 0.4) dan `map-fill-idle` (rgba putih
 * 0.06) — ditambahkan ke DESIGN.md § Map Overlays (review Blok D #18); nilai
 * di sini tetap literal, sama seperti token peta lain yang dipakai `circles.ts`. */
const WARNA_DESA_FILL = "rgba(255,255,255,0.06)";
const WARNA_DESA_LINE = "rgba(255,255,255,0.4)";
const WARNA_DESA_TERPILIH_FILL = "rgba(255,255,255,0.10)";
const WARNA_DESA_TERPILIH_LINE = "#ffffff";

type Filter = NonNullable<Parameters<maplibregl.Map["setFilter"]>[1]>;

function filterDesaTerpilih(desa: string | undefined): Filter {
  return ["==", ["get", "iddesa"], desa ?? ""];
}

/**
 * TANPA anotasi tipe balik eksplisit (`AddLayerObject`) SENGAJA: dua layer
 * highlight di bawah men-spread hasil ini lalu menambah `filter` — `filter`
 * valid untuk varian fill/line tapi TIDAK untuk `BackgroundLayerSpecification`
 * (anggota `AddLayerObject` lain), jadi anotasi lebar di sini membuat
 * pengecekan `{...spread, filter}` gagal (properti "berlebih" menurut
 * anggota union yang salah). Membiarkan TS menyimpulkan tipe literal persis
 * (`type: "fill"|"line"` sempit, bukan union) membuat spread+filter dicek
 * lawan anggota yang benar.
 */
function layerDesaFill(id: string, warna: string) {
  return { id, type: "fill" as const, source: SUMBER_DESA, paint: { "fill-color": warna } };
}

function layerDesaLine(id: string, warna: string, lebar: number) {
  return {
    id,
    type: "line" as const,
    source: SUMBER_DESA,
    paint: { "line-color": warna, "line-width": lebar },
  };
}

/**
 * Pengendali layer peta BASE, dipakai LINTAS LENSA (Task 10 — dipindah dari
 * `features/kartu/hooks/use-map-layers.ts`, semula khusus lensa Kartu):
 * lingkaran berjenjang provinsi→kabupaten, lalu batas desa kabupaten aktif +
 * highlight desa terpilih. Menerima `map` (dari `onMapReady`) dan
 * `styleVersion` (naik tiap `onStyleLoad`, termasuk setelah fallback OSM)
 * dari pemanggil (`dashboard-shell.tsx`) — hook ini TIDAK memanggil
 * `useWilayahParams` sendiri, supaya hook itu tetap satu titik panggil di
 * shell (lihat komentar `dashboard-shell.tsx`); `usePusat`/`useGeoDesa` boleh
 * dipanggil di sini karena keduanya TanStack Query (cache dibagi otomatis,
 * bukan hook state-URL).
 *
 * Dua seam lintas lensa (Task 10): `fiturDesa` menimpa FeatureCollection
 * yang dipasang ke sumber `desa` (lensa Peta Peran mengirim hasil join
 * zona); `warnaFill` menimpa paint `fill-color` layer `desa-fill`. Keduanya
 * opsional dan bawaannya adalah perilaku lensa Kartu apa adanya (geo mentah,
 * warna idle). Seam ketiga (`interaksi`, layer tambahan yang ikut diperiksa
 * klik/hover) DIBUANG (review M9) — dibangun spekulatif tanpa konsumen,
 * dilarang `app/CLAUDE.md` (lokal saja) §2 ("no abstractions for single-use code").
 * Tambahkan kembali hanya saat ada lensa yang benar-benar butuh menangkap
 * klik pada layer miliknya sendiri.
 *
 * URUTAN PEMANGGILAN HOOK = URUTAN TUMPUKAN LAYER. `useMapBase` WAJIB
 * dipanggil SEBELUM hook layer lensa (`usePetaPeranLayers`, `useJalurLayers`,
 * dst.) di `dashboard-shell.tsx` — layer yang ditambahkan lensa (garis jalur,
 * garis putus Belum Terpetakan) baru bisa berada DI ATAS `desa-fill` bila
 * base memasangnya lebih dulu.
 *
 * Empat efek terpisah:
 * 1. Interaksi (klik + hover) — daftar SEKALI per `map`, query layer yang
 *    SEDANG ADA saat event (bukan listener per-layer) supaya tidak perlu
 *    daftar ulang tiap kali lapisan lepas-pasang (idempoten, tanpa
 *    listener menumpuk). Daftar layer yang diperiksa = dua layer base
 *    (`LAYER_LINGKARAN_CIRCLE`, `LAYER_DESA_FILL`); `queryRenderedFeatures`
 *    mengembalikan fitur urut render (paling atas dulu), jadi `[0]` sudah
 *    menghormati tumpukan visual.
 * 2. Mode lingkaran (tanpa `kab`, ATAU `kab` terisi tapi `useGeoDesa` GALAT —
 *    review Blok D #20) — pasang/bongkar + fitBounds saat tingkat berubah;
 *    `setData` saja saat provinsi aktif berganti tapi tingkat tetap sama.
 *    Provinsi yang tak dikenal di `pusat` (kode salah/asing) turun ke
 *    tingkat provinsi (5 titik), bukan kabupaten kosong — supaya kombinasi
 *    "batas desa gagal dimuat" + "prov tak dikenal" tidak pernah berakhir di
 *    peta yang benar-benar kosong bisu.
 * 3. Mode desa (`kab` terisi DAN `useGeoDesa` SUKSES) — pasang/bongkar batas;
 *    saat galat, batas dibongkar dan tampilan diserahkan ke efek 2 (panel
 *    kiri yang sudah menampilkan keterangan galat — efek ini tidak
 *    menyentuhnya). Bongkar (baik cabang galat di atas maupun mode
 *    lingkaran) memakai `bersihkanSumberDanLayerTerkait` (`lib/map/sumber.ts`,
 *    review ronde 3 #3) — BUKAN daftar ID layer tetap — supaya layer yang
 *    ditumpuk hook lensa di atas `SUMBER_DESA` (mis. garis zona Peta Peran)
 *    ikut lepas tanpa base perlu tahu namanya, dan tanpa bergantung pada
 *    hook lensa itu sudah membongkar duluan. Sumber dipublikasikan dengan
 *    `fiturDesa ?? geo` dan
 *    `fill-color` dengan `warnaFill ?? WARNA_DESA_FILL` (di-cast ke `string`
 *    di titik pakai — lihat GOTCHA di bawah); saat sumbernya SUDAH ada,
 *    `setData` DAN `setPaintProperty` sama-sama dijalankan supaya berganti
 *    lensa (mis. Kartu → Peta Peran) di kabupaten yang sama langsung
 *    mewarnai ulang tanpa memasang ulang source/layer. `fitBounds` dihitung
 *    dari `geo` apa adanya, BUKAN `fiturDesa` (bbox kabupaten tidak boleh
 *    bergeser hanya karena atributnya di-join) — dan HANYA dipanggil saat
 *    `kab` benar-benar berganti dari nilai terakhir yang di-fit (`kabFitRef`,
 *    review temuan #2). Efek ini refire tiap kali `fiturDesa`/`warnaFill`
 *    berganti identitas (berganti lensa TANPA berganti kabupaten); tanpa
 *    penjaga `kabFitRef` di sini, kamera user terlempar kembali ke bbox
 *    kabupaten pada SETIAP pergantian lensa, termasuk balik ke Kartu.
 *    `kabFitRef` direset ke `undefined` saat `kab` kosong/galat, supaya
 *    memilih ULANG kabupaten yang sama setelah sempat dilepas (mode
 *    lingkaran menggeser kamera di antaranya) tetap memicu fit baru.
 * 4. Filter highlight desa terpilih — `setFilter` saja, tanpa bongkar-pasang
 *    atau fitBounds (memilih desa lain, ATAU berganti lensa, di kabupaten
 *    yang sama tidak menggeser kamera — janji yang sama, dijaga efek 3 dan
 *    efek 4 masing-masing untuk sebab pergantiannya sendiri).
 *
 * GOTCHA `warnaFill`: diketik `unknown` (bukan `ExpressionSpecification`) dan
 * di-cast ke `string` di titik pakai (dalam efek 3) — alasannya sama dengan
 * yang sudah didokumentasikan di `layerDesaFill` di atas: anotasi tipe lebar
 * di sini membuat pengecekan lawan anggota union MapLibre yang salah.
 *
 * GOTCHA pemanggil: `fiturDesa` yang dibangun ulang setiap render memicu
 * `setData` tiap render (deps efek 3 memuat identitasnya). Pemanggil WAJIB
 * me-memo-nya (`useMemo` berkunci input aslinya, mis. `[geo, baris]`).
 */
export function useMapBase({
  map,
  styleVersion,
  wilayah,
  fiturDesa,
  warnaFill,
}: UseMapBaseOpsi): void {
  const { prov, kab, desa } = wilayah;
  const { data: pusat } = usePusat();
  const { data: geo, isError: geoError } = useGeoDesa(kab);

  const provRef = useRef(prov);
  const desaRef = useRef(desa);
  const pilihProvRef = useRef(wilayah.pilihProv);
  const pilihKabRef = useRef(wilayah.pilihKab);
  const pilihDesaRef = useRef(wilayah.pilihDesa);
  useEffect(() => {
    provRef.current = prov;
    desaRef.current = desa;
    pilihProvRef.current = wilayah.pilihProv;
    pilihKabRef.current = wilayah.pilihKab;
    pilihDesaRef.current = wilayah.pilihDesa;
  });

  const modeLingkaranRef = useRef<"provinsi" | "kabupaten" | null>(null);
  /** Kabupaten terakhir yang kamera-nya di-fit di efek 3 di bawah — review
   * temuan #2. `undefined` berarti "belum pernah di-fit" ATAU "baru saja
   * dilepas" (`kab` kosong/galat mereset ini), sehingga memilih ulang
   * kabupaten yang sama tetap memicu fit baru. */
  const kabFitRef = useRef<string | undefined>(undefined);
  const desaFitRef = useRef<string | undefined>(undefined);

  // Efek 1: interaksi (klik + hover), didaftar sekali per instance `map`.
  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    function layerInteraktifHadir(): string[] {
      return [LAYER_LINGKARAN_CIRCLE, LAYER_DESA_FILL].filter((id) => petaAktif.getLayer(id));
    }

    function handleClick(e: maplibregl.MapMouseEvent) {
      const layers = layerInteraktifHadir();
      if (layers.length === 0) return;
      const fitur = petaAktif.queryRenderedFeatures(e.point, { layers })[0];
      if (!fitur) return;

      if (fitur.layer.id === LAYER_LINGKARAN_CIRCLE) {
        const id = fitur.properties?.id;
        if (typeof id !== "string") return;
        if (provRef.current) pilihKabRef.current(id);
        else pilihProvRef.current(id);
        return;
      }

      if (fitur.layer.id === LAYER_DESA_FILL) {
        const iddesa = fitur.properties?.iddesa;
        if (typeof iddesa === "string") pilihDesaRef.current(iddesa);
      }
    }

    function handleMouseMove(e: maplibregl.MapMouseEvent) {
      const layers = layerInteraktifHadir();
      const diAtasLayer =
        layers.length > 0 && petaAktif.queryRenderedFeatures(e.point, { layers }).length > 0;
      petaAktif.getCanvas().style.cursor = diAtasLayer ? "pointer" : "";
    }

    petaAktif.on("click", handleClick);
    petaAktif.on("mousemove", handleMouseMove);
    return () => {
      petaAktif.off("click", handleClick);
      petaAktif.off("mousemove", handleMouseMove);
    };
  }, [map]);

  // Efek 2: mode lingkaran (tanpa `kab`, atau fallback saat `useGeoDesa` galat).
  useEffect(() => {
    if (!map) return;

    const tampilkanLingkaran = !kab || geoError;
    if (!tampilkanLingkaran) {
      bersihkanLapisan(map, [LAYER_LINGKARAN_CIRCLE, LAYER_LINGKARAN_LABEL], SUMBER_LINGKARAN);
      modeLingkaranRef.current = null;
      return;
    }
    if (!pusat) return;

    // `provDikenal` adalah `prov` itu sendiri (bukan boolean terpisah) SUPAYA
    // TypeScript menyempitkan `string | undefined` → `string` di titik pakai
    // di bawah, dan supaya prov yang tak ada di `pusat.provinsi` (kode
    // salah/asing) turun ke mode provinsi alih-alih kabupaten kosong.
    const provDikenal = prov && pusat.provinsi.some((p) => p.idprov === prov) ? prov : undefined;
    const mode = provDikenal ? "kabupaten" : "provinsi";
    const fc = provDikenal ? titikKabupaten(pusat, provDikenal) : titikProvinsi(pusat);
    const perluBuatUlang = mode !== modeLingkaranRef.current || !map.getSource(SUMBER_LINGKARAN);

    if (perluBuatUlang) {
      bersihkanLapisan(map, [LAYER_LINGKARAN_CIRCLE, LAYER_LINGKARAN_LABEL], SUMBER_LINGKARAN);
      map.addSource(SUMBER_LINGKARAN, { type: "geojson", data: fc });
      map.addLayer(layerLingkaranCircle(mode));
      map.addLayer(layerLingkaranLabel());
      modeLingkaranRef.current = mode;
    } else {
      const sumber = map.getSource(SUMBER_LINGKARAN) as maplibregl.GeoJSONSource;
      sumber.setData(fc);
    }

    if (provDikenal) {
      const titikKab = pusat.kabupaten.filter((k) => k.idprov === provDikenal).map((k) => k.pusat);
      const bbox = bboxDariTitik(titikKab);
      if (bbox) map.fitBounds(bbox, FIT_OPTIONS);
    } else {
      map.fitBounds(CAKUPAN_BBOX, FIT_OPTIONS);
    }
  }, [map, styleVersion, prov, kab, pusat, geoError]);

  // Efek 3: mode desa (`kab` terisi DAN `useGeoDesa` sukses) — batas + highlight awal.
  useEffect(() => {
    if (!map) return;

    if (!kab || geoError) {
      // `bersihkanSumberDanLayerTerkait` (BUKAN `bersihkanLapisan` dengan
      // daftar tetap, review ronde 3 temuan #3) — sumber `desa` bisa membawa
      // layer TAMBAHAN yang dipasang hook lensa (mis. `desa-zona-line`/
      // `desa-zona-belum-line` milik Peta Peran, `lib/map/zona.ts`), dan
      // hook lensa itu tidak DIJAMIN sudah membongkarnya sendiri di sini —
      // lihat docstring fungsi ini di `lib/map/sumber.ts` untuk skenario
      // patahnya invariant lama. Bertanya ke style yang layer mana yang
      // benar-benar merujuk `SUMBER_DESA` menghapus dependensi pada urutan
      // efek lintas hook itu sama sekali.
      bersihkanSumberDanLayerTerkait(map, SUMBER_DESA);
      kabFitRef.current = undefined;
      desaFitRef.current = undefined;
      return;
    }
    if (!geo) return;

    const dataDesa = fiturDesa ?? geo;
    // GOTCHA: `unknown` di-cast ke `string` di sini, bukan diketik lawan tipe
    // ekspresi MapLibre — lihat docstring hook di atas.
    const warnaDesaFill = (warnaFill ?? WARNA_DESA_FILL) as string;

    if (!map.getSource(SUMBER_DESA)) {
      map.addSource(SUMBER_DESA, { type: "geojson", data: dataDesa });
      map.addLayer(layerDesaFill(LAYER_DESA_FILL, warnaDesaFill));
      map.addLayer(layerDesaLine(LAYER_DESA_LINE, WARNA_DESA_LINE, 1));
      map.addLayer({
        ...layerDesaFill(LAYER_DESA_TERPILIH_FILL, WARNA_DESA_TERPILIH_FILL),
        filter: filterDesaTerpilih(desaRef.current),
      });
      map.addLayer({
        ...layerDesaLine(LAYER_DESA_TERPILIH_LINE, WARNA_DESA_TERPILIH_LINE, 2),
        filter: filterDesaTerpilih(desaRef.current),
      });
    } else {
      const sumber = map.getSource(SUMBER_DESA) as maplibregl.GeoJSONSource;
      sumber.setData(dataDesa);
      // Berganti lensa di kabupaten yang sama tidak memasang ulang source —
      // paint `fill-color` harus ikut diperbarui di sini, bukan hanya datanya.
      if (map.getLayer(LAYER_DESA_FILL)) {
        map.setPaintProperty(LAYER_DESA_FILL, "fill-color", warnaDesaFill);
      }
    }

    // Hanya fit saat KABUPATEN benar-benar berganti (review temuan #2) —
    // efek ini refire juga saat `fiturDesa`/`warnaFill` berganti identitas
    // (berganti lensa di kabupaten yang sama), dan kamera user tidak boleh
    // terlempar kembali ke bbox kabupaten karena itu. Bila ada `desa` yang
    // sedang dipilih, lewati fit kabupaten agar kamera langsung terbang ke desa.
    if (kab !== kabFitRef.current) {
      if (!desa) {
        const bbox = bboxDariFeatureCollection(geo);
        if (bbox) map.fitBounds(bbox, FIT_OPTIONS);
      }
      kabFitRef.current = kab;
    }
  }, [map, styleVersion, kab, geo, geoError, fiturDesa, warnaFill, desa]);

  // Efek 4: filter highlight & auto-zoom/flyTo ke desa terpilih saat dipilih via search, filter, atau klik peta.
  useEffect(() => {
    if (!map) return;
    const filter = filterDesaTerpilih(desa);
    if (map.getLayer(LAYER_DESA_TERPILIH_FILL)) map.setFilter(LAYER_DESA_TERPILIH_FILL, filter);
    if (map.getLayer(LAYER_DESA_TERPILIH_LINE)) map.setFilter(LAYER_DESA_TERPILIH_LINE, filter);

    if (!desa) {
      desaFitRef.current = undefined;
      return;
    }

    if (desa === desaFitRef.current) return;

    const dataDesa = fiturDesa ?? geo;
    if (!dataDesa) return;

    const fitur = dataDesa.features.find((f) => f.properties?.iddesa === desa);
    if (!fitur) return;

    const bbox = bboxDariFitur(fitur);
    if (bbox) {
      map.fitBounds(bbox, {
        padding: { top: 120, right: 96, bottom: 60, left: 60 },
        maxZoom: 15,
        duration: 1400,
      });
      desaFitRef.current = desa;
    }
  }, [map, styleVersion, desa, geo, fiturDesa]);
}
