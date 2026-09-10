"use client";

/**
 * Hook `useNilaiTelat` — debounce NILAI (bukan `queryFn`), supaya `queryKey`
 * ikut telat dan tidak ada permintaan per huruf ketikan. Dipindah ke
 * `shared/hooks/` karena kini dipakai DUA fitur — pencarian desa
 * (`queries-wilayah.ts`) dan pencarian akun di Halaman Admin — mengikuti
 * aturan PRD app §7 "dipakai dua fitur atau lebih → `shared/`". Jeda 300 ms
 * adalah nilai yang sudah berjalan sejak lensa Kartu; mengubahnya menyentuh
 * kelima lensa sekaligus.
 */

import { useEffect, useState } from "react";

/** Jeda debounce sebelum nilai cari dianggap "selesai diketik". */
const DEBOUNCE_CARI_MS = 300;

/** Debounce NILAI (bukan queryFn) — queryKey ikut telat, jadi tidak ada
 * permintaan per huruf ketikan (GOTCHA Task 20). */
export function useNilaiTelat(nilai: string): string {
  const [telat, setTelat] = useState(nilai);

  useEffect(() => {
    const id = setTimeout(() => setTelat(nilai), DEBOUNCE_CARI_MS);
    return () => clearTimeout(id);
  }, [nilai]);

  return telat;
}
