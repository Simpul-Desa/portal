import type { ReactNode } from "react";

/** Baris label→nilai dipakai berulang (Fakta Program, Logistik, mutu_data).
 * Pembungkusnya sendiri yang memberi `divide-y divide-hairline`. */
export function BarisLabelNilai({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2">
      <span className="text-label text-muted">{label}</span>
      <span className="text-right text-body-md text-ink">{children}</span>
    </div>
  );
}
