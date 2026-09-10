"use client";

import { useEffect, useRef, useState } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { KeadaanKosong } from "@/shared/components/blok-keadaan";
import { FOCUS_RING, FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import { SearchIcon } from "@/shared/components/icons";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatAngka } from "@/shared/format";
import { useCariDesa } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

type WilayahState = ReturnType<typeof useWilayahParams>;

type SearchBoxProps = {
  onPilih: WilayahState["pilihDesa"];
};

const ID_LISTBOX = "hasil-cari-desa";
const PANJANG_MIN_TAMPIL = 2;
/** Tombol baris hasil — SATU-SATUNYA `<button>` di dalam wadah (Task 5b:
 * `role="option"` dibuang, jadi tidak bisa lagi diseleksi lewat selektor
 * ARIA), diseleksi lewat elemen `<ul id={ID_LISTBOX}>`-nya. */
const SELEKTOR_OPSI = `#${ID_LISTBOX} button`;

/**
 * Kolom cari desa (Task 23) — pengganti field statis lama di `map-stage.tsx`,
 * dipasang lewat slot `searchSlot` (map-stage tidak tahu isi kolom cari).
 * Debounce+`enabled` ada di `useCariDesa` (Task 20); komponen ini hanya
 * meneruskan nilai ketikan mentah.
 *
 * Navigasi keyboard (review Blok D #3) didaftar pada WADAH (input+dropdown),
 * bukan cuma input, supaya ↓ dari input maupun dari satu baris hasil
 * sama-sama tertangkap satu handler. Esc menutup dropdown DAN mengembalikan
 * fokus ke input. ↓/↑ memindah FOKUS DOM antar tombol hasil — cukup untuk
 * a11y dasar, tidak perlu pola `aria-activedescendant` penuh. Enter memilih
 * baris yang sedang fokus lewat perilaku bawaan `<button>`, tanpa handler
 * tambahan.
 *
 * Task 5 (dua cacat, keduanya terverifikasi): (a) dulu `onFocus` pada input
 * membuka dropdown — Esc menutup lalu memanggil `inputRef.current.focus()`,
 * `focus()` mendispatch `focusin` SINKRON, `onFocus` menembak `setTerbuka
 * (true)` di batch React YANG SAMA, jadi dropdown selalu terbuka lagi
 * persis sesudah Esc menutupnya. Diperbaiki: pembuka dropdown bukan lagi
 * `onFocus`, melainkan `onChange` (mengetik) dan `onMouseDown` (klik masuk
 * ke input yang sudah berisi hasil sebelumnya) — `focus()` terprogram tidak
 * pernah memicu `mousedown`, jadi Esc-lalu-fokus-balik aman. (b) `role=
 * "option"` pada `<button>` melanggar larangan ARIA 1.2 "interactive
 * descendant di dalam `option`", dan pola combobox seharusnya menahan FOKUS
 * DOM di input dengan `aria-activedescendant` (tidak pernah dipasang di
 * sini) — bukan memindah fokus DOM sungguhan seperti kode ini. Perbaikannya
 * MEMBUANG ARIA, bukan menambah: `role="listbox"`/`"option"`/`"combobox"`,
 * `aria-selected`, `aria-autocomplete` semua dilepas; `<ul>`/`<li>`/`<button>`
 * kembali ke semantik nativenya.
 *
 * `aria-expanded` dan `aria-controls` IKUT dibuang (koreksi review gelombang
 * 3). Putaran pertama menyimpan keduanya lalu membungkam linter dengan
 * `eslint-disable`, padahal keduanya bukan properti yang didukung role
 * implisit `textbox` — ARIA 1.2 hanya mengizinkan `aria-activedescendant`,
 * `aria-autocomplete`, `aria-multiline`, `aria-placeholder`,
 * `aria-readonly`, dan `aria-required` di sana. Penggantinya region
 * `role="status"` yang mengumumkan cacah hasil: ia mengabarkan APA yang
 * berubah, bukan mengklaim hubungan yang tidak diimplementasikan.
 */
export function SearchBox({ onPilih }: SearchBoxProps) {
  const [q, setQ] = useState("");
  const [terbuka, setTerbuka] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wadahRef = useRef<HTMLDivElement>(null);

  // Task 11 (Gotcha 2): `isPending` — BUKAN `isLoading` — dipilih sengaja di
  // sini. `useCariDesa` men-debounce NILAI (`useNilaiTelat`, 300ms) sebelum
  // menyalakan `enabled`; ada jendela waktu di mana `q` mentah sudah cukup
  // panjang untuk membuka dropdown (`tampilkanDropdown`) tapi nilai
  // ter-debounce belum, sehingga query masih `enabled: false`. Selama
  // jendela itu `isPending` tetap `true` (query belum pernah jalan) sementara
  // `isLoading` sudah `false` (`isLoading = isFetching && isPending`, dan
  // query nonaktif tidak pernah `isFetching`) — memakai `isLoading` di sini
  // akan mengedipkan "Tidak ada desa cocok" palsu selama jeda debounce.
  const { data, isPending, isPaused, isError, error, refetch } = useCariDesa(q);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (wadahRef.current && !wadahRef.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function pilihHasil(hasil: NonNullable<typeof data>[number]) {
    onPilih(hasil.iddesa, { prov: hasil.idkab.slice(0, 2), kab: hasil.idkab });
    setQ("");
    setTerbuka(false);
    inputRef.current?.focus();
  }

  function handleWadahKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setTerbuka(false);
      inputRef.current?.focus();
      return;
    }

    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;

    const opsi = Array.from(wadahRef.current?.querySelectorAll<HTMLButtonElement>(SELEKTOR_OPSI) ?? []);
    if (opsi.length === 0) return;
    e.preventDefault();

    const indeksSekarang = opsi.indexOf(document.activeElement as HTMLButtonElement);

    if (e.key === "ArrowDown") {
      opsi[indeksSekarang < 0 ? 0 : Math.min(indeksSekarang + 1, opsi.length - 1)].focus();
    } else if (indeksSekarang <= 0) {
      inputRef.current?.focus();
    } else {
      opsi[indeksSekarang - 1].focus();
    }
  }

  const tampilkanDropdown = terbuka && q.trim().length >= PANJANG_MIN_TAMPIL;
  const keadaan = pilihKeadaan({
    isPending,
    isPaused,
    isError,
    kosong: (data?.length ?? 0) === 0,
  });

  // Task 4 (status region): cacah hasil, dan keadaan tidak-cocoknya. Diam
  // (string kosong) saat dropdown tertutup atau sedang muat/tertunda — belum
  // ada apa pun untuk diumumkan pada keadaan itu.
  const kalimatStatus = !tampilkanDropdown
    ? ""
    : keadaan === "kosong"
      ? "Tidak ada desa cocok."
      : keadaan === "isi"
        ? `${formatAngka(data?.length ?? 0)} desa ditemukan.`
        : "";

  return (
    <div ref={wadahRef} onKeyDown={handleWadahKeyDown} className="relative w-full">
      <label className={`flex h-11 items-center gap-3 rounded-full bg-float px-4 shadow-float ${FOCUS_RING_WITHIN}`}>
        <SearchIcon className="shrink-0 text-muted" />
        {/* NOL atribut ARIA di input ini, dan itu disengaja (koreksi review
            gelombang 3). Instruksi awal fase 9 menyuruh membuang
            `role="combobox"` tetapi MEMPERTAHANKAN `aria-expanded` dan
            `aria-controls` — itu keliru: keduanya bukan properti yang
            didukung role implisit `textbox` (ARIA 1.2 hanya mengizinkan
            `aria-activedescendant`, `aria-autocomplete`, `aria-multiline`,
            `aria-placeholder`, `aria-readonly`, `aria-required` di sana).
            Menyimpannya berarti melanggar ARIA lalu MEMBUNGKAM linternya
            dengan `eslint-disable` — menukar cacat dengan cacat yang tidak
            terlihat.

            Sekarang: input teks biasa, dan daftar hasil adalah `<ul>`
            berlabel berisi tombol. Kedatangan hasil diumumkan region
            `role="status"` di bawah — itulah pengganti sah `aria-expanded`,
            karena ia mengabarkan APA yang berubah alih-alih mengklaim
            hubungan yang tidak diimplementasikan. */}
        <input
          ref={inputRef}
          type="text"
          name="cari-desa"
          autoComplete="off"
          aria-label="Cari desa"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setTerbuka(true);
          }}
          onMouseDown={() => setTerbuka(true)}
          placeholder="Cari desa…"
          className="w-full min-w-0 truncate bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
        />
      </label>

      <p role="status" aria-live="polite" className="sr-only">
        {kalimatStatus}
      </p>

      {tampilkanDropdown && (
        <ul
          id={ID_LISTBOX}
          aria-label="Hasil cari desa"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-10 max-h-80 overflow-y-auto rounded-card bg-float p-2 shadow-float"
        >
          {keadaan === "muat" &&
            Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-12 animate-pulse rounded-control bg-surface" aria-hidden="true" />
            ))}

          {keadaan === "tertunda" && (
            <li className="px-3 py-4">
              <KeadaanKosong kalimat="Sambungan terputus, hasil belum bisa dimuat." />
              <button
                type="button"
                onClick={() => refetch()}
                className={`mt-1 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink ${FOCUS_RING}`}
              >
                Coba lagi
              </button>
            </li>
          )}

          {isError && (
            <li className="px-3 py-4 text-body-md text-muted">{pesanGalat(error).judul}</li>
          )}

          {keadaan === "kosong" && (
            <li className="px-3 py-4 text-body-md text-muted">Tidak ada desa cocok — coba nama lain</li>
          )}

          {keadaan === "isi" &&
            data?.map((d) => (
              <li key={d.iddesa}>
                <button
                  type="button"
                  onClick={() => pilihHasil(d)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-control px-3 py-2 text-left hover:bg-inset"
                >
                  <span className="text-title-sm text-ink">{d.nmdesa}</span>
                  <span className="text-label text-muted">
                    Kec. {d.nmkec} • Kab. {d.nmkab}
                  </span>
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
