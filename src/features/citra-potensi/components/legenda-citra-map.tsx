"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import { RampMeter } from "@/shared/components/charts";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import { useCitraSel } from "../hooks/queries";
import { barisSkor, namaKomoditas } from "../services/sel";

export type LegendaCitraMapProps = {
  prov?: string;
  kab?: string;
  target?: string;
  desa?: string;
};

/**
 * Legenda skala choropleth Citra Potensi Desa di atas peta.
 * Menampilkan RampMeter varian legenda (DESIGN.md § Score choropleth)
 * untuk mengidentifikasi arti gradien warna pada poligon desa di peta.
 * Tampil khusus saat lensa Citra Potensi Desa sedang terbuka.
 */
export function LegendaCitraMap({
  prov,
  kab,
  target,
  desa,
}: LegendaCitraMapProps) {
  const [collapsed, setCollapsed] = useState(false);
  const sel = useCitraSel(prov, target, true);

  const baris = useMemo(() => {
    if (!sel.data || !kab) return [];
    return barisSkor(sel.data, kab);
  }, [sel.data, kab]);

  const barisDesa = useMemo(() => {
    if (!desa || baris.length === 0) return null;
    return baris.find((b) => b.iddesa === desa) ?? null;
  }, [desa, baris]);

  const nilai = barisDesa ? barisDesa.skor100 / 100 : undefined;
  const namaKom = sel.data?.nama ? namaKomoditas(sel.data.nama) : null;

  return (
    <aside
      aria-label="Legenda Skor Potensi"
      className="pointer-events-none absolute left-4 bottom-11 z-20 md:left-6 md:bottom-11"
    >
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className={`pointer-events-auto flex items-center gap-2 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-2 text-ink shadow-float transition-all hover:bg-white cursor-pointer ${FOCUS_RING}`}
          aria-label="Tampilkan legenda skor potensi"
          title="Tampilkan legenda skor"
        >
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-micro font-medium text-ink">Skor Citra Potensi</span>
          <ChevronUp className="size-3.5 text-muted" />
        </button>
      ) : (
        <div className="pointer-events-auto flex w-64 sm:w-72 flex-col rounded-2xl bg-white/95 backdrop-blur-md p-3.5 shadow-float transition-all">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-primary shrink-0" />
                <h3 className="text-title-sm font-semibold text-ink leading-tight truncate">
                  Skor Citra Potensi
                </h3>
                <TanyaTooltip istilah="Skor Citra Potensi" />
              </div>
              {namaKom && (
                <p className="text-micro text-muted truncate mt-0.5 pl-3.5">
                  {namaKom}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed(true)}
              aria-label="Sembunyikan legenda skor potensi"
              title="Sembunyikan legenda"
              className={`flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              <ChevronDown className="size-4" />
            </button>
          </div>

          <div className="mt-2.5">
            <RampMeter
              nilai={nilai}
              tinggi="kecil"
              ariaLabel={
                barisDesa
                  ? `Skor desa terpilih ${barisDesa.skor100} dari 100`
                  : undefined
              }
            />
            <div className="mt-1 flex items-center justify-between text-micro text-muted font-mono">
              <span>0 · Rendah</span>
              <span>100 · Tinggi</span>
            </div>
          </div>

          {barisDesa && (
            <div className="mt-2 pt-2 border-t border-hairline flex items-center justify-between text-micro">
              <span className="text-muted">Desa terpilih</span>
              <span className="font-semibold font-mono text-ink">
                Skor: {barisDesa.skor100} (#{barisDesa.peringkat})
              </span>
            </div>
          )}

          <p className="mt-2 text-micro text-muted leading-tight">
            {kab
              ? "Skor relatif di dalam kabupaten terpilih."
              : "Pilih kabupaten untuk melihat persebaran skor."}
          </p>
        </div>
      )}
    </aside>
  );
}
