"use client";

/**
 * Tab Status halaman admin: versi data, isi sistem, penyegaran berita, dan
 * kesiapan konfigurasi. Baca-saja — satu-satunya aksi adalah tombol "Muat
 * ulang status", yang memanggil ulang query dan tidak pernah mengubah apa
 * pun di server.
 *
 * JEBAKAN:
 * 1. `konfigurasi` hanya bendera boolean. `api/` sengaja tidak pernah
 *    mengirim nilai kuncinya sendiri, dan komponen ini tidak boleh
 *    menampilkan, meminta, atau menyimpulkan nilai itu.
 * 2. `versi_data` dan `tanggal_data` bisa `null` saat manifest belum
 *    termuat di server — keduanya lewat `strip()` sehingga menjadi "—",
 *    bukan string kosong dan bukan "null".
 * 3. Kemajuan pekerjaan ditulis sebagai kalimat, bukan digambar sebagai
 *    bilah. DESIGN.md menyebut `progress-bar` di spec `card-float` tetapi
 *    tidak pernah menspesifikasikannya, dan satu pekerjaan latar bukan
 *    alasan cukup untuk menciptakan komponen baru.
 * 4. Polling hidup di `useStatusAdmin`, bukan di sini — jangan menambah
 *    `setInterval`.
 * 5. `pilihKeadaan` dipanggil dengan `isError: isError && !data` (BUKAN
 *    `isError` mentah) — `query.js:309-321` (`@tanstack/query-core`,
 *    diverifikasi di `node_modules`) tidak membuang `data` lama pada aksi
 *    `error`, jadi satu poll 3 detik yang gagal saat pekerjaan penyegaran
 *    sedang berjalan TIDAK BOLEH mengganti seluruh halaman (versi data,
 *    cacah, kemajuan pekerjaan) dengan kartu galat kosong — data lama masih
 *    valid dan masih berguna. Kartu galat penuh cuma tampil saat memang
 *    belum ada data sama sekali. Galat pada poll yang GAGAL tapi data lama
 *    MASIH ADA hanya dapat spanduk basi non-blocking (lihat di bawah), dan
 *    polling tetap berjalan seperti biasa karena `refetchInterval` membaca
 *    `query.state.data.penyegaran.keadaan`, yang tetap ada.
 */

import { RotateCcw } from "lucide-react";

import { BlokGalat, KeadaanKosong } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { StatusChip } from "@/shared/components/status-chip";
import { formatAngka, formatTanggal, strip } from "@/shared/format";

import { useStatusAdmin } from "../hooks/queries";
import { labelKemajuan, ringkasHasil } from "../services/segarkan";

export function TabStatus() {
  const { data, isPending, isPaused, isError, error, refetch } = useStatusAdmin();

  const keadaan = pilihKeadaan({ isPending, isPaused, isError: isError && !data });

  if (keadaan === "muat") {
    return (
      <div className="flex flex-col gap-2">
        <div className="h-32 animate-pulse rounded-card bg-surface" />
        <div className="h-32 animate-pulse rounded-card bg-surface" />
        <div className="h-32 animate-pulse rounded-card bg-surface" />
      </div>
    );
  }

  if (keadaan === "tertunda") {
    return (
      <section className="rounded-card bg-surface p-5">
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi status sistem belum bisa dimuat." />
        <button
          type="button"
          onClick={() => refetch()}
          className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </section>
    );
  }

  if (keadaan === "galat" && error) {
    return (
      <section className="rounded-card bg-surface p-5">
        <BlokGalat galat={error} onCobaLagi={() => refetch()} penempatan="inline" />
      </section>
    );
  }

  // `keadaan` di titik ini selalu "isi" — tidak ada cabang "kosong" karena
  // status sistem bukan daftar yang bisa kosong — tapi TypeScript tidak tahu
  // itu, jadi `data` tetap dipersempit lewat pemeriksaan eksplisit di bawah.
  if (!data) return null;

  const { versi_data, tanggal_data, cacah, penyegaran, penyegaran_terakhir, konfigurasi } = data;

  return (
    <div className="flex flex-col gap-2">
      {isError && (
        <div role="status" className="rounded-card bg-surface p-3">
          <p className="flex items-center gap-1.5 text-body-md text-ink">
            <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            Status di layar ini bisa jadi sudah basi. Pembaruan terakhir gagal ({error.kode}).
          </p>
        </div>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <section className="rounded-card bg-surface p-5">
          <h2 className="text-title-md text-ink">Versi data</h2>
          <div className="mt-4 flex flex-col gap-2">
            <div className="flex justify-between gap-3">
              <span className="text-label text-muted">versi</span>
              <span className="font-mono text-label text-ink break-all">{strip(versi_data)}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-label text-muted">tanggal</span>
              <span className="text-label text-ink">
                {tanggal_data ? formatTanggal(tanggal_data) : strip(null)}
              </span>
            </div>
          </div>
        </section>

        <section className="rounded-card bg-surface p-5">
          <h2 className="text-title-md text-ink">Isi sistem</h2>
          <div className="mt-4 flex gap-6">
            <div>
              <p className="text-label text-muted">Pengguna</p>
              <p className="text-metric-lg text-ink">{formatAngka(cacah.pengguna)}</p>
            </div>
            <div>
              <p className="text-label text-muted">Berita</p>
              <p className="text-metric-lg text-ink">{formatAngka(cacah.berita)}</p>
            </div>
          </div>
          <p className="mt-3 text-micro text-muted">Cacah baris tabel besar adalah perkiraan.</p>
        </section>
      </div>

      <section className="rounded-card bg-surface p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-title-md text-ink">Penyegaran berita</h2>
          <button
            type="button"
            onClick={() => refetch()}
            className={`flex h-10 items-center gap-1.5 rounded-full bg-float px-[18px] text-button-md text-ink ${FOCUS_RING}`}
          >
            <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
            Muat ulang status
          </button>
        </div>

        {penyegaran === null ? (
          <>
            <StatusChip status="muted">belum pernah</StatusChip>
            <p className="mt-2 text-body-md text-muted">
              Belum ada penyegaran sejak server terakhir dinyalakan.
            </p>
          </>
        ) : (
          <>
            <StatusChip status={penyegaran.keadaan === "berjalan" ? "caution" : "positive"}>
              {penyegaran.keadaan}
            </StatusChip>
            <p className="mt-2 text-body-md text-body">
              {labelKemajuan(penyegaran.selesai, penyegaran.total)}
            </p>

            {penyegaran.hasil.length > 0 && (
              <div className="mt-4 divide-y divide-hairline">
                {penyegaran.hasil.map((h) => (
                  <div key={h.iddesa} className="py-3">
                    <p className="font-mono text-label text-ink">{h.iddesa}</p>
                    <p className="text-body-md text-body">{ringkasHasil(h)}</p>
                    {h.galat && (
                      <p className="flex items-center gap-1.5 text-micro text-ink">
                        <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
                        {h.galat}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {penyegaran_terakhir.length > 0 && (
          <>
            <h3 className="mt-4 text-title-sm text-ink">Penyegaran terakhir per desa</h3>
            <div className="divide-y divide-hairline">
              {penyegaran_terakhir.map((p) => (
                <div key={p.iddesa} className="flex justify-between gap-3 py-2">
                  <span className="font-mono text-label text-ink">{p.iddesa}</span>
                  <span className="text-label text-muted">{formatTanggal(p.dipanen_pada)}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section className="rounded-card bg-surface p-5">
        <h2 className="text-title-md text-ink">Kesiapan konfigurasi</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusChip status={konfigurasi.supabase ? "positive" : "muted"}>
            {konfigurasi.supabase ? "Supabase terisi" : "Supabase belum terisi"}
          </StatusChip>
          <StatusChip status={konfigurasi.gemini ? "positive" : "muted"}>
            {konfigurasi.gemini
              ? "Kunci Gemini panen berita terisi"
              : "Kunci Gemini panen berita belum terisi"}
          </StatusChip>
          <StatusChip status={konfigurasi.gemini_chat ? "positive" : "muted"}>
            {konfigurasi.gemini_chat
              ? "Kunci Gemini Asisten Desa terisi"
              : "Kunci Gemini Asisten Desa belum terisi"}
          </StatusChip>
        </div>
      </section>
    </div>
  );
}
