"use client";

/**
 * Hook TanStack Query lensa Citra Potensi Desa (Task 16). Semua memanggil
 * `lib/api/endpoints.ts` — tidak ada `fetch` langsung di sini. `staleTime:
 * STALE_BEKU` di kedua hook (data model hanya berubah saat build data baru
 * di `data/`, sel ±100 KB per (prov, target) jadi diambil sekali per sesi).
 */

import { useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { modelCitraDaftar, modelCitraSel } from "@/lib/api/endpoints";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

import type { SelCitra, SelCitraDetail } from "../types";

/** Halaman ukuran ini cukup untuk provinsi mana pun hari ini (≤18 sel per
 * provinsi, 57 sel LAYAK total) — `lengkap` tetap dihitung dari `meta.total`
 * (pola `usePetaPeranRingkasanProvinsi`) supaya pemotongan diam-diam
 * mustahil bila katalog bertambah. */
const BATAS_SEL = 50;

/** Daftar metadata sel SATU provinsi. `prov` diturunkan `parseWilayahParams`
 * dari `kab`/`desa` — hook ini tidak perlu menurunkannya sendiri. */
export function useCitraDaftar(prov: string | undefined, aktif: boolean) {
  return useQuery<{ daftar: SelCitra[]; lengkap: boolean }, GalatApi>({
    queryKey: ["citra-potensi", "daftar", prov],
    queryFn: async () => {
      const respons = await modelCitraDaftar({ prov, batas: BATAS_SEL });
      const total = respons.meta?.total ?? null;
      return {
        daftar: respons.data,
        lengkap: total !== null && respons.data.length >= total,
      };
    },
    enabled: aktif && Boolean(prov),
    staleTime: STALE_BEKU,
  });
}

/** Metadata + skor SATU sel (provinsi × komoditas). Dipanggil dua tempat —
 * `useCitraData` (peta) dan `CitraPotensiPanel` (badan panel) — `queryKey`
 * yang sama membuat keduanya berbagi cache, bukan permintaan ganda. */
export function useCitraSel(prov: string | undefined, target: string | undefined, aktif: boolean) {
  return useQuery<SelCitraDetail, GalatApi>({
    queryKey: ["citra-potensi", "sel", prov, target],
    queryFn: async () => (await modelCitraSel(prov as string, target as string)).data,
    enabled: aktif && Boolean(prov) && Boolean(target),
    staleTime: STALE_BEKU,
  });
}
