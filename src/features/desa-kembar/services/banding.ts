/**
 * Perakit baris banding acuan vs kembar (Task 8) dari dua `KartuDesa` penuh
 * (`useKartu(acuan)` + `useKartu(kembar)`, keputusan user 9 September 2026 —
 * lihat § Metadata rencana fase 5 butir 2). Modul MURNI (nol JSX, nol hook),
 * pola sama dengan `features/jalur-ekonomi/services/normalisasi.ts`.
 *
 * Dua pola nullable `KartuDesa` yang TIDAK disamakan (`features/kartu/types.ts`):
 * - `kesiapan.komponen.*` — `KosongDengan<number>`, bisa `{nilai: null, kosong}`.
 *   Dibaca lewat `kodeKosong()` (bukan `"kosong" in nilai`, yang melempar
 *   TypeError pada primitif `number`).
 * - `peta_peran.desil_*` — `number | null` polos, TANPA kode kosong.
 */

import { kodeKosong, type KartuDesa, type KosongDengan } from "@/features/kartu/types";
import { formatAngka, strip } from "@/shared/format";

import type { BarisBanding, SumbuKesiapan } from "../types";

/** Arah nilai KANAN (kembar) terhadap KIRI (acuan) — perbandingan MURNI
 * (`<`, `>`, `===`), TIDAK PERNAH pengurangan: menghitung selisih dua angka
 * domain di klien dilarang kontrak README akar. Membalik urutan argumen
 * membuat panah menunjuk arah yang salah tanpa satu pun galat — `a` SELALU
 * kiri, `b` SELALU kanan. `null` bila salah satu sisi kosong: tidak ada arah
 * antara angka dan ketiadaan. */
function arahDari(a: number | null, b: number | null): "naik" | "turun" | "sama" | null {
  if (a === null || b === null) return null;
  if (b > a) return "naik";
  if (b < a) return "turun";
  return "sama";
}

/** `null` bila `nilai` kosong-berkode; nilai numerik apa adanya bila tidak. */
function nilaiKomponen(nilai: KosongDengan<number>): number | null {
  return kodeKosong(nilai) ? null : (nilai as number);
}

/** Baris kategorikal (zona) — SELALU `arah: null`, kedua `*Kuat` `false`
 * (tidak ada "lebih kuat" antara dua kategori). */
function barisZona(kiri: KartuDesa, kanan: KartuDesa): BarisBanding {
  return {
    label: "Zona",
    kiri: kiri.peta_peran.zona,
    kanan: kanan.peta_peran.zona,
    arah: null,
    kiriKuat: false,
    kananKuat: false,
  };
}

/** Baris desil (`peta_peran.desil_sp`/`desil_sk`, `number | null` polos). */
function barisDesil(label: string, kiri: number | null, kanan: number | null): BarisBanding {
  const arah = arahDari(kiri, kanan);
  return {
    label,
    kiri: kiri === null ? strip(null) : `Desil ${formatAngka(kiri)} dari 10`,
    kanan: kanan === null ? strip(null) : `Desil ${formatAngka(kanan)} dari 10`,
    arah,
    kiriKuat: arah === "turun",
    kananKuat: arah === "naik",
  };
}

/** Baris komponen Skor Kesiapan (`KosongDengan<number>`). */
function barisKomponen(
  label: string,
  kiri: KosongDengan<number>,
  kanan: KosongDengan<number>,
): BarisBanding {
  const nilaiKiri = nilaiKomponen(kiri);
  const nilaiKanan = nilaiKomponen(kanan);
  const arah = arahDari(nilaiKiri, nilaiKanan);
  return {
    label,
    kiri: nilaiKiri === null ? strip(null) : formatAngka(nilaiKiri),
    kanan: nilaiKanan === null ? strip(null) : formatAngka(nilaiKanan),
    arah,
    kiriKuat: arah === "turun",
    kananKuat: arah === "naik",
  };
}

/**
 * Tujuh baris banding, urutan TETAP: Zona, Skor Potensi, Skor Kesiapan, lalu
 * empat komponen Skor Kesiapan (label GLOSSARY persis, sama yang dipakai
 * `seksi-kesiapan.tsx`). Seluruh metrik yang dibandingkan berarah "tinggi
 * lebih baik" — jangan menambah metrik berarah terbalik (mis. sentralitas
 * dalam menit) ke daftar ini tanpa kolom arah tersendiri.
 */
export function barisBanding(kiri: KartuDesa, kanan: KartuDesa): BarisBanding[] {
  return [
    barisZona(kiri, kanan),
    barisDesil("Skor Potensi", kiri.peta_peran.desil_sp, kanan.peta_peran.desil_sp),
    barisDesil("Skor Kesiapan", kiri.peta_peran.desil_sk, kanan.peta_peran.desil_sk),
    barisKomponen(
      "Indeks Desa Membangun",
      kiri.kesiapan.komponen.SK_INDEKS,
      kanan.kesiapan.komponen.SK_INDEKS,
    ),
    barisKomponen(
      "Kelembagaan Ekonomi",
      kiri.kesiapan.komponen.SK_KELEMBAGAAN,
      kanan.kesiapan.komponen.SK_KELEMBAGAAN,
    ),
    barisKomponen(
      "Amenitas & Keuangan",
      kiri.kesiapan.komponen.SK_AMENITAS,
      kanan.kesiapan.komponen.SK_AMENITAS,
    ),
    barisKomponen(
      "Konektivitas",
      kiri.kesiapan.komponen.SK_KONEKTIVITAS,
      kanan.kesiapan.komponen.SK_KONEKTIVITAS,
    ),
  ];
}

/** `peta_peran.sk` (Skor Kesiapan sungguhan — GLOSSARY § Skor dan ambang Peta
 * Peran: rerata berbobot empat komponen, 0–100 dalam kabupaten) kedua desa
 * untuk dua `RampMeter` bersumbu sama di `BandingKembar`. `number | null`
 * POLOS (bukan kosong-berkode) — `null` berarti Belum Terpetakan, dibaca apa
 * adanya TANPA `nilaiKomponen`/`kodeKosong` (pola itu hanya untuk
 * `kesiapan.komponen.*`, lihat docstring atas berkas ini). */
export function sumbuKesiapan(kiri: KartuDesa, kanan: KartuDesa): SumbuKesiapan {
  return {
    kiri: kiri.peta_peran.sk,
    kanan: kanan.peta_peran.sk,
  };
}
