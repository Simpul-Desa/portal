import { formatAngka, formatSatuan, strip } from "@/shared/format";

import type { KartuFaktaProgram } from "../types";
import { BarisLabelNilai } from "./baris-label-nilai";

/** `nilai` kosong → `strip(null)` polos, TANPA satuan menempel ke strip
 * kosong (review Blok D #12); `nilai` terisi → `formatSatuan` seperti biasa. */
function nilaiSatuan(nilai: number | null, satuan: string): string {
  return nilai === null ? strip(null) : formatSatuan(nilai, satuan);
}

/**
 * Kartu Fakta Program (Task 24, seksi 6) — 6 registri GLOSSARY + 1 fakta
 * keterlayanan cold storage terpisah (GLOSSARY: berbeda dari cold storage
 * eksisting, jangan disamakan). SEMUA baris selalu tampil, "—" saat kosong —
 * tidak pernah disembunyikan. `belum_tersentuh` (review Blok D #5) bendera
 * NETRAL tapi PENTING (GLOSSARY: "bukan cacat data, melainkan pesan utama")
 * — dirender baris berlabel + kalimat `text-ink`, BUKAN status-chip warna,
 * supaya cukup menonjol tanpa memakai warna status sebagai latar/teks
 * (aturan DESIGN.md).
 */
export function SeksiFaktaProgram({ fakta }: { fakta: KartuFaktaProgram }) {
  const cs = fakta.cold_storage_eksisting;

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Fakta Program</h3>

      {fakta.belum_tersentuh && (
        <div className="mt-4">
          <p className="text-label text-muted">Belum tersentuh</p>
          <p className="mt-1 text-body-md text-ink">
            Desa ini belum muncul di satu pun registri program yang dipantau.
          </p>
        </div>
      )}

      <div className="mt-4 divide-y divide-hairline">
        <BarisLabelNilai label="Jadesta">
          {fakta.jadesta
            ? `${fakta.jadesta.kategori} • ${formatAngka(fakta.jadesta.n_atraksi)} atraksi • ${formatAngka(fakta.jadesta.n_paket)} paket • ${formatAngka(fakta.jadesta.n_homestay)} homestay`
            : strip(null)}
        </BarisLabelNilai>

        <BarisLabelNilai label="Registri desa wisata Sisparnas">
          {fakta.desa_wisata_sisparnas
            ? `${fakta.desa_wisata_sisparnas.nama} • ${formatAngka(fakta.desa_wisata_sisparnas.n_terdaftar)} entri terdaftar`
            : strip(null)}
        </BarisLabelNilai>

        <BarisLabelNilai label="Daya tarik wisata Sisparnas">
          {fakta.n_daya_tarik_wisata === null ? strip(null) : formatSatuan(fakta.n_daya_tarik_wisata, "titik")}
        </BarisLabelNilai>

        <BarisLabelNilai label="Kampung Perikanan Budidaya">
          {fakta.kampung_budidaya ? fakta.kampung_budidaya.komoditas : strip(null)}
        </BarisLabelNilai>

        <BarisLabelNilai label="Kampung Nelayan">
          {fakta.kampung_nelayan
            ? `${fakta.kampung_nelayan.program} (${fakta.kampung_nelayan.tahun})`
            : strip(null)}
        </BarisLabelNilai>

        <BarisLabelNilai label="Cold storage eksisting">
          {cs && cs.length > 0
            ? `${strip(cs[0].status)} • ${nilaiSatuan(cs[0].kapasitas_ton, "ton")}${cs.length > 1 ? ` • +${formatAngka(cs.length - 1)} lainnya` : ""}`
            : strip(null)}
        </BarisLabelNilai>

        <BarisLabelNilai label="Keterlayanan cold storage">
          {fakta.cold_storage_terlayani
            ? `${strip(fakta.cold_storage_terlayani.unit_di_desa)} • ${nilaiSatuan(fakta.cold_storage_terlayani.kapasitas_ton, "ton")} • ${nilaiSatuan(fakta.cold_storage_terlayani.menit_ke_unit, "menit")}`
            : strip(null)}
        </BarisLabelNilai>
      </div>

      <p className="mt-3 text-micro text-muted">{fakta.catatan}</p>
    </section>
  );
}
