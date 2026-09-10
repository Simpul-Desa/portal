"use client";

import type { DataDari } from "@/lib/api/endpoints";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatPersen, strip } from "@/shared/format";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

type WilayahState = ReturnType<typeof useWilayahParams>;

/** Derivasi dari skema OpenAPI (Task 6 GOTCHA: `TetanggaKembar` TIDAK
 * didefinisikan ulang) — bukan impor `components["schemas"]` langsung, supaya
 * satu sumber kebenaran tetap `DataDari`. */
type TetanggaKembar = DataDari<"/api/model/desa-kembar/{iddesa}">["tetangga"][number];

type DaftarKembarProps = {
  tetangga: readonly TetanggaKembar[];
  /** `?kembar=` aktif — menandai baris lewat `aria-current`. */
  kembarAktif?: string;
  onPilih: WilayahState["pilihKembar"];
};

const KELAS_BARIS =
  `flex w-full items-center justify-between gap-3 rounded-control px-3 py-2 text-left hover:bg-inset ${FOCUS_RING}`;

/**
 * Daftar 12 tetangga Desa Kembar (Task 11) — TANPA pager: `k` tetap 12 per
 * kontrak rute (rencana § "Bentuk artefak", `?k=` tidak dipakai fase ini).
 * Judul memakai `tetangga.length` (cacah baris yang DIKIRIM API), bukan
 * agregat domain lain.
 *
 * `nmdesa`/`nmkec` bisa `null` sekaligus bila `iddesa` tetangga tidak ada di
 * indeks kartu (defensif) — baris tetap dirender lewat `strip()` ("—") DAN
 * `iddesa` kecil sebagai penanda, bukan dibuang. `persen` sudah 0–100 dari
 * API (GLOSSARY § Kemiripan Desa Kembar) — `formatPersen` apa adanya, tanpa
 * hitung ulang.
 */
export function DaftarKembar({ tetangga, kembarAktif, onPilih }: DaftarKembarProps) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">{tetangga.length} Desa Kembar</h3>

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {tetangga.map((t) => {
          const terpilih = t.iddesa === kembarAktif;
          return (
            <button
              key={t.iddesa}
              type="button"
              onClick={() => onPilih(t.iddesa)}
              aria-current={terpilih || undefined}
              className={`${KELAS_BARIS} ${terpilih ? "bg-inset" : ""}`}
            >
              <span className="min-w-0">
                <span className="block truncate text-title-sm text-ink">{strip(t.nmdesa)}</span>
                <span className="block truncate text-label text-muted">
                  Kec. {strip(t.nmkec)}
                  {t.nmdesa === null && <span className="ml-1 text-micro text-muted">{t.iddesa}</span>}
                </span>
              </span>
              <span className="shrink-0 text-body-md text-ink">{formatPersen(t.persen)}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
