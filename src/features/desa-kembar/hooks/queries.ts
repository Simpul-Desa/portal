"use client";

/**
 * Hook TanStack Query lensa Desa Kembar (Task 7). Satu-satunya query milik
 * lensa ini sendiri — Kartu Ekonomi Desa kedua desa (acuan + kembar) dipakai
 * lewat `useKartu` yang SUDAH ADA (`features/kartu/hooks/queries.ts`), cache
 * dibagi lintas lensa (`queryKey: ["kartu", iddesa]`).
 */

import { useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { type DataDari, modelDesaKembar } from "@/lib/api/endpoints";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

/** Tanpa `placeholderData` — daftar 12 baris tidak berpaginasi, jadi alasan
 * `keepPreviousData` (fokus keyboard hilang saat pager unmount) tidak
 * berlaku di sini. */
export function useDesaKembar(iddesa: string | undefined, aktif: boolean) {
  return useQuery<DataDari<"/api/model/desa-kembar/{iddesa}">, GalatApi>({
    queryKey: ["desa-kembar", iddesa],
    queryFn: async () => (await modelDesaKembar(iddesa as string)).data,
    enabled: aktif && Boolean(iddesa),
    staleTime: STALE_BEKU,
  });
}
