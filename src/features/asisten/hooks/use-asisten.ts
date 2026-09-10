"use client";

/**
 * State riwayat percakapan Asisten Desa + pengiriman lewat `POST /api/chat`
 * (Task 16 rencana fase 6). `useMutation`, BUKAN `useQuery` (Task 16 GOTCHA
 * 4): chat punya efek samping (kuota Gemini, ambang laju per pengguna) yang
 * TIDAK boleh diulang oleh refetch fokus-tab atau invalidasi cache —
 * mutation tidak pernah berjalan sendiri.
 *
 * Riwayat diangkat ke shell lewat hook ini (dipanggil `dashboard-shell.tsx`
 * TANPA syarat, Task 24 — bukan bagian berkas ini), persis alasan
 * `panelWidth` diangkat di fase 1: state yang mati bersama komponennya
 * membuat "tutup lalu buka" jadi penghapus data yang tidak diminta siapa pun.
 *
 * Perbaikan 2 (review Opus): "Percakapan baru" mengosongkan riwayat tapi
 * TIDAK membatalkan permintaan yang sedang terbang — `mutation.reset()` saja
 * TIDAK cukup, karena ia cuma membersihkan status/data/error mutation di
 * SISI KLIEN; ia tidak membatalkan promise `mutationFn` yang sudah berjalan.
 * Kalau jawaban lama itu tetap tiba, `onSuccess` lama akan menempel ke
 * riwayat yang sudah kosong — jawaban tanpa pertanyaan. Penanda generasi
 * (`generasiRef`, dinaikkan `percakapanBaru`) menutup celah ini: generasi
 * SAAT `mutate` dipanggil ikut dikirim sebagai bagian variabel mutation, dan
 * `onSuccess` membandingkannya dengan generasi TERKINI sebelum menempel —
 * jawaban dari generasi yang sudah lewat dibuang diam-diam.
 */

import { useMutation } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import type { GalatApi } from "@/lib/api/client";
import { chatKirim } from "@/lib/api/endpoints";

import { bisaKirim, keMessages } from "../services/riwayat";
import type { Giliran, JawabanChat } from "../types";

/** Variabel mutation: riwayat yang dikirim + generasi percakapan SAAT
 * `mutate` dipanggil (Perbaikan 2). */
type VariabelKirim = { riwayat: Giliran[]; generasi: number };

export function useAsisten() {
  const [riwayat, setRiwayat] = useState<Giliran[]>([]);
  const generasiRef = useRef(0);

  const mutation = useMutation<JawabanChat, GalatApi, VariabelKirim>({
    mutationFn: async ({ riwayat: riwayatKirim }) => (await chatKirim(keMessages(riwayatKirim))).data,
    retry: false,
    onSuccess: (data, variabel) => {
      // Generasi sudah berganti (percakapan baru dimulai sebelum jawaban ini
      // tiba) — buang, jangan tempel ke riwayat yang sudah bukan miliknya.
      if (variabel.generasi !== generasiRef.current) return;
      setRiwayat((sebelumnya) => [
        ...sebelumnya,
        { role: "model", isi: data.jawaban, jejak: data.jejak_fungsi, peringatan: data.peringatan },
      ]);
    },
  });
  // Didestrukturisasi (Perbaikan 6) supaya dependensi `useCallback` di bawah
  // adalah IDENTIFIER `mutate` langsung — stabil lintas render (TanStack
  // Query v5) — bukan objek `mutation` yang identitasnya berganti tiap
  // render, dan bukan pula ekspresi anggota `mutation.mutate` yang linter
  // proyek ini (`eslint-plugin-react-hooks` 7) tetap minta ditulis sebagai
  // identifier akar `mutation`.
  const { mutate } = mutation;

  /**
   * Kirim pertanyaan baru. Riwayat BARU (giliran user ditambahkan) dikirim
   * sebagai VARIABEL `mutate`, bukan dibaca dari closure `riwayat` (Task 16
   * GOTCHA 1, CRITICAL) — `setRiwayat` asinkron, jadi membaca `riwayat` di
   * sini akan mengirim riwayat yang tertinggal satu giliran dan asisten
   * menjawab pertanyaan sebelumnya.
   *
   * Giliran user TETAP ditambahkan ke riwayat walau mutation berikutnya
   * gagal (Task 16 GOTCHA 2) — tidak dibatalkan, supaya kalimat yang sudah
   * diketik tidak hilang dan "Kirim ulang" (`kirimUlang`) punya sesuatu
   * untuk dikirim ulang.
   */
  const kirimPertanyaan = useCallback(
    (isi: string) => {
      const isiBersih = isi.trim();
      if (!isiBersih || !bisaKirim(riwayat)) return;

      const riwayatBaru: Giliran[] = [...riwayat, { role: "user", isi: isiBersih }];
      setRiwayat(riwayatBaru);
      mutate({ riwayat: riwayatBaru, generasi: generasiRef.current });
    },
    // Dependensi `mutate` (Perbaikan 6), BUKAN objek `mutation` — `mutation`
    // berganti identitas tiap render (TanStack Query v5), padahal `mutate`
    // sendiri stabil; memasukkan seluruh objek membuat callback ini dibuat
    // ulang tiap render tanpa alasan.
    [riwayat, mutate],
  );

  /**
   * Kirim ulang riwayat APA ADANYA — giliran user terakhir sudah di sana
   * (Task 16 GOTCHA 3). Menambah giliran user kedua di sini akan mengirim
   * pertanyaan yang sama dua kali dan memakan jatah 10/menit dua kali.
   */
  const kirimUlang = useCallback(() => {
    mutate({ riwayat, generasi: generasiRef.current });
  }, [riwayat, mutate]);

  /**
   * Mulai percakapan kosong. SENGAJA tidak memanggil `mutation.reset()`
   * (review Opus): `dashboard-shell.tsx` memanggil fungsi ini di FASE RENDER
   * saat peran turun jadi tidak berhak — pola "menyesuaikan state saat
   * render" yang React sahkan untuk state milik komponen sendiri
   * (`setRiwayat`), tetapi TIDAK untuk menulis ke store pihak ketiga.
   * `reset()` menulis ke store TanStack dan memberi tahu pelanggannya di
   * tengah render, yang bukan jalur yang dijamin React. Galat sisa yang
   * seharusnya dibersihkan `reset()` sudah tertutup oleh `galat` di bawah:
   * ia diturunkan `null` selama riwayat kosong, dan percakapan tanpa satu
   * giliran pun memang tidak punya galat yang bermakna untuk ditampilkan.
   */
  const percakapanBaru = useCallback(() => {
    setRiwayat([]);
    generasiRef.current += 1;
  }, []);

  return {
    riwayat,
    kirimPertanyaan,
    kirimUlang,
    percakapanBaru,
    sedangMenjawab: mutation.isPending,
    /** Galat mutation TERAKHIR, kecuali saat riwayat kosong (lihat
     * `percakapanBaru`): tanpa giliran, tidak ada pertanyaan yang bisa
     * dikirim ulang, jadi blok galatnya pun tidak punya arti. */
    galat: riwayat.length > 0 ? mutation.error : null,
    /** Batas `MAKS_PESAN` tercapai — komposer harus mengunci diri dan
     * mengajak "Percakapan baru" (keputusan user 10 September 2026 §5). */
    penuh: !bisaKirim(riwayat),
  };
}
