"use client";

import { useId } from "react";
import type { KartuDesa } from "@/features/kartu/types";
import { formatAngka, strip } from "@/shared/format";
import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";

type RadialKesiapanProps = {
  kiri: KartuDesa;
  kanan: KartuDesa;
  sumbu: {
    kiri: number | null;
    kanan: number | null;
  };
};

function kategoriKesiapan(skor: number | null): { label: string; kelas: string } {
  if (skor === null) return { label: "Belum Terpetakan", kelas: "bg-surface text-muted border-hairline" };
  if (skor >= 75) return { label: "Kesiapan Tinggi", kelas: "bg-green-500/10 text-green-700 border-green-500/20" };
  if (skor >= 50) return { label: "Kesiapan Sedang", kelas: "bg-amber-500/10 text-amber-800 border-amber-500/20" };
  return { label: "Perlu Penguatan", kelas: "bg-red-500/10 text-red-700 border-red-500/20" };
}

/**
 * Komponen satu gauge radial SVG dengan sudut busur 240 derajat (speedometer style).
 */
function GaugeRadial({
  nilai,
  labelDesa,
  desil,
  warnaAksen = "#ff7300",
}: {
  nilai: number | null;
  labelDesa: string;
  desil?: number | null;
  warnaAksen?: string;
}) {
  const idGradien = useId();
  const radius = 44;
  const kelilingPenuh = 2 * Math.PI * radius; // ~276.46
  const sudutBusur = 240;
  const panjangBusur = (sudutBusur / 360) * kelilingPenuh; // ~184.31

  const nilaiClamped = nilai !== null ? Math.min(100, Math.max(0, nilai)) : 0;
  const progressLength = nilai !== null ? (nilaiClamped / 100) * panjangBusur : 0;
  const offset = panjangBusur - progressLength;

  const kategori = kategoriKesiapan(nilai);

  return (
    <div className="flex flex-col items-center justify-between p-3.5 sm:p-4 rounded-inset bg-surface/70 border border-hairline/90 shadow-2xs hover:bg-surface transition-all text-center">
      {/* Nama Desa di atas */}
      <div className="w-full mb-1">
        <h5 className="text-title-sm font-semibold text-ink truncate" title={labelDesa}>
          {labelDesa}
        </h5>
        <span className="text-micro text-muted">
          {desil !== null && desil !== undefined ? `Desil ${formatAngka(desil)} / 10` : "Desil —"}
        </span>
      </div>

      {/* SVG Radial Gauge */}
      <div className="relative size-32 sm:size-36 flex items-center justify-center my-1">
        <svg
          viewBox="0 0 120 120"
          className="size-full overflow-visible"
          role="img"
          aria-label={`Skor kesiapan ${labelDesa}: ${nilai !== null ? nilai : "tidak tersedia"} dari 100`}
        >
          <defs>
            <linearGradient id={idGradien} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff9a3c" />
              <stop offset="100%" stopColor={warnaAksen} />
            </linearGradient>
          </defs>

          {/* Jalur Latar Belakang (Track) busur 240 derajat, diputar mulai dari -210 deg */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${panjangBusur} ${kelilingPenuh}`}
            className="text-hairline/90"
            transform="rotate(150 60 60)"
          />

          {/* Jalur Isi (Progress Arc) */}
          {nilai !== null && progressLength > 0 && (
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={`url(#${idGradien})`}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${panjangBusur} ${kelilingPenuh}`}
              strokeDashoffset={offset}
              transform="rotate(150 60 60)"
              className="transition-all duration-700 ease-out"
            />
          )}
        </svg>

        {/* Teks di Dalam Lingkaran */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
          <span className="text-metric-md font-bold text-ink tracking-tight leading-none">
            {nilai !== null ? Math.round(nilai) : strip(null)}
          </span>
          <span className="text-[11px] font-medium text-muted mt-1 leading-none">
            DARI 100
          </span>
        </div>
      </div>

      {/* Pill Kategori di Bawah */}
      <div className="mt-1">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-badge font-semibold border ${kategori.kelas}`}
        >
          {kategori.label}
        </span>
      </div>
    </div>
  );
}

/**
 * Radial Charts berdampingan untuk membandingkan Skor Kesiapan kedua desa.
 */
export function RadialKesiapan({ kiri, kanan, sumbu }: RadialKesiapanProps) {
  return (
    <div className="mt-5 border-t border-hairline pt-4">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center">
          <h4 className="text-title-sm font-semibold text-ink">Skor Kesiapan Kedua Desa</h4>
          <TanyaTooltip istilah="Skor Kesiapan" />
        </div>
        <span className="text-micro text-muted">Skala 0–100</span>
      </div>

      {/* Dua Radial Gauge berdampingan Kiri dan Kanan */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <GaugeRadial
          nilai={sumbu.kiri}
          labelDesa={kiri.identitas.nama}
          desil={kiri.peta_peran.desil_sk}
          warnaAksen="#ff7300"
        />
        <GaugeRadial
          nilai={sumbu.kanan}
          labelDesa={kanan.identitas.nama}
          desil={kanan.peta_peran.desil_sk}
          warnaAksen="#e46700"
        />
      </div>
    </div>
  );
}
