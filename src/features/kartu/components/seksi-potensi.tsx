import {
  Award,
  Fish,
  Ship,
  Sprout,
  Store,
  TreePine,
  Trees,
  Wheat,
} from "lucide-react";

import { BadgeSumber } from "@/shared/components/badge-sumber";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ArrowUpRightIcon } from "@/shared/components/icons";
import { formatAngka, strip } from "@/shared/format";

import { KUNCI_TEMA, type KartuPotensi, type KunciTema } from "../types";
import { TanyaTooltip } from "./tanya-tooltip";

const IKON_TEMA: Record<KunciTema, React.ComponentType<{ className?: string }>> = {
  tp: Wheat,
  horti: Sprout,
  kebun: Trees,
  ternak: Award,
  ikan: Fish,
  hutan: TreePine,
  tangkap: Ship,
  simpul: Store,
};

function labelTingkat(persentil: number): { teks: string; kelas: string } {
  if (persentil >= 75) return { teks: "Unggul", kelas: "text-positive bg-positive/10" };
  if (persentil >= 50) return { teks: "Menengah Atas", kelas: "text-primary bg-primary/10" };
  if (persentil >= 25) return { teks: "Menengah Bawah", kelas: "text-muted bg-surface" };
  return { teks: "Dasar", kelas: "text-muted bg-surface" };
}

function warnaBar(persentil: number): string {
  if (persentil >= 75) return "bg-positive";
  if (persentil >= 50) return "bg-primary";
  return "bg-muted";
}

type SeksiPotensiProps = {
  potensi: KartuPotensi;
  onNavigasiCitra?: () => void;
};

/**
 * Seksi Potensi Dominan:
 * Menggambarkan sektor keunggulan komparatif ekonomi desa dengan visualisasi
 * persentil kompetitif dari 8 tema sub-skor beserta tooltip penjelasan istilah.
 */
export function SeksiPotensi({ potensi, onNavigasiCitra }: SeksiPotensiProps) {
  const detail = potensi.detail_dominan;

  return (
    <div className="space-y-4">
      {/* Kartu Sorotan Potensi Dominan */}
      <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center">
              <span className="text-micro text-muted uppercase tracking-wider font-medium">
                Sektor Dominan
              </span>
              <TanyaTooltip istilah="Potensi Dominan" />
            </div>
            <h4 className="mt-1 text-title-md font-bold text-ink">
              {strip(potensi.dominan)}
            </h4>
          </div>
          {potensi.sumber_dominan && <BadgeSumber sumber={potensi.sumber_dominan} />}
        </div>

        {detail && (
          <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-hairline text-micro text-muted">
            <span>
              Komoditas: <strong className="text-ink font-medium">{detail.komoditas}</strong>
            </span>
            <span>•</span>
            <span>
              Peringkat kab:{" "}
              <strong className="text-ink font-medium">
                #{detail.peringkat_dlm_kab} dari {detail.n_desa_kab} desa
              </strong>
            </span>
            {detail.skor100 !== null && (
              <>
                <span>•</span>
                <span>
                  Skor: <strong className="text-ink font-medium">{formatAngka(detail.skor100)}/100</strong>
                </span>
              </>
            )}
          </div>
        )}

        <p className="mt-2.5 text-micro text-muted leading-relaxed">
          Sektor dengan skor daya saing komparatif tertinggi yang menjadi penggerak utama pertumbuhan ekonomi desa.
        </p>

        {onNavigasiCitra && (
          <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-end">
            <button
              type="button"
              onClick={onNavigasiCitra}
              className={`group inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-micro font-medium text-ink border border-transparent hover:border-line-strong hover:bg-float hover:text-primary transition-all cursor-pointer ${FOCUS_RING}`}
              title="Arahkan ke fitur Citra Potensi Desa"
            >
              <span>Lihat detail peringkat</span>
              <ArrowUpRightIcon className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
            </button>
          </div>
        )}
      </div>

      {/* Rincian 8 Tema Sub-Skor */}
      <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
          <h4 className="text-title-sm font-semibold text-ink">Profil 8 Sektor Potensi</h4>
          <div className="flex items-center">
            <span className="text-micro text-muted">Persentil (0–100)</span>
            <TanyaTooltip istilah="Persentil" />
          </div>
        </div>

        <div className="space-y-3.5 pt-1">
          {KUNCI_TEMA.map((kunci) => {
            const tema = potensi.sub_skor[kunci];
            const Ikon = IKON_TEMA[kunci];
            const adaNilai = tema.persentil !== null;
            const tingkat = adaNilai ? labelTingkat(tema.persentil as number) : null;

            return (
              <div key={kunci} className="group">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-surface text-muted group-hover:text-ink transition-colors">
                      <Ikon className="size-3.5" />
                    </span>
                    <span className="text-body-md font-medium text-ink truncate">
                      {tema.label}
                    </span>
                    {kunci === "simpul" && <TanyaTooltip istilah="Simpul Jasa" />}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {tingkat && (
                      <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${tingkat.kelas}`}>
                        {tingkat.teks}
                      </span>
                    )}
                    <span className="text-body-md font-semibold text-ink w-9 text-right">
                      {adaNilai ? `${formatAngka(tema.persentil as number)}` : "—"}
                    </span>
                  </div>
                </div>

                {/* Bar visual meter */}
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-hairline">
                  {adaNilai ? (
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${warnaBar(tema.persentil as number)}`}
                      style={{ width: `${Math.min(100, Math.max(0, tema.persentil as number))}%` }}
                    />
                  ) : (
                    <div className="h-full w-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-micro text-muted pt-3 border-t border-hairline">
          Persentil menunjukkan posisi daya saing desa terhadap seluruh desa pembanding di wilayah acuan.
        </p>
      </div>
    </div>
  );
}
