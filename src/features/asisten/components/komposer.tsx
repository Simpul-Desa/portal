"use client";

/**
 * Kotak tulis pertanyaan Asisten Desa (Task 21). Textarea TERKONTROL
 * sepenuhnya dari luar (`nilai` + `onNilaiChange`), bukan state lokal —
 * supaya Task 25 (prefill konteks desa aktif lewat `useKartu`, di luar
 * cakupan berkas ini) bisa mengisi atau membaca teksnya dari
 * `panel-asisten.tsx` tanpa membedah ulang komponen ini. `ref` diteruskan
 * ke elemen `<textarea>` DOM (React 19: `ref` sebagai prop biasa, tanpa
 * `forwardRef`) untuk fokus awal panel (Task 17); digabung dengan ref
 * internal lewat `gabungkanRef` supaya auto-grow tetap berjalan walau induk
 * juga memegang node yang sama.
 */

import { useEffect, useId, useRef, type KeyboardEvent, type Ref } from "react";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

import { MAKS_KARAKTER, MAKS_PESAN } from "../services/riwayat";

/** Ambang tampil cacah karakter — hanya muncul lewat 90% batas (Task 21 IMPLEMENT). */
const AMBANG_CACAH_KARAKTER = MAKS_KARAKTER * 0.9;

function gabungkanRef<T>(...refs: Array<Ref<T> | undefined>) {
  return (node: T | null) => {
    for (const r of refs) {
      if (typeof r === "function") r(node);
      else if (r) (r as { current: T | null }).current = node;
    }
  };
}

type KomposerProps = {
  ref?: Ref<HTMLTextAreaElement>;
  nilai: string;
  onNilaiChange: (nilai: string) => void;
  onKirim: () => void;
  /** Cacah giliran di riwayat SAAT INI (sebelum pertanyaan ini terkirim) —
   * dipakai menampilkan "N dari 20 pesan". Yang dihitung `api/` adalah
   * cacah `messages` satu permintaan, bukan cacah giliran user (Task 14
   * GOTCHA 1) — nilai ini boleh dibaca apa adanya dari `riwayat.length`. */
  cacahPesan: number;
  sedangMenjawab: boolean;
  /** `true` bila riwayat sudah di batas `MAKS_PESAN` — komposer terkunci. */
  penuh: boolean;
  onPercakapanBaru: () => void;
};

export function Komposer({
  ref,
  nilai,
  onNilaiChange,
  onKirim,
  cacahPesan,
  sedangMenjawab,
  penuh,
  onPercakapanBaru,
}: KomposerProps) {
  const internalRef = useRef<HTMLTextAreaElement>(null);
  const idBantuan = useId();

  // Reset dulu ke "auto" sebelum baca `scrollHeight` (Task 21 GOTCHA 3) —
  // tanpa reset itu textarea hanya bisa membesar, tidak pernah mengecil saat
  // teks dihapus. Dijalankan tiap `nilai` berubah (termasuk perubahan dari
  // luar lewat `onNilaiChange`, bukan hanya lewat mengetik).
  useEffect(() => {
    const el = internalRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [nilai]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Shift+Enter = baris baru (perilaku bawaan textarea, tidak dicegah).
    // IME (Task 21 GOTCHA 2): saat `isComposing` true, Enter menutup
    // komposisi karakter, bukan mengirim.
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    if (nilai.trim() && !sedangMenjawab) onKirim();
    // Escape TIDAK ditangani/di-`stopPropagation` di sini (Task 21
    // IMPLEMENT) — dibiarkan menggelembung ke `onKeyDown` panel supaya Esc
    // tetap menutup panel dari dalam komposer.
  }

  if (penuh) {
    return (
      <div className="flex flex-col gap-2 rounded-inset bg-inset p-3">
        <p className="text-body-md text-ink">
          Percakapan ini sudah penuh di {formatAngka(MAKS_PESAN)} pesan. Mulai percakapan baru untuk
          bertanya lagi.
        </p>
        <button
          type="button"
          onClick={onPercakapanBaru}
          className={`flex h-10 w-fit shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-[18px] text-button-md text-ink ${FOCUS_RING}`}
        >
          Percakapan baru
        </button>
      </div>
    );
  }

  const tampilkanCacahKarakter = nilai.length >= AMBANG_CACAH_KARAKTER;
  // Perbaikan 4 (review Opus): "0 dari 20 pesan" tampil juga di keadaan
  // kosong (riwayat belum punya giliran apa pun) — sketsa A rencana tidak
  // memuat baris itu di sana. Cacah pesan disembunyikan SELURUHNYA saat
  // `cacahPesan === 0`; cacah karakter tetap mengikuti aturannya sendiri
  // (ambang 90%), tidak terikat pada cacah pesan.
  const teksCacah = [
    tampilkanCacahKarakter
      ? `${formatAngka(nilai.length)} dari ${formatAngka(MAKS_KARAKTER)} karakter`
      : null,
    cacahPesan > 0 ? `${formatAngka(cacahPesan)} dari ${formatAngka(MAKS_PESAN)} pesan` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-1.5">
      <div className="min-h-11 rounded-inset bg-inset px-3 py-2.5 focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
        <textarea
          ref={gabungkanRef(ref, internalRef)}
          rows={1}
          value={nilai}
          onChange={(e) => onNilaiChange(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={MAKS_KARAKTER}
          placeholder="Tulis pertanyaan…"
          aria-label="Tulis pertanyaan untuk Asisten Desa"
          aria-describedby={idBantuan}
          className="max-h-32 w-full resize-none overflow-y-auto bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      <p id={idBantuan} className="text-micro text-muted">
        Enter mengirim. Shift+Enter membuat baris baru.
      </p>

      <div className="flex items-center justify-between gap-2">
        <p className="text-micro text-muted">{teksCacah}</p>
        <button
          type="button"
          onClick={() => {
            if (!sedangMenjawab && nilai.trim()) onKirim();
          }}
          aria-disabled={sedangMenjawab || !nilai.trim() || undefined}
          className={`flex h-10 shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-[18px] text-button-md text-ink aria-disabled:opacity-50 aria-disabled:pointer-events-none ${FOCUS_RING}`}
        >
          Kirim
        </button>
      </div>
    </div>
  );
}
