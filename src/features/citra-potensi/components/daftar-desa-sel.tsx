"use client";

import { useState } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Pagination } from "@/shared/components/pagination";
import { useDesa } from "@/shared/hooks/queries-wilayah";
import { formatAngka, strip } from "@/shared/format";

import type { BarisSkorSel } from "../types";

const JUMLAH_PER_HALAMAN = 50;

type DaftarDesaSelProps = {
  kab: string;
  baris: readonly BarisSkorSel[];
  desaAktif?: string;
  onPilihDesa: (iddesa: string) => void;
};

/**
 * Daftar desa berperingkat SATU sel dalam SATU kabupaten (Task 21). `hal`
 * state LOKAL — di-RESET lewat `key` pada komponen ini (`${target}-${kab}`,
 * dipasang `panel.tsx`), BUKAN `useEffect` (linter proyek
 * `react-hooks/set-state-in-effect` menolaknya).
 *
 * Paginasi di sini SISI KLIEN — rute `/api/model/citra-potensi/sel` tidak
 * berpaginasi (seluruh provinsi datang sekaligus, disaring ke kabupaten oleh
 * `barisSkor`). `total` di bawah = panjang array HASIL SARINGAN, bukan
 * `meta.total` — ini bookkeeping pager, bukan cacah domain (Task 21 GOTCHA
 * 3), jadi bukan pelanggaran aturan "cacah domain dari `meta.total`".
 */
export function DaftarDesaSel({ kab, baris, desaAktif, onPilihDesa }: DaftarDesaSelProps) {
  const [hal, setHal] = useState(1);
  const desa = useDesa(kab);

  if (baris.length === 0) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Tidak ada desa berperingkat</p>
        <p className="mt-1 text-body-md text-muted">
          Belum ada desa di kabupaten ini yang mendapat skor untuk komoditas ini.
        </p>
      </section>
    );
  }

  const namaPerDesa = new Map((desa.data?.daftar ?? []).map((d) => [d.iddesa, d]));
  const total = baris.length;
  const awal = (hal - 1) * JUMLAH_PER_HALAMAN;
  const halamanIni = baris.slice(awal, awal + JUMLAH_PER_HALAMAN);

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">{formatAngka(total)} wilayah berperingkat</h3>

      {desa.isError && <p className="mt-1 text-label text-muted">{pesanGalat(desa.error).judul}</p>}

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {halamanIni.map((b) => {
          const nama = namaPerDesa.get(b.iddesa);
          const terpilih = b.iddesa === desaAktif;
          return (
            <button
              key={b.iddesa}
              type="button"
              onClick={() => onPilihDesa(b.iddesa)}
              aria-current={terpilih || undefined}
              className={`flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left hover:bg-inset ${terpilih ? "bg-inset" : ""} ${FOCUS_RING}`}
            >
              <span className="flex items-center gap-2">
                <span className="shrink-0 text-label text-muted">
                  {formatAngka(b.peringkat)} dari {formatAngka(b.nDesaKab)}
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-title-sm text-ink">{nama ? nama.nmdesa : strip(null)}</span>
                  {nama ? (
                    <span className="text-label text-muted">Kec. {nama.nmkec}</span>
                  ) : (
                    <span className="text-micro text-muted">{b.iddesa}</span>
                  )}
                </span>
              </span>
              <span className="shrink-0 text-label text-muted">{formatAngka(b.skor100)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Pagination hal={hal} total={total} batas={JUMLAH_PER_HALAMAN} onHal={setHal} />
      </div>

      {desa.data?.lengkap === false && (
        <p className="mt-2 text-micro text-muted">Sebagian nama desa belum termuat.</p>
      )}
    </section>
  );
}
