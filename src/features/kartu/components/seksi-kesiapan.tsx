import {
  Building2,
  Coins,
  Radio,
  Store,
} from "lucide-react";

import { formatAngka, strip } from "@/shared/format";

import { kodeKosong, type KartuKesiapan } from "../types";
import { TanyaTooltip } from "./tanya-tooltip";

type SeksiKesiapanProps = {
  komponen: KartuKesiapan["komponen"];
  kesiapan?: KartuKesiapan;
};

type ItemPilar = {
  kunci: keyof KartuKesiapan["komponen"];
  judul: string;
  istilah: string;
  deskripsi: string;
  Ikon: React.ComponentType<{ className?: string }>;
};

const PILAR_KESIAPAN: ItemPilar[] = [
  {
    kunci: "SK_INDEKS",
    judul: "Indeks Desa Membangun",
    istilah: "Indeks Desa Membangun",
    deskripsi: "Kemandirian tata kelola sosial, ekonomi, & ketahanan lingkungan",
    Ikon: Building2,
  },
  {
    kunci: "SK_KELEMBAGAAN",
    judul: "Kelembagaan Ekonomi",
    istilah: "Kelembagaan Ekonomi",
    deskripsi: "Kapasitas kelembagaan usaha lokal, BUMDes, koperasi, & lumbung",
    Ikon: Store,
  },
  {
    kunci: "SK_AMENITAS",
    judul: "Amenitas & Keuangan",
    istilah: "Amenitas & Keuangan",
    deskripsi: "Kemudahan akses layanan perbankan, transaksi keuangan, & pasar",
    Ikon: Coins,
  },
  {
    kunci: "SK_KONEKTIVITAS",
    judul: "Konektivitas Wilayah",
    istilah: "Konektivitas Wilayah",
    deskripsi: "Aksesibilitas jaringan jalan, transportasi publik, & sinyal telekomunikasi",
    Ikon: Radio,
  },
];

function statusKesiapan(nilai: number): { label: string; kelas: string } {
  if (nilai >= 0.75) return { label: "Tinggi", kelas: "text-positive bg-positive/10" };
  if (nilai >= 0.5) return { label: "Sedang", kelas: "text-primary bg-primary/10" };
  return { label: "Perlu Penguatan", kelas: "text-muted bg-surface" };
}

/**
 * Seksi Kesiapan Desa:
 * Menggambarkan 4 pilar kesiapan ekonomi & institusi desa secara visual
 * dengan kartu berlatar putih (bg-float) kontras agar langsung terlihat,
 * dilengkapi tooltip (?) tanpa underline pada istilah-istilah penting.
 */
export function SeksiKesiapan({ komponen, kesiapan }: SeksiKesiapanProps) {
  const dataIdm = kesiapan && !("kosong" in kesiapan.idm) ? kesiapan.idm : null;

  return (
    <div className="space-y-4">
      {/* 4 Pilar Kuadran Kesiapan - menggunakan bg-float dan border agar terlihat jelas */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {PILAR_KESIAPAN.map((pilar) => {
          const mentah = komponen[pilar.kunci];
          const kode = kodeKosong(mentah);
          const nilai = typeof mentah === "number" ? mentah : null;
          const status = nilai !== null ? statusKesiapan(nilai) : null;
          const Ikon = pilar.Ikon;

          return (
            <div
              key={pilar.kunci}
              className="group flex flex-col justify-between rounded-inset bg-float p-4 border border-line/70 shadow-2xs hover:border-line-strong transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-surface text-muted group-hover:text-primary transition-colors">
                    <Ikon className="size-4" />
                  </span>
                  {status && (
                    <span className={`px-2 py-0.5 rounded-full text-micro font-medium ${status.kelas}`}>
                      {status.label}
                    </span>
                  )}
                  {kode && (
                    <span className="px-2 py-0.5 rounded-full text-micro text-muted bg-surface">
                      {kode}
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center">
                  <h4 className="text-title-sm font-semibold text-ink">
                    {pilar.judul}
                  </h4>
                  <TanyaTooltip istilah={pilar.istilah} />
                </div>
                <p className="mt-1 text-micro text-muted leading-relaxed">
                  {pilar.deskripsi}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-hairline flex items-baseline justify-between">
                <span className="text-micro text-muted">Skor Pilar</span>
                <span className="text-metric-md font-semibold text-ink">
                  {nilai !== null ? formatAngka(nilai) : strip(null)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rincian Status IDM Resmi jika ada */}
      {dataIdm && (
        <div className="rounded-inset bg-float p-4 border border-line/70 shadow-2xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-hairline">
            <div className="flex items-center">
              <h4 className="text-title-sm font-semibold text-ink">Penilaian IDM Kemendesa</h4>
              <TanyaTooltip istilah="Indeks Desa Membangun" />
            </div>
            <span className="text-micro font-semibold text-primary px-2.5 py-0.5 rounded-full bg-primary/10">
              {dataIdm.status} ({dataIdm.tahun})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="rounded-xs bg-surface p-2 border border-hairline/60">
              <div className="flex items-center justify-center">
                <span className="text-micro text-muted">IKS (Sosial)</span>
                <TanyaTooltip istilah="IKS" />
              </div>
              <span className="text-title-sm font-semibold text-ink mt-0.5 block">
                {formatAngka(dataIdm.iks)}
              </span>
            </div>
            <div className="rounded-xs bg-surface p-2 border border-hairline/60">
              <div className="flex items-center justify-center">
                <span className="text-micro text-muted">IKE (Ekonomi)</span>
                <TanyaTooltip istilah="IKE" />
              </div>
              <span className="text-title-sm font-semibold text-ink mt-0.5 block">
                {formatAngka(dataIdm.ike)}
              </span>
            </div>
            <div className="rounded-xs bg-surface p-2 border border-hairline/60">
              <div className="flex items-center justify-center">
                <span className="text-micro text-muted">IKL (Lingkungan)</span>
                <TanyaTooltip istilah="IKL" />
              </div>
              <span className="text-title-sm font-semibold text-ink mt-0.5 block">
                {formatAngka(dataIdm.ikl)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
