"use client";

import { useState } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { ZONA_SLUG, type ZonaSlug } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Pagination } from "@/shared/components/pagination";
import { StatusChip } from "@/shared/components/status-chip";
import { formatAngka, strip } from "@/shared/format";

import { usePetaPeranDaftar } from "../hooks/queries";
import type { NamaZona } from "../types";
import { KELAS_DOT_ZONA } from "./filter-zona";

const JUMLAH_KERANGKA = 4;

type DaftarDesaProps = {
  prov?: string;
  kab?: string;
  zona?: ZonaSlug;
  /** `desa` aktif di URL — menandai baris lewat `aria-current`. */
  desaAktif?: string;
  onPilihDesa: (iddesa: string) => void;
};

/**
 * Daftar desa berpaginasi SISI SERVER (Task 23). `hal` state LOKAL di sini —
 * di-RESET lewat `key` pada komponen ini (`${prov}-${kab}-${zona}`, dipasang
 * pemanggil `panel.tsx`), BUKAN `useEffect` yang menyetel state (linter
 * proyek `react-hooks/set-state-in-effect` menolaknya).
 */
export function DaftarDesa({ prov, kab, zona, desaAktif, onPilihDesa }: DaftarDesaProps) {
  const [hal, setHal] = useState(1);
  const namaZona: NamaZona | undefined = zona ? ZONA_SLUG[zona] : undefined;

  const { data, isLoading, isError, error } = usePetaPeranDaftar({
    prov,
    kab,
    zona: namaZona,
    hal,
    aktif: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: JUMLAH_KERANGKA }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="px-1 py-2 text-label text-muted">{pesanGalat(error).judul}</p>;
  }
  if (!data) return null;

  const { data: baris, meta } = data;
  // Judul TANPA angka bila `meta.total` tidak ada (review M11) — panjang
  // `baris` adalah satu HALAMAN, bukan cacah domain kabupaten (`api/`
  // berpaginasi 50 per halaman), jadi tidak pernah dipakai sebagai fallback.
  // Label "wilayah", BUKAN "desa" (review ronde 3 temuan #4) — artefak
  // menghitung desa DAN kelurahan, sama seperti `ringkasan-kab.tsx`.
  const total = meta?.total;
  const batas = meta?.batas ?? (baris.length || 1);

  // Keadaan kosong berketerangan (review ronde 3 temuan #4) — trivial
  // dicapai lewat chip zona yang cacahnya nol (`FilterZona`, paling sering
  // Belum Terpetakan di kabupaten yang sudah terpetakan penuh). Sebelumnya
  // kartu ini tetap tampil berjudul "0 desa" di atas daftar kosong bisu.
  if (total === 0) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Tidak ada wilayah</p>
        <p className="mt-1 text-body-md text-muted">
          {namaZona
            ? `Tidak ada wilayah untuk ${namaZona} di cakupan ini.`
            : "Tidak ada wilayah untuk cakupan ini."}
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">
        {total === undefined ? "Wilayah" : `${formatAngka(total)} wilayah`}
      </h3>

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {baris.map((b) => {
          const terpilih = b.iddesa === desaAktif;
          return (
            <button
              key={b.iddesa}
              type="button"
              onClick={() => onPilihDesa(b.iddesa)}
              aria-current={terpilih || undefined}
              className={`flex w-full flex-col items-start gap-0.5 rounded-control px-3 py-2 text-left hover:bg-inset ${terpilih ? "bg-inset" : ""} ${FOCUS_RING}`}
            >
              <span className="flex items-center gap-1.5">
                <span className={`size-1.5 shrink-0 rounded-full ${KELAS_DOT_ZONA[b.zona]}`} aria-hidden="true" />
                <span className="text-title-sm text-ink">{b.nmdesa}</span>
                {b.keyakinan === "rendah" && <StatusChip status="caution">keyakinan rendah</StatusChip>}
              </span>
              {/* Kedua desil berlabel eksplisit (review ronde 3 temuan #4) —
                  sebelumnya "Desil {sp} · {sk}" hanya melabeli angka pertama,
                  DESIGN.md § Do's: bare figure tanpa label tidak pernah boleh.
                  Nama zona (`b.zona`, apa adanya — tanpa singkatan/pemetaan
                  ulang) ditambahkan ke teks baris (fase 9 Task 23, WCAG
                  1.4.1): tanpa filter zona aktif, titik warna di atas adalah
                  SATU-SATUNYA pembawa identitas zona, dan magenta/violet
                  berdekatan bagi pembaca defisiensi merah-hijau (DESIGN.md §
                  Zone choropleth: "the dot is a reinforcement, never the sole
                  signal"). Titik tetap tampil sebagai penguat. */}
              <span className="text-label text-muted">
                Kec. {b.nmkec} · {b.zona} · Skor Potensi Desil {strip(b.desil_sp)} · Skor Kesiapan
                Desil {strip(b.desil_sk)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-4">
        <Pagination hal={hal} total={total ?? 0} batas={batas} onHal={setHal} />
      </div>
    </section>
  );
}
