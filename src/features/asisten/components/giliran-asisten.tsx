"use client";

/**
 * Satu giliran jawaban Asisten Desa (Task 19): teks berformat
 * (`formatJawaban`) → baris peringatan tampil (`peringatanTampil`, hanya
 * `kalimat` yang dirender di sini — `kodeAsing` diteruskan ke `JejakFungsi`
 * sebagai footer blok, bukan dirender dua kali) → blok "Sumber jawaban"
 * (`JejakFungsi`) bila giliran ini punya jejak.
 *
 * Dot peringatan memakai `caution`; KATA-nya tetap `ink` (Task 19 GOTCHA) —
 * `caution` `#e8b348` mengukur 1,8:1 di atas `surface` dan DESIGN.md § Known
 * Gaps melarangnya sebagai warna teks.
 */

import { formatJawaban } from "../services/format-jawaban";
import { peringatanTampil } from "../services/peringatan";
import type { Giliran, TujuanJejak } from "../types";
import { JejakFungsi } from "./jejak-fungsi";

type GiliranAsistenProps = {
  /** Giliran `role: "model"` — pemanggil (`daftar-giliran.tsx`) hanya
   * merender komponen ini untuk giliran asisten. */
  giliran: Giliran;
  onBukaTujuan: (tujuan: TujuanJejak) => void;
};

export function GiliranAsisten({ giliran, onBukaTujuan }: GiliranAsistenProps) {
  const blok = formatJawaban(giliran.isi);
  const { kalimat, kodeAsing } = peringatanTampil(giliran.peringatan ?? []);
  const jejak = giliran.jejak ?? [];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {blok.map((b, i) =>
          b.jenis === "paragraf" ? (
            <p key={i} className="text-body-md text-ink">
              {b.teks}
            </p>
          ) : (
            <ul key={i} className="flex flex-col gap-1">
              {b.butir.map((item, j) => (
                <li key={j} className="flex gap-2 text-body-md text-ink">
                  <span aria-hidden="true">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ),
        )}
      </div>

      {kalimat.map((k) => (
        <p key={k} className="flex items-center gap-1.5 text-micro text-ink">
          <span className="size-1.5 shrink-0 rounded-full bg-caution" aria-hidden="true" />
          {k}
        </p>
      ))}

      {jejak.length > 0 && <JejakFungsi jejak={jejak} kodeAsing={kodeAsing} onBuka={onBukaTujuan} />}
    </div>
  );
}
