"use client";

import { bisa } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { SeksiBerita } from "@/features/berita/components/seksi-berita";
import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useKartu } from "../hooks/queries";
import type { KartuDesa } from "../types";
import { QuickLinksDesa } from "./quick-links-desa";
import { SeksiEntitas } from "./seksi-entitas";
import { SeksiMutuData } from "./seksi-mutu-data";
import { SeksiRekomendasi } from "./seksi-rekomendasi";
import { TabAnalitikDesa } from "./tab-analitik-desa";

type WilayahState = ReturnType<typeof useWilayahParams>;

type KartuPanelProps = {
  wilayah: Pick<WilayahState, "prov" | "kab" | "desa" | "pilihProv" | "pilihKab" | "reset" | "gantiLensa">;
};

const JUMLAH_KERANGKA = 4;

/**
 * Orkestrator lensa Kartu Ekonomi Desa:
 * 1. Hero Card: Informasi Desa singkat dengan gradasi visual pembeda, nama desa selalu utuh,
 *    indikator Zona dengan link ke Peta Peran, dan tombol export Laporan Desa (PDF) ber-tooltip.
 * 2. Quick Links: Navigasi cepat ke Desa Kembar, Citra Potensi Desa, dan Jalur Ekonomi.
 * 3. Rekomendasi Aksi: Highlight insight arahan aksi sebelum telaah data detail.
 * 4. Tab Analitik Desa: Tab interaktif berisi Potensi Dominan, Kesiapan, Fakta Program, dan Biofisik & Logistik.
 * 5. Berita Desa: Informasi aktual seputar desa terkait.
 * 6. Mutu Data: Indikator kelengkapan geometri, sensus, IDM, dan bukti SK.
 */
export function KartuPanel({ wilayah }: KartuPanelProps) {
  const { prov, desa, gantiLensa } = wilayah;
  const pusat = usePusat();
  const { peran, memuat } = useSesi();
  const { data, isPending, isPaused, isError, error, refetch } = useKartu(desa);
  const kartu = data as KartuDesa | undefined;

  const keadaan = pilihKeadaan({ isPending, isPaused, isError });

  const kalimatStatus =
    keadaan === "muat"
      ? "Memuat kartu desa."
      : keadaan === "isi" && kartu
        ? `Kartu ${kartu.identitas.nama} termuat.`
        : "";

  const bisaBerita = !memuat && bisa(peran, "berita");
  const bisaLaporan = !memuat && bisa(peran, "laporan");

  const namaProvinsi = pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov ?? "—";

  return (
    <>
      <p role="status" aria-live="polite" className="sr-only">
        {kalimatStatus}
      </p>

      {keadaan === "muat" && <KerangkaMuat baris={JUMLAH_KERANGKA} />}

      {keadaan === "tertunda" && (
        <section className="rounded-card bg-surface p-5">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi kartu desa belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </section>
      )}

      {isError && error.status === 404 && (
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Desa tidak ditemukan</p>
          <p className="mt-1 text-body-md text-muted">{pesanGalat(error).pesan}</p>
        </section>
      )}

      {isError && error.status !== 404 && (
        <BlokGalat galat={error} onCobaLagi={() => refetch()} />
      )}

      {keadaan === "isi" && kartu && (
        <div className="space-y-4">
          {/* 1. Hero Card: Identitas Desa + Zona + Export Laporan */}
          <SeksiEntitas
            identitas={kartu.identitas}
            namaProvinsi={namaProvinsi}
            petaPeran={kartu.peta_peran}
            bisaLaporan={bisaLaporan}
            onNavigasiPetaPeran={() => gantiLensa("peta-peran")}
          />

          {/* 2. Quick Links: Desa Kembar, Citra Potensi, Jalur Ekonomi */}
          <QuickLinksDesa onPilihLensa={(lensa) => gantiLensa(lensa)} />

          {/* 3. Rekomendasi Aksi: Arahan Strategis Kebijakan */}
          <SeksiRekomendasi teks={kartu.rekomendasi_aksi} />

          {/* 4. Tab Analitik Desa: Potensi, Kesiapan, Fakta Program, Biofisik & Logistik */}
          <TabAnalitikDesa kartu={kartu} />

          {/* 5. Berita Desa */}
          {bisaBerita && desa && <SeksiBerita key={`berita-${desa}`} iddesa={desa} />}

          {/* 6. Mutu Data */}
          <SeksiMutuData mutuData={kartu.mutu_data} />
        </div>
      )}
    </>
  );
}
