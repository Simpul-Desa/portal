import { formatPersen } from "@/shared/format";

import type { KartuDesaKembarBaris } from "../types";

const JUMLAH_PRATINJAU = 3;

/**
 * Pratinjau Desa Kembar (Task 24, seksi 8) — 3 baris nama + kemiripan%. Lensa
 * penuh (fase 5, `features/desa-kembar/`) sudah dibangun; pratinjau ini tetap
 * hanya tiga baris teratas. `kemiripan` sudah 0–100 dari API (GLOSSARY §
 * Kemiripan Desa Kembar) — `formatPersen` dipakai apa adanya, tanpa hitung
 * ulang.
 */
export function SeksiDesaKembar({ desaKembar }: { desaKembar: readonly KartuDesaKembarBaris[] }) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Desa Kembar</h3>

      {desaKembar.length === 0 ? (
        <p className="mt-4 text-body-md text-muted">Belum ada Desa Kembar untuk desa ini.</p>
      ) : (
        <div className="mt-4 divide-y divide-hairline">
          {desaKembar.slice(0, JUMLAH_PRATINJAU).map((d) => (
            <div key={d.iddesa} className="flex items-center justify-between gap-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-body-md text-ink">{d.nmdesa}</p>
                <p className="text-label text-muted">Kec. {d.nmkec}</p>
              </div>
              <p className="shrink-0 text-body-md text-ink">{formatPersen(d.kemiripan)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
