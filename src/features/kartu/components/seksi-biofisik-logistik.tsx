import { formatSatuan, strip } from "@/shared/format";

import type { KartuBiofisik, KartuLogistik } from "../types";
import { BarisLabelNilai } from "./baris-label-nilai";

/** Pesan kosong satu blok utuh (biofisik/logistik tanpa geometri) — SATU
 * pesan untuk seluruh blok, bukan diulang per field, karena sumbernya
 * memang kosong bersamaan (GLOSSARY TIDAK-ADA-DATA). */
function BlokKosong({ kode }: { kode: string }) {
  return (
    <p className="mt-2 text-body-md text-ink">
      {strip(null)} <span className="text-micro text-muted">{kode}</span>
    </p>
  );
}

/**
 * Kartu gabungan Biofisik + Logistik (Task 24, seksi 7). Dua-duanya
 * kosong-berkode di TINGKAT BLOK (bukan per field) saat desa tanpa
 * geometri — narrow lewat `"kosong" in x` (aman: kedua cabang union objek,
 * beda dari `KosongDengan<number>` yang cabang isinya primitif).
 * `sentralitas_menit` diberi label "sentralitas" (bukan nama field mentah).
 */
export function SeksiBiofisikLogistik({
  biofisik,
  logistik,
}: {
  biofisik: KartuBiofisik;
  logistik: KartuLogistik;
}) {
  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Biofisik & Logistik</h3>

      <div className="mt-4">
        <p className="text-title-sm text-ink">Biofisik</p>
        {"kosong" in biofisik ? (
          <BlokKosong kode={biofisik.kosong} />
        ) : (
          <div className="mt-2 divide-y divide-hairline">
            <BarisLabelNilai label="Elevasi">
              {biofisik.elevasi_m === null ? strip(null) : formatSatuan(biofisik.elevasi_m, "m")}
            </BarisLabelNilai>
            <BarisLabelNilai label="Relief">
              {biofisik.relief_m === null ? strip(null) : formatSatuan(biofisik.relief_m, "m")}
            </BarisLabelNilai>
            <BarisLabelNilai label="Jarak ke pantai">
              {biofisik.pantai_km === null ? strip(null) : formatSatuan(biofisik.pantai_km, "km")}
            </BarisLabelNilai>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-title-sm text-ink">Logistik</p>
        {"kosong" in logistik ? (
          <BlokKosong kode={logistik.kosong} />
        ) : (
          <div className="mt-2 divide-y divide-hairline">
            <BarisLabelNilai label="Pusat kota terdekat">
              {strip(logistik.pusat_kota)}
              {logistik.menit_ke_pusat_kota !== null &&
                ` • ${formatSatuan(logistik.menit_ke_pusat_kota, "menit")}`}
            </BarisLabelNilai>
            <BarisLabelNilai label="Bandara terdekat">
              {strip(logistik.bandara)}
              {logistik.menit_ke_bandara !== null &&
                ` • ${formatSatuan(logistik.menit_ke_bandara, "menit")}`}
            </BarisLabelNilai>
            <BarisLabelNilai label="Pelabuhan terdekat">
              {strip(logistik.pelabuhan)}
              {logistik.menit_ke_pelabuhan !== null &&
                ` • ${formatSatuan(logistik.menit_ke_pelabuhan, "menit")}`}
            </BarisLabelNilai>
            <BarisLabelNilai label="Jarak lurus ke pusat kota">
              {logistik.km_lurus_ke_pusat_kota === null
                ? strip(null)
                : formatSatuan(logistik.km_lurus_ke_pusat_kota, "km")}
            </BarisLabelNilai>
            <BarisLabelNilai label="Sentralitas">
              {logistik.sentralitas_menit === null
                ? strip(null)
                : formatSatuan(logistik.sentralitas_menit, "menit")}
            </BarisLabelNilai>
          </div>
        )}
      </div>
    </section>
  );
}
