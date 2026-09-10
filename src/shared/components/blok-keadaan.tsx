"use client";

/**
 * Tiga bentuk keadaan bersama (DESIGN.md § Empty, Loading & Error States) —
 * tiga ekspor kecil, bukan satu komponen serba bisa, karena tiap panel
 * memutuskan sendiri lewat `pilihKeadaan` (`./keadaan.ts`) kapan memakai yang
 * mana. `KerangkaMuat` dan `KeadaanKosong` murni presentasional; `BlokGalat`
 * satu-satunya yang butuh `onClick`, jadi seluruh berkas ditandai
 * `"use client"`.
 */

import { RotateCcw } from "lucide-react";

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";

type KerangkaMuatProps = {
  /** Kelas tinggi Tailwind lengkap untuk tiap blok pulse. Bawaan `"h-24"`. */
  tinggi?: string;
  /** Jumlah blok pulse ditumpuk. Bawaan 2. */
  baris?: number;
};

/**
 * Kerangka muat — blok pulse setinggi konten aslinya, tanpa teks dan tanpa
 * spinner. Tiap blok `aria-hidden` karena kerangkanya sendiri tidak membawa
 * informasi; pengumuman "sedang memuat" adalah tugas `role="status"` di
 * pemanggil, bukan tugas komponen ini.
 */
export function KerangkaMuat({ tinggi = "h-24", baris = 2 }: KerangkaMuatProps) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: baris }, (_, i) => (
        <div key={i} aria-hidden="true" className={`${tinggi} animate-pulse rounded-card bg-surface`} />
      ))}
    </div>
  );
}

type KeadaanKosongProps = {
  kalimat: string;
};

/**
 * Keadaan kosong — satu kalimat jawaban, BUKAN galat. Nol `role="alert"`:
 * daftar kosong adalah jawaban yang sah dan tidak boleh menyela pembaca
 * layar seperti galat.
 */
export function KeadaanKosong({ kalimat }: KeadaanKosongProps) {
  return <p className="px-1 py-2 text-body-md text-muted">{kalimat}</p>;
}

type BlokGalatProps = {
  galat: GalatApi;
  onCobaLagi?: () => void;
  /** Bawaan `"panel"`. */
  penempatan?: "inline" | "panel";
};

/**
 * Bentuk Notice Block untuk galat PER-QUERY di dalam satu panel — markup
 * disalin verbatim dari SUMBER: `tab-status.tsx:47-68`. Teks selalu dari
 * `pesanGalat`; berkas ini tidak menambah pemetaan galat ketiga.
 * `BlokNotifikasi` (shell) TIDAK diganti oleh komponen ini — ia melayani dua
 * pemicu tingkat-sesi, `BlokGalat` melayani galat per-query di dalam panel;
 * dua komponen, satu bentuk visual, dua penempatan DESIGN.md.
 */
export function BlokGalat({ galat, onCobaLagi, penempatan = "panel" }: BlokGalatProps) {
  const { judul, pesan } = pesanGalat(galat);

  return (
    <div role="alert" className={penempatan === "panel" ? "rounded-card bg-surface p-5" : undefined}>
      <p className="flex items-center gap-1.5 text-title-sm text-ink">
        <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
        {judul}
      </p>
      <p className="mt-1 text-body-md text-body">{pesan}</p>
      <div className="mt-3 flex items-center gap-3">
        {onCobaLagi && (
          <button
            type="button"
            onClick={onCobaLagi}
            className={`flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
          >
            <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
            Coba lagi
          </button>
        )}
        <span className="text-micro text-muted">{galat.kode}</span>
      </div>
    </div>
  );
}
