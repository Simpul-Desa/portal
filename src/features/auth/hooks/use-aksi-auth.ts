"use client";

/**
 * Aksi masuk dan daftar lewat Supabase Auth. `keluar()` TIDAK di sini — ia
 * tinggal di `SesiProvider` (`@/core/sesi`) karena juga membersihkan cache
 * TanStack Query saat berganti akun.
 */

import { useState } from "react";

import { supabaseBrowser } from "@/core/supabase/browser";
import { pesanGalatAuth } from "@/features/auth/services/galat-auth";

type GalatAksiAuth = ReturnType<typeof pesanGalatAuth>;

export function useAksiAuth() {
  const [mengirim, setMengirim] = useState(false);
  const [galat, setGalat] = useState<GalatAksiAuth | null>(null);

  /** `true` bila berhasil. Sesi hidup otomatis lewat `SesiProvider` (`onAuthStateChange`). */
  async function masuk(email: string, sandi: string): Promise<boolean> {
    setMengirim(true);
    setGalat(null);

    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email,
      password: sandi,
    });

    setMengirim(false);

    if (error) {
      setGalat(pesanGalatAuth(error));
      return false;
    }

    return true;
  }

  /**
   * `perluKonfirmasi: true` BUKAN kegagalan — proyek dengan konfirmasi
   * email menyala mengembalikan `session: null` walau akun berhasil dibuat.
   */
  async function daftar(
    email: string,
    sandi: string,
  ): Promise<{ berhasil: boolean; perluKonfirmasi: boolean }> {
    setMengirim(true);
    setGalat(null);

    const { data, error } = await supabaseBrowser().auth.signUp({
      email,
      password: sandi,
    });

    setMengirim(false);

    if (error) {
      setGalat(pesanGalatAuth(error));
      return { berhasil: false, perluKonfirmasi: false };
    }

    return { berhasil: true, perluKonfirmasi: data.session === null };
  }

  return { masuk, daftar, mengirim, galat };
}
