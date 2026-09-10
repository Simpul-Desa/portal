"use client";

/**
 * Data hook lensa Jalur Ekonomi TANPA satu pun efek peta (kontrak orkestrator
 * Blok D1, rencana `fase-3-4-peta-peran-jalur-ekonomi.plan.md` Task 30): query
 * wilayah + query detail + normalisasi + bangun dua FeatureCollection, semua
 * murni. Task 30 (`use-map-layers.ts`, agen lain) memanggil hook ini lalu
 * HANYA memasang/membongkar layer dari hasilnya — pemisahan ini menghindari
 * konflik dengan Task 15: `useJalurLayers` tidak bisa sekaligus memanggil
 * `useMapBase` sendiri DAN dipanggil setelah `useMapBase` di
 * `dashboard-shell.tsx` (urutan pemanggilan hook = urutan tumpukan layer,
 * `use-map-base.ts` docstring).
 */

import { useMemo } from "react";

import type { GalatApi } from "@/lib/api/client";
import { garisJalur, indeksPusat, type PropertiTitikJalur, titikJalur } from "@/lib/map/jalur";
import type { Varian } from "@/lib/url-state";
import { useGeoDesa } from "@/shared/hooks/queries-wilayah";

import { normalisasiJalur } from "../services/normalisasi";
import type { JalurTernormalisasi } from "../types";
import { useJalurDetail } from "./queries";

type UseJalurDataOpsi = {
  kab?: string;
  varian: Varian;
  idJalur?: string;
  /** `true` hanya saat lensa Jalur Ekonomi sedang dirender — hook TETAP
   * dipanggil tanpa syarat di `dashboard-shell.tsx` (Rules of Hooks);
   * `aktif` mengontrol isi query-nya (`useJalurDetail`) lewat `enabled`. */
  aktif: boolean;
};

type UseJalurDataHasil = {
  fcGaris: GeoJSON.FeatureCollection<GeoJSON.LineString>;
  fcTitik: GeoJSON.FeatureCollection<GeoJSON.Point, PropertiTitikJalur>;
  n_tanpa_koordinat: number;
  /** `true` HANYA bila Desa Poros sendiri tanpa koordinat (bendera dari
   * `garisJalur`) — panel (review Jalur Ekonomi #2) memakainya untuk
   * membedakan "seluruh jalur tidak tergambar" dari "sebagian anggota
   * hilang". `false` juga saat `jalur`/`geo` belum ada (fallback aman,
   * bukan klaim poros hilang). */
  porosTanpaKoordinat: boolean;
  /** Grup ternormalisasi, atau `null` bila belum ada `idJalur`, belum
   * termuat, atau lensa tidak aktif. */
  jalur: JalurTernormalisasi | null;
  /** Status `useJalurDetail` diteruskan apa adanya (temuan review Jalur
   * Ekonomi #3, HIGH) — sebelumnya dibuang di sini, sehingga `?jalur=` yang
   * mati (404) membuat `jalur` tetap `null` tanpa cara bagi panel membedakan
   * itu dari "belum ada jalur dipilih". Panel (`panel.tsx`) memakai ini
   * untuk merender skeleton/baris galat ringkas persis pola `detail.isLoading`/
   * `detail.isError` di `PetaPeranPanel`. */
  isLoadingJalur: boolean;
  isErrorJalur: boolean;
  errorJalur: GalatApi | null;
  /** `detail.isPaused` diteruskan apa adanya (paritas dengan
   * `isLoadingJalur`/`isErrorJalur` di atas) — fetch `?jalur=` yang dimulai
   * saat offline masuk `fetchStatus: "paused"` (`networkMode: "online"`
   * bawaan TanStack Query, lihat `shared/components/keadaan.ts`), bukan
   * `isLoading` maupun `isError`. Panel (`panel.tsx`) memakai ini lewat
   * `pilihKeadaan` supaya baris detail sekunder ikut dapat cabang
   * "tertunda", bukan diam bisu. */
  isPausedJalur: boolean;
};

/** Referensi stabil (bukan dibangun ulang tiap render) supaya konsumen yang
 * meng-`useEffect`-kan hasil hook ini (Task 30) tidak memicu `setData`
 * berulang saat belum ada jalur terpilih. */
const FC_GARIS_KOSONG: GeoJSON.FeatureCollection<GeoJSON.LineString> = { type: "FeatureCollection", features: [] };
const FC_TITIK_KOSONG: GeoJSON.FeatureCollection<GeoJSON.Point, PropertiTitikJalur> = {
  type: "FeatureCollection",
  features: [],
};

/**
 * `{fcGaris, fcTitik, n_tanpa_koordinat, porosTanpaKoordinat, jalur,
 * isLoadingJalur, isErrorJalur, errorJalur}` untuk lensa Jalur Ekonomi.
 * `useGeoDesa(kab)` dipanggil TANPA menunggu `aktif` — sumber yang sama
 * sudah diambil `useMapBase` untuk batas desa dasar, jadi ini hanya berbagi
 * cache TanStack Query yang sama (query key `["geo", kab]`), bukan
 * permintaan tambahan. `jalur` sendiri sudah `null` saat `aktif` false
 * (karena `useJalurDetail` di bawah menonaktifkan query-nya lewat `aktif`),
 * sehingga `fcGaris`/`fcTitik` otomatis jatuh ke konstanta kosong.
 */
export function useJalurData({ kab, varian, idJalur, aktif }: UseJalurDataOpsi): UseJalurDataHasil {
  const geo = useGeoDesa(kab);
  const detail = useJalurDetail({ varian, idJalur, aktif });

  const jalur = useMemo<JalurTernormalisasi | null>(
    () => (detail.data ? normalisasiJalur(varian, detail.data) : null),
    [varian, detail.data],
  );

  const hasilPeta = useMemo(() => {
    if (!jalur || !geo.data) {
      return {
        fcGaris: FC_GARIS_KOSONG,
        fcTitik: FC_TITIK_KOSONG,
        n_tanpa_koordinat: 0,
        porosTanpaKoordinat: false,
        jalur,
      };
    }

    const pusat = indeksPusat(geo.data);
    const { fc: fcGaris, n_tanpa_koordinat, porosTanpaKoordinat } = garisJalur(jalur, pusat);
    const fcTitik = titikJalur(jalur, pusat);
    return { fcGaris, fcTitik, n_tanpa_koordinat, porosTanpaKoordinat, jalur };
  }, [jalur, geo.data]);

  return {
    ...hasilPeta,
    isLoadingJalur: detail.isLoading,
    isErrorJalur: detail.isError,
    errorJalur: detail.error ?? null,
    isPausedJalur: detail.isPaused,
  };
}
