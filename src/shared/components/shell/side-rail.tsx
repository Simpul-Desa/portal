"use client";

import type { ComponentType } from "react";

import { Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { bisa, KEMAMPUAN_LENSA, type Kemampuan } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { MenuAkun } from "@/features/auth/components/menu-akun";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import type { Lensa } from "@/lib/url-state";

import {
  AkunIcon,
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
  isML?: boolean;
};

/** Urutan PRD §5.2 = urutan "Lima fitur utama" di GLOSSARY.md. Diekspor:
 * dashboard-shell.tsx memakainya untuk mencari nama lensa saat membangun
 * dialog ajakan masuk dari deep-link (bukan menduplikasi peta nama). */
export const LENSA_ITEMS: readonly LensaRailItem[] = [
  { nama: "Peta Peran", icon: PetaPeranIcon, lensa: "peta-peran" },
  { nama: "Kartu Ekonomi Desa", icon: KartuIcon, lensa: "kartu" },
  { nama: "Jalur Ekonomi", icon: JalurIcon, lensa: "jalur-ekonomi", isML: true },
  { nama: "Desa Kembar", icon: KembarIcon, lensa: "desa-kembar", isML: true },
  { nama: "Citra Potensi Desa", icon: CitraIcon, lensa: "citra-potensi", isML: true },
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

const KELAS_BUTIR = "relative flex size-11 items-center justify-center rounded-full transition-colors shadow-sm";

/**
 * Rail navigasi, hidup di dua rute (PRD §5.2). Di dasbor butir lensa adalah
 * tombol yang mengganti `?lensa=` tanpa berpindah halaman; di `/admin` butir
 * yang sama menjadi tautan kembali ke `/?lensa=…`, karena dari halaman lain
 * berpindah halaman memang berpindah lensa.
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
 * Geometri (`w-16` -> `w-20`, `gap-4`, `py-4`, `size-11` per butir) IDENTIK di kedua
 * konteks: satu piksel selisih membuat rail melompat saat pindah rute.
 */
export function SideRail(props: SideRailProps) {
  const { peran, memuat, adaSesi } = useSesi();

  const diAdmin = props.konteks === "admin";
  const bisaAdmin = bisa(peran, "admin");

  return (
    <nav
      aria-label="Navigasi: logo, lensa, Halaman Admin, panel, akun"
      className="z-30 order-last flex h-16 w-full shrink-0 flex-row items-center gap-3 overflow-x-auto rounded-card bg-transparent px-4 md:order-none md:h-auto md:w-20 md:flex-col md:gap-4 md:overflow-x-visible md:px-0 md:py-4"
    >
      {diAdmin ? (
        <div className="group relative flex items-center justify-center hover:z-[100]">
          <Link
            href="/"
            aria-label="Simpul Desa — kembali ke dasbor"
            className={`flex items-center justify-center p-2 cursor-pointer transition-colors ${FOCUS_RING}`}
          >
            <LogoSimpul />
          </Link>
          <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
            Kembali ke dasbor
          </div>
        </div>
      ) : (
        <div className="group relative flex items-center justify-center hover:z-[100]">
          <button
            type="button"
            onClick={props.onLogoClick}
            aria-label="Simpul Desa — lipat panel dan reset pilihan wilayah"
            className={`flex items-center justify-center p-2 cursor-pointer transition-colors ${FOCUS_RING}`}
          >
            <LogoSimpul />
          </button>
          <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
            Simpul Desa
          </div>
        </div>
      )}

      <div className="flex flex-row items-center gap-3 ms-2 md:ms-0 md:mt-6 md:flex-col">
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
          const kelas = `${KELAS_BUTIR} ${FOCUS_RING} cursor-pointer ${aktif ? "bg-primary text-white" : "bg-white text-ink hover:bg-ink hover:text-white"}`;
          const lencana = !memuat && terkunci && <LockBadge />;
          // Diangkat di atas cabang `diAdmin` (temuan A15 lanjutan) supaya
          // kedua konteks mengumumkan kunci yang sama — sebelumnya butir
          // terkunci di `/admin` hanya menampilkan `LockBadge` visual tanpa
          // kata "terkunci" untuk pembaca layar.
          const judulTombol = terkunci ? `${nama} terkunci. Masuk untuk membukanya.` : nama;
          const labelTombol = terkunci ? `${nama}, terkunci. Masuk untuk membukanya.` : nama;

          if (diAdmin) {
            return (
              <div key={lensa} className="group relative flex items-center justify-center hover:z-[100]">
                <Link
                  href={`/?lensa=${lensa}`}
                  aria-label={labelTombol}
                  className={kelas}
                >
                  <Icon className="size-5!" />
                  {lencana}
                </Link>
                <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
                  {judulTombol}
                </div>
              </div>
            );
          }

          return (
            <div key={lensa} className="group relative flex items-center justify-center hover:z-[100]">
              <button
                type="button"
                onClick={
                  terkunci
                    ? () => props.onKlikTerkunci(kemampuan, nama)
                    : () => { props.onPilihLensa(lensa); props.onOpenPanel(); }
                }
                aria-label={labelTombol}
                aria-current={aktif ? "page" : undefined}
                className={kelas}
              >
                <Icon className="size-5!" />
                {lencana}
              </button>
              <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
                {judulTombol}
              </div>
            </div>
          );
        })}
      </div>

      <span className="h-6 w-px bg-line-strong/60 md:h-px md:w-6" />

      {/* Butir Admin (PRD §5.2 butir 7) — dirender HANYA untuk peran admin,
          tanpa penanda kunci: peran lain tidak melihatnya sama sekali. */}
      {!memuat && bisaAdmin && (
        <div className="group relative flex items-center justify-center hover:z-[100]">
          <Link
            href="/admin"
            aria-label="Halaman Admin"
            aria-current={diAdmin ? "page" : undefined}
            className={`${KELAS_BUTIR} ${FOCUS_RING} cursor-pointer ${diAdmin ? "bg-primary text-white" : "bg-white text-ink hover:bg-ink hover:text-white"}`}
          >
            <Shield size={20} strokeWidth={1.5} aria-hidden="true" />
          </Link>
          <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
            Halaman Admin
          </div>
        </div>
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
        <div className="relative z-30 ms-auto md:ms-0 md:mt-auto group flex items-center justify-center hover:z-[100]">
          <MenuAkun>
            <button
              type="button"
              aria-label="Akun"
              className={`${KELAS_BUTIR} ${FOCUS_RING} cursor-pointer bg-white text-ink hover:bg-ink hover:text-white`}
            >
              <AkunIcon />
            </button>
          </MenuAkun>
          <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
            Akun
          </div>
        </div>
      ) : (
        <div className="ms-auto md:ms-0 md:mt-auto group relative flex items-center justify-center hover:z-[100]">
          <Link
            href="/masuk"
            aria-label="Masuk"
            className={`${KELAS_BUTIR} ${FOCUS_RING} cursor-pointer bg-white text-ink hover:bg-ink hover:text-white`}
          >
            <AkunIcon />
          </Link>
          <div className="pointer-events-none absolute left-full top-1/2 ml-4 -translate-y-1/2 rounded bg-ink px-2.5 py-1.5 text-xs text-white opacity-0 shadow-float transition-opacity group-hover:opacity-100 hidden md:block whitespace-nowrap z-[100]">
            Masuk
          </div>
        </div>
      )}
    </nav>
  );
}

/** Logo SIMPUL DESA (PRD §5.2) — dipakai dua kali di atas, sebagai tombol di
 * dasbor dan sebagai tautan pulang di `/admin`. */
function LogoSimpul() {
  return (
    <Image
      src="/logo-simpul-desa.png"
      alt=""
      width={40}
      height={40}
      className="h-10 w-auto object-contain"
      style={{ width: "auto" }}
      priority
    />
  );
}
