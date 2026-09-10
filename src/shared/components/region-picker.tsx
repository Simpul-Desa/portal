"use client";

import { adalahGangguanServer, pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatAngka } from "@/shared/format";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { KeadaanKosong, KerangkaMuat } from "./blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "./breadcrumb-wilayah";

type WilayahState = ReturnType<typeof useWilayahParams>;

type RegionPickerProps = {
  wilayah: Pick<WilayahState, "prov" | "kab" | "pilihProv" | "pilihKab" | "reset">;
  /** `true` menyembunyikan `BreadcrumbWilayah` internal komponen ini — dipakai
   * pemanggil yang sudah merender breadcrumb sendiri di atasnya (review ronde
   * 2 fase 5, B4: panel Citra dan panel Desa Kembar, keduanya sudah punya
   * breadcrumb sendiri sebelum menampilkan `RegionPicker`, sehingga tanpa
   * prop ini chip wilayah dan tombol × muncul dua kali). Bawaan `false`
   * supaya pemanggil lama tidak berubah. */
  tanpaBreadcrumb?: boolean;
};

const KELAS_BARIS =
  `flex h-11 w-full items-center justify-between gap-2 px-3 text-left text-body-md text-ink hover:bg-inset ${FOCUS_RING}`;

/**
 * Pemilih wilayah dua tingkat (Task 22): daftar provinsi → setelah terpilih,
 * daftar kabupaten milik provinsi itu. Breadcrumb "Prov › Kab" di atas, tiap
 * chip menghapus tingkatnya sendiri lewat setter yang SUDAH ADA di
 * `use-wilayah-params.ts` — TANPA menambah fungsi baru di hook itu (arahan
 * Fable): hapus chip Kab = `pilihProv(prov)` (set ulang prov yang sama →
 * kab+desa terbuang, kembali ke lingkaran kabupaten provinsi itu); hapus
 * chip Prov = `reset()` (kembali ke lingkaran 5 provinsi). Baris kabupaten
 * TETAP tampil (baris aktif ber-pill `bg-inset`) walau satu kabupaten sudah
 * dipilih, supaya pindah ke kabupaten tetangga tidak perlu kembali ke
 * daftar provinsi dulu.
 */
export function RegionPicker({ wilayah, tanpaBreadcrumb = false }: RegionPickerProps) {
  const { prov, kab, pilihProv, pilihKab, reset } = wilayah;
  const pusat = usePusat();
  // Baris kabupaten diambil dari `usePusat().kabupaten` (review Blok D #17) —
  // payload itu sudah memuat `idkab`/`nmkab`/`n_desa`, jadi tidak perlu query
  // `useKabupaten` terpisah untuk satu-satunya hal yang dipakai di sini: nama.
  // Satu sumber nama kabupaten untuk seluruh panel (pengendali layer peta
  // juga membaca `usePusat()`, bukan `useKabupaten`).
  const kabupaten = prov ? (pusat.data?.kabupaten.filter((k) => k.idprov === prov) ?? []) : [];

  // Task 11: `RegionPicker` dipakai lensa lain sebagai fallback yang selalu
  // di-mount tanpa syarat query lain — `usePusat()` tidak punya `enabled`
  // sama sekali, jadi `isPending` aman dipakai langsung, tidak ada jebakan
  // query nonaktif.
  const keadaanPusat = pilihKeadaan({
    isPending: pusat.isPending,
    isPaused: pusat.isPaused,
    isError: pusat.isError,
  });

  // Task 4 (status region): umumkan TINGKAT yang baru termuat — daftar
  // provinsi, atau daftar kabupaten satu provinsi.
  const namaProvUntukStatus = pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov;
  const kalimatStatus = !pusat.data
    ? ""
    : prov
      ? `Daftar kabupaten ${namaProvUntukStatus} termuat.`
      : "Daftar provinsi termuat.";

  const chip: ChipWilayah[] = [];
  if (prov) {
    const namaProv = pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov;
    chip.push({ tingkat: "prov", label: namaProv, onHapus: reset });
  }
  if (prov && kab) {
    const namaKab = pusat.data?.kabupaten.find((k) => k.idkab === kab)?.nmkab ?? kab;
    chip.push({ tingkat: "kab", label: namaKab, onHapus: () => pilihProv(prov) });
  }

  return (
    <section className="rounded-card bg-surface p-5">
      <h2 className="text-title-md text-ink">Pilih wilayah</h2>

      {!tanpaBreadcrumb && chip.length > 0 && (
        <div className="mt-4">
          <BreadcrumbWilayah chip={chip} />
        </div>
      )}

      <p role="status" aria-live="polite" className="sr-only">
        {kalimatStatus}
      </p>

      <div className="mt-4">
        {keadaanPusat === "muat" && <KerangkaMuat baris={3} />}

        {keadaanPusat === "tertunda" && (
          <>
            <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar wilayah belum bisa dimuat." />
            <button
              type="button"
              onClick={() => pusat.refetch()}
              className={`mt-1 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
            >
              Coba lagi
            </button>
          </>
        )}

        {/* Gangguan server (api tak terjangkau atau 5xx) TIDAK diulang di
            sini: `BlokNotifikasi` di atas isi panel sudah mengumumkannya
            beserta tombol coba lagi, dan dua kalimat "Gangguan sambungan"
            di satu layar membuat pembaca mengira ada dua masalah. Galat
            lain (mis. 404 wilayah) tetap tampil di tempatnya, karena blok
            itu memang tidak menanganinya. */}
        {pusat.isError && !adalahGangguanServer(pusat.error) && (
          <p className="px-1 py-2 text-label text-muted">{pesanGalat(pusat.error).judul}</p>
        )}

        {!prov && pusat.data && (
          <div className="flex flex-col divide-y divide-hairline">
            {pusat.data.provinsi.map((p) => (
              <button
                key={p.idprov}
                type="button"
                onClick={() => pilihProv(p.idprov)}
                className={KELAS_BARIS}
              >
                <span>{p.nama}</span>
                <span className="text-label text-muted">{formatAngka(p.n_desa)} desa</span>
              </button>
            ))}
          </div>
        )}

        {prov && pusat.data && (
          <div className="flex flex-col divide-y divide-hairline">
            {kabupaten.map((k) => {
              const terpilih = k.idkab === kab;
              return (
                <button
                  key={k.idkab}
                  type="button"
                  onClick={() => pilihKab(k.idkab)}
                  aria-current={terpilih || undefined}
                  className={`${KELAS_BARIS} ${terpilih ? "rounded-control bg-inset" : ""}`}
                >
                  <span>{k.nmkab}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
