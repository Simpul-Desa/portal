"use client";

import { useMemo, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import type { DataDari } from "@/lib/api/endpoints";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/components/ui/popover";
import { formatPersen, strip } from "@/shared/format";

export type TetanggaKembar = DataDari<"/api/model/desa-kembar/{iddesa}">["tetangga"][number];

type ComboboxKembarProps = {
  tetangga: readonly TetanggaKembar[];
  kembarAktif?: string;
  namaDesa?: string;
  onPilih: (iddesa: string) => void;
};

/**
 * Combobox pemilihan Desa Kembar yang diletakkan langsung di slot Nama Desa.
 * - Bila namaDesa diisi: menampilkan nama desa terpilih (bold) dengan dropdown chevron.
 * - Bila belum: menampilkan tombol selektor "Pilih Desa Kembar...".
 */
export function ComboboxKembar({
  tetangga,
  kembarAktif,
  namaDesa,
  onPilih,
}: ComboboxKembarProps) {
  const [buka, setBuka] = useState(false);
  const [cari, setCari] = useState("");

  const daftarTersaring = useMemo(() => {
    const q = cari.trim().toLowerCase();
    if (!q) return tetangga;
    return tetangga.filter((t) => {
      const nama = (t.nmdesa ?? "").toLowerCase();
      const kec = (t.nmkec ?? "").toLowerCase();
      return nama.includes(q) || kec.includes(q);
    });
  }, [tetangga, cari]);

  return (
    <Popover
      open={buka}
      onOpenChange={(terbuka) => {
        setBuka(terbuka);
        if (!terbuka) setCari("");
      }}
    >
      <PopoverTrigger asChild>
        {namaDesa ? (
          <button
            type="button"
            aria-label={`Ganti desa kembar, saat ini ${namaDesa}`}
            className={`group flex h-8 w-full items-center justify-between gap-1.5 rounded-lg py-0.5 px-1 -ml-1 text-left hover:bg-orange-500/10 transition-all cursor-pointer ${FOCUS_RING}`}
          >
            <span
              className="text-title-md font-bold text-ink group-hover:text-primary transition-colors truncate tracking-tight leading-snug"
              title={namaDesa}
            >
              {namaDesa}
            </span>
            <ChevronDown className="size-4 text-orange-700/80 group-hover:text-primary transition-colors shrink-0" />
          </button>
        ) : (
          <button
            type="button"
            aria-label="Pilih desa kembar"
            className={`group flex h-8 w-full items-center justify-between gap-2 rounded-lg bg-surface/90 px-2.5 py-1 text-left border border-line-strong/60 shadow-2xs hover:border-line-strong hover:bg-white transition-all cursor-pointer ${FOCUS_RING}`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <Search className="size-3.5 text-muted shrink-0 group-hover:text-ink transition-colors" />
              <span className="text-micro text-muted font-normal truncate">
                Pilih Desa Kembar...
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted shrink-0 group-hover:text-ink transition-colors" />
          </button>
        )}
      </PopoverTrigger>

      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-72 sm:w-80 z-50 overflow-hidden rounded-2xl bg-white p-2 shadow-float-strong border border-line flex flex-col outline-none"
      >
        <div className="px-2 pt-1 pb-2 border-b border-hairline">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-micro font-semibold text-ink">Daftar Desa Kembar</span>
            <span className="text-micro text-muted">{tetangga.length} desa</span>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-surface px-2.5 py-1.5 border border-line/60">
            <Search className="size-3.5 text-muted shrink-0" />
            <input
              type="text"
              value={cari}
              onChange={(e) => setCari(e.target.value)}
              placeholder="Cari desa atau kecamatan..."
              autoFocus
              className="w-full bg-transparent text-micro text-ink placeholder:text-muted focus:outline-none"
            />
            {cari && (
              <button
                type="button"
                onClick={() => setCari("")}
                aria-label="Hapus pencarian"
                className="text-muted hover:text-ink cursor-pointer"
              >
                <X className="size-3" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-1.5 max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
          {daftarTersaring.length === 0 ? (
            <p className="px-3 py-5 text-center text-micro text-muted">
              Tidak ada desa yang cocok dengan &ldquo;{cari}&rdquo;
            </p>
          ) : (
            daftarTersaring.map((t) => {
              const aktif = t.iddesa === kembarAktif;
              return (
                <button
                  key={t.iddesa}
                  type="button"
                  onClick={() => {
                    onPilih(t.iddesa);
                    setBuka(false);
                    setCari("");
                  }}
                  className={`flex w-full items-center justify-between gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer ${
                    aktif
                      ? "bg-orange-50 text-orange-950 font-medium"
                      : "hover:bg-surface text-ink"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-title-sm font-medium truncate leading-tight">
                      {strip(t.nmdesa)}
                    </p>
                    <p className="text-micro text-muted truncate">Kec. {strip(t.nmkec)}</p>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-badge font-semibold bg-orange-100/90 text-orange-900 border border-orange-200/70">
                      {formatPersen(t.persen)}
                    </span>
                    {aktif && <Check className="size-4 text-primary shrink-0" />}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
