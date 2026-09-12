"use client";

/**
 * Bingkai Halaman Admin (PRD app §5.7): rail dipakai ulang + satu kolom
 * kartu. Tanpa peta dan tanpa panel kiri — `/admin` tidak punya wujud peta,
 * jadi seluruh hierarki dipikul tangga abu dan ukuran angka (DESIGN.md
 * § Halaman Admin).
 *
 * Tab aktif hidup di `useState`, BUKAN di URL. `/admin` tidak dibagikan
 * seperti lensa, dan menghindari `useSearchParams` menjaga rute ini tetap
 * prerender statis tanpa pembungkus `Suspense` — begitu hook itu masuk,
 * seluruh pohon menuntutnya.
 *
 * Gerbang peran memakai `!memuat && bisa(...)`, bukan `bisa(...)` sendirian:
 * `peran` bawaan `"anonim"` selama sesi masih dibaca, sehingga tanpa `memuat`
 * seorang admin sungguhan melihat kartu terkunci berkedip lebih dulu
 * (preseden `kartu-panel.tsx` fase 7).
 *
 * Tiga keadaan saling eksklusif, urutannya sengaja:
 * 1. `memuat` — kerangka, belum ada yang bisa dikatakan tentang peran;
 * 2. `galatPeran` — `BlokNotifikasi`, BUKAN kartu terkunci: sesi ini bisa
 *    saja milik admin dan yang gagal cuma pembacaan perannya. Menyebutnya
 *    "terkunci" akan menuduh yang salah;
 * 3. bukan admin — kartu terkunci plus dialog ajakan masuk sekali, pola yang
 *    sama dengan deep-link lensa terkunci (§5.6): tanpa redirect diam-diam,
 *    dan dialog berhenti muncul begitu ditutup.
 *
 * JEBAKAN (Task 9e): `DialogTerkunci` menangkap `document.activeElement` SAAT
 * DIPASANG sebagai target kembalinya fokus saat ditutup (lihat docstring
 * berkas itu) — pola yang benar untuk pemicu berupa KLIK (rail, tombol
 * Asisten), tapi di sini dialog dipasang dari SYARAT RENDER (peran belum
 * cukup), bukan dari klik, jadi tidak ada elemen yang baru saja menerima
 * fokus dan `document.activeElement` jatuh ke `<body>` — `body.focus()` saat
 * ditutup adalah no-op, fokus hilang begitu saja. Diperbaiki lewat prop
 * `kembaliKe` (`dialog-terkunci.tsx`): `judulTerkunciRef` diteruskan sebagai
 * target kembali eksplisit, dipakai sebagai fallback SEBELUM
 * `document.activeElement`, jadi tidak lagi bergantung urutan efek layout
 * vs. efek pasif.
 */

import { useId, useRef, useState, type ReactNode } from "react";
import { Shield } from "lucide-react";

import { bisa, PERAN_PEMBUKA } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { DialogTerkunci } from "@/features/auth/components/dialog-terkunci";
import { BlokNotifikasi } from "@/shared/components/shell/blok-notifikasi";
import { SideRail } from "@/shared/components/shell/side-rail";

import { AdminSidebar, type TabAdmin } from "./tab-bar";
import { TabBerita } from "./tab-berita";
import { TabPengguna } from "./tab-pengguna";
import { TabStatus } from "./tab-status";

/** Satu peta tab → panelnya, pola yang sama dengan `PANEL_LENSA` di
 * `dashboard-shell.tsx` — bukan rantai `if` yang tersebar. */
const PANEL_TAB: Record<TabAdmin, () => ReactNode> = {
  pengguna: () => <TabPengguna />,
  berita: () => <TabBerita />,
  status: () => <TabStatus />,
};

export function HalamanAdmin() {
  const { peran, adaSesi, memuat, galatPeran, cobaLagiPeran, email } = useSesi();
  const [tab, setTab] = useState<TabAdmin>("pengguna");
  const [dialogDitutup, setDialogDitutup] = useState(false);
  const idDasar = useId();
  const judulTerkunciRef = useRef<HTMLHeadingElement>(null);

  const bisaAdmin = !memuat && bisa(peran, "admin");
  const idTab = (t: TabAdmin) => `${idDasar}-tab-${t}`;
  const idPanel = (t: TabAdmin) => `${idDasar}-panel-${t}`;
  const terkunci = !memuat && !galatPeran && !bisaAdmin;

  return (
    <div className="flex h-dvh flex-col gap-2 bg-[#f1f2f6] p-4 pl-2 md:flex-row">
      <SideRail konteks="admin" />

      {/* Satu panel full di sisa rail: header Halaman Admin di atas, 
          sidebar menu di kiri, dan konten info di kanan */}
      <main
        id="isi"
        tabIndex={0}
        className="flex flex-1 h-full min-h-0 flex-col overflow-hidden rounded-card bg-white shadow-sm border border-line/40 focus:outline-none"
      >
        {/* Header Halaman Admin */}
        <header className="flex shrink-0 items-center justify-between border-b border-hairline px-6 py-4 bg-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Shield size={22} strokeWidth={2} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-title-md font-semibold text-ink">Halaman Admin</h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-badge font-medium text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Akses Administrator
                </span>
              </div>
              <p className="text-micro text-muted">
                Portal pengelolaan akun pengguna, kurasi berita desa, dan pemantauan sistem
              </p>
            </div>
          </div>
        </header>

        {memuat && (
          <div className="flex-1 p-6 flex flex-col gap-4 animate-pulse">
            <div className="h-20 rounded-xl bg-surface" />
            <div className="h-64 rounded-xl bg-surface" />
          </div>
        )}

        {!memuat && galatPeran && (
          <div className="flex-1 p-6">
            <BlokNotifikasi
              galat={galatPeran}
              konteks="Sesi ini aktif, tetapi perannya belum terbaca — jadi halaman ini belum bisa memastikan kamu admin. Coba lagi setelah layanan pulih."
              onCobaLagi={cobaLagiPeran}
            />
          </div>
        )}

        {terkunci && (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-surface text-muted">
              <Shield size={28} strokeWidth={1.5} />
            </div>
            <h2 ref={judulTerkunciRef} tabIndex={-1} className="text-title-md font-semibold text-ink outline-none">
              Halaman Admin terkunci
            </h2>
            <p className="mt-1.5 max-w-md text-body-md text-body">{PERAN_PEMBUKA.admin}</p>
          </div>
        )}

        {bisaAdmin && (
          <div className="flex flex-1 min-h-0 flex-col md:flex-row overflow-hidden">
            {/* Sidebar menu: Pengguna, Berita, Status */}
            <AdminSidebar
              tab={tab}
              onTab={setTab}
              idPanel={idPanel}
              idTab={idTab}
              emailAdmin={email}
            />

            {/* Konten kanan sesuai menu aktif */}
            <div
              key={tab}
              role="tabpanel"
              id={idPanel(tab)}
              aria-labelledby={idTab(tab)}
              className="flex-1 min-h-0 overflow-y-auto p-6 md:p-8 bg-white"
            >
              {PANEL_TAB[tab]()}
            </div>
          </div>
        )}
      </main>

      {terkunci && !dialogDitutup && (
        <DialogTerkunci
          kemampuan="admin"
          nama="Halaman Admin"
          tujuan="/admin"
          adaSesi={adaSesi}
          onTutup={() => setDialogDitutup(true)}
          kembaliKe={judulTerkunciRef}
        />
      )}
    </div>
  );
}
