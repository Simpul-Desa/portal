"use client";

import { EmptyState as SharedEmptyState } from "@/shared/components/empty-state";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

type WilayahState = ReturnType<typeof useWilayahParams>;

type EmptyStateProps = {
  wilayah?: Pick<WilayahState, "prov" | "kab" | "pilihProv" | "pilihKab" | "reset">;
};

/**
 * Keadaan tanpa desa terpilih (Task 25): panduan tengah agar pengguna
 * memilih desa di peta atau kolom pencarian terlebih dahulu.
 */
export function EmptyState({}: EmptyStateProps = {}) {
  return (
    <SharedEmptyState pesan="Pilih desa di peta atau kolom pencarian terlebih dahulu" />
  );
}
