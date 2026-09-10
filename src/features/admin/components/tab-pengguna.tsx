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

import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { Pagination } from "@/shared/components/pagination";
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
    <section className="rounded-card bg-surface p-5">
      <h2 className="text-title-md text-ink">Pengguna</h2>
      <p className="mt-1 text-body-md text-body">
        Hanya admin yang bisa menaikkan peran. Registrasi mandiri selalu menghasilkan tamu.
      </p>

      <div className="mt-4">
        <label htmlFor={idInput} className="mb-1 block text-label text-muted">
          Cari email
        </label>
        <div className="flex h-11 items-center rounded-inset bg-inset px-3 focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus">
          <input
            id={idInput}
            type="text"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="nama@instansi.go.id"
            aria-invalid={qSah ? undefined : true}
            aria-describedby={qSah ? undefined : idBantuan}
            className="w-full min-w-0 truncate bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
          />
        </div>
        {!qSah && (
          <p id={idBantuan} className="mt-1 text-micro text-muted">
            Pakai huruf, angka, dan tanda @ . _ + - saja. Hasil tertahan sampai kata kuncinya sah.
          </p>
        )}
      </div>

      {keadaan === "muat" && (
        <div className="mt-4">
          <KerangkaMuat tinggi="h-16" baris={2} />
        </div>
      )}

      {keadaan === "tertunda" && (
        <div className="mt-4">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar akun belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
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
            <div className="mt-4">
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
            <div className="mt-4 divide-y divide-hairline">
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
        <div className="mt-4">
          <Pagination hal={hal} total={data.total} batas={BATAS_PENGGUNA} onHal={setHal} />
        </div>
      )}
    </section>
  );
}
