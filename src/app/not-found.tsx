import Link from "next/link";

import { FOCUS_RING } from "@/shared/components/focus-ring";

/**
 * Halaman 404 (konvensi App Router `not-found.tsx`). Meniru bentuk
 * `error.tsx` (kartu `surface` di tengah `canvas`) tapi menuju beranda lewat
 * `<Link>`, bukan `reset()` — URL yang salah ketik tidak punya apa pun untuk
 * dicoba lagi.
 */
export default function NotFound() {
  return (
    <div className="flex h-dvh items-center justify-center bg-canvas p-6">
      <div className="max-w-sm rounded-card bg-surface p-5 text-center">
        <p className="text-title-md text-ink">Halaman tidak ditemukan</p>
        <p className="mt-3 text-body-md text-body">
          Alamat ini tidak ada. Kembali ke beranda untuk melanjutkan.
        </p>
        <Link
          href="/"
          className={`mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-[18px] font-medium text-body-md text-ink ${FOCUS_RING}`}
        >
          Ke beranda
        </Link>
      </div>
    </div>
  );
}
