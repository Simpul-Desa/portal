"use client";

import { Check, Eye, MapPin, Network, Sparkles, X } from "lucide-react";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka } from "@/shared/format";

import { useJalurDesaStatus } from "../hooks/queries";
import { VARIAN } from "../types";

export type KartuDesaJalurMapProps = {
  varian: Varian;
  desa: string;
  kab?: string;
  jalurAktif?: string;
  onPilihJalur: (jalur: string, opsi?: { kab?: string }) => void;
  onTutup: () => void;
};

/**
 * Kartu Desa Jalur Ekonomi di Peta:
 * Floating card melayang di atas peta (mirip LegendaCitraMap),
 * menampilkan status desa yang sedang dipilih (Desa Poros / Desa Sejalur / Belum Masuk Jalur).
 * Memisahkan informasi konteks spasial desa ke atas peta, sehingga panel kiri tetap
 * bersih dan fokus pada pencarian serta daftar desa poros & sejalur.
 */
export function KartuDesaJalurMap({
  varian,
  desa,
  kab,
  jalurAktif,
  onPilihJalur,
  onTutup,
}: KartuDesaJalurMapProps) {
  const { data, isLoading: loadingKartu } = useKartu(desa);
  const kartu = data as KartuDesa | undefined;
  const { data: statusData, isLoading: loadingStatus } = useJalurDesaStatus(varian, desa, kab);

  const namaVarian = VARIAN.find((v) => v.slug === varian)?.nama ?? varian;
  const namaDesa = kartu?.identitas?.nama ?? "Desa Terpilih";
  const namaKec = kartu?.identitas?.kecamatan ? `Kec. ${kartu.identitas.kecamatan}` : null;
  const namaKab = kartu?.identitas?.kabupaten ? `Kab. ${kartu.identitas.kabupaten}` : null;

  const daftarJalur = statusData?.data ?? [];
  const jalurTerkait = daftarJalur[0];

  const apakahPoros = jalurTerkait ? jalurTerkait.poros.iddesa === desa : false;
  const apakahSejalur = jalurTerkait ? !apakahPoros : false;
  const sedangAktif = jalurTerkait ? jalurAktif === jalurTerkait.id_jalur : false;

  return (
    <aside
      aria-label="Status Desa di Jalur Ekonomi"
      className="pointer-events-none absolute left-4 bottom-11 z-20 md:left-6 md:bottom-11"
    >
      <div className="pointer-events-auto w-80 max-w-[calc(100vw-2rem)] rounded-card bg-white/95 p-4 shadow-float backdrop-blur-md border border-line/60">
        {/* Header Info Desa */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-float text-ink mt-0.5">
              <MapPin className="size-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-title-sm text-ink font-semibold truncate">{namaDesa}</h3>
                {apakahPoros && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.2 text-badge font-medium text-amber-900">
                    <Sparkles className="size-2.5" />
                    <span>Poros</span>
                    <TanyaTooltip istilah="Desa Poros" />
                  </span>
                )}
                {apakahSejalur && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.2 text-badge font-medium text-blue-900">
                    <Network className="size-2.5" />
                    <span>Sejalur</span>
                    <TanyaTooltip istilah="Desa Sejalur" />
                  </span>
                )}
              </div>
              <p className="text-micro text-muted mt-0.5 truncate">
                {[namaKec, namaKab].filter(Boolean).join(" · ")}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onTutup}
            title="Tutup kartu desa"
            aria-label="Tutup kartu desa"
            className={`flex size-6 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink hover:bg-float transition-colors ${FOCUS_RING}`}
          >
            <X className="size-3.5" />
          </button>
        </div>

        {/* Konten Keterhubungan */}
        <div className="mt-3 pt-2.5 border-t border-hairline">
          {loadingStatus || loadingKartu ? (
            <div className="h-10 animate-pulse rounded bg-surface" />
          ) : apakahPoros && jalurTerkait ? (
            <div className="space-y-2">
              <p className="text-micro text-muted leading-relaxed">
                Desa ini adalah <strong className="text-ink">Pusat Poros</strong> pada jalur{" "}
                <span className="text-ink font-medium">{jalurTerkait.label}</span>, melayani{" "}
                <span className="font-semibold text-ink">{formatAngka(jalurTerkait.n_anggota)} desa</span>.
              </p>
              <button
                type="button"
                disabled={sedangAktif}
                onClick={() => onPilihJalur(jalurTerkait.id_jalur, { kab: jalurTerkait.idkab })}
                className={`flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-micro font-medium transition-all ${
                  sedangAktif
                    ? "bg-inset text-muted cursor-default"
                    : "bg-ink text-white hover:bg-ink/90 cursor-pointer shadow-xs"
                } ${FOCUS_RING}`}
              >
                {sedangAktif ? (
                  <>
                    <Check className="size-3.5 text-green-600" />
                    <span>Jalur sedang aktif di peta</span>
                  </>
                ) : (
                  <>
                    <Eye className="size-3.5" />
                    <span>Tampilkan jalur di peta</span>
                  </>
                )}
              </button>
            </div>
          ) : apakahSejalur && jalurTerkait ? (
            <div className="space-y-2">
              <p className="text-micro text-muted leading-relaxed">
                Terhubung ke Poros:{" "}
                <strong className="text-ink">{jalurTerkait.poros.nmdesa}</strong> pada jalur{" "}
                <span className="text-ink font-medium">{jalurTerkait.label}</span>.
              </p>
              <button
                type="button"
                disabled={sedangAktif}
                onClick={() => onPilihJalur(jalurTerkait.id_jalur, { kab: jalurTerkait.idkab })}
                className={`flex w-full items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-micro font-medium transition-all ${
                  sedangAktif
                    ? "bg-inset text-muted cursor-default"
                    : "bg-ink text-white hover:bg-ink/90 cursor-pointer shadow-xs"
                } ${FOCUS_RING}`}
              >
                {sedangAktif ? (
                  <>
                    <Check className="size-3.5 text-green-600" />
                    <span>Jalur sedang aktif di peta</span>
                  </>
                ) : (
                  <>
                    <Network className="size-3.5" />
                    <span>Tampilkan jaringan poros ini</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <p className="text-micro text-muted leading-relaxed">
              Desa ini tidak termasuk dalam optimasi jalur untuk varian{" "}
              <span className="font-medium text-ink">{namaVarian}</span>.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
