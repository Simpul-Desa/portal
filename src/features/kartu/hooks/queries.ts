"use client";

/**
 * Hook TanStack Query lensa Kartu Ekonomi Desa. Semua memanggil
 * `lib/api/endpoints.ts` — tidak ada `fetch` langsung di sini. Query
 * wilayah/geo/cari yang dipakai lebih dari satu fitur sudah pindah ke
 * `shared/hooks/queries-wilayah.ts` (Task 9); berkas ini menyisakan
 * `useKartu` — satu-satunya query yang murni milik lensa Kartu.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabaseBrowser } from "@/core/supabase/browser";
import type { GalatApi } from "@/lib/api/client";
import { aiInsightBuat, type DataDari, modelKartu } from "@/lib/api/endpoints";
import { STALE_BEKU } from "@/shared/hooks/queries-wilayah";

import type { AIInsightData } from "../types";

export function useKartu(iddesa?: string) {
  return useQuery<DataDari<"/api/model/kartu/{iddesa}">, GalatApi>({
    queryKey: ["kartu", iddesa],
    queryFn: async () => (await modelKartu(iddesa as string)).data,
    enabled: Boolean(iddesa),
    staleTime: STALE_BEKU,
  });
}

/**
 * Membaca data AI Insight langsung dari Supabase tabel `ai_insights`.
 * Dapat diakses oleh semua pengguna (kebijakan RLS publik).
 */
export function useAIInsight(iddesa?: string) {
  return useQuery<AIInsightData | null, Error>({
    queryKey: ["ai-insight", iddesa],
    queryFn: async () => {
      if (!iddesa) return null;
      const supabase = supabaseBrowser();
      const { data, error } = await supabase
        .from("ai_insights")
        .select("*")
        .eq("iddesa", iddesa)
        .maybeSingle();

      if (error) {
        console.warn("Gagal membaca AI Insight dari Supabase:", error);
        return null;
      }
      return (data as AIInsightData) ?? null;
    },
    enabled: Boolean(iddesa),
  });
}

/**
 * Memicu generate AI Insight lewat endpoint backend `POST /api/ai-insight`.
 * Hanya untuk pengguna yang login dengan peran di atas tamu.
 */
export function useGenerateAIInsight() {
  const queryClient = useQueryClient();
  return useMutation<AIInsightData, GalatApi, { iddesa: string; generateUlang?: boolean }>({
    mutationFn: async ({ iddesa, generateUlang = false }) => {
      const resp = await aiInsightBuat(iddesa, generateUlang);
      return resp.data;
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(["ai-insight", variables.iddesa], data);
    },
  });
}
