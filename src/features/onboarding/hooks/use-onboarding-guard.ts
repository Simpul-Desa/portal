"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { sudahOnboarding } from "../components/onboarding-card";

/**
 * Hook pengaman onboarding di sisi klien (Task Onboarding).
 * Menjamin pengguna dialihkan ke `/onboarding` jika belum menyelesaikan
 * sesi onboarding peramban ini.
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Jangan lakukan pengalihan jika sudah di rute onboarding atau rute API
    if (pathname === "/onboarding" || pathname.startsWith("/api")) {
      return;
    }

    if (!sudahOnboarding()) {
      const search = typeof window !== "undefined" ? window.location.search : "";
      const lanjut = pathname !== "/" ? `?lanjut=${encodeURIComponent(pathname + search)}` : "";
      router.replace(`/onboarding${lanjut}`);
    }
  }, [pathname, router]);
}
