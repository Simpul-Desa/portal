"use client";

import { FOCUS_RING } from "@/shared/components/focus-ring";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

/**
 * Error boundary rute akar (konvensi App Router — wajib Client Component).
 * Tidak mencatat `error` ke mana pun: proyek belum punya infrastruktur
 * logging (YAGNI), dan `console.*` di kode produksi dilarang aturan proyek.
 */
export default function Error({ reset }: ErrorPageProps) {
  return (
    <div className="flex h-dvh items-center justify-center bg-canvas p-6">
      <div className="max-w-sm rounded-card bg-surface p-5 text-center">
        <p className="text-title-md text-ink">Halaman gagal dimuat</p>
        <p className="mt-3 text-body-md text-body">
          Muat ulang untuk mencoba lagi. Kalau masih gagal, coba beberapa saat lagi.
        </p>
        <button
          type="button"
          onClick={reset}
          className={`mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-[18px] font-medium text-body-md text-ink ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}
