"use client";

/**
 * Orkestrator lensa Desa Kembar (Task 13). Urutan render: breadcrumb ringkas
 * tiga tingkat (Prov › Kab › Desa, pola `kartu-panel.tsx`) → tanpa `desa`:
 * `RegionPicker` + kartu ajakan, BERHENTI di sana → query primer
 * `useDesaKembar(desa, true)` menggerbang muat/404/galat → kartu keadaan
 * kosong berketerangan bila `keterangan` terisi ATAU `tetangga` kosong →
 * `BandingKembar` bila `?kembar=` terisi → `DaftarKembar` selalu di bawahnya.
 *
 * Dua `useKartu` (acuan + kembar) memakai `queryKey: ["kartu", iddesa]` yang
 * SAMA dengan lensa Kartu — cache dibagi, memilih desa yang pernah dibuka
 * tidak menembakkan permintaan baru. `data` keduanya `dict[str, Any]` — cast
 * ke `KartuDesa` SEKALI di sini (pola `kartu-panel.tsx`), tidak berulang di
 * `BandingKembar`.
 */

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "@/shared/components/breadcrumb-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { RegionPicker } from "@/shared/components/region-picker";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";

import { useDesaKembar } from "../hooks/queries";
import { BandingKembar } from "./banding-kembar";
import { DaftarKembar } from "./daftar-kembar";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

export function DesaKembarPanel({ wilayah }: { wilayah: WilayahState }) {
  const { prov, kab, desa, kembar, pilihProv, pilihKab, pilihKembar, reset } = wilayah;
  const pusat = usePusat();

  const kartuAcuan = useKartu(desa);
  const kartuKembar = useKartu(kembar);
  const kembarQuery = useDesaKembar(desa, true);

  if (!desa) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-body-md text-ink">Pilih desa acuan lewat peta atau kolom pencarian.</p>
      </section>
    );
  }

  // Task 11: `isPending` — badan panel ini SELALU dirender sesudah early
  // return `!desa` di atas, jadi `kembarQuery` (enabled: `Boolean(desa)`)
  // SELALU `enabled` di titik ini; tidak ada jebakan query nonaktif macet
  // `isPending`.
  const keadaanKembar = pilihKeadaan({
    isPending: kembarQuery.isPending,
    isPaused: kembarQuery.isPaused,
    isError: kembarQuery.isError,
  });

  if (keadaanKembar === "muat") {
    return (
      <>
        <KerangkaMuat baris={JUMLAH_KERANGKA} />
      </>
    );
  }

  if (keadaanKembar === "tertunda") {
    return (
      <>
        <section className="rounded-card bg-surface p-5">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi Desa Kembar belum bisa dimuat." />
          <button
            type="button"
            onClick={() => kembarQuery.refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </section>
      </>
    );
  }

  if (kembarQuery.isError && kembarQuery.error.status === 404) {
    return (
      <>
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Desa tidak ditemukan</p>
          <p className="mt-1 text-body-md text-muted">{pesanGalat(kembarQuery.error).pesan}</p>
        </section>
      </>
    );
  }

  if (kembarQuery.isError) {
    return (
      <>
        <BlokGalat galat={kembarQuery.error} onCobaLagi={() => kembarQuery.refetch()} />
      </>
    );
  }


  const data = kembarQuery.data;
  if (!data) return null;
  // Keadaan kosong berketerangan (Task 13 GOTCHA 1) — `keterangan` mentah
  // ("desa tanpa vektor fitur pada model kembar v3") TIDAK PERNAH dirender
  // apa adanya; kehadirannya hanya pemicu, panel menulis kalimatnya sendiri.
  if (data.keterangan || data.tetangga.length === 0) {
    return (
      <>
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Belum ada Desa Kembar</p>
          <p className="mt-1 text-body-md text-muted">
            Model kemiripan belum mencakup desa ini. Pilih desa lain sebagai acuan.
          </p>
        </section>
      </>
    );
  }

  // Gerbang pada nilai MENTAH `kembar` (bukan hasil `useKartu`) — Task 13
  // GOTCHA 3: `?kembar=` yang mati (deep-link ke desa yang kartunya 404)
  // tidak boleh membuat panel diam byte-identik dengan "belum ada kembar
  // dipilih".
  // `keadaanBanding` menggabungkan kedua query (`kartuAcuan`+`kartuKembar`) —
  // seluruh blok di bawah sudah digerbang `kembar &&`, jadi `kartuKembar`
  // (yang `enabled: Boolean(kembar)`) dijamin aktif di titik ini juga.
  const keadaanBanding = pilihKeadaan({
    isPending: kartuAcuan.isPending || kartuKembar.isPending,
    isPaused: kartuAcuan.isPaused || kartuKembar.isPaused,
    isError: kartuAcuan.isError || kartuKembar.isError,
  });

  return (
    <>

      {/* `?kembar=` di luar `kab` aktif (review #12) — sah menurut regex
          (`?desa=1801040001&kembar=1802010001`), tapi `useKembarLayers` hanya
          menyorot kembar bila prefix 4 digitnya sama dengan `kab` aktif, jadi
          tanpa keterangan ini pengguna melihat kartu banding penuh tanpa
          sorotan apa pun di peta tanpa tahu sebabnya. */}
      {kembar && kembar.slice(0, 4) !== kab && (
        <p className="px-1 text-micro text-muted">
          Desa Kembar ini di luar kabupaten yang sedang ditampilkan, jadi tidak tersorot di peta.
        </p>
      )}

      {kembar && keadaanBanding === "muat" && <KerangkaMuat baris={1} />}
      {kembar && keadaanBanding === "tertunda" && (
        <p className="px-1 py-2 text-label text-muted">Sambungan terputus.</p>
      )}
      {kembar && (kartuAcuan.isError || kartuKembar.isError) && (
        <p className="px-1 py-2 text-label text-muted">
          {pesanGalat((kartuAcuan.error ?? kartuKembar.error) as GalatApi).judul}
        </p>
      )}
      {kembar && kartuAcuan.data && kartuKembar.data && (
        <BandingKembar
          kiri={kartuAcuan.data as KartuDesa}
          kanan={kartuKembar.data as KartuDesa}
          persen={data.tetangga.find((t) => t.iddesa === kembar)?.persen ?? null}
          // Sama persis dengan penjaga baris keterangan peta di atas (review
          // #12) — review ronde 2 fase 5 B3 memakai nilai yang sama supaya
          // desil dan meter tidak menyandingkan dua kabupaten berbeda.
          lintasKabupaten={kembar.slice(0, 4) !== kab}
        />
      )}

      <DaftarKembar tetangga={data.tetangga} kembarAktif={kembar} onPilih={pilihKembar} />
    </>
  );
}
