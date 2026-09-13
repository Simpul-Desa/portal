"use client";

/**
 * Field form auth (Task 17) — cetakan dari `search-box.tsx:87-107`: ring
 * fokus pindah ke WADAH lewat `focus-within` (bukan ke `<input>` — input
 * sendiri memakai `focus:outline-none`). Beda dari `search-field` (dipakai
 * di atas peta): field ini ada DI DALAM kartu, jadi latar `bg-inset` +
 * `rounded-inset`, tanpa `shadow-float` — dua bentuk berbeda untuk dua
 * konteks berbeda (DESIGN.md § Form Controls).
 *
 * `<label htmlFor>` + `id` WAJIB (bukan `aria-label` saja): itu satu-satunya
 * cara pembaca layar mempertahankan hubungan label↔pesan galat/bantuan lewat
 * `aria-describedby`.
 */

import { type ChangeEvent, useState } from "react";
import { AlertCircle, X } from "lucide-react";

import { FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";

type AuthFieldProps = {
  label: string;
  type: "email" | "password" | "text";
  name: string;
  value: string;
  onChange: (value: string) => void;
  galat?: string;
  bantuan?: string;
  autoComplete?: string;
  required?: boolean;
};

export function AuthField({
  label,
  type,
  name,
  value,
  onChange,
  galat,
  bantuan,
  autoComplete,
  required,
}: AuthFieldProps) {
  const idKeterangan = `${name}-keterangan`;
  const adaKeterangan = Boolean(galat) || Boolean(bantuan);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.value);
  }

  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-label text-muted">
        {label}
      </label>

      <div className={`flex h-11 items-center rounded-inset bg-inset px-3 ${FOCUS_RING_WITHIN}`}>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          autoComplete={autoComplete}
          required={required}
          aria-invalid={galat ? true : undefined}
          aria-describedby={adaKeterangan ? idKeterangan : undefined}
          className="w-full min-w-0 bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {galat && (
        <p id={idKeterangan} className="mt-1 flex items-center gap-1.5 text-micro text-ink">
          <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
          {galat}
        </p>
      )}
      {!galat && bantuan && (
        <p id={idKeterangan} className="mt-1 text-micro text-muted">
          {bantuan}
        </p>
      )}
    </div>
  );
}

/**
 * Galat milik SELURUH FORM (mis. "Gagal masuk" / "Email atau sandi salah")
 * — bukan milik satu field tertentu, jadi bukan bagian dari `AuthField`.
 * Menampilkan `judul` + `pesan` + `kode` mentah (DESIGN.md § Notice Block):
 * titik `critical` 6px memimpin `judul` (warna tetap di titik, kata tetap
 * `ink`, aturan `form-error`), `pesan` di bawahnya, lalu `kode` kecil untuk
 * pelaporan bila ada. Sebelumnya hanya `pesan` yang dirender — `judul`
 * sempat jadi utang tercatat sejak fase 2, ditutup di sini. Diekspor dari
 * berkas ini (bukan berkas baru) supaya `masuk-form.tsx` dan
 * `daftar-form.tsx` tidak menduplikasi markup ini.
 */
export function GalatForm({ galat }: { galat: { judul: string; pesan: string; kode?: string } }) {
  const [ditutupUntuk, setDitutupUntuk] = useState<{ judul: string; pesan: string; kode?: string } | null>(null);

  if (ditutupUntuk === galat) return null;

  return (
    <div className="relative w-full mb-2">
      <div role="alert" className="absolute top-0 left-0 w-full rounded-md border border-critical/30 bg-float px-3.5 py-3 shadow-float animate-in fade-in slide-in-from-top-2 z-50">
        <div className="absolute -top-1.5 left-4 h-3 w-3 rotate-45 border-l border-t border-critical/30 bg-float" />
        <div className="relative z-10 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-critical shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 flex-1">
            <p className="font-semibold text-critical text-sm">{galat.judul}</p>
            <p className="text-muted text-sm">{galat.pesan}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setDitutupUntuk(galat)}
            className="text-muted/70 hover:text-ink transition-colors p-1 -mt-1 -mr-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-critical/50"
            aria-label="Tutup pesan galat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
