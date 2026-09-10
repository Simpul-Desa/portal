"use client";

/**
 * Seksi ke-9 Kartu Ekonomi Desa: daftar Berita Desa satu desa. Seksi TETAP
 * dirender berjudul pada keadaan muat, kosong, dan galat — menghilangkannya
 * membuat pengguna mengira fiturnya tidak ada untuk perannya. "Tampilkan
 * semua"/"Ringkas lagi" hanya membuka/menutup apa yang sudah ada di cache
 * (keputusan user 10 September 2026) — nol permintaan baru.
 */

import { useId, useState } from "react";

import { RotateCcw } from "lucide-react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatAngka } from "@/shared/format";

import { BarisBerita } from "./baris-berita";
import { useBerita } from "../hooks/queries";
import { catatanTerpotong, labelTombol, PRATINJAU_BERITA } from "../services/berita";

export function SeksiBerita({ iddesa }: { iddesa: string }) {
  // Task 11: `isPending` — `iddesa` prop WAJIB (bukan opsional), jadi
  // `useBerita(iddesa)` (`enabled: Boolean(iddesa)`) SELALU `enabled`; tidak
  // ada jebakan query nonaktif macet `isPending`.
  const { data, isPending, isPaused, isError, error, refetch } = useBerita(iddesa);
  const [terbuka, setTerbuka] = useState(false);
  const idDaftar = useId();
  const catatan = data ? catatanTerpotong(data.total, data.daftar.length) : null;
  const keadaan = pilihKeadaan({
    isPending,
    isPaused,
    isError,
    kosong: Boolean(data && data.daftar.length === 0),
  });

  // Task 4 (status region): cacah baris berita yang termuat, dan keadaan
  // kosongnya.
  const kalimatStatus =
    keadaan === "kosong"
      ? "Belum ada berita untuk desa ini."
      : keadaan === "isi" && data
        ? `${formatAngka(data.daftar.length)} berita desa dimuat.`
        : "";

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Berita Desa</h3>
      <p className="mt-1 text-micro text-muted">
        Dikumpulkan otomatis, ringkasannya ditulis mesin. Periksa sumber dan tanggalnya sebelum
        dipakai.
      </p>

      <p role="status" aria-live="polite" className="sr-only">
        {kalimatStatus}
      </p>

      {keadaan === "muat" && (
        <div className="mt-4">
          <KerangkaMuat tinggi="h-16" baris={2} />
        </div>
      )}

      {keadaan === "tertunda" && (
        <div className="mt-4">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi Berita Desa belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 flex h-10 items-center gap-1.5 rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
          >
            <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
            Coba lagi
          </button>
        </div>
      )}

      {isError && (
        <div role="alert" className="mt-4">
          <p className="flex items-center gap-1.5 text-title-sm text-ink">
            <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            {pesanGalat(error).judul}
          </p>
          <p className="mt-1 text-body-md text-body">{pesanGalat(error).pesan}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              type="button"
              onClick={() => refetch()}
              className={`flex h-10 items-center gap-1.5 rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
            >
              <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
              Coba lagi
            </button>
            <span className="text-micro text-muted">{error.kode}</span>
          </div>
        </div>
      )}

      {/* Keadaan kosong dan daftar sama-sama digerbangi `daftar.length`, BUKAN
          `total`: `total` datang dari `meta` dan bisa saja tidak sinkron dengan
          halaman yang benar-benar terkirim. Yang dirender di bawah adalah
          `daftar`, jadi itu pula yang menentukan seksi ini punya isi atau
          tidak. `total` tetap dipakai untuk label tombol dan catatan kaki. */}
      {data && data.daftar.length === 0 && (
        <p className="mt-4 text-body-md text-muted">Belum ada berita untuk desa ini.</p>
      )}

      {data && data.daftar.length > 0 && (
        <>
          <div id={idDaftar} className="mt-4 divide-y divide-hairline">
            {(terbuka ? data.daftar : data.daftar.slice(0, PRATINJAU_BERITA)).map((item) => (
              <BarisBerita key={item.id} item={item} />
            ))}
          </div>

          {data.daftar.length > PRATINJAU_BERITA && (
            <button
              type="button"
              onClick={() => setTerbuka((v) => !v)}
              aria-expanded={terbuka}
              aria-controls={idDaftar}
              className={`mt-3 flex h-10 items-center rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
            >
              {labelTombol(data.total, data.daftar.length, terbuka)}
            </button>
          )}

          {terbuka && catatan && <p className="mt-2 text-micro text-muted">{catatan}</p>}
        </>
      )}
    </section>
  );
}
