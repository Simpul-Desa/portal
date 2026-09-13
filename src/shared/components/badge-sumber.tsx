import { TanyaTooltip } from "@/features/kartu/components/tanya-tooltip";
import type { SumberDominan } from "@/features/kartu/types";

const KONFIGURASI_SUMBER: Record<
  SumberDominan,
  { label: string; kelas: string; keterangan: string }
> = {
  citra: {
    label: "Citra Potensi Desa",
    kelas: "bg-positive/10 text-positive border-positive/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    keterangan: "Diverifikasi langsung dari fitur Citra Potensi Desa berbasis machine learning analisis satelit dan tutupan lahan.",
  },
  "heuristik-tervalidasi": {
    label: "Heuristik Tervalidasi",
    kelas: "bg-primary/10 text-primary border-primary/20 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30",
    keterangan: "Dihitung dari aturan inferensi data empiris lapangan yang telah terkonfirmasi.",
  },
  "heuristik-belum-teruji": {
    label: "Heuristik (Belum Teruji)",
    kelas: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-400/15 dark:text-amber-300 dark:border-amber-400/30",
    keterangan: "Estimasi model awal berdasarkan data sekunder yang belum melalui verifikasi uji petik lapangan.",
  },
  "fallback-heuristik": {
    label: "Heuristik Bawaan",
    kelas: "bg-surface text-muted border-line dark:text-slate-300 dark:bg-surface/80",
    keterangan: "Estimasi cadangan berbasis profil umum karakteristik wilayah sekitarnya.",
  },
};

/**
 * Badge sumber Potensi Dominan:
 * Menampilkan asal data komoditas dominan dalam format badge berwarna yang rapi,
 * dilengkapi tooltip penjelasan metodologi (?).
 */
export function BadgeSumber({ sumber }: { sumber: SumberDominan }) {
  const config = KONFIGURASI_SUMBER[sumber] ?? {
    label: sumber,
    kelas: "bg-surface text-muted border-line",
    keterangan: "Sumber data potensi dominan.",
  };

  return (
    <span className="inline-flex items-center">
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-badge font-medium border ${config.kelas}`}>
        {config.label}
      </span>
      <TanyaTooltip
        istilah={sumber}
        judulCustom={config.label}
        penjelasanCustom={config.keterangan}
      />
    </span>
  );
}
