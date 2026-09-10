"use client";

/**
 * Daftar desa terpilih untuk aksi admin (dipakai kartu Segarkan Berita).
 * Pencarian menambah, chip membuang. Chip di sini BUKAN `ChipFilter` —
 * ia token yang bisa dibuang, bukan penyaring daftar — jadi TANPA keadaan
 * aktif dan TANPA `aria-pressed`: `aria-pressed` mengumumkan ke pembaca
 * layar ada keadaan aktif/lepas yang bolak-balik, padahal chip ini cuma
 * satu keadaan (ada, sampai dibuang).
 *
 * Penyerahan fokus saat chip dibuang (Task 9b): membuang chip menghancurkan
 * tombol ✕ yang sedang fokus, dan tanpa penyerahan eksplisit fokus jatuh ke
 * `<body>`. `handleHapus` memindah fokus DULU — ke tombol ✕ chip tetangga
 * (yang tetap ada di DOM, tidak ikut dilepas render ini) atau ke field cari
 * bila daftar jadi kosong — BARU memanggil `onHapus`, karena kedua target
 * itu SUDAH terpasang di render sebelumnya; tidak perlu menunggu commit
 * berikutnya lewat efek.
 */

import { useRef } from "react";

import { X } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

import { CariDesaAdmin } from "./cari-desa-admin";
import { labelTerpilih, MAKS_DESA_SEGARKAN, type DesaTerpilih } from "../services/segarkan";

type PemilihDesaProps = {
  terpilih: readonly DesaTerpilih[];
  onTambah: (desa: DesaTerpilih) => void;
  onHapus: (iddesa: string) => void;
};

const idTombolBuang = (iddesa: string) => `pemilih-desa-buang-${iddesa}`;

export function PemilihDesa({ terpilih, onTambah, onHapus }: PemilihDesaProps) {
  const cariRef = useRef<HTMLInputElement>(null);

  function handleHapus(iddesa: string) {
    const indeks = terpilih.findIndex((d) => d.iddesa === iddesa);
    const tetangga = terpilih[indeks + 1] ?? terpilih[indeks - 1];
    if (tetangga) {
      document.getElementById(idTombolBuang(tetangga.iddesa))?.focus();
    } else {
      cariRef.current?.focus();
    }
    onHapus(iddesa);
  }

  return (
    <div>
      <CariDesaAdmin
        ref={cariRef}
        label="Cari desa"
        placeholder="Ketik nama desa…"
        onPilih={(hasil) => onTambah({ iddesa: hasil.iddesa, nmdesa: hasil.nmdesa, nmkec: hasil.nmkec })}
      />

      <p className="mt-3 text-micro text-muted">{labelTerpilih(terpilih.length)}</p>

      {terpilih.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {terpilih.map((d) => (
            <span
              key={d.iddesa}
              className="inline-flex h-8 items-center gap-1.5 rounded-full bg-inset px-3 text-label text-ink"
            >
              {d.nmdesa}
              <button
                type="button"
                id={idTombolBuang(d.iddesa)}
                aria-label={`Buang ${d.nmdesa} dari daftar`}
                onClick={() => handleHapus(d.iddesa)}
                className={`text-muted hover:text-ink ${FOCUS_RING}`}
              >
                <X size={16} strokeWidth={1.5} aria-hidden="true" />
              </button>
            </span>
          ))}
        </div>
      )}

      {terpilih.length >= MAKS_DESA_SEGARKAN && (
        <p className="mt-2 text-micro text-muted">Batas 50 desa per penyegaran sudah tercapai.</p>
      )}
    </div>
  );
}
