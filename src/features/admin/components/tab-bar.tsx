"use client";

import type { ComponentType } from "react";
import { Activity, Newspaper, Users } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";

/** Tiga bagian Halaman Admin (PRD app §5.7). */
export type TabAdmin = "pengguna" | "berita" | "status";

export type ItemTabAdmin = {
  id: TabAdmin;
  nama: string;
  deskripsi: string;
  icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
};

type TabBarProps = {
  tab: TabAdmin;
  onTab: (tab: TabAdmin) => void;
  /** `id` elemen tabpanel per tab — dipasok pemanggil supaya `aria-controls`
   * dan `aria-labelledby` menunjuk pasangan yang sama. */
  idPanel: (tab: TabAdmin) => string;
  /** `id` tombol tab per tab. */
  idTab: (tab: TabAdmin) => string;
  /** Email admin yang sedang aktif untuk penanda identitas di sidebar. */
  emailAdmin?: string | null;
};

/** Daftar tab dan metadata navigasi sidebar admin. */
export const TAB_ADMIN: readonly ItemTabAdmin[] = [
  {
    id: "pengguna",
    nama: "Pengguna",
    deskripsi: "Kelola akun & peran pengguna",
    icon: Users,
  },
  {
    id: "berita",
    nama: "Berita",
    deskripsi: "Penyegaran feed & kurasi",
    icon: Newspaper,
  },
  {
    id: "status",
    nama: "Status",
    deskripsi: "Kesehatan sistem & data",
    icon: Activity,
  },
];

/**
 * Sidebar navigasi Halaman Admin: menu Pengguna, Berita, Status.
 *
 * Roving tabindex: hanya tab aktif ber-`tabIndex=0`, sisanya `-1`, supaya
 * `Tab` browser melompati tab yang sedang tidak aktif dan mendarat langsung
 * di konten panel. Mendukung navigasi panah atas/bawah (dan kiri/kanan).
 */
export function AdminSidebar({ tab, onTab, idPanel, idTab, emailAdmin }: TabBarProps) {
  function pindahFokus(tujuan: TabAdmin) {
    onTab(tujuan);
    document.getElementById(idTab(tujuan))?.focus();
  }

  function handleWadahKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const indeksSekarang = TAB_ADMIN.findIndex((t) => t.id === tab);

    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      pindahFokus(TAB_ADMIN[(indeksSekarang + 1) % TAB_ADMIN.length].id);
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
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
    <aside className="flex w-full shrink-0 flex-col justify-between border-b border-hairline bg-surface/35 p-3 md:w-64 md:border-b-0 md:border-r md:p-4 lg:w-72">
      <div>
        <div className="mb-2 px-3 pt-1">
          <p className="text-micro font-medium uppercase tracking-wider text-muted">
            Menu Administrasi
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Menu Halaman Admin"
          aria-orientation="vertical"
          onKeyDown={handleWadahKeyDown}
          className="flex flex-row gap-1.5 overflow-x-auto md:flex-col md:overflow-x-visible pb-1 md:pb-0"
        >
          {TAB_ADMIN.map((t) => {
            const aktif = t.id === tab;
            const Icon = t.icon;

            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={idTab(t.id)}
                aria-selected={aktif}
                aria-controls={aktif ? idPanel(t.id) : undefined}
                tabIndex={aktif ? 0 : -1}
                onClick={() => onTab(t.id)}
                className={`group flex flex-1 cursor-pointer items-center gap-3 rounded-xl px-3.5 py-3 text-left transition-all md:flex-none ${FOCUS_RING} ${
                  aktif
                    ? "bg-float text-ink shadow-xs border border-line/60"
                    : "border border-transparent text-body hover:bg-float/70 hover:text-ink"
                }`}
              >
                <div
                  className={`flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                    aktif
                      ? "bg-primary/10 text-primary"
                      : "bg-surface text-muted group-hover:bg-surface group-hover:text-ink"
                  }`}
                >
                  <Icon size={18} strokeWidth={aktif ? 2 : 1.75} />
                </div>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-title-sm truncate leading-tight ${
                      aktif ? "font-semibold text-ink" : "font-medium text-body"
                    }`}
                  >
                    {t.nama}
                  </p>
                  <p className="hidden text-micro text-muted truncate lg:block mt-0.5">
                    {t.deskripsi}
                  </p>
                </div>

                {aktif && (
                  <span
                    aria-hidden="true"
                    className="hidden size-1.5 shrink-0 rounded-full bg-primary md:block"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {emailAdmin && (
        <div className="hidden border-t border-hairline pt-3 mt-4 md:block px-3">
          <p className="text-micro text-muted">Akun Admin</p>
          <p className="text-micro font-medium text-ink truncate mt-0.5" title={emailAdmin}>
            {emailAdmin}
          </p>
        </div>
      )}
    </aside>
  );
}

/** Alias untuk kompatibilitas */
export { AdminSidebar as TabBar };
