"use client";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

import Image from "next/image";


/**
 * Bingkai panel Asisten Desa (Task 17): header (judul + "Percakapan baru" +
 * tutup) → badan (`KeadaanKosong` atau `DaftarGiliran`) → kaki (`Komposer`).
 * Bukan modal (rencana § Notes "Mengapa panel bukan modal"): Tab TIDAK
 * dikurung di sini — panel adalah region pelengkap yang berdiri sejajar
 * peta, bukan sesuatu yang menuntut perhatian eksklusif. Fokus balik ke
 * tombol ✦ diurus SHELL (Task 24, di luar cakupan berkas ini) — panel ini
 * tidak memegang ref tombol pembukanya.
 *
 * Nilai komposer diangkat ke sini (bukan state lokal `Komposer`) supaya
 * Task 25 (prefill konteks desa aktif lewat `useKartu`) bisa mengisi atau
 * membaca teksnya tanpa membedah ulang `Komposer` — komponen itu murni
 * terkontrol (`nilai` + `onNilaiChange`), pola yang sama dengan `panelWidth`
 * di `dashboard-shell.tsx`.
 *
 * Task 25 — konteks wilayah aktif: karena shell merender `PanelAsisten` ini
 * SEBAGAI KOMPONEN BARU tiap kali panel dibuka (`{asistenTerbuka && … &&
 * <PanelAsisten …/>}`, `dashboard-shell.tsx`), "sekali per pembukaan" (Task
 * 25 GOTCHA 1) otomatis terpenuhi lewat siklus mount/unmount biasa — tidak
 * perlu penanda tambahan untuk itu. Yang tetap perlu dijaga manual hanyalah
 * TIDAK menimpa teks yang sudah diketik pengguna sambil menunggu nama
 * wilayah tiba dari query: `sudahMencobaPrefill` menandai kesempatan prefill
 * sebagai "sudah dipakai" tepat sekali, pada render pertama saat
 * `namaKonteks` akhirnya tersedia — sesudah itu, prefill tidak dicoba lagi
 * walau pengguna kemudian mengosongkan komposernya sendiri.
 */

import { useEffect, useRef, useState, type KeyboardEvent } from "react";

import { RotateCcw } from "lucide-react";

import { useKartu } from "@/features/kartu/hooks/queries";
import type { KartuDesa } from "@/features/kartu/types";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { CloseIcon } from "@/shared/components/icons";
import { Badge } from "@/shared/components/ui/badge";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import type { useAsisten } from "../hooks/use-asisten";
import { DaftarGiliran } from "./daftar-giliran";
import { KeadaanKosong } from "./keadaan-kosong";
import { Komposer } from "./komposer";

/** Konstanta id panel — dipakai `aria-controls` tombol ✦ di `map-stage.tsx` (Task 23, Blok D). */
export const ID_PANEL_ASISTEN = "panel-asisten";

type PanelAsistenProps = {
  asisten: ReturnType<typeof useAsisten>;
  wilayah: ReturnType<typeof useWilayahParams>;
  onTutup: () => void;
};

export function PanelAsisten({ asisten, wilayah, onTutup }: PanelAsistenProps) {
  const [nilaiKomposer, setNilaiKomposer] = useState("");
  const komposerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    komposerRef.current?.focus();
  }, []);

  // Task 25 — konteks wilayah aktif: nama desa (paling spesifik) lebih
  // diutamakan dari nama kabupaten. Keduanya HANYA nama hasil query — kode
  // wilayah 10 digit tidak pernah ditulis ke komposer (Task 25 GOTCHA 2);
  // tanpa nama yang sudah tiba, `namaKonteks` tetap `undefined` dan prefill
  // dilewati (bukan diganti kode mentah).
  const kartu = useKartu(wilayah.desa);
  const pusat = usePusat();
  const namaDesa = (kartu.data as KartuDesa | undefined)?.identitas.nama;
  const namaKab = pusat.data?.kabupaten.find((k) => k.idkab === wilayah.kab)?.nmkab;
  const namaKonteks = wilayah.desa ? namaDesa : wilayah.kab ? namaKab : undefined;

  // Prefill dicoba TEPAT SEKALI, pada render pertama saat `namaKonteks`
  // akhirnya tersedia (bukan `useEffect` — menyetel state di dalam efek
  // melanggar `react-hooks/set-state-in-effect` proyek ini, sama alasannya
  // dengan `dialogDeepLink` di `dashboard-shell.tsx`). Pola "menyesuaikan
  // state saat render": setter `sudahMencobaPrefill` dipanggil kondisional
  // di badan komponen, React commit render berikutnya sebelum browser
  // menggambar apa pun — tidak ada kedipan. Sesudah percobaan pertama itu,
  // prefill tidak dicoba lagi walau pengguna kemudian mengosongkan
  // komposernya sendiri (Task 25 GOTCHA 1: kesempatannya hanya sekali).
  const [sudahMencobaPrefill, setSudahMencobaPrefill] = useState(false);
  if (!sudahMencobaPrefill && namaKonteks) {
    setSudahMencobaPrefill(true);
    if (nilaiKomposer === "" && asisten.riwayat.length === 0) {
      setNilaiKomposer(`Tentang ${namaKonteks}: `);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      // Menandai Esc sudah dipakai supaya listener `document` panel kiri
      // (melipat drawer di 768-1023px, fase 9) tidak ikut menyala — tanpa
      // ini satu tekan Esc menutup panel ini SEKALIGUS melipat panel kiri.
      e.preventDefault();
      onTutup();
    }
  }

  function handleKirim(teksKustom?: string) {
    const teksFinal = typeof teksKustom === "string" ? teksKustom : nilaiKomposer;
    if (!teksFinal.trim()) return;
    asisten.kirimPertanyaan(teksFinal);
    setNilaiKomposer("");
  }

  // Perbaikan 3 (review Opus): fokus komposer + kursor di akhir teks setelah
  // contoh pertanyaan dipilih — tanpa ini fokus tertinggal di tombol contoh,
  // dan Enter (yang mengirim di komposer) tidak berbuat apa-apa dari sana.
  // `requestAnimationFrame` menunggu commit React selesai dulu supaya
  // `el.value` sudah berisi teks yang baru saja di-set lewat `nilai` terkontrol.
  function handlePilihContoh(teks: string) {
    setNilaiKomposer(teks);
    const el = komposerRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    });
  }

  const adaRiwayat = asisten.riwayat.length > 0;

  return (
    <div
      role="complementary"
      aria-label="Asisten Desa"
      id={ID_PANEL_ASISTEN}
      onKeyDown={handleKeyDown}
      className="absolute inset-0 z-30 flex flex-col rounded-card bg-canvas md:bg-float md:inset-y-0 md:left-auto md:right-0 md:z-20 md:w-asisten lg:static lg:shrink-0"
    >
      <header className="flex items-center justify-between px-4 py-3 md:px-6 md:py-5">
        <div className="flex items-center gap-2">
          <Image src="/asisten-desa.svg" alt="" width={18} height={18} className="shrink-0" />
          <h2 className="text-title-sm text-ink font-semibold tracking-tight">Asisten Desa</h2>
          <Badge
            variant="outline">
            AI Chatbot
          </Badge>
        </div>
        <div className="flex items-center gap-1.5">
          {adaRiwayat && (
            <button
              type="button"
              onClick={asisten.percakapanBaru}
              title="Percakapan baru"
              aria-label="Percakapan baru"
              className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-ink hover:bg-surface hover:border-line-strong transition-all ${FOCUS_RING}`}
            >
              <RotateCcw aria-hidden="true" size={16} strokeWidth={1.5} />
            </button>
          )}
          <button
            type="button"
            onClick={onTutup}
            title="Tutup Asisten Desa"
            aria-label="Tutup Asisten Desa"
            className={`flex size-8 shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent text-ink hover:bg-surface hover:border-line-strong transition-all [&>svg]:size-4 ${FOCUS_RING}`}
          >
            <CloseIcon />
          </button>
        </div>
      </header>

      <div className="h-px bg-hairline w-full" />

      {adaRiwayat ? (
        <div className="flex-1 min-h-0 min-w-0 h-full w-full overflow-hidden flex flex-col">
          <DaftarGiliran
            riwayat={asisten.riwayat}
            sedangMenjawab={asisten.sedangMenjawab}
            galat={asisten.galat}
            onKirimUlang={asisten.kirimUlang}
            onBukaTujuan={wilayah.bukaTujuan}
          />
        </div>
      ) : (
        <ScrollArea className="flex-1 w-full h-full min-h-0">
          <KeadaanKosong onPilihContoh={handlePilihContoh} />
        </ScrollArea>
      )}

      <div className="p-3 pt-0 md:p-4 md:pt-0">
        <Komposer
          ref={komposerRef}
          nilai={nilaiKomposer}
          onNilaiChange={setNilaiKomposer}
          onKirim={handleKirim}
          cacahPesan={asisten.riwayat.length}
          sedangMenjawab={asisten.sedangMenjawab}
          penuh={asisten.penuh}
          onPercakapanBaru={asisten.percakapanBaru}
        />
      </div>
    </div>
  );
}
