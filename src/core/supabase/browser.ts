/**
 * Singleton klien Supabase browser — satu instans per tab. Mirip pola
 * `getQueryClient()` (`src/core/providers.tsx`): variabel modul + `??=`.
 * Beberapa instans per tab menghasilkan beberapa pendengar
 * `onAuthStateChange` dan beberapa timer refresh yang saling menimpa cookie.
 *
 * Modul ini HANYA boleh diimpor dari komponen klien — `createBrowserClient`
 * membaca sesi lewat `document.cookie`. Jangan menyentuh `document.cookie`
 * sendiri: `@supabase/ssr` memecah cookie besar menjadi potongan bernomor
 * (`…-auth-token.0`, `.1`, …) dan hanya pustaka itu yang tahu cara
 * menyatukannya kembali.
 */

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/core/config";

let klien: SupabaseClient | undefined;

export function supabaseBrowser(): SupabaseClient {
  klien ??= createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  return klien;
}
