import { formatPersen, strip } from "@/shared/format";

import type { KartuMutuData } from "../types";

/** Baris mutu_data kecil (Task 24, seksi 9) — tiga penanda sumber +
 * kelengkapan bukti SK (fraksi 0–1 dari API, dikali 100 murni untuk
 * tampilan persen — konversi satuan, bukan hitung ulang domain). */
export function SeksiMutuData({ mutuData }: { mutuData: KartuMutuData }) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-label text-muted">Mutu data</h3>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-body-md text-ink">
        <span>Geometri: {mutuData.punya_geometri ? "ada" : "tidak ada"}</span>
        <span>ST2023: {mutuData.punya_st2023 ? "ada" : "tidak ada"}</span>
        <span>IDM: {mutuData.punya_idm ? "ada" : "tidak ada"}</span>
        <span>
          Kelengkapan bukti SK:{" "}
          {mutuData.kelengkapan_bukti_sk === null ? strip(null) : formatPersen(mutuData.kelengkapan_bukti_sk * 100)}
        </span>
      </div>
    </section>
  );
}
