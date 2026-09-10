"use client";

import { useEffect, useRef, type KeyboardEvent, type RefObject } from "react";

import Link from "next/link";

import { PERAN_PEMBUKA, type Kemampuan } from "@/core/akses";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { CloseIcon } from "@/shared/components/icons";

type DialogTerkunciProps = {
  kemampuan: Kemampuan;
  nama: string;
  /** Path + query saat ini (BELUM di-`encodeURIComponent`) — dipakai
   * membangun `?lanjut=` ke `/masuk` dan `/daftar` supaya setelah masuk
   * pengguna kembali ke lensa/wilayah yang sama. Parameter URL sendiri
   * TIDAK PERNAH diubah oleh dialog ini. */
  tujuan: string;
  /** `useSesi().adaSesi` — sesi SUDAH ada (perbaikan galat diam terlaporkan
   * 10 September 2026): dialog berhenti menawarkan "Masuk"/"Daftar" ke
   * pengguna yang sudah masuk hanya karena perannya belum cukup (atau belum
   * terbaca) — itu tidak ada gunanya dan salah sasaran. */
  adaSesi: boolean;
  onTutup: () => void;
  /** Target kembalinya fokus saat dialog ditutup, dipakai sebagai fallback
   * SEBELUM `document.activeElement` — OPSIONAL: pemicu berupa KLIK (rail,
   * tombol Asisten) tidak perlu ini, `document.activeElement` saat dipasang
   * sudah benar. Untuk pemicu berupa SYARAT RENDER (`/admin` saat peran
   * belum cukup), `document.activeElement` jatuh ke `<body>` — `kembaliKe`
   * memberi target eksplisit alih-alih itu. */
  kembaliKe?: RefObject<HTMLElement | null>;
};

const ID_JUDUL = "dialog-terkunci-judul";

/**
 * Dialog ajakan masuk (PRD app §5.6, rencana fase 2 Task 21) — muncul saat
 * fitur terkunci diklik, dari rail (lensa, lewat `onKlikTerkunci`) atau dari
 * tombol Asisten di peta. Satu instans dirender `dashboard-shell.tsx`.
 *
 * Bukan `<dialog>` native dengan `showModal()`: `::backdrop` tidak bisa
 * ditokenkan lewat Tailwind v4, sedangkan scrim di sini WAJIB memakai token
 * `bg-scrim` (DESIGN.md § Dialog). A11y ditulis tangan: fokus pindah ke
 * tombol utama (aksi utama footer — "Masuk" bila sesi belum ada, atau
 * "Tutup" bila sesi SUDAH ada dan cuma perannya yang belum cukup, lihat
 * prop `adaSesi`) saat dibuka, kembali ke elemen yang memicunya saat
 * ditutup (`kembaliKe?.current` bila diteruskan, kalau tidak fallback ke
 * `document.activeElement` yang ditangkap saat dipasang — fallback ini
 * benar untuk pemicu berupa KLIK, tapi jatuh ke `<body>` untuk dialog yang
 * dipasang dari syarat render, makanya prop `kembaliKe` ada), Esc menutup,
 * klik scrim menutup, dan Tab terkurung
 * di dalam kartu (dari elemen terakhir kembali ke pertama, dan sebaliknya —
 * jebakan ini dihitung dari isi kartu SAAT ITU lewat `querySelectorAll`,
 * jadi tetap benar baik saat footer berisi dua tautan maupun satu tombol).
 */
export function DialogTerkunci({
  kemampuan,
  nama,
  tujuan,
  adaSesi,
  onTutup,
  kembaliKe,
}: DialogTerkunciProps) {
  const fokusAwalRef = useRef<HTMLElement | null>(null);
  const kartuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const pemicu = kembaliKe?.current ?? (document.activeElement as HTMLElement | null);
    fokusAwalRef.current?.focus();
    return () => {
      pemicu?.focus();
    };
  }, [kembaliKe]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      // `preventDefault` bukan hiasan: sejak fase 9 panel kiri ikut memasang
      // listener Esc di `document` untuk melipat drawer di 768-1023px, dan
      // handler React ini menggelembung ke sana. Tanpa penanda, satu tekan
      // Esc menutup dialog SEKALIGUS melipat panel di belakangnya — dua aksi
      // dari satu tombol. Penutup terdalam yang menang, dan ia mengaku.
      e.preventDefault();
      onTutup();
      return;
    }
    if (e.key !== "Tab") return;

    const focusable = Array.from(
      kartuRef.current?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? [],
    );
    if (focusable.length === 0) return;
    const pertama = focusable[0];
    const terakhir = focusable[focusable.length - 1];

    if (e.shiftKey && document.activeElement === pertama) {
      e.preventDefault();
      terakhir.focus();
    } else if (!e.shiftKey && document.activeElement === terakhir) {
      e.preventDefault();
      pertama.focus();
    }
  }

  const lanjut = encodeURIComponent(tujuan);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-scrim p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onTutup();
      }}
    >
      <div
        ref={kartuRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={ID_JUDUL}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[380px] rounded-card bg-float p-5 shadow-float-strong"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id={ID_JUDUL} className="text-title-md text-ink">
            {nama} terkunci
          </h2>
          <button
            type="button"
            onClick={onTutup}
            title="Tutup"
            aria-label="Tutup"
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink ${FOCUS_RING}`}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="my-3 h-px bg-hairline" />

        <p className="text-body-md text-body">{PERAN_PEMBUKA[kemampuan]}</p>

        {adaSesi ? (
          <div className="mt-5 flex justify-end">
            <button
              ref={(elemen) => {
                fokusAwalRef.current = elemen;
              }}
              type="button"
              onClick={onTutup}
              className={`flex h-10 items-center justify-center rounded-full bg-primary px-[18px] text-button-md text-ink ${FOCUS_RING}`}
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="mt-5 flex justify-end gap-2">
            <Link
              ref={(elemen) => {
                fokusAwalRef.current = elemen;
              }}
              href={`/masuk?lanjut=${lanjut}`}
              className={`flex h-10 items-center justify-center rounded-full bg-primary px-[18px] text-button-md text-ink ${FOCUS_RING}`}
            >
              Masuk
            </Link>
            <Link
              href={`/daftar?lanjut=${lanjut}`}
              className={`flex h-10 items-center justify-center rounded-full bg-inset px-[18px] text-button-md text-ink ${FOCUS_RING}`}
            >
              Daftar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
