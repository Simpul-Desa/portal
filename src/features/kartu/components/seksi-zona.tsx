import { StatusChip } from "@/shared/components/status-chip";
import { formatAngka, strip } from "@/shared/format";

import type { KartuPetaPeran } from "../types";

/**
 * Kartu zona (Task 24, seksi 2): nama zona lengkap ATAU "Belum Terpetakan" +
 * alasan, bendera keyakinan rendah, desil+peringkat kab SP/SK. Skor mentah
 * `sp`/`sk` SENGAJA tidak dirender di sini — GLOSSARY: skor tampil sebagai
 * desil/peringkat, bukan angka desimal yang bisa disalahtafsir sebagai
 * perbedaan nyata pada selisih kecil.
 */
export function SeksiZona({ petaPeran }: { petaPeran: KartuPetaPeran }) {
  const belumTerpetakan = petaPeran.zona === "Belum Terpetakan";

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Peta Peran</h3>

      <div className="mt-4">
        <p className="text-title-sm text-ink">{petaPeran.zona}</p>
        {belumTerpetakan && (
          <p className="mt-1 text-body-md text-body">
            {petaPeran.alasan_belum_terpetakan ?? "Alasan tidak tercatat"}
          </p>
        )}
      </div>

      {petaPeran.keyakinan === "rendah" && (
        <div className="mt-3">
          <StatusChip status="caution">keyakinan rendah</StatusChip>
        </div>
      )}

      <div className="mt-3 grid grid-cols-1 gap-3 divide-y divide-hairline md:grid-cols-2 md:divide-y-0">
        <div>
          <p className="text-label text-muted">Skor Potensi</p>
          <p className="text-body-md text-ink">
            {petaPeran.desil_sp === null ? strip(null) : `Desil ${formatAngka(petaPeran.desil_sp)} dari 10`}
          </p>
          <p className="text-label text-muted">Peringkat kab. {strip(petaPeran.peringkat_sp_kab)}</p>
        </div>
        <div>
          <p className="text-label text-muted">Skor Kesiapan</p>
          <p className="text-body-md text-ink">
            {petaPeran.desil_sk === null ? strip(null) : `Desil ${formatAngka(petaPeran.desil_sk)} dari 10`}
          </p>
          <p className="text-label text-muted">Peringkat kab. {strip(petaPeran.peringkat_sk_kab)}</p>
        </div>
      </div>
    </section>
  );
}
