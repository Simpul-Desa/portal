"use client";

import { ArrowLeft, Clock, MapPin, Network, Sparkles } from "lucide-react";

import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka, strip } from "@/shared/format";

import { type JalurTernormalisasi, VARIAN } from "../types";

type DetailJalurProps = {
  varian: Varian;
  jalur: JalurTernormalisasi;
  desaAktif?: string;
  onPilihDesa?: (iddesa: string) => void;
  onTutup?: () => void;
};

/**
 * Detail Jalur Ekonomi:
 * Menampilkan List Desa Poros (pusat) dan List Desa Sejalur (keterlayanan).
 * Diberi aksen highlight warna yang jelas (tema gold/amber rute ekonomi),
 * dengan setiap baris desa interaktif untuk langsung menyorot posisi desa di peta.
 */
export function DetailJalur({
  varian,
  jalur,
  desaAktif,
  onPilihDesa,
  onTutup,
}: DetailJalurProps) {
  const namaVarian = VARIAN.find((v) => v.slug === varian)?.nama ?? varian;
  const csEksisting = varian === "cold-storage" && !jalur.porosAdalahPeran;
  const judulPeran = csEksisting ? "Cold Storage Eksisting" : "Desa Poros (Pusat Jalur)";
  const judulTabel = csEksisting ? "Daftar Desa dalam Jangkauan" : "Daftar Desa Sejalur";

  const apakahPorosAktif = desaAktif === jalur.pusat.iddesa;
  const anggotaTanpaPoros = jalur.anggota.filter((a) => a.iddesa !== jalur.pusat.iddesa);

  return (
    <section className="space-y-3">
      {/* 1. KARTU HIGHLIGHT: DESA POROS (PUSAT JALUR) */}
      <div
        onClick={() => onPilihDesa?.(jalur.pusat.iddesa)}
        title="Klik untuk menyorot poros di peta"
        className={`rounded-card p-4 transition-all cursor-pointer border shadow-xs ${
          apakahPorosAktif
            ? "bg-amber-500/15 border-amber-500 ring-1 ring-amber-500"
            : "bg-amber-500/10 border-amber-500/30 hover:border-amber-500/60"
        } ${FOCUS_RING}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-0.5 text-micro font-semibold text-white shadow-xs">
              <Sparkles className="size-3" />
              <span>{judulPeran}</span>
              <TanyaTooltip istilah="Desa Poros" />
            </span>
            <span className="rounded-full bg-surface/80 dark:bg-amber-950/50 px-2 py-0.5 text-micro text-amber-950 dark:text-amber-200 font-medium border border-amber-500/20">
              {namaVarian}
            </span>
          </div>

          {onTutup && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onTutup();
              }}
              title="Tutup detail jalur"
              aria-label="Tutup detail jalur"
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-micro text-amber-900/80 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 hover:bg-amber-500/20 transition-colors ${FOCUS_RING}`}
            >
              <ArrowLeft className="size-3" />
              <span>Ganti jalur</span>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-baseline justify-between gap-2 flex-wrap">
          <div>
            <h2 className="text-title-sm font-semibold text-ink flex items-center gap-1.5">
              <span>{jalur.pusat.nmdesa}</span>
              {apakahPorosAktif && <MapPin className="size-3.5 text-amber-700 dark:text-amber-400 shrink-0" />}
            </h2>
            <p className="text-micro text-muted">Kec. {strip(jalur.pusat.nmkec)}</p>
          </div>

          <div className="text-right">
            <p className="text-title-sm font-semibold text-ink">
              {strip(jalur.bobot)}
              {jalur.unit ? ` ${jalur.unit}` : ""}
            </p>
            <div className="flex items-center justify-end">
              <p className="text-micro text-muted">{jalur.label}</p>
              <TanyaTooltip istilah="Bobot Jalur" />
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-micro text-amber-900/80 dark:text-amber-300/90">
          <div className="flex items-center">
            <span>Melayani {strip(jalur.nAnggota)} desa sekitarnya</span>
            <TanyaTooltip istilah="Cakupan Layanan" />
          </div>
          <span className="font-medium hover:underline">Sorot poros di peta →</span>
        </div>
      </div>

      {/* 2. LIST DESA SEJALUR */}
      <div className="rounded-card bg-surface p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-hairline">
          <div>
            <h3 className="text-title-sm font-semibold text-ink flex items-center gap-1.5">
              <Network className="size-4 text-ink" />
              <span>{judulTabel}</span>
              <TanyaTooltip istilah="Desa Sejalur" />
              <span className="rounded-full bg-float px-2 py-0.2 text-badge text-muted ml-1">
                {formatAngka(anggotaTanpaPoros.length)} desa
              </span>
            </h3>
            <p className="text-micro text-muted mt-0.5">
              Klik baris desa untuk menyorot lokasinya di peta
            </p>
          </div>
        </div>

        {anggotaTanpaPoros.length === 0 ? (
          <p className="py-4 text-center text-micro text-muted">
            Tidak ada desa lain yang dilayani unit ini.
          </p>
        ) : (
          <div className="mt-2 divide-y divide-hairline">
            {anggotaTanpaPoros.map((a) => {
              const adalahDesaAktif = desaAktif === a.iddesa;
              return (
                <button
                  key={a.iddesa}
                  type="button"
                  onClick={() => onPilihDesa?.(a.iddesa)}
                  title={`Klik untuk menyorot ${a.nmdesa} di peta`}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left rounded-control transition-all cursor-pointer ${
                    adalahDesaAktif
                      ? "bg-amber-500/15 border-l-2 border-amber-600 pl-2.5 font-medium"
                      : "hover:bg-inset"
                  } ${FOCUS_RING}`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`size-2 rounded-full shrink-0 ${
                        adalahDesaAktif ? "bg-amber-600" : "bg-line-strong"
                      }`}
                    />
                    <div className="min-w-0">
                      <p className="text-body-md font-medium text-ink truncate flex items-center gap-1">
                        <span>{a.nmdesa}</span>
                        {adalahDesaAktif && (
                          <MapPin className="size-3 text-amber-700 shrink-0" />
                        )}
                      </p>
                      {a.nmkec && <p className="text-micro text-muted truncate">Kec. {a.nmkec}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-right">
                    {a.bobot !== null && (
                      <div className="hidden sm:block">
                        <p className="text-micro font-medium text-ink">{strip(a.bobot)}</p>
                        <p className="text-[10px] text-muted">{jalur.label}</p>
                      </div>
                    )}
                    {a.menit !== null && (
                      <div className="flex items-center gap-1 rounded-full bg-float px-2 py-0.5 text-micro font-mono text-ink">
                        <Clock className="size-3 text-muted" />
                        <span>{formatAngka(a.menit, 1)} m</span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
