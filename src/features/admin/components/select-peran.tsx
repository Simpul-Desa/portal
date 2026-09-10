"use client";

/**
 * Pilihan peran satu baris pengguna. `<select>` NATIVE dipakai apa adanya,
 * bukan komponen dropdown buatan sendiri — untuk field berisi empat nilai
 * tetap, perilaku keyboard (panah, ketik-untuk-cari), pengumuman pembaca
 * layar, dan picker ponsel bawaan browser sudah benar tanpa kode tambahan;
 * membangunnya ulang cuma menambah permukaan bug untuk manfaat yang tidak
 * ada. Geometri kulitnya menyalin `form-field` persis (`bg-inset`,
 * `rounded-inset`, `h-11`, `px-3`, `text-body-md text-ink`) — DESIGN.md
 * menamainya `form-select` tapi bentuknya sama, hanya menambah `appearance-
 * none` dan chevron sendiri karena elemen `<select>` punya panah bawaan
 * peramban yang harus disembunyikan dulu.
 *
 * `aria-disabled`, BUKAN atribut `disabled`, selama `sedangKirim` (Task 3):
 * peramban mem-blur elemen yang baru saja menjadi `disabled` tanpa memberi
 * fokus ke tetangga mana pun, jadi admin yang menavigasi keyboard terlempar
 * ke `<body>` dan harus Tab dari atas dokumen lagi untuk mencapai baris
 * berikutnya. Elemen tetap terfokus dan tetap menerima event; kuncinya ada
 * di `onChange` yang mengabaikan perubahan selama `sedangKirim` — baris
 * tetap terkunci sampai balasan datang, keputusan user 10 September 2026,
 * cuma mekanismenya yang pindah dari atribut peramban ke penjaga sendiri.
 */

import { ChevronDown } from "lucide-react";

import { FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";

import { adalahPeranBaru, PERAN_PILIHAN } from "../services/pengguna";
import type { PeranBaru } from "../types";

type SelectPeranProps = {
  /** `id` select — pemanggil memasangnya ke `<label htmlFor>` sendiri. */
  id: string;
  nilai: PeranBaru;
  sedangKirim: boolean;
  onUbah: (peran: PeranBaru) => void;
};

export function SelectPeran({ id, nilai, sedangKirim, onUbah }: SelectPeranProps) {
  return (
    <div
      aria-busy={sedangKirim}
      className={`relative flex h-11 items-center rounded-inset bg-inset px-3 ${FOCUS_RING_WITHIN}`}
    >
      <select
        id={id}
        value={nilai}
        aria-disabled={sedangKirim || undefined}
        onChange={(e) => {
          // Baris terkunci sampai balasan datang (keputusan user 10 September
          // 2026) — selama `sedangKirim`, perubahan diabaikan alih-alih
          // dicegah lewat `disabled` (lihat docstring berkas soal fokus).
          if (sedangKirim) return;
          const dipilih = e.target.value;
          // Nilai `<select>` selalu salah satu opsi yang kita render sendiri
          // dari `PERAN_PILIHAN`, jadi cabang gagal `adalahPeranBaru` di sini
          // mustahil dijalankan — tapi penjaga tipe di batas lebih baik
          // daripada `as PeranBaru` yang membohongi pembaca soal itu.
          if (adalahPeranBaru(dipilih)) onUbah(dipilih);
        }}
        className="w-full appearance-none bg-transparent pr-6 text-body-md text-ink focus:outline-none aria-disabled:text-faint"
      >
        {PERAN_PILIHAN.map((peran) => (
          <option key={peran} value={peran}>
            {peran}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        strokeWidth={1.5}
        aria-hidden="true"
        className="pointer-events-none absolute right-3 text-muted"
      />
    </div>
  );
}
