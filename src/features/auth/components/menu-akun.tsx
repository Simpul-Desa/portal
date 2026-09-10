"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import { useSesi } from "@/core/sesi";
import { pesanGalatAuth } from "@/features/auth/services/galat-auth";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import { GalatForm } from "./auth-field";

type MenuAkunProps = {
  /** Butir Akun di rail yang membuka menu ini. Dua kegunaan: (1) fokus balik
   * ke sini saat menu ditutup, (2) dikecualikan dari deteksi klik-di-luar —
   * tanpa pengecualian ini, klik pada butir Akun untuk MENUTUP menu yang
   * sedang terbuka akan terdeteksi sebagai klik-di-luar (menutup), lalu
   * `onClick` butir itu sendiri langsung membukanya lagi. */
  triggerRef: RefObject<HTMLButtonElement | null>;
  onTutup: () => void;
};

/**
 * Menu akun di rail (PRD app §5.2, rencana fase 2 Task 22) — dibuka dari
 * butir Akun saat sudah masuk. Card-float kecil: email, peran aktif, tombol
 * Keluar. Non-modal (bukan `DialogTerkunci`): Esc dan klik di luar menutup,
 * fokus kembali ke `triggerRef` saat ditutup.
 *
 * `keluar()` yang gagal (perbaikan galat diam terlaporkan 10 September
 * 2026): `core/sesi.tsx` melempar galat `signOut` alih-alih menelannya —
 * ditangkap di sini dan ditampilkan lewat `GalatForm` (mekanisme sama yang
 * dipakai form masuk/daftar), menu TETAP TERBUKA supaya pesannya terbaca
 * alih-alih langsung tertutup seperti jalur sukses.
 */
export function MenuAkun({ triggerRef, onTutup }: MenuAkunProps) {
  const { email, peran, keluar } = useSesi();
  const wadahRef = useRef<HTMLDivElement>(null);
  const [galatKeluar, setGalatKeluar] = useState<ReturnType<typeof pesanGalatAuth> | null>(null);

  useEffect(() => {
    const tombolPemicu = triggerRef.current;
    return () => {
      tombolPemicu?.focus();
    };
  }, [triggerRef]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onTutup();
    }
    function handlePointerDown(e: PointerEvent) {
      const target = e.target as Node;
      if (wadahRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onTutup();
    }
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [onTutup, triggerRef]);

  async function handleKeluar() {
    try {
      await keluar();
      onTutup();
    } catch (error) {
      setGalatKeluar(pesanGalatAuth(error));
    }
  }

  return (
    <div
      ref={wadahRef}
      aria-label="Menu akun"
      className="absolute bottom-0 left-full ml-2 w-56 rounded-card bg-float p-4 shadow-float"
    >
      <p className="truncate text-label text-muted">{email}</p>
      <p className="mt-1 text-body-md text-ink">Peran: {peran}</p>
      <div className="my-3 h-px bg-hairline" />
      <button
        type="button"
        onClick={handleKeluar}
        className={`w-full rounded-control px-3 py-2 text-left text-body-md text-ink hover:bg-inset ${FOCUS_RING}`}
      >
        Keluar
      </button>
      {galatKeluar && (
        <div className="mt-2">
          <GalatForm galat={galatKeluar} />
        </div>
      )}
    </div>
  );
}
