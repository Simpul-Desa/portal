"use client";

/**
 * Daftar giliran percakapan Asisten Desa (Task 18). Giliran user cukup
 * inline di sini — satu blok kecil, tidak perlu berkas sendiri; giliran
 * model lewat `GiliranAsisten`. Baris "sedang menjawab" dan `BlokGalat`
 * duduk di ekor daftar.
 *
 * `role="log"` dipasang pada WADAH yang sudah ada saat panel dibuka
 * (Task 18 GOTCHA 2) — bukan pada giliran baru itu sendiri, supaya region
 * yang lahir bersama isinya tetap diumumkan pembaca layar. `role="log"`
 * menggantikan `aria-live="polite"` polos (Task 23/A15): keduanya sama-sama
 * mengumumkan giliran baru, tapi `log` juga nama peran yang benar untuk
 * transkrip yang hanya bertambah, dan `tabIndex={0}` membuat wadah ini bisa
 * dituju keyboard walau isinya tidak punya elemen fokusable (mis. jawaban
 * tanpa `Sumber jawaban`).
 *
 * Kunci React memakai INDEKS array (Task 18 GOTCHA 1): daftar ini HANYA
 * bertambah di ujung (tidak pernah disisipi, diurut ulang, atau dihapus
 * satuan), jadi indeks stabil di sini.
 */

import { useEffect, useRef } from "react";
import Image from "next/image";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import type { GalatApi } from "@/lib/api/client";

import type { Giliran, TujuanJejak } from "../types";
import { BlokGalat } from "./blok-galat";
import { GiliranAsisten } from "./giliran-asisten";

type DaftarGiliranProps = {
  riwayat: readonly Giliran[];
  sedangMenjawab: boolean;
  galat: GalatApi | null;
  onKirimUlang: () => void;
  onBukaTujuan: (tujuan: TujuanJejak) => void;
};

function renderPesanUser(isi: string) {
  // Mencocokkan tag [@Desa ...] atau [Desa ...] atau token @TOKEN_UNDERSCORE
  const regex = /(\[@?[^\]]+\]|@[A-Za-z0-9_]+)/g;
  const bagian = isi.split(regex);

  if (bagian.length === 1) {
    return <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{isi}</span>;
  }

  return (
    <span className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
      {bagian.map((segmen, idx) => {
        if (!segmen) return null;

        // Cocok dengan [@Desa ...] atau [Desa ...]
        if (segmen.startsWith("[") && segmen.endsWith("]")) {
          const konteks = segmen.slice(1, -1).replace(/^@/, "");
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-line-strong/70 bg-inset px-2 py-0.5 text-micro text-ink max-w-full font-medium shadow-xs my-0.5 mr-1 align-middle"
              title={konteks}
            >
              <span className="truncate max-w-[240px]">{konteks}</span>
            </span>
          );
        }

        // Cocok dengan @TOKEN_UNDERSCORE
        if (segmen.startsWith("@")) {
          const label = segmen.slice(1).replace(/_/g, " ");
          return (
            <span
              key={idx}
              className="inline-flex items-center gap-1 rounded-md border border-line-strong/70 bg-inset px-2 py-0.5 text-micro text-ink max-w-full font-medium shadow-xs my-0.5 mr-1 align-middle"
              title={label}
            >
              <span className="truncate max-w-[240px]">{label}</span>
            </span>
          );
        }

        return <span key={idx}>{segmen}</span>;
      })}
    </span>
  );
}

export function DaftarGiliran({
  riwayat,
  sedangMenjawab,
  galat,
  onKirimUlang,
  onBukaTujuan,
}: DaftarGiliranProps) {
  // Region _log_ dipanjat sampai titik maksimal, bukan diserahkan ke default
  // W3C (hanya elemen yang disisipkan), Task 23.
  const regionRef = useRef<HTMLDivElement>(null);
  const rekatBawah = useRef(true);
  const akhirRef = useRef<HTMLDivElement>(null);

  // Kunci pergerakan DOM sampai render selesai, lalu panjat jika direkatkan.
  // Tidak ada `ResizeObserver` rumit atau sinkronisasi ganda: `layoutEffect`
  // di dalam giliran itu sendiri atau React DOM sudah cukup, dan ini bersih.
  useEffect(() => {
    if (rekatBawah.current && regionRef.current) {
      regionRef.current.scrollTop = regionRef.current.scrollHeight;
    }
  }, [riwayat, sedangMenjawab, galat]); // Berjalan tiap ekor berubah

  return (
    <ScrollArea
      viewportRef={regionRef}
      className="flex-1 w-full h-full min-h-0 min-w-0 overflow-x-hidden"
      onScroll={() => {
        if (!regionRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = regionRef.current;
        rekatBawah.current = scrollHeight - scrollTop - clientHeight < 16;
      }}
    >
      <div
        className="flex flex-col gap-6 px-6 py-6 outline-none min-w-0 max-w-full"
        role="log"
        tabIndex={0}
        aria-label="Riwayat percakapan"
      >
        {riwayat.map((g, i) =>
          g.role === "user" ? (
            <div key={i} className="flex w-full justify-end min-w-0">
              <div className="rounded-2xl rounded-tr-sm bg-surface px-4 py-3 text-micro text-ink max-w-[85%] border border-line-strong/30 break-words [overflow-wrap:anywhere] min-w-0">
                {renderPesanUser(g.isi)}
              </div>
            </div>
          ) : (
            <div key={i} className="flex w-full items-start gap-3 min-w-0">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface mt-1 overflow-hidden">
                <Image src="/asisten-desa.svg" alt="" width={16} height={16} />
              </div>
              <div className="flex-1 min-w-0">
                <GiliranAsisten giliran={g} onBukaTujuan={onBukaTujuan} />
              </div>
            </div>
          ),
        )}

        {sedangMenjawab && (
          <div className="flex w-full items-start gap-3 min-w-0">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-surface mt-1 overflow-hidden">
              <Image src="/asisten-desa.svg" alt="" width={16} height={16} />
            </div>
            <div className="flex items-center h-10 px-2 min-w-0">
              <div className="flex gap-1.5">
                <div className="size-2 rounded-full bg-line-strong animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="size-2 rounded-full bg-line-strong animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="size-2 rounded-full bg-line-strong animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {!sedangMenjawab && galat && <BlokGalat galat={galat} onKirimUlang={onKirimUlang} />}

        <div ref={akhirRef} />
      </div>
    </ScrollArea>
  );
}
