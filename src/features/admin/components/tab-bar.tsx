"use client";

import { FOCUS_RING } from "@/shared/components/focus-ring";

/** Tiga bagian Halaman Admin (PRD app §5.7). */
export type TabAdmin = "pengguna" | "berita" | "status";

type TabBarProps = {
  tab: TabAdmin;
  onTab: (tab: TabAdmin) => void;
  /** `id` elemen tabpanel per tab — dipasok pemanggil supaya `aria-controls`
   * dan `aria-labelledby` menunjuk pasangan yang sama. */
  idPanel: (tab: TabAdmin) => string;
  /** `id` tombol tab per tab. */
  idTab: (tab: TabAdmin) => string;
};

/** Daftar tab (konstanta modul) — diekspor supaya pemanggil bisa memetakan
 * `idPanel`/`idTab` dan urutan navigasi panah tanpa mengulang nama tab. */
export const TAB_ADMIN: readonly { id: TabAdmin; nama: string }[] = [
  { id: "pengguna", nama: "Pengguna" },
  { id: "berita", nama: "Berita" },
  { id: "status", nama: "Status" },
];

/**
 * Bar tab bergaris bawah untuk tiga bagian Halaman Admin (DESIGN.md § Tab
 * Bar). BUKAN `chip-filter`: tab memindahkan BAGIAN, chip menyaring DAFTAR —
 * bentuknya sengaja berbeda supaya anggaran satu aksi oranye per layar
 * (tint `primary-soft`) tidak pernah disentuh oleh tab; tab memang tidak
 * pernah menjadi aksi itu.
 *
 * Roving tabindex: hanya tab aktif ber-`tabIndex=0`, sisanya `-1`, supaya
 * `Tab` browser melompati tab yang sedang tidak aktif dan mendarat langsung
 * di konten. Navigasi panah didaftar pada WADAH (`role="tablist"`), meniru
 * `handleWadahKeyDown` di `search-box.tsx`, supaya satu handler menangani
 * seluruh tombol alih-alih menempel satu-satu di tiap tombol.
 */
export function TabBar({ tab, onTab, idPanel, idTab }: TabBarProps) {
  function pindahFokus(tujuan: TabAdmin) {
    onTab(tujuan);
    // Fokus lewat `document.getElementById`, bukan ref per tombol: ketiga
    // tombol tab selalu ada di DOM (tidak dipasang/dilepas saat pindah tab),
    // jadi id sudah cukup tanpa perlu array ref sejajar dengan TAB_ADMIN.
    document.getElementById(idTab(tujuan))?.focus();
  }

  function handleWadahKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const indeksSekarang = TAB_ADMIN.findIndex((t) => t.id === tab);

    if (e.key === "ArrowRight") {
      e.preventDefault();
      pindahFokus(TAB_ADMIN[(indeksSekarang + 1) % TAB_ADMIN.length].id);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      pindahFokus(TAB_ADMIN[(indeksSekarang - 1 + TAB_ADMIN.length) % TAB_ADMIN.length].id);
    } else if (e.key === "Home") {
      e.preventDefault();
      pindahFokus(TAB_ADMIN[0].id);
    } else if (e.key === "End") {
      e.preventDefault();
      pindahFokus(TAB_ADMIN[TAB_ADMIN.length - 1].id);
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Bagian Halaman Admin"
      onKeyDown={handleWadahKeyDown}
      className="flex gap-6 border-b border-hairline"
    >
      {TAB_ADMIN.map((t) => {
        const aktif = t.id === tab;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={idTab(t.id)}
            aria-selected={aktif}
            // Hanya tab AKTIF yang mendapat `aria-controls`: `halaman-admin.tsx`
            // cuma merender satu tabpanel (yang aktif) sekaligus, jadi
            // `aria-controls` pada dua tab lain menunjuk id yang tidak pernah
            // ada di DOM (Task 9a).
            aria-controls={aktif ? idPanel(t.id) : undefined}
            tabIndex={aktif ? 0 : -1}
            onClick={() => onTab(t.id)}
            className={`relative h-10 text-label ${aktif ? "text-ink" : "text-muted hover:text-ink"} ${FOCUS_RING}`}
          >
            {t.nama}
            {aktif && <span aria-hidden="true" className="absolute inset-x-0 -bottom-px h-0.5 bg-ink" />}
          </button>
        );
      })}
    </div>
  );
}
