"use client";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import { BadgeSumber } from "@/shared/components/badge-sumber";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ChevronLeftIcon } from "@/shared/components/icons";
import { StatusChip } from "@/shared/components/status-chip";
import { formatAngka, strip } from "@/shared/format";

import type { BarisPetaPeranPenuh, NamaZona } from "../types";
import { KELAS_DOT_ZONA } from "./filter-zona";
import { IstilahTooltip } from "./istilah-tooltip";

type DetailDesaProps = {
  baris: BarisPetaPeranPenuh;
  namaProv?: string;
  onTutup?: () => void;
};

const KUADRAN_MAP: Record<NamaZona, string> = {
  "Zona Pemerintah": "Kuadran I (Kiri-Atas)",
  "Zona Mitra": "Kuadran II (Kanan-Atas)",
  "Zona Poros": "Kuadran III (Kanan-Bawah)",
  "Zona Bantuan": "Kuadran IV (Kiri-Bawah)",
  "Belum Terpetakan": "Non-Kuadran",
};

const PENJELASAN_ZONA: Record<NamaZona, string> = {
  "Zona Pemerintah":
    "Prioritas alokasi Dana Desa, pembangunan infrastruktur dasar, dan pendampingan teknis intensif.",
  "Zona Mitra":
    "Potensi dan kesiapan tinggi; prioritas kemitraan dengan pembeli tetap (offtaker) dan investor swasta.",
  "Zona Poros":
    "Kesiapan tinggi; diposisikan sebagai pusat pengolahan ekonomi bagi desa-desa di sekitarnya.",
  "Zona Bantuan":
    "Prioritas perlindungan sosial dan bantuan tepat sasaran; hindari beban pemaksaan usaha mandiri.",
  "Belum Terpetakan":
    "Data kesiapan belum mencukupi untuk klasifikasi zona definitif.",
};

/**
 * Tampilan fokus satu desa pada lensa Peta Peran:
 * - Tombol kembali ke tingkat kabupaten
 * - Identitas desa lengkap
 * - Informasi Zona & rekomendasi kebijakan
 * - Posisi koordinat pada matriks (SP & SK) + Tooltip istilah
 * - Metrik pelengkap API (Jarak ke ambang, IDM, sentralitas)
 * - Potensi Dominan & sumbernya
 */
export function DetailDesa({ baris, namaProv, onTutup }: DetailDesaProps) {
  const { data } = useKartu(baris.iddesa);
  const kartu = data as KartuDesa | undefined;

  const belumTerpetakan = baris.zona === "Belum Terpetakan";
  const alasanTampil =
    belumTerpetakan && baris.alasan_belum_terpetakan !== ""
      ? baris.alasan_belum_terpetakan
      : PENJELASAN_ZONA[baris.zona];

  const dotZona = KELAS_DOT_ZONA[baris.zona] || "bg-faint";
  const namaKuadran = KUADRAN_MAP[baris.zona] || "";

  return (
    <div className="flex flex-col gap-3">
      

      {/* Kartu Detail Utama Desa */}
      <section className="rounded-card bg-surface p-5">
        {/* Header Desa */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-title-lg text-ink font-semibold">{baris.nmdesa}</h3>
              {baris.tipe_wilayah && baris.tipe_wilayah !== "tak diketahui" && (
                <span className="rounded-full bg-inset px-2 py-0.5 text-micro text-muted capitalize">
                  {baris.tipe_wilayah}
                </span>
              )}
            </div>
            <p className="mt-1 text-micro text-muted">
              Kec. {baris.nmkec} · Kab. {baris.nmkab}
              {namaProv ? ` · Prov. ${namaProv}` : ""}
            </p>
          </div>
        </div>

        {/* Informasi Zona & Rekomendasi Kebijakan */}
        <div className="mt-4 rounded-inset bg-inset p-4 border border-hairline">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`size-3 rounded-full shrink-0 ${dotZona}`} />
              <div className="flex items-center gap-1">
                <span className="text-body-md text-ink font-semibold">{baris.zona}</span>
                <IstilahTooltip istilah={baris.zona} label="" tampilkanIkon={true} />
              </div>
              <span className="rounded bg-surface px-2 py-0.5 text-[11px] text-muted">
                {namaKuadran}
              </span>
            </div>

            {baris.keyakinan === "rendah" && (
              <div className="flex items-center gap-1">
                <StatusChip status="caution">Keyakinan Rendah</StatusChip>
                <IstilahTooltip istilah="Keyakinan Rendah" label="" tampilkanIkon={true} />
              </div>
            )}
          </div>

          <p className="mt-2.5 text-micro text-body leading-relaxed">{alasanTampil}</p>
        </div>

        {/* Lokasi di Matriks & Nilai Skor Potensi vs Kesiapan */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-micro text-muted font-medium">Koordinat Matriks & Nilai Skor</p>
            <span className="text-[11px] text-muted">
              {baris.desil_sp !== null && baris.desil_sk !== null
                ? `Kuadran: SP Desil ${strip(baris.desil_sp)} · SK Desil ${strip(baris.desil_sk)}`
                : "Posisi di Matriks"}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Skor Potensi (Sumbu Y) */}
            <div className="rounded-inset bg-inset p-3.5 border border-hairline flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-micro text-muted">Sumbu Y:</span>
                  <IstilahTooltip istilah="Skor Potensi" className="text-micro text-muted font-medium" />
                </div>
                <p className="mt-1.5 text-body-md text-ink font-semibold">
                  {baris.desil_sp === null
                    ? strip(null)
                    : `Desil ${formatAngka(baris.desil_sp)} dari 10`}
                </p>
                {baris.SP !== null && baris.SP !== undefined && (
                  <p className="text-micro text-muted mt-0.5">Skor komposit: {baris.SP} / 100</p>
                )}
              </div>
              {kartu?.peta_peran?.peringkat_sp_kab && (
                <p className="mt-2.5 text-micro text-muted border-t border-hairline pt-1.5">
                  Peringkat kab. {kartu.peta_peran.peringkat_sp_kab}
                </p>
              )}
            </div>

            {/* Skor Kesiapan (Sumbu X) */}
            <div className="rounded-inset bg-inset p-3.5 border border-hairline flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-micro text-muted">Sumbu X:</span>
                  <IstilahTooltip istilah="Skor Kesiapan" className="text-micro text-muted font-medium" />
                </div>
                <p className="mt-1.5 text-body-md text-ink font-semibold">
                  {baris.desil_sk === null
                    ? strip(null)
                    : `Desil ${formatAngka(baris.desil_sk)} dari 10`}
                </p>
                {baris.SK !== null && baris.SK !== undefined && (
                  <p className="text-micro text-muted mt-0.5">Skor komposit: {baris.SK} / 100</p>
                )}
              </div>
              {kartu?.peta_peran?.peringkat_sk_kab && (
                <p className="mt-2.5 text-micro text-muted border-t border-hairline pt-1.5">
                  Peringkat kab. {kartu.peta_peran.peringkat_sk_kab}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Metrik Pelengkap dari API */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-micro sm:grid-cols-3">
          {baris.jarak_ke_ambang !== null && baris.jarak_ke_ambang !== undefined && (
            <div className="rounded-inset bg-inset px-2.5 py-2 border border-hairline">
              <div className="flex items-center gap-1">
                <IstilahTooltip istilah="Jarak ke Ambang" label="Jarak Ambang" className="text-[11px] text-muted" />
              </div>
              <span className="text-ink font-medium block mt-0.5">±{baris.jarak_ke_ambang} poin</span>
            </div>
          )}

          {baris.kelengkapan_sk !== null && baris.kelengkapan_sk !== undefined && (
            <div className="rounded-inset bg-inset px-2.5 py-2 border border-hairline">
              <span className="text-muted block text-[11px]">Kelengkapan Data</span>
              <span className="text-ink font-medium block mt-0.5">
                {Math.round(baris.kelengkapan_sk * 100)}%
              </span>
            </div>
          )}

          {baris.idm_status && (
            <div className="rounded-inset bg-inset px-2.5 py-2 border border-hairline">
              <div className="flex items-center gap-1">
                <IstilahTooltip istilah="Status IDM" label="Status IDM" className="text-[11px] text-muted" />
              </div>
              <span className="text-ink font-medium capitalize block mt-0.5">{baris.idm_status}</span>
            </div>
          )}

          {baris.sentralitas_menit !== null && baris.sentralitas_menit !== undefined && (
            <div className="rounded-inset bg-inset px-2.5 py-2 border border-hairline">
              <div className="flex items-center gap-1">
                <IstilahTooltip istilah="Sentralitas" label="Sentralitas" className="text-[11px] text-muted" />
              </div>
              <span className="text-ink font-medium block mt-0.5">{baris.sentralitas_menit} menit</span>
            </div>
          )}
        </div>

        {/* Potensi Dominan & Sumber Data Dominan */}
        <div className="mt-4 pt-3.5 border-t border-hairline">
          <div className="flex items-center gap-1">
            <IstilahTooltip istilah="Potensi Dominan" className="text-micro text-muted font-medium" />
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <p className="text-body-md text-ink font-semibold">
              {strip(baris.potensi_dominan)}
            </p>
            {baris.sumber_dominan && (
              <div className="flex items-center gap-1">
                <BadgeSumber sumber={baris.sumber_dominan} />
                <IstilahTooltip istilah="Sumber Dominan" label="" tampilkanIkon={true} />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tombol Kembali ke Kabupaten */}
      {onTutup && (
        <div>
          <button
            type="button"
            onClick={onTutup}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-micro text-muted hover:text-ink hover:bg-surface transition-colors ${FOCUS_RING}`}
          >
            <ChevronLeftIcon className="size-3.5" />
            <span>Kembali ke Kab. {baris.nmkab}</span>
          </button>
        </div>
      )}
    </div>
  );
}
