"use client";

/**
 * Orkestrator lensa Jalur Ekonomi (Task 33, rencana
 * `fase-3-4-peta-peran-jalur-ekonomi.plan.md`). Urutan render: breadcrumb
 * ringkas (Prov › Kab — TANPA Desa, lensa ini tidak butuh desa aktif, PRD
 * §5.3) → `PilihVarian` → badan bergerbang satu query primer
 * (`ParameterVarian` → `DetailJalur` bila jalur terpilih → `DaftarJalur` →
 * catatan `n_tanpa_koordinat`).
 *
 * `?kab=` OPSIONAL di sini (beda dari peta choropleth Peta Peran yang
 * mewajibkannya) — tanpa `kab`, `useJalurDaftar` mengembalikan daftar
 * nasional berpaginasi; `kab` hanya wajib supaya GARIS di peta (`use-map-
 * layers.ts`) punya sumber koordinat.
 *
 * `useJalurData` dipanggil LAGI di sini — BUKAN permintaan baru, `queryKey`
 * sama dengan yang dipanggil `useJalurLayers` di `dashboard-shell.tsx`
 * (cache TanStack Query dibagi) — untuk membaca `jalur` (detail
 * ternormalisasi, dipakai `DetailJalur`) dan `n_tanpa_koordinat` (Task 33e).
 * Pola sama seperti `PetaPeranPanel` memanggil ulang `usePetaPeranPeta`
 * hanya untuk bendera `lengkap`-nya.
 *
 * M2: query PRIMER badan panel (`BadanJalurEkonomi` di bawah) SELALU
 * `hal: 1` — dipakai HANYA untuk gerbang muat/404/galat/keadaan-kosong dan
 * `meta.parameter` (`ParameterVarian`), nilai yang SAMA di halaman mana pun.
 * Baris daftar HALAMAN AKTIF punya `hal` state dan query sendiri di dalam
 * `DaftarJalur` (pola sama seperti `DaftarDesa` Peta Peran) — berganti
 * halaman jadi HANYA memuat ulang daftarnya sendiri, bukan seluruh badan
 * panel termasuk `ParameterVarian` dan `DetailJalur` yang tidak bergantung
 * pada halaman sama sekali.
 */

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { VARIAN_DEFAULT, type Varian } from "@/lib/url-state";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "@/shared/components/breadcrumb-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatAngka } from "@/shared/format";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useJalurDaftar } from "../hooks/queries";
import { useJalurData } from "../hooks/use-jalur-data";
import type { JalurTernormalisasi } from "../types";
import { DaftarJalur } from "./daftar-jalur";
import { DetailJalur } from "./detail-jalur";
import { ParameterVarian } from "./parameter-varian";
import { PilihVarian } from "./pilih-varian";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

type BadanJalurEkonomiProps = {
  varian: Varian;
  kab?: string;
  jalurAktif?: string;
  onPilihJalur: WilayahState["pilihJalur"];
  jalurTerpilih: JalurTernormalisasi | null;
  n_tanpa_koordinat: number;
  /** `true` HANYA bila Desa Poros sendiri tanpa koordinat (`useJalurData`) —
   * membedakan "seluruh jalur tidak tergambar" dari "sebagian anggota
   * hilang" (Task 33e, review Jalur Ekonomi #2). */
  porosTanpaKoordinat: boolean;
  /** Status `useJalurDetail` (`useJalurData`, temuan review Jalur Ekonomi
   * #3) — dipakai untuk merender skeleton/baris galat ringkas saat `?jalur=`
   * di URL tidak bisa dimuat, alih-alih diam byte-identik dengan "belum ada
   * jalur dipilih". */
  isLoadingJalur: boolean;
  isErrorJalur: boolean;
  errorJalur: GalatApi | null;
  /** `useJalurData().isPausedJalur` — fetch offline yang dijeda (lihat
   * `keadaan.ts`), dipakai lewat `pilihKeadaan` supaya baris detail sekunder
   * ini ikut dapat cabang "tertunda", persis pola `keadaanPrimer` di bawah. */
  isPausedJalur: boolean;
};

/**
 * Badan panel di bawah `PilihVarian` — parameter varian, detail satu jalur,
 * daftar jalur, dan catatan `n_tanpa_koordinat`. Query PRIMER (`primer`,
 * `hal` TETAP 1 — lihat docstring modul di atas, M2) menggerbang
 * muat/404/galat/kosong dan memberi `meta.parameter`; baris daftar HALAMAN
 * AKTIF dimuat SENDIRI oleh `DaftarJalur`, jadi berganti halaman tidak
 * membuat `ParameterVarian`/`DetailJalur` ikut lenyap sesaat.
 */
function BadanJalurEkonomi({
  varian,
  kab,
  jalurAktif,
  onPilihJalur,
  jalurTerpilih,
  n_tanpa_koordinat,
  porosTanpaKoordinat,
  isLoadingJalur,
  isErrorJalur,
  errorJalur,
  isPausedJalur,
}: BadanJalurEkonomiProps) {
  const primer = useJalurDaftar({ varian, kab, hal: 1, aktif: true });

  // Task 11: `isPending` — `aktif` di sini SELALU `true` (query ini tidak
  // digerbang `kab`/`prov`, lihat docstring modul di atas), jadi tidak ada
  // jebakan query nonaktif macet `isPending`.
  const keadaanPrimer = pilihKeadaan({
    isPending: primer.isPending,
    isPaused: primer.isPaused,
    isError: primer.isError,
  });

  if (keadaanPrimer === "muat") return <KerangkaMuat baris={JUMLAH_KERANGKA} />;

  if (keadaanPrimer === "tertunda") {
    return (
      <section className="rounded-card bg-surface p-5">
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi Jalur Ekonomi belum bisa dimuat." />
        <button
          type="button"
          onClick={() => primer.refetch()}
          className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
        >
          Coba lagi
        </button>
      </section>
    );
  }

  // Task 33b: 404 `WILAYAH_TIDAK_ADA` — kabupaten tidak ada di berkas varian
  // ini (tidak semua varian berjalan di semua kabupaten, mis. `wisata`).
  // Keadaan kosong berketerangan, BUKAN kartu galat. Cacah kabupaten per
  // varian TIDAK ditulis di sini — itu angka artefak `data/`, lihat
  // `CLAUDE.md` (lokal saja) §9.
  if (primer.isError && primer.error.kode === "WILAYAH_TIDAK_ADA") {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">Varian ini tidak mencakup kabupaten terpilih</p>
        <p className="mt-1 text-body-md text-muted">Pilih varian lain, atau ganti kabupatennya.</p>
      </section>
    );
  }

  // Task 33d: galat lain — BlokGalat.
  if (primer.isError) {
    return <BlokGalat galat={primer.error} onCobaLagi={() => primer.refetch()} />;
  }

  if (!primer.data) return null;

  // Task 33c: kabupaten `TAK_LAYAK` — sukses, daftar kosong. Keadaan kosong
  // berketerangan, BUKAN galat (`DaftarJalur` sendiri kembali `null` untuk
  // `total === 0`, jadi kartu ini yang menggantikannya supaya badan panel
  // tidak pernah kosong bisu). Kalimat bercabang pada `kab` (review Jalur
  // Ekonomi #4c, MEDIUM): TANPA `kab`, `modelJalurDaftar` mengembalikan
  // daftar NASIONAL (endpoint ini tidak punya filter provinsi) — menyebut
  // "kabupaten ini" saat `kab` kosong salah walau `prov` sudah dipilih,
  // karena daftar yang barusan kosong itu memang mencakup semua kabupaten.
  if (primer.data.meta?.total === 0) {
    return (
      <section className="rounded-card bg-surface p-5">
        <p className="text-title-sm text-ink">
          {kab ? "Tidak ada jalur di kabupaten ini" : "Tidak ada jalur untuk varian ini"}
        </p>
        <p className="mt-1 text-body-md text-muted">
          {kab
            ? "Kabupaten ini belum punya jalur ekonomi untuk varian yang dipilih."
            : "Varian ini tidak punya jalur ekonomi."}
        </p>
      </section>
    );
  }

  const keadaanJalurAktif = pilihKeadaan({
    isPending: isLoadingJalur,
    isPaused: isPausedJalur,
    isError: isErrorJalur,
  });

  return (
    <>
      <ParameterVarian varian={varian} parameter={primer.data.meta?.parameter} />

      {/* Review Jalur Ekonomi #3, HIGH: `?jalur=` yang mati (404, atau galat
          lain) sebelumnya membuat `jalurTerpilih` tetap `null` tanpa jejak —
          panel diam byte-identik dengan "belum ada jalur dipilih". Digerbang
          `jalurAktif` (nilai mentah `?jalur=`), bukan `jalurTerpilih`, persis
          pola `desa && detail.isLoading`/`desa && detail.isError` di
          `PetaPeranPanel` — baris kecil, bukan kartu galat penuh, karena
          detail jalur adalah elemen SEKUNDER di bawah gerbang `primer`. */}
      {jalurAktif && isLoadingJalur && <KerangkaMuat baris={1} />}
      {/* Kalimat di bawah menyebut "detail jalur", bukan nama lensanya: baris
          ini milik SATU jalur yang dipilih, sementara kalimat kembar di baris
          primer di atas memang soal lensa Jalur Ekonomi yang gagal dimuat
          seluruhnya. Mengulang nama lensa di sini membuat pembaca mengira
          seluruh lensa mati padahal daftarnya masih terbaca. */}
      {jalurAktif && keadaanJalurAktif === "tertunda" && (
        <KeadaanKosong kalimat="Sambungan sedang terputus, jadi detail jalur belum bisa dimuat." />
      )}
      {jalurAktif && isErrorJalur && errorJalur && (
        <p className="px-1 py-2 text-label text-muted">{pesanGalat(errorJalur).judul}</p>
      )}
      {jalurTerpilih && <DetailJalur varian={varian} jalur={jalurTerpilih} />}

      <DaftarJalur varian={varian} kab={kab} jalurAktif={jalurAktif} onPilih={onPilihJalur} />

      {/* Task 33e + review Jalur Ekonomi #2/#3: tiga keadaan garis peta tidak
          bisa dijelaskan satu kalimat sama. (1) `jalur` terpilih lewat deep
          link tanpa `?kab=` — `useGeoDesa` belum pernah diminta (`enabled:
          Boolean(kab)`), jadi peta diam bisu tanpa `kab` sama sekali kecuali
          diberi keterangan eksplisit di sini. (2) `porosTanpaKoordinat` —
          Desa Poros sendiri tanpa batas wilayah: SELURUH jalur (bukan
          sebagian) tidak tergambar, `n_tanpa_koordinat` sendiri menyesatkan
          di sini (honest count 1, tapi pembaca bisa mengira cuma satu garis
          dari banyak yang hilang). (3) sisanya: hanya SEBAGIAN anggota tanpa
          batas wilayah, poros dan garis lain tetap tergambar. */}
      {jalurTerpilih && !kab ? (
        <p className="text-micro text-muted">
          Garis jalur ini belum tergambar di peta karena kabupatennya belum dipilih.
        </p>
      ) : porosTanpaKoordinat ? (
        <p className="text-micro text-muted">
          Desa Poros jalur ini tidak punya batas wilayah, jadi garisnya sama sekali tidak tergambar di peta.
        </p>
      ) : (
        n_tanpa_koordinat > 0 && (
          <p className="text-micro text-muted">
            {formatAngka(n_tanpa_koordinat)} desa tidak punya batas wilayah, jadi garisnya tidak tergambar di peta.
          </p>
        )
      )}
    </>
  );
}

export function JalurEkonomiPanel({ wilayah }: { wilayah: WilayahState }) {
  const { prov, kab, varian, jalur, pilihVarian, pilihJalur, pilihProv, reset } = wilayah;
  const varianAktif = varian ?? VARIAN_DEFAULT;
  const pusat = usePusat();

  // `n_tanpa_koordinat` untuk Task 33e — lihat docstring modul di atas
  // (cache dibagi dengan `useJalurLayers`, bukan permintaan baru).
  // `isLoadingJalur`/`isErrorJalur`/`errorJalur` untuk review Jalur Ekonomi
  // #3 — lihat komentar di `BadanJalurEkonomi`.
  const {
    jalur: jalurTerpilih,
    n_tanpa_koordinat,
    porosTanpaKoordinat,
    isLoadingJalur,
    isErrorJalur,
    errorJalur,
    isPausedJalur,
  } = useJalurData({
    kab,
    varian: varianAktif,
    idJalur: jalur,
    aktif: true,
  });


  return (
    <>

      <PilihVarian varian={varianAktif} onPilih={pilihVarian} />

      <BadanJalurEkonomi
        key={`${varianAktif}-${kab ?? ""}`}
        varian={varianAktif}
        kab={kab}
        jalurAktif={jalur}
        onPilihJalur={pilihJalur}
        jalurTerpilih={jalurTerpilih}
        n_tanpa_koordinat={n_tanpa_koordinat}
        porosTanpaKoordinat={porosTanpaKoordinat}
        isLoadingJalur={isLoadingJalur}
        isErrorJalur={isErrorJalur}
        errorJalur={errorJalur}
        isPausedJalur={isPausedJalur}
      />
    </>
  );
}
