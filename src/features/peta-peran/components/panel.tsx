"use client";

import { EmptyState } from "@/shared/components/empty-state";
import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import {
  usePetaPeranDetail,
  usePetaPeranPeta,
  usePetaPeranRingkasan,
  usePetaPeranRingkasanProvinsi,
} from "../hooks/queries";
import { DetailDesa } from "./detail-desa";
import { MatriksPetaPeran } from "./matriks-peta-peran";
import { RingkasanKabupaten, RingkasanZonaProvinsi } from "./ringkasan-kab";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

export function PetaPeranPanel({ wilayah }: { wilayah: WilayahState }) {
  const { prov, kab, desa, zona, pilihKab, pilihZona, pilihDesa } = wilayah;
  const pusat = usePusat();

  const ringkasanKab = usePetaPeranRingkasan(kab, Boolean(kab));
  const ringkasanProv = usePetaPeranRingkasanProvinsi(prov, Boolean(prov) && !kab);
  const petaPeran = usePetaPeranPeta(kab, Boolean(kab));
  const detail = usePetaPeranDetail(desa, Boolean(desa));

  // 1. Keadaan Belum Memilih Wilayah: Minimal pilih Provinsi dan Kabupaten
  if (!prov || !kab) {
    return (
      <EmptyState pesan="Pilih provinsi dan kabupaten di peta atau kolom pencarian terlebih dahulu" />
    );
  }

  const primer = kab ? ringkasanKab : ringkasanProv;

  const keadaanPrimer = pilihKeadaan({
    isPending: primer.isPending,
    isPaused: primer.isPaused,
    isError: primer.isError,
  });
  const keadaanDetail = pilihKeadaan({
    isPending: detail.isPending,
    isPaused: detail.isPaused,
    isError: detail.isError,
  });

  const namaProv =
    pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? "";
  const namaKab =
    ringkasanKab.data?.nmkab ??
    pusat.data?.kabupaten.find((k) => k.idkab === kab)?.nmkab ??
    "";

  return (
    <>
      {/* Judul Utama Fitur (Hanya tampil di level Provinsi dan Kabupaten) */}
      {!desa && (
        <div className="px-1">
          <h2 className="text-title-md text-ink font-semibold">
            {kab
              ? `Kab. ${namaKab || kab}, Provinsi ${namaProv || prov}`
              : `Provinsi ${namaProv || prov}`}
          </h2>
        </div>
      )}

      {/* State Muat & Galat Primer */}
      {keadaanPrimer === "muat" && <KerangkaMuat baris={JUMLAH_KERANGKA} />}

      {keadaanPrimer === "tertunda" && (
        <section className="rounded-card bg-surface p-5">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi data wilayah belum bisa dimuat." />
          <button
            type="button"
            onClick={() => primer.refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </section>
      )}

      {primer.isError && primer.error.status === 404 && (
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Wilayah tidak ditemukan</p>
          <p className="mt-1 text-body-md text-muted">{pesanGalat(primer.error).pesan}</p>
        </section>
      )}

      {primer.isError && primer.error.status !== 404 && (
        <BlokGalat galat={primer.error} onCobaLagi={() => primer.refetch()} />
      )}

      {/* Konten Utama */}
      {keadaanPrimer === "isi" && (
        <>
          {/* 4. Di Tingkat Desa: Matriks Hilang, Fokus ke Desa */}
          {desa ? (
            <>
              {keadaanDetail === "muat" && <KerangkaMuat baris={2} />}
              {keadaanDetail === "tertunda" && (
                <p className="px-1 py-2 text-micro text-muted">Sambungan terputus.</p>
              )}
              {desa && detail.isError && (
                <p className="px-1 py-2 text-micro text-muted">{pesanGalat(detail.error).judul}</p>
              )}
              {detail.data && (
                <DetailDesa
                  baris={detail.data}
                  namaProv={namaProv}
                  onTutup={() => {
                    if (kab) pilihKab(kab);
                  }}
                />
              )}
            </>
          ) : kab ? (
            /* 3. Di Tingkat Kabupaten: Matriks di Atas dengan Legend Vertikal, Diikuti Indikator */
            <>
              <MatriksPetaPeran
                desaItems={petaPeran.data?.baris}
                desaAktif={desa}
                zonaAktif={zona}
                onPilihDesa={pilihDesa}
                onPilihZona={pilihZona}
              />

              {ringkasanKab.data && (
                <RingkasanKabupaten
                  ringkasan={ringkasanKab.data}
                  namaProv={namaProv}
                />
              )}

              {petaPeran.data?.lengkap === false && (
                <p className="px-1 text-micro text-muted">
                  Sebagian desa di kabupaten ini belum diwarnai karena datanya belum termuat penuh.
                </p>
              )}
            </>
          ) : (
            /* 2. Di Tingkat Provinsi: Tanpa Matriks, Tuliskan Jumlah Distribusi Zona */
            <>
              <RingkasanZonaProvinsi
                daftar={ringkasanProv.data?.daftar ?? []}
                namaProv={namaProv || prov as string}
              />

              {ringkasanProv.data?.lengkap === false && (
                <p className="px-1 text-micro text-muted">
                  Daftar ini belum memuat semua kabupaten.
                </p>
              )}
            </>
          )}
        </>
      )}
    </>
  );
}
