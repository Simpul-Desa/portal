"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";

export type EmptyStateProps = {
  /** Pesan panduan memilih wilayah. */
  pesan?: string;
  children?: ReactNode;
  className?: string;
};

/**
 * Komponen shared keadaan kosong / ajakan memilih wilayah (panduan tengah).
 * Menampilkan ikon informasi dan teks petunjuk agar pengguna memilih wilayah
 * melalui peta atau kolom pencarian.
 */
export function EmptyState({ pesan, children, className = "" }: EmptyStateProps) {
  return (
    <section
      className={`flex min-h-[360px] flex-col items-center justify-center rounded-card bg-surface p-12 text-center ${className}`.trim()}
    >
      <div className="mb-1 flex size-12 items-center justify-center rounded-full bg-inset text-muted">
        <Info className="size-7 text-muted" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <p className="max-w-[280px] text-body-md text-ink leading-relaxed font-normal">
        {pesan ?? children}
      </p>
    </section>
  );
}
