"use client";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

import { kelompokSel, namaKomoditas } from "../services/sel";
import type { SelCitra } from "../types";

const KELAS_BARIS =
  `flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left hover:bg-inset ${FOCUS_RING}`;

type DaftarSelProps = {
  daftar: readonly SelCitra[];
  targetAktif?: string;
  onPilih: (target: string) => void;
  /** `false` bila `useCitraDaftar` melaporkan daftar belum lengkap (pola
   * `PetaPeranPanel` baris 156-166) — satu baris keterangan `micro muted`,
   * bukan disembunyikan. */
  lengkap: boolean;
};

/**
 * Daftar komoditas tervalidasi, dikelompokkan per tema (Task 19). Baris
 * kanan menampilkan mutu uji tertahan (`ap_uji_tertahan`) — `mesin` dan
 * `berkas` (internal) tidak pernah dirender.
 */
export function DaftarSel({ daftar, targetAktif, onPilih, lengkap }: DaftarSelProps) {
  const kelompok = kelompokSel(daftar);

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Komoditas tervalidasi</h3>

      <div className="mt-4 flex flex-col gap-3">
        {kelompok.map(({ tema, baris }) => (
          <div key={tema}>
            <h4 className="text-title-sm text-ink">{tema}</h4>
            <div className="mt-1 flex flex-col divide-y divide-hairline">
              {baris.map((s) => {
                const terpilih = s.target === targetAktif;
                return (
                  <button
                    key={s.target}
                    type="button"
                    onClick={() => onPilih(s.target)}
                    aria-current={terpilih || undefined}
                    className={`${KELAS_BARIS} ${terpilih ? "bg-inset" : ""}`}
                  >
                    <span className="text-body-md text-ink">{namaKomoditas(s.nama)}</span>
                    <span className="text-label text-muted">{formatAngka(s.ap_uji_tertahan)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-micro text-muted">Angka di kanan adalah mutu uji tertahan tiap komoditas.</p>

      {!lengkap && (
        <p className="mt-2 text-micro text-muted">Daftar ini belum memuat semua komoditas provinsi ini.</p>
      )}
    </section>
  );
}
