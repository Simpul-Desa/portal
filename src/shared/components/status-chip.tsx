import type { ReactNode } from "react";

export type StatusChipStatus = "positive" | "caution" | "critical" | "muted";

const WARNA_DOT: Record<StatusChipStatus, string> = {
  positive: "bg-positive",
  caution: "bg-caution",
  critical: "bg-critical",
  muted: "bg-muted",
};

/**
 * `status-chip` DESIGN.md: dot 6px + teks `label`. Teks SELALU `ink` — status
 * colors tidak boleh dipakai untuk teks (DESIGN.md § Status colors as text);
 * warna hanya "menumpang" lewat dot. Latar `bg-inset` (bukan `bg-surface`
 * literal DESIGN) karena chip ini selalu dipasang DI DALAM kartu `surface` —
 * satu langkah lebih terang supaya kontras, mengikuti logika tangga yang
 * sama dengan `card-inset` di dalam `card-float`.
 */
export function StatusChip({ status, children }: { status: StatusChipStatus; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-inset px-3 py-1.5 text-label text-ink">
      <span className={`size-1.5 shrink-0 rounded-full ${WARNA_DOT[status]}`} aria-hidden="true" />
      {children}
    </span>
  );
}
