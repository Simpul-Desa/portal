"use client";

import type { ReactNode } from "react";

import { formatAngka } from "@/shared/format";

import { FOCUS_RING } from "./focus-ring";

type ChipFilterProps = {
  aktif: boolean;
  onKlik: () => void;
  /** Kelas Tailwind warna dot (mis. `bg-map-zona-mitra`) — TIDAK diisi bila
   * chip ini tidak merangkap legenda kategori (pola `WARNA_DOT` di
   * `status-chip.tsx`, chip ini bukan kelas record karena kategorinya
   * ditentukan pemanggil, bukan set tetap). */
  warnaDot?: string;
  /** Cacah tampil lewat `formatAngka` bila diisi; `undefined` = tanpa cacah
   * (bukan nol — cacah selalu dari respons ringkasan `api/`, tidak pernah
   * dihitung dari panjang array). */
  cacah?: number;
  children: ReactNode;
};

/**
 * `chip-filter` DESIGN.md § Form Controls (9 September 2026) — chip
 * single-select yang bisa merangkap legenda: dot warna kategori (opsional)
 * + cacah. Aktif ditandai `primary-soft` + `ink` — sebuah TINT, BUKAN
 * `primary` sendiri, supaya anggaran satu aksi utama per layar (DESIGN.md
 * § "Orange is a budget") tidak tersentuh. `aria-pressed` (toggle), BUKAN
 * `aria-current` — chip ini adalah filter, bukan navigasi konteks.
 *
 * Mirip `CHIP STATUS` (`status-chip.tsx`): teks selalu warna netral (`body`
 * saat lepas, `ink` saat aktif), warna kategori hanya "menumpang" lewat dot.
 */
export function ChipFilter({ aktif, onKlik, warnaDot, cacah, children }: ChipFilterProps) {
  return (
    <button
      type="button"
      onClick={onKlik}
      aria-pressed={aktif}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-label ${
        aktif ? "bg-primary-soft text-ink" : "bg-inset text-body"
      } ${FOCUS_RING}`}
    >
      {warnaDot && (
        <span className={`size-1.5 shrink-0 rounded-full ${warnaDot}`} aria-hidden="true" />
      )}
      <span>{children}</span>
      {cacah !== undefined && (
        <span className={`text-micro ${aktif ? "text-ink" : "text-muted"}`}>
          {formatAngka(cacah)}
        </span>
      )}
    </button>
  );
}

type ChipFilterGroupProps = {
  /** WAJIB — satu kelompok chip tanpa label tidak bisa diumumkan pembaca
   * layar sebagai satu unit (mis. "Filter zona penanganan"). */
  ariaLabel: string;
  children: ReactNode;
};

/** Wadah kelompok `ChipFilter` — `role="group"`, urutan chip = urutan DOM. */
export function ChipFilterGroup({ ariaLabel, children }: ChipFilterGroupProps) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {children}
    </div>
  );
}
