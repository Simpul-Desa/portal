"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
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
type MasukFormProps = {
  lanjut: string;
  alasan?: string;
};

export function MasukForm({ lanjut, alasan }: MasukFormProps) {
  const router = useRouter();
  const { masuk, mengirim, galat } = useAksiAuth();
  useAlihkanBilaMasuk(lanjut);
  const [email, setEmail] = useState("");
  const [sandi, setSandi] = useState("");
  const [tampilSandi, setTampilSandi] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const berhasil = await masuk(email, sandi);
    if (berhasil) router.replace(tujuanAman(lanjut));
  }

  const tautanDaftar = lanjut === "/" ? "/daftar" : `/daftar?lanjut=${encodeURIComponent(lanjut)}`;

  return (
    <Card className="overflow-hidden p-0 shadow-float border-0 rounded-card">
      <CardContent className="grid p-0 md:grid-cols-2 min-h-[500px]">
        <div className="flex flex-col p-6 md:p-8 bg-white relative justify-center">
          <Link href="/" className={`absolute top-6 left-6 md:top-8 md:left-8 w-fit text-sm text-muted hover:text-ink hover:underline hover:underline-offset-2 ${FOCUS_RING}`}>
            ← Kembali
          </Link>
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-center mt-12 md:mt-16">
            <FieldGroup>
              <div className="flex flex-col items-center text-center gap-2 mb-4">
                <h1 className="text-2xl font-bold text-ink">Masuk ke Akun</h1>
                <p className="text-sm text-muted text-balance">
                  Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa
                </p>
              </div>
              
              {alasan === "tidak_aktif" && (
                <div
                  role="status"
                  className="rounded-inset border border-caution/40 bg-caution/10 p-3 text-label text-ink"
                >
                  <p className="font-semibold text-caution">Sesi Berakhir</p>
                  <p className="mt-0.5 text-micro text-body">
                    Anda telah keluar secara otomatis karena tidak ada aktivitas selama 30 menit. Silakan masuk kembali.
                  </p>
                </div>
              )}

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
                    autoComplete="current-password"
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
                  Masuk
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
                Belum punya akun?{" "}
                <Link href={tautanDaftar} className={`text-link underline hover:underline-offset-2 ${FOCUS_RING}`}>
                  Daftar
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
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
