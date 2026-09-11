"use client";

import { useMemo } from "react";

import { ZONA_SLUG, type ZonaSlug } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { formatAngka, strip } from "@/shared/format";

import {
  type BarisPetaPeran,
  NAMA_ZONA,
  type NamaZona,
} from "../types";
import { KELAS_DOT_ZONA } from "./filter-zona";
import { IstilahTooltip } from "./istilah-tooltip";

const SLUG_DARI_ZONA = Object.fromEntries(
  Object.entries(ZONA_SLUG).map(([slug, nama]) => [nama, slug as ZonaSlug])
) as Record<NamaZona, ZonaSlug>;

type MatriksPetaPeranProps = {
  desaItems?: readonly BarisPetaPeran[];
  desaAktif?: string;
  zonaAktif?: ZonaSlug;
  onPilihDesa?: (iddesa: string) => void;
  onPilihZona?: (zona: ZonaSlug | undefined) => void;
};

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const DESKRIPSI_RINGKAS_ZONA: Record<NamaZona, { kuadran: string; ringkasan: string }> = {
  "Zona Pemerintah": {
    kuadran: "Kuadran I",
    ringkasan: "Potensi tinggi, kesiapan rendah · Prioritas Dana Desa & infrastruktur",
  },
  "Zona Mitra": {
    kuadran: "Kuadran II",
    ringkasan: "Potensi & kesiapan tinggi · Prioritas kemitraan offtaker & investor",
  },
  "Zona Poros": {
    kuadran: "Kuadran III",
    ringkasan: "Kesiapan tinggi · Pusat pengolahan & layanan desa sekitar",
  },
  "Zona Bantuan": {
    kuadran: "Kuadran IV",
    ringkasan: "Kebutuhan dasar & perlindungan sosial · Bantuan tepat sasaran",
  },
  "Belum Terpetakan": {
    kuadran: "Non-Kuadran",
    ringkasan: "Kelengkapan data belum mencukupi untuk penetapan zona",
  },
};

/**
 * Matriks Peta Peran (Kuadran Dua Sumbu Tingkat Kabupaten):
 * - Sumbu Y: Skor Potensi (Bawah = Rendah, Atas = Tinggi), label miring di sisi kiri luar kanvas.
 * - Sumbu X: Skor Kesiapan (Kiri = Rendah, Kanan = Tinggi), label miring di sisi bawah luar kanvas.
 * - Label kuadran ditempatkan di luar area sebaran titik agar tidak tertutup titik.
 * - Legend zona ditata berjajar vertikal dengan indikator kuadran, tooltip, dan cacah desa.
 */
export function MatriksPetaPeran({
  desaItems = [],
  desaAktif,
  zonaAktif,
  onPilihDesa,
  onPilihZona,
}: MatriksPetaPeranProps) {
  // Data titik sebaran desa pada bidang koordinat
  const titikDesa = useMemo(() => {
    return desaItems.map((d) => {
      const sp = d.desil_sp;
      const sk = d.desil_sk;
      const h = hashString(d.iddesa);

      // Jitter deterministik aman (±2.5%) agar titik dengan desil sama tidak menumpuk,
      // tanpa pernah menyeberangi garis tengah kuadran (50%).
      const jx = (((h % 100) - 50) / 100) * 5;
      const jy = ((((h >> 7) % 100) - 50) / 100) * 5;

      let x = 50;
      let y = 50;

      if (sk !== null && sk !== undefined) {
        if (sk <= 5) {
          x = 6 + ((sk - 1) / 4) * 38;
        } else {
          x = 56 + ((sk - 6) / 4) * 38;
        }
      }

      if (sp !== null && sp !== undefined) {
        if (sp >= 6) {
          y = 6 + ((10 - sp) / 4) * 38;
        } else {
          y = 56 + ((5 - sp) / 4) * 38;
        }
      }

      if (sp === null || sk === null) {
        x = 10 + (h % 80);
        y = 96;
      } else {
        x = Math.max(4, Math.min(96, x + jx));
        y = Math.max(4, Math.min(96, y + jy));
      }

      return {
        id: d.iddesa,
        nama: d.nmdesa,
        subnama: `Kec. ${d.nmkec}`,
        zona: d.zona,
        keyakinan: d.keyakinan,
        desil_sp: d.desil_sp,
        desil_sk: d.desil_sk,
        x,
        y,
      };
    });
  }, [desaItems]);

  // Cacah desa per zona
  const cacahZona: Record<NamaZona, number> = useMemo(() => {
    const hasil: Record<NamaZona, number> = {
      "Zona Pemerintah": 0,
      "Zona Mitra": 0,
      "Zona Poros": 0,
      "Zona Bantuan": 0,
      "Belum Terpetakan": 0,
    };
    for (const d of desaItems) {
      if (hasil[d.zona] !== undefined) {
        hasil[d.zona] += 1;
      }
    }
    return hasil;
  }, [desaItems]);

  const titikTerpilih = titikDesa.find((t) => t.id === desaAktif);

  return (
    <section className="rounded-card bg-surface p-5">
      {/* Header Matriks */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-title-sm text-ink font-semibold">Matriks Peta Peran</h3>
          <p className="mt-0.5 text-micro text-muted">
            {formatAngka(desaItems.length)} Desa & Kelurahan
          </p>
        </div>
        {zonaAktif && (
          <button
            type="button"
            onClick={() => onPilihZona?.(undefined)}
            className="text-micro text-primary hover:text-primary-active underline decoration-dashed transition-colors"
          >
            Reset sorotan zona
          </button>
        )}
      </div>

      {/* Label Kuadran Atas (Terpisah di luar kanvas, tidak tertutup titik) */}
      <div className="mt-4 flex items-center justify-between px-10 text-[11px] text-muted">
        <span className="font-medium text-map-zona-pemerintah">
          Kuadran I · Zona Pemerintah
        </span>
        <span className="font-medium text-map-zona-mitra">
          Kuadran II · Zona Mitra
        </span>
      </div>

      {/* Area Plot Matriks Bersama Sumbu Vertikal */}
      <div className="mt-1 flex items-stretch gap-1.5">
        {/* Sumbu Vertikal Kiri (Skor Potensi) */}
        <div className="flex w-7 shrink-0 flex-col items-center justify-between py-2 text-muted select-none">
          <span className="text-[10px] font-medium leading-none">Tinggi ↑</span>
          <div className="flex items-center justify-center my-auto -rotate-90 whitespace-nowrap">
            <IstilahTooltip
              istilah="Skor Potensi"
              tampilkanIkon={false}
              className="text-micro font-medium italic text-ink tracking-wider cursor-help"
            />
          </div>
          <span className="text-[10px] font-medium leading-none">↓ Rendah</span>
        </div>

        {/* Kanvas Kotak Matriks 4 Kuadran */}
        <div className="relative h-64 flex-1 rounded-inset bg-inset border border-hairline overflow-hidden select-none">
          {/* Latar Belakang Tint Kuadran */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
            <div className="bg-map-zona-pemerintah/[0.04] border-r border-b border-dashed border-line-strong/40" />
            <div className="bg-map-zona-mitra/[0.04] border-b border-dashed border-line-strong/40" />
            <div className="bg-map-zona-bantuan/[0.04] border-r border-dashed border-line-strong/40" />
            <div className="bg-map-zona-poros/[0.04]" />
          </div>

          {/* Crosshair Guide Lines untuk Desa Terpilih */}
          {titikTerpilih && (
            <svg className="pointer-events-none absolute inset-0 size-full z-10">
              <line
                x1={`${titikTerpilih.x}%`}
                y1="0"
                x2={`${titikTerpilih.x}%`}
                y2="100%"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="text-primary/60"
              />
              <line
                x1="0"
                y1={`${titikTerpilih.y}%`}
                x2="100%"
                y2={`${titikTerpilih.y}%`}
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="2 2"
                className="text-primary/60"
              />
            </svg>
          )}

          {/* Sebaran Titik Dot Desa */}
          <div className="absolute inset-0 z-20">
            {titikDesa.map((t) => {
              const isTerpilih = t.id === desaAktif;
              const slug = SLUG_DARI_ZONA[t.zona];
              const isZonaCocok = !zonaAktif || slug === zonaAktif;
              const warnaDot = KELAS_DOT_ZONA[t.zona] || "bg-faint";

              return (
                <Tooltip key={t.id}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => onPilihDesa?.(t.id)}
                      aria-label={`${t.nama} (${t.zona})`}
                      style={{
                        left: `${t.x}%`,
                        top: `${t.y}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 cursor-pointer ${FOCUS_RING} ${
                        isTerpilih
                          ? "size-3.5 ring-2 ring-primary ring-offset-2 ring-offset-inset z-30 scale-125"
                          : "size-2 hover:scale-150 hover:z-30"
                      } ${warnaDot} ${
                        !isZonaCocok
                          ? "opacity-15 scale-75"
                          : isTerpilih
                          ? "opacity-100"
                          : "opacity-80 hover:opacity-100"
                      }`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-micro p-2.5 max-w-xs shadow-float z-50">
                    <p className="font-semibold text-white">{t.nama}</p>
                    <p className="text-on-dark-muted text-[11px]">{t.subnama}</p>
                    <div className="mt-1.5 flex items-center gap-1.5">
                      <span className={`inline-block size-2 rounded-full ${warnaDot}`} />
                      <span className="text-white text-[11px] font-medium">{t.zona}</span>
                    </div>
                    {t.desil_sp !== null && t.desil_sk !== null && (
                      <p className="text-on-dark-muted text-[10px] mt-0.5">
                        Potensi Desil {strip(t.desil_sp)} · Kesiapan Desil {strip(t.desil_sk)}
                      </p>
                    )}
                    <p className="text-primary-soft text-[10px] mt-1 italic">
                      Klik untuk membuka detail desa ini
                    </p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>

      {/* Label Kuadran Bawah (Terpisah di luar kanvas, tidak tertutup titik) */}
      <div className="mt-1 flex items-center justify-between px-10 text-[11px] text-muted">
        <span className="font-medium text-map-zona-bantuan">
          Kuadran IV · Zona Bantuan
        </span>
        <span className="font-medium text-map-zona-poros">
          Kuadran III · Zona Poros
        </span>
      </div>

      {/* Sumbu Horizontal Bawah (Skor Kesiapan) */}
      <div className="mt-1.5 flex items-center justify-between pl-8 pr-2 text-muted select-none">
        <span className="text-[10px] font-medium leading-none">← Rendah</span>
        <div className="flex items-center gap-1">
          <IstilahTooltip
            istilah="Skor Kesiapan"
            tampilkanIkon={false}
            className="text-micro font-medium italic text-ink tracking-wider cursor-help"
          />
        </div>
        <span className="text-[10px] font-medium leading-none">Tinggi →</span>
      </div>

      {/* Legend Zona Berjajar Vertikal di Bawah Matriks (Point 3) */}
      <div className="mt-5 pt-4 border-t border-hairline">
        <div className="flex items-center justify-between mb-2.5">
          <p className="text-micro text-muted font-medium">Distribusi Zona Penanganan</p>
          <span className="text-[11px] text-muted">Klik untuk menyorot di matriks</span>
        </div>

        <div className="flex flex-col gap-1.5">
          {NAMA_ZONA.map((nama) => {
            const cacah = cacahZona[nama] ?? 0;
            const slug = SLUG_DARI_ZONA[nama];
            const aktif = zonaAktif === slug;
            const dot = KELAS_DOT_ZONA[nama];
            const info = DESKRIPSI_RINGKAS_ZONA[nama];

            return (
              <div
                key={nama}
                role="button"
                tabIndex={0}
                onClick={() => onPilihZona?.(aktif ? undefined : slug)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onPilihZona?.(aktif ? undefined : slug);
                  }
                }}
                className={`flex w-full items-center justify-between gap-3 rounded-inset px-3 py-2 text-left transition-colors border-transparent hover:bg-inset cursor-pointer select-none ${FOCUS_RING} ${
                  aktif ? "bg-inset ring-1 ring-line-strong" : ""
                }`}
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <span className={`mt-1 size-2.5 shrink-0 rounded-full ${dot}`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-micro font-medium text-ink">{nama}</span>
                      <span className="text-[10px] rounded bg-surface px-1.5 py-0.2 text-muted">
                        {info.kuadran}
                      </span>
                      <IstilahTooltip istilah={nama} label="" tampilkanIkon={true} />
                    </div>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      {info.ringkasan}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-micro font-semibold text-ink">{formatAngka(cacah)}</span>
                  <span className="block text-[10px] text-muted">wilayah</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
