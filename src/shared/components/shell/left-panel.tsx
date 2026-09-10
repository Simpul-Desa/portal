"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import { ChevronLeftIcon } from "../icons";
import { PANEL_DEFAULT, PANEL_MAX, PANEL_MIN } from "./panel-constants";

/** Langkah lebar per tekan panah kiri/kanan saat separator difokuskan lewat keyboard. */
const LANGKAH_KEYBOARD = 16;

function clampLebar(nilai: number): number {
  return Math.min(PANEL_MAX, Math.max(PANEL_MIN, nilai));
}

type LeftPanelProps = {
  /** Panel tidak dirender sama sekali saat true — dikendalikan shell (Task 19). */
  collapsed: boolean;
  /** Dipanggil tombol lipat di header. */
  onToggleCollapse: () => void;
  /** Lebar panel dalam px (400-640) — dikendalikan induk supaya tidak hilang saat lipat/buka. */
  width: number;
  /** Dipanggil saat drag atau keyboard mengubah lebar; nilai sudah di-clamp 400-640. */
  onWidthChange: (width: number) => void;
  children: ReactNode;
};

/**
 * Bingkai panel kiri: lebar bisa ditarik (400-640px) lewat handle di tepi
 * kanan, dan bisa dilipat penuh ke rail. Konten lensa apa pun masuk lewat
 * `children` — berkas ini tidak tahu isinya.
 *
 * Controlled sepenuhnya oleh induk (`dashboard-shell.tsx`): `width` dan
 * `collapsed` adalah state induk, bukan state lokal — supaya lebar yang
 * sudah diatur pengguna tidak hilang/reset saat panel dilipat lalu dibuka
 * lagi. Satu-satunya state lokal di sini adalah `isDragging`, murni interaksi
 * sesaat yang tidak perlu diketahui induk.
 *
 * Responsif (DESIGN.md § Responsive): ≥1280px lebar bisa ditarik manual
 * (400–640px); 1024–1279px lebar tetap 400px; 768–1023px jadi drawer
 * melayang di atas peta; <768px peta 45vh di atas, panel jadi lembar di
 * bawahnya.
 */
export function LeftPanel({ collapsed, onToggleCollapse, width, onWidthChange, children }: LeftPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging || !panelRef.current) return;
    const { left } = panelRef.current.getBoundingClientRect();
    onWidthChange(clampLebar(event.clientX - left));
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
  }

  /** Pointer batal (mis. gestur sistem menyela) atau capture lepas sendiri — reset seperti pointerup, tanpa itu drag bisa "nyangkut" aktif. */
  function handlePointerInterrupted() {
    setIsDragging(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      onWidthChange(clampLebar(width - LANGKAH_KEYBOARD));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      onWidthChange(clampLebar(width + LANGKAH_KEYBOARD));
    } else if (event.key === "Home") {
      event.preventDefault();
      onWidthChange(PANEL_MIN);
    } else if (event.key === "End") {
      event.preventDefault();
      onWidthChange(PANEL_MAX);
    }
  }

  // Esc melipat panel HANYA di rentang drawer (768-1023px, `md:block
  // lg:hidden` pada scrim di bawah) — di atas itu panel statis dan tidak
  // menutupi apa pun, jadi Esc tidak boleh berbuat apa-apa (Task 13 GOTCHA
  // 2). Dicek lewat `matchMedia` saat tombolnya ditekan, bukan disimpan di
  // state, supaya tidak perlu listener resize terpisah.
  useEffect(() => {
    if (collapsed) return;

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key !== "Escape") return;
      // Penutup TERDALAM menang (temuan review gelombang 2). `DialogTerkunci`
      // dan `PanelAsisten` menangani Esc lewat `onKeyDown` React, yang
      // menggelembung sampai ke listener `document` ini: tanpa penjaga, satu
      // tekan Esc menutup dialog SEKALIGUS melipat panel di belakangnya.
      // Keduanya kini memanggil `preventDefault`, dan React memasang
      // handlernya di wadah akar — di dalam `document` — jadi handler mereka
      // selalu jalan lebih dulu daripada baris ini.
      if (event.defaultPrevented) return;
      const diRentangDrawer = window
        .matchMedia("(min-width: 768px) and (max-width: 1023.98px)")
        .matches;
      if (diRentangDrawer) onToggleCollapse();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [collapsed, onToggleCollapse]);

  if (collapsed) return null;

  return (
    <>
      {/* Scrim drawer (768-1023px SAJA) — BUKAN modal: fokus tidak dikurung,
          `aria-modal` tidak dipasang, rail tetap terjangkau di sisi kiri
          (di luar wadah ini). Klik = lipat panel, sama seperti Esc di atas. */}
      <div
        onClick={onToggleCollapse}
        aria-hidden="true"
        className="absolute inset-0 z-10 hidden bg-scrim md:block lg:hidden"
      />
      <div
        ref={panelRef}
        style={{ "--panel-w": `${width}px` } as CSSProperties}
        className={`relative flex w-full shrink-0 flex-col gap-2 overflow-y-auto bg-canvas md:absolute md:inset-y-0 md:left-0 md:z-20 md:w-panel-min md:flex-none md:shadow-float lg:static lg:shadow-none xl:w-(--panel-w) ${
          isDragging ? "select-none" : ""
        }`}
      >
        {/* Penanda "lembar ini bisa digulung" (<768px saja) — bukan kontrol:
            nol fokus, nol gestur tarik. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-6 shrink-0 rounded-full bg-line-strong/60 md:hidden"
        />

        <header className="sticky top-0 z-10 flex shrink-0 items-center bg-canvas p-2 pb-0">
          <button
            type="button"
            onClick={onToggleCollapse}
            title="Lipat panel"
            aria-label="Lipat panel"
            className={`flex size-9 items-center justify-center rounded-control bg-surface text-ink ${FOCUS_RING}`}
          >
            <ChevronLeftIcon />
          </button>
        </header>

        <div className="flex flex-col gap-2 p-2 pt-0">{children}</div>

        {/* Handle 8px (hit-target lebih lebar dari garis yang tampak) — hanya
            aktif dari xl (≥1280px); di bawah itu lebar mengikuti breakpoint
            tetap (md/lg), bukan drag. Fokusable dan bisa dioperasikan keyboard
            (panah kiri/kanan step 16px, Home/End ke batas) untuk operator yang
            tidak memakai pointer. */}
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Ubah lebar panel"
          aria-valuemin={PANEL_MIN}
          aria-valuemax={PANEL_MAX}
          aria-valuenow={width}
          tabIndex={0}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerInterrupted}
          onLostPointerCapture={handlePointerInterrupted}
          onKeyDown={handleKeyDown}
          onDoubleClick={() => onWidthChange(PANEL_DEFAULT)}
          className={`absolute inset-y-0 right-0 hidden w-2 touch-none cursor-col-resize xl:block ${FOCUS_RING} ${
            isDragging ? "bg-line-strong" : "hover:bg-line-strong/60"
          }`}
        />
      </div>
    </>
  );
}
