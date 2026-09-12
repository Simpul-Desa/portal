"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";

import { pesanGalat } from "@/lib/api/galat-ui";
import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Pagination } from "@/shared/components/pagination";
import { formatAngka } from "@/shared/format";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useJalurDaftar } from "../hooks/queries";

type WilayahState = ReturnType<typeof useWilayahParams>;

type DaftarJalurProps = {
  varian: Varian;
  /** Kabupaten aktif — bila diisi, judul dan baris tidak mengulang `Kab.`
   * pada tiap baris (seluruh baris satu kabupaten yang sama). */
  kab?: string;
  /** `id_jalur` sedang terpilih (`?jalur=`) — menandai baris aktif. */
  jalurAktif?: string;
  onPilih: WilayahState["pilihJalur"];
};

const JUMLAH_KERANGKA = 4;

const KELAS_BARIS =
  `group flex w-full items-center justify-between gap-3 rounded-control px-3.5 py-2.5 text-left transition-colors hover:bg-inset cursor-pointer ${FOCUS_RING}`;

/**
 * Petakan `label` teknis satu baris ke kalimat Indonesia.
 */
function labelTampil(varian: Varian, label: string): string {
  if (varian === "gudang-kopdes") return "Gudang Kopdes";
  if (varian === "cold-storage") {
    if (label === "cs-baru") return "Cold storage baru (usulan model)";
    if (label === "cs-eksisting") return "Cold storage eksisting";
    return "Cold storage";
  }
  return label;
}

/**
 * Daftar jalur berpaginasi satu varian:
 * Dilengkapi fitur pencarian langsung untuk Desa Poros atau komoditas/label,
 * navigasi halaman yang mulus, dan visual interaktif yang bersih.
 */
export function DaftarJalur({ varian, kab, jalurAktif, onPilih }: DaftarJalurProps) {
  const [hal, setHal] = useState(1);
  const [pencarian, setPencarian] = useState("");
  const { data, isLoading, isError, error } = useJalurDaftar({ varian, kab, hal, aktif: true });

  const rawBaris = data?.data;
  const baris = useMemo(() => rawBaris ?? [], [rawBaris]);
  const meta = data?.meta;
  const total = meta?.total ?? null;
  const batas = meta?.batas ?? null;

  // Filter pencarian desa poros / komoditas / kecamatan
  const barisTersaring = useMemo(() => {
    if (!pencarian.trim()) return baris;
    const q = pencarian.toLowerCase().trim();
    return baris.filter((b) => {
      const namaPoros = b.poros.nmdesa.toLowerCase();
      const namaKec = (b.poros.nmkec ?? "").toLowerCase();
      const namaKab = (b.nmkab ?? "").toLowerCase();
      const label = labelTampil(varian, b.label).toLowerCase();
      return (
        namaPoros.includes(q) ||
        namaKec.includes(q) ||
        namaKab.includes(q) ||
        label.includes(q)
      );
    });
  }, [baris, pencarian, varian]);

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

  if (total === 0) return null;

  const nmkab = kab ? baris[0]?.nmkab : undefined;
  const judul = total === null ? "Jalur Ekonomi" : `${formatAngka(total)} jalur`;

  return (
    <section className="rounded-card bg-surface p-4 sm:p-5 shadow-xs">
      {/* Header Daftar & Jumlah */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div>
          <h3 className="text-title-sm text-ink font-semibold">
            {judul}
            {nmkab ? ` di Kab. ${nmkab}` : ""}
          </h3>
          <p className="text-micro text-muted">
            {pencarian.trim()
              ? `Ditemukan ${formatAngka(barisTersaring.length)} dari ${formatAngka(baris.length)} di halaman ini`
              : "Klik baris untuk menampilkan jaringan jalur di peta"}
          </p>
        </div>
      </div>

      {/* Input Pencarian Desa Poros */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
        <input
          type="text"
          value={pencarian}
          onChange={(e) => setPencarian(e.target.value)}
          placeholder="Cari desa poros atau jenis jalur..."
          className={`w-full rounded-full bg-inset pl-9 pr-8 py-2 text-micro text-ink placeholder:text-muted focus:outline-none border border-transparent hover:border-line-strong transition-all ${FOCUS_RING}`}
        />
        {pencarian && (
          <button
            type="button"
            onClick={() => setPencarian("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink p-1 rounded-full hover:bg-float"
            aria-label="Hapus pencarian"
          >
            <X className="size-3" />
          </button>
        )}
      </div>

      {/* Daftar Baris Jalur */}
      {barisTersaring.length === 0 ? (
        <div className="rounded-control bg-inset p-4 text-center">
          <p className="text-micro text-muted">
            Tidak ada desa poros atau jalur yang cocok dengan &quot;{pencarian}&quot;.
          </p>
          <button
            type="button"
            onClick={() => setPencarian("")}
            className="mt-2 text-micro font-medium text-ink hover:underline cursor-pointer"
          >
            Reset pencarian
          </button>
        </div>
      ) : (
        <div className="flex flex-col divide-y divide-hairline">
          {barisTersaring.map((b) => {
            const terpilih = b.id_jalur === jalurAktif;
            return (
              <button
                key={b.id_jalur}
                type="button"
                onClick={() => onPilih(b.id_jalur, { kab: b.idkab })}
                aria-current={terpilih || undefined}
                className={`${KELAS_BARIS} ${terpilih ? "bg-inset font-medium" : ""}`}
              >
                <div className="flex flex-col items-start min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-body-md font-medium text-ink truncate">
                      {b.poros.nmdesa}
                    </span>
                    {terpilih && (
                      <span className="rounded-full bg-ink px-2 py-0.2 text-badge text-white">
                        Aktif
                      </span>
                    )}
                  </div>
                  <span className="text-micro text-muted truncate">
                    {labelTampil(varian, b.label)} · {formatAngka(b.n_anggota)} desa
                    {!kab && ` · Kab. ${b.nmkab}`}
                    {b.poros.nmkec && ` · Kec. ${b.poros.nmkec}`}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-muted group-hover:text-ink transition-colors">
                  <ArrowRight className="size-3.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Paginasi (Bila tidak sedang memfilter kata kunci lokal) */}
      {!pencarian.trim() && total !== null && batas !== null && (
        <div className="mt-4 pt-3 border-t border-hairline">
          <Pagination hal={hal} total={total} batas={batas} onHal={setHal} />
        </div>
      )}
    </section>
  );
}
