"use client";

import { formatAngka } from "@/shared/format";

import { NAMA_ZONA, type NamaZona, type RingkasanKab as RingkasanKabData } from "../types";
import { KELAS_DOT_ZONA } from "./filter-zona";
import { IstilahTooltip } from "./istilah-tooltip";

type RingkasanKabupatenProps = {
  ringkasan: RingkasanKabData;
  namaProv?: string;
};

/**
 * Ringkasan indikator satu kabupaten:
 * - Jumlah wilayah (desa & kelurahan)
 * - Indikator Keyakinan Rendah dengan tooltip penjelasan tanpa outline
 */
export function RingkasanKabupaten({ ringkasan }: RingkasanKabupatenProps) {
  return (
    <section className="rounded-card bg-surface p-4 sm:p-5 border border-line/50 shadow-xs">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Kolom 1: Total Wilayah */}
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs flex flex-col justify-between">
          <div>
            <p className="text-micro text-muted font-medium">Total Wilayah</p>
            <p className="mt-1 text-metric-md text-ink font-bold">
              {formatAngka(ringkasan.n_wilayah)}
            </p>
          </div>
          <p className="mt-1 text-micro text-muted">Desa & kelurahan di kab. ini</p>
        </div>

        {/* Kolom 2: Indikator Keyakinan Rendah dengan Tooltip */}
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1">
              <span className="text-micro text-muted font-medium">Keyakinan Rendah</span>
              <IstilahTooltip istilah="Keyakinan Rendah" label="" tampilkanIkon={true} />
            </div>
            <p className="mt-1 text-metric-md text-ink font-bold">
              {formatAngka(ringkasan.n_keyakinan_rendah)}
            </p>
          </div>
          <p className="mt-1 text-micro text-muted">Dekat garis batas ambang (±2 poin)</p>
        </div>
      </div>
    </section>
  );
}

type RingkasanZonaProvinsiProps = {
  daftar: readonly RingkasanKabData[];
  namaProv: string;
};

const KETERANGAN_ZONA_PROV: Record<NamaZona, string> = {
  "Zona Pemerintah": "Prioritas intervensi Dana Desa, infrastruktur dasar & pendampingan",
  "Zona Mitra": "Potensi & kesiapan tinggi; kemitraan offtaker dan investor",
  "Zona Poros": "Kesiapan tinggi; simpul pusat pengolahan ekonomi kawasan",
  "Zona Bantuan": "Prioritas perlindungan sosial & pemenuhan kebutuhan dasar",
  "Belum Terpetakan": "Data kesiapan belum mencukupi untuk penetapan zona definitif",
};

/**
 * Tampilan tingkat provinsi:
 * - Menampilkan jumlah distribusi zona penanganan seluruh desa di provinsi
 * - Menggunakan kartu kontras (bg-float) yang terdefinisi dengan jelas
 */
export function RingkasanZonaProvinsi({ daftar }: RingkasanZonaProvinsiProps) {
  const totalZona: Record<NamaZona, number> = {
    "Zona Pemerintah": 0,
    "Zona Mitra": 0,
    "Zona Poros": 0,
    "Zona Bantuan": 0,
    "Belum Terpetakan": 0,
  };

  let totalWilayah = 0;
  for (const k of daftar) {
    totalWilayah += k.n_wilayah;
    for (const z of NAMA_ZONA) {
      totalZona[z] += k.zona[z] ?? 0;
    }
  }

  return (
    <section className="rounded-card bg-surface p-4 sm:p-5 border border-line/50 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-3.5">
        <div>
          <h3 className="text-title-sm text-ink font-bold">
            Distribusi Zona Penanganan
          </h3>
          <p className="mt-0.5 text-micro text-muted">
            Total {formatAngka(totalWilayah)} desa & kelurahan di {daftar.length} kabupaten
          </p>
        </div>
      </div>

      {/* Daftar Vertikal Distribusi Zona */}
      <div className="flex flex-col gap-2">
        {NAMA_ZONA.map((nama) => {
          const cacah = totalZona[nama] ?? 0;
          const persen = totalWilayah > 0 ? Math.round((cacah / totalWilayah) * 100) : 0;
          const dot = KELAS_DOT_ZONA[nama];
          const deskripsi = KETERANGAN_ZONA_PROV[nama];

          return (
            <div
              key={nama}
              className="flex items-center justify-between gap-3 rounded-inset bg-float p-3 border border-line/70 shadow-2xs"
            >
              <div className="flex items-start gap-2.5 min-w-0">
                <span className={`mt-1 size-2.5 shrink-0 rounded-full ${dot}`} />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-micro font-bold text-ink">{nama}</span>
                    <IstilahTooltip istilah={nama} label="" tampilkanIkon={true} />
                  </div>
                  <p className="text-[11px] text-muted truncate mt-0.5">{deskripsi}</p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-micro font-bold text-ink">{formatAngka(cacah)}</span>
                <span className="block text-[10px] text-muted">{persen}% wilayah</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-hairline text-center">
        <p className="text-micro text-muted">
          Pilih salah satu kabupaten pada peta untuk melihat Matriks Peta Peran per desa.
        </p>
      </div>
    </section>
  );
}
