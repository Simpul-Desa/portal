"use client";

/**
 * Hook TanStack Query wilayah/geo/cari (Task 9) — dipindah dari
 * `features/kartu/hooks/queries.ts` APA ADANYA (tanpa perubahan perilaku)
 * karena dipakai ≥2 fitur (PRD app §7: "dipakai dua fitur atau lebih →
 * `shared/`") — lensa Peta Peran dan Jalur Ekonomi butuh query wilayah yang
 * sama seperti lensa Kartu. Semua memanggil `lib/api/endpoints.ts` — tidak
 * ada `fetch` langsung di sini. Dua kelas `staleTime`: data "beku"
 * (`wilayah/*`, geo) hanya berubah saat build data baru di `data/`, jadi
 * disimpan selamanya sampai reload (`Infinity`); hasil cari `staleTime` 5
 * menit karena queryKey-nya beragam per ketikan — menyimpannya selamanya
 * hanya menumpuk cache tanpa guna. `useNilaiTelat` kini tinggal di
 * `shared/hooks/use-nilai-telat.ts` karena dipakai lebih dari satu fitur.
 */

import { useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import {
  type DataDari,
  desaCari,
  geoDesa,
  wilayahDesa,
  wilayahKabupaten,
  wilayahPusat,
  wilayahRingkasan,
} from "@/lib/api/endpoints";
import { useNilaiTelat } from "@/shared/hooks/use-nilai-telat";

/** Data wilayah/kartu/geo hanya berubah saat build data baru — aman disimpan selamanya per sesi. */
export const STALE_BEKU = Number.POSITIVE_INFINITY;
/** Hasil cari boleh sedikit basi; queryKey-nya beragam per ketikan jadi tidak disimpan selamanya. */
const STALE_CARI_MS = 5 * 60 * 1000;
/** Panjang minimum ketikan sebelum pencarian dijalankan. */
const PANJANG_MIN_CARI = 2;

export function useRingkasan() {
  return useQuery<DataDari<"/api/wilayah/ringkasan">, GalatApi>({
    queryKey: ["wilayah", "ringkasan"],
    queryFn: async () => (await wilayahRingkasan()).data,
    staleTime: STALE_BEKU,
  });
}

export function usePusat() {
  return useQuery<DataDari<"/api/wilayah/pusat">, GalatApi>({
    queryKey: ["wilayah", "pusat"],
    queryFn: async () => (await wilayahPusat()).data,
    staleTime: STALE_BEKU,
  });
}

export function useKabupaten(prov?: string) {
  return useQuery<DataDari<"/api/wilayah/kabupaten">, GalatApi>({
    queryKey: ["wilayah", "kabupaten", prov],
    queryFn: async () => (await wilayahKabupaten(prov)).data,
    enabled: Boolean(prov),
    staleTime: STALE_BEKU,
  });
}

/** Sama dengan `BATAS_MAKS` `api/`; cacah desa per kabupaten yang nyata ada
 * di keluaran `data/` (kabupaten terbesar hari ini 494 desa), tidak diulang
 * di sini. */
const BATAS_DESA_KAB = 500;

/**
 * Daftar desa SATU kabupaten PENUH (dipakai daftar berperingkat Citra
 * Potensi, Task 15). Hook ini tidak punya konsumen sebelum fase 5 — bentuk
 * baliknya aman diubah. `lengkap` mengikuti pola
 * `usePetaPeranRingkasanProvinsi`: `total === null` (meta hilang) TIDAK
 * dibaca sebagai "sudah lengkap".
 */
export function useDesa(kab?: string) {
  return useQuery<{ daftar: DataDari<"/api/wilayah/desa">; lengkap: boolean }, GalatApi>({
    queryKey: ["wilayah", "desa", kab],
    queryFn: async () => {
      const respons = await wilayahDesa(kab as string, { batas: BATAS_DESA_KAB });
      const total = respons.meta?.total ?? null;
      return {
        daftar: respons.data,
        lengkap: total !== null && respons.data.length >= total,
      };
    },
    enabled: Boolean(kab),
    staleTime: STALE_BEKU,
  });
}

export function useCariDesa(q: string) {
  const telat = useNilaiTelat(q);
  const siap = telat.trim().length >= PANJANG_MIN_CARI;

  return useQuery<DataDari<"/api/desa/cari">, GalatApi>({
    queryKey: ["cari", telat],
    queryFn: async () => (await desaCari(telat)).data,
    enabled: siap,
    staleTime: STALE_CARI_MS,
  });
}

export function useGeoDesa(idkab?: string) {
  return useQuery<GeoJSON.FeatureCollection, GalatApi>({
    queryKey: ["geo", idkab],
    queryFn: () => geoDesa(idkab as string),
    enabled: Boolean(idkab),
    staleTime: STALE_BEKU,
  });
}
