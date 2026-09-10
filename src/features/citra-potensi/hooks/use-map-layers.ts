"use client";

import { useEffect, useMemo } from "react";

import type * as maplibregl from "maplibre-gl";

import { ekspresiOpacityCitra, ekspresiWarnaCitra, joinSkorCitra } from "@/lib/map/citra";
import { LAYER_DESA_FILL } from "@/lib/map/sumber";
import { useGeoDesa } from "@/shared/hooks/queries-wilayah";

import { barisSkor } from "../services/sel";
import { useCitraSel } from "./queries";

/**
 * Dipecah dua persis `features/peta-peran/hooks/use-map-layers.ts`
 * (`usePetaPeranData`/`usePetaPeranLayers`): `useCitraData` — query +
 * `useMemo` SAJA, NOL efek peta, dipanggil shell SEBELUM `useMapBase`.
 * `useCitraLayers` — HANYA efek peta (menyetel/mengembalikan `fill-opacity`
 * layer `desa-fill` milik base), NOL query, dipanggil shell SETELAH
 * `useMapBase`. Lensa ini TIDAK memasang layer baru — hanya menimpa seam
 * `fiturDesa`/`warnaFill` milik base (join skor) dan `fill-opacity` layer
 * yang sudah ada.
 */

type UseCitraDataOpsi = {
  prov?: string;
  kab?: string;
  target?: string;
  /** `true` hanya saat lensa Citra Potensi sedang dirender — query TETAP
   * dipanggil tanpa syarat (Rules of Hooks); `aktif` yang mengontrol
   * `enabled` query dan nilai balik, bukan pemanggilannya. */
  aktif: boolean;
};

type UseCitraDataHasil = {
  /** Diteruskan ke opsi `fiturDesa` `useMapBase` — `null` saat tidak aktif,
   * kabupaten/target belum terisi, atau data belum tiba, supaya base
   * memakai geo apa adanya (idle). */
  fiturDesa: GeoJSON.FeatureCollection | null;
  /** Diteruskan ke opsi `warnaFill` `useMapBase` — ekspresi `interpolate`
   * (`unknown`, lihat `lib/map/citra.ts`), `undefined` saat tidak aktif. */
  warnaFill: unknown;
};

/**
 * Konstanta modul (Task 18 GOTCHA 1, CRITICAL): `ekspresiWarnaCitra()` tidak
 * menerima input — dipanggil SEKALI di sini, bukan tiap render
 * `useCitraData`. Memanggilnya di badan hook membangun ARRAY BARU tiap
 * render; array baru itu adalah dependency BARU bagi efek 3 `useMapBase`,
 * yang memicu `setData` seluruh kabupaten + `fitBounds` ULANG pada setiap
 * render shell, melempar kamera user kembali ke bbox kabupaten (`app/CLAUDE.md` (lokal saja)
 * §10, cacat yang sudah pernah lolos keempat gerbang di fase 3).
 */
const WARNA_FILL_CITRA = ekspresiWarnaCitra();

/** Separuh QUERY — lihat docstring modul di atas. */
export function useCitraData({ prov, kab, target, aktif }: UseCitraDataOpsi): UseCitraDataHasil {
  const { data: geo } = useGeoDesa(kab);
  const { data: detail } = useCitraSel(prov, target, aktif);

  // Memo berlapis (Task 18 GOTCHA 4): `baris` di-memo TERPISAH dari
  // `fiturDesa` supaya identitasnya stabil lintas render selama
  // `detail`/`kab` tidak berganti — tanpa ini, `fiturDesa` berganti
  // identitas tiap render dan GOTCHA 1 kembali lewat pintu lain.
  const baris = useMemo(() => {
    if (!detail || !kab) return [];
    return barisSkor(detail, kab);
  }, [detail, kab]);

  const fiturDesa = useMemo(() => {
    if (!aktif || !kab || !target || !geo) return null;
    return joinSkorCitra(geo, baris);
  }, [aktif, kab, target, geo, baris]);

  const warnaFill = fiturDesa ? WARNA_FILL_CITRA : undefined;

  return { fiturDesa, warnaFill };
}

type UseCitraLayersOpsi = {
  map: maplibregl.Map | null;
  styleVersion: number;
  /** `true` hanya saat lensa Citra Potensi sedang dirender — hook TETAP
   * dipanggil tanpa syarat di `dashboard-shell.tsx` (Rules of Hooks);
   * `aktif` yang mengontrol isi efeknya, bukan pemanggilannya. */
  aktif: boolean;
  /** Hasil `useCitraData` — dipakai untuk menentukan kapan `fill-opacity`
   * diredupkan (hanya bila join skor sudah tersedia). */
  fiturDesa: GeoJSON.FeatureCollection | null;
};

/**
 * Separuh EFEK — lihat docstring modul di atas. Menyetel `fill-opacity`
 * layer `desa-fill` milik base lewat `ekspresiOpacityCitra()` (DESIGN.md §
 * Score choropleth: isi 45% HANYA untuk fitur berproperti `skor100`) dan
 * MENGEMBALIKANNYA ke `1` di cleanup (Task 18 GOTCHA 2) — tanpa itu,
 * berpindah ke lensa lain di kabupaten yang sama meninggalkan batas desa
 * redup separuh.
 *
 * Lensa ini TIDAK memasang layer baru (beda dari `usePetaPeranLayers`),
 * jadi cukup menjaga `getLayer(LAYER_DESA_FILL)` — layer itu dijamin ada
 * begitu `fiturDesa` non-null, karena `useCitraData` dipanggil SEBELUM
 * `useMapBase` dan `useCitraLayers` SESUDAHNYA (Task 18 GOTCHA 3, urutan
 * tumpukan layer `dashboard-shell.tsx` Task 24).
 */
export function useCitraLayers({ map, styleVersion, aktif, fiturDesa }: UseCitraLayersOpsi): void {
  useEffect(() => {
    if (!map) return;
    const petaAktif = map;

    if (!aktif || !fiturDesa) return;
    if (!petaAktif.getLayer(LAYER_DESA_FILL)) return;

    // GOTCHA: `unknown` di-cast ke `number` di sini, sama seperti
    // `warnaFill` di-cast `string` di `use-map-base.ts` — anotasi lebar
    // membuat pengecekan lawan tipe ekspresi MapLibre yang salah.
    petaAktif.setPaintProperty(LAYER_DESA_FILL, "fill-opacity", ekspresiOpacityCitra() as number);

    return () => {
      if (petaAktif.getLayer(LAYER_DESA_FILL)) petaAktif.setPaintProperty(LAYER_DESA_FILL, "fill-opacity", 1);
    };
  }, [map, styleVersion, aktif, fiturDesa]);
}
