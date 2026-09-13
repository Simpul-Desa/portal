"use client";
import { ScrollArea } from "@/shared/components/ui/scroll-area";


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
import { Badge } from "@/shared/components/ui/badge";
import { PanelBottomClose, PanelLeftClose } from "lucide-react";
import type { Lensa } from "@/lib/url-state";

import { PANEL_DEFAULT, PANEL_MAX, PANEL_MIN } from "./panel-constants";
import { LENSA_ITEMS } from "./side-rail";

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
  /** Lensa aktif yang sedang ditampilkan — untuk judul dan ikon header. */
  lensaAktif: Lensa;
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
export function LeftPanel({
  collapsed,
  onToggleCollapse,
  width,
  onWidthChange,
  lensaAktif,
  children,
}: LeftPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const itemAktif = LENSA_ITEMS.find((item) => item.lensa === lensaAktif);
  const Icon = itemAktif?.icon;
  const title = itemAktif?.nama ?? "Dasbor";
  const isML = Boolean(itemAktif?.isML);

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
        className={`relative flex flex-1 min-h-0 w-full overflow-hidden shrink-0 flex-col rounded-card bg-float md:absolute md:inset-y-0 md:left-0 md:z-20 md:w-panel-min md:h-full md:flex-none lg:relative lg:shrink-0 xl:w-(--panel-w) ${
          isDragging ? "select-none" : ""
        }`}
      >
        {/* Penanda "lembar ini bisa digulung" (<768px saja) — bukan kontrol:
            nol fokus, nol gestur tarik. */}
        <div
          aria-hidden="true"
          className="mx-auto mt-2 h-1 w-6 shrink-0 rounded-full bg-line-strong/60 md:hidden"
        />

        <header className="flex items-center justify-between px-4 py-3.5 md:px-6 md:py-5">
          <div className="flex items-center gap-2 min-w-0">
            {Icon && <Icon className="size-[18px] shrink-0 text-ink" />}
            <h2 className="text-title-sm text-ink font-semibold tracking-tight truncate">
              {title}
            </h2>
            {isML && (
              <Badge
                variant="outline"
                >
                Machine Learning
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleCollapse}
              title={`Tutup ${title}`}
              aria-label={`Tutup ${title}`}
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-ink hover:bg-surface hover:border-line-strong transition-all [&>svg]:size-4 ${FOCUS_RING}`}
            >
              <PanelBottomClose size={16} className="md:hidden" />
              <PanelLeftClose size={16} className="hidden md:block" />
            </button>
          </div>
        </header>

        <div className="h-px bg-hairline w-full" />

        <ScrollArea className="flex-1 min-h-0 w-full h-full">
          <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">{children}</div>
        </ScrollArea>
      </div>

      {/* Handle resizer (tanda strip) di antara panel kiri dan peta */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label="Ubah lebar panel"
        title="Tarik untuk mengubah lebar panel (klik ganda untuk reset)"
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
        className={`group relative hidden h-full w-3 shrink-0 cursor-col-resize touch-none items-center justify-center -mx-1.5 z-30 xl:flex select-none outline-none ${FOCUS_RING}`}
      >
        <div
          className={`h-9 w-1 rounded-full transition-all ${
            isDragging
              ? "bg-primary scale-y-110 shadow-sm"
              : "bg-neutral-400/90 group-hover:bg-primary group-hover:scale-y-110"
          }`}
        />
      </div>
    </>
  );
}
