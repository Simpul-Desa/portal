"use client";

/**
 * Blok galat percakapan Asisten Desa (Task 22) — `pesanGalat(galat)` + kode
 * mesin mentah + tombol "Kirim ulang". Nol percobaan ulang otomatis (rencana
 * § Notes, PRD §10 risiko kuota Gemini) — tombol ini satu-satunya jalan, dan
 * ia memanggil `useAsisten().kirimUlang` (kirim ULANG riwayat apa adanya,
 * TIDAK mendaftarkan pertanyaan kedua).
 *
 * 401 di sini TIDAK membuka `DialogTerkunci` otomatis (Task 22 GOTCHA 2) —
 * cukup pesan "Perlu masuk" dari `pesanGalat`; dialog otomatis di tengah
 * percakapan mencuri fokus dari teks yang sedang dibaca pengguna.
 */

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";

type BlokGalatProps = {
  galat: GalatApi;
  onKirimUlang: () => void;
};

export function BlokGalat({ galat, onKirimUlang }: BlokGalatProps) {
  const { judul, pesan } = pesanGalat(galat);

  return (
    <div className="rounded-inset bg-inset p-3">
      <p className="flex items-center gap-1.5 text-title-sm text-ink">
        <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
        {judul}
      </p>
      <p className="mt-1 text-body-md text-ink">{pesan}</p>
      <div className="mt-3 flex items-center gap-3">
        {/* Perbaikan 8 (review Opus): tanpa `shadow-float` — blok ini duduk DI
            DALAM panel `card-float`, dan DESIGN.md § Elevation & Depth
            melarang bayangan kedua di dalam kartu melayang ("Depth inside a
            floating card comes from `surface-inset` blocks and hairlines,
            never from a second shadow."). Padding `px-[18px]` (bukan `px-4`)
            menyamai geometri `button-secondary` yang sesungguhnya
            (DESIGN.md § Buttons), pola yang sudah dipakai `dialog-terkunci.tsx`. */}
        <button
          type="button"
          onClick={onKirimUlang}
          className={`flex h-10 items-center rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
        >
          Kirim ulang
        </button>
        <span className="text-micro text-muted">{galat.kode}</span>
      </div>
    </div>
  );
}
