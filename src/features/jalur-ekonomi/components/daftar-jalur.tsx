"use client";

import { useState } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Pagination } from "@/shared/components/pagination";
import { formatAngka } from "@/shared/format";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useJalurDaftar } from "../hooks/queries";

type WilayahState = ReturnType<typeof useWilayahParams>;

type DaftarJalurProps = {
  varian: Varian;
  /** Kabupaten aktif — bila diisi, judul dan baris tidak mengulang `Kab.`
   * pada tiap baris (seluruh baris satu kabupaten yang sama). */
  kab?: string;
  /** `id_jalur` sedang terpilih (`?jalur=`) — menandai baris aktif. */
  jalurAktif?: string;
  onPilih: WilayahState["pilihJalur"];
};

const JUMLAH_KERANGKA = 4;

const KELAS_BARIS =
  `flex w-full flex-col items-start gap-0.5 rounded-control px-3 py-2 text-left hover:bg-inset ${FOCUS_RING}`;

/**
 * Petakan `label` teknis satu baris ke kalimat Indonesia. `komoditas` dan
 * `wisata` sudah membawa label layak-tampil (nama komoditas, kategori
 * Jadesta) — dikembalikan apa adanya. `cold-storage` dengan `label` di luar
 * dua nilai yang dikenal (mis. artefak berganti nilai teknisnya) jatuh ke
 * fallback netral "Cold storage" — BUKAN `label` mentah, supaya string
 * teknis tidak pernah bocor ke layar (L4).
 */
function labelTampil(varian: Varian, label: string): string {
  if (varian === "gudang-kopdes") return "Gudang Kopdes";
  if (varian === "cold-storage") {
    if (label === "cs-baru") return "Cold storage baru (usulan model)";
    if (label === "cs-eksisting") return "Cold storage eksisting";
    return "Cold storage";
  }
  return label;
}

/**
 * Daftar jalur berpaginasi satu varian (Task 31) — `hal` state LOKAL di
 * sini dan query (`useJalurDaftar`) dipanggil LANGSUNG di sini, BUKAN
 * diterima lewat props (M2, pola sama seperti `DaftarDesa` Peta Peran):
 * sebelumnya `hal` dan query primer badan panel hidup di komponen yang
 * SAMA, sehingga `isLoading` menggerbang seluruh badan (`ParameterVarian`,
 * `DetailJalur`, daftar) — berganti halaman membuat detail jalur terpilih
 * ikut lenyap sesaat. Dengan query di sini, berganti halaman HANYA memuat
 * ulang daftar ini (skeleton kecil di bawah), `ParameterVarian`/
 * `DetailJalur` di `panel.tsx` tidak tersentuh (query primer panel tetap
 * `hal: 1`, cache TanStack berbeda dari `hal` di sini kecuali sedang di
 * halaman 1 — pada halaman 1 keduanya berbagi cache, tidak ada permintaan
 * ganda).
 *
 * Judul dari `meta.total`; bila `meta` tidak ada (amplop tanpa paginasi),
 * `total` jatuh ke `null` — BUKAN `baris.length` (M11, panjang satu halaman
 * bukan cacah domain) — dan judul tampil TANPA angka, pager pun tidak
 * dirender (tidak ada `total`/`batas` untuk menghitung jumlah halaman).
 * Klik baris mengisi `?jalur=` DAN `?kab=` sekali jalan dari `baris.idkab`
 * (satu jalur selalu hidup di satu kabupaten, dan `?kab=` itulah yang
 * membuka geo sumber garis di peta). Kembali `null` bila `total` nol — panel
 * (Task 33) sudah merender kartu keadaan kosong berketerangan untuk kasus
 * itu SEBELUM komponen ini sempat dipanggil, jadi `null` di sini murni jaga
 * jaga (query di halaman lanjut bisa saja kembali kosong sendiri).
 */
export function DaftarJalur({ varian, kab, jalurAktif, onPilih }: DaftarJalurProps) {
  const [hal, setHal] = useState(1);
  const { data, isLoading, isError, error } = useJalurDaftar({ varian, kab, hal, aktif: true });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: JUMLAH_KERANGKA }, (_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-card bg-surface" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <p className="px-1 py-2 text-label text-muted">{pesanGalat(error).judul}</p>;
  }
  if (!data) return null;

  const { data: baris, meta } = data;
  const total = meta?.total ?? null;
  const batas = meta?.batas ?? null;

  if (total === 0) return null;

  const nmkab = kab ? baris[0]?.nmkab : undefined;
  const judul = total === null ? "Jalur Ekonomi" : `${formatAngka(total)} jalur`;

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">
        {judul}
        {nmkab ? ` di Kab. ${nmkab}` : ""}
      </h3>

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {baris.map((b) => {
          const terpilih = b.id_jalur === jalurAktif;
          return (
            <button
              key={b.id_jalur}
              type="button"
              onClick={() => onPilih(b.id_jalur, { kab: b.idkab })}
              aria-current={terpilih || undefined}
              className={`${KELAS_BARIS} ${terpilih ? "bg-inset" : ""}`}
            >
              <span className="text-title-sm text-ink">{b.poros.nmdesa}</span>
              <span className="text-label text-muted">
                {labelTampil(varian, b.label)} · {formatAngka(b.n_anggota)} desa
                {!kab && ` · Kab. ${b.nmkab}`}
              </span>
            </button>
          );
        })}
      </div>

      {total !== null && batas !== null && (
        <div className="mt-4">
          <Pagination hal={hal} total={total} batas={batas} onHal={setHal} />
        </div>
      )}
    </section>
  );
}
