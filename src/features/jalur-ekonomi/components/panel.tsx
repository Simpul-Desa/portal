"use client";

/**
 * Orkestrator lensa Jalur Ekonomi:
 * 1. 4 Tab varian penuh berikon (Komoditas, Gudang Kopdes, Cold Storage, Wisata)
 * 2. Parameter varian (open toggle baca selengkapnya, default tertutup)
 * 3. Pencarian / Combobox Desa Poros (menggantikan list statis panjang)
 * 4. List Desa Poros & Desa Sejalur dengan highlight warna visual saat jalur terpilih
 * (Catatan: Status kartu desa terpilih diposisikan melayang di atas peta / MapStage)
 */

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { VARIAN_DEFAULT, type Varian } from "@/lib/url-state";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatAngka } from "@/shared/format";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useJalurDaftar } from "../hooks/queries";
import { useJalurData } from "../hooks/use-jalur-data";
import type { JalurTernormalisasi } from "../types";
import { CariJalurCombobox } from "./cari-jalur-combobox";
import { DetailJalur } from "./detail-jalur";
import { ParameterVarian } from "./parameter-varian";
import { PilihVarian } from "./pilih-varian";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 2;

type BadanJalurEkonomiProps = {
  varian: Varian;
  kab?: string;
  desa?: string;
  jalurAktif?: string;
  onPilihJalur: WilayahState["pilihJalur"];
  onPilihDesa: WilayahState["pilihDesa"];
  jalurTerpilih: JalurTernormalisasi | null;
  n_tanpa_koordinat: number;
  porosTanpaKoordinat: boolean;
  isLoadingJalur: boolean;
  isErrorJalur: boolean;
  errorJalur: GalatApi | null;
  isPausedJalur: boolean;
};

function BadanJalurEkonomi({
  varian,
  kab,
  desa,
  jalurAktif,
  onPilihJalur,
  onPilihDesa,
  jalurTerpilih,
  n_tanpa_koordinat,
  porosTanpaKoordinat,
  isLoadingJalur,
  isErrorJalur,
  errorJalur,
  isPausedJalur,
}: BadanJalurEkonomiProps) {
  const primer = useJalurDaftar({ varian, kab, hal: 1, aktif: true });

  const keadaanPrimer = pilihKeadaan({
    isPending: primer.isPending,
    isPaused: primer.isPaused,
    isError: primer.isError,
  });

  if (keadaanPrimer === "muat") return <KerangkaMuat baris={JUMLAH_KERANGKA} />;

  if (keadaanPrimer === "tertunda") {
    return (
      <section className="rounded-card bg-surface p-5">
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi Jalur Ekonomi belum bisa dimuat." />
        <button
          type="button"
          onClick={() => primer.refetch()}
          className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </section>
    );
  }

  if (primer.isError && primer.error.kode === "WILAYAH_TIDAK_ADA") {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Varian ini tidak mencakup kabupaten terpilih</p>
        <p className="mt-1 text-body-md text-muted">Pilih varian lain, atau ganti kabupatennya.</p>
      </section>
    );
  }

  if (primer.isError) {
    return <BlokGalat galat={primer.error} onCobaLagi={() => primer.refetch()} />;
  }

  if (!primer.data) return null;

  if (primer.data.meta?.total === 0) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">
          {kab ? "Tidak ada jalur di kabupaten ini" : "Tidak ada jalur untuk varian ini"}
        </p>
        <p className="mt-1 text-body-md text-muted">
          {kab
            ? "Kabupaten ini belum punya jalur ekonomi untuk varian yang dipilih."
            : "Varian ini tidak punya jalur ekonomi."}
        </p>
      </section>
    );
  }

  const keadaanJalurAktif = pilihKeadaan({
    isPending: isLoadingJalur,
    isPaused: isPausedJalur,
    isError: isErrorJalur,
  });

  return (
    <div className="space-y-3">
      {/* 1. Parameter Ketentuan Varian (Collapsible / Default Closed) */}
      <ParameterVarian varian={varian} parameter={primer.data.meta?.parameter} />

      {/* 2. Search / Combobox Pemilihan Desa Poros */}
      <CariJalurCombobox
        varian={varian}
        kab={kab}
        jalurAktif={jalurAktif}
        onPilih={onPilihJalur}
        onReset={() => onPilihJalur("")}
      />

      {/* 3. Detail Jalur Terpilih: List Desa Poros dan List Desa Sejalur dengan Highlight Warna */}
      {jalurAktif && isLoadingJalur && <KerangkaMuat baris={2} />}
      {jalurAktif && keadaanJalurAktif === "tertunda" && (
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi detail jalur belum bisa dimuat." />
      )}
      {jalurAktif && isErrorJalur && errorJalur && (
        <p className="px-1 py-2 text-label text-muted">{pesanGalat(errorJalur).judul}</p>
      )}

      {jalurTerpilih ? (
        <DetailJalur
          varian={varian}
          jalur={jalurTerpilih}
          desaAktif={desa}
          onPilihDesa={(d) => onPilihDesa(d, { kab })}
          onTutup={() => onPilihJalur("")}
        />
      ) : (
        <div className="rounded-card bg-surface/70 p-6 text-center border border-line/30 shadow-xs">
          <p className="text-body-md font-medium text-ink">Belum ada Desa Poros yang dipilih</p>
          <p className="text-micro text-muted mt-1 max-w-xs mx-auto">
            Gunakan kolom pencarian di atas untuk memilih desa poros dan menelaah daftar desa sejalurnya.
          </p>
        </div>
      )}

      {/* Keterangan Koordinat & Peta */}
      {jalurTerpilih && !kab ? (
        <p className="text-micro text-muted">
          Garis jalur ini belum tergambar di peta karena kabupatennya belum dipilih.
        </p>
      ) : porosTanpaKoordinat ? (
        <p className="text-micro text-muted">
          Desa Poros jalur ini tidak punya batas wilayah, jadi garisnya sama sekali tidak tergambar di peta.
        </p>
      ) : (
        n_tanpa_koordinat > 0 && (
          <p className="text-micro text-muted">
            {formatAngka(n_tanpa_koordinat)} desa tidak punya batas wilayah, jadi garisnya tidak tergambar di peta.
          </p>
        )
      )}
    </div>
  );
}

export function JalurEkonomiPanel({ wilayah }: { wilayah: WilayahState }) {
  const {
    kab,
    desa,
    varian,
    jalur,
    pilihVarian,
    pilihJalur,
    pilihDesa,
  } = wilayah;
  const varianAktif = varian ?? VARIAN_DEFAULT;

  const {
    jalur: jalurTerpilih,
    n_tanpa_koordinat,
    porosTanpaKoordinat,
    isLoadingJalur,
    isErrorJalur,
    errorJalur,
    isPausedJalur,
  } = useJalurData({
    kab,
    varian: varianAktif,
    idJalur: jalur,
    aktif: true,
  });

  return (
    <div className="space-y-3">
      {/* 4 Tab Varian Penuh Berikon (Komoditas, Gudang Kopdes, Cold Storage, Wisata) */}
      <PilihVarian varian={varianAktif} onPilih={pilihVarian} />

      {/* Badan Panel Jalur Ekonomi */}
      <BadanJalurEkonomi
        key={`${varianAktif}-${kab ?? ""}`}
        varian={varianAktif}
        kab={kab}
        desa={desa}
        jalurAktif={jalur}
        onPilihJalur={pilihJalur}
        onPilihDesa={pilihDesa}
        jalurTerpilih={jalurTerpilih}
        n_tanpa_koordinat={n_tanpa_koordinat}
        porosTanpaKoordinat={porosTanpaKoordinat}
        isLoadingJalur={isLoadingJalur}
        isErrorJalur={isErrorJalur}
        errorJalur={errorJalur}
        isPausedJalur={isPausedJalur}
      />
    </div>
  );
}
