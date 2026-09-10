"use client";

/**
 * Dua hook query halaman admin.
 *
 * `refetchInterval` di TanStack Query v5 menerima `(query) => ...`, BUKAN
 * `(data, query) => ...` seperti v4. Tanda tangan v4 tetap lolos `tsc` karena
 * parameter kedua yang tidak dipakai cuma diam-diam menjadi `undefined` —
 * bukan galat tipe — sehingga polling yang mengintip `data` di posisi kedua
 * selalu membaca `undefined` dan tidak pernah berhenti atau tidak pernah
 * mulai. `query.state.data` di sini adalah data SEBELUM `select` dijalankan
 * (hook ini tidak memakai `select`, jadi tidak berbeda, tapi disebut supaya
 * pola ini tidak disalin ke hook lain yang memakainya tanpa berpikir ulang).
 * `refetchIntervalInBackground` DIBIARKAN pada bawaannya (`false`) — tab
 * peramban yang tersembunyi tidak boleh memicu polling status pekerjaan.
 *
 * `staleTime: 0` di KEDUA hook disengaja, bukan lupa menghapus. Bawaan
 * `QueryClient` proyek ini 60 detik (`core/providers.tsx`, dipilih supaya
 * hidrasi SSR tidak langsung fetch ulang) — tapi halaman admin menampilkan
 * efek aksi admin sendiri (ubah peran, segarkan berita, hapus berita) dan
 * tidak boleh menahan tampilan lama semenit setelah aksi itu selesai.
 *
 * `placeholderData: keepPreviousData` pada `useDaftarPengguna` menahan
 * daftar halaman SEBELUMNYA selama halaman baru masih diambil, supaya pager
 * tidak membuat tabel berkedip kosong tiap kali angka halaman berganti.
 */

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import { adminPengguna, adminStatus, type DataDari } from "@/lib/api/endpoints";

import { cariPenggunaSah } from "../services/pengguna";
import type { ItemPengguna } from "../types";

/** Batas halaman daftar pengguna — sama dengan `BATAS_BAWAAN` `api/`. */
export const BATAS_PENGGUNA = 50;
/** Jeda polling saat pekerjaan penyegaran berjalan. */
const JEDA_POLL_MS = 3_000;

/**
 * Daftar pengguna terdaftar, berpaginasi dan bisa disaring lewat `telat`.
 *
 * `telat` adalah nilai cari yang SUDAH di-debounce oleh pemanggil
 * (`useNilaiTelat`, `shared/hooks/`) — debounce dipindah KELUAR dari hook ini
 * (Task 8a) supaya pemanggil bisa mereset `hal` tepat pada nilai yang sungguh
 * dipakai `queryKey`, bukan pada `q` mentah yang berubah tiap keystroke.
 * Kosong (setelah `trim()`) berarti "tanpa saringan" — parameter `q` TIDAK
 * dikirim sama sekali ke `api/`, bukan dikirim sebagai string kosong.
 * `enabled: sah` menahan permintaan selama ketikan masih memuat karakter
 * yang ditolak `api/` (422 lewat `POLA_CARI_PENGGUNA`), jadi galat itu
 * tidak pernah sampai terjadi — bukan ditangkap sesudahnya.
 *
 * `total` datang dari `meta.total`: cacah SELURUH baris yang lolos saringan
 * di seluruh halaman, bukan `daftar.length` (yang cuma panjang halaman ini).
 */
export function useDaftarPengguna(telat: string, hal: number) {
  const sah = cariPenggunaSah(telat);

  return useQuery<{ daftar: ItemPengguna[]; total: number }, GalatApi>({
    queryKey: ["admin", "pengguna", telat, hal],
    queryFn: async () => {
      const respons = await adminPengguna({
        q: telat.trim() ? telat.trim() : undefined,
        hal,
        batas: BATAS_PENGGUNA,
      });
      return { daftar: respons.data, total: respons.meta?.total ?? respons.data.length };
    },
    enabled: sah,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });
}

/**
 * Status sistem (versi data, cacah baris, pekerjaan latar, kesiapan
 * konfigurasi). Polling HANYA menyala selama `penyegaran.keadaan` berjalan —
 * begitu pekerjaan selesai (atau belum pernah dimulai), `refetchInterval`
 * mengembalikan `false` dan polling berhenti dengan sendirinya.
 */
export function useStatusAdmin() {
  return useQuery<DataDari<"/api/admin/status">, GalatApi>({
    queryKey: ["admin", "status"],
    queryFn: async () => (await adminStatus()).data,
    staleTime: 0,
    refetchInterval: (query) =>
      query.state.data?.penyegaran?.keadaan === "berjalan" ? JEDA_POLL_MS : false,
  });
}
