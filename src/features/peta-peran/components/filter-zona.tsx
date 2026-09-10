"use client";

import { ZONA_SLUG, type ZonaSlug } from "@/lib/url-state";
import { ChipFilter, ChipFilterGroup } from "@/shared/components/chip-filter";

import { NAMA_ZONA, type NamaZona, type RingkasanKab } from "../types";

/** Kelas dot `bg-map-zona-*` (token DESIGN.md § Map Overlays / `globals.css`
 * `@theme`) per nama zona — diekspor supaya `daftar-desa.tsx` (Task 23)
 * memakai dot yang sama tanpa mendefinisikan ulang petanya.
 *
 * "Belum Terpetakan" MEMBAWA ring tambahan (review M1): `map-zona-belum`
 * adalah putih tembus 75% — benar sebagai garis putus DI ATAS citra satelit,
 * tapi pada swatch 6px di atas chip `bg-inset` (#fcfcfc) nyaris tak
 * terbaca (komposit ≈ #fdfdfd di atas #fcfcfc). `ring-1 ring-inset
 * ring-line-strong` memberi swatch itu tepi yang terlihat tanpa mengubah
 * warna isinya — satu-satunya zona yang butuh perlakuan ini karena empat
 * zona lain memakai hue penuh yang sudah kontras dengan `bg-inset`. */
export const KELAS_DOT_ZONA: Record<NamaZona, string> = {
  "Zona Pemerintah": "bg-map-zona-pemerintah",
  "Zona Mitra": "bg-map-zona-mitra",
  "Zona Poros": "bg-map-zona-poros",
  "Zona Bantuan": "bg-map-zona-bantuan",
  "Belum Terpetakan": "bg-map-zona-belum ring-1 ring-inset ring-line-strong",
};

/** Slug URL → nama GLOSSARY, dibalik dari `ZONA_SLUG` (`lib/url-state.ts`) —
 * satu sumber kebenaran pemetaan, bukan tabel baru yang bisa menyimpang. */
const SLUG_DARI_ZONA = Object.fromEntries(
  Object.entries(ZONA_SLUG).map(([slug, nama]) => [nama, slug as ZonaSlug]),
) as Record<NamaZona, ZonaSlug>;

type FilterZonaProps = {
  /** Zona aktif di URL (slug) — `undefined` = tanpa filter. */
  zonaAktif?: ZonaSlug;
  /** Ringkasan kabupaten aktif, untuk cacah tiap chip. `undefined` saat
   * hanya provinsi aktif (tanpa kabupaten) — cacah TIDAK dirender (Task 21
   * GOTCHA: cacah selalu dari respons ringkasan `api/`, bukan panjang array
   * daftar berpaginasi, dan tidak ada penjumlahan lintas kabupaten). */
  ringkasan?: RingkasanKab;
  onPilih: (zona: ZonaSlug | undefined) => void;
};

/**
 * Chip zona = legenda + filter + cacah dalam satu kelompok (Task 21). Urutan
 * GLOSSARY (`NAMA_ZONA`): empat zona lalu Belum Terpetakan. Mengeklik chip
 * yang sedang aktif membuang filter (`onPilih(undefined)`).
 */
export function FilterZona({ zonaAktif, ringkasan, onPilih }: FilterZonaProps) {
  return (
    <ChipFilterGroup ariaLabel="Filter zona penanganan">
      {NAMA_ZONA.map((nama) => {
        const slug = SLUG_DARI_ZONA[nama];
        const aktif = zonaAktif === slug;

        return (
          <ChipFilter
            key={nama}
            aktif={aktif}
            onKlik={() => onPilih(aktif ? undefined : slug)}
            warnaDot={KELAS_DOT_ZONA[nama]}
            cacah={ringkasan?.zona[nama]}
          >
            {nama}
          </ChipFilter>
        );
      })}
    </ChipFilterGroup>
  );
}
