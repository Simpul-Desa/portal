"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";

import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ArrowUpRightIcon } from "@/shared/components/icons";
import { Pagination } from "@/shared/components/pagination";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { useDesa } from "@/shared/hooks/queries-wilayah";
import { formatAngka, strip } from "@/shared/format";

import type { BarisSkorSel } from "../types";

const JUMLAH_PER_HALAMAN = 25;

type DaftarDesaSelProps = {
  kab: string;
  baris: readonly BarisSkorSel[];
  desaAktif?: string;
  onPilihDesa: (iddesa: string) => void;
  onBukaKartu?: (iddesa: string) => void;
  namaKab?: string;
  namaKomoditas?: string;
};

/**
 * Daftar desa berperingkat SATU sel dalam SATU kabupaten (Kolom 2 Citra Potensi Desa).
 * Menampilkan nomor urut peringkat, nama desa/kecamatan, nilai skor komoditas,
 * serta tautan langsung menuju Kartu Ekonomi Desa masing-masing.
 */
export function DaftarDesaSel({
  kab,
  baris,
  desaAktif,
  onPilihDesa,
  onBukaKartu,
  namaKab,
  namaKomoditas,
}: DaftarDesaSelProps) {
  const [hal, setHal] = useState(() => {
    if (!desaAktif) return 1;
    const idx = baris.findIndex((b) => b.iddesa === desaAktif);
    return idx !== -1 ? Math.floor(idx / JUMLAH_PER_HALAMAN) + 1 : 1;
  });
  const [prevDesaAktif, setPrevDesaAktif] = useState(desaAktif);
  const [cari, setCari] = useState("");
  const desa = useDesa(kab);
  const desaAktifRef = useRef<HTMLDivElement | null>(null);
  const sudahScrollRef = useRef(false);

  const namaPerDesa = useMemo(
    () => new Map((desa.data?.daftar ?? []).map((d) => [d.iddesa, d])),
    [desa.data?.daftar],
  );

  const barisTersaring = useMemo(() => {
    if (!cari.trim()) return baris;
    const q = cari.toLowerCase().trim();
    return baris.filter((b) => {
      const d = namaPerDesa.get(b.iddesa);
      if (!d) return b.iddesa.includes(q);
      return (
        d.nmdesa.toLowerCase().includes(q) ||
        d.nmkec.toLowerCase().includes(q) ||
        b.iddesa.includes(q)
      );
    });
  }, [baris, cari, namaPerDesa]);

  // Sesuaikan halaman saat desaAktif berubah dari luar
  if (desaAktif !== prevDesaAktif) {
    setPrevDesaAktif(desaAktif);
    if (desaAktif) {
      const idx = barisTersaring.findIndex((b) => b.iddesa === desaAktif);
      if (idx !== -1) {
        setHal(Math.floor(idx / JUMLAH_PER_HALAMAN) + 1);
      }
    }
  }

  // Izinkan scroll ulang bila desaAktif atau kabupaten berganti
  useEffect(() => {
    sudahScrollRef.current = false;
  }, [desaAktif, kab]);

  // Auto-scroll ke elemen desa aktif begitu dirender
  useEffect(() => {
    if (!desaAktif || sudahScrollRef.current) return;
    if (desaAktifRef.current) {
      const idTimer = window.setTimeout(() => {
        desaAktifRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        sudahScrollRef.current = true;
      }, 150);
      return () => window.clearTimeout(idTimer);
    }
  }, [desaAktif, hal, barisTersaring]);

  if (baris.length === 0) {
    return (
      <section className="py-8 text-center">
        <p className="text-title-sm font-semibold text-ink">Tidak ada desa berperingkat</p>
        <p className="mt-1 text-micro text-muted">
          Belum ada desa di kabupaten ini yang mendapat skor untuk komoditas ini.
        </p>
      </section>
    );
  }

  const total = barisTersaring.length;
  const awal = (hal - 1) * JUMLAH_PER_HALAMAN;
  const halamanIni = barisTersaring.slice(awal, awal + JUMLAH_PER_HALAMAN);

  return (
    <section className="flex flex-col space-y-3">
      <div className="flex flex-col gap-1 px-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center min-w-0">
            <h3 className="text-title-sm font-semibold text-ink truncate">
              {namaKab ? `Peringkat Desa · Kab. ${namaKab}` : "Peringkat Desa"}
            </h3>
            <TanyaTooltip istilah="Peringkat Desa" />
          </div>
          <span className="text-micro text-muted font-mono shrink-0">
            {formatAngka(baris.length)} desa
          </span>
        </div>
        {namaKomoditas && (
          <p className="text-micro text-muted truncate">
            Berdasarkan potensi komoditas <span className="font-medium text-ink">{namaKomoditas}</span>
          </p>
        )}
      </div>

      {/* Pencarian Desa dalam Kabupaten */}
      {baris.length > 10 && (
        <div className="relative px-0.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={cari}
            onChange={(e) => {
              setCari(e.target.value);
              setHal(1);
            }}
            placeholder="Cari desa atau kecamatan..."
            className={`w-full rounded-md bg-surface pl-8 pr-3 py-1.5 text-micro text-ink placeholder:text-muted border border-hairline focus:border-line-strong transition-colors ${FOCUS_RING}`}
          />
        </div>
      )}

      {desa.isError && (
        <p className="mt-1 px-1 text-micro text-muted">{pesanGalat(desa.error).judul}</p>
      )}

      {/* List desa dengan separator (line) tiap list tanpa card */}
      <div className="flex flex-col divide-y divide-hairline border-y border-hairline">
        {halamanIni.map((b) => {
          const nama = namaPerDesa.get(b.iddesa);
          const terpilih = b.iddesa === desaAktif;

          return (
            <div
              key={b.iddesa}
              ref={terpilih ? desaAktifRef : undefined}
              onClick={() => onPilihDesa(b.iddesa)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onPilihDesa(b.iddesa);
                }
              }}
              aria-current={terpilih || undefined}
              className={`group flex w-full items-center justify-between gap-2.5 px-2.5 py-2 text-left transition-all cursor-pointer rounded-md ${
                terpilih
                  ? "bg-primary/10 border border-primary/25 shadow-2xs"
                  : "hover:bg-surface/60 border border-transparent"
              } ${FOCUS_RING}`}
            >
              {/* Kolom Kiri: Peringkat & Identitas Desa */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Badge Nomor Urut Peringkat */}
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-micro font-bold transition-transform group-hover:scale-105 ${
                    b.peringkat === 1
                      ? "bg-amber-100 text-amber-900 border border-amber-300"
                      : b.peringkat === 2
                      ? "bg-slate-200 text-slate-800 border border-slate-300"
                      : b.peringkat === 3
                      ? "bg-amber-50 text-amber-800 border border-amber-200"
                      : "bg-surface text-muted border border-hairline"
                  }`}
                  title={`Peringkat ${b.peringkat} dari ${b.nDesaKab} desa di kabupaten ini`}
                >
                  {b.peringkat}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className={`text-body-md font-semibold truncate leading-tight ${
                        terpilih ? "text-primary" : "text-ink"
                      }`}
                    >
                      {nama ? nama.nmdesa : strip(null)}
                    </span>
                    {terpilih && (
                      <span className="inline-flex items-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary shrink-0">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <span className="text-micro text-muted truncate leading-tight mt-0.5">
                    {nama ? `Kec. ${nama.nmkec}` : b.iddesa}
                  </span>
                </div>
              </div>

              {/* Kolom Kanan: Skor Relatif & Link Kartu Ekonomi Desa */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="text-right">
                  <span className="block text-micro font-bold text-ink font-mono">
                    {formatAngka(b.skor100)}
                  </span>
                  <span className="block text-[10px] text-muted">skor</span>
                </div>

                {onBukaKartu && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBukaKartu(b.iddesa);
                        }}
                        aria-label={`Buka Kartu Ekonomi Desa ${nama?.nmdesa ?? b.iddesa}`}
                        className={`flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:text-primary hover:bg-surface border border-transparent hover:border-hairline transition-all cursor-pointer ${
                          terpilih
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-100 focus:opacity-100 group-focus-within:opacity-100"
                        } ${FOCUS_RING}`}
                      >
                        <ArrowUpRightIcon className="size-3.5 transition-transform group-hover:scale-110" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      Buka Kartu Ekonomi Desa
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {barisTersaring.length === 0 && cari && (
        <p className="py-4 text-center text-micro text-muted">
          Tidak ada desa yang cocok dengan &ldquo;{cari}&rdquo;
        </p>
      )}

      {total > JUMLAH_PER_HALAMAN && (
        <div className="mt-4 pt-2 border-t border-hairline/60">
          <Pagination
            hal={hal}
            total={total}
            batas={JUMLAH_PER_HALAMAN}
            onHal={setHal}
          />
        </div>
      )}

      {desa.data?.lengkap === false && (
        <p className="mt-2 text-micro text-muted">Sebagian nama desa belum termuat.</p>
      )}
    </section>
  );
}
