"use client";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import { WARNA_ZONA } from "@/lib/map/zona";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ArrowUpRightIcon, ChevronLeftIcon } from "@/shared/components/icons";
import { formatAngka } from "@/shared/format";
import { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import type { BarisPetaPeranPenuh, NamaZona } from "../types";
import { IstilahTooltip } from "./istilah-tooltip";

type DetailDesaProps = {
  baris: BarisPetaPeranPenuh;
  namaProv?: string;
  onTutup?: () => void;
};

const KUADRAN_MAP: Record<NamaZona, string> = {
  "Zona Pemerintah": "Kuadran I",
  "Zona Mitra": "Kuadran II",
  "Zona Poros": "Kuadran III",
  "Zona Bantuan": "Kuadran IV",
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
 * Kotak Skor untuk Skor Potensi & Skor Kesiapan:
 * Tampilan nilai numerik (skor besar bold / 100 agak kecil tipis),
 * pill desil beraksen warna pembeda, dan peringkat kabupaten.
 */
function KotakSkor({
  judul,
  istilah,
  nilai,
  desil,
  peringkatKab,
  warnaAksen,
  badgeBg,
}: {
  judul: string;
  istilah: string;
  nilai: number | null | undefined;
  desil: number | null | undefined;
  peringkatKab?: number | null;
  warnaAksen: string;
  badgeBg: string;
}) {
  return (
    <div
      className="flex flex-col justify-between p-3.5 rounded-inset bg-surface/80 border border-hairline relative overflow-hidden"
      style={{ borderTop: `3px solid ${warnaAksen}` }}
    >
      <div>
        {/* Label dengan IstilahTooltip */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-micro font-semibold text-ink">{judul}</span>
          <IstilahTooltip istilah={istilah} label="" tampilkanIkon={true} />
        </div>

        {/* Nilai: 35 (besar bold) / 100 (agak kecil tipis) */}
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="text-metric-md font-bold text-ink leading-none tracking-tight">
            {nilai !== null && nilai !== undefined ? Math.round(nilai) : "—"}
          </span>
          <span className="text-micro text-muted font-normal leading-none">
            / 100
          </span>
        </div>
      </div>

      {/* Desil & Peringkat */}
      <div className="mt-3 pt-2.5 border-t border-hairline/80 flex flex-col gap-1.5">
        <div>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-badge font-bold border ${badgeBg}`}
          >
            {desil !== null && desil !== undefined ? `Desil ${formatAngka(desil)}` : "Desil —"}
          </span>
        </div>

        <p className="text-micro text-muted leading-tight">
          {peringkatKab !== null && peringkatKab !== undefined ? (
            <>
              Peringkat <strong className="text-ink font-semibold">#{peringkatKab}</strong> se-Kab.
            </>
          ) : (
            <span className="text-faint">Peringkat —</span>
          )}
        </p>
      </div>
    </div>
  );
}

/**
 * Tampilan fokus satu desa pada lensa Peta Peran:
 * - Card 1: Hero Card Identitas Desa & Zona dengan banner warna zona solid, nama desa kontras,
 *   link Kartu Desa, dan callout strategi kebijakan zona.
 * - Card 2: Koordinat Matriks Analitik: Dua kotak skor (SP & SK) + indikator kelengkapan / jarak.
 */
export function DetailDesa({ baris, namaProv, onTutup }: DetailDesaProps) {
  const { data } = useKartu(baris.iddesa);
  const kartu = data as KartuDesa | undefined;
  const wilayah = useWilayahParams();

  const belumTerpetakan = baris.zona === "Belum Terpetakan";
  const alasanTampil =
    belumTerpetakan && baris.alasan_belum_terpetakan !== ""
      ? baris.alasan_belum_terpetakan
      : PENJELASAN_ZONA[baris.zona];

  const namaKuadran = KUADRAN_MAP[baris.zona] || "";
  const warnaZona =
    baris.zona === "Belum Terpetakan"
      ? "#6b7280"
      : WARNA_ZONA[baris.zona as NamaZona] ?? "#00a9bf";

  // Untuk Zona Bantuan (#8d9aab), gunakan nada slate yang lebih gelap (#5c6c7f)
  // pada latar profil agar kontras teks putih tetap tajam, kontras tinggi, dan terbaca jelas.
  const warnaLatarProfil =
    baris.zona === "Zona Bantuan"
      ? "#5c6c7f"
      : baris.zona === "Belum Terpetakan"
        ? "#4e5563"
        : warnaZona;

  const nilaiSP = baris.SP ?? kartu?.peta_peran?.sp;
  const nilaiSK = baris.SK ?? kartu?.peta_peran?.sk;
  const desilSP = baris.desil_sp ?? kartu?.peta_peran?.desil_sp;
  const desilSK = baris.desil_sk ?? kartu?.peta_peran?.desil_sk;
  const peringkatSP = kartu?.peta_peran?.peringkat_sp_kab;
  const peringkatSK = kartu?.peta_peran?.peringkat_sk_kab;

  return (
    <div className="flex flex-col gap-3">
      {/* Tombol Kembali ke Kabupaten */}
      {onTutup && (
        <div className="px-1">
          <button
            type="button"
            onClick={onTutup}
            className={`inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-micro font-medium text-muted hover:text-ink hover:bg-float border border-hairline transition-all ${FOCUS_RING}`}
          >
            <ChevronLeftIcon className="size-3.5" />
            <span>Kembali ke Kab. {baris.nmkab}</span>
          </button>
        </div>
      )}

      {/* Kartu Utama Peta Peran dengan background gradasi atas-ke-bawah memutih */}
      <section
        className="overflow-hidden rounded-card border border-line/60 shadow-xs"
        style={{
          background: `linear-gradient(180deg, ${warnaLatarProfil} 0%, ${warnaLatarProfil} 38%, ${warnaLatarProfil}24 58%, #ffffff 80%)`,
        }}
      >
        <div className="p-4 md:p-4.5 space-y-3.5">
          {/* 1. Keterangan Desa (Profil Desa) - Teks Putih Kontras Tinggi */}
          <div>
            {/* Baris 1 (Atas): Badge ZONA di kiri sejajar dengan Link Kartu Ekonomi Desa di kanan */}
            <div className="pt-1 flex items-center justify-between gap-2.5 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-badge font-bold tracking-wide uppercase text-ink shadow-xs">
                  <span
                    className="size-2 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        baris.zona === "Belum Terpetakan"
                          ? "#6b7280"
                          : WARNA_ZONA[baris.zona as NamaZona] ?? "#00a9bf",
                    }}
                  />
                  <span>{baris.zona}</span>
                  <span className="text-muted font-semibold">• {namaKuadran}</span>
                </span>

                {baris.keyakinan === "rendah" && (
                  <div className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-badge font-medium text-white border border-white/20 backdrop-blur-xs shadow-2xs">
                    <span>Keyakinan Rendah</span>
                    <IstilahTooltip istilah="Keyakinan Rendah" label="" tampilkanIkon={true} />
                  </div>
                )}
              </div>

              {/* Link ke Kartu Ekonomi Desa: Hanya text + icon, tanpa border/outline */}
              <button
                type="button"
                onClick={() => wilayah.gantiLensa("kartu")}
                className={`group shrink-0 inline-flex items-center gap-1 text-micro font-semibold text-white hover:text-white/80 transition-colors cursor-pointer drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)] ${FOCUS_RING}`}
                title="Buka Kartu Ekonomi Desa lengkap"
              >
                <span>Kartu Ekonomi Desa</span>
                <ArrowUpRightIcon className="size-3.5 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            {/* Baris 2: Nama Desa & Hirarki Wilayah di bawah baris atas */}
            <div className="mt-6">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-title-lg font-bold text-white leading-snug break-words tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
                  {baris.nmdesa}
                </h2>
                {baris.tipe_wilayah && baris.tipe_wilayah !== "tak diketahui" && (
                  <span className="rounded-full bg-white/20 px-2 py-0.5 text-badge font-semibold text-white capitalize border border-white/35 backdrop-blur-xs shadow-2xs shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                    {baris.tipe_wilayah}
                  </span>
                )}
              </div>

              {/* Hirarki Wilayah */}
              <p className="mt-1 text-label font-medium text-white/90 drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.25)]">
                Kec. {baris.nmkec} • Kab. {baris.nmkab}
                {namaProv ? ` • Prov. ${namaProv}` : ""}
              </p>
            </div>

            {/* Baris 3: Ringkasan strategi kebijakan zona */}
            {alasanTampil && (
              <div className="mt-2.5 rounded-inset bg-black/15 backdrop-blur-xs px-3.5 py-2.5 border border-white/20 shadow-2xs">
                <p className="text-micro font-medium text-white/95 leading-relaxed drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                  {alasanTampil}
                </p>
              </div>
            )}
          </div>

          {/* 2. Koordinat Matriks (Card): Dua kotak skor (SP & SK) + list kebawah */}
          <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
            <div className="pb-2.5 mb-3 border-b border-hairline">
              <h3 className="text-title-sm font-bold text-ink">Koordinat Matriks Analitik</h3>
            </div>

            {/* Skor Potensi & Skor Kesiapan (tanpa chart lingkaran, pakai nilai numerik) */}
            <div className="grid grid-cols-2 gap-3">
              <KotakSkor
                judul="Skor Potensi"
                istilah="Skor Potensi"
                nilai={nilaiSP}
                desil={desilSP}
                peringkatKab={peringkatSP}
                warnaAksen="#ff7300"
                badgeBg="bg-primary/10 text-primary border-primary/25"
              />
              <KotakSkor
                judul="Skor Kesiapan"
                istilah="Skor Kesiapan"
                nilai={nilaiSK}
                desil={desilSK}
                peringkatKab={peringkatSK}
                warnaAksen="#31a863"
                badgeBg="bg-positive/10 text-positive-deep border-positive/25"
              />
            </div>

            {/* List Kebawah: Jarak ambang, bukti SK, status IDM, sentralitas */}
            <div className="mt-3.5 pt-2 border-t border-hairline divide-y divide-hairline">
              {/* Jarak ke Ambang */}
              <div className="flex items-center justify-between py-2 text-micro">
                <div className="flex items-center">
                  <span className="text-muted">Jarak ke Ambang Batas</span>
                  <IstilahTooltip istilah="Jarak ke Ambang" label="" tampilkanIkon={true} />
                </div>
                <span className="font-semibold text-ink">
                  {baris.jarak_ke_ambang !== null && baris.jarak_ke_ambang !== undefined
                    ? `±${baris.jarak_ke_ambang} poin`
                    : "—"}
                </span>
              </div>

              {/* Kelengkapan Bukti SK */}
              <div className="flex items-center justify-between py-2 text-micro">
                <div className="flex items-center">
                  <span className="text-muted">Kelengkapan Bukti SK</span>
                  <IstilahTooltip istilah="Kelengkapan Bukti SK" label="" tampilkanIkon={true} />
                </div>
                <span className="font-semibold text-ink">
                  {baris.kelengkapan_sk !== null && baris.kelengkapan_sk !== undefined
                    ? `${Math.round(baris.kelengkapan_sk * 100)}%`
                    : "—"}
                </span>
              </div>

              {/* Status IDM */}
              <div className="flex items-center justify-between py-2 text-micro">
                <div className="flex items-center">
                  <span className="text-muted">Status IDM Kemendesa</span>
                  <IstilahTooltip istilah="Status IDM" label="" tampilkanIkon={true} />
                </div>
                <span className="font-semibold text-ink capitalize">
                  {baris.idm_status ?? "—"}
                </span>
              </div>

              {/* Sentralitas */}
              <div className="flex items-center justify-between py-2 text-micro">
                <div className="flex items-center">
                  <span className="text-muted">Sentralitas Waktu Tempuh</span>
                  <IstilahTooltip istilah="Sentralitas" label="" tampilkanIkon={true} />
                </div>
                <span className="font-semibold text-ink">
                  {baris.sentralitas_menit !== null && baris.sentralitas_menit !== undefined
                    ? `${baris.sentralitas_menit} menit`
                    : "—"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
