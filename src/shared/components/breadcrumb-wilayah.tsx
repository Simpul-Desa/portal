"use client";

import { useEffect, useRef } from "react";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ChevronRightIcon, CloseIcon } from "@/shared/components/icons";

export type TingkatWilayah = "prov" | "kab" | "desa";

export type ChipWilayah = {
  /** Kunci render stabil (review Blok D #13) — dipasok pemanggil, bukan indeks array. */
  tingkat: TingkatWilayah;
  label: string;
  onHapus: () => void;
};

type BreadcrumbWilayahProps = {
  chip: readonly ChipWilayah[];
};

/**
 * Breadcrumb chip navigasi wilayah (Prov › Kab [› Desa]), dipakai
 * `region-picker.tsx` (dua tingkat) dan `kartu-panel.tsx` (tiga tingkat,
 * keputusan Fable — chip ringkas di atas card-entity, bukan kartu pemilih
 * penuh). Tiap chip punya tombol × yang menghapus TINGKAT itu — pemanggil
 * yang menentukan artinya lewat `onHapus` (mis. hapus desa = `pilihKab(kab)`,
 * bukan fungsi baru di `use-wilayah-params.ts`). Ini navigasi, bukan status:
 * pill polos tanpa titik warna status-chip.
 *
 * Penyerahan fokus (Task 20): daftar ini hanya menyusut dari EKOR (menghapus
 * satu tingkat selalu membuang tingkat itu dan yang lebih dalam), jadi
 * setelah penghapusan chip terakhir yang tersisa selalu masih ada — tombol
 * ×-nya yang menerima fokus. Saat daftar habis sama sekali tidak ada tombol
 * lain di komponen ini untuk dituju, jadi wadahnya sendiri (`tabIndex={-1}`)
 * jadi sasaran terakhir supaya fokus tidak pernah jatuh ke `<body>`.
 */
export function BreadcrumbWilayah({ chip }: BreadcrumbWilayahProps) {
  const wadahRef = useRef<HTMLDivElement>(null);
  const tombolHapusRef = useRef<Partial<Record<TingkatWilayah, HTMLButtonElement | null>>>({});
  const cacahSebelumnyaRef = useRef(chip.length);

  useEffect(() => {
    if (chip.length < cacahSebelumnyaRef.current) {
      const terakhir = chip[chip.length - 1];
      if (terakhir) tombolHapusRef.current[terakhir.tingkat]?.focus();
      else wadahRef.current?.focus();
    }
    cacahSebelumnyaRef.current = chip.length;
  }, [chip]);

  if (chip.length === 0) return <div ref={wadahRef} tabIndex={-1} />;

  return (
    <div ref={wadahRef} className="flex flex-wrap items-center gap-1">
      {chip.map((c, i) => (
        <div key={c.tingkat} className="flex items-center gap-1">
          {i > 0 && <ChevronRightIcon className="size-3.5 shrink-0 text-muted" />}
          <span className="flex max-w-40 items-center gap-1 rounded-full bg-surface py-1.5 pr-1.5 pl-3 text-label text-ink">
            <span className="truncate">{c.label}</span>
            <button
              ref={(el) => {
                tombolHapusRef.current[c.tingkat] = el;
              }}
              type="button"
              onClick={c.onHapus}
              title={`Hapus ${c.label}`}
              aria-label={`Hapus ${c.label}`}
              className={`flex size-4 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink ${FOCUS_RING}`}
            >
              <CloseIcon className="size-3" />
            </button>
          </span>
        </div>
      ))}
    </div>
  );
}
