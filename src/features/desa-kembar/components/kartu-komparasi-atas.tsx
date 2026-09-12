"use client";

import type { KartuDesa } from "@/features/kartu/types";
import { formatPersen } from "@/shared/format";

import { ComboboxKembar, type TetanggaKembar } from "./combobox-kembar";

type KartuKomparasiAtasProps = {
  kiri: KartuDesa;
  kanan: KartuDesa | null;
  tetangga: readonly TetanggaKembar[];
  kembarAktif?: string;
  persen: number | null;
  onPilihKembar: (iddesa: string) => void;
};

/**
 * Dua kartu perbandingan di panel atas:
 * 1. Tulisan Desa Acuan / Desa Kembar
 * 2. Nama Desa (pada Desa Kembar berfungsi sebagai Combobox)
 * 3. Kec, Kab
 * 4. Nilai Kemiripan
 *
 * Pada Desa Kembar: warna card OFF saat belum terisi dan ON dengan gradasi orange normal saat terisi.
 */
export function KartuKomparasiAtas({
  kiri,
  kanan,
  tetangga,
  kembarAktif,
  persen,
  onPilihKembar,
}: KartuKomparasiAtasProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {/* 1. Card Kiri: Desa Acuan */}
      <section
        className="relative flex flex-col justify-between overflow-hidden rounded-card p-3.5 sm:p-4 border border-orange-200/70 shadow-xs transition-shadow"
        style={{
          background:
            "linear-gradient(145deg, rgba(255, 115, 0, 0.08) 0%, rgba(255, 248, 240, 0.6) 45%, #ffffff 100%)",
        }}
      >
        <div>
          {/* 1. Tulisan Desa Acuan */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-badge font-semibold bg-orange-100/90 text-orange-900 border border-orange-200/70">
              Desa Acuan
            </span>
          </div>

          {/* 2. Nama Desa */}
          <div className="mt-2.5 h-8 flex items-center">
            <h3
              className="text-title-md font-bold text-ink truncate tracking-tight leading-snug"
              title={kiri.identitas.nama}
            >
              {kiri.identitas.nama}
            </h3>
          </div>

          {/* 3. Kec, Kab */}
          <p className="mt-0.5 text-micro text-muted truncate">
            Kec. {kiri.identitas.kecamatan} • Kab. {kiri.identitas.kabupaten}
          </p>
        </div>

        {/* 4. Nilai Kemiripan */}
        <div className="mt-3 pt-2.5 border-t border-orange-100/80 flex items-center justify-between text-micro">
          <span className="text-muted">Kemiripan:</span>
          <span className="font-semibold text-ink">100% (Acuan)</span>
        </div>
      </section>

      {/* 2. Card Kanan: Desa Kembar */}
      {kanan ? (
        /* Status ON (Terisi Desa Kembar) */
        <section
          className="relative flex flex-col justify-between overflow-hidden rounded-card p-3.5 sm:p-4 border border-orange-300/80 shadow-xs transition-shadow"
          style={{
            background:
              "linear-gradient(145deg, rgba(255, 115, 0, 0.12) 0%, rgba(255, 237, 213, 0.45) 45%, #ffffff 100%)",
          }}
        >
          <div>
            {/* 1. Tulisan Desa Kembar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-badge font-semibold bg-orange-200/90 text-orange-950 border border-orange-300/80">
                Desa Kembar
              </span>
            </div>

            {/* 2. Nama Desa (Berfungsi sebagai Combobox) */}
            <div className="mt-2.5 h-8 flex items-center">
              <ComboboxKembar
                tetangga={tetangga}
                kembarAktif={kembarAktif}
                namaDesa={kanan.identitas.nama}
                onPilih={onPilihKembar}
              />
            </div>

            {/* 3. Kec, Kab */}
            <p className="mt-0.5 text-micro text-muted truncate">
              Kec. {kanan.identitas.kecamatan} • Kab. {kanan.identitas.kabupaten}
            </p>
          </div>

          {/* 4. Nilai Kemiripan */}
          <div className="mt-3 pt-2.5 border-t border-orange-200/60 flex items-center justify-between text-micro">
            <span className="text-muted">Kemiripan:</span>
            <span className="font-bold text-primary">
              {persen === null ? "—" : `${formatPersen(persen)} mirip`}
            </span>
          </div>
        </section>
      ) : (
        /* Status OFF (Belum Memilih Desa Kembar) */
        <section className="relative flex flex-col justify-between overflow-hidden rounded-card p-3.5 sm:p-4 bg-surface/50 border border-dashed border-line-strong/60 shadow-2xs transition-all">
          <div>
            {/* 1. Tulisan Desa Kembar */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-badge font-medium bg-inset text-muted border border-hairline">
                Desa Kembar
              </span>
            </div>

            {/* 2. Slot Nama Desa (Combobox untuk memilih) */}
            <div className="mt-2.5 h-8 flex items-center">
              <ComboboxKembar
                tetangga={tetangga}
                kembarAktif={kembarAktif}
                onPilih={onPilihKembar}
              />
            </div>

            {/* 3. Kec, Kab */}
            <p className="mt-0.5 text-micro text-muted truncate">—</p>
          </div>

          {/* 4. Nilai Kemiripan */}
          <div className="mt-3 pt-2.5 border-t border-hairline flex items-center justify-between text-micro">
            <span className="text-muted">Kemiripan:</span>
            <span className="text-muted font-medium">—</span>
          </div>
        </section>
      )}
    </div>
  );
}
