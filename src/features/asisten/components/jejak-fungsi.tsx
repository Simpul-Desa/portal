"use client";

/**
 * Blok "Sumber jawaban" (Task 20, DESIGN.md § Asisten Desa "Trace block") —
 * bukti jejak fungsi DAN jalan ke lensa yang datanya dipakai (keputusan user
 * 10 September 2026 §1-2). Terbuka bawaan: begitu blok ini juga jadi
 * navigasi, menutupnya berarti menyembunyikan satu-satunya jalan yang
 * ditawarkan jawaban (rencana § Notes "Mengapa blok jejak terbuka bawaan").
 *
 * `rincian` (hasil `barisJejak`, bukan `argumen` mentah) yang dirender di
 * baris kedua — `argumen` adalah keluaran MODEL dan tidak pernah dirender
 * sebagai JSON (Task 20 GOTCHA 2). Satu tombol per baris; chevron header
 * (buka/tutup blok) dan baris (buka lensa) adalah dua aksi berbeda (Task 20
 * GOTCHA 3).
 */

import { useId, useState } from "react";

import { ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import { barisJejak } from "../services/jejak";
import type { JejakFungsi as JejakFungsiMentah, TujuanJejak } from "../types";

type JejakFungsiProps = {
  jejak: readonly JejakFungsiMentah[];
  /** Kode `peringatan` asing (kontrak `api/` bertambah, dihitung
   * `peringatanTampil` di `giliran-asisten.tsx`) — tampil mentah di kaki
   * blok ini supaya kontrak baru tidak hilang diam-diam (Task 20). */
  kodeAsing: readonly string[];
  onBuka: (tujuan: TujuanJejak) => void;
};

// Perbaikan 1 (review Opus): blok pembungkus SUDAH `bg-inset` (tingkat
// paling terang tangga abu-abu), jadi `hover:bg-inset` tidak berefek apa
// pun. Diganti garis 1px `line-strong` (DESIGN.md § Charts: "lift the
// column with `surface-inset` behind it or a 1px `border-strong` rule
// instead" — di sini tidak ada tingkat lebih terang untuk dinaiki, jadi
// jalur garisnya yang dipakai). `outline` (bukan `border`) supaya tidak
// menggeser layout, dan variannya (`hover:`) tidak bertabrakan dengan
// `FOCUS_RING` (`focus-visible:outline-*`) karena keduanya pseudo-class
// berbeda pada properti yang sama — Tailwind menata `focus-visible`
// SESUDAH `hover` di stylesheet yang dihasilkan, jadi ring fokus tetap
// menang saat baris di-hover DAN difokus sekaligus.
const KELAS_BARIS =
  `flex w-full items-start justify-between gap-3 rounded-control px-3 py-2 text-left hover:outline-solid hover:outline-1 hover:outline-line-strong ${FOCUS_RING}`;

export function JejakFungsi({ jejak, kodeAsing, onBuka }: JejakFungsiProps) {
  const [terbuka, setTerbuka] = useState(true);
  const idKonten = useId();
  const baris = barisJejak(jejak);

  return (
    <div className="rounded-inset bg-inset p-3">
      <button
        type="button"
        onClick={() => setTerbuka((v) => !v)}
        aria-expanded={terbuka}
        aria-controls={idKonten}
        className={`flex w-full items-center justify-between gap-2 text-left text-title-sm text-ink ${FOCUS_RING}`}
      >
        <span>Sumber jawaban · {baris.length} alat</span>
        {terbuka ? (
          <ChevronUp aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
        ) : (
          <ChevronDown aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
        )}
      </button>

      {terbuka && (
        <div id={idKonten} className="mt-2 flex flex-col divide-y divide-hairline">
          {baris.map((b, i) => {
            const konten = (
              <span className="flex min-w-0 items-start gap-2">
                <span
                  className={`mt-1.5 size-1.5 shrink-0 rounded-full ${b.sukses ? "bg-positive" : "bg-critical"}`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <span className="sr-only">
                    {b.sukses ? "Panggilan berhasil. " : "Panggilan gagal. "}
                  </span>
                  <span className="block truncate text-title-sm text-ink">{b.label}</span>
                  {b.rincian && <span className="block truncate text-micro text-muted">{b.rincian}</span>}
                </span>
              </span>
            );

            if (b.tujuan) {
              const tujuan = b.tujuan;
              return (
                <button key={i} type="button" onClick={() => onBuka(tujuan)} className={KELAS_BARIS}>
                  {konten}
                  <ChevronRight
                    aria-hidden="true"
                    size={18}
                    strokeWidth={1.5}
                    className="mt-1.5 shrink-0 text-muted"
                  />
                </button>
              );
            }

            return (
              <div key={i} className="flex w-full items-start gap-3 px-3 py-2">
                {konten}
              </div>
            );
          })}
        </div>
      )}

      {kodeAsing.length > 0 && <p className="mt-2 text-micro text-muted">{kodeAsing.join(", ")}</p>}
    </div>
  );
}
