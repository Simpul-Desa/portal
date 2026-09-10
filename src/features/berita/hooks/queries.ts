"use client";

/**
 * Query daftar Berita Desa satu desa. Satu halaman `BATAS_BERITA` diambil
 * sekali; "Tampilkan semua" hanya membuka apa yang sudah ada di cache
 * (keputusan user 10 September 2026) — tidak ada permintaan kedua.
 *
 * `staleTime` BUKAN `STALE_BEKU`: berita berubah saat admin menyegarkan
 * (`POST /api/admin/berita/segarkan`), bukan hanya saat build data baru,
 * jadi menyimpannya selamanya per sesi membuat dasbor menampilkan daftar
 * usang sampai halaman dimuat ulang.
 */

import { useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { beritaDesa, type DataDari } from "@/lib/api/endpoints";

import { BATAS_BERITA } from "../services/berita";

/** Satu berita — baris `data` rute berita, langsung dari skema OpenAPI. */
export type ItemBerita = DataDari<"/api/berita/{iddesa}">[number];

/** Berita boleh basi 5 menit; penyegaran admin jarang dan tidak mendesak. */
const STALE_BERITA_MS = 5 * 60 * 1000;

export function useBerita(iddesa?: string) {
  return useQuery<{ daftar: ItemBerita[]; total: number }, GalatApi>({
    queryKey: ["berita", iddesa],
    queryFn: async () => {
      const respons = await beritaDesa(iddesa as string, { batas: BATAS_BERITA });
      return { daftar: respons.data, total: respons.meta?.total ?? respons.data.length };
    },
    enabled: Boolean(iddesa),
    staleTime: STALE_BERITA_MS,
  });
}
