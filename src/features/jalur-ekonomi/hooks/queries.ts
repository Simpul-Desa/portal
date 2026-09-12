"use client";

/**
 * Hook TanStack Query lensa Jalur Ekonomi (Task 27, bagian hook — wrapper
 * endpoint `modelJalurDaftar`/`modelJalurDetail` sudah ada di
 * `lib/api/endpoints.ts`, Blok B2). Semua memanggil endpoint itu; tidak ada
 * `fetch` langsung di sini. Data hook lintas query + peta murni
 * (`useJalurData`, menggabungkan `useJalurDetail` di bawah dengan
 * `useGeoDesa` + `lib/map/jalur.ts`) hidup di berkas terpisah
 * `use-jalur-data.ts`, supaya berkas ini tetap wrapper TanStack Query murni
 * (pola `features/kartu/hooks/queries.ts`).
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { modelJalurDaftar, modelJalurDetail } from "@/lib/api/endpoints";
import type { Varian } from "@/lib/url-state";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

/** Ukuran halaman daftar jalur — paginasi SISI SERVER, pola `usePetaPeranDaftar` (Task 18). */
const BATAS_DAFTAR = 50;

type UseJalurDaftarOpsi = {
  varian: Varian;
  kab?: string;
  iddesa?: string;
  hal?: number;
  batas?: number;
  /** `true` hanya saat lensa Jalur Ekonomi sedang dirender. */
  aktif: boolean;
};

/**
 * Daftar baris ringkas satu varian, opsional tersaring `kab`/`iddesa`. Mengembalikan
 * `{data, meta}` UTUH (bukan `.data` saja): `meta.total` dipakai `Pagination`
 * (Task 31 `daftar-jalur.tsx`), `meta.parameter` dipakai `ParameterVarian`
 * (Task 28).
 *
 * `placeholderData: keepPreviousData` (temuan review Jalur Ekonomi #4b,
 * MEDIUM) — TANPA ini, `hal` berganti langsung membuat `isLoading` `true`
 * sesaat; `daftar-jalur.tsx` early-return ke skeleton saat itu, MELEPAS DOM
 * tombol `Pagination` termasuk yang baru saja ditekan, jadi fokus keyboard
 * jatuh ke `<body>`. Dengan ini, halaman SEBELUMNYA tetap dirender
 * (`isPlaceholderData: true`) selama halaman baru diambil — tombol pager
 * tidak pernah lepas-pasang, fokus tidak pernah hilang.
 */
export function useJalurDaftar({
  varian,
  kab,
  iddesa,
  hal = 1,
  batas = BATAS_DAFTAR,
  aktif,
}: UseJalurDaftarOpsi) {
  return useQuery<Awaited<ReturnType<typeof modelJalurDaftar>>, GalatApi>({
    queryKey: ["jalur-ekonomi", "daftar", varian, kab, iddesa, hal, batas],
    queryFn: () => modelJalurDaftar(varian, { kab, iddesa, hal, batas }),
    enabled: aktif,
    staleTime: STALE_BEKU,
    placeholderData: keepPreviousData,
  });
}

/**
 * Cek status desa terpilih (apakah poros atau anggota sejalur) pada varian aktif.
 */
export function useJalurDesaStatus(varian: Varian, desa?: string, kab?: string) {
  return useQuery<Awaited<ReturnType<typeof modelJalurDaftar>>, GalatApi>({
    queryKey: ["jalur-ekonomi", "status-desa", varian, kab, desa],
    queryFn: () => modelJalurDaftar(varian, { kab, iddesa: desa, hal: 1, batas: 10 }),
    enabled: Boolean(desa),
    staleTime: STALE_BEKU,
  });
}

type UseJalurDetailOpsi = {
  varian: Varian;
  idJalur?: string;
  /** `true` hanya saat lensa Jalur Ekonomi sedang dirender. */
  aktif: boolean;
};

/**
 * Grup jalur MENTAH satu `id_jalur` — LIMA bentuk berbeda tergantung
 * `varian` (rencana § "Bentuk artefak dan respons nyata"). Diratakan oleh
 * `normalisasiJalur` (`services/normalisasi.ts`) di hilir, bukan di sini —
 * konsumen langsung hook ini adalah `useJalurData` (`use-jalur-data.ts`).
 */
export function useJalurDetail({ varian, idJalur, aktif }: UseJalurDetailOpsi) {
  return useQuery<Record<string, unknown>, GalatApi>({
    queryKey: ["jalur-ekonomi", "detail", varian, idJalur],
    queryFn: async () => (await modelJalurDetail(varian, idJalur as string)).data,
    enabled: aktif && Boolean(idJalur),
    staleTime: STALE_BEKU,
  });
}
