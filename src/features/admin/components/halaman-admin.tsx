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

import { bisa, PERAN_PEMBUKA } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { DialogTerkunci } from "@/features/auth/components/dialog-terkunci";
import { BlokNotifikasi } from "@/shared/components/shell/blok-notifikasi";
import { SideRail } from "@/shared/components/shell/side-rail";

import { TabBar, type TabAdmin } from "./tab-bar";
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
  const { peran, adaSesi, memuat, galatPeran, cobaLagiPeran } = useSesi();
  const [tab, setTab] = useState<TabAdmin>("pengguna");
  const [dialogDitutup, setDialogDitutup] = useState(false);
  const idDasar = useId();
  const judulTerkunciRef = useRef<HTMLHeadingElement>(null);

  const bisaAdmin = !memuat && bisa(peran, "admin");
  const idTab = (t: TabAdmin) => `${idDasar}-tab-${t}`;
  const idPanel = (t: TabAdmin) => `${idDasar}-panel-${t}`;
  const terkunci = !memuat && !galatPeran && !bisaAdmin;

  return (
    <div className="flex h-dvh gap-2 bg-canvas p-2">
      <SideRail konteks="admin" />

      {/* `tabIndex={0}` di SINI, bukan di tabpanel (Task 9d): `<main>` adalah
          wadah gulir sungguhan (`overflow-y-auto`) — tabpanel penuh kontrol
          fokusabel sendiri (input cari, select peran, tombol), jadi
          menaruh tabIndex di sana menambah satu tab stop kosong tak berlabel
          sebelum kontrol sungguhan. Dipertahankan (bukan dibuang) supaya
          panel yang isinya lebih panjang dari layar tetap bisa digulir
          keyboard. */}
      {/* `id="isi"` adalah target skip link yang dipasang layout akar
          (`src/app/layout.tsx`). Tanpa itu skip link di rute ini menunjuk
          jangkar yang tidak ada — Lighthouse menangkapnya sebagai
          "Skip links are not focusable / No skip link target" dan skor a11y
          `/admin` turun ke 98. Setiap rute yang punya landmark utama WAJIB
          memakai id yang sama. */}
      <main id="isi" tabIndex={0} className="flex flex-1 flex-col gap-2 overflow-y-auto">
        <section className="rounded-card bg-surface p-5">
          <h1 className="text-title-lg text-ink">Halaman Admin</h1>
          {bisaAdmin && (
            <div className="mt-4">
              <TabBar tab={tab} onTab={setTab} idPanel={idPanel} idTab={idTab} />
            </div>
          )}
        </section>

        {memuat && (
          <>
            <div className="h-32 animate-pulse rounded-card bg-surface" />
            <div className="h-32 animate-pulse rounded-card bg-surface" />
          </>
        )}

        {!memuat && galatPeran && (
          <BlokNotifikasi
            galat={galatPeran}
            konteks="Sesi ini aktif, tetapi perannya belum terbaca — jadi halaman ini belum bisa memastikan kamu admin. Coba lagi setelah layanan pulih."
            onCobaLagi={cobaLagiPeran}
          />
        )}

        {terkunci && (
          <section className="rounded-card bg-surface p-5">
            {/* `tabIndex={-1}` — target fokus terprogram saja (lihat JEBAKAN
                Task 9e di atas), bukan tab stop baru. */}
            <h2 ref={judulTerkunciRef} tabIndex={-1} className="text-title-md text-ink outline-none">
              Halaman Admin terkunci
            </h2>
            <p className="mt-1 text-body-md text-body">{PERAN_PEMBUKA.admin}</p>
          </section>
        )}

        {bisaAdmin && (
          // `key={tab}` supaya state panel yang ditinggalkan (kata kunci cari,
          // desa terpilih, baris yang sedang dikonfirmasi) tidak terbawa saat
          // tab dibuka lagi.
          <div
            key={tab}
            role="tabpanel"
            id={idPanel(tab)}
            aria-labelledby={idTab(tab)}
            className="flex flex-col gap-2"
          >
            {PANEL_TAB[tab]()}
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
