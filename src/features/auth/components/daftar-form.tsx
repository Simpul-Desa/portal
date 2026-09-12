"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Eye, EyeOff } from "lucide-react";

import { DOCS_URL } from "@/core/config";
import { useAksiAuth } from "@/features/auth/hooks/use-aksi-auth";
import { useAlihkanBilaMasuk } from "@/features/auth/hooks/use-alihkan-bila-masuk";
import { tujuanAman } from "@/lib/redirect-aman";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { Separator } from "@/shared/components/ui/separator";
import { GalatForm } from "@/features/auth/components/auth-field";
import { PanelCakupan } from "@/features/auth/components/panel-cakupan";
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
  const [tampilSandi, setTampilSandi] = useState(false);
  const judulKonfirmasiRef = useRef<HTMLHeadingElement>(null);

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

  return (
    <Card className="overflow-hidden p-0 shadow-float border-0 rounded-card">
      <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px]">
        <div className="flex flex-col p-6 md:p-8 bg-white relative justify-center">
          <Link href="/" className={`absolute top-6 left-6 md:top-8 md:left-8 w-fit text-sm text-muted hover:text-ink hover:underline hover:underline-offset-2 ${FOCUS_RING}`}>
            ← Kembali
          </Link>

          {perluKonfirmasi ? (
            <div className="flex-1 flex flex-col justify-center text-center mt-8">
              <h1 ref={judulKonfirmasiRef} tabIndex={-1} className="text-2xl font-bold text-ink outline-none mb-4">
                Cek email untuk konfirmasi
              </h1>
              <p className="text-sm text-body mb-8 text-balance">
                Kami mengirim tautan konfirmasi ke <span className="font-semibold">{email}</span>. Buka tautan itu, lalu masuk.
              </p>
              <p className="text-sm text-muted text-center">
                Sudah konfirmasi?{" "}
                <Link href={tautanMasuk} className={`text-link underline hover:underline-offset-2 ${FOCUS_RING}`}>
                  Masuk
                </Link>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center mt-12 md:mt-16">
              <FieldGroup>
                <div className="flex flex-col items-center text-center gap-2 mb-4">
                  <h1 className="text-2xl font-bold text-ink">Buat Akun</h1>
                  <p className="text-sm text-muted text-balance">
                    Daftar untuk mengakses Sistem Intelijen Potensi Desa
                  </p>
                </div>

                <Field>
                  <FieldLabel htmlFor="email">Email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </Field>
                <Field>
                  <FieldLabel htmlFor="password">Sandi</FieldLabel>
                  <div className="relative">
                    <Input
                      id="password"
                      type={tampilSandi ? "text" : "password"}
                      name="sandi"
                      value={sandi}
                      onChange={(e) => setSandi(e.target.value)}
                      autoComplete="new-password"
                      required
                      className="pr-12"
                    />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => setTampilSandi(!tampilSandi)}
                        className={`absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full text-muted hover:text-ink transition-colors outline-none focus-visible:bg-surface`}
                        aria-label={tampilSandi ? "Sembunyikan sandi" : "Tampilkan sandi"}
                      >
                        {tampilSandi ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      {tampilSandi ? "Sembunyikan sandi" : "Tampilkan sandi"}
                    </TooltipContent>
                  </Tooltip>
                  </div>
                </Field>

                {galat && <GalatForm galat={galat} />}

                <Field className="mt-2">
                  <Button type="submit" disabled={mengirim} aria-busy={mengirim} className="w-full text-white font-medium">
                    Daftar
                  </Button>
                </Field>
                
                <Field>
                  <Button variant="outline" type="button" asChild className="w-full">
                    <a href={`${DOCS_URL}/docs/akun-demo`} target="_blank" rel="noopener noreferrer">
                      Dapatkan Akun Demo
                    </a>
                  </Button>
                </Field>

                <FieldDescription className="text-center mt-2">
                  Sudah punya akun?{" "}
                  <Link href={tautanMasuk} className={`text-link underline hover:underline-offset-2 ${FOCUS_RING}`}>
                    Masuk
                  </Link>
                </FieldDescription>
                
               
              </FieldGroup>
            </form>
          )}
        </div>
        
        {/* Right Panel for larger screens */}
        <div className="relative hidden md:block bg-transparent overflow-hidden">
          <video
            src="/video-login.mp4"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        </div>
      </CardContent>
    </Card>
  );
}
