"use client";

/**
 * Keadaan kosong Asisten Desa (Task 22, DESIGN.md § Asisten Desa "Empty
 * state") — ajakan bertanya + kejujuran bahwa percakapan hilang saat halaman
 * dimuat ulang (PRD app §5.4, chat stateless) + tiga contoh pertanyaan
 * sebagai baris-tombol. Klik mengisi KOMPOSER (lewat `onPilihContoh`), tidak
 * langsung mengirim — pengguna harus bisa menyunting dulu.
 *
 * Contoh TIDAK menyebut angka hasil model (skor, cacah desa) — angka hidup
 * di artefak `data/`, tidak pernah ditulis literal di kode (Task 22 GOTCHA
 * 1, kontrak README akar).
 */

import { ChevronRight } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

/** Contoh menyebut wilayah yang BENAR ada di lima provinsi percontohan
 * (`data/README.md` § Cakupan). Contoh pertama sempat menyebut Kabupaten
 * Kediri — Jawa Timur, di luar cakupan — dan menuntun pembaca ke wilayah
 * yang tidak punya data sama sekali. Nama desa disertai kabupatennya, karena
 * nama desa berulang di banyak kabupaten. */
const CONTOH_PERTANYAAN = [
  "Desa mana di Kabupaten Tanggamus yang masuk Zona Poros?",
  "Apa isi Kartu Ekonomi Desa Sukarame di Kabupaten Tanggamus?",
  "Bagaimana Skor Kesiapan Ekonomi Desa dihitung?",
];

// Perbaikan 7 (review Opus): cacat sama dengan `jejak-fungsi.tsx` — blok
// pembungkus tiga contoh SUDAH `bg-inset`, jadi `hover:bg-inset` tidak
// berefek apa pun. Solusi disamakan persis (garis 1px `line-strong` lewat
// `outline`, bukan `bg`) supaya kedua berkas tidak berdrift.
const KELAS_BARIS =
  `flex w-full items-center justify-between gap-3 rounded-control px-3 py-2 text-left hover:outline-solid hover:outline-1 hover:outline-line-strong ${FOCUS_RING}`;

type KeadaanKosongProps = {
  onPilihContoh: (teks: string) => void;
};

export function KeadaanKosong({ onPilihContoh }: KeadaanKosongProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-md text-ink">
        Tanya apa saja tentang data SIMPUL DESA. Percakapan ini hilang saat halaman dimuat ulang.
      </p>

      <div className="flex flex-col divide-y divide-hairline rounded-inset bg-inset p-2">
        {CONTOH_PERTANYAAN.map((teks) => (
          <button key={teks} type="button" onClick={() => onPilihContoh(teks)} className={KELAS_BARIS}>
            <span className="text-body-md text-ink">{teks}</span>
            <ChevronRight aria-hidden="true" size={18} strokeWidth={1.5} className="shrink-0 text-muted" />
          </button>
        ))}
      </div>
    </div>
  );
}
