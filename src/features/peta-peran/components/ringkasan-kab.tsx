"use client";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

import type { RingkasanKab as RingkasanKabData } from "../types";

const KELAS_BARIS =
  `flex h-11 w-full items-center justify-between gap-2 px-3 text-left text-body-md text-ink hover:bg-inset ${FOCUS_RING}`;

type RingkasanKabupatenProps = {
  ringkasan: RingkasanKabData;
};

/**
 * Bentuk (a) Task 22 — satu kabupaten aktif: `n_wilayah` (label "wilayah",
 * BUKAN "desa" — artefak menghitung desa DAN kelurahan) dan
 * `n_keyakinan_rendah`, dua angka berlabel (pola `card-quadrant` Sel,
 * `features/kartu/components/seksi-kesiapan.tsx`).
 */
export function RingkasanKabupaten({ ringkasan }: RingkasanKabupatenProps) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Kab. {ringkasan.nmkab}</h3>
      <div className="mt-4 grid grid-cols-1 gap-3 divide-y divide-hairline md:grid-cols-2 md:divide-y-0">
        <div>
          <p className="text-label text-muted">Wilayah</p>
          <p className="mt-2 text-metric-md text-ink">{formatAngka(ringkasan.n_wilayah)}</p>
        </div>
        <div>
          <p className="text-label text-muted">keyakinan rendah</p>
          <p className="mt-2 text-metric-md text-ink">{formatAngka(ringkasan.n_keyakinan_rendah)}</p>
        </div>
      </div>
    </section>
  );
}

type RingkasanProvinsiProps = {
  daftar: readonly RingkasanKabData[];
  onPilihKab: (idkab: string) => void;
};

/**
 * Bentuk (b) Task 22 — hanya provinsi aktif (tanpa kabupaten): baris per
 * kabupaten (nama + `n_wilayah`), klik memilih kabupaten itu. TANPA total
 * provinsi — menjumlahkan cacah zona/wilayah antar kabupaten di klien
 * dilarang (rencana § "NOT Building").
 */
export function RingkasanProvinsi({ daftar, onPilihKab }: RingkasanProvinsiProps) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Ringkasan per kabupaten</h3>
      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {daftar.map((k) => (
          <button key={k.idkab} type="button" onClick={() => onPilihKab(k.idkab)} className={KELAS_BARIS}>
            <span>{k.nmkab}</span>
            <span className="text-label text-muted">{formatAngka(k.n_wilayah)} wilayah</span>
          </button>
        ))}
      </div>
    </section>
  );
}
