"use client";

import { useEffect, useId, useRef, useState, type Ref } from "react";

import { FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import { useCariDesa } from "@/shared/hooks/queries-wilayah";

/** Satu baris hasil `useCariDesa` — diturunkan dari tipe kembalian hook itu
 * sendiri, bukan ditulis ulang tangan, supaya kalau skema `/api/desa/cari`
 * (`BarisIndeksKartu`) bertambah kolom, tipe ini ikut tanpa dua tempat yang
 * harus disinkronkan manual. Bentuknya lebih dari lima kolom yang dipakai
 * langsung di sini (juga bawa `zona`, `keyakinan`, dst.) — itu jujur pada apa
 * yang API sungguh kembalikan, bukan cacat.
 */
type HasilDesa = NonNullable<ReturnType<typeof useCariDesa>["data"]>[number];

type CariDesaAdminProps = {
  /** Teks `form-label` di atas field — pemanggil menentukannya karena dua
   * kartu memakai komponen ini untuk maksud yang berbeda. */
  label: string;
  placeholder: string;
  onPilih: (hasil: HasilDesa) => void;
  /** Ref opsional ke `<input>` internal — dipakai `pemilih-desa.tsx` untuk
   * mengembalikan fokus ke field cari saat chip terakhir dibuang (Task 9b).
   * React 19: fungsi komponen menerima `ref` sebagai prop biasa, tanpa
   * `forwardRef`. */
  ref?: Ref<HTMLInputElement>;
};

/** Panjang minimum ketikan sebelum dropdown ditampilkan (selaras dengan
 * ambang `enabled` di `useCariDesa`, bukan pengganti debounce-nya). */
const PANJANG_MIN_TAMPIL = 2;
/** Atribut data, BUKAN `role="option"` (lihat docstring komponen soal kenapa
 * ARIA option/listbox dibuang) — dipakai murni untuk navigasi panah, tanpa
 * membawa arti semantik apa pun ke pembaca layar. */
const SELEKTOR_OPSI = "[data-opsi-desa]";

/**
 * Pencarian desa DI DALAM kartu panel Halaman Admin. BUKAN pemakaian ulang
 * `SearchBox`: `SearchBox` terikat `wilayah.pilihDesa` dan berkulit
 * `search-field` (pil melayang + `shadow-float`), yang menurut DESIGN.md
 * § Form Controls khusus untuk field DI ATAS PETA. Field di dalam kartu
 * adalah `form-field` — `bg-inset`, `rounded-inset`, 44px, TANPA border dan
 * TANPA bayangan — jadi komponen ini butuh kulit sendiri walau perilaku
 * keyboard-nya meniru `SearchBox` apa adanya.
 *
 * Navigasi keyboard didaftar di WADAH (input+dropdown), persis
 * `handleWadahKeyDown` di `search-box.tsx`: Esc menutup dropdown DAN
 * mengembalikan fokus ke input; ↓/↑ memindah FOKUS DOM antar tombol hasil
 * (bukan `aria-activedescendant` penuh — cukup untuk a11y dasar); Enter
 * memilih baris yang sedang fokus lewat perilaku bawaan `<button>`, tanpa
 * handler tambahan.
 *
 * Dropdown berlatar `bg-inset` (bukan `bg-float` — komponen ini tidak
 * melayang di atas peta), sama seperti field-nya sendiri. Karena itu hover
 * baris TIDAK bisa memakai `hover:bg-inset` seperti di `SearchBox` (dropdown
 * di sana `bg-float`, jadi `bg-inset` masih kontras) — di sini itu jadi tak
 * kelihatan sama sekali. Dipakai `hover:bg-surface` (satu anak tangga lebih
 * gelap dari `inset`), token yang sama dipakai skeleton muat di bawah supaya
 * kontrasnya konsisten satu bahasa visual.
 *
 * ARIA combobox DIBUANG (Task 9f, BUKAN bagian sapuan biasa — satu-satunya
 * temuan yang perbaikannya MENGHAPUS ARIA, dikerjakan sadar): markup lama
 * memasang `role="combobox"`/`aria-autocomplete` di input dan
 * `role="listbox"`/`role="option"` di dropdown, padahal isinya melanggar pola
 * itu sendiri — opsi kosong tanpa role, skeleton `aria-hidden`, dan opsi
 * sungguhan berupa `<button>` yang memegang FOKUS DOM asli (bukan
 * `aria-activedescendant`, yang wajib untuk combobox ber-listbox). ARIA yang
 * berbohong tentang strukturnya sendiri lebih buruk daripada tanpa ARIA:
 * pembaca layar diberitahu satu bentuk (listbox dengan opsi) padahal
 * berinteraksi dengan bentuk lain (daftar tombol biasa).
 *
 * `aria-expanded` dan `aria-controls` juga IKUT dibuang (koreksi review
 * gelombang 3). Putaran pertama menyimpan keduanya dan menganggapnya "masih
 * benar", lalu membungkam linter dengan `eslint-disable` — padahal keduanya
 * bukan properti yang didukung role implisit `textbox`. ARIA 1.2 hanya
 * mengizinkan `aria-activedescendant`, `aria-autocomplete`, `aria-multiline`,
 * `aria-placeholder`, `aria-readonly`, dan `aria-required` di sana. Yang
 * bertahan hanya `aria-label` pada `<ul>`, dan kabar jumlah hasil lewat
 * region `role="status"` terpisah — pengganti sah `aria-expanded`, karena ia
 * mengabarkan APA yang berubah alih-alih mengklaim hubungan yang tidak
 * diimplementasikan.
 */
export function CariDesaAdmin({ label, placeholder, onPilih, ref }: CariDesaAdminProps) {
  const [q, setQ] = useState("");
  const [terbuka, setTerbuka] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const wadahRef = useRef<HTMLDivElement>(null);
  const idInput = useId();
  const idListbox = useId();
  // Lihat GOTCHA di `handleWadahKeyDown` — `.focus()` panggil `onFocus`
  // SECARA SINKRON, dalam batch React yang SAMA dengan `setTerbuka(false)`
  // Escape. Bendera ref (bukan pemeriksaan `document.activeElement`, yang
  // bernilai false justru pada kasus yang rusak) menandai "abaikan onFocus
  // BERIKUTNYA" supaya keduanya tidak saling membalikkan.
  const abaikanFokusRef = useRef(false);

  const { data, isLoading } = useCariDesa(q);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (wadahRef.current && !wadahRef.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function pilihHasil(hasil: HasilDesa) {
    onPilih(hasil);
    setQ("");
    setTerbuka(false);
    inputRef.current?.focus();
  }

  function handleWadahKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") {
      setTerbuka(false);
      abaikanFokusRef.current = true;
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
  const jumlahHasil = data?.length ?? 0;

  return (
    <div ref={wadahRef} onKeyDown={handleWadahKeyDown} className="relative w-full">
      <label htmlFor={idInput} className="mb-1 block text-label text-muted">
        {label}
      </label>

      <div className={`flex h-11 items-center rounded-inset bg-inset px-3 ${FOCUS_RING_WITHIN}`}>
        {/* NOL atribut ARIA di input ini, disengaja — sama seperti
            `search-box.tsx`, dan atas alasan yang sama (koreksi review
            gelombang 3). `aria-expanded` dan `aria-controls` bukan properti
            yang didukung role implisit `textbox`, jadi mempertahankannya
            berarti melanggar ARIA lalu membungkam linternya dengan
            `eslint-disable`. Kedatangan hasil diumumkan region
            `role="status"` di bawah. */}
        <input
          ref={(elemen) => {
            inputRef.current = elemen;
            if (typeof ref === "function") ref(elemen);
            else if (ref) ref.current = elemen;
          }}
          id={idInput}
          type="text"
          autoComplete="off"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setTerbuka(true);
          }}
          onFocus={() => {
            if (abaikanFokusRef.current) {
              abaikanFokusRef.current = false;
              return;
            }
            setTerbuka(true);
          }}
          placeholder={placeholder}
          className="w-full min-w-0 truncate bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
        />
      </div>

      {/* Region pengumuman jumlah hasil — dipasang PERMANEN (bukan hanya
          saat dropdown tampil) supaya perubahan teksnya diumumkan pembaca
          layar; region yang baru dipasang bersamaan dengan isinya tidak
          diumumkan andal (DESIGN.md § Empty, Loading & Error States). */}
      <p role="status" aria-live="polite" className="sr-only">
        {tampilkanDropdown && !isLoading && `${jumlahHasil} desa ditemukan`}
      </p>

      {tampilkanDropdown && (
        <ul
          id={idListbox}
          aria-label="Hasil cari desa"
          className="absolute inset-x-0 top-[calc(100%+8px)] z-10 max-h-80 overflow-y-auto rounded-card bg-inset p-2"
        >
          {isLoading &&
            Array.from({ length: 3 }, (_, i) => (
              <li key={i} className="h-12 animate-pulse rounded-control bg-surface" aria-hidden="true" />
            ))}

          {!isLoading && jumlahHasil === 0 && (
            <li className="px-3 py-4 text-body-md text-muted">Tidak ada desa cocok — coba nama lain</li>
          )}

          {!isLoading &&
            data?.map((d) => (
              <li key={d.iddesa}>
                <button
                  type="button"
                  data-opsi-desa
                  onClick={() => pilihHasil(d)}
                  className="flex w-full flex-col items-start gap-0.5 rounded-control px-3 py-2 text-left hover:bg-surface"
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
