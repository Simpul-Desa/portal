"use client";

import { bisa } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { SeksiBerita } from "@/features/berita/components/seksi-berita";
import { KartuLaporan } from "@/features/laporan/components/kartu-laporan";
import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "@/shared/components/breadcrumb-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useKartu } from "../hooks/queries";
import type { KartuDesa } from "../types";
import { SeksiBiofisikLogistik } from "./seksi-biofisik-logistik";
import { SeksiDesaKembar } from "./seksi-desa-kembar";
import { SeksiEntitas } from "./seksi-entitas";
import { SeksiFaktaProgram } from "./seksi-fakta-program";
import { SeksiKesiapan } from "./seksi-kesiapan";
import { SeksiMutuData } from "./seksi-mutu-data";
import { SeksiPotensi } from "./seksi-potensi";
import { SeksiRekomendasi } from "./seksi-rekomendasi";
import { SeksiZona } from "./seksi-zona";

type WilayahState = ReturnType<typeof useWilayahParams>;

type KartuPanelProps = {
  wilayah: Pick<WilayahState, "prov" | "kab" | "desa" | "pilihProv" | "pilihKab" | "reset">;
};

const JUMLAH_KERANGKA = 4;

/**
 * Orkestrator lensa Kartu (Task 24): breadcrumb ringkas Prov › Kab › Desa
 * (keputusan Fable — strip navigasi, BUKAN kartu pemilih penuh; × tiap chip
 * pakai setter yang SUDAH ADA: hapus desa = `pilihKab(kab)`, hapus kab =
 * `pilihProv(prov)`, hapus prov = `reset()`), lalu keadaan muat/galat/404,
 * lalu 9 seksi kartu (urutan rencana; `jalur_ekonomi` tidak dirender fase 1).
 *
 * Sejak fase 7 panel ini membawa dua blok bergerbang peran di luar kartu itu
 * sendiri: seksi Berita Desa sebagai seksi ke-9 (sesudah Desa Kembar, sebelum
 * Mutu data) untuk tamu ke atas, dan kartu Laporan Desa di kaki panel untuk
 * pemerintah ke atas. Gerbangnya diturunkan saat render dari `useSesi()` —
 * bukan disimpan di state — supaya peran yang turun di tengah sesi langsung
 * menutup keduanya.
 *
 * `data` dari `useKartu` bertipe `{[key:string]:unknown}` (OpenAPI memang
 * mengetik `dict[str,Any]`) — di-cast KE `KartuDesa` SEKALI di sini saja;
 * seksi anak menerima tipe yang sudah benar, tidak ada cast berulang.
 */
export function KartuPanel({ wilayah }: KartuPanelProps) {
  const { prov, kab, desa, pilihProv, pilihKab, reset } = wilayah;
  const pusat = usePusat();
  const { peran, memuat } = useSesi();
  const { data, isPending, isPaused, isError, error, refetch } = useKartu(desa);
  const kartu = data as KartuDesa | undefined;

  // Task 11: `isPending` — `dashboard-shell.tsx` hanya me-mount `KartuPanel`
  // saat `wilayah.desa` terisi (`wilayah.desa ? <KartuPanel/> : <EmptyState/>`),
  // jadi `useKartu(desa)` (`enabled: Boolean(desa)`) SELALU `enabled` di
  // sini; tidak ada jebakan query nonaktif macet `isPending`.
  const keadaan = pilihKeadaan({ isPending, isPaused, isError });

  // Task 4 (status region): jalur konten utama dasbor — umumkan pemuatan,
  // lalu kesiapan kartu desa bernama. Wadah dipasang TANPA SYARAT di JSX di
  // bawah dengan string kosong bawaan, supaya wadahnya sudah ada di DOM
  // SEBELUM isinya berubah (region yang baru muncul bersamaan isinya tidak
  // selalu terumumkan pembaca layar).
  const kalimatStatus =
    keadaan === "muat"
      ? "Memuat kartu desa."
      : keadaan === "isi" && kartu
        ? `Kartu ${kartu.identitas.nama} termuat.`
        : "";

  // `!memuat` menahan kedipan: sebelum peran terbaca, `peran` bawaannya
  // "anonim", jadi tanpa penjaga ini pengguna pemerintah melihat kartu laporan
  // muncul-hilang-muncul saat halaman dimuat. Alasan yang sama dipakai
  // `lensaEfektif` di `dashboard-shell.tsx`.
  const bisaBerita = !memuat && bisa(peran, "berita");
  const bisaLaporan = !memuat && bisa(peran, "laporan");

  const namaProvinsi = pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov ?? "—";

  return (
    <>

      <p role="status" aria-live="polite" className="sr-only">
        {kalimatStatus}
      </p>

      {keadaan === "muat" && <KerangkaMuat baris={JUMLAH_KERANGKA} />}

      {keadaan === "tertunda" && (
        <section className="rounded-card bg-surface p-5">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi kartu desa belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </section>
      )}

      {isError && error.status === 404 && (
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Desa tidak ditemukan</p>
          <p className="mt-1 text-body-md text-muted">{pesanGalat(error).pesan}</p>
        </section>
      )}

      {isError && error.status !== 404 && (
        <BlokGalat galat={error} onCobaLagi={() => refetch()} />
      )}

      {keadaan === "isi" && kartu && (
        <>
          <SeksiEntitas identitas={kartu.identitas} namaProvinsi={namaProvinsi} />
          <SeksiZona petaPeran={kartu.peta_peran} />
          <SeksiPotensi potensi={kartu.potensi} />
          <SeksiRekomendasi teks={kartu.rekomendasi_aksi} />
          <SeksiKesiapan komponen={kartu.kesiapan.komponen} />
          <SeksiFaktaProgram fakta={kartu.fakta_program} />
          <SeksiBiofisikLogistik biofisik={kartu.biofisik} logistik={kartu.logistik} />
          <SeksiDesaKembar desaKembar={kartu.desa_kembar} />
          {/* `key={desa}` pada kedua blok: tanpa itu, state internalnya
              (daftar berita yang sedang terbuka, galat unduh terakhir) ikut
              berpindah saat pengguna membuka desa lain. */}
          {bisaBerita && desa && <SeksiBerita key={desa} iddesa={desa} />}
          <SeksiMutuData mutuData={kartu.mutu_data} />
          {bisaLaporan && desa && <KartuLaporan key={desa} iddesa={desa} />}
        </>
      )}
    </>
  );
}
