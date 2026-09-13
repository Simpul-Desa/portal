"use client";

import { useEffect } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { NamaZona } from "@/features/peta-peran/types";
import { useUnduhLaporan } from "@/features/laporan/hooks/use-unduh-laporan";
import { pesanGalat } from "@/lib/api/galat-ui";
import { WARNA_ZONA } from "@/lib/map/zona";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { ArrowUpRightIcon } from "@/shared/components/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { formatAngka, strip } from "@/shared/format";

import type { KartuIdentitas, KartuPetaPeran } from "../types";

type SeksiEntitasProps = {
  identitas: KartuIdentitas;
  namaProvinsi: string;
  petaPeran: KartuPetaPeran;
  bisaLaporan: boolean;
  onNavigasiPetaPeran: () => void;
};

function judulEntitas(identitas: KartuIdentitas): string {
  if (identitas.tipe === "desa") return `Desa ${identitas.nama}`;
  if (identitas.tipe === "kelurahan") return `Kelurahan ${identitas.nama}`;
  return identitas.nama;
}

/**
 * Kartu Utama Identitas Desa:
 * Mengadopsi pola layout referensi (image copy 4.png):
 * 1. Background luar menggunakan gradasi dari warna zona di atas yang memudar ke bawah semakin putih.
 * 2. Teks nama zona berada di atas (tengah) dengan panah link ke Peta Peran.
 * 3. Di dalamnya terdapat inner card putih bergaris putus-putus (dashed border) berisi nama desa & hirarki.
 * 4. Bagian footer bawah berisi info luas wilayah & tombol ekspor laporan desa (PDF).
 */
export function SeksiEntitas({
  identitas,
  namaProvinsi,
  petaPeran,
  bisaLaporan,
  onNavigasiPetaPeran,
}: SeksiEntitasProps) {
  const { unduh, sedangMenyusun, galat } = useUnduhLaporan();

  useEffect(() => {
    if (galat) {
      toast.error(pesanGalat(galat).judul, {
        description: pesanGalat(galat).pesan,
      });
    }
  }, [galat]);

  const warnaZona =
    petaPeran.zona === "Belum Terpetakan"
      ? "#6b7280"
      : WARNA_ZONA[petaPeran.zona as NamaZona] ?? "#00a9bf";

  return (
    <section
      className="overflow-hidden rounded-card border border-line/60 shadow-xs"
      style={{
        background: `linear-gradient(180deg, ${warnaZona} 0%, ${warnaZona} 16%, ${warnaZona}33 42%, var(--color-float) 82%)`,
      }}
    >
      {/* 1. Header Atas: Nama Zona di tengah berlatar warna zona solid + panah Peta Peran */}
      <button
        type="button"
        onClick={onNavigasiPetaPeran}
        className={`group flex w-full items-center justify-center gap-1.5 py-2 px-4 text-white transition-opacity hover:opacity-90 cursor-pointer ${FOCUS_RING}`}
        title={`Buka Peta Peran: ${petaPeran.zona}`}
      >
        <span className="text-micro font-bold tracking-wider uppercase drop-shadow-2xs">
          {petaPeran.zona}
        </span>
        <ArrowUpRightIcon className="size-3 text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>

      {/* 2. Inner Card: Kotak putih bergaris putus-putus (dashed border) */}
      <div className="px-3.5 pb-3">
        <div className="rounded-inset bg-float p-4 border border-dashed border-line-strong/60 shadow-2xs">
          <span className="inline-block rounded-full bg-surface px-2 py-0.5 text-badge font-medium text-muted mb-1.5 capitalize border border-hairline/60">
            {identitas.tipe === "tak diketahui" ? "Wilayah" : identitas.tipe}
          </span>
          <h2 className="text-title-lg font-bold text-ink leading-snug break-words tracking-tight">
            {judulEntitas(identitas)}
          </h2>
          <p className="mt-1 text-label text-muted">
            Kec. {identitas.kecamatan} • Kab. {identitas.kabupaten} • {namaProvinsi}
          </p>
        </div>
      </div>

      {/* 3. Baris Bawah: Luas Wilayah & Tombol Ekspor Laporan */}
      <div className="px-4 pb-3.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-micro">
          <div>
            <span className="text-muted">Luas: </span>
            <span className="font-semibold text-ink">
              {identitas.luas_km2 === null ? strip(null) : `${formatAngka(identitas.luas_km2)} km²`}
            </span>
          </div>
          {identitas.kode_dagri && (
            <>
              <span className="text-muted">•</span>
              <div>
                <span className="text-muted">Kode: </span>
                <span className="font-mono text-muted font-medium">{identitas.kode_dagri}</span>
              </div>
            </>
          )}
        </div>

        {/* Tombol Ekspor Laporan Desa (PDF) di sebelah kanan bawah */}
        {bisaLaporan && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => {
                  if (!sedangMenyusun) unduh(identitas.iddesa);
                }}
                disabled={sedangMenyusun}
                aria-label="Unduh Laporan Desa (PDF)"
                aria-busy={sedangMenyusun}
                className={`inline-flex items-center gap-1.5 rounded-full bg-float px-3 py-1.5 text-micro font-medium text-ink shadow-2xs border border-line hover:border-line-strong hover:bg-surface active:scale-95 disabled:opacity-40 cursor-pointer transition-all ${FOCUS_RING}`}
              >
                {sedangMenyusun ? (
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                ) : (
                  <Download className="size-3.5 text-ink" />
                )}
                <span>{sedangMenyusun ? "Menyusun..." : "Ekspor Laporan"}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="top">
              {sedangMenyusun ? "Menyusun laporan PDF..." : "Unduh Laporan Desa (PDF)"}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </section>
  );
}
