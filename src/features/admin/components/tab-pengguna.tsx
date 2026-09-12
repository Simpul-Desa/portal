"use client";

/**
 * Tab "Pengguna" Halaman Admin (PRD app §5.7): cari akun terdaftar, lihat
 * kapan dibuat/diubah, naikkan atau turunkan perannya. Tiga keadaan
 * muat/tertunda/galat memakai `pilihKeadaan` + `blok-keadaan.tsx` bersama
 * (DESIGN.md § Empty, Loading & Error States) — bukan kartu galat tulisan
 * tangan sendiri.
 *
 * Keadaan kosong SENGAJA dipecah dua kalimat berbeda, bukan satu kalimat
 * generik: "tidak ada yang cocok dengan pencarian" menuntun pengguna untuk
 * mengubah kata kuncinya, sedangkan "belum ada akun terdaftar" bilang tidak
 * ada tindakan yang bisa diambil di pencarian sama sekali — dua jawaban
 * untuk dua pertanyaan berbeda.
 *
 * `hal` DIRESET ke 1 setiap `telat` (nilai CARI YANG SUNGGUH DIPAKAI
 * `queryKey`, bukan `q` mentah — Task 8a) berubah, lewat pola "menyesuaikan
 * state saat render" (bandingkan dengan nilai render sebelumnya yang
 * disimpan `useState`, panggil setter di badan render bila beda — persis
 * `dashboard-shell.tsx` baris 198–202), BUKAN `useEffect`: linter proyek ini
 * menolak `react-hooks/set-state-in-effect`. Mereset pada `q` mentah (bug
 * lama) membuat ketik-lalu-batalkan satu huruf dalam 300ms melempar admin
 * dari halaman 3 ke halaman 1 padahal tidak ada permintaan baru yang pernah
 * terkirim, DAN keystroke pertama memicu fetch sungguhan untuk nomor
 * halaman yang tidak diminta siapa pun.
 *
 * Galat baris tersimpan (`peran.galatPerId`) dikosongkan begitu `hal`
 * berganti (adjustment render kedua di bawah) — galat baris 1 tidak boleh
 * muncul lagi menempel ke baris lain setelah admin pindah halaman lalu
 * kembali (R17).
 *
 * Pencarian tidak sah (`!qSah`) TIDAK menahan permintaan sampai error —
 * `enabled: sah` di `useDaftarPengguna` menahannya lebih dulu — tapi
 * `keepPreviousData` membuat daftar dan pager lama bertahan diam-diam tanpa
 * tanda apa pun. Baris dan pager di bawah karena itu diredupkan dan pager
 * disembunyikan selama `!qSah`, dan hint-nya bilang hasil tertahan (Task 7).
 *
 * Galat ubah peran per baris TIDAK melewati `pesanGalat` di sini — itu
 * ditangani sengaja di `BarisPengguna` sendiri (lihat docstring berkas itu).
 */

import { useId, useState } from "react";
import { Search } from "lucide-react";

import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { Pagination } from "@/shared/components/pagination";
import { formatAngka } from "@/shared/format";
import { useNilaiTelat } from "@/shared/hooks/use-nilai-telat";

import { BarisPengguna } from "./baris-pengguna";
import { BATAS_PENGGUNA, useDaftarPengguna } from "../hooks/queries";
import { useUbahPeran } from "../hooks/use-aksi-admin";
import { cariPenggunaSah } from "../services/pengguna";

export function TabPengguna() {
  const [q, setQ] = useState("");
  const [hal, setHal] = useState(1);
  const idInput = useId();
  const idBantuan = useId();

  const telat = useNilaiTelat(q);
  const qSah = cariPenggunaSah(q);

  // Reset halaman ke 1 setiap `telat` berubah — lihat docstring di atas
  // soal kenapa `telat`, bukan `q`, dan kenapa ini bukan `useEffect`.
  const [telatSebelumnya, setTelatSebelumnya] = useState(telat);
  if (telat !== telatSebelumnya) {
    setTelatSebelumnya(telat);
    setHal(1);
  }

  const peran = useUbahPeran();

  // Kosongkan galat baris tersimpan begitu halaman berganti (R17) — lihat
  // docstring berkas.
  const [halSebelumnya, setHalSebelumnya] = useState(hal);
  if (hal !== halSebelumnya) {
    setHalSebelumnya(hal);
    peran.resetGalat();
  }

  const { data, isPending, isPaused, isError, error, refetch } = useDaftarPengguna(telat, hal);
  const kosong = data?.daftar.length === 0;
  const keadaan = pilihKeadaan({ isPending, isPaused, isError, kosong });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-title-md font-semibold text-ink">Manajemen Pengguna</h2>
          <p className="mt-0.5 text-body-md text-body">
            Hanya admin yang bisa menaikkan peran. Registrasi mandiri selalu menghasilkan tamu.
          </p>
        </div>
        {data && (
          <span className="self-start sm:self-auto rounded-full bg-surface px-3 py-1 text-micro font-medium text-muted border border-hairline">
            Total {formatAngka(data.total)} pengguna
          </span>
        )}
      </div>

      <div className="rounded-2xl border border-hairline bg-surface/30 p-4">
        <label htmlFor={idInput} className="mb-1.5 block text-label font-medium text-ink">
          Cari email akun
        </label>
        <div className="relative flex h-11 items-center rounded-xl bg-white px-3.5 border border-line/60 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={18} className="shrink-0 text-muted mr-2.5" />
          <input
            id={idInput}
            type="text"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ketik email (mis. nama@instansi.go.id)…"
            aria-invalid={qSah ? undefined : true}
            aria-describedby={qSah ? undefined : idBantuan}
            className="w-full min-w-0 bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="text-micro text-muted hover:text-ink px-1.5 py-0.5 rounded cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
        {!qSah && (
          <p id={idBantuan} className="mt-1.5 text-micro text-critical">
            Pakai huruf, angka, dan tanda @ . _ + - saja. Hasil tertahan sampai kata kuncinya sah.
          </p>
        )}
      </div>

      {keadaan === "muat" && (
        <div className="mt-4">
          <KerangkaMuat tinggi="h-16" baris={3} />
        </div>
      )}

      {keadaan === "tertunda" && (
        <div className="rounded-2xl border border-hairline p-6 text-center">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar akun belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 inline-flex h-10 items-center rounded-xl bg-surface px-4 text-button-md text-ink border border-line/60 hover:bg-white transition-colors cursor-pointer ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </div>
      )}

      {keadaan === "galat" && error && (
        <div className="mt-4">
          <BlokGalat galat={error} onCobaLagi={() => refetch()} penempatan="inline" />
        </div>
      )}

      {(keadaan === "isi" || keadaan === "kosong") && (
        <div className={qSah ? undefined : "pointer-events-none opacity-40"}>
          {keadaan === "kosong" && (
            <div className="rounded-2xl border border-hairline p-8 text-center bg-surface/20">
              <KeadaanKosong
                kalimat={
                  q.trim()
                    ? "Tidak ada akun yang cocok dengan pencarian itu."
                    : "Belum ada akun terdaftar."
                }
              />
            </div>
          )}

          {keadaan === "isi" && data && (
            <div className="divide-y divide-hairline rounded-2xl border border-hairline bg-white p-1.5">
              {data.daftar.map((p) => (
                <BarisPengguna
                  key={p.id}
                  pengguna={p}
                  sedangKirim={peran.idSedangKirim === p.id}
                  peranSedangKirim={peran.idSedangKirim === p.id ? peran.peranSedangKirim : undefined}
                  galat={peran.galatPerId[p.id] ?? null}
                  onUbahPeran={(peranBaru) => peran.ubah({ id: p.id, peran: peranBaru })}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {qSah && keadaan === "isi" && data && (
        <div className="pt-2 flex justify-center sm:justify-end">
          <Pagination hal={hal} total={data.total} batas={BATAS_PENGGUNA} onHal={setHal} />
        </div>
      )}
    </div>
  );
}
