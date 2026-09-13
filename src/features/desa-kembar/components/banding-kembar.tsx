"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import type { KartuDesa } from "@/features/kartu/types";
import type { NamaZona } from "@/features/peta-peran/types";
import { WARNA_ZONA } from "@/lib/map/zona";

import { RadialKesiapan } from "./radial-kesiapan";
import { barisBanding, sumbuKesiapan } from "../services/banding";
import type { BarisBanding } from "../types";

type BandingKembarProps = {
  /** Desa acuan (kolom kiri). */
  kiri: KartuDesa;
  /** Desa kembar terpilih (kolom kanan). */
  kanan: KartuDesa;
  /** Kemiripan kembar terhadap acuan — 0–100. */
  persen: number | null;
  /** `true` bila pasangan ini LINTAS kabupaten. */
  lintasKabupaten: boolean;
};

/**
 * Tanda arah nilai KANAN terhadap KIRI — glyph SAJA,
 * tanpa angka selisih (aritmetika domain di klien dilarang kontrak README akar).
 */
function TandaArah({ arah }: { arah: BarisBanding["arah"] }) {
  if (arah === "naik") {
    return (
      <span className="flex items-center justify-center text-positive shrink-0">
        <ChevronUp aria-hidden="true" size={15} strokeWidth={2.5} />
        <span className="sr-only">lebih tinggi</span>
      </span>
    );
  }
  if (arah === "turun") {
    return (
      <span className="flex items-center justify-center text-critical shrink-0">
        <ChevronDown aria-hidden="true" size={15} strokeWidth={2.5} />
        <span className="sr-only">lebih rendah</span>
      </span>
    );
  }
  return null;
}

const KELAS_ZONA: Record<string, { badge: string; dot: string }> = {
  "Zona Pemerintah": {
    badge: "bg-[#d6338f]/10 text-[#d6338f] border-[#d6338f]/30 dark:bg-[#f472b6]/15 dark:text-[#f472b6] dark:border-[#f472b6]/35",
    dot: "bg-[#d6338f] dark:bg-[#f472b6]",
  },
  "Zona Mitra": {
    badge: "bg-[#7d5ae0]/10 text-[#7d5ae0] border-[#7d5ae0]/30 dark:bg-[#a78bfa]/15 dark:text-[#a78bfa] dark:border-[#a78bfa]/35",
    dot: "bg-[#7d5ae0] dark:bg-[#a78bfa]",
  },
  "Zona Poros": {
    badge: "bg-[#00a9bf]/10 text-[#00a9bf] border-[#00a9bf]/30 dark:bg-[#38bdf8]/15 dark:text-[#38bdf8] dark:border-[#38bdf8]/35",
    dot: "bg-[#00a9bf] dark:bg-[#38bdf8]",
  },
  "Zona Bantuan": {
    badge: "bg-[#8d9aab]/10 text-[#556375] border-[#8d9aab]/30 dark:bg-[#94a3b8]/15 dark:text-[#cbd5e1] dark:border-[#94a3b8]/35",
    dot: "bg-[#8d9aab] dark:bg-[#cbd5e1]",
  },
};

/**
 * Badge berwarna untuk nilai Zona (Zona Pemerintah, Zona Mitra, Zona Poros, Zona Bantuan, Belum Terpetakan).
 */
function BadgeZonaNilai({ zona }: { zona: string }) {
  const cfg = KELAS_ZONA[zona] ?? {
    badge: "bg-surface text-muted border-hairline dark:text-slate-300 dark:bg-surface/80",
    dot: "bg-muted dark:bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-badge font-semibold truncate max-w-full border shadow-2xs ${cfg.badge}`}
    >
      <span className={`size-1.5 rounded-full mr-1.5 shrink-0 ${cfg.dot}`} />
      <span className="truncate">{zona}</span>
    </span>
  );
}

/**
 * Detail perbandingan indikator antara Desa Acuan dan Desa Kembar:
 * - Nilai Desa Acuan di sisi kiri
 * - Nama Item/Indikator di tengah (disertai tanda tanya tooltip tanpa underline)
 * - Nilai Desa Kembar di sisi kanan (disertai tanda arah)
 * - Ukuran font dibuat seragam agar nyaman dibaca
 * - Nilai Zona dirender dalam bentuk badge berwarna
 * - Skor Kesiapan divisualisasikan dengan Radial Gauge Chart berdampingan
 */
export function BandingKembar({ kiri, kanan, lintasKabupaten }: BandingKembarProps) {
  const baris = barisBanding(kiri, kanan);
  const sumbu = sumbuKesiapan(kiri, kanan);

  return (
    <section className="rounded-card bg-surface p-4 sm:p-5 border border-line/70 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-hairline">
        <div>
          <h3 className="text-title-sm font-semibold text-ink">Detail Komparasi Indikator</h3>
          <p className="text-micro text-muted">Perbandingan indikator pembangunan antardesa</p>
        </div>
      </div>

      {lintasKabupaten && (
        <p className="mt-3 text-micro text-muted">
          Kedua desa berasal dari kabupaten berbeda. Semua angka di bawah dihitung relatif terhadap
          kabupaten masing-masing, jadi disandingkan sebagai fakta, bukan untuk dibandingkan
          langsung.
        </p>
      )}

      {/* Header Kolom: Desa Acuan (kiri) | Indikator (tengah) | Desa Kembar (kanan) */}
      <div className="grid grid-cols-[1fr_minmax(120px,180px)_1fr] items-center gap-2 pt-3 pb-2 text-micro font-semibold text-muted border-b border-hairline">
        <span className="text-right pr-2 truncate text-ink">{kiri.identitas.nama}</span>
        <span className="text-center font-medium text-muted">Indikator</span>
        <span className="text-left pl-2 truncate text-ink">{kanan.identitas.nama}</span>
      </div>

      <div className="flex flex-col divide-y divide-hairline">
        {baris.map((b) => {
          const kiriKuat = !lintasKabupaten && b.kiriKuat;
          const kananKuat = !lintasKabupaten && b.kananKuat;
          const adalahZona = b.label === "Zona";

          return (
            <div
              key={b.label}
              className="grid grid-cols-[1fr_minmax(120px,180px)_1fr] items-center gap-2 py-2.5 px-1 hover:bg-surface/60 rounded-lg transition-colors"
            >
              {/* Kolom Kiri: Nilai Desa Acuan */}
              <div className="flex items-center justify-end pr-2 min-w-0">
                {adalahZona ? (
                  <BadgeZonaNilai zona={b.kiri} />
                ) : (
                  <span
                    className={`min-w-0 break-words text-right text-micro sm:text-body-md ${
                      kiriKuat ? "font-bold text-ink" : "font-medium text-body"
                    }`}
                  >
                    {b.kiri}
                  </span>
                )}
              </div>

              {/* Kolom Tengah: Nama Item yang Dibandingkan + Tooltip (?) */}
              <div className="flex items-center justify-center px-1 text-center">
                <span className="text-micro sm:text-body-md font-medium text-muted leading-tight text-center">
                  {b.label}
                </span>
                <TanyaTooltip istilah={b.label} />
              </div>

              {/* Kolom Kanan: Nilai Desa Kembar */}
              <div className="flex items-center justify-start gap-1.5 pl-2 min-w-0">
                {!lintasKabupaten && <TandaArah arah={b.arah} />}
                {adalahZona ? (
                  <BadgeZonaNilai zona={b.kanan} />
                ) : (
                  <span
                    className={`min-w-0 break-words text-left text-micro sm:text-body-md ${
                      kananKuat ? "font-bold text-ink" : "font-medium text-body"
                    }`}
                  >
                    {b.kanan}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Skor Kesiapan Kedua Desa dalam bentuk Radial Charts berdampingan */}
      {!lintasKabupaten && (
        <RadialKesiapan kiri={kiri} kanan={kanan} sumbu={sumbu} />
      )}
    </section>
  );
}
