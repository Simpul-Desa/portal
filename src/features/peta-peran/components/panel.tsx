"use client";

import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "@/shared/components/breadcrumb-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { RegionPicker } from "@/shared/components/region-picker";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import {
  usePetaPeranDetail,
  usePetaPeranPeta,
  usePetaPeranRingkasan,
  usePetaPeranRingkasanProvinsi,
} from "../hooks/queries";
import { DaftarDesa } from "./daftar-desa";
import { DetailDesa } from "./detail-desa";
import { FilterZona } from "./filter-zona";
import { RingkasanKabupaten, RingkasanProvinsi } from "./ringkasan-kab";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

/**
 * Orkestrator lensa Peta Peran (Task 25). Urutan render: breadcrumb ringkas
 * (pola `kartu-panel.tsx`) → `DetailDesa` bila `desa` terisi → ringkasan
 * (kabupaten ATAU provinsi, tergantung mana yang aktif) → `FilterZona` →
 * `DaftarDesa`.
 *
 * Query PRIMER yang menentukan keadaan muat/404/galat seluruh badan panel:
 * `usePetaPeranRingkasan(kab)` bila kabupaten aktif, kalau tidak
 * `usePetaPeranRingkasanProvinsi(prov)` — pola sama seperti `useKartu` di
 * `kartu-panel.tsx`. `DetailDesa` (query terpisah, `usePetaPeranDetail`)
 * dan `DaftarDesa` (query terpisah, `usePetaPeranDaftar`) menangani
 * muat/galat MASING-MASING secara ringkas (baris kecil, bukan kartu galat
 * penuh) karena keduanya elemen SEKUNDER di bawah ringkasan, bukan gerbang
 * seluruh panel.
 *
 * `usePetaPeranPeta(kab)` dipanggil LAGI di sini — bukan permintaan baru,
 * `queryKey` sama dengan yang dipanggil `usePetaPeranData` di
 * `dashboard-shell.tsx` (cache TanStack dibagi) — HANYA untuk membaca
 * bendera `lengkap` (Task 18 GOTCHA 1) untuk baris keterangan (e). Ini
 * pilihan "panel memanggil query yang sama" dari dua opsi threading yang
 * disebut arahan Blok C, dipilih karena `PetaPeranPanel` dibatasi menerima
 * `{ wilayah }` saja (kontrak tetap Task 15 GOTCHA 2 lintas lensa) — prop
 * tambahan `lengkap` akan memecah kontrak seragam itu.
 */
export function PetaPeranPanel({ wilayah }: { wilayah: WilayahState }) {
  const { prov, kab, desa, zona, pilihProv, pilihKab, pilihZona, pilihDesa, reset } = wilayah;
  const pusat = usePusat();

  const ringkasanKab = usePetaPeranRingkasan(kab, Boolean(kab));
  const ringkasanProv = usePetaPeranRingkasanProvinsi(prov, Boolean(prov) && !kab);
  const petaPeran = usePetaPeranPeta(kab, Boolean(kab));
  const detail = usePetaPeranDetail(desa, Boolean(desa));

  if (!prov && !kab) {
    return (
      <>
        <section className="rounded-card bg-surface p-5">
          <p className="text-body-md text-ink">
            Pilih provinsi atau kabupaten di peta, atau dari daftar di bawah.
          </p>
        </section>
        <RegionPicker wilayah={wilayah} />
      </>
    );
  }

  const primer = kab ? ringkasanKab : ringkasanProv;

  // Task 11: `isPending` (bukan `isLoading`) — badan panel ini SELALU
  // dirender sesudah early return `!prov && !kab` di atas, jadi `primer`
  // (ringkasanKab/ringkasanProv) SELALU `enabled` di titik ini; tidak ada
  // jebakan query nonaktif yang membuat `isPending` macet `true` selamanya.
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

  const chip: ChipWilayah[] = [];
  if (prov) {
    chip.push({
      tingkat: "prov",
      label: pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov,
      onHapus: reset,
    });
  }
  if (prov && kab) {
    chip.push({
      tingkat: "kab",
      label: pusat.data?.kabupaten.find((k) => k.idkab === kab)?.nmkab ?? kab,
      onHapus: () => pilihProv(prov),
    });
  }
  if (prov && kab && desa) {
    chip.push({
      tingkat: "desa",
      label: detail.data?.nmdesa ?? desa,
      onHapus: () => pilihKab(kab),
    });
  }

  return (
    <>
      <BreadcrumbWilayah chip={chip} />

      {desa && keadaanDetail === "muat" && <KerangkaMuat baris={1} />}
      {desa && keadaanDetail === "tertunda" && (
        <p className="px-1 py-2 text-label text-muted">Sambungan terputus.</p>
      )}
      {desa && detail.isError && (
        <p className="px-1 py-2 text-label text-muted">{pesanGalat(detail.error).judul}</p>
      )}
      {desa && detail.data && <DetailDesa baris={detail.data} />}

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

      {keadaanPrimer === "isi" && (
        <>
          {kab && ringkasanKab.data && <RingkasanKabupaten ringkasan={ringkasanKab.data} />}
          {!kab && <RingkasanProvinsi daftar={ringkasanProv.data?.daftar ?? []} onPilihKab={pilihKab} />}

          <FilterZona zonaAktif={zona} ringkasan={kab ? ringkasanKab.data : undefined} onPilih={pilihZona} />

          <DaftarDesa
            key={`${prov ?? ""}-${kab ?? ""}-${zona ?? ""}`}
            prov={prov}
            kab={kab}
            zona={zona}
            desaAktif={desa}
            onPilihDesa={pilihDesa}
          />

          {kab && petaPeran.data?.lengkap === false && (
            <p className="text-micro text-muted">
              Sebagian desa di kabupaten ini belum diwarnai karena datanya belum termuat penuh.
            </p>
          )}

          {!kab && ringkasanProv.data?.lengkap === false && (
            <p className="text-micro text-muted">
              Daftar ini belum memuat semua kabupaten.
            </p>
          )}
        </>
      )}
    </>
  );
}
