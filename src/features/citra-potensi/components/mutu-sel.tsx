"use client";

import { BarisLabelNilai } from "@/features/kartu/components/baris-label-nilai";
import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import { RampMeter } from "@/shared/components/charts";
import { formatAngka } from "@/shared/format";

import { namaKomoditas, temaDari } from "../services/sel";
import type { SelCitra } from "../types";

type MutuSelProps = {
  sel: SelCitra;
};

/**
 * Kartu mutu sel + legenda ramp (Task 20). Legenda memakai `RampMeter` TANPA
 * `nilai` (Task 23) — tick row saja, tanpa penanda, karena kartu ini tidak
 * mengacu ke satu desa (subjeknya sel, bukan wilayah). Kalimat "relatif
 * dalam kabupaten" WAJIB tampil — `data/machine-learning/citra-potensi-desa/
 * README.md` §7 melarang perbandingan skor lintas kabupaten, dan hanya
 * kalimat ini yang menyatakan batas itu (warna sendiri tidak bisa).
 */
export function MutuSel({ sel }: MutuSelProps) {
  const tema = temaDari(sel.subsektor) ?? "Komoditas lain";
  const [bawah, atas] = sel.ci_rerata;

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">
        {namaKomoditas(sel.nama)} · {tema}
      </h3>

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        <BarisLabelNilai
          label={
            <span className="inline-flex items-center">
              <span>Mutu uji tertahan</span>
              <TanyaTooltip istilah="Mutu Uji" />
            </span>
          }
        >
          {formatAngka(sel.ap_uji_tertahan)}
        </BarisLabelNilai>
        <BarisLabelNilai
          label={
            <span className="inline-flex items-center">
              <span>Rentang keyakinan</span>
              <TanyaTooltip istilah="Rentang Keyakinan" />
            </span>
          }
        >
          {formatAngka(bawah)}–{formatAngka(atas)}
        </BarisLabelNilai>
      </div>

      <div className="mt-4">
        <RampMeter tinggi="kecil" />
        <div className="mt-1 flex items-center justify-between text-micro text-muted">
          <span>rendah</span>
          <span>tinggi</span>
        </div>
      </div>

      <p className="mt-3 text-micro text-muted">
        Skor dan peringkat berlaku di dalam satu kabupaten. Angka dari dua kabupaten tidak sebanding.
      </p>
    </section>
  );
}
