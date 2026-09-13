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

import { useEffect, useId, useRef, useState, type KeyboardEvent, type Ref } from "react";
import { Plus, Search, X } from "lucide-react";

import { useCariDesa } from "@/shared/hooks/queries-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem
} from "@/shared/components/ui/combobox";
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
  onKirim: (teksKustom?: string) => void;
  cacahPesan: number;
  sedangMenjawab: boolean;
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
  const [popoverBuka, setPopoverBuka] = useState(false);
  const [qDesa, setQDesa] = useState("");
  const [desaKonteks, setDesaKonteks] = useState<{ nmdesa: string; nmkec: string; nmkab: string } | null>(null);
  const { data, isPending } = useCariDesa(qDesa);

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

  function handleKirim() {
    if (sedangMenjawab) return;
    const teksPertanyaan = nilai.trim();
    if (!teksPertanyaan && !desaKonteks) return;

    if (desaKonteks) {
      const namaLengkap = `Desa ${desaKonteks.nmdesa}, Kec. ${desaKonteks.nmkec}, Kab. ${desaKonteks.nmkab}`;
      const formatToken = `[@${namaLengkap}]`;
      const teksFinal = teksPertanyaan ? `${formatToken} ${teksPertanyaan}` : formatToken;
      onKirim(teksFinal);
      setDesaKonteks(null);
    } else {
      onKirim(teksPertanyaan);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Shift+Enter = baris baru (perilaku bawaan textarea, tidak dicegah).
    // IME (Task 21 GOTCHA 2): saat `isComposing` true, Enter menutup
    // komposisi karakter, bukan mengirim.
    if (e.key !== "Enter" || e.shiftKey || e.nativeEvent.isComposing) return;
    e.preventDefault();
    handleKirim();
    // Escape TIDAK ditangani/di-`stopPropagation` di sini (Task 21
    // IMPLEMENT) — dibiarkan menggelembung ke `onKeyDown` panel supaya Esc
    // tetap menutup panel dari dalam komposer.
  }

  function handleTextareaChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    onNilaiChange(val);
    // Buka combobox saat pengguna mengetik '@'
    if (val.endsWith("@")) {
      setPopoverBuka(true);
      setQDesa("");
    }
  }

  function pilihDesa(d: { nmdesa: string; nmkec: string; nmkab: string }) {
    setDesaKonteks(d);
    let teksBaru = nilai;
    // Hapus karakter '@' pemicu jika ada
    const atIndex = teksBaru.lastIndexOf("@");
    if (atIndex !== -1) {
      teksBaru = teksBaru.slice(0, atIndex) + teksBaru.slice(atIndex + 1);
    }
    onNilaiChange(teksBaru.trimStart());
    setPopoverBuka(false);
    setQDesa("");

    // Focus kembali ke textarea setelah pilih
    requestAnimationFrame(() => {
      internalRef.current?.focus();
    });
  }

  if (penuh) {
    return (
      <div className="flex flex-col gap-2 rounded-inset bg-inset p-3">
        <p className="text-micro text-ink">
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
  const teksCacah = [
    tampilkanCacahKarakter
      ? `${formatAngka(nilai.length)} dari ${formatAngka(MAKS_KARAKTER)}`
      : null,
    cacahPesan > 0 ? `${formatAngka(cacahPesan)}/${formatAngka(MAKS_PESAN)} pesan` : null,
  ].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-2">
      <div className="relative flex flex-col rounded-3xl bg-inset border border-hairline hover:border-line-strong focus-within:border-line-strong transition-colors shadow-sm overflow-hidden">
        {desaKonteks && (
          <div className="flex items-center px-4 pt-3 pb-0">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-line-strong/70 bg-surface px-2.5 py-1 text-micro text-ink max-w-[280px] shadow-xs">
              <span className="truncate" title={`Desa ${desaKonteks.nmdesa}, Kec. ${desaKonteks.nmkec}, Kab. ${desaKonteks.nmkab}`}>
                Desa {desaKonteks.nmdesa}, Kec. {desaKonteks.nmkec}, Kab. {desaKonteks.nmkab}
              </span>
              <button
                type="button"
                onClick={() => setDesaKonteks(null)}
                className="text-muted hover:text-ink shrink-0 p-0.5 rounded transition-colors"
                title="Hapus sebutan desa"
                aria-label="Hapus sebutan desa"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        <textarea
          ref={gabungkanRef(ref, internalRef)}
          rows={1}
          value={nilai}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          maxLength={MAKS_KARAKTER}
          placeholder={desaKonteks ? "Tulis pertanyaan untuk desa ini…" : "Tulis pertanyaan… (ketik @ untuk sebut desa)"}
          aria-label="Tulis pertanyaan untuk Asisten Desa"
          aria-describedby={idBantuan}
          className="min-h-[50px] max-h-32 w-full resize-none bg-transparent px-4 py-3 text-micro text-ink placeholder:text-muted focus:outline-none"
        />

        <div className="flex items-center justify-between px-2 pb-2">
          <Combobox 
            open={popoverBuka} 
            onOpenChange={setPopoverBuka} 
            value={null} 
            onValueChange={(val: unknown) => {
              if (val && typeof val === "object" && "iddesa" in val) {
                pilihDesa(val as unknown as { nmdesa: string; nmkec: string; nmkab: string });
              }
            }}
            inputValue={qDesa}
            onInputValueChange={(val: string) => setQDesa(val)}
          >
            <ComboboxPrimitive.Trigger
              render={
                <button
                  type="button"
                  className="flex size-7 shrink-0 items-center justify-center rounded-full bg-transparent text-muted border-0 hover:bg-surface hover:text-ink transition-colors mt-0.5 ml-0.5 outline-none ring-0"
                  title="Sebut Desa (@)"
                >
                  <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                </button>
              }
            />
            <ComboboxContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-72 p-2 rounded-xl shadow-float-strong border border-line bg-float z-50 outline-none ring-0"
            >
              <div className="flex items-center gap-2 border-b border-hairline pb-2 mb-2 px-1">
                <Search className="size-4 text-muted shrink-0 ml-1" />
                <ComboboxPrimitive.Input
                  placeholder="Cari nama desa..."
                  className="w-full h-8 bg-transparent border-none rounded-none text-micro text-ink placeholder:text-muted focus:outline-none focus:ring-0 px-0 outline-none ring-0"
                  autoFocus
                />
              </div>
              <ComboboxList className="max-h-48 overflow-y-auto flex flex-col gap-1 p-0 outline-none ring-0">
                {isPending && qDesa.length >= 2 ? (
                  <div className="px-2 py-2 text-micro text-muted text-center animate-pulse">Mencari...</div>
                ) : data && data.length > 0 ? (
                  data.map((d) => (
                    <ComboboxItem
                      key={d.iddesa}
                      value={d}
                      showIndicator={false}
                      className="w-full flex-col items-start rounded-lg px-2.5 py-1.5 cursor-pointer data-highlighted:bg-surface data-highlighted:text-ink text-left outline-none ring-0 border-0"
                    >
                      <span className="block text-micro text-ink truncate font-medium">{d.nmdesa}</span>
                      <span className="block text-[11px] text-muted truncate">Kec. {d.nmkec}, Kab. {d.nmkab}</span>
                    </ComboboxItem>
                  ))
                ) : qDesa.length >= 2 ? (
                  <div className="px-2 py-2 text-micro text-muted text-center">Tidak ada desa cocok</div>
                ) : (
                  <div className="px-2 py-2 text-micro text-muted text-center">Ketik nama desa...</div>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          
          <button
            type="button"
            onClick={handleKirim}
            disabled={sedangMenjawab || (!nilai.trim() && !desaKonteks)}
            className={`flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-white hover:bg-black hover:text-white disabled:opacity-50 disabled:pointer-events-none transition-colors ${FOCUS_RING}`}
            title="Kirim"
            aria-label="Kirim"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5"></line>
              <polyline points="5 12 12 5 19 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p id={idBantuan} className="text-micro text-muted">
          Enter kirim. Shift+Enter baris baru.
        </p>
        {teksCacah && <p className="text-micro text-muted">{teksCacah}</p>}
      </div>
    </div>
  );
}
