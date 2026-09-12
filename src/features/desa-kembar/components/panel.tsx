"use client";

import { ArrowLeftRight } from "lucide-react";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { EmptyState } from "@/shared/components/empty-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useDesaKembar } from "../hooks/queries";
import { BandingKembar } from "./banding-kembar";
import { KartuKomparasiAtas } from "./kartu-komparasi-atas";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

export function DesaKembarPanel({ wilayah }: { wilayah: WilayahState }) {
  const { kab, desa, kembar, pilihKembar } = wilayah;

  const kartuAcuan = useKartu(desa);
  const kartuKembar = useKartu(kembar);
  const kembarQuery = useDesaKembar(desa, true);

  // 1. Belum memilih desa acuan (bisa pilih lewat peta atau search box)
  if (!desa) {
    return (
      <EmptyState pesan="Pilih desa di peta atau kolom pencarian terlebih dahulu" />
    );
  }

  const keadaanKembar = pilihKeadaan({
    isPending: kembarQuery.isPending || kartuAcuan.isPending,
    isPaused: kembarQuery.isPaused || kartuAcuan.isPaused,
    isError: kembarQuery.isError || kartuAcuan.isError,
  });

  if (keadaanKembar === "muat") {
    return <KerangkaMuat baris={JUMLAH_KERANGKA} />;
  }

  if (keadaanKembar === "tertunda") {
    return (
      <section className="rounded-card bg-surface p-5">
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi data Desa Kembar belum bisa dimuat." />
        <button
          type="button"
          onClick={() => {
            kembarQuery.refetch();
            kartuAcuan.refetch();
          }}
          className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </section>
    );
  }

  if (kembarQuery.isError && kembarQuery.error.status === 404) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Desa tidak ditemukan</p>
        <p className="mt-1 text-body-md text-muted">{pesanGalat(kembarQuery.error).pesan}</p>
      </section>
    );
  }

  if (kembarQuery.isError) {
    return <BlokGalat galat={kembarQuery.error} onCobaLagi={() => kembarQuery.refetch()} />;
  }

  if (kartuAcuan.isError) {
    return <BlokGalat galat={kartuAcuan.error} onCobaLagi={() => kartuAcuan.refetch()} />;
  }

  const data = kembarQuery.data;
  if (!data || !kartuAcuan.data) return null;

  if (data.keterangan || data.tetangga.length === 0) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Belum ada Desa Kembar</p>
        <p className="mt-1 text-body-md text-muted">
          Model kemiripan belum mencakup desa ini. Pilih desa lain sebagai acuan.
        </p>
      </section>
    );
  }

  const keadaanBanding = pilihKeadaan({
    isPending: kartuAcuan.isPending || kartuKembar.isPending,
    isPaused: kartuAcuan.isPaused || kartuKembar.isPaused,
    isError: kartuAcuan.isError || kartuKembar.isError,
  });

  return (
    <div className="space-y-4">
      {/* 2. Dua card di panel atas: Sisi kiri Desa Acuan, sisi kanan Desa Kembar dengan Combobox */}
      <KartuKomparasiAtas
        kiri={kartuAcuan.data as KartuDesa}
        kanan={kembar && kartuKembar.data ? (kartuKembar.data as KartuDesa) : null}
        tetangga={data.tetangga}
        kembarAktif={kembar}
        persen={data.tetangga.find((t) => t.iddesa === kembar)?.persen ?? null}
        onPilihKembar={pilihKembar}
      />

      {/* Peringatan bila Desa Kembar berada di luar Kabupaten acuan */}
      {kembar && kembar.slice(0, 4) !== kab && (
        <p className="px-1 text-micro text-muted">
          Desa Kembar ini di luar kabupaten yang sedang ditampilkan, jadi tidak tersorot di peta.
        </p>
      )}

      {/* 3. Detail perbandingan di bawah card perbandingan */}
      {kembar ? (
        <>
          {keadaanBanding === "muat" && <KerangkaMuat baris={2} />}
          {keadaanBanding === "tertunda" && (
            <p className="px-1 py-2 text-label text-muted">Sambungan terputus.</p>
          )}
          {(kartuAcuan.isError || kartuKembar.isError) && (
            <p className="px-1 py-2 text-label text-muted">
              {pesanGalat((kartuAcuan.error ?? kartuKembar.error) as GalatApi).judul}
            </p>
          )}
          {kartuAcuan.data && kartuKembar.data && (
            <BandingKembar
              kiri={kartuAcuan.data as KartuDesa}
              kanan={kartuKembar.data as KartuDesa}
              persen={data.tetangga.find((t) => t.iddesa === kembar)?.persen ?? null}
              lintasKabupaten={kembar.slice(0, 4) !== kab}
            />
          )}
        </>
      ) : (
        <section className="flex min-h-[200px] flex-col items-center justify-center rounded-card bg-surface/70 border border-hairline p-6 sm:p-8 text-center">
          <div className="mb-2.5 flex size-11 items-center justify-center rounded-full bg-float border border-line text-muted shadow-2xs">
            <ArrowLeftRight className="size-5 text-muted" strokeWidth={1.75} />
          </div>
          <p className="text-title-sm font-semibold text-ink">Perbandingan Menunggu Pilihan</p>
          <p className="mt-1 max-w-[280px] text-micro text-muted leading-relaxed">
            Pilih desa kembar melalui combobox di kartu atas untuk melihat perbandingan indikator pembangunan secara langsung.
          </p>
        </section>
      )}
    </div>
  );
}
