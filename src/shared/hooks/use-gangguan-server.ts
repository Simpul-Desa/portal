"use client";

/**
 * Deteksi gangguan SISI SERVER lewat `useRingkasan`/`usePusat`
 * (`queries-wilayah.ts`) — dua query fondasi yang dijalankan SEMUA
 * pengguna termasuk anonim, karena tidak digerbang sesi seperti query
 * peran (`core/sesi.tsx`, `enabled: Boolean(sesi)`). Perbaikan galat diam
 * terlaporkan 10 September 2026: sebelum hook ini, `api/` mati hanya
 * terlihat pengguna yang sudah masuk (lewat `galatPeran`) — pengunjung
 * anonim tidak mendapat satu pemberitahuan pun sementara panel wilayah
 * dan peta gagal memuat.
 *
 * Memanggil `useRingkasan`/`usePusat` DI SINI, terpisah dari pemanggilan
 * lain di pohon komponen (mis. dalam hook layer peta), TIDAK menambah
 * permintaan jaringan: `queryKey`-nya ("wilayah"/"ringkasan",
 * "wilayah"/"pusat") persis sama di semua titik panggil, jadi TanStack
 * Query membagi satu cache/satu fetch in-flight untuk semuanya.
 */

import type { GalatApi } from "@/lib/api/client";
import { adalahGangguanServer } from "@/lib/api/galat-ui";

import { useRingkasan, usePusat } from "./queries-wilayah";

export type GangguanServer = {
  /** Galat gangguan server pertama ditemukan (ringkasan diperiksa lebih dulu). */
  galat: GalatApi;
  /** Memicu ulang KEDUA query fondasi sekaligus. */
  cobaLagi: () => void;
};

/** `null` bila kedua query fondasi sehat, atau galatnya bukan gangguan server (lihat `adalahGangguanServer`). */
export function useGangguanServer(): GangguanServer | null {
  const ringkasan = useRingkasan();
  const pusat = usePusat();

  function cobaLagi(): void {
    void ringkasan.refetch();
    void pusat.refetch();
  }

  const galat = [ringkasan.error, pusat.error].find(
    (kandidat): kandidat is GalatApi => kandidat !== null && adalahGangguanServer(kandidat),
  );

  return galat ? { galat, cobaLagi } : null;
}
