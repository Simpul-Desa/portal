"use client";

/**
 * Daftar giliran percakapan Asisten Desa (Task 18). Giliran user cukup
 * inline di sini — satu blok kecil, tidak perlu berkas sendiri; giliran
 * model lewat `GiliranAsisten`. Baris "sedang menjawab" dan `BlokGalat`
 * duduk di ekor daftar.
 *
 * `role="log"` dipasang pada WADAH yang sudah ada saat panel dibuka
 * (Task 18 GOTCHA 2) — bukan pada giliran baru itu sendiri, supaya region
 * yang lahir bersama isinya tetap diumumkan pembaca layar. `role="log"`
 * menggantikan `aria-live="polite"` polos (Task 23/A15): keduanya sama-sama
 * mengumumkan giliran baru, tapi `log` juga nama peran yang benar untuk
 * transkrip yang hanya bertambah, dan `tabIndex={0}` membuat wadah ini bisa
 * dituju keyboard walau isinya tidak punya elemen fokusable (mis. jawaban
 * tanpa `Sumber jawaban`).
 *
 * Kunci React memakai INDEKS array (Task 18 GOTCHA 1): daftar ini HANYA
 * bertambah di ujung (tidak pernah disisipi, diurut ulang, atau dihapus
 * satuan), jadi indeks stabil di sini.
 */

import { useEffect, useRef } from "react";

import type { GalatApi } from "@/lib/api/client";

import type { Giliran, TujuanJejak } from "../types";
import { BlokGalat } from "./blok-galat";
import { GiliranAsisten } from "./giliran-asisten";

type DaftarGiliranProps = {
  riwayat: readonly Giliran[];
  sedangMenjawab: boolean;
  galat: GalatApi | null;
  onKirimUlang: () => void;
  onBukaTujuan: (tujuan: TujuanJejak) => void;
};

export function DaftarGiliran({
  riwayat,
  sedangMenjawab,
  galat,
  onKirimUlang,
  onBukaTujuan,
}: DaftarGiliranProps) {
  const akhirRef = useRef<HTMLDivElement>(null);

  // Auto-scroll HANYA saat cacah giliran berubah (Task 18 GOTCHA 3) — bukan
  // tiap render, kalau tidak menggulir ke atas untuk membaca jawaban lama
  // akan dilempar balik ke bawah setiap kali panel merender ulang.
  useEffect(() => {
    akhirRef.current?.scrollIntoView({ block: "end" });
  }, [riwayat.length]);

  return (
    <div
      role="log"
      aria-label="Percakapan Asisten Desa"
      aria-busy={sedangMenjawab}
      tabIndex={0}
      className="flex flex-1 flex-col gap-4 overflow-y-auto"
    >
      {riwayat.map((g, i) =>
        g.role === "user" ? (
          <div key={i} className="ml-auto max-w-[85%] rounded-inset bg-inset px-3 py-2 text-body-md text-ink">
            {g.isi}
          </div>
        ) : (
          <GiliranAsisten key={i} giliran={g} onBukaTujuan={onBukaTujuan} />
        ),
      )}

      {sedangMenjawab && <p className="text-micro text-muted">Asisten sedang menjawab…</p>}

      {!sedangMenjawab && galat && <BlokGalat galat={galat} onKirimUlang={onKirimUlang} />}

      <div ref={akhirRef} />
    </div>
  );
}
