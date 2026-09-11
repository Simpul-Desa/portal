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

import { AlertCircle } from "lucide-react";
import { Marker, MarkerIcon, MarkerContent } from "@/shared/components/ui/marker";

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
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        {blok.map((b, i) =>
          b.jenis === "paragraf" ? (
            <p key={i} className="text-micro text-ink leading-relaxed">
              {b.teks}
            </p>
          ) : (
            <ul key={i} className="flex flex-col gap-1.5 ml-1">
              {b.butir.map((item, j) => (
                <li key={j} className="flex gap-2 text-micro text-ink leading-relaxed">
                  <span aria-hidden="true" className="text-muted mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          ),
        )}
      </div>

      {kalimat.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          {kalimat.map((k) => (
            <Marker key={k} className="text-caution bg-caution/10 px-3 py-2 rounded-md">
              <MarkerIcon>
                <AlertCircle />
              </MarkerIcon>
              <MarkerContent className="text-micro font-medium">{k}</MarkerContent>
            </Marker>
          ))}
        </div>
      )}

      {jejak.length > 0 && <JejakFungsi jejak={jejak} kodeAsing={kodeAsing} onBuka={onBukaTujuan} />}
    </div>
  );
}
