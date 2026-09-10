"use client";

/**
 * Hook TanStack Query lensa Peta Peran (Task 18). Semua memanggil
 * `lib/api/endpoints.ts` — tidak ada `fetch` langsung di sini. `staleTime:
 * STALE_BEKU` di seluruh hook (data model hanya berubah saat build data baru
 * di `data/`), konstanta yang sama dipakai `shared/hooks/queries-wilayah.ts`.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import {
  modelPetaPeran,
  modelPetaPeranDetail,
  modelPetaPeranRingkasan,
  modelPetaPeranRingkasanDaftar,
} from "@/lib/api/endpoints";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

import type { BarisPetaPeran, BarisPetaPeranPenuh, NamaZona, RingkasanKab } from "../types";

/** Ukuran halaman daftar desa (Task 23) — server-side, ditampilkan lewat `Pagination`. */
const BATAS_DAFTAR = 50;
/** Ukuran halaman dataset choropleth — sama dengan `BATAS_MAKS` `api/`, cukup
 * untuk kabupaten terbesar yang ada hari ini dengan margin aman. Cacah desa
 * per kabupaten yang nyata ada di keluaran `data/`, bukan diulang di sini
 * (`app/CLAUDE.md` (lokal saja) §9: baca angka dari artefak, jangan direstate di kode). */
const BATAS_PETA = 500;
/** Batas aman putaran pengambilan dataset choropleth (Task 18 GOTCHA 1) —
 * asuransi terhadap kabupaten yang melewati `BATAS_PETA` pada build data
 * berikutnya, supaya loop tidak pernah tak berhingga. */
const MAKS_PUTARAN_PETA = 3;
/** Daftar ringkasan seluruh kabupaten diasumsikan muat dalam SATU halaman
 * ukuran ini — bila asumsi itu meleset, `usePetaPeranRingkasanProvinsi` di
 * bawah melaporkannya lewat `lengkap: false` (review L7), bukan diam-diam
 * terpotong. Cacah kabupaten nyata ada di keluaran `data/`. */
const BATAS_RINGKASAN_PROVINSI = 500;

type RespDaftar = Awaited<ReturnType<typeof modelPetaPeran>>;

/**
 * Daftar baris ringkas Peta Peran, paginasi SISI SERVER. `queryKey` memuat
 * seluruh parameter yang mempengaruhi hasil (Task 18 GOTCHA 3) supaya
 * berganti halaman/filter tidak pernah membaca cache kombinasi lain.
 * `queryFn` mengembalikan `{data, meta}` UTUH (bukan `.data` saja) — pager
 * (`Pagination`) butuh `meta.total`.
 *
 * `placeholderData: keepPreviousData` (review ronde 3 temuan #4): TANPA ini,
 * `queryKey` berganti (`hal` naik/turun) membuat `status` jatuh balik ke
 * `"pending"` sesaat — `isLoading` `DaftarDesa` jadi `true`, badannya
 * (termasuk `Pagination` yang tombol panahnya baru saja ditekan) UNMOUNT
 * diganti kerangka, dan fokus keyboard jatuh ke `<body>`. Dengan opsi ini,
 * halaman SEBELUMNYA tetap tampil (`isLoading` tetap `false`, hanya
 * `isFetching` yang naik di latar) sampai halaman baru tiba — `Pagination`
 * tidak pernah unmount di antara klik.
 */
export function usePetaPeranDaftar(opsi: {
  prov?: string;
  kab?: string;
  zona?: NamaZona;
  hal: number;
  aktif: boolean;
}) {
  const { prov, kab, zona, hal, aktif } = opsi;

  return useQuery<RespDaftar, GalatApi>({
    queryKey: ["peta-peran", "daftar", prov, kab, zona, hal],
    queryFn: () => modelPetaPeran({ prov, kab, zona, hal, batas: BATAS_DAFTAR }),
    enabled: aktif && (Boolean(prov) || Boolean(kab)),
    staleTime: STALE_BEKU,
    placeholderData: keepPreviousData,
  });
}

/**
 * Dataset choropleth SATU kabupaten — TANPA parameter `zona` (Task 18
 * GOTCHA 2: peta selalu mewarnai seluruh desa kabupaten; filter zona hanya
 * menyaring `DaftarDesa`, choropleth berlubang lebih menyesatkan daripada
 * berguna). Melanjutkan halaman berikutnya selama `meta.total` belum
 * terkumpul, dibatasi `MAKS_PUTARAN_PETA` putaran (Task 18 GOTCHA 1) — bila
 * batas tercapai sebelum lengkap, `lengkap: false` dilaporkan lewat nilai
 * balik supaya panel bisa merender satu baris keterangan (Task 25 (e)),
 * bukan diam-diam kehilangan warna sebagian desa.
 *
 * `total` diketik `number | null` (review M5), BUKAN diberi fallback ke
 * `baris.length` — fallback lama membuat `total` SELALU sama dengan yang
 * sudah terkumpul saat `meta` hilang, sehingga `lengkap` menjawab `true`
 * walau dataset-nya sesungguhnya pendek (tidak pernah dikonfirmasi lengkap).
 * `total === null` (meta tidak ada sama sekali) membuat loop TERUS mencoba
 * sampai `MAKS_PUTARAN_PETA` — sama konservatifnya dengan "belum tahu kapan
 * berhenti" — dan `lengkap` hanya `true` bila `total` PERNAH terkonfirmasi
 * dari `meta` DAN baris yang terkumpul sudah mencukupinya. Diekspor untuk
 * diuji langsung (`queries.test.ts`) — sebelumnya privat modul, tidak
 * pernah dieksekusi tes.
 */
export async function ambilPetaPeranPeta(kab: string): Promise<{ baris: BarisPetaPeran[]; lengkap: boolean }> {
  let baris: BarisPetaPeran[] = [];
  let total: number | null = null;

  for (
    let halaman = 1;
    halaman <= MAKS_PUTARAN_PETA && (total === null || baris.length < total);
    halaman += 1
  ) {
    const respons = await modelPetaPeran({ kab, hal: halaman, batas: BATAS_PETA });
    baris = [...baris, ...respons.data];
    total = respons.meta?.total ?? null;
  }

  return { baris, lengkap: total !== null && baris.length >= total };
}

export function usePetaPeranPeta(kab: string | undefined, aktif: boolean) {
  return useQuery<{ baris: BarisPetaPeran[]; lengkap: boolean }, GalatApi>({
    queryKey: ["peta-peran", "peta", kab],
    queryFn: () => ambilPetaPeranPeta(kab as string),
    enabled: aktif && Boolean(kab),
    staleTime: STALE_BEKU,
  });
}

/** Ringkasan SATU kabupaten (satu objek — `GET .../ringkasan?kab=`). */
export function usePetaPeranRingkasan(kab: string | undefined, aktif: boolean) {
  return useQuery<RingkasanKab, GalatApi>({
    queryKey: ["peta-peran", "ringkasan", kab],
    queryFn: async () => (await modelPetaPeranRingkasan(kab as string)).data,
    enabled: aktif && Boolean(kab),
    staleTime: STALE_BEKU,
  });
}

/**
 * Ringkasan seluruh kabupaten milik SATU provinsi — daftar ringkasan penuh
 * (satu halaman `batas=BATAS_RINGKASAN_PROVINSI`) disaring di KLIEN ke
 * `idkab.startsWith(prov)`. Ini filtering baris, bukan aritmetika angka
 * domain (README akar tidak melarangnya) — tidak ada penjumlahan cacah zona
 * di sini (lihat rencana § "NOT Building": tanpa total provinsi).
 *
 * `lengkap` (review L7): `BATAS_RINGKASAN_PROVINSI` sama dengan `BATAS_MAKS`
 * `api/`, jadi daftar ini TIDAK mengulang halaman seperti
 * `ambilPetaPeranPeta` — bila daftar kabupaten nasional pernah melebihi satu
 * halaman, permintaan ini diam-diam kehilangan sisanya. `lengkap` dihitung
 * dari `meta.total` respons UTUH (SEBELUM difilter ke provinsi), dengan
 * asuransi yang sama seperti `ambilPetaPeranPeta`: `meta` hilang tidak pernah
 * dibaca sebagai "sudah lengkap".
 */
export function usePetaPeranRingkasanProvinsi(prov: string | undefined, aktif: boolean) {
  return useQuery<{ daftar: RingkasanKab[]; lengkap: boolean }, GalatApi>({
    queryKey: ["peta-peran", "ringkasan-provinsi", prov],
    queryFn: async () => {
      const respons = await modelPetaPeranRingkasanDaftar({ batas: BATAS_RINGKASAN_PROVINSI });
      const total = respons.meta?.total ?? null;
      return {
        daftar: respons.data.filter((r) => r.idkab.startsWith(prov as string)),
        lengkap: total !== null && respons.data.length >= total,
      };
    },
    enabled: aktif && Boolean(prov),
    staleTime: STALE_BEKU,
  });
}

/** Baris penuh (42 kolom) Peta Peran satu desa. */
export function usePetaPeranDetail(iddesa: string | undefined, aktif: boolean) {
  return useQuery<BarisPetaPeranPenuh, GalatApi>({
    queryKey: ["peta-peran", "detail", iddesa],
    queryFn: async () => (await modelPetaPeranDetail(iddesa as string)).data,
    enabled: aktif && Boolean(iddesa),
    staleTime: STALE_BEKU,
  });
}
