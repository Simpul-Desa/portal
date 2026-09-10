import { formatAngka, strip } from "@/shared/format";

import { kodeKosong, type KartuKesiapan } from "../types";

type SelKesiapan = { label: string; nilai: KartuKesiapan["komponen"][keyof KartuKesiapan["komponen"]] };

/** Satu sel `card-quadrant` — label di atas, `metric-md` di bawah, kode kosong
 * kecil kalau `kosong`. `kodeKosong()` dipakai (bukan `"kosong" in nilai`
 * langsung) karena `nilai` bisa primitif `number` — operator `in` pada
 * primitif melempar TypeError saat runtime. */
function Sel({ label, nilai, className }: SelKesiapan & { className: string }) {
  const kode = kodeKosong(nilai);
  return (
    <div className={className}>
      <p className="text-label text-muted">{label}</p>
      <p className="mt-2 text-metric-md text-ink">{kode ? strip(null) : formatAngka(nilai as number)}</p>
      {kode && <p className="mt-1 text-micro text-muted">{kode}</p>}
    </div>
  );
}

/**
 * `card-quadrant` (Task 24, seksi 5) — 4 komponen Skor Kesiapan (GLOSSARY:
 * Indeks Desa Membangun, kelembagaan ekonomi, amenitas & keuangan,
 * konektivitas). Silang hairline digambar lewat border kanan/bawah pada 3
 * dari 4 sel (bukan `divide-x`+`divide-y` — pada grid 2 kolom keduanya salah
 * menaruh garis horizontal di dalam baris pertama, bukan di antara baris).
 * Di bawah 768px (`md`) grid luruh ke 1×4 (DESIGN.md § Responsive Behavior,
 * fase 9 Task 15): border kanan (silang vertikal) dimatikan
 * (`border-r-0 md:border-r`) karena pada satu kolom ia melayang di tepi
 * tanpa kolom tetangga, dan sel Amenitas & Keuangan mendapat border bawah
 * tambahan (`border-b md:border-b-0`) supaya keempat sel tetap berhairline
 * penuh saat ditumpuk, bukan cuma dua dari tiga sambungan.
 */
export function SeksiKesiapan({ komponen }: { komponen: KartuKesiapan["komponen"] }) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Kesiapan</h3>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2">
        <Sel
          label="Indeks Desa Membangun"
          nilai={komponen.SK_INDEKS}
          className="border-r-0 border-b border-hairline pr-3 pb-3 md:border-r"
        />
        <Sel
          label="Kelembagaan Ekonomi"
          nilai={komponen.SK_KELEMBAGAAN}
          className="border-b border-hairline pb-3 pl-3"
        />
        <Sel
          label="Amenitas & Keuangan"
          nilai={komponen.SK_AMENITAS}
          className="border-r-0 border-b border-hairline pt-3 pr-3 pb-3 md:border-r md:border-b-0 md:pb-0"
        />
        <Sel label="Konektivitas" nilai={komponen.SK_KONEKTIVITAS} className="pt-3 pl-3" />
      </div>
    </section>
  );
}
