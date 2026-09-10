"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useSesi } from "@/core/sesi";
import { tujuanAman } from "@/lib/redirect-aman";

/**
 * Alihkan keluar dari halaman auth begitu sesi terdeteksi (buka `/masuk`
 * padahal sudah masuk → langsung ke tujuan).
 *
 * Tujuannya WAJIB sama dengan tujuan yang dipakai form setelah masuk
 * (`tujuanAman(lanjut)`). Kalau berbeda, keduanya berlomba: form menavigasi
 * ke lensa yang dituju, lalu penjaga ini menimpanya begitu peran terisi —
 * dan pengguna yang masuk dari dialog lensa terkunci mendarat di `/` tanpa
 * lensa maupun wilayah yang tadi dipilih. Karena itu penjaga ini tinggal di
 * form (satu-satunya tempat yang memegang `lanjut`), bukan di komponen
 * bersama layout.
 */
export function useAlihkanBilaMasuk(lanjut: string): void {
  const { peran } = useSesi();
  const router = useRouter();

  useEffect(() => {
    if (peran !== "anonim") router.replace(tujuanAman(lanjut));
  }, [peran, lanjut, router]);
}
