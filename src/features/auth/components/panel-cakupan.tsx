"use client";

/**
 * Blok cakupan gelap (Task 20) — satu-satunya blok gelap di kedua layar auth,
 * dipasang sekali di `(auth)/layout.tsx` supaya `/masuk` dan `/daftar`
 * berbagi angka yang sama. Tiga angka SELALU dari `useRingkasan()`
 * (`/api/wilayah/ringkasan`, endpoint anonim — TANPA `bertoken`), tidak
 * pernah literal di kode (kontrak README akar). `strip()` dipakai karena ia
 * sekaligus memformat angka per GLOSSARY dan menjatuhkan null/undefined ke
 * "—" tanpa pesan galat — halaman masuk tidak boleh terlihat rusak karena
 * layanan lain mati.
 *
 * Penjaga "sudah masuk → keluar dari halaman auth" TIDAK tinggal di sini:
 * ia butuh `lanjut` supaya tujuannya sama dengan tujuan form, jadi ia hidup
 * di `useAlihkanBilaMasuk` yang dipanggil kedua form. Docstring hook itu
 * menjelaskan race yang terjadi kalau tujuannya berbeda.
 */

import Image from "next/image";

import { strip } from "@/shared/format";
import { useRingkasan } from "@/shared/hooks/queries-wilayah";

type BarisAngkaProps = {
  label: string;
  nilai: number | undefined;
  isLoading: boolean;
};

function BarisAngka({ label, nilai, isLoading }: BarisAngkaProps) {
  return (
    <div className="flex flex-col gap-1">
      {isLoading ? (
        <span
          className="h-11 w-20 animate-pulse rounded-control bg-on-dark-muted/25"
          aria-hidden="true"
        />
      ) : (
        <span className="text-metric-xl">{strip(nilai)}</span>
      )}
      <span className="text-label text-on-dark-muted">{label}</span>
    </div>
  );
}

export function PanelCakupan() {
  const { data, isLoading } = useRingkasan();

  return (
    <div className="flex h-full flex-col justify-center gap-6 rounded-card bg-deep p-5 text-white">
      <div className="flex items-center gap-3">
        <Image
          src="/logo-simpul-desa.png"
          alt="Simpul Desa"
          width={44}
          height={44}
          className="h-11 w-auto shrink-0 rounded-control object-contain"
          style={{ width: "auto" }}
          priority
        />
        <div>
          <p className="text-title-md">SIMPUL DESA</p>
          <p className="mt-1 text-body-md text-on-dark-muted">
            Sistem Intelijen Potensi dan Kesiapan Ekonomi Desa
          </p>
        </div>
      </div>

      {/* <768: satu kolom (keputusan user 10 September 2026, Task 18 — angka
          cakupan adalah bukti, bukan hiasan; ditumpuk, bukan disembunyikan).
          768–1023: tiga kolom rapat. ≥1024: tetap satu baris. */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 lg:flex lg:gap-10">
        <BarisAngka label="desa" nilai={data?.n_desa} isLoading={isLoading} />
        <BarisAngka label="kabupaten" nilai={data?.n_kabupaten} isLoading={isLoading} />
        <BarisAngka label="provinsi" nilai={data?.n_provinsi} isLoading={isLoading} />
      </div>
    </div>
  );
}
