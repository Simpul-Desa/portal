import {
  Activity,
  Building,
  Clock,
  Mountain,
  Plane,
  Ship,
  Waves,
} from "lucide-react";

import { formatAngka, formatPersen, formatSatuan, strip } from "@/shared/format";

import type { KartuBiofisik, KartuLogistik } from "../types";
import { TanyaTooltip } from "./tanya-tooltip";

function labelElevasi(m: number | null): string {
  if (m === null) return "";
  if (m < 100) return "Dataran Rendah";
  if (m <= 500) return "Perbukitan Sedang";
  return "Dataran Tinggi";
}

function labelRelief(m: number | null): string {
  if (m === null) return "";
  if (m < 50) return "Datar / Landai";
  if (m <= 150) return "Bergelombang";
  return "Curam / Terjal";
}

function labelPantai(km: number | null): string {
  if (km === null) return "";
  if (km < 5) return "Zona Pesisir";
  if (km <= 20) return "Dekat Pantai";
  return "Pedalaman";
}

function labelAkses(menit: number | null): { teks: string; kelas: string } {
  if (menit === null) return { teks: "", kelas: "" };
  if (menit <= 45) return { teks: "Akses Cepat", kelas: "text-positive dark:text-emerald-300 bg-positive/10 dark:bg-emerald-500/15 border border-transparent dark:border-emerald-500/25" };
  if (menit <= 90) return { teks: "Akses Sedang", kelas: "text-primary dark:text-amber-300 bg-primary/10 dark:bg-amber-500/15 border border-transparent dark:border-amber-500/25" };
  return { teks: "Akses Terbatas", kelas: "text-muted dark:text-slate-300 bg-surface dark:bg-surface/80 border border-transparent dark:border-line/60" };
}

/**
 * Seksi Biofisik & Logistik:
 * Menampilkan karakteristik bentang alam (elevasi, topografi, jarak pantai)
 * serta aksesibilitas logistik ke simpul ekonomi (kota, bandara, pelabuhan)
 * dengan kartu kontras (bg-float) dan penjelas istilah (?).
 */
export function SeksiBiofisikLogistik({
  biofisik,
  logistik,
}: {
  biofisik: KartuBiofisik;
  logistik: KartuLogistik;
}) {
  const bioKosong = "kosong" in biofisik;
  const logKosong = "kosong" in logistik;

  return (
    <div className="space-y-4">
      {/* 1. Karakteristik Biofisik */}
      <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Mountain className="size-4 text-muted" />
            <h4 className="text-title-sm font-semibold text-ink">Bentang Alam Biofisik</h4>
          </div>
          {bioKosong && (
            <span className="text-micro text-muted px-2 py-0.5 rounded-full bg-surface">
              {biofisik.kosong}
            </span>
          )}
        </div>

        {bioKosong ? (
          <p className="text-micro text-muted">Data geometri biofisik belum tersedia untuk desa ini.</p>
        ) : (
          <div>
            <div className="grid grid-cols-3 gap-2">
              {/* Elevasi */}
              <div className="rounded-xs bg-surface p-3 border border-hairline/60">
                <span className="flex items-center gap-1.5 text-micro text-muted">
                  <Mountain className="size-3.5 text-muted" />
                  Elevasi
                </span>
                <p className="mt-1 text-title-md font-bold text-ink">
                  {biofisik.elevasi_m === null ? strip(null) : formatSatuan(biofisik.elevasi_m, "m")}
                </p>
                <p className="mt-0.5 text-micro text-muted">
                  {labelElevasi(biofisik.elevasi_m)}
                </p>
              </div>

              {/* Relief */}
              <div className="rounded-xs bg-surface p-3 border border-hairline/60">
                <div className="flex items-center">
                  <span className="flex items-center gap-1.5 text-micro text-muted">
                    <Activity className="size-3.5 text-muted" />
                    Relief
                  </span>
                  <TanyaTooltip istilah="Relief" />
                </div>
                <p className="mt-1 text-title-md font-bold text-ink">
                  {biofisik.relief_m === null ? strip(null) : formatSatuan(biofisik.relief_m, "m")}
                </p>
                <p className="mt-0.5 text-micro text-muted">
                  {labelRelief(biofisik.relief_m)}
                </p>
              </div>

              {/* Jarak Pantai */}
              <div className="rounded-xs bg-surface p-3 border border-hairline/60">
                <span className="flex items-center gap-1.5 text-micro text-muted">
                  <Waves className="size-3.5 text-muted" />
                  Ke Pantai
                </span>
                <p className="mt-1 text-title-md font-bold text-ink">
                  {biofisik.pantai_km === null ? strip(null) : formatSatuan(biofisik.pantai_km, "km")}
                </p>
                <p className="mt-0.5 text-micro text-muted">
                  {labelPantai(biofisik.pantai_km)}
                </p>
              </div>
            </div>

            {/* Tutupan Lahan jika ada */}
            {biofisik.tutupan_lahan && Object.keys(biofisik.tutupan_lahan).length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-hairline/60">
                <div className="flex items-center mb-1.5">
                  <span className="text-micro text-muted font-medium">
                    Tutupan Lahan Dominan:
                  </span>
                  <TanyaTooltip istilah="Tutupan Lahan" />
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(biofisik.tutupan_lahan).map(([kelas, proporsi]) => (
                    <span
                      key={kelas}
                      className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-0.5 text-micro text-ink border border-hairline"
                    >
                      <span className="capitalize">{kelas}</span>
                      <strong className="font-semibold text-primary">
                        {formatPersen(proporsi * 100)}
                      </strong>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Aksesibilitas & Konektivitas Logistik Pasar */}
      <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <Clock className="size-4 text-muted" />
            <h4 className="text-title-sm font-semibold text-ink">Aksesibilitas Simpul Pasar</h4>
          </div>
          {logKosong && (
            <span className="text-micro text-muted px-2 py-0.5 rounded-full bg-surface">
              {logistik.kosong}
            </span>
          )}
        </div>

        {logKosong ? (
          <p className="text-micro text-muted">Data logistik dan konektivitas belum tersedia untuk desa ini.</p>
        ) : (
          <div className="space-y-2.5">
            {/* Pusat Kota */}
            <div className="flex items-center justify-between rounded-xs bg-surface p-3 border border-hairline/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-float text-muted">
                  <Building className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-micro font-medium text-ink truncate">
                    {strip(logistik.pusat_kota)}
                  </p>
                  <p className="text-micro text-muted">
                    Pusat kota terdekat
                    {logistik.km_lurus_ke_pusat_kota !== null &&
                      ` (${formatSatuan(logistik.km_lurus_ke_pusat_kota, "km")} lurus)`}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-title-sm font-bold text-ink">
                  {logistik.menit_ke_pusat_kota !== null
                    ? formatSatuan(logistik.menit_ke_pusat_kota, "menit")
                    : strip(null)}
                </p>
                {logistik.menit_ke_pusat_kota !== null && (
                  <span className={`text-badge px-1.5 py-0.2 rounded-full font-medium ${labelAkses(logistik.menit_ke_pusat_kota).kelas}`}>
                    {labelAkses(logistik.menit_ke_pusat_kota).teks}
                  </span>
                )}
              </div>
            </div>

            {/* Bandara */}
            <div className="flex items-center justify-between rounded-xs bg-surface p-3 border border-hairline/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-float text-muted">
                  <Plane className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-micro font-medium text-ink truncate">
                    {strip(logistik.bandara)}
                  </p>
                  <p className="text-micro text-muted">Bandara terdekat</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-title-sm font-bold text-ink">
                  {logistik.menit_ke_bandara !== null
                    ? formatSatuan(logistik.menit_ke_bandara, "menit")
                    : strip(null)}
                </p>
              </div>
            </div>

            {/* Pelabuhan */}
            <div className="flex items-center justify-between rounded-xs bg-surface p-3 border border-hairline/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-float text-muted">
                  <Ship className="size-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-micro font-medium text-ink truncate">
                    {strip(logistik.pelabuhan)}
                  </p>
                  <p className="text-micro text-muted">Pelabuhan terdekat</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-title-sm font-bold text-ink">
                  {logistik.menit_ke_pelabuhan !== null
                    ? formatSatuan(logistik.menit_ke_pelabuhan, "menit")
                    : strip(null)}
                </p>
              </div>
            </div>

            {/* Sentralitas */}
            <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-micro">
              <div className="flex items-center">
                <span className="text-muted">Indeks Sentralitas Wilayah:</span>
                <TanyaTooltip istilah="Sentralitas" />
              </div>
              <span className="font-bold text-ink">
                {logistik.sentralitas_menit === null
                  ? strip(null)
                  : `${formatAngka(logistik.sentralitas_menit)} menit`}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
