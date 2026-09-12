import { Database } from "lucide-react";

import { formatPersen, strip } from "@/shared/format";

import type { KartuMutuData } from "../types";
import { TanyaTooltip } from "./tanya-tooltip";

/**
 * Seksi Mutu Data:
 * Menampilkan kelengkapan sumber data primer (Geometri, ST2023, IDM)
 * dan rasio kelengkapan bukti SK secara ringkas dan rapi, dengan penjelas istilah (?).
 */
export function SeksiMutuData({ mutuData }: { mutuData: KartuMutuData }) {
  return (
    <section className="rounded-card bg-surface p-4 border border-line/30 shadow-xs" aria-label="Mutu Data">
      <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-hairline">
        <Database className="size-4 text-muted" />
        <h3 className="text-title-sm font-semibold text-ink">Integritas & Mutu Data</h3>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Geometri */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-float px-3 py-1 text-micro text-ink border border-hairline">
          <span
            className={`size-2 rounded-full ${mutuData.punya_geometri ? "bg-positive" : "bg-muted/40"}`}
            aria-hidden="true"
          />
          <span>Geometri Wilayah:</span>
          <strong className="font-semibold text-ink">
            {mutuData.punya_geometri ? "Lengkap" : "Tidak Ada"}
          </strong>
        </span>

        {/* ST2023 */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-float px-3 py-1 text-micro text-ink border border-hairline">
          <span
            className={`size-2 rounded-full ${mutuData.punya_st2023 ? "bg-positive" : "bg-muted/40"}`}
            aria-hidden="true"
          />
          <span>Sensus Pertanian (ST2023):</span>
          <strong className="font-semibold text-ink">
            {mutuData.punya_st2023 ? "Lengkap" : "Tidak Ada"}
          </strong>
          <TanyaTooltip istilah="ST2023" />
        </span>

        {/* IDM */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-float px-3 py-1 text-micro text-ink border border-hairline">
          <span
            className={`size-2 rounded-full ${mutuData.punya_idm ? "bg-positive" : "bg-muted/40"}`}
            aria-hidden="true"
          />
          <span>Indeks Desa Membangun (IDM):</span>
          <strong className="font-semibold text-ink">
            {mutuData.punya_idm ? "Lengkap" : "Tidak Ada"}
          </strong>
          <TanyaTooltip istilah="Indeks Desa Membangun" />
        </span>

        {/* Kelengkapan Bukti SK */}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-float px-3 py-1 text-micro text-ink border border-hairline">
          <span className="text-muted">Kelengkapan Bukti SK:</span>
          <strong className="font-bold text-primary">
            {mutuData.kelengkapan_bukti_sk === null
              ? strip(null)
              : formatPersen(mutuData.kelengkapan_bukti_sk * 100)}
          </strong>
          <TanyaTooltip istilah="Kelengkapan Bukti SK" />
        </span>
      </div>
    </section>
  );
}
