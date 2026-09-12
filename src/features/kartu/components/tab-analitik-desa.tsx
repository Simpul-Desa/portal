"use client";

import { useState } from "react";
import {
  Building2,
  Landmark,
  Mountain,
  Wheat,
} from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import type { KartuDesa } from "../types";
import { SeksiBiofisikLogistik } from "./seksi-biofisik-logistik";
import { SeksiFaktaProgram } from "./seksi-fakta-program";
import { SeksiKesiapan } from "./seksi-kesiapan";
import { SeksiPotensi } from "./seksi-potensi";

type TabId = "potensi" | "kesiapan" | "fakta" | "biofisik";

type TabDef = {
  id: TabId;
  label: string;
  Ikon: React.ComponentType<{ className?: string }>;
};

const DAFTAR_TAB: TabDef[] = [
  { id: "potensi", label: "Potensi Dominan", Ikon: Wheat },
  { id: "kesiapan", label: "Kesiapan", Ikon: Building2 },
  { id: "fakta", label: "Fakta Program", Ikon: Landmark },
  { id: "biofisik", label: "Biofisik & Logistik", Ikon: Mountain },
];

/**
 * Tab Analitik Desa:
 * Menggabungkan 4 dimensi analisis desa (Potensi Dominan, Kesiapan, Fakta Program,
 * dan Biofisik & Logistik) ke dalam antarmuka tab yang bersih, intuitif, dan responsif.
 */
export function TabAnalitikDesa({ kartu }: { kartu: KartuDesa }) {
  const [tabAktif, setTabAktif] = useState<TabId>("potensi");

  return (
    <section className="space-y-3" aria-label="Analisis Rinci Desa">
      {/* Navigasi Tab */}
      <div
        role="tablist"
        aria-label="Pilihan Dimensi Analisis"
        className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
      >
        {DAFTAR_TAB.map((tab) => {
          const aktif = tabAktif === tab.id;
          const Ikon = tab.Ikon;

          return (
            <button
              key={tab.id}
              role="tab"
              type="button"
              id={`tab-${tab.id}`}
              aria-selected={aktif}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setTabAktif(tab.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-micro transition-all cursor-pointer ${
                aktif
                  ? "bg-ink text-white font-medium shadow-xs"
                  : "bg-surface text-muted hover:text-ink hover:bg-float border border-transparent hover:border-line-strong"
              } ${FOCUS_RING}`}
            >
              <Ikon className={`size-3.5 ${aktif ? "text-white" : "text-muted"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Konten Tab Panel */}
      <div
        role="tabpanel"
        id={`panel-${tabAktif}`}
        aria-labelledby={`tab-${tabAktif}`}
        className="rounded-card bg-surface p-4 border border-line/30 shadow-xs"
      >
        {tabAktif === "potensi" && <SeksiPotensi potensi={kartu.potensi} />}
        {tabAktif === "kesiapan" && (
          <SeksiKesiapan komponen={kartu.kesiapan.komponen} kesiapan={kartu.kesiapan} />
        )}
        {tabAktif === "fakta" && <SeksiFaktaProgram fakta={kartu.fakta_program} />}
        {tabAktif === "biofisik" && (
          <SeksiBiofisikLogistik biofisik={kartu.biofisik} logistik={kartu.logistik} />
        )}
      </div>
    </section>
  );
}
