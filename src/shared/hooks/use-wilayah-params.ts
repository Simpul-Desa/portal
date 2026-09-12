"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import type { TujuanJejak } from "@/features/asisten/types";
import {
  type Lensa,
  parseWilayahParams,
  serialize,
  type Varian,
  type WilayahParams,
  type ZonaSlug,
} from "@/lib/url-state";

type PerubahanWilayah = Partial<WilayahParams>;

/** Prov/kab opsional untuk mengiringi hasil cari (Task 23): desa, prov, dan
 * kab ditulis SEKALI jalan lewat satu `terapkan`, bukan tiga setter
 * berurutan yang saling menimpa lewat closure `params` yang sama. */
type OpsiPilihDesa = { prov?: string; kab?: string };

/** Kab opsional untuk mengiringi baris jalur (Task 26): `jalur` dan `kab`
 * ditulis SEKALI jalan lewat satu `terapkan` — pola `OpsiPilihDesa` di atas. */
type OpsiPilihJalur = { kab?: string };

/**
 * Hook state URL wilayah
 * (`?lensa=&prov=&kab=&desa=&zona=&varian=&jalur=&target=&kembar=`).
 * Setter menjaga hirarki: prov baru membuang kab+desa, kab baru membuang
 * desa. `gantiLensa` TIDAK menyentuh prov/kab/desa (PRD §5.2: berganti lensa
 * tidak mereset peta) tetapi membuang `zona`/`varian`/`jalur`/`target`/`kembar`
 * — parameter itu milik lensa yang ditinggalkan. `target` (sel Citra Potensi)
 * dibuang saat provinsi berganti (sel milik satu provinsi) tetapi bertahan
 * saat kabupaten berganti; `kembar` (Desa Kembar) dibuang saat desa acuan,
 * kabupaten, atau provinsi berganti — kembar hanya sah untuk satu desa acuan.
 *
 * `params` di-memo berkunci `searchParams.toString()` dan setiap setter
 * di-`useCallback` supaya identitasnya stabil selama query URL tidak
 * berubah — konsumen (mis. efek MapLibre Task 21) tidak rerun tiap render.
 */
export function useWilayahParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams.toString();
  const params = useMemo(() => parseWilayahParams(new URLSearchParams(query)), [query]);

  /**
   * `replace` adalah bawaannya, `push` diminta secara eksplisit (keputusan
   * user 10 September 2026, temuan T16). Sebelum fase 9 SEMUA perubahan
   * memakai `replace`, jadi nol entri riwayat pernah dibuat: juri yang
   * mengeklik satu desa lalu menekan tombol Kembali tidak membatalkan
   * pilihannya — ia keluar dari dasbor.
   *
   * Yang membuat entri riwayat hanya dua hal yang pengguna anggap navigasi:
   * berganti lensa dan memilih desa (plus `bukaTujuan`, yang melakukan
   * keduanya sekaligus dari jejak Asisten). Chip zona, varian, halaman,
   * target, kembar, dan tarikan lebar panel tetap `replace` — memasukkan
   * semuanya ke riwayat membuat satu tekan Kembali membatalkan satu klik
   * chip, dan pengguna harus menekan Kembali belasan kali untuk keluar.
   */
  const terapkan = useCallback(
    (perubahan: PerubahanWilayah, mode: "replace" | "push" = "replace") => {
      const queryBaru = serialize({ ...params, ...perubahan });
      const tujuan = queryBaru ? `${pathname}?${queryBaru}` : pathname;
      if (mode === "push") router.push(tujuan);
      else router.replace(tujuan);
    },
    [params, pathname, router],
  );

  const pilihProv = useCallback(
    // Sel Citra Potensi milik satu provinsi — `target` lama tidak sah di
    // provinsi baru, dan `kembar` selalu satu kabupaten dengan acuannya.
    (prov: string) =>
      terapkan({ prov, kab: undefined, desa: undefined, target: undefined, kembar: undefined }),
    [terapkan],
  );

  const pilihKab = useCallback(
    // `target` TETAP sah dalam satu provinsi — mempertahankannya adalah
    // alasan utama lensa Citra terasa cepat saat berpindah kabupaten.
    (kab: string) => terapkan({ kab, desa: undefined, kembar: undefined }),
    [terapkan],
  );

  const hapusKab = useCallback(
    // Naik satu tingkat ke provinsi TANPA menyentuh `target` — sel Citra
    // Potensi milik provinsi, dan provinsinya tidak berganti di sini. Beda
    // dari `pilihProv`, yang dipakai saat provinsinya benar-benar diganti dan
    // karena itu memang harus membuang `target` lama.
    () => terapkan({ kab: undefined, desa: undefined, kembar: undefined }),
    [terapkan],
  );

  const pilihDesa = useCallback(
    // Desa acuan baru membatalkan kembar lama. `push`: memilih desa adalah
    // navigasi bagi pengguna, jadi Kembali harus membatalkannya.
    (desa: string, opsi?: OpsiPilihDesa) =>
      terapkan(
        {
          desa,
          kembar: undefined,
          ...(opsi?.prov !== undefined ? { prov: opsi.prov } : {}),
          ...(opsi?.kab !== undefined ? { kab: opsi.kab } : {}),
        },
        "push",
      ),
    [terapkan],
  );

  const reset = useCallback(
    () =>
      terapkan({
        prov: undefined,
        kab: undefined,
        desa: undefined,
        zona: undefined,
        varian: undefined,
        jalur: undefined,
        target: undefined,
        kembar: undefined,
      }),
    [terapkan],
  );

  const gantiLensa = useCallback(
    // `push`: berganti lensa adalah navigasi bagi pengguna.
    (lensa: Lensa) =>
      terapkan(
        {
          lensa,
          zona: undefined,
          varian: undefined,
          jalur: undefined,
          target: undefined,
          kembar: undefined,
        },
        "push",
      ),
    [terapkan],
  );

  const pilihZona = useCallback(
    (zona: ZonaSlug | undefined) => terapkan({ zona }),
    [terapkan],
  );

  const pilihVarian = useCallback(
    (varian: Varian) => terapkan({ varian, jalur: undefined }),
    [terapkan],
  );

  const pilihJalur = useCallback(
    (jalur: string, opsi?: OpsiPilihJalur) =>
      terapkan({ jalur, ...(opsi?.kab !== undefined ? { kab: opsi.kab } : {}) }),
    [terapkan],
  );

  const pilihTarget = useCallback(
    (target: string) => terapkan({ target }),
    [terapkan],
  );

  const pilihKembar = useCallback(
    (kembar: string) => terapkan({ kembar }),
    [terapkan],
  );

  const bukaTujuan = useCallback(
    // `push`: satu klik baris jejak Asisten memindahkan lensa DAN wilayah
    // sekaligus — perpindahan terbesar yang bisa dilakukan pengguna dalam
    // satu klik, jadi justru yang paling pantas bisa dibatalkan.
    (tujuan: TujuanJejak) =>
      terapkan(
        {
          lensa: tujuan.lensa,
          prov: tujuan.prov,
          kab: tujuan.kab,
          desa: tujuan.desa,
          // Parameter milik lensa lama selalu dibuang; yang dibawa tujuan
          // ditulis ulang sesudahnya.
          zona: undefined,
          jalur: tujuan.jalur,
          kembar: undefined,
          varian: tujuan.varian,
          target: tujuan.target,
        },
        "push",
      ),
    [terapkan],
  );

  return {
    ...params,
    pilihProv,
    pilihKab,
    hapusKab,
    pilihDesa,
    reset,
    gantiLensa,
    pilihZona,
    pilihVarian,
    pilihJalur,
    pilihTarget,
    pilihKembar,
    bukaTujuan,
  };
}
