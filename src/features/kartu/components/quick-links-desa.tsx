"use client";

import { useJalurDesaStatus } from "@/features/jalur-ekonomi/hooks/queries";
import { ArrowUpRightIcon, CitraIcon, JalurIcon, KembarIcon } from "@/shared/components/icons";
import { formatAngka } from "@/shared/format";
import { Network, Sparkles } from "lucide-react";

type LensaTautan = "desa-kembar" | "citra-potensi" | "jalur-ekonomi";

type QuickLinksDesaProps = {
  desa?: string;
  kab?: string;
  onPilihLensa: (lensa: LensaTautan) => void;
  onNavigasiJalur?: (opsi: { varian: "komoditas"; jalur?: string }) => void;
};

const DAFTAR_TAUTAN: Array<{
  id: LensaTautan;
  label: string;
  sublabelBawaan: string;
  Icon: typeof KembarIcon;
}> = [
  {
    id: "desa-kembar",
    label: "Desa Kembar",
    sublabelBawaan: "Bandingkan desa serupa",
    Icon: KembarIcon,
  },
  {
    id: "citra-potensi",
    label: "Citra Potensi Desa",
    sublabelBawaan: "Analisis satelit & lahan",
    Icon: CitraIcon,
  },
  {
    id: "jalur-ekonomi",
    label: "Jalur Ekonomi",
    sublabelBawaan: "Poros koridor pasar",
    Icon: JalurIcon,
  },
];

/**
 * Quick link 3 fitur pelengkap: Desa Kembar, Citra Potensi, dan Jalur Ekonomi.
 * Pada Jalur Ekonomi, default varian adalah "Komoditas" dan menampilkan status
 * desa terpilih (apakah sebagai Desa Poros atau Desa Sejalur).
 */
export function QuickLinksDesa({
  desa,
  kab,
  onPilihLensa,
  onNavigasiJalur,
}: QuickLinksDesaProps) {
  // Query status keterhubungan desa pada varian default: Komoditas
  const { data: statusJalur } = useJalurDesaStatus("komoditas", desa, kab);

  const daftarJalur = statusJalur?.data ?? [];
  const jalurTerkait = daftarJalur[0];

  const apakahPoros = Boolean(jalurTerkait && desa && jalurTerkait.poros.iddesa === desa);
  const apakahSejalur = Boolean(jalurTerkait && desa && !apakahPoros);

  function handleKlik(id: LensaTautan) {
    if (id === "jalur-ekonomi" && onNavigasiJalur) {
      onNavigasiJalur({ varian: "komoditas", jalur: jalurTerkait?.id_jalur });
    } else {
      onPilihLensa(id);
    }
  }

  return (
    <section aria-label="Tautan Cepat Fitur Wilayah">
      <div className="grid grid-cols-3 gap-2">
        {DAFTAR_TAUTAN.map((item) => {
          const isJalur = item.id === "jalur-ekonomi";

          // Kustomisasi sublabel dan status untuk Jalur Ekonomi
          let sublabel = item.sublabelBawaan;
          let statusBadge = null;

          if (isJalur && desa) {
            if (apakahPoros && jalurTerkait) {
              sublabel = `Pusat ${jalurTerkait.label} (${formatAngka(jalurTerkait.n_anggota)} desa)`;
              statusBadge = (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-float border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  <Sparkles className="size-2.5" />
                  Poros
                </span>
              );
            } else if (apakahSejalur && jalurTerkait) {
              sublabel = `Sejalur ke ${jalurTerkait.poros.nmdesa}`;
              statusBadge = (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-float border border-hairline px-1.5 py-0.5 text-[10px] font-medium text-muted">
                  <Network className="size-2.5" />
                  Sejalur
                </span>
              );
            } else if (statusJalur && daftarJalur.length === 0) {
              sublabel = "Belum masuk jalur komoditas";
            }
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleKlik(item.id)}
              className="group flex flex-col justify-between rounded-inset p-3 text-left border border-transparent bg-surface hover:border-line-strong hover:bg-float transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex size-7 items-center justify-center rounded-full bg-float text-ink group-hover:text-primary transition-colors">
                  <item.Icon className="size-4" />
                </div>
                <ArrowUpRightIcon className="size-3.5 text-muted opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>

              <div className="mt-2.5 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <p className="truncate text-title-sm font-medium text-ink group-hover:text-primary transition-colors">
                    {item.label}
                  </p>
                </div>
                <p className="mt-0.5 truncate text-micro text-muted">
                  {sublabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
