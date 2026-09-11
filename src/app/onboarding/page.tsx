import type { Metadata } from "next";
import { Suspense } from "react";

import { OnboardingCard } from "@/features/onboarding/components/onboarding-card";

export const metadata: Metadata = {
  title: "Selamat Datang — SIMPUL DESA",
  description: "Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa",
};

function KerangkaOnboarding() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white p-4 sm:p-6">
      <div className="flex flex-col items-center text-center">
        <div className="size-16 animate-pulse rounded-2xl bg-black/5" />
        <div className="mt-6 h-10 w-64 animate-pulse rounded-full bg-black/5" />
        <div className="mt-4 h-5 w-80 animate-pulse rounded-full bg-black/5" />
        <div className="mt-10 h-14 w-56 animate-pulse rounded-full bg-black/10" />
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<KerangkaOnboarding />}>
      <OnboardingCard />
    </Suspense>
  );
}
