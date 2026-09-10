"use client";

/**
 * Unduh PDF Laporan Desa. `useMutation`, BUKAN `useQuery`: merakit PDF
 * membebani server tiap panggilan (tanpa cache, PRD `api/` §5) dan menulis
 * berkas ke disk pengguna — dua efek yang TIDAK boleh terjadi karena
 * refetch fokus-tab atau invalidasi cache. Mutation tidak pernah berjalan
 * sendiri.
 */

import { useMutation } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { laporanDesa } from "@/lib/api/endpoints";

import { namaLaporan, simpanBerkas } from "../services/unduh";

export function useUnduhLaporan() {
  const mutation = useMutation<void, GalatApi, string>({
    mutationFn: async (iddesa) => {
      const blob = await laporanDesa(iddesa);
      simpanBerkas(blob, namaLaporan(iddesa));
    },
    retry: false,
  });

  return {
    unduh: mutation.mutate,
    sedangMenyusun: mutation.isPending,
    galat: mutation.error,
  };
}
