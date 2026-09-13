"use client";

import { Compass, Snowflake, Warehouse, Wheat } from "lucide-react";

import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

type WilayahState = ReturnType<typeof useWilayahParams>;

type PilihVarianProps = {
  varian: Varian;
  onPilih: WilayahState["pilihVarian"];
};

export const DAFTAR_VARIAN_TAB = [
  { slug: "komoditas", label: "Komoditas", Ikon: Wheat },
  { slug: "gudang-kopdes", label: "Gudang Kopdes", Ikon: Warehouse },
  { slug: "cold-storage", label: "Cold Storage", Ikon: Snowflake },
  { slug: "wisata", label: "Wisata", Ikon: Compass },
] as const;

/**
 * Tab pemilih varian Jalur Ekonomi:
 * Tampil penuh (grid 4 kolom pada tablet/desktop, 2x2 pada layar sempit),
 * dilengkapi ikon spesifik tiap varian, gaya visual konsisten dengan Kartu Ekonomi Desa.
 */
export function PilihVarian({ varian, onPilih }: PilihVarianProps) {
  return (
    <div
      role="tablist"
      aria-label="Pilihan Varian Jalur Ekonomi"
      className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 w-full"
    >
      {DAFTAR_VARIAN_TAB.map((tab) => {
        const aktif = tab.slug === varian;
        const Ikon = tab.Ikon;

        return (
          <button
            key={tab.slug}
            role="tab"
            type="button"
            id={`tab-varian-${tab.slug}`}
            aria-selected={aktif}
            aria-controls="panel-jalur-ekonomi"
            onClick={() => {
              if (!aktif) onPilih(tab.slug);
            }}
            className={`flex items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-2 text-micro transition-all cursor-pointer ${
              aktif
                ? "bg-ink text-canvas font-medium shadow-xs"
                : "bg-surface text-muted hover:text-ink hover:bg-float border border-transparent hover:border-line-strong"
            } ${FOCUS_RING}`}
          >
            <Ikon className={`size-3.5 shrink-0 ${aktif ? "text-canvas" : "text-muted"}`} />
            <span className="truncate">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
