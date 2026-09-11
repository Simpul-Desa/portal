"use client";

/**
 * `SesiProvider` — sesi Supabase (cookie, dibaca via `getSession()` — nol
 * panggilan jaringan) + peran aktif (dibaca lewat `GET /api/profil/saya`,
 * karena tabel `profil` ber-RLS tanpa policy: langsung dari `app/` selalu
 * kosong). Mendaftarkan pengambil token sekali ke `@/lib/api/client` supaya
 * permintaan bertoken selalu memakai token FRESH.
 *
 * `getUser()` SENGAJA tidak dipakai di sini — ia selalu menembak jaringan
 * (dibuktikan spec `@supabase/ssr`); otorisasi sungguhan tetap ada di
 * `api/`, jadi `getSession()` (baca cookie) cukup untuk kebutuhan tampilan.
 *
 * Cache dibuang saat IDENTITAS AKUN berubah (termasuk keluar), bukan pada
 * tiap event `SIGNED_IN`: tanpa pembuangan itu cache lensa milik akun
 * sebelumnya masih terbaca setelah ganti akun, tetapi membuangnya pada tiap
 * `SIGNED_IN` membuat seluruh lensa refetch tiap kali tab kembali fokus.
 * Galat query peran (403 baris profil belum ada, 503 konfigurasi server)
 * TIDAK dilempar ke error boundary — TanStack Query tidak melempar secara
 * default, jadi keduanya jatuh ke keadaan terbaca lewat `galatPeran`.
 *
 * `galatPeran` WAJIB dirender pemanggil (perbaikan galat diam terlaporkan
 * 10 September 2026): sesi Supabase bisa berhasil sementara `api/` yang
 * membaca peran mati/menolak. `cobaLagiPeran` di bawah adalah satu-satunya
 * jalan memicu ulang query itu — pemanggil tidak perlu menyentuh
 * `queryClient` sendiri. `keluar()` juga tidak lagi menelan galat `signOut`
 * — bila Supabase menolak, error dilempar ke pemanggil (mis. `MenuAkun`)
 * alih-alih diam.
 *
 * `peran` TIDAK lagi jatuh ke `"anonim"` saat bacaan peran gagal padahal
 * sesi ADA (perbaikan lanjutan dilaporkan 10 September 2026): itu
 * memperlakukan pengguna yang sudah masuk seperti belum masuk sama sekali
 * — kelima lensa terkunci, rail menawarkan "Masuk" lagi. `peranEfektif`
 * (`core/akses.ts`) melantai ke `"tamu"` untuk kasus itu (PRD akar §3:
 * registrasi mandiri selalu menghasilkan tamu, jadi itu lantai jujur).
 * `adaSesi` diekspos terpisah dari `peran` supaya pemanggil yang perlu
 * membedakan "belum masuk" dari "peran belum cukup" tidak menyimpulkannya
 * dari `peran === "anonim"`.
 */

import type { Session } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { peranEfektif, type Peran } from "@/core/akses";
import {
  DURASI_TIDAK_AKTIF_MS,
  hapusCatatanAktivitas,
  pasangPemantauInaktivitas,
} from "@/core/sesi-timeout";
import { supabaseBrowser } from "@/core/supabase/browser";
import { daftarkanPengambilToken, type GalatApi } from "@/lib/api/client";
import { type DataDari, profilSaya } from "@/lib/api/endpoints";

interface SesiContextValue {
  peran: Peran;
  /** Ada sesi Supabase (cookie terbaca), lepas dari apakah perannya sudah
   * terbaca — pemanggil yang perlu membedakan "belum masuk" dari "peran
   * belum cukup" WAJIB memakai ini, bukan menyimpulkannya dari `peran ===
   * "anonim"` (peran itu sendiri bisa jadi lantai `"tamu"` saat sesi ada
   * tapi bacaan peran gagal — lihat `peranEfektif`). */
  adaSesi: boolean;
  email: string | null;
  memuat: boolean;
  galatPeran: GalatApi | null;
  /** Memicu ulang query peran (mis. tombol "Coba lagi" pada `galatPeran`). */
  cobaLagiPeran: () => void;
  keluar: () => Promise<void>;
}

const SesiContext = createContext<SesiContextValue | null>(null);

/** Bacaan sesi + peran aktif. Melempar bila dipanggil di luar `SesiProvider`. */
export function useSesi(): SesiContextValue {
  const nilai = useContext(SesiContext);
  if (!nilai) throw new Error("useSesi dipanggil di luar SesiProvider.");
  return nilai;
}

export function SesiProvider({ children }: { children: ReactNode }) {
  const supabase = supabaseBrowser();
  const queryClient = useQueryClient();
  const [sesi, setSesi] = useState<Session | null>(null);
  const [memuatSesi, setMemuatSesi] = useState(true);
  /** Identitas akun terakhir yang terlihat — pembanding penentu apakah cache perlu dibuang. */
  const idAkun = useRef<string | null>(null);

  // Sekali-jalan: daftarkan pengambil token FRESH untuk `lib/api/client.ts`.
  useEffect(() => {
    daftarkanPengambilToken(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });
  }, [supabase]);

  useEffect(() => {
    let dibatalkan = false;

    supabase.auth.getSession().then(({ data }) => {
      if (dibatalkan) return;
      idAkun.current = data.session?.user.id ?? null;
      setSesi(data.session);
      setMemuatSesi(false);
    });

    const { data: langganan } = supabase.auth.onAuthStateChange((event, sesiBaru) => {
      setSesi(sesiBaru);
      setMemuatSesi(false);

      const idBaru = sesiBaru?.user.id ?? null;
      const idLama = idAkun.current;
      idAkun.current = idBaru;

      // `INITIAL_SESSION` hanya memulihkan sesi yang sudah ada — bukan ganti
      // akun, jadi cache yang baru saja mulai terisi tidak boleh dibuang.
      if (event === "INITIAL_SESSION") return;

      // `SIGNED_IN` ikut ditembakkan saat tab kembali fokus dan saat token
      // di-refresh, bukan hanya saat benar-benar masuk. Membersihkan cache di
      // situ membuat seluruh lensa refetch tiap kali user pindah tab lalu
      // kembali. Bersihkan HANYA saat identitas akun benar-benar berubah —
      // itu satu-satunya keadaan yang membuat cache peran sebelumnya salah.
      if (idBaru !== idLama) queryClient.clear();
    });

    return () => {
      dibatalkan = true;
      langganan.subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  const {
    data: profil,
    error: galatPeran,
    refetch: refetchPeran,
  } = useQuery<DataDari<"/api/profil/saya">, GalatApi>({
    queryKey: ["profil", "saya"],
    queryFn: async () => (await profilSaya()).data,
    enabled: Boolean(sesi),
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  });

  const adaSesi = Boolean(sesi);
  const peran: Peran = peranEfektif({
    adaSesi,
    peranProfil: profil?.peran,
    adaGalat: Boolean(galatPeran),
  });

  // Sengaja BUKAN `isLoading` TanStack: tepat saat `enabled` berubah dari
  // false ke true ada satu render di mana query belum berjalan dan
  // `isLoading` masih false — cukup untuk mengedipkan lencana kunci ke
  // pengguna yang sudah masuk. "Ada sesi, peran belum tiba, dan belum gagal"
  // adalah definisi memuat yang deterministik.
  const memuat = memuatSesi || (adaSesi && profil === undefined && !galatPeran);

  const router = useRouter();

  function cobaLagiPeran(): void {
    void refetchPeran();
  }

  /** Melempar galat `signOut` ke pemanggil alih-alih menelannya — lihat docstring berkas. */
  const keluar = useCallback(async (): Promise<void> => {
    hapusCatatanAktivitas();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    queryClient.clear();
  }, [supabase, queryClient]);

  // Pantau inaktivitas sesi: logout otomatis bila 30 menit tidak ada aktivitas
  useEffect(() => {
    if (!adaSesi) {
      hapusCatatanAktivitas();
      return;
    }

    const batal = pasangPemantauInaktivitas({
      onTimeout: () => {
        void keluar().finally(() => {
          router.replace("/masuk?alasan=tidak_aktif");
        });
      },
      batasMs: DURASI_TIDAK_AKTIF_MS,
    });

    return () => {
      batal();
    };
  }, [adaSesi, keluar, router]);

  const value: SesiContextValue = {
    peran,
    adaSesi,
    email: sesi?.user.email ?? null,
    memuat,
    galatPeran: galatPeran ?? null,
    cobaLagiPeran,
    keluar,
  };

  return <SesiContext.Provider value={value}>{children}</SesiContext.Provider>;
}
