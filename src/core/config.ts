/**
 * Konfigurasi lingkungan aplikasi. `NEXT_PUBLIC_*` di-inline saat build
 * (aturan Next.js untuk env `NEXT_PUBLIC_*`) — Vercel harus menyetel var
 * yang sama saat deploy. `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` memang
 * publik menurut desain Supabase (aman di bundel klien; RLS yang menjaga
 * data) — yang TIDAK PERNAH boleh masuk `app/` adalah `SUPABASE_SERVICE_ROLE_KEY`
 * (kunci itu milik `api/.env`).
 */
function bacaApiUrl(): string {
  const nilai = process.env.NEXT_PUBLIC_API_URL;

  if (!nilai) {
    throw new Error(
      "NEXT_PUBLIC_API_URL kosong — isi berkas .env.local (contoh nilai ada di .env.example).",
    );
  }

  return nilai.replace(/\/+$/, "");
}

function bacaSupabaseUrl(): string {
  const nilai = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!nilai) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL kosong — isi berkas .env.local (contoh nilai ada di .env.example).",
    );
  }

  return nilai.replace(/\/+$/, "");
}

function bacaSupabasePublishableKey(): string {
  const nilai = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!nilai) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY kosong — isi berkas .env.local (contoh nilai ada di .env.example).",
    );
  }

  return nilai;
}

export const API_URL = bacaApiUrl();
export const SUPABASE_URL = bacaSupabaseUrl();
export const SUPABASE_PUBLISHABLE_KEY = bacaSupabasePublishableKey();
