"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";

export const GLOSARIUM_KARTU: Record<string, { judul: string; penjelasan: string }> = {
  "Zona": {
    judul: "Klasifikasi Zona",
    penjelasan:
      "Klasifikasi peran pembangunan desa berdasarkan kuadran kombinasi Skor Potensi dan Skor Kesiapan ekonomi.",
  },
  "Skor Potensi": {
    judul: "Skor Potensi Desa",
    penjelasan:
      "Tingkat desil potensi ekonomi sektoral desa dalam skala 1–10 relatif terhadap seluruh desa di kabupaten.",
  },
  "Skor Kesiapan": {
    judul: "Skor Kesiapan Desa",
    penjelasan:
      "Tingkat desil kesiapan infrastruktur, kelembagaan, dan konektivitas dalam skala 1–10 relatif se-kabupaten.",
  },
  "Konektivitas": {
    judul: "Konektivitas Wilayah",
    penjelasan:
      "Kualitas akses jalan antardesa, ketersediaan moda transportasi, dan stabilitas jangkauan sinyal telekomunikasi.",
  },
  "Zona Pemerintah": {
    judul: "Zona Pemerintah",
    penjelasan:
      "Potensi ekonomi tinggi namun kesiapan infrastruktur/kelembagaan masih rendah. Menjadi prioritas intervensi dan afirmasi dana pembangunan pemerintah.",
  },
  "Zona Mitra": {
    judul: "Zona Mitra",
    penjelasan:
      "Potensi ekonomi tinggi dan kesiapan tinggi. Siap untuk kemitraan strategis investasi swasta dan perluasan akses pasar.",
  },
  "Zona Poros": {
    judul: "Zona Poros",
    penjelasan:
      "Kesiapan tinggi dengan potensi sektoral sedang. Berfungsi optimal sebagai simpul penyedia logistik, pengolahan, dan jasa untuk desa sekitar.",
  },
  "Zona Bantuan": {
    judul: "Zona Bantuan",
    penjelasan:
      "Potensi dan kesiapan masih rendah. Memerlukan bantuan perlindungan sosial dan pemenuhan layanan dasar terlebih dahulu.",
  },
  "Belum Terpetakan": {
    judul: "Belum Terpetakan",
    penjelasan:
      "Data pendukung belum memenuhi ambang batas minimum untuk penentuan zona definitif.",
  },

  // Potensi
  "Potensi Dominan": {
    judul: "Potensi Dominan",
    penjelasan:
      "Sektor komparatif paling unggul di desa yang dihitung dari bobot skor produksi dan daya saing komoditas tertinggi.",
  },
  "Persentil": {
    judul: "Persentil Daya Saing (0–100)",
    penjelasan:
      "Posisi relatif kekuatan komoditas desa dibanding seluruh desa pembanding di kabupaten/provinsi. Skor 80 berarti desa berada di atas 80% desa lainnya.",
  },
  "Simpul Jasa": {
    judul: "Simpul Jasa & Perdagangan",
    penjelasan:
      "Potensi desa dalam penyediaan fasilitas niaga, pasar desa, perbengkelan, dan jasa perantara rantai pasok ekonomi.",
  },

  // Kesiapan
  "Indeks Desa Membangun": {
    judul: "Indeks Desa Membangun (IDM)",
    penjelasan:
      "Indeks komposit Kementerian Desa PDTT untuk mengukur kemandirian desa melalui ketahanan sosial, ekonomi, dan lingkungan.",
  },
  "Kelembagaan Ekonomi": {
    judul: "Kelembagaan Ekonomi Desa",
    penjelasan:
      "Kapasitas dan keaktifan institusi ekonomi lokal seperti BUMDes, koperasi desa, dan lumbung pangan.",
  },
  "Amenitas & Keuangan": {
    judul: "Amenitas & Layanan Keuangan",
    penjelasan:
      "Kemudahan akses warga terhadap fasilitas perbankan (bank, ATM, agen keuangan) serta sarana perbelanjaan dan niaga.",
  },
  "Konektivitas Wilayah": {
    judul: "Konektivitas Wilayah",
    penjelasan:
      "Kualitas akses jalan antardesa, ketersediaan moda transportasi, dan stabilitas jangkauan sinyal telekomunikasi.",
  },
  "IKS": {
    judul: "Indeks Ketahanan Sosial (IKS)",
    penjelasan:
      "Dimensi IDM yang menilai modal sosial, kesehatan, pendidikan, dan keberdayaan permukiman warga.",
  },
  "IKE": {
    judul: "Indeks Ketahanan Ekonomi (IKE)",
    penjelasan:
      "Dimensi IDM yang menilai keragaman produksi, akses pusat pasar, logistik, dan keterbukaan wilayah.",
  },
  "IKL": {
    judul: "Indeks Ketahanan Lingkungan (IKL)",
    penjelasan:
      "Dimensi IDM yang menilai kualitas tata lingkungan hidup, potensi bencana, dan mitigasi tanggap darurat.",
  },

  // Fakta Program
  "Jadesta": {
    judul: "Jejaring Desa Wisata (Jadesta)",
    penjelasan:
      "Platform kurasi dan pendampingan resmi Kemenparekraf untuk standardisasi atraksi, amenitas, dan tata kelola desa wisata.",
  },
  "Sisparnas": {
    judul: "Sisparnas",
    penjelasan:
      "Sistem Informasi Kepariwisataan Nasional — basis data terpadu sebaran daya tarik wisata resmi nasional.",
  },
  "Cold Storage": {
    judul: "Rantai Dingin (Cold Storage)",
    penjelasan:
      "Fasilitas pendingin penyimpan komoditas perikanan/pertanian untuk menekan kerugian pasca-panen dan menjaga mutu komoditas.",
  },

  // Biofisik & Logistik
  "Relief": {
    judul: "Relief Topografi",
    penjelasan:
      "Variasi perbedaan tinggi-rendah kontur daratan desa, menentukan kemudahan pembukaan lahan dan akses transportasi.",
  },
  "Sentralitas": {
    judul: "Sentralitas Wilayah",
    penjelasan:
      "Estimasi rata-rata waktu tempuh perjalanan (menit) dari desa ke simpul-simpul utama kegiatan ekonomi kabupaten.",
  },
  "Tutupan Lahan": {
    judul: "Tutupan Lahan Dominan",
    penjelasan:
      "Proporsi penggunaan permukaan lahan desa (hutan, sawah, perkebunan, permukiman) terdeteksi dari citra satelit.",
  },

  // Mutu Data
  "ST2023": {
    judul: "Sensus Pertanian 2023 (ST2023)",
    penjelasan:
      "Data sensus lengkap Badan Pusat Statistik (BPS) mengenai struktur usaha tani dan demografi petani per desa.",
  },
  "Kelengkapan Bukti SK": {
    judul: "Kelengkapan Bukti SK",
    penjelasan:
      "Rasio kelengkapan data empiris yang berhasil diverifikasi untuk menyusun Skor Kesiapan desa.",
  },
};

type TanyaTooltipProps = {
  istilah: string;
  judulCustom?: string;
  penjelasanCustom?: string;
  className?: string;
};

/**
 * TanyaTooltip:
 * Merender ikon tanya (?) kecil tanpa memberi garis bawah (underline) pada teks kalimat,
 * menampilkan penjelasan istilah teknis secara informatif dan elegan.
 */
export function TanyaTooltip({
  istilah,
  judulCustom,
  penjelasanCustom,
  className = "",
}: TanyaTooltipProps) {
  const item = GLOSARIUM_KARTU[istilah] ?? {
    judul: judulCustom ?? istilah,
    penjelasan: penjelasanCustom ?? "Istilah parameter teknis dalam analisis Simpul Desa.",
  };

  const judul = judulCustom ?? item.judul;
  const penjelasan = penjelasanCustom ?? item.penjelasan;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Penjelasan: ${judul}`}
          className={`inline-flex size-3.5 items-center justify-center rounded-full bg-hairline text-muted hover:text-ink hover:bg-line-strong/60 transition-colors cursor-help align-middle ml-1 focus:outline-none ${className}`}
        >
          <span className="text-[10px] font-semibold leading-none" aria-hidden="true">
            ?
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-micro p-2.5 shadow-float leading-relaxed z-50">
        <p className="font-semibold text-white mb-0.5">{judul}</p>
        <p className="text-on-dark-muted text-micro leading-relaxed">{penjelasan}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Komponen pembungkus teks + tanda tanya (?):
 * Menampilkan label polos TANPA garis bawah dan menyisipkan tanda tanya (?) di sampingnya.
 */
export function LabelDenganTanya({
  label,
  istilah,
  className = "",
}: {
  label: React.ReactNode;
  istilah: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center ${className}`}>
      <span>{label}</span>
      <TanyaTooltip istilah={istilah} />
    </span>
  );
}
