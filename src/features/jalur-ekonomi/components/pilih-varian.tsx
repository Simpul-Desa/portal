"use client";

import type { Varian } from "@/lib/url-state";
import { ChipFilter, ChipFilterGroup } from "@/shared/components/chip-filter";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { VARIAN } from "../types";

type WilayahState = ReturnType<typeof useWilayahParams>;

type PilihVarianProps = {
  varian: Varian;
  onPilih: WilayahState["pilihVarian"];
};

/**
 * Chip pemilih varian Jalur Ekonomi (Task 28) — satu kelompok single-select,
 * urutan GLOSSARY § Varian Jalur Ekonomi (`types.ts` `VARIAN`). Tanpa dot
 * warna: varian bukan kategori berwarna di peta (beda dari chip zona Peta
 * Peran, yang dot-nya merangkap legenda choropleth).
 *
 * Klik pada chip yang SUDAH aktif adalah no-op (temuan review Jalur Ekonomi
 * #4a, MEDIUM) — DESIGN.md § Form Controls `chip-filter`: pengecualian jalur
 * ini TIDAK bisa dikosongkan, satu dari empat varian GLOSSARY selalu
 * terpilih, beda dari chip zona Peta Peran yang toggle-clear. Tanpa penjaga
 * ini, klik reflektif pada chip aktif tetap memanggil `pilihVarian` dengan
 * varian yang SAMA — `pilihVarian` (`use-wilayah-params.ts`) selalu membuang
 * `jalur` di URL, jadi klik yang seharusnya tidak berefek apa pun malah
 * diam-diam menghapus jalur terpilih beserta garisnya di peta.
 */
export function PilihVarian({ varian, onPilih }: PilihVarianProps) {
  return (
    <ChipFilterGroup ariaLabel="Varian Jalur Ekonomi">
      {VARIAN.map((v) => (
        <ChipFilter
          key={v.slug}
          aktif={v.slug === varian}
          onKlik={() => {
            if (v.slug !== varian) onPilih(v.slug);
          }}
        >
          {v.nama}
        </ChipFilter>
      ))}
    </ChipFilterGroup>
  );
}
