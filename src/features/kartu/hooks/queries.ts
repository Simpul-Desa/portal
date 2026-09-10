"use client";

/**
 * Hook TanStack Query lensa Kartu Ekonomi Desa. Semua memanggil
 * `lib/api/endpoints.ts` — tidak ada `fetch` langsung di sini. Query
 * wilayah/geo/cari yang dipakai lebih dari satu fitur sudah pindah ke
 * `shared/hooks/queries-wilayah.ts` (Task 9); berkas ini menyisakan
 * `useKartu` — satu-satunya query yang murni milik lensa Kartu.
 */

import { useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { type DataDari, modelKartu } from "@/lib/api/endpoints";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

export function useKartu(iddesa?: string) {
  return useQuery<DataDari<"/api/model/kartu/{iddesa}">, GalatApi>({
    queryKey: ["kartu", iddesa],
    queryFn: async () => (await modelKartu(iddesa as string)).data,
    enabled: Boolean(iddesa),
    staleTime: STALE_BEKU,
  });
}
