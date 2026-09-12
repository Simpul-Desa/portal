"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

import { kelompokSel, namaKomoditas } from "../services/sel";
import type { SelCitra } from "../types";

type DaftarSelProps = {
  daftar: readonly SelCitra[];
  targetAktif?: string;
  onPilih: (target: string) => void;
  /** `false` bila `useCitraDaftar` melaporkan daftar belum lengkap — keterangan micro muted. */
  lengkap: boolean;
};

/**
 * Daftar komoditas tervalidasi per tema (Kolom 1 Citra Potensi Desa).
 * Berbentuk Card dengan leveling jelas terhadap kolom 2.
 * Komoditas aktif dapat dibuka/tutup (*collapsible*) melalui klik panah (*arrow*).
 */
export function DaftarSel({ daftar, targetAktif, onPilih, lengkap }: DaftarSelProps) {
  const kelompok = kelompokSel(daftar);

  // State untuk toggle buka/tutup rincian metrik komoditas aktif
  const [targetSebelumnya, setTargetSebelumnya] = useState(targetAktif);
  const [detailTerbuka, setDetailTerbuka] = useState(true);

  if (targetAktif !== targetSebelumnya) {
    setTargetSebelumnya(targetAktif);
    setDetailTerbuka(true);
  }

  function handleToggle(target: string) {
    if (target !== targetAktif) {
      onPilih(target);
      setDetailTerbuka(true);
    } else {
      setDetailTerbuka((prev) => !prev);
    }
  }

  return (
    <section className="rounded-card bg-surface p-4 sm:p-5 flex flex-col space-y-4">
      {/* Judul dan jumlah komoditas disusun vertikal */}
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center">
          <h3 className="text-title-sm font-semibold text-ink">Komoditas Tervalidasi</h3>
          <TanyaTooltip istilah="Komoditas Tervalidasi" />
        </div>
        <span className="text-micro text-muted font-mono">{daftar.length} komoditas</span>
      </div>

      <div className="flex flex-col gap-4">
        {kelompok.map(({ tema, baris }) => (
          <div key={tema} className="space-y-1">
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted px-1">
              {tema}
            </h4>
            <div className="space-y-1">
              {baris.map((s) => {
                const terpilih = s.target === targetAktif;
                const buka = terpilih && detailTerbuka;

                return (
                  <div
                    key={s.target}
                    className={`transition-colors ${
                      terpilih
                        ? "rounded-md bg-float border border-line p-2.5 shadow-2xs"
                        : "rounded-md hover:bg-float/70 px-2.5 py-1.5"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleToggle(s.target)}
                        aria-current={terpilih || undefined}
                        className={`flex flex-1 min-w-0 items-center text-left cursor-pointer ${FOCUS_RING}`}
                      >
                        <span
                          className={`text-body-md truncate ${
                            terpilih ? "font-semibold text-ink" : "text-ink"
                          }`}
                        >
                          {namaKomoditas(s.nama)}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggle(s.target)}
                        aria-label={
                          buka
                            ? `Tutup detail ${namaKomoditas(s.nama)}`
                            : `Buka detail ${namaKomoditas(s.nama)}`
                        }
                        title={
                          buka
                            ? "Tutup detail mutu & rentang"
                            : "Buka detail mutu & rentang"
                        }
                        className={`flex size-6 shrink-0 items-center justify-center rounded hover:bg-surface/80 transition-all cursor-pointer ${FOCUS_RING}`}
                      >
                        <ChevronRight
                          className={`size-3.5 shrink-0 transition-transform ${
                            buka
                              ? "text-primary rotate-90"
                              : terpilih
                              ? "text-primary rotate-0"
                              : "text-muted/60 hover:text-ink hover:translate-x-0.5"
                          }`}
                        />
                      </button>
                    </div>

                    {/* Nilai mutu uji dan rentang keyakinan tersusun ke bawah (bisa open/close) */}
                    {buka && (
                      <div className="mt-2.5 space-y-2 pt-2 border-t border-hairline">
                        <div>
                          <div className="flex items-center">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
                              Mutu Uji
                            </span>
                            <TanyaTooltip istilah="Mutu Uji" />
                          </div>
                          <span className="block text-body-md font-semibold text-ink font-mono mt-0.5">
                            {formatAngka(s.ap_uji_tertahan)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-muted">
                              Rentang Keyakinan
                            </span>
                            <TanyaTooltip istilah="Rentang Keyakinan" />
                          </div>
                          <span className="block text-body-md font-semibold text-ink font-mono mt-0.5 whitespace-nowrap">
                            {formatAngka(s.ci_rerata[0])}–{formatAngka(s.ci_rerata[1])}
                          </span>
                        </div>
                        <p className="pt-0.5 text-[11px] text-muted leading-tight">
                          Skor berlaku relatif di dalam kabupaten terpilih.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {!lengkap && (
        <p className="mt-2 text-micro text-muted">
          Daftar ini belum memuat semua komoditas provinsi ini.
        </p>
      )}
    </section>
  );
}
