"use client";

import { useRef, useState, type ComponentType } from "react";

import { Shield } from "lucide-react";
import Link from "next/link";

import { bisa, KEMAMPUAN_LENSA, type Kemampuan } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { MenuAkun } from "@/features/auth/components/menu-akun";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import type { Lensa } from "@/lib/url-state";

import {
  AkunIcon,
  ChevronRightIcon,
  CitraIcon,
  JalurIcon,
  KartuIcon,
  KembarIcon,
  LockBadge,
  PetaPeranIcon,
} from "../icons";

export type LensaRailItem = {
  nama: string;
  icon: ComponentType<{ className?: string }>;
  lensa: Lensa;
};

/** Urutan PRD §5.2 = urutan "Lima fitur utama" di GLOSSARY.md. Diekspor:
 * dashboard-shell.tsx memakainya untuk mencari nama lensa saat membangun
 * dialog ajakan masuk dari deep-link (bukan menduplikasi peta nama). */
export const LENSA_ITEMS: readonly LensaRailItem[] = [
  { nama: "Peta Peran", icon: PetaPeranIcon, lensa: "peta-peran" },
  { nama: "Kartu Ekonomi Desa", icon: KartuIcon, lensa: "kartu" },
  { nama: "Jalur Ekonomi", icon: JalurIcon, lensa: "jalur-ekonomi" },
  { nama: "Desa Kembar", icon: KembarIcon, lensa: "desa-kembar" },
  { nama: "Citra Potensi Desa", icon: CitraIcon, lensa: "citra-potensi" },
];

/**
 * Dua konteks, satu rail (fase 8). Union terdiskriminasi, BUKAN prop opsional:
 * konteks `"admin"` tidak punya panel untuk dilipat dan tidak punya lensa
 * aktif, jadi menandai kelima prop dasbor sebagai opsional akan membuat
 * pemanggil dasbor bisa lupa mengirimnya tanpa satu pun galat tipe. Union
 * memaksa `tsc` menunjuk tiap pemanggil yang belum diperbarui.
 */
type SideRailProps =
  | {
      konteks: "dasbor";
      /** Panel kiri sedang terlipat — menampakkan tombol buka di rail. */
      collapsed: boolean;
      /** Buka kembali panel kiri (tombol hanya tampak saat `collapsed`). */
      onOpenPanel: () => void;
      /** Logo: lipat panel kiri + reset pilihan wilayah. Lensa aktif tidak berubah. */
      onLogoClick: () => void;
      /** Butir lensa terkunci diklik — shell merender `DialogTerkunci` (Task 22 fase 2). */
      onKlikTerkunci: (kemampuan: Kemampuan, nama: string) => void;
      /** Butir lensa TAK terkunci diklik — shell mengganti `?lensa=` lewat
       * `wilayah.gantiLensa` (Task 15). */
      onPilihLensa: (lensa: Lensa) => void;
      /** Lensa yang sedang dirender (`lensaEfektif` shell, bukan `?lensa=` mentah
       * — keduanya sama kecuali lensa di URL terkunci untuk peran ini) — penentu
       * pill aktif dan `aria-current`. */
      lensaAktif: Lensa;
    }
  | { konteks: "admin" };

const KELAS_BUTIR = "relative flex size-9 items-center justify-center rounded-control";

/**
 * Rail vertikal dari `md` ke atas, strip mendatar di kaki layar di bawahnya
 * (fase 9, Sketsa 5 yang di-acc user 10 September 2026). Geometri dari `md`
 * ke atas TIDAK bergeser satu piksel pun dari sebelum fase 9 — `w-16`,
 * `flex-col`, `gap-4`, `py-4` — karena satu piksel selisih membuat rail
 * melompat saat berpindah antara `/` dan `/admin`.
 *
 * `overflow-x-auto` di bawah `md` (temuan review gelombang 2): strip itu bisa
 * lebih panjang daripada layar — peran admin membawa butir kedelapan dan
 * panel terlipat menambah tombol buka, sehingga di 375px totalnya menembus
 * lebar layar. Gulirnya ditahan DI DALAM strip, pola yang sama dengan Matriks
 * Penugasan Aktor di DESIGN.md, alih-alih dibiarkan menjadi gulir mendatar
 * pada `body` yang justru dilarang audit responsif. `gap-2` menunda titik itu
 * sejauh mungkin tanpa mengecilkan satu pun target sentuh (tetap 36px).
 */
const KELAS_NAV =
  "z-30 order-last flex h-16 w-full shrink-0 flex-row items-center gap-2 overflow-x-auto rounded-card bg-rail px-4 md:order-none md:h-auto md:w-16 md:flex-col md:gap-4 md:overflow-x-visible md:px-0 md:py-4";

/**
 * Rail navigasi, hidup di dua rute (PRD §5.2). Di dasbor butir lensa adalah
 * tombol yang mengganti `?lensa=` tanpa berpindah halaman; di `/admin` butir
 * yang sama menjadi tautan kembali ke `/?lensa=…`, karena dari halaman lain
 * berpindah lensa memang berpindah halaman.
 *
 * Butir lensa TERKUNCI di `/admin` tetap tautan, bukan pemicu dialog: mendarat
 * di `/` dengan `?lensa=` yang terkunci sudah memicu dialog ajakan masuk milik
 * `dashboard-shell.tsx` (gerbang deep-link fase 2). Menyalin logika dialog ke
 * sini akan membuat dua sumber untuk satu perilaku.
 *
 * Butir **Admin** tidak pernah digembok seperti lensa — PRD §5.2 butir 7
 * menuliskannya "hanya terlihat peran admin", jadi peran lain tidak melihat
 * butirnya sama sekali dan tidak ada `LockBadge` di sana.
 *
 * Geometri (`w-16`, `gap-4`, `py-4`, `size-9` per butir) IDENTIK di kedua
 * konteks: satu piksel selisih membuat rail melompat saat pindah rute.
 */
export function SideRail(props: SideRailProps) {
  const { peran, memuat, adaSesi } = useSesi();
  const akunTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuTerbuka, setMenuTerbuka] = useState(false);

  const diAdmin = props.konteks === "admin";
  const bisaAdmin = bisa(peran, "admin");

  return (
    <nav
      aria-label="Navigasi: logo, lensa, Halaman Admin, panel, akun"
      className={KELAS_NAV}
    >
      {diAdmin ? (
        <Link
          href="/"
          title="Simpul Desa — kembali ke dasbor"
          aria-label="Simpul Desa — kembali ke dasbor"
          className={`flex size-9 items-center justify-center rounded-control text-ink ${FOCUS_RING}`}
        >
          <LogoSimpul />
        </Link>
      ) : (
        <button
          type="button"
          onClick={props.onLogoClick}
          title="Simpul Desa — lipat panel dan reset pilihan wilayah"
          aria-label="Simpul Desa — lipat panel dan reset pilihan wilayah"
          className={`flex size-9 items-center justify-center rounded-control text-ink ${FOCUS_RING}`}
        >
          <LogoSimpul />
        </button>
      )}

      <div className="flex flex-row items-center gap-1 md:flex-col">
        {LENSA_ITEMS.map(({ nama, icon: Icon, lensa }) => {
          const kemampuan = KEMAMPUAN_LENSA[lensa];
          const terkunci = !bisa(peran, kemampuan);
          // Pill aktif dan `aria-current` mengikuti LENSA YANG SEDANG
          // DIRENDER, bukan status terbuka/terkunci. Sampai fase 1 keduanya
          // kebetulan sama karena hanya Kartu yang terbuka; begitu peran
          // membuka empat lensa lain, mengikat gaya aktif ke `terkunci`
          // membuat kelima butir tampil aktif sekaligus dan pembaca layar
          // menyebut lima "current page". Warna: `muted` saat rest, `ink` +
          // pill `surface` saat aktif (DESIGN.md § Layout, bagian Rail). Di
          // `/admin` tidak ada lensa yang sedang dirender, jadi nol butir aktif.
          const aktif = !diAdmin && lensa === props.lensaAktif;
          const kelas = `${KELAS_BUTIR} ${FOCUS_RING} ${aktif ? "bg-surface text-ink" : "text-muted"}`;
          const lencana = !memuat && terkunci && <LockBadge />;
          // Diangkat di atas cabang `diAdmin` (temuan A15 lanjutan) supaya
          // kedua konteks mengumumkan kunci yang sama — sebelumnya butir
          // terkunci di `/admin` hanya menampilkan `LockBadge` visual tanpa
          // kata "terkunci" untuk pembaca layar.
          const judulTombol = terkunci ? `${nama} terkunci. Masuk untuk membukanya.` : nama;
          const labelTombol = terkunci ? `${nama}, terkunci. Masuk untuk membukanya.` : nama;

          if (diAdmin) {
            return (
              <Link
                key={lensa}
                href={`/?lensa=${lensa}`}
                title={judulTombol}
                aria-label={labelTombol}
                className={kelas}
              >
                <Icon className="size-5!" />
                {lencana}
              </Link>
            );
          }

          return (
            <button
              key={lensa}
              type="button"
              onClick={
                terkunci
                  ? () => props.onKlikTerkunci(kemampuan, nama)
                  : () => props.onPilihLensa(lensa)
              }
              title={judulTombol}
              aria-label={labelTombol}
              aria-current={aktif ? "page" : undefined}
              className={kelas}
            >
              <Icon className="size-5!" />
              {lencana}
            </button>
          );
        })}
      </div>

      <span className="h-6 w-px bg-line-strong/60 md:h-px md:w-6" />

      {/* Butir Admin (PRD §5.2 butir 7) — dirender HANYA untuk peran admin,
          tanpa penanda kunci: peran lain tidak melihatnya sama sekali. */}
      {!memuat && bisaAdmin && (
        <Link
          href="/admin"
          title="Halaman Admin"
          aria-label="Halaman Admin"
          aria-current={diAdmin ? "page" : undefined}
          className={`${KELAS_BUTIR} ${FOCUS_RING} ${diAdmin ? "bg-surface text-ink" : "text-muted"}`}
        >
          <Shield size={20} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      )}

      {/* Di bawah pemisah (bukan di atas kelompok lensa) supaya posisi
          kelompok lensa tidak bergeser saat panel dilipat/dibuka. */}
      {!diAdmin && props.collapsed && (
        <button
          type="button"
          onClick={props.onOpenPanel}
          title="Buka panel"
          aria-label="Buka panel"
          className={`flex size-9 items-center justify-center rounded-control text-muted ${FOCUS_RING}`}
        >
          <ChevronRightIcon />
        </button>
      )}

      {/* `adaSesi`, bukan `peran === "anonim"` — peran bisa melantai ke
          `"tamu"` saat sesi ADA tapi bacaannya gagal (`peranEfektif`),
          dan pengguna itu tetap sudah masuk: rail-nya menu Akun, bukan
          tautan Masuk. */}
      {/* `aria-haspopup="dialog"`, bukan `"menu"`: `MenuAkun` membuang
          `role="menu"` di fase 9 (temuan A15) karena anaknya — email, peran
          aktif, hairline, blok galat — bukan `menuitem`, sehingga pembaca
          layar memangkas justru dua informasi yang menjadi alasan popup itu
          ada. `aria-haspopup` harus menyebut apa yang benar-benar dibuka,
          bukan apa yang dulu diklaim. */}
      {adaSesi ? (
        <div className="relative z-30 ms-auto md:ms-0 md:mt-auto">
          <button
            ref={akunTriggerRef}
            type="button"
            onClick={() => setMenuTerbuka((sebelumnya) => !sebelumnya)}
            title="Akun"
            aria-label="Akun"
            aria-haspopup="dialog"
            aria-expanded={menuTerbuka}
            className={`flex size-9 items-center justify-center rounded-control text-ink ${FOCUS_RING}`}
          >
            <AkunIcon />
          </button>
          {menuTerbuka && (
            <MenuAkun triggerRef={akunTriggerRef} onTutup={() => setMenuTerbuka(false)} />
          )}
        </div>
      ) : (
        <Link
          href="/masuk"
          title="Masuk"
          aria-label="Masuk"
          className={`ms-auto flex size-9 items-center justify-center rounded-control text-muted md:ms-0 md:mt-auto ${FOCUS_RING}`}
        >
          <AkunIcon />
        </Link>
      )}
    </nav>
  );
}

/** Logo dummy MVP (PRD §5.2) — dipakai dua kali di atas, sebagai tombol di
 * dasbor dan sebagai tautan pulang di `/admin`. */
function LogoSimpul() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
      <path
        d="M12 3.2 20 8v8l-8 4.8L4 16V8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}
