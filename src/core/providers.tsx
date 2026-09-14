"use client";

// QueryClientProvider mengandalkan useContext, jadi berkas ini wajib "use client".
import type { ReactNode } from "react";

import { QueryClient, environmentManager } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";

import { bolehUlang } from "@/lib/api/retry";

import { useOnboardingGuard } from "@/features/onboarding/hooks/use-onboarding-guard";
import { SesiProvider } from "./sesi";

function OnboardingGuard() {
  useOnboardingGuard();
  return null;
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Hindari fetch ulang langsung setelah hidrasi SSR.
        staleTime: 60_000,
        retry: bolehUlang,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (environmentManager.isServer()) {
    // Server: selalu instance baru per request.
    return makeQueryClient();
  }

  // Browser: singleton supaya tidak dibuat ulang saat React suspends.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/**
 * Simpan cache peran di `sessionStorage` (bukan `localStorage`): hilang saat
 * tab ditutup, jadi jendela paparan tetap pendek walau `peran` bukan rahasia.
 * Hard reload tetap dapat cache instan selama tab sama. Server-side: storage
 * `undefined` membuat persister ini no-op (lihat tipe `Storage | undefined |
 * null` pada `createSyncStoragePersister`).
 */
const persister = createSyncStoragePersister({
  storage: environmentManager.isServer() ? undefined : window.sessionStorage,
  key: "simpul-desa-peran",
});

/**
 * Cuma query peran yang dipersist — bukan seluruh cache TanStack Query.
 * `maxAge` 5 menit disamakan dengan TTL cache peran di `api/`
 * (`_CACHE_PERAN`, `api/src/auth/service.py:41`), supaya cache klien tidak
 * pernah "lebih segar" dari klaim yang backend sendiri masih anggap valid.
 */
const OPSI_PERSIST_PERAN = {
  persister,
  maxAge: 5 * 60 * 1000,
  dehydrateOptions: {
    shouldDehydrateQuery: (query: { queryKey: readonly unknown[] }) =>
      query.queryKey[0] === "profil",
  },
};

import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <PersistQueryClientProvider client={queryClient} persistOptions={OPSI_PERSIST_PERAN}>
        <TooltipProvider delayDuration={300}>
          <SesiProvider>
            <OnboardingGuard />
            {children}
          </SesiProvider>
        </TooltipProvider>
      </PersistQueryClientProvider>
    </ThemeProvider>
  );
}
