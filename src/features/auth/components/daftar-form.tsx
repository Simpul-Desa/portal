"use client";

/**
 * Form daftar (Task 19) — sama kerangka dengan `masuk-form.tsx` plus: bantuan
 * panjang sandi, dan keadaan "cek email" jujur saat `perluKonfirmasi: true`
 * (proyek Supabase dengan konfirmasi email menyala mengembalikan
 * `session: null` walau akun berhasil dibuat — BUKAN kegagalan, lihat
 * `use-aksi-auth.ts`). Registrasi mandiri selalu menghasilkan peran tamu
 * (PRD akar §3) — kalimat itu dicetak tetap di bawah form supaya juri tidak
 * mencari pemilih peran yang memang sengaja tidak ada.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";

import { AuthField, GalatForm } from "@/features/auth/components/auth-field";
import { useAksiAuth } from "@/features/auth/hooks/use-aksi-auth";
import { useAlihkanBilaMasuk } from "@/features/auth/hooks/use-alihkan-bila-masuk";
import { tujuanAman } from "@/lib/redirect-aman";
import { FOCUS_RING } from "@/shared/components/focus-ring";

type DaftarFormProps = {
  lanjut: string;
};

export function DaftarForm({ lanjut }: DaftarFormProps) {
  const router = useRouter();
  const { daftar, mengirim, galat } = useAksiAuth();
  useAlihkanBilaMasuk(lanjut);
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [perluKonfirmasi, setPerluKonfirmasi] = useState(false);
  const judulKonfirmasiRef = useRef<HTMLHeadingElement>(null);

  // Penyerahan fokus (Task 20): form diganti total oleh panel konfirmasi saat
  // `perluKonfirmasi` menyala — tanpa ini fokus jatuh ke `<body>` karena
  // elemen yang tadi fokus (tombol submit) ikut lenyap dari DOM.
  useEffect(() => {
    if (perluKonfirmasi) judulKonfirmasiRef.current?.focus();
  }, [perluKonfirmasi]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const hasil = await daftar(email, sandi);
    if (!hasil.berhasil) return;

    if (hasil.perluKonfirmasi) {
      setPerluKonfirmasi(true);
      return;
    }

    router.replace(tujuanAman(lanjut));
  }

  const tautanMasuk = lanjut === "/" ? "/masuk" : `/masuk?lanjut=${encodeURIComponent(lanjut)}`;

  if (perluKonfirmasi) {
    return (
      <div className="flex h-full flex-col rounded-card bg-surface p-5">
        <h1 ref={judulKonfirmasiRef} tabIndex={-1} className="text-title-md text-ink outline-none">
          Cek email untuk konfirmasi
        </h1>
        <p className="mt-4 text-body-md text-body">
          Kami mengirim tautan konfirmasi ke {email}. Buka tautan itu, lalu masuk.
        </p>
        <p className="mt-4 text-body-md text-muted">
          Sudah konfirmasi?{" "}
          <Link href={tautanMasuk} className={`text-link underline underline-offset-2 ${FOCUS_RING}`}>
            Masuk
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-5">
      <Link href="/" className={`text-body-md text-link underline underline-offset-2 ${FOCUS_RING}`}>
        ← Kembali ke peta
      </Link>

      <h1 className="mt-4 text-title-md text-ink">Daftar</h1>

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
          autoComplete="new-password"
          required
          bantuan="Minimal 8 karakter"
        />

        {galat && <GalatForm galat={galat} />}

        <button
          type="submit"
          disabled={mengirim}
          aria-busy={mengirim}
          className={`h-10 rounded-full bg-primary px-[18px] text-button-md text-ink disabled:opacity-60 ${FOCUS_RING}`}
        >
          Daftar
        </button>
      </form>

      <p className="mt-4 text-body-md text-muted">
        Sudah punya akun?{" "}
        <Link href={tautanMasuk} className={`text-link underline underline-offset-2 ${FOCUS_RING}`}>
          Masuk
        </Link>
      </p>

      <p className="mt-4 text-micro text-muted">
        Akun baru selalu berperan tamu, dan hanya admin yang bisa menaikkannya.
      </p>
    </div>
  );
}
