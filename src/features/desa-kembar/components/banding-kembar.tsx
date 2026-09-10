"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

import type { KartuDesa } from "@/features/kartu/types";
import { RampMeter } from "@/shared/components/charts";
import { formatPersen, strip } from "@/shared/format";

import { barisBanding, sumbuKesiapan } from "../services/banding";
import type { BarisBanding } from "../types";

type BandingKembarProps = {
  /** Desa acuan (kolom kiri). */
  kiri: KartuDesa;
  /** Desa kembar terpilih (kolom kanan). */
  kanan: KartuDesa;
  /** Kemiripan kembar terhadap acuan — 0–100 (GLOSSARY § Kemiripan Desa
   * Kembar), dibaca dari baris tetangga terpilih, BUKAN dihitung ulang di
   * sini. `null` bila `?kembar=` menunjuk desa di luar 12 tetangga
   * (deep-link ke desa yang tidak sedang menjadi tetangga acuan ini). */
  persen: number | null;
  /** `true` bila pasangan ini LINTAS kabupaten — hanya bisa dicapai dengan
   * menyunting `?kembar=` tangan (12 tetangga Desa Kembar sungguhan SELALU
   * satu kabupaten dengan acuannya, GLOSSARY § Kemiripan Desa Kembar).
   * Dihitung `DesaKembarPanel` (`kembar.slice(0, 4) !== kab`, sama persis
   * dengan baris keterangan peta), diteruskan apa adanya — BUKAN dihitung
   * ulang di sini. Setiap metrik (Zona, desil, komponen, Skor Kesiapan)
   * relatif SATU kabupaten, jadi menyandingkan keduanya lintas kabupaten
   * menyesatkan bila digambar sebagai perbandingan. Saat `true`: blok dua
   * `RampMeter` tidak dirender (review ronde 2 fase 5, B3), dan seluruh
   * baris metrik kehilangan panah arah serta pembedaan kuat/lemah — nilai
   * disandingkan sebagai fakta, bukan diklaim sebagai perbandingan (review
   * ronde 3 fase 5, R1). Angka baris itu sendiri TETAP tampil apa adanya. */
  lintasKabupaten: boolean;
};

/**
 * `metric-md` (24px) dirancang untuk figur telanjang, bukan prosa — string
 * berkata lebih dari satu sudah meluber di panel sempit. Awalnya aturan ini
 * hanya dipasang untuk baris Zona ("Belum Terpetakan" dkk.); diperluas di
 * sini (fase 9 Task 16) karena "Desil 7 dari 10" (baris Skor Potensi/Skor
 * Kesiapan, `barisDesil` di `services/banding.ts`) SAMA-SAMA prosa, bukan
 * figur — frasa 15 karakter itu meluber duluan sebelum kolom label kebagian
 * ruang di `grid-cols-[1fr_auto_20px_auto]` pada 375px. Dibedakan lewat
 * ada/tidaknya spasi: `formatAngka`/`strip(null)` (baris empat komponen
 * Skor Kesiapan) tidak pernah menyisipkan spasi, sementara setiap frasa
 * domain di berkas ini (nama zona, "Desil N dari 10") selalu berkata lebih
 * dari satu.
 */
function nilaiProsa(nilai: string): boolean {
  return nilai.includes(" ");
}

/**
 * Tanda arah nilai KANAN terhadap KIRI — glyph SAJA (DESIGN.md § Desa
 * Kembar: "a direction mark, not a figure"), tanpa angka selisih (aritmetika
 * domain di klien dilarang kontrak README akar). `aria-hidden` pada glyph,
 * diiringi teks `sr-only` supaya pembaca layar tidak kehilangan informasinya.
 * `"sama"` dan `null` tidak menggambar apa pun (kategorikal, atau salah satu
 * sisi kosong).
 */
function TandaArah({ arah }: { arah: BarisBanding["arah"] }) {
  if (arah === "naik") {
    return (
      <span className="flex items-center justify-center text-positive">
        <ChevronUp aria-hidden="true" size={16} strokeWidth={1.5} />
        <span className="sr-only">lebih tinggi</span>
      </span>
    );
  }
  if (arah === "turun") {
    return (
      <span className="flex items-center justify-center text-critical">
        <ChevronDown aria-hidden="true" size={16} strokeWidth={1.5} />
        <span className="sr-only">lebih rendah</span>
      </span>
    );
  }
  return null;
}

/**
 * Kartu banding `twin-compare` (Task 12, DESIGN.md § Desa Kembar). Baris
 * metrik dari `barisBanding()` (`services/banding.ts`) — warna NILAI itu
 * sendiri `ink`/`body` (yang lebih kuat vs yang lebih lemah) HANYA untuk
 * pasangan dalam-satu-kabupaten; lintas kabupaten kedua sisi memakai
 * penekanan yang sama dan panahnya tidak digambar (review ronde 3 fase 5,
 * R1 — arah dan kuat/lemah tidak berarti apa-apa lintas kabupaten). Warna
 * status (`positive`/`critical`) HANYA mewarnai glyph panah (DESIGN.md §
 * Status colors as text) — tidak pernah teks angkanya.
 */
export function BandingKembar({ kiri, kanan, persen, lintasKabupaten }: BandingKembarProps) {
  const baris = barisBanding(kiri, kanan);
  const sumbu = sumbuKesiapan(kiri, kanan);

  return (
    <section className="rounded-card bg-surface p-5">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="truncate text-title-sm text-ink">{kiri.identitas.nama}</p>
          <p className="truncate text-label text-muted">Kec. {kiri.identitas.kecamatan}</p>
          <p className="mt-1 text-label text-muted">desa acuan</p>
        </div>
        <div>
          <p className="truncate text-title-sm text-ink">{kanan.identitas.nama}</p>
          <p className="truncate text-label text-muted">Kec. {kanan.identitas.kecamatan}</p>
          <p className="mt-1 text-label text-muted">
            kemiripan {persen === null ? strip(null) : formatPersen(persen)}
          </p>
        </div>
      </div>

      {lintasKabupaten && (
        // Review ronde 3 fase 5, R1 (MEDIUM): kalimat ini dulu hanya
        // menyertai blok dua `RampMeter` di bawah, padahal baris metrik DI
        // ATASNYA (Zona, desil, komponen) sama-sama relatif kabupaten
        // masing-masing dan tetap menggambar panah arah — dua pernyataan
        // yang saling meniadakan atas metrik yang sama. Dipindah ke sini
        // supaya berlaku untuk SELURUH kartu, bukan cuma posisi meter.
        <p className="mt-3 text-micro text-muted">
          Kedua desa berasal dari kabupaten berbeda. Semua angka di bawah dihitung relatif terhadap
          kabupaten masing-masing, jadi disandingkan sebagai fakta, bukan untuk dibandingkan
          langsung.
        </p>
      )}

      <div className="mt-4 flex flex-col divide-y divide-hairline">
        {baris.map((b) => {
          // Prosa (Zona, "Desil N dari 10") turun ke `body-md`; figur
          // telanjang (empat komponen Skor Kesiapan) tetap `metric-md` —
          // lihat `nilaiProsa` di atas.
          const ukuranNilai = nilaiProsa(b.kiri) || nilaiProsa(b.kanan) ? "text-body-md" : "text-metric-md";
          // Review ronde 3 fase 5, R1 (MEDIUM): pasangan LINTAS kabupaten
          // tidak pernah kuat/lemah satu sama lain (desil dan RampMeter di
          // bawah relatif kabupaten masing-masing, arahnya tidak berarti
          // apa-apa lintas kabupaten) — kedua sisi dipaksa penekanan yang
          // sama, memakai idiom yang sama seperti baris Zona (kategorikal,
          // `kiriKuat`/`kananKuat` selalu `false`) di atas.
          const kiriKuat = !lintasKabupaten && b.kiriKuat;
          const kananKuat = !lintasKabupaten && b.kananKuat;
          return (
            <div key={b.label} className="grid grid-cols-[1fr_auto_20px_auto] items-center gap-2 py-2">
              <span className="text-label text-muted">{b.label}</span>
              <span
                className={`min-w-0 break-words text-right ${ukuranNilai} ${kiriKuat ? "text-ink" : "text-body"}`}
              >
                {b.kiri}
              </span>
              {!lintasKabupaten && <TandaArah arah={b.arah} />}
              <span
                className={`min-w-0 break-words text-right ${ukuranNilai} ${kananKuat ? "text-ink" : "text-body"}`}
              >
                {b.kanan}
              </span>
            </div>
          );
        })}
      </div>

      {!lintasKabupaten && (
        <div className="mt-4 border-t border-hairline pt-4">
          <p className="text-label text-muted">Skor Kesiapan kedua desa</p>
          {/* Review ronde 2 fase 5, B3 (MEDIUM): TIDAK merender blok dua
              `RampMeter` sama sekali untuk pasangan lintas kabupaten — posisi
              meter (relatif kabupaten masing-masing) bisa berlawanan arah
              dengan desil di atas (baris desil TETAP tampil, tidak disentuh).
              Review ronde 3 fase 5, R1 (MEDIUM): kalimat keterangannya pindah
              ke atas kartu (berlaku untuk seluruh baris, bukan cuma blok
              ini), jadi seluruh bagian ini (label + meter) dilewati untuk
              lintas kabupaten alih-alih menyisakan label tanpa isi. */}
          <div className="mt-3 flex flex-col gap-4">
            {sumbu.kiri === null ? (
              <div>
                <p className="text-right text-label text-body">{kiri.identitas.nama}</p>
                <p className="mt-2 text-body-md text-ink">{strip(null)}</p>
              </div>
            ) : (
              <RampMeter
                nilai={sumbu.kiri / 100}
                label={kiri.identitas.nama}
                ariaLabel={`Skor Kesiapan ${kiri.identitas.nama}: ${sumbu.kiri} dari 100`}
              />
            )}
            {sumbu.kanan === null ? (
              <div>
                <p className="text-right text-label text-body">{kanan.identitas.nama}</p>
                <p className="mt-2 text-body-md text-ink">{strip(null)}</p>
              </div>
            ) : (
              // `ariaLabel` (fase 9, temuan A15): tanpa itu skor hanya hidup
              // sebagai POSISI penanda di dalam dua div bermask — nol teks —
              // jadi komparasi Skor Kesiapan, klaim utama seksi ini, tidak
              // terlihat teknologi bantu. `label` hanya memasok nama desanya.
              <RampMeter
                nilai={sumbu.kanan / 100}
                label={kanan.identitas.nama}
                ariaLabel={`Skor Kesiapan ${kanan.identitas.nama}: ${sumbu.kanan} dari 100`}
              />
            )}
          </div>
        </div>
      )}
    </section>
  );
}
