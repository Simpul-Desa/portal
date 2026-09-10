"use client";

// QueryClientProvider mengandalkan useContext, jadi berkas ini wajib "use client".
import type { ReactNode } from "react";

import { QueryClient, QueryClientProvider, environmentManager } from "@tanstack/react-query";

import { bolehUlang } from "@/lib/api/retry";

import { SesiProvider } from "./sesi";

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

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SesiProvider>{children}</SesiProvider>
    </QueryClientProvider>
  );
}
