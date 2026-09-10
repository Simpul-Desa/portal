"use client";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import "./globals.css";

type GlobalErrorProps = {
  reset: () => void;
};

/**
 * Error boundary tingkat akar (konvensi App Router `global-error.tsx`) —
 * dipicu saat root layout sendiri melempar galat, jadi WAJIB merender
 * `<html>`/`<body>` sendiri karena ia menggantikan layout akar sepenuhnya.
 * Tidak menangkap galat dari `error.tsx` (boundary itu sudah lebih dulu
 * menangkapnya) dan tidak selalu aktif di `next dev` — bukan tanda ia rusak.
 * Tidak mencatat `error` ke mana pun, sama seperti `error.tsx`: proyek belum
 * punya infrastruktur logging (YAGNI), dan `console.*` di kode produksi
 * dilarang aturan proyek.
 */
export default function GlobalError({ reset }: GlobalErrorProps) {
  return (
    <html lang="id">
      <body className="min-h-full antialiased">
        <div className="flex h-dvh items-center justify-center bg-canvas p-6">
          <div className="max-w-sm rounded-card bg-surface p-5 text-center">
            {/* "Portal", bukan "Aplikasi": GLOSSARY § Padanan tetap
                menetapkan nama sisi pengguna untuk folder `app/` adalah
                Portal (sisiran Task 30). */}
            <p className="text-title-md text-ink">Portal gagal dimuat</p>
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
      </body>
    </html>
  );
}
