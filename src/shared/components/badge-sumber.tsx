import type { SumberDominan } from "@/features/kartu/types";

/**
 * Badge sumber Potensi Dominan (GLOSSARY § Sumber Potensi Dominan — 4 nilai,
 * teks persis nama GLOSSARY, bukan terjemahan). `heuristik-belum-teruji`
 * SENGAJA tanpa latar chip (hadir paling lemah di antara keempatnya) + label
 * "belum teruji" — mutunya "harus terbaca, bukan disamarkan", TIDAK PERNAH
 * setara `citra`. Teks tetap `text-muted` (bukan `text-faint`) supaya lolos
 * kontras — DESIGN.md: warna paling redup tidak boleh dipakai untuk teks
 * yang wajib terbaca.
 *
 * Dipromosikan dari `features/kartu/components/seksi-potensi.tsx` (Task 14)
 * ke `shared/` karena dipakai lensa Peta Peran juga (`detail-desa.tsx`).
 * `SumberDominan` TETAP didefinisikan di `features/kartu/types.ts` dan
 * diimpor di sini — tipe kartu adalah bentuk artefak, bukan milik komponen.
 */
export function BadgeSumber({ sumber }: { sumber: SumberDominan }) {
  if (sumber === "heuristik-belum-teruji") {
    return <span className="text-badge text-muted">{sumber} — belum teruji</span>;
  }
  return <span className="rounded-xs bg-inset px-2 py-1 text-badge text-ink">{sumber}</span>;
}
