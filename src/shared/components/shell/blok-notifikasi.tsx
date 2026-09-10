"use client";

/**
 * Blok pemberitahuan (DESIGN.md § Notice Block) dirender `dashboard-shell.tsx`
 * di ATAS isi panel kiri, jadi terlihat di lensa mana pun yang sedang aktif —
 * dan terlihat pengguna mana pun, termasuk anonim. Satu komponen, dua
 * pemicu:
 *
 * 1. **Galat baca peran** (perbaikan galat diam terlaporkan 10 September
 *    2026): sesi Supabase bisa berhasil (`signInWithPassword` sukses)
 *    sementara `GET /api/profil/saya` gagal (jaringan `api/` mati, 401, 403
 *    baris profil belum ada, 503 konfigurasi server) — tanpa blok ini,
 *    `galatPeran` (`core/sesi.tsx`) tersimpan tanpa satu tempat pun
 *    merendernya, sehingga pengguna yang SUDAH masuk diam-diam diperlakukan
 *    seperti anonim (kelima lensa terkunci, tombol Asisten terkunci, nol
 *    penjelasan). Dipakai dengan `konteks` terisi, karena teks galat peran
 *    mentah (mis. 403 "Akun ini belum punya akses ke fitur ini") sendirian
 *    akan terbaca sebagai tuduhan alih-alih penjelasan "sesi tetap ada,
 *    hanya perannya yang belum terbaca".
 * 2. **Gangguan server** (perbaikan galat diam terlaporkan 10 September
 *    2026, giliran kedua: `useGangguanServer`): query peran DIGERBANG sesi
 *    (`enabled: Boolean(sesi)`), jadi pengunjung ANONIM dengan `api/` mati
 *    sebelumnya nol pemberitahuan sama sekali. `useRingkasan`/`usePusat`
 *    berjalan untuk SEMUA pengguna, jadi galatnya dipakai di sini tanpa
 *    `konteks` tambahan — teks `pesanGalat` untuk `GALAT_JARINGAN`/5xx sudah
 *    memadai apa adanya, bukan tuduhan.
 *
 * "Apa yang gagal" selalu dipetakan `pesanGalat` (`lib/api/galat-ui.ts`) —
 * TIDAK ADA pemetaan galat ketiga di sini. `konteks` adalah SATU kalimat
 * tambahan ditulis tangan oleh pemanggil, bukan cabang baru di pemetaan
 * galat. Tombol "Coba lagi" memanggil `onCobaLagi` yang diteruskan
 * pemanggil — memicu ulang QUERY yang relevan, bukan memuat ulang halaman.
 *
 * Kedua pemicu TIDAK PERNAH dirender bersamaan (lihat `dashboard-shell.tsx`):
 * galat peran menang saat keduanya ada, karena ia menjelaskan konsekuensi
 * yang lebih tajam (fitur terkunci untuk sesi yang sudah masuk).
 */

import { RotateCcw } from "lucide-react";

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";

type BlokNotifikasiProps = {
  galat: GalatApi;
  /** Kalimat konteks tambahan, satu baris, ditulis tangan — kosongkan bila teks `pesanGalat` sudah memadai sendirian. */
  konteks?: string;
  onCobaLagi: () => void;
};

export function BlokNotifikasi({ galat, konteks, onCobaLagi }: BlokNotifikasiProps) {
  const { judul, pesan } = pesanGalat(galat);

  return (
    <div role="alert" className="rounded-card bg-surface p-5">
      <p className="flex items-center gap-1.5 text-title-sm text-ink">
        <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
        {judul}
      </p>
      <p className="mt-1 text-body-md text-body">{pesan}</p>
      {konteks && <p className="mt-1 text-body-md text-body">{konteks}</p>}
      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          onClick={onCobaLagi}
          className={`flex h-10 items-center gap-1.5 rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
        >
          <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
          Coba lagi
        </button>
        <span className="text-micro text-muted">{galat.kode}</span>
      </div>
    </div>
  );
}
