"use client";

/**
 * Satu baris tabel Pengguna: identitas akun di kiri, pemilih peran di kanan.
 * `pengguna.peran` datang dari skema sebagai `string` polos (bukan
 * `PeranBaru`) — `api/` sendiri sudah menolak peran tak dikenal lebih dulu
 * lewat validasi rute, jadi `adalahPeranBaru` di sini pertahanan di BATAS,
 * bukan keadaan yang benar-benar diharapkan terjadi. Jatuh ke `"tamu"` bila
 * gagal, supaya baris tetap punya nilai select yang sah alih-alih merender
 * opsi yang tidak ada di daftar.
 *
 * JEBAKAN SENGAJA: `galat.pesan` di baris ini ditampilkan APA ADANYA, TIDAK
 * dilewatkan `pesanGalat` seperti seluruh tempat lain di dasbor. Pemetaan
 * `pesanGalat` untuk status 403 berbunyi "Akun ini belum punya akses ke
 * fitur ini" — kalimat yang salah total untuk admin yang baru mencoba
 * menurunkan perannya sendiri lewat baris ini. Server sudah mengirim kalimat
 * yang benar untuk kasus itu ("peran sendiri tidak bisa diubah lewat endpoint
 * ini"), dan PRD app §5.7 menuntut galat `AKSI_DITOLAK` tampil apa adanya.
 * Ini satu-satunya tempat yang sengaja melewati pemetaan itu.
 */

import { useId } from "react";

import type { GalatApi } from "@/lib/api/client";
import { formatTanggal } from "@/shared/format";

import { SelectPeran } from "./select-peran";
import { adalahPeranBaru, labelAkun } from "../services/pengguna";
import type { ItemPengguna, PeranBaru } from "../types";

type BarisPenggunaProps = {
  pengguna: ItemPengguna;
  sedangKirim: boolean;
  /** Peran yang SEDANG DIKIRIM untuk baris ini, atau `undefined` bila baris
   * ini tidak sedang mengirim apa pun. Dirender sebagai nilai select selama
   * `sedangKirim` supaya select tidak melompat balik ke peran lama sepanjang
   * round-trip dan terbaca sebagai penolakan (Task 2). */
  peranSedangKirim?: PeranBaru;
  /** Galat permintaan ubah peran MILIK BARIS INI, atau `null`. */
  galat: GalatApi | null;
  onUbahPeran: (peran: PeranBaru) => void;
};

export function BarisPengguna({
  pengguna,
  sedangKirim,
  peranSedangKirim,
  galat,
  onUbahPeran,
}: BarisPenggunaProps) {
  const idSelect = useId();
  const label = labelAkun(pengguna.email);
  const peranSekarang: PeranBaru = adalahPeranBaru(pengguna.peran) ? pengguna.peran : "tamu";
  const nilaiTampil = sedangKirim && peranSedangKirim !== undefined ? peranSedangKirim : peranSekarang;

  const inisial = (label[0] ?? "U").toUpperCase();

  return (
    <div className="group flex flex-col gap-3 p-3 rounded-xl transition-colors hover:bg-surface/50 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3 min-w-0">
        <div
          aria-hidden="true"
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink font-medium text-title-sm border border-hairline select-none"
        >
          {inisial}
        </div>
        <div className="min-w-0">
          <p className="text-title-sm font-medium text-ink truncate">{label}</p>
          <p className="text-micro text-muted">
            Dibuat {formatTanggal(pengguna.dibuat_pada)} · Diubah {formatTanggal(pengguna.diubah_pada)}
          </p>
          {galat && (
            <p role="alert" className="mt-1 flex items-center gap-1.5 text-micro text-critical">
              <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
              {galat.pesan}
              <span className="text-micro text-muted">({galat.kode})</span>
            </p>
          )}
        </div>
      </div>

      <div className="w-full shrink-0 md:w-48">
        <label htmlFor={idSelect} className="sr-only">
          Peran {label}
        </label>
        <SelectPeran id={idSelect} nilai={nilaiTampil} sedangKirim={sedangKirim} onUbah={onUbahPeran} />
      </div>
    </div>
  );
}
