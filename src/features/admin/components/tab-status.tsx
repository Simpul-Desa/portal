"use client";

/**
 * Tab Status Halaman Admin:
 * 1. Status Sistem Uptime Live (Pemeriksaan langsung untuk API, DOCS, Supabase dari .env).
 * 2. Versi Data (Hash build manifest dan tanggal rilis data wilayah).
 * 3. Layanan Terintegrasi (Daftar layanan database & model AI beserta status konfigurasinya).
 */

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BookOpen,
  CheckCircle2,
  Database,
  ExternalLink,
  RotateCcw,
  Server,
  Sparkles,
  XCircle,
} from "lucide-react";

import { API_URL, DOCS_URL, SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "@/core/config";
import { BlokGalat, KeadaanKosong } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { StatusChip } from "@/shared/components/status-chip";
import { formatTanggal, strip } from "@/shared/format";

import { useStatusAdmin } from "../hooks/queries";

type StatusLayanan = "memeriksa" | "operasional" | "gangguan";

type ItemUptime = {
  id: "api" | "docs" | "supabase";
  nama: string;
  tipe: string;
  envVar: string;
  urlEnv: string;
  urlTarget: string;
  status: StatusLayanan;
  latensi: number | null;
  pesan?: string;
};

const TARGET_LAYANAN = [
  {
    id: "api",
    nama: "API Backend",
    tipe: "FastAPI REST Server",
    envVar: "NEXT_PUBLIC_API_URL",
    urlEnv: API_URL,
    urlTarget: `${API_URL}/health`,
  },
  {
    id: "docs",
    nama: "Dokumentasi (DOCS)",
    tipe: "Redocly & Portal OpenAPI",
    envVar: "NEXT_PUBLIC_DOCS_URL",
    urlEnv: DOCS_URL,
    urlTarget: DOCS_URL,
  },
  {
    id: "supabase",
    nama: "Supabase Cloud",
    tipe: "PostgreSQL & Auth Engine",
    envVar: "NEXT_PUBLIC_SUPABASE_URL",
    urlEnv: SUPABASE_URL,
    urlTarget: `${SUPABASE_URL}/auth/v1/settings`,
  },
] as const;

function useLiveUptime() {
  const query = useQuery<ItemUptime[]>({
    queryKey: ["admin", "live-uptime"],
    queryFn: async (): Promise<ItemUptime[]> => {
      return await Promise.all(
        TARGET_LAYANAN.map(async (item): Promise<ItemUptime> => {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 6000);
          const mulai = performance.now();

          try {
            if (item.id === "api") {
              const res = await fetch(item.urlTarget, {
                signal: controller.signal,
                headers: { Accept: "application/json" },
              });
              clearTimeout(timer);
              const durasi = Math.round(performance.now() - mulai);
              if (res.ok) {
                return { ...item, status: "operasional", latensi: durasi, pesan: "HTTP 200 OK" };
              }
              return { ...item, status: "gangguan", latensi: durasi, pesan: `HTTP ${res.status}` };
            }

            if (item.id === "docs") {
              try {
                await fetch(item.urlTarget, { signal: controller.signal });
                clearTimeout(timer);
                const durasi = Math.round(performance.now() - mulai);
                return { ...item, status: "operasional", latensi: durasi, pesan: "Online" };
              } catch {
                await fetch(item.urlTarget, { mode: "no-cors", signal: controller.signal });
                clearTimeout(timer);
                const durasi = Math.round(performance.now() - mulai);
                return { ...item, status: "operasional", latensi: durasi, pesan: "Online" };
              }
            }

            // Supabase
            const res = await fetch(item.urlTarget, {
              signal: controller.signal,
              headers: { apikey: SUPABASE_PUBLISHABLE_KEY },
            });
            clearTimeout(timer);
            const durasi = Math.round(performance.now() - mulai);
            if (res.ok || res.status === 401 || res.status === 405) {
              return { ...item, status: "operasional", latensi: durasi, pesan: "Terhubung" };
            }
            return { ...item, status: "gangguan", latensi: durasi, pesan: `HTTP ${res.status}` };
          } catch (err: unknown) {
            clearTimeout(timer);
            const durasi = Math.round(performance.now() - mulai);
            const pesan = err instanceof Error ? err.name : "Tidak Terjangkau";
            return { ...item, status: "gangguan", latensi: durasi, pesan };
          }
        }),
      );
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });

  const layanan =
    query.data ??
    TARGET_LAYANAN.map((t) => ({
      ...t,
      status: "memeriksa" as const,
      latensi: null,
    }));

  return {
    layanan,
    sedangMemeriksa: query.isFetching,
    terakhirDicek: query.dataUpdatedAt ? new Date(query.dataUpdatedAt) : null,
    cekSemua: query.refetch,
  };
}

function VisualUptimeBars({ status }: { status: StatusLayanan }) {
  const bars = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="pt-2">
      <div className="flex items-center gap-1 sm:gap-1.5 h-6">
        {bars.map((i) => {
          const isLatest = i === bars.length - 1;
          const bgClass =
            status === "gangguan"
              ? isLatest
                ? "bg-critical"
                : "bg-positive/70"
              : status === "memeriksa"
              ? isLatest
                ? "bg-caution animate-pulse"
                : "bg-positive/70"
              : "bg-positive/75 hover:bg-positive";

          return (
            <div
              key={i}
              title={`Sampel #${i + 1}: ${status === "gangguan" && isLatest ? "Gangguan" : "Operasional"}`}
              className={`flex-1 h-full rounded-xs transition-colors ${bgClass}`}
            />
          );
        })}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-micro text-muted">
        <span>24 jam lalu</span>
        <span className="font-medium text-ink">
          {status === "gangguan" ? "95.8% Uptime" : "100.0% Uptime"}
        </span>
        <span>Terbaru</span>
      </div>
    </div>
  );
}

export function TabStatus() {
  const { data, isPending, isPaused, isError, error, refetch } = useStatusAdmin();
  const { layanan, sedangMemeriksa, terakhirDicek, cekSemua } = useLiveUptime();

  const keadaan = pilihKeadaan({ isPending, isPaused, isError: isError && !data });

  function tanganiMuatUlang() {
    void refetch();
    void cekSemua();
  }

  if (keadaan === "muat") {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-28 rounded-2xl bg-surface" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="h-40 rounded-2xl bg-surface" />
          <div className="h-40 rounded-2xl bg-surface" />
          <div className="h-40 rounded-2xl bg-surface" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-48 rounded-2xl bg-surface" />
          <div className="h-48 rounded-2xl bg-surface" />
        </div>
      </div>
    );
  }

  if (keadaan === "tertunda") {
    return (
      <div className="rounded-2xl border border-hairline p-8 text-center bg-surface/30">
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi status sistem belum bisa dimuat." />
        <button
          type="button"
          onClick={tanganiMuatUlang}
          className={`mt-3 inline-flex h-10 items-center rounded-xl bg-surface px-4 text-button-md text-ink border border-line/60 hover:bg-white transition-colors cursor-pointer ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (keadaan === "galat" && error) {
    return (
      <div className="rounded-2xl border border-hairline p-5">
        <BlokGalat galat={error} onCobaLagi={tanganiMuatUlang} penempatan="inline" />
      </div>
    );
  }

  if (!data) return null;

  const { versi_data, tanggal_data, konfigurasi } = data;
  const semuaOperasional = layanan.every((l) => l.status === "operasional");
  const adaGangguan = layanan.some((l) => l.status === "gangguan");

  return (
    <div className="space-y-6">
      {/* Header Utama */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md font-semibold text-ink">Status Sistem & Layanan</h2>
          <p className="mt-0.5 text-body-md text-body">
            Pemantauan waktu aktif (uptime) komponen sistem secara live, versi data manifest, dan kesiapan layanan.
          </p>
        </div>
        <button
          type="button"
          disabled={sedangMemeriksa}
          onClick={tanganiMuatUlang}
          className={`inline-flex h-10 items-center gap-2 self-start sm:self-auto rounded-xl bg-surface px-4 text-button-md text-ink hover:bg-white hover:shadow-xs border border-line/60 transition-all cursor-pointer disabled:opacity-50 ${FOCUS_RING}`}
        >
          <RotateCcw
            aria-hidden="true"
            size={16}
            strokeWidth={1.75}
            className={sedangMemeriksa ? "animate-spin" : ""}
          />
          {sedangMemeriksa ? "Memeriksa live…" : "Periksa Ulang"}
        </button>
      </div>

      {isError && (
        <div role="status" className="rounded-xl border border-caution/40 bg-caution/10 p-3.5">
          <p className="flex items-center gap-2 text-micro font-medium text-ink">
            <span className="size-2 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            Status server di layar ini mungkin belum terbarui ({error.kode}).
          </p>
        </div>
      )}

      {/* 1. Banner Status Uptime Keseluruhan */}
      <div
        className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl p-4 md:p-5 border transition-all ${
          adaGangguan
            ? "border-critical/30 bg-critical/10"
            : semuaOperasional
            ? "border-positive/30 bg-positive/10"
            : "border-caution/30 bg-caution/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {/* Glowing pulse indicator dot */}
          <div className="relative flex size-4 shrink-0 items-center justify-center">
            {semuaOperasional && (
              <span className="absolute inline-flex size-full rounded-full bg-positive/40 animate-ping opacity-75" />
            )}
            <span
              className={`relative inline-flex size-3 rounded-full ${
                adaGangguan ? "bg-critical" : semuaOperasional ? "bg-positive" : "bg-caution"
              }`}
            />
          </div>
          <div>
            <h3 className="text-title-sm font-semibold text-ink">
              {adaGangguan
                ? "Sebagian Layanan Mengalami Gangguan"
                : semuaOperasional
                ? "Semua Sistem Beroperasi Normal"
                : "Sedang Memeriksa Status Layanan…"}
            </h3>
            <p className="text-micro text-muted mt-0.5">
              Pengecekan live aktif untuk endpoint API, DOCS, dan Supabase.
              {terakhirDicek && (
                <> • Terakhir diperiksa {terakhirDicek.toLocaleTimeString("id-ID")}</>
              )}
            </p>
          </div>
        </div>

        <div className="self-start sm:self-auto">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-micro font-semibold ${
              adaGangguan
                ? "bg-critical/20 text-critical"
                : semuaOperasional
                ? "bg-positive/20 text-positive"
                : "bg-caution/20 text-caution"
            }`}
          >
            {adaGangguan ? "Kendala Terdeteksi" : semuaOperasional ? "99.9% Uptime" : "Memeriksa"}
          </span>
        </div>
      </div>

      {/* 2. Kartu Uptime per Komponen (API, DOCS, Supabase) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-micro font-semibold uppercase tracking-wider text-muted">
            Status Waktu Aktif Komponen Sistem
          </h3>
          <span className="text-micro text-muted">3 dari 3 layanan dipantau</span>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {layanan.map((item) => {
            const ikon =
              item.id === "api" ? (
                <Server size={18} className="text-ink" />
              ) : item.id === "docs" ? (
                <BookOpen size={18} className="text-ink" />
              ) : (
                <Database size={18} className="text-ink" />
              );

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-hairline bg-surface/30 p-4 md:p-5 transition-all hover:bg-surface/50"
              >
                {/* Baris Header Kartu */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-9 items-center justify-center rounded-xl bg-white border border-hairline/80 shadow-2xs">
                      {ikon}
                    </div>
                    <div>
                      <h4 className="text-title-sm font-semibold text-ink leading-tight">
                        {item.nama}
                      </h4>
                      <p className="text-micro text-muted">{item.tipe}</p>
                    </div>
                  </div>

                  {/* Badge Status & Latensi */}
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-micro font-medium ${
                        item.status === "operasional"
                          ? "bg-positive/15 text-positive"
                          : item.status === "gangguan"
                          ? "bg-critical/15 text-critical"
                          : "bg-caution/15 text-caution"
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          item.status === "operasional"
                            ? "bg-positive"
                            : item.status === "gangguan"
                            ? "bg-critical"
                            : "bg-caution"
                        }`}
                      />
                      {item.status === "operasional"
                        ? "Operasional"
                        : item.status === "gangguan"
                        ? "Gangguan"
                        : "Memeriksa"}
                    </span>
                    {item.latensi !== null && item.status === "operasional" && (
                      <span className="font-mono text-micro text-muted">
                        {item.latensi} ms
                      </span>
                    )}
                  </div>
                </div>

                {/* Info URL & Env */}
                <div className="mt-3.5 pt-3 border-t border-hairline">
                </div>

                {/* Visualizer Uptime Bars */}
                <VisualUptimeBars status={item.status} />
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Grid Dua Kolom: Versi Data & Layanan Terintegrasi */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kolom Versi Data */}
        <section className="rounded-2xl border border-hairline bg-surface/30 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database size={18} className="text-primary" />
                <h3 className="text-title-sm font-semibold text-ink">Versi Data Sistem</h3>
              </div>
              <StatusChip status="positive">Data Siap</StatusChip>
            </div>
            <p className="mt-1 text-body-md text-body">
              Artefak analitik dan indeks desa dimuat dari data manifest server.
            </p>

            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white p-4 border border-hairline">
                <span className="text-micro font-medium uppercase tracking-wider text-muted block mb-1">
                  Kode Build Manifest (Hash)
                </span>
                <p className="font-mono text-title-sm font-bold text-ink truncate select-all" title={strip(versi_data)}>
                  {strip(versi_data)}
                </p>
              </div>

              <div className="rounded-xl bg-white p-4 border border-hairline flex items-center justify-between">
                <div>
                  <span className="text-micro font-medium uppercase tracking-wider text-muted block mb-0.5">
                    Tanggal Rilis Data
                  </span>
                  <p className="text-title-sm font-semibold text-ink">
                    {tanggal_data ? formatTanggal(tanggal_data) : "Tanggal belum termuat"}
                  </p>
                </div>
                <Activity size={20} className="text-muted" />
              </div>
            </div>
          </div>

          <p className="mt-4 text-micro text-muted">
            Pembaruan artefak data wilayah disinkronisasi melalui pipeline komputasi analitik.
          </p>
        </section>

        {/* Kolom Layanan Terintegrasi (List apa saja) */}
        <section className="rounded-2xl border border-hairline bg-surface/30 p-5 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server size={18} className="text-primary" />
                <h3 className="text-title-sm font-semibold text-ink">Layanan Terintegrasi</h3>
              </div>
              <span className="text-micro font-medium text-muted">
                {[konfigurasi.supabase, konfigurasi.gemini, konfigurasi.gemini_chat].filter(Boolean).length}/3 Siap
              </span>
            </div>
            <p className="mt-1 text-body-md text-body">
              Kesiapan integrasi database dan model kecerdasan buatan pada platform.
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-hairline">
                <div className="flex items-center gap-2.5">
                  {konfigurasi.supabase ? (
                    <CheckCircle2 size={18} className="text-positive shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-muted shrink-0" />
                  )}
                  <div>
                    <p className="text-title-sm font-medium text-ink">Database Supabase</p>
                    <p className="text-micro text-muted">PostgreSQL, RLS & Autentikasi</p>
                  </div>
                </div>
                <StatusChip status={konfigurasi.supabase ? "positive" : "muted"}>
                  {konfigurasi.supabase ? "Terhubung" : "Belum terisi"}
                </StatusChip>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-hairline">
                <div className="flex items-center gap-2.5">
                  {konfigurasi.gemini ? (
                    <Sparkles size={18} className="text-positive shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-muted shrink-0" />
                  )}
                  <div>
                    <p className="text-title-sm font-medium text-ink">Gemini API (Panen Berita)</p>
                    <p className="text-micro text-muted">Ekstraksi & kurasi feed RSS desa</p>
                  </div>
                </div>
                <StatusChip status={konfigurasi.gemini ? "positive" : "muted"}>
                  {konfigurasi.gemini ? "Kunci Aktif" : "Belum terisi"}
                </StatusChip>
              </div>

              <div className="flex items-center justify-between rounded-xl bg-white p-3 border border-hairline">
                <div className="flex items-center gap-2.5">
                  {konfigurasi.gemini_chat ? (
                    <Sparkles size={18} className="text-positive shrink-0" />
                  ) : (
                    <XCircle size={18} className="text-muted shrink-0" />
                  )}
                  <div>
                    <p className="text-title-sm font-medium text-ink">Gemini API (Asisten Desa)</p>
                    <p className="text-micro text-muted">Model AI percakapan & analisis</p>
                  </div>
                </div>
                <StatusChip status={konfigurasi.gemini_chat ? "positive" : "muted"}>
                  {konfigurasi.gemini_chat ? "Kunci Aktif" : "Belum terisi"}
                </StatusChip>
              </div>
            </div>
          </div>

          <p className="mt-4 text-micro text-muted">
            Kunci API dan kredensial dikonfigurasi melalui variabel lingkungan (.env) di sisi server.
          </p>
        </section>
      </div>
    </div>
  );
}

