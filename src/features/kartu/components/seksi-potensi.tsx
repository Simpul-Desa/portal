import { BadgeSumber } from "@/shared/components/badge-sumber";
import { RampMeter } from "@/shared/components/charts";
import { strip } from "@/shared/format";

import { KUNCI_TEMA, type KartuPotensi } from "../types";

export function SeksiPotensi({ potensi }: { potensi: KartuPotensi }) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Potensi Dominan</h3>

      <div className="mt-4 flex items-center justify-between gap-3">
        <p className="text-title-sm text-ink">{strip(potensi.dominan)}</p>
        {potensi.sumber_dominan && <BadgeSumber sumber={potensi.sumber_dominan} />}
      </div>

      <div className="mt-3">
        {KUNCI_TEMA.map((kunci) => {
          const tema = potensi.sub_skor[kunci];
          return (
            <div key={kunci} className="mt-3 first:mt-0">
              <p className="text-label text-muted">{tema.label}</p>
              {tema.persentil === null ? (
                <p className="mt-1 text-body-md text-ink">
                  {strip(null)} <span className="text-micro text-muted">{tema.kosong}</span>
                </p>
              ) : (
                <div className="mt-1" role="img" aria-label={`Persentil ${tema.persentil} dari 100`}>
                  <RampMeter nilai={tema.persentil / 100} tinggi="kecil" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
