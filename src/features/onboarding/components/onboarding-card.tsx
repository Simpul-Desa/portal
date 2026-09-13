"use client";

/**
 * Halaman Onboarding Simpul Desa.
 * Latar belakang putih dengan efek Prism (React Bits) berotasi halus.
 * Tata letak terbuka tanpa kartu penutup (cardless minimalist hero)
 * dengan tombol aksi utama 'Mulai Menjelajah' yang elegan dan interaktif.
 */

import { useSyncExternalStore } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";

import { DOCS_URL } from "@/core/config";
import { tujuanAman } from "@/lib/redirect-aman";
import { Prism } from "@/shared/components/backgrounds/prism";
import { FOCUS_RING } from "@/shared/components/focus-ring";

export const ONBOARDING_COOKIE = "simpul_onboarded";
export const ONBOARDING_SESSION_KEY = "simpul_onboarded";

/**
 * Tandai sesi onboarding selesai:
 * 1. sessionStorage (client-side per tab/window session)
 * 2. session cookie (tanpa Max-Age / Expires, otomatis terhapus saat peramban ditutup)
 */
export function selesaikanOnboarding() {
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem(ONBOARDING_SESSION_KEY, "1");
    } catch {
      // Abaikan jika storage dinonaktifkan
    }
    document.cookie = `${ONBOARDING_COOKIE}=1; path=/; SameSite=Lax`;
  }
}

/**
 * Cek apakah pengguna sudah melalui onboarding pada sesi peramban ini.
 */
export function sudahOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (sessionStorage.getItem(ONBOARDING_SESSION_KEY) === "1") return true;
  } catch {
    // Abaikan
  }
  const match = document.cookie.match(new RegExp(`(^|;\\s*)${ONBOARDING_COOKIE}=([^;]*)`));
  return match?.[2] === "1";
}

export function OnboardingCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lanjut = searchParams.get("lanjut");
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  function handleMulai() {
    selesaikanOnboarding();
    const tujuan = tujuanAman(lanjut);
    router.replace(tujuan);
  }

  const isLight = mounted ? resolvedTheme !== "dark" : true;

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-8 sm:px-8 sm:py-12 selection:bg-primary/20 selection:text-ink">
      {/* 1. Latar Belakang Penuh: Prism (React Bits) */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <Prism
          height={4.5}
          baseWidth={2}
          animationType="hover"
          glow={1}
          noise={0}
          transparent={false}
          scale={3.1}
          hueShift={170}
          colorFrequency={1.6}
          hoverStrength={3}
          inertia={0.07}
          bloom={1.5}
          timeScale={0.9}
          lightMode={isLight}
        />
      </div>

      {/* 2. Hero Section Komposisi Google Antigravity (Lebar Diperbesar untuk 2 Baris Penuh) */}
      <main
        id="isi"
        className="relative z-10 flex w-full max-w-6xl xl:max-w-7xl flex-col items-center px-4 py-8 text-center"
      >
        {/* Brand Icon & Name: [Logo] Simpul Desa (Diperbesar & Lebih Menonjol) */}
        <div className="inline-flex items-center gap-3 sm:gap-3.5 mb-6 sm:mb-8">
          <Image
            src="/logo-simpul-desa.png"
            alt="Logo Simpul Desa"
            width={38}
            height={38}
            className="h-10 sm:h-11 w-auto object-contain"
            style={{ width: "auto" }}
            priority
          />
          <span className="text-lg sm:text-xl font-medium tracking-tight text-ink">
            Simpul Desa
          </span>
        </div>

        {/* Title Besar: First Uppercase dengan Gradient Styling Elegan (Tepat 2 Baris) */}
        <h1 className="w-full max-w-6xl xl:max-w-7xl text-3xl sm:text-5xl md:text-6xl lg:text-[70px] xl:text-[76px] font-normal tracking-[-0.035em] text-ink leading-[1.15] sm:leading-[1.08] select-none">
          <span className="block">Satu Pintu Menemukenali</span>
          <span className="block bg-gradient-to-r from-ink via-primary to-[#ff5100] bg-clip-text text-transparent">
            Potensi Ekonomi Desa se-Indonesia
          </span>
        </h1>

        {/* Dua Tombol CTA Side by Side: "Mulai Menjelajah" (Primary Orange -> Hover Ink) & "Baca Panduan" (Float Lineless Link) */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8 sm:mt-10">
          {/* Tombol Utama: Mulai Menjelajah (Pill Orange Primary dengan Hover Ink & Teks Putih) */}
          <button
            type="button"
            onClick={handleMulai}
            className={`inline-flex items-center gap-2.5 rounded-full bg-primary px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-medium text-white shadow-sm shadow-primary/25 transition-all duration-200 hover:bg-ink hover:text-canvas hover:shadow-md hover:scale-[1.02] active:scale-[0.98] ${FOCUS_RING}`}
          >
            <svg
              className="size-4.5 sm:size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
            <span>Mulai Menjelajah</span>
          </button>

          {/* Tombol Sekunder: Baca Panduan (Tautan ke DOCS_URL, Pill Float Tanpa Garis Tepi) */}
          <a
            href={DOCS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center rounded-full bg-float px-6 py-3 sm:px-7 sm:py-3.5 text-sm sm:text-base font-medium text-ink shadow-xs transition-all duration-200 hover:bg-surface hover:shadow-sm hover:scale-[1.02] active:scale-[0.98] ${FOCUS_RING}`}
          >
            Baca Panduan
          </a>
        </div>
      </main>
    </div>
  );
}
