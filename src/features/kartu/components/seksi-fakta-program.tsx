import {
  Compass,
  Fish,
  Landmark,
  Snowflake,
  Sparkles,
} from "lucide-react";

import { formatAngka, formatSatuan, strip } from "@/shared/format";

import type { KartuFaktaProgram } from "../types";
import { TanyaTooltip } from "./tanya-tooltip";

function nilaiSatuan(nilai: number | null, satuan: string): string {
  return nilai === null ? strip(null) : formatSatuan(nilai, satuan);
}

/**
 * Seksi Fakta Program:
 * Menampilkan catatan registri program prioritas nasional (Kemenparekraf & KKP)
 * serta fasilitas rantai dingin (cold storage) dengan kartu putih (bg-float) kontras
 * dan penjelas istilah berbasis tooltip (?).
 */
export function SeksiFaktaProgram({ fakta }: { fakta: KartuFaktaProgram }) {
  const cs = fakta.cold_storage_eksisting;
  const csTerlayani = fakta.cold_storage_terlayani;

  return (
    <div className="space-y-4">
      {/* Banner Belum Tersentuh jika desa belum tercatat di registri manapun */}
      {fakta.belum_tersentuh ? (
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
          <div className="flex items-start gap-3">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-0.5">
              <Compass className="size-4" />
            </span>
            <div>
              <h4 className="text-title-sm font-semibold text-ink">
                Belum Masuk Registri Program
              </h4>
              <p className="mt-1 text-micro text-muted leading-relaxed">
                Desa ini belum muncul di satu pun registri program yang dipantau (Kemenparekraf & KKP).
                Kondisi ini menjadi indikator penting untuk pertimbangan prioritas afirmasi bantuan atau inisiasi program baru.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-inset bg-positive/5 p-3.5 border border-positive/20 flex items-center gap-2.5">
          <Sparkles className="size-4 text-positive shrink-0" />
          <p className="text-micro text-ink font-medium">
            Desa ini telah terdaftar dalam program pembinaan atau memiliki fasilitas intervensi terpantau.
          </p>
        </div>
      )}

      {/* Kartu Kelompok Program */}
      <div className="space-y-3">
        {/* 1. Sektor Pariwisata (Jadesta & Sisparnas) */}
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-hairline">
            <Landmark className="size-4 text-muted" />
            <h4 className="text-title-sm font-semibold text-ink">Pariwisata & Budaya (Kemenparekraf)</h4>
          </div>

          <div className="space-y-2.5 text-micro">
            {/* Jadesta */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <div className="flex items-center">
                <span className="text-muted">Jejaring Desa Wisata (Jadesta)</span>
                <TanyaTooltip istilah="Jadesta" />
              </div>
              {fakta.jadesta ? (
                <div className="flex flex-wrap items-center gap-1.5 font-medium text-ink">
                  <span className="px-2 py-0.5 rounded-full bg-positive/10 text-positive dark:text-emerald-300 dark:bg-emerald-500/15 border border-transparent dark:border-emerald-500/25 text-badge font-semibold">
                    {fakta.jadesta.kategori}
                  </span>
                  <span>
                    {formatAngka(fakta.jadesta.n_atraksi)} atraksi • {formatAngka(fakta.jadesta.n_paket)} paket • {formatAngka(fakta.jadesta.n_homestay)} homestay
                  </span>
                </div>
              ) : (
                <span className="text-muted italic">Belum terdaftar</span>
              )}
            </div>

            {/* Sisparnas */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pt-2 border-t border-hairline/60">
              <div className="flex items-center">
                <span className="text-muted">Registri Sisparnas</span>
                <TanyaTooltip istilah="Sisparnas" />
              </div>
              {fakta.desa_wisata_sisparnas ? (
                <span className="font-medium text-ink">
                  {fakta.desa_wisata_sisparnas.nama} ({formatAngka(fakta.desa_wisata_sisparnas.n_terdaftar)} entri)
                </span>
              ) : (
                <span className="text-muted italic">Belum terdaftar</span>
              )}
            </div>

            {/* Daya Tarik Wisata */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-hairline/60">
              <span className="text-muted">Daya Tarik Wisata</span>
              <span className="font-semibold text-ink">
                {fakta.n_daya_tarik_wisata === null ? strip(null) : formatSatuan(fakta.n_daya_tarik_wisata, "titik")}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Sektor Kelautan & Perikanan */}
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-hairline">
            <Fish className="size-4 text-muted" />
            <h4 className="text-title-sm font-semibold text-ink">Kelautan & Perikanan (KKP)</h4>
          </div>

          <div className="space-y-2.5 text-micro">
            {/* Kampung Budidaya */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-muted">Kampung Perikanan Budidaya</span>
              {fakta.kampung_budidaya ? (
                <span className="px-2 py-0.5 rounded-full bg-positive/10 text-positive dark:text-emerald-300 dark:bg-emerald-500/15 border border-transparent dark:border-emerald-500/25 text-badge font-semibold">
                  {fakta.kampung_budidaya.komoditas}
                </span>
              ) : (
                <span className="text-muted italic">Belum terdaftar</span>
              )}
            </div>

            {/* Kampung Nelayan */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-hairline/60">
              <span className="text-muted">Kampung Nelayan Maju</span>
              {fakta.kampung_nelayan ? (
                <span className="font-medium text-ink">
                  {fakta.kampung_nelayan.program} ({fakta.kampung_nelayan.tahun})
                </span>
              ) : (
                <span className="text-muted italic">Belum terdaftar</span>
              )}
            </div>
          </div>
        </div>

        {/* 3. Fasilitas Rantai Pendingin (Cold Storage) */}
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
          <div className="flex items-center gap-2 pb-2.5 mb-2.5 border-b border-hairline">
            <Snowflake className="size-4 text-muted" />
            <h4 className="text-title-sm font-semibold text-ink">Rantai Dingin & Pasca Panen</h4>
            <TanyaTooltip istilah="Cold Storage" />
          </div>

          <div className="space-y-2.5 text-micro">
            {/* Unit di desa */}
            <div className="flex items-center justify-between gap-1">
              <span className="text-muted">Cold Storage Eksisting di Desa</span>
              {cs && cs.length > 0 ? (
                <span className="font-semibold text-ink">
                  {strip(cs[0].status)} • {nilaiSatuan(cs[0].kapasitas_ton, "ton")}
                  {cs.length > 1 && ` (+${formatAngka(cs.length - 1)} unit)`}
                </span>
              ) : (
                <span className="text-muted italic">Tidak ada unit di desa</span>
              )}
            </div>

            {/* Keterlayanan luar desa */}
            <div className="flex items-center justify-between gap-1 pt-2 border-t border-hairline/60">
              <span className="text-muted">Keterlayanan Unit Terdekat</span>
              {csTerlayani ? (
                <span className="font-semibold text-ink">
                  {strip(csTerlayani.unit_di_desa)} • {nilaiSatuan(csTerlayani.kapasitas_ton, "ton")} • {nilaiSatuan(csTerlayani.menit_ke_unit, "menit")}
                </span>
              ) : (
                <span className="text-muted italic">Tidak terlayani</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <p className="text-micro text-muted px-1">{fakta.catatan}</p>
    </div>
  );
}
