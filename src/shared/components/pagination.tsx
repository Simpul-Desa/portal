"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@/shared/components/icons";

import { FOCUS_RING } from "./focus-ring";

type PaginationProps = {
  /** Halaman aktif, 1-based. */
  hal: number;
  /** Cacah total baris dari `meta.total` `api/` — bukan panjang array halaman ini. */
  total: number;
  /** Ukuran halaman (`meta.batas` `api/`). */
  batas: number;
  onHal: (hal: number) => void;
};

const KELAS_TOMBOL =
  `flex size-10 items-center justify-center rounded-full bg-float text-ink shadow-float aria-disabled:opacity-40 aria-disabled:pointer-events-none ${FOCUS_RING}`;

/**
 * Pager `‹ Halaman n dari m ›` (Task 13) — jumlah halaman dihitung dari
 * `total`/`batas` (bookkeeping paginasi, bukan angka domain, jadi TANPA
 * `formatAngka`). Geometri tombol mengikuti `button-icon` DESIGN.md (40px
 * `size-10`, `bg-float`, `shadow-float` — pola tombol "Coba lagi"
 * `kartu-panel.tsx`). Tidak dirender bila hasil hanya muat satu halaman.
 *
 * `aria-disabled` alih-alih `disabled` (Task 19): `disabled` yang menyala
 * pada tombol yang baru saja diaktifkan lewat keyboard melempar fokus ke
 * `<body>` — tombol tetap terfokus, tetap di pohon aksesibilitas, dan
 * handler menjaga sendiri supaya tidak melakukan apa pun saat kondisinya
 * terpenuhi.
 */
export function Pagination({ hal, total, batas, onHal }: PaginationProps) {
  // `Math.max(batas, 1)` (review L5) — `batas` 0 dari `meta` (anomali server)
  // membuat `total / batas` = `Infinity` sebelum sempat dibulatkan; klem di
  // PEMBAGI, bukan hanya di hasil akhirnya.
  const totalHalaman = Math.max(1, Math.ceil(total / Math.max(batas, 1)));
  if (totalHalaman <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => {
          if (hal > 1) onHal(hal - 1);
        }}
        aria-disabled={hal <= 1 || undefined}
        aria-label="Halaman sebelumnya"
        className={KELAS_TOMBOL}
      >
        <ChevronLeftIcon />
      </button>

      <p className="text-micro text-muted">
        Halaman {hal} dari {totalHalaman}
      </p>

      <button
        type="button"
        onClick={() => {
          if (hal < totalHalaman) onHal(hal + 1);
        }}
        aria-disabled={hal >= totalHalaman || undefined}
        aria-label="Halaman berikutnya"
        className={KELAS_TOMBOL}
      >
        <ChevronRightIcon />
      </button>
    </div>
  );
}
