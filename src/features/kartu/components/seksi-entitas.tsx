import { MapPinIcon } from "@/shared/components/icons";
import { formatAngka, strip } from "@/shared/format";

import type { KartuIdentitas } from "../types";

type SeksiEntitasProps = {
  identitas: KartuIdentitas;
  /** Nama provinsi (bukan kode) — diresolusi pemanggil dari `usePusat()`. */
  namaProvinsi: string;
};

/** Judul kartu (review Blok D #7): nama berdiri sendiri sebagai judul, jadi
 * diberi prefiks kata sesuai `tipe` (GLOSSARY § Konvensi penulisan — kata
 * "Desa" dipakai saat nama berdiri sendiri sebagai judul). `tipe` "tak
 * diketahui" → nama polos, tanpa prefiks tebakan. */
function judulEntitas(identitas: KartuIdentitas): string {
  if (identitas.tipe === "desa") return `Desa ${identitas.nama}`;
  if (identitas.tipe === "kelurahan") return `Kelurahan ${identitas.nama}`;
  return identitas.nama;
}

/**
 * `card-entity` (Task 24, seksi 1) — selalu kartu pertama panel. Subtitle
 * urutan sempit→lebar GLOSSARY (`Desa • Kec. • Kab. • Provinsi`); nama desa
 * sudah jadi judul jadi subtitle mulai dari kecamatan.
 */
export function SeksiEntitas({ identitas, namaProvinsi }: SeksiEntitasProps) {
  return (
    <section className="rounded-card bg-surface p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-title-lg text-ink">
            <MapPinIcon className="shrink-0 text-muted" />
            <span className="truncate">{judulEntitas(identitas)}</span>
          </h2>
          <p className="mt-1 text-label text-muted">
            Kec. {identitas.kecamatan} • Kab. {identitas.kabupaten} • {namaProvinsi}
          </p>
        </div>

        <div className="shrink-0 text-right">
          <p className="text-label text-muted">Luas</p>
          <p className="text-metric-lg text-ink">
            {identitas.luas_km2 === null ? (
              strip(null)
            ) : (
              <>
                {formatAngka(identitas.luas_km2)}
                <span className="text-metric-unit"> km²</span>
              </>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
