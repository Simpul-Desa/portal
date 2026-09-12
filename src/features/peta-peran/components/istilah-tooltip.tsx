"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export const GLOSARIUM_ISTILAH: Record<string, { judul: string; penjelasan: string }> = {
  "Skor Potensi": {
    judul: "Skor Potensi (SP)",
    penjelasan:
      "Indikator komposit 0–100 yang mengukur kapasitas dan produktivitas ekonomi desa (pertanian, perkebunan, peternakan, perikanan, serta simpul logistik).",
  },
  "Skor Kesiapan": {
    judul: "Skor Kesiapan (SK)",
    penjelasan:
      "Indikator komposit 0–100 yang mengukur kesiapan kelembagaan, amenitas dasar, akses digital/perbankan, dan konektivitas transportasi desa.",
  },
  "Keyakinan Rendah": {
    judul: "Keyakinan Rendah",
    penjelasan:
      "Penanda wilayah yang skor potensi atau kesiapannya berjarak kurang dari 2 poin dari garis ambang batas zona. Klasifikasi zonanya lebih sensitif dan rentan bergeser bila ada perubahan data.",
  },
  "Jarak ke Ambang": {
    judul: "Jarak ke Ambang Batas",
    penjelasan:
      "Selisih jarak skor desa terhadap nilai median kabupaten yang menjadi garis pemisah penentuan zona.",
  },
  "Sentralitas": {
    judul: "Sentralitas Waktu Tempuh",
    penjelasan:
      "Estimasi waktu tempuh perjalanan (dalam menit) dari desa menuju pusat kegiatan ekonomi atau ibu kota kabupaten terdekat.",
  },
  "Status IDM": {
    judul: "Indeks Desa Membangun (IDM)",
    penjelasan:
      "Status kemandirian desa dari Kementerian Desa PDTT: Mandiri, Maju, Berkembang, Tertinggal, atau Sangat Tertinggal.",
  },
  "Potensi Dominan": {
    judul: "Potensi Dominan",
    penjelasan:
      "Sektor komparatif paling unggul di desa yang dihitung dari persentase bobot sub-sektor ekonomi tertinggi.",
  },
  "Sumber Dominan": {
    judul: "Sumber Data Dominan",
    penjelasan:
      "Basis data resmi asal penetapan komoditas/potensi utama desa (misal Sensus Pertanian ST2023 atau PODES).",
  },
  "Zona Pemerintah": {
    judul: "Zona Pemerintah (Kuadran I)",
    penjelasan:
      "Potensi tinggi namun kesiapan rendah. Prioritas alokasi Dana Desa, pembangunan infrastruktur dasar, dan pendampingan teknis intensif.",
  },
  "Zona Mitra": {
    judul: "Zona Mitra (Kuadran II)",
    penjelasan:
      "Potensi tinggi dan kesiapan tinggi. Prioritas fasilitasi kemitraan investasi swasta dan temu bisnis dengan pembeli tetap (offtaker).",
  },
  "Zona Poros": {
    judul: "Zona Poros (Kuadran III)",
    penjelasan:
      "Potensi rendah namun kesiapan tinggi. Cocok diposisikan sebagai sentra pengolahan, logistik, atau penyedia layanan bagi desa sekitar.",
  },
  "Zona Bantuan": {
    judul: "Zona Bantuan (Kuadran IV)",
    penjelasan:
      "Potensi rendah dan kesiapan rendah. Prioritas jaring pengaman sosial dan pemenuhan kebutuhan dasar tanpa membebani usaha mandiri prematur.",
  },
  "Belum Terpetakan": {
    judul: "Belum Terpetakan",
    penjelasan:
      "Wilayah dengan bukti kesiapan terukur kurang dari separuh bobot indikator, sehingga datanya belum mencukupi untuk penetapan zona definitif.",
  },
};

type IstilahTooltipProps = {
  istilah: keyof typeof GLOSARIUM_ISTILAH | string;
  label?: string;
  tampilkanIkon?: boolean;
  className?: string;
};

/**
 * Tooltip istilah teknis Peta Peran:
 * - Tanpa outline/garis bawah pada kalimat (polos).
 * - Ikon tanya (?) bulat ramping tanpa border/outline tambahan.
 */
export function IstilahTooltip({
  istilah,
  label,
  tampilkanIkon = true,
  className = "",
}: IstilahTooltipProps) {
  const data = GLOSARIUM_ISTILAH[istilah] ?? {
    judul: istilah,
    penjelasan: "Istilah khusus dalam sistem Simpul Desa.",
  };

  const teksTampil = label ?? istilah;

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      {teksTampil ? <span>{teksTampil}</span> : null}
      {tampilkanIkon && (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={`Penjelasan ${data.judul}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex size-3.5 items-center justify-center rounded-full bg-hairline/60 text-muted hover:text-ink hover:bg-hairline transition-colors cursor-help align-middle border-0 focus:outline-none"
            >
              <span className="text-[10px] font-semibold leading-none" aria-hidden="true">
                ?
              </span>
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-micro p-2.5 shadow-float leading-relaxed z-50">
            <p className="font-semibold text-white mb-0.5">{data.judul}</p>
            <p className="text-on-dark-muted text-micro leading-relaxed">{data.penjelasan}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </span>
  );
}
