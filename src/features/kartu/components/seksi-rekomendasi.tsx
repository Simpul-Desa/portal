"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { bisa } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { SparkIcon } from "@/shared/components/icons";

import { useAIInsight, useGenerateAIInsight } from "../hooks/queries";
import { parseTeksInsight, tebalkanKataKunci } from "../services/format-insight";
import type { RekomendasiAktor } from "../types";

function renderTeksFormat(teks: string) {
  const bagian = teks.split(/(\*\*[^*]+\*\*)/g);
  return bagian.map((sub, idx) => {
    if (sub.startsWith("**") && sub.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-ink">
          {sub.slice(2, -2)}
        </strong>
      );
    }
    return sub;
  });
}

/**
 * Seksi AI Insight:
 * Menampilkan analisis kondisi ekonomi dan rekomendasi aksi aktor langsung dari Supabase (`ai_insights`).
 * - Toggle tunggal di pojok kanan atas card (bawaan: tutup agar tidak panjang).
 * - Saat tertutup (close): hanya terlihat 3 baris pertama.
 * - Saat terbuka (open): buka semuanya secara utuh (paragraf naratif kondisi ekonomi +
 *   kalimat "Berikut adalah rekomendasi aksi bagi para aktor terkait:" + daftar rekomendasi per aktor).
 * - Aksi generate AI tersedia saat data belum ada (hanya pengguna login di atas tamu).
 */
export function SeksiRekomendasi({ iddesa }: { iddesa?: string }) {
  // Default is close agar tampilan kartu tetap ringkas
  const [terbuka, setTerbuka] = useState(false);

  const { data: insight, isLoading } = useAIInsight(iddesa);
  const { mutate: generate, isPending: isGenerating } = useGenerateAIInsight();
  const { adaSesi, peran, memuat: memuatSesi } = useSesi();

  const bisaGenerate = adaSesi && bisa(peran, "asisten");

  const handleGenerate = (generateUlang = false) => {
    if (!iddesa) return;
    generate(
      { iddesa, generateUlang },
      {
        onSuccess: () => {
          toast.success("AI Insight berhasil dibuat!");
          setTerbuka(true);
        },
        onError: (err) => {
          toast.error(pesanGalat(err).pesan || "Gagal membuat AI Insight.");
        },
      },
    );
  };

  // Normalisasi data kondisi ekonomi & rekomendasi aktor langsung dari Supabase
  const kondisiEkonomi = insight?.kondisi_ekonomi || "";
  const rekomendasiAktor: RekomendasiAktor[] = (() => {
    if (!insight?.rekomendasi_aktor) return [];
    if (Array.isArray(insight.rekomendasi_aktor)) return insight.rekomendasi_aktor;
    if (typeof insight.rekomendasi_aktor === "string") {
      try {
        return JSON.parse(insight.rekomendasi_aktor);
      } catch {
        return [];
      }
    }
    return [];
  })();

  const adaKonten = Boolean(kondisiEkonomi || insight?.teks_lengkap);
  const teksTutup = kondisiEkonomi || insight?.teks_lengkap || "";

  return (
    <section className="rounded-card p-[1.5px] bg-gradient-to-b from-primary via-primary/30 to-line/40 shadow-2xs">
      <div className="rounded-[22.5px] bg-float p-4">
        {/* Header Seksi & Toggle Tunggal di Pojok Kanan Atas */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparkIcon className="size-3.5 text-primary fill-primary" />
            </span>
            <h3 className="text-title-sm font-semibold text-ink">AI Insight</h3>
          </div>

          {/* Toggle Open/Close tunggal di pojok kanan atas */}
          {adaKonten && (
            <button
              type="button"
              onClick={() => setTerbuka(!terbuka)}
              aria-expanded={terbuka}
              aria-label={terbuka ? "Tutup detail AI Insight" : "Buka detail AI Insight"}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-medium transition-colors cursor-pointer ${
                terbuka
                  ? "bg-surface text-ink hover:bg-surface-strong"
                  : "bg-primary/10 text-primary hover:bg-primary/15"
              } ${FOCUS_RING}`}
            >
              <span>{terbuka ? "Tutup" : "Buka"}</span>
              {terbuka ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>
          )}
        </div>

        {/* Konten Seksi */}
        {isLoading ? (
          <div className="mt-2.5 space-y-2 animate-pulse">
            <div className="h-4 w-3/4 rounded bg-surface" />
            <div className="h-4 w-1/2 rounded bg-surface" />
          </div>
        ) : adaKonten ? (
          <div className="mt-2.5">
            {!terbuka ? (
              /* Keadaan Tutup: hanya terlihat 3 baris pertama */
              <p className="line-clamp-3 text-body-md text-ink leading-relaxed font-normal">
                {renderTeksFormat(tebalkanKataKunci(teksTutup))}
              </p>
            ) : (
              /* Keadaan Buka: buka semuanya secara utuh dan terformat */
              <div className="space-y-3">
                {kondisiEkonomi ? (
                  <div className="space-y-3 text-body-md text-ink leading-relaxed font-normal">
                    {/* Paragraf Narasi Kondisi Ekonomi */}
                    <p>{renderTeksFormat(tebalkanKataKunci(kondisiEkonomi))}</p>

                    {/* Bagian Rekomendasi Aktor */}
                    {rekomendasiAktor.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <p className="text-body-md text-ink leading-relaxed font-normal">
                          Berikut adalah rekomendasi aksi bagi para aktor terkait:
                        </p>
                        <ul className="space-y-2 pl-1">
                          {rekomendasiAktor.map((item, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-body-md text-ink leading-relaxed font-normal"
                            >
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-primary mt-2"
                                aria-hidden="true"
                              />
                              <div className="flex-1">
                                <strong className="font-bold text-ink">{item.aktor}</strong>:{" "}
                                {renderTeksFormat(tebalkanKataKunci(item.aksi))}
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback bila format berasal dari teks_lengkap */
                  <div className="space-y-2.5 text-body-md text-ink leading-relaxed font-normal">
                    {parseTeksInsight(insight?.teks_lengkap || "").map((blok, i) =>
                      blok.type === "p" ? (
                        <p key={i}>{renderTeksFormat(tebalkanKataKunci(blok.text))}</p>
                      ) : (
                        <ul key={i} className="space-y-1.5 pl-1 my-1.5">
                          {blok.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2">
                              <span
                                className="size-1.5 shrink-0 rounded-full bg-primary mt-2"
                                aria-hidden="true"
                              />
                              <span className="flex-1">{renderTeksFormat(tebalkanKataKunci(item))}</span>
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                )}

                {/* Tombol Generate Ulang subtle saat terbuka (hanya untuk pengguna login) */}
                {bisaGenerate && (
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => handleGenerate(true)}
                      disabled={isGenerating}
                      className={`inline-flex items-center gap-1.5 text-micro text-muted hover:text-primary transition-colors cursor-pointer disabled:opacity-50 ${FOCUS_RING}`}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="size-3 animate-spin" />
                          <span>Memperbarui...</span>
                        </>
                      ) : (
                        <span>Generate ulang</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Belum ada data di Supabase */
          <div className="mt-2.5">
            <p className="text-body-md text-muted leading-relaxed font-normal">
              Belum ada AI Insight untuk desa ini.
            </p>

            {bisaGenerate ? (
              <div className="mt-3 flex items-center">
                <button
                  type="button"
                  onClick={() => handleGenerate(false)}
                  disabled={isGenerating}
                  className={`inline-flex h-8 items-center gap-2 rounded-full bg-primary px-3.5 text-micro font-medium text-white shadow-2xs hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${FOCUS_RING}`}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Sedang membuat AI Insight...</span>
                    </>
                  ) : (
                    <>
                      <SparkIcon className="size-3.5 fill-white text-white" />
                      <span>Generate AI Insight</span>
                    </>
                  )}
                </button>
              </div>
            ) : !adaSesi && !memuatSesi ? (
              <div className="mt-3 flex items-center gap-2">
                <Link
                  href="/masuk"
                  className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-micro font-medium text-ink hover:border-line-strong hover:bg-surface/80 transition-colors ${FOCUS_RING}`}
                >
                  <SparkIcon className="size-3.5 text-primary fill-primary" />
                  <span>Masuk untuk generate AI</span>
                </Link>
              </div>
            ) : adaSesi && !bisaGenerate ? (
              <p className="mt-2 text-micro text-muted">
                Peran tamu tidak dapat men-generate AI Insight.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
