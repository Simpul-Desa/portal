"use client";

/**
 * Form masuk (Task 18) — mengisi slot kiri `app/(auth)/layout.tsx`. `lanjut`
 * diterima sebagai PROP STRING dari `masuk/page.tsx` (server component, sudah
 * `await searchParams`) — bukan `useSearchParams` di sini, supaya tidak ada
 * boundary Suspense tambahan dan tidak ada risiko CSR-bailout saat build.
 *
 * Tujuan setelah masuk SELALU lewat `tujuanAman()` — tidak pernah
 * `router.replace(lanjut)` mentah (pengaman open redirect).
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { AuthField, GalatForm } from "@/features/auth/components/auth-field";
import { useAksiAuth } from "@/features/auth/hooks/use-aksi-auth";
import { useAlihkanBilaMasuk } from "@/features/auth/hooks/use-alihkan-bila-masuk";
import { tujuanAman } from "@/lib/redirect-aman";
import { FOCUS_RING } from "@/shared/components/focus-ring";

type MasukFormProps = {
  lanjut: string;
};

export function MasukForm({ lanjut }: MasukFormProps) {
  const router = useRouter();
  const { masuk, mengirim, galat } = useAksiAuth();
  useAlihkanBilaMasuk(lanjut);
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const berhasil = await masuk(email, sandi);
    if (berhasil) router.replace(tujuanAman(lanjut));
  }

  const tautanDaftar = lanjut === "/" ? "/daftar" : `/daftar?lanjut=${encodeURIComponent(lanjut)}`;

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-5">
      <Link href="/" className={`text-body-md text-link underline underline-offset-2 ${FOCUS_RING}`}>
        ← Kembali ke peta
      </Link>

      <h1 className="mt-4 text-title-md text-ink">Masuk</h1>

      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <AuthField
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          required
        />
        <AuthField
          label="Sandi"
          type="password"
          name="sandi"
          value={sandi}
          onChange={setSandi}
          autoComplete="current-password"
          required
        />

        {galat && <GalatForm galat={galat} />}

        <button
          type="submit"
          disabled={mengirim}
          aria-busy={mengirim}
          className={`h-10 rounded-full bg-primary px-[18px] text-button-md text-ink disabled:opacity-60 ${FOCUS_RING}`}
        >
          Masuk
        </button>
      </form>

      <p className="mt-4 text-body-md text-muted">
        Belum punya akun?{" "}
        <Link href={tautanDaftar} className={`text-link underline underline-offset-2 ${FOCUS_RING}`}>
          Daftar
        </Link>
      </p>
    </div>
  );
}
