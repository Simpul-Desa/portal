"use client";

import { useState } from "react";
import { ChevronDown, ExternalLink, SlidersHorizontal } from "lucide-react";

import { DOCS_URL } from "@/core/config";
import type { Varian } from "@/lib/url-state";
import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

type ParameterVarianProps = {
  varian: Varian;
  /** `meta.parameter` dari `useJalurDaftar` — blok `parameter` berkas hasil
   * `api/`, bentuk BERBEDA per varian. `undefined`/`null` saat belum termuat. */
  parameter: Record<string, unknown> | null | undefined;
};

function angka(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function objek(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

/** GLOSSARY § Delapan tema sub-skor — enam subsektor dipakai `SUBSEKTOR` varian Komoditas. */
const NAMA_SUBSEKTOR: Record<string, string> = {
  tp: "Tanaman Pangan",
  horti: "Hortikultura",
  kebun: "Perkebunan",
  ternak: "Peternakan",
  ikan: "Perikanan Budidaya",
  hutan: "Kehutanan",
};

/**
 * Satu baris spek waktu tempuh + volume (`{t_maks, v_min, min_mutlak}`) —
 * bentuk dipakai `SUBSEKTOR` (komoditas, satu per subsektor), `GUDANG`
 * (gudang-kopdes), dan `SPEK` (cold-storage, wisata).
 */
function BarisSpek({ judul, spek }: { judul: string; spek: Record<string, unknown> }) {
  const tMaks = angka(spek.t_maks);
  const vMin = angka(spek.v_min);
  const minMutlak = angka(spek.min_mutlak);

  const bagian: string[] = [];
  if (tMaks !== null) bagian.push(`waktu tempuh maks. ${formatAngka(tMaks)} menit`);
  if (vMin !== null && minMutlak !== null) {
    bagian.push(`volume min. ${formatAngka(vMin)} (mutlak ${formatAngka(minMutlak)})`);
  } else if (vMin !== null) {
    bagian.push(`volume min. ${formatAngka(vMin)}`);
  } else if (minMutlak !== null) {
    bagian.push(`volume min. mutlak ${formatAngka(minMutlak)}`);
  }
  if (bagian.length === 0) return null;

  return (
    <div className="py-2 first:pt-1 last:pb-1">
      <div className="flex items-center">
        <p className="text-label text-muted">{judul}</p>
        <TanyaTooltip istilah={tMaks !== null ? "Waktu Tempuh" : "Volume Minimum"} />
      </div>
      <p className="text-body-md text-ink mt-0.5">{bagian.join(", ")}</p>
    </div>
  );
}

/**
 * Parameter varian aktif:
 * Default tertutup (open toggle), pengguna dapat mengklik untuk membaca selengkapnya
 * terkait batasan anggota, waktu tempuh, dan volume minimum.
 * Penjelasan rinci perhitungan model dirujuk langsung ke dokumentasi `/docs/pengolahan-data/jalur-ekonomi`.
 */
export function ParameterVarian({ parameter }: ParameterVarianProps) {
  const [terbuka, setTerbuka] = useState(false);

  if (!parameter) return null;

  const minAnggota = angka(parameter.MIN_ANGGOTA);
  const maksAnggota = angka(parameter.MAKS_ANGGOTA);

  const subsektor = objek(parameter.SUBSEKTOR);
  const entriSubsektor = Object.entries(subsektor);
  const specTunggal = objek(parameter.GUDANG ?? parameter.SPEK);
  const punyaSpecTunggal = entriSubsektor.length === 0 && Object.keys(specTunggal).length > 0;

  return (
    <section className="rounded-card bg-surface p-3 transition-colors border border-transparent hover:border-line/40">
      {/* Header Toggle */}
      <button
        type="button"
        onClick={() => setTerbuka((prev) => !prev)}
        aria-expanded={terbuka}
        aria-controls="konten-parameter-varian"
        className={`flex w-full items-center justify-between gap-2 text-left cursor-pointer rounded-control py-0.5 ${FOCUS_RING}`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-float text-muted">
            <SlidersHorizontal className="size-3.5" />
          </div>
          <div className="min-w-0">
            <p className="text-label font-medium text-ink truncate">Ketentuan & Batasan Varian</p>
            <p className="text-micro text-muted truncate">
              {minAnggota !== null && maksAnggota !== null
                ? `${formatAngka(minAnggota)}–${formatAngka(maksAnggota)} desa per jalur`
                : "Batas anggota, waktu tempuh, dan volume"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-micro text-muted hover:text-ink">
          <span className="hidden sm:inline">{terbuka ? "Sembunyikan" : "Baca selengkapnya"}</span>
          <ChevronDown
            className={`size-4 transition-transform duration-200 ${
              terbuka ? "rotate-180 text-ink" : "text-muted"
            }`}
          />
        </div>
      </button>

      {/* Konten Terbuka */}
      {terbuka && (
        <div
          id="konten-parameter-varian"
          className="mt-3 divide-y divide-hairline rounded-inset bg-inset p-3.5"
        >
          {minAnggota !== null && maksAnggota !== null && (
            <div className="py-2 first:pt-1 last:pb-1">
              <div className="flex items-center">
                <p className="text-label text-muted">Batas Anggota</p>
                <TanyaTooltip istilah="Batas Anggota" />
              </div>
              <p className="text-body-md text-ink mt-0.5">
                {formatAngka(minAnggota)}–{formatAngka(maksAnggota)} desa per jalur
              </p>
            </div>
          )}

          {entriSubsektor.map(([kunci, nilai]) => (
            <BarisSpek key={kunci} judul={NAMA_SUBSEKTOR[kunci] ?? kunci} spek={objek(nilai)} />
          ))}

          {punyaSpecTunggal && <BarisSpek judul="Ketentuan Waktu & Volume" spek={specTunggal} />}

          {/* Rujukan Dokumentasi Pengolahan Data Jalur Ekonomi */}
          <div className="pt-2.5 pb-1">
            <a
              href={`${DOCS_URL}/docs/pengolahan-data/jalur-ekonomi`}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1.5 text-micro font-medium text-ink hover:underline rounded ${FOCUS_RING}`}
            >
              <span>Pelajari perhitungan & metodologi model di Dokumentasi</span>
              <ExternalLink className="size-3 text-muted shrink-0" />
            </a>
          </div>
        </div>
      )}
    </section>
  );
}
