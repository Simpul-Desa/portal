"use client";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import { BadgeSumber } from "@/shared/components/badge-sumber";
import { StatusChip } from "@/shared/components/status-chip";
import { formatAngka, strip } from "@/shared/format";

import type { BarisPetaPeranPenuh } from "../types";

type DetailDesaProps = {
  baris: BarisPetaPeranPenuh;
};

/**
 * Kartu detail zona satu desa (Task 24) — MIRROR
 * `features/kartu/components/seksi-zona.tsx`: susunan dan kalimat sama
 * persis, sumber data beda (baris `GET /api/model/peta-peran/{iddesa}`,
 * bukan blok `peta_peran` Kartu). Peringkat kabupaten TIDAK ADA di baris
 * Peta Peran (rencana § "Bentuk artefak dan respons nyata") — diambil dari
 * `useKartu(iddesa)` blok `peta_peran`, cache dibagi lewat
 * `queryKey: ["kartu", iddesa]` (tidak ada permintaan baru bila kartu desa
 * itu pernah dibuka). `strip(null)` selama kartu belum tiba, bukan angka
 * karangan.
 */
export function DetailDesa({ baris }: DetailDesaProps) {
  const { data } = useKartu(baris.iddesa);
  const kartu = data as KartuDesa | undefined;

  const belumTerpetakan = baris.zona === "Belum Terpetakan";
  // Kunci beda dari blok kartu (Task 16 GOTCHA 1): string KOSONG di sini
  // berarti tidak ada alasan, BUKAN `null`.
  const adaAlasan = belumTerpetakan && baris.alasan_belum_terpetakan !== "";

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">{baris.nmdesa}</h3>

      <div className="mt-4">
        <p className="text-title-sm text-ink">{baris.zona}</p>
        {adaAlasan && <p className="mt-1 text-body-md text-body">{baris.alasan_belum_terpetakan}</p>}
      </div>

      {baris.keyakinan === "rendah" && (
        <div className="mt-3">
          <StatusChip status="caution">keyakinan rendah</StatusChip>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 divide-y divide-hairline md:grid-cols-2 md:divide-y-0">
        <div>
          <p className="text-label text-muted">Skor Potensi</p>
          <p className="text-body-md text-ink">
            {baris.desil_sp === null ? strip(null) : `Desil ${formatAngka(baris.desil_sp)} dari 10`}
          </p>
          <p className="text-label text-muted">Peringkat kab. {strip(kartu?.peta_peran.peringkat_sp_kab ?? null)}</p>
        </div>
        <div>
          <p className="text-label text-muted">Skor Kesiapan</p>
          <p className="text-body-md text-ink">
            {baris.desil_sk === null ? strip(null) : `Desil ${formatAngka(baris.desil_sk)} dari 10`}
          </p>
          <p className="text-label text-muted">Peringkat kab. {strip(kartu?.peta_peran.peringkat_sk_kab ?? null)}</p>
        </div>
      </div>

      <div className="mt-3">
        <p className="text-label text-muted">Potensi Dominan</p>
        <div className="mt-1 flex items-center gap-2">
          <p className="text-body-md text-ink">{strip(baris.potensi_dominan)}</p>
          {baris.sumber_dominan && <BadgeSumber sumber={baris.sumber_dominan} />}
        </div>
      </div>
    </section>
  );
}
