"use client";

/**
 * Tiga mutation aksi admin: ubah peran pengguna, segarkan berita, hapus
 * berita. Tiru bentuk `useUnduhLaporan` (`features/laporan/hooks/`) — hook
 * ini membungkus `useMutation` lalu mengembalikan objek bernama Indonesia,
 * bukan objek mutation TanStack mentah.
 *
 * `retry: false` di KETIGANYA wajib, bukan gaya. Mengulang `adminHapusBerita`
 * yang sudah berhasil menghasilkan 404 yang membingungkan (baris itu sudah
 * tidak ada). Mengulang `adminSegarkanBerita` menghasilkan 409
 * `PEKERJAAN_BERJALAN` dari pekerjaan yang sudah dimulai percobaan pertama.
 * Ketiga aksi ini juga tidak pernah boleh berjalan sendiri tanpa aksi
 * pengguna — tidak ada refetch fokus-tab, tidak ada invalidasi otomatis di
 * luar callback mutation — itu sebabnya mereka `useMutation`, bukan
 * `useQuery`.
 *
 * Kunci cache `["berita", iddesa]` yang diinvalidasi `useHapusBerita` adalah
 * kunci yang SAMA dipakai `useBerita` di `features/berita/hooks/queries.ts`
 * (diverifikasi langsung dari berkas itu, `queryKey: ["berita", iddesa]`) —
 * berita yang dihapus lewat `/admin` langsung hilang juga di lensa Kartu
 * Ekonomi Desa yang memakai `useBerita`. Kunci yang meleset membuat baris
 * terhapus bertahan di layar sampai halaman dimuat ulang.
 *
 * SATU `useMutation` dipakai BERSAMA oleh semua baris (satu tabel/kartu, satu
 * hook) — jadi galat TIDAK BOLEH dibaca dari `mutation.variables`/
 * `mutation.error` di titik pemakaian. Terverifikasi langsung di
 * `node_modules`: begitu baris kedua memanggil `mutate`,
 * `mutationObserver.js:57-60` (`@tanstack/query-core` 5.102.8) melepas
 * observer dari mutation PERTAMA sebelum membangun mutation baru, dan
 * `mutation.js:196` hanya memberi tahu observer miliknya sendiri — mutation
 * pertama yang gagal tidak sampai ke UI mana pun lewat `mutation.error`.
 * Callback mutation (`onError`/`onSuccess`) TETAP dipanggil untuk setiap
 * mutation individual terlepas dari observer mana yang sedang terpasang,
 * jadi galat ditangkap di sana dan disimpan ke `galatPerId` (`Record<string,
 * GalatApi>`, kunci `String(id)`) — tiga baris yang gagal berurutan tercatat
 * tiga-tiganya, bukan cuma yang TERAKHIR menimpa yang sebelumnya. Galat baris
 * yang kemudian berhasil dibuang dari `galatPerId` di `onSuccess`nya sendiri;
 * `resetGalat` mengosongkan semuanya sekaligus, dipanggil pemanggil saat
 * halaman atau desa terpilih berganti supaya galat lama tidak menempel ke
 * baris yang sudah tidak relevan.
 *
 * `idSedangKirim`/`idSedangHapus`/`peranSedangKirim` TETAP dibaca dari
 * `mutation.variables` — ini murni "mutation yang PALING BARU dipanggil
 * masih pending", dan hanya baris pemicunya yang membaca nilai ini untuk
 * dirinya sendiri (bukan penanda kolektif seperti galat, jadi berbagi satu
 * sumber ini aman). Catatan tipe (diperiksa langsung lewat `tsc`, bukan
 * ditebak): `MutationObserverResult` di `@tanstack/query-core` adalah union
 * EMPAT varian (`Idle`/`Loading`/`Error`/`Success`) yang tiap cabangnya
 * mengunci `variables` ke `TVariables` polos (bukan `TVariables | undefined`)
 * tepat saat `isPending`/`isError` bernilai literal `true`. `UseMutationResult`
 * membungkusnya lewat `Override<T, ...>` — mapped type homomorfik di atas
 * parameter tipe telanjang `T`, yang MENDISTRIBUSI ke setiap anggota union
 * saat `T` diisi union — jadi struktur diskriminasinya tetap utuh sampai ke
 * `UseMutationResult`, dan `mutation.isPending ? mutation.variables.id :
 * undefined` mempersempit dengan benar tanpa optional chaining maupun `as`.
 */

import { useState } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { GalatApi } from "@/lib/api/client";
import {
  adminBatalkanSegarkan,
  adminHapusBerita,
  adminSegarkanBerita,
  adminUbahPeran,
} from "@/lib/api/endpoints";

import type { BeritaTerhapus, PeranBaru, PeranDiubah, TerimaSegarkan } from "../types";

/** Salinan `peta` TANPA `kunci` — dipakai kedua hook baris di bawah untuk
 * membuang galat baris yang baru saja berhasil, tanpa memutasi `peta` asal. */
function tanpaKunci(peta: Record<string, GalatApi>, kunci: string): Record<string, GalatApi> {
  if (!(kunci in peta)) return peta;
  const salinan = { ...peta };
  delete salinan[kunci];
  return salinan;
}

export function useUbahPeran() {
  const queryClient = useQueryClient();
  const [galatPerId, setGalatPerId] = useState<Record<string, GalatApi>>({});

  const mutation = useMutation<PeranDiubah, GalatApi, { id: string; peran: PeranBaru }>({
    mutationFn: async ({ id, peran }) => (await adminUbahPeran(id, peran)).data,
    retry: false,
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "pengguna"] });
      setGalatPerId((sebelumnya) => tanpaKunci(sebelumnya, id));
    },
    onError: (galat, { id }) => {
      setGalatPerId((sebelumnya) => ({ ...sebelumnya, [id]: galat }));
    },
  });

  return {
    ubah: mutation.mutate,
    /** `id` pengguna yang permintaannya sedang berjalan, atau `undefined` —
     * baris tabel memakainya untuk mengunci HANYA select miliknya sendiri. */
    idSedangKirim: mutation.isPending ? mutation.variables.id : undefined,
    /** Peran yang SEDANG DIKIRIM selama baris pending — dirender sebagai
     * `value` select selama round-trip supaya select tidak melompat balik ke
     * peran lama dan terbaca sebagai penolakan (Task 2). */
    peranSedangKirim: mutation.isPending ? mutation.variables.peran : undefined,
    /** Galat ubah peran PER `id` pengguna — lihat docstring berkas. */
    galatPerId,
    /** Kosongkan seluruh galat tersimpan — panggil saat halaman berganti. */
    resetGalat: () => setGalatPerId({}),
  };
}

export function useSegarkanBerita() {
  const queryClient = useQueryClient();
  const mutation = useMutation<TerimaSegarkan, GalatApi, readonly string[]>({
    mutationFn: async (iddesa) => (await adminSegarkanBerita(iddesa)).data,
    retry: false,
    // `onSettled` (bukan `onSuccess` saja): 409 PEKERJAAN_BERJALAN adalah
    // KEGAGALAN mutation ini, tapi tetap berarti ada pekerjaan yang harus
    // segera terlihat progresnya. Tanpa invalidasi di jalur galat, status
    // tidak pernah dibaca ulang dan polling (`useStatusAdmin`) tidak pernah
    // mulai sendiri (Task 6).
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "status"] });
    },
  });

  return {
    segarkan: mutation.mutate,
    sedangKirim: mutation.isPending,
    hasil: mutation.data,
    galat: mutation.error,
  };
}

export function useBatalkanSegarkan() {
  const queryClient = useQueryClient();
  const mutation = useMutation<{ status: string }, GalatApi, void>({
    mutationFn: async () => (await adminBatalkanSegarkan()).data,
    retry: false,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["admin", "status"] });
    },
  });

  return {
    batalkan: mutation.mutate,
    sedangBatal: mutation.isPending,
    galat: mutation.error,
  };
}

export function useHapusBerita() {
  const queryClient = useQueryClient();
  const [galatPerId, setGalatPerId] = useState<Record<string, GalatApi>>({});

  const mutation = useMutation<BeritaTerhapus, GalatApi, { id: number; iddesa: string }>({
    mutationFn: async ({ id }) => (await adminHapusBerita(id)).data,
    retry: false,
    onSuccess: (_data, { id, iddesa }) => {
      void queryClient.invalidateQueries({ queryKey: ["berita", iddesa] });
      void queryClient.invalidateQueries({ queryKey: ["admin", "status"] });
      setGalatPerId((sebelumnya) => tanpaKunci(sebelumnya, String(id)));
    },
    onError: (galat, { id }) => {
      setGalatPerId((sebelumnya) => ({ ...sebelumnya, [String(id)]: galat }));
    },
  });

  return {
    hapus: mutation.mutate,
    idSedangHapus: mutation.isPending ? mutation.variables.id : undefined,
    /** Galat hapus berita PER `id` berita (kunci `String(id)`) — lihat
     * docstring berkas. */
    galatPerId,
    /** Kosongkan seluruh galat tersimpan — panggil saat desa terpilih berganti. */
    resetGalat: () => setGalatPerId({}),
  };
}
