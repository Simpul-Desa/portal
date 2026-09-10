"use client";

/**
 * Orkestrator lensa Citra Potensi Desa (Task 22, disunting review adversarial
 * fase 5 #5). Urutan render: breadcrumb DUA tingkat (Prov › Kab — lensa ini
 * tidak butuh desa aktif untuk navigasinya sendiri, pola `JalurEkonomiPanel`)
 * → cabang "belum ada provinsi" → `MutuSel` (bila `?target=` terisi) →
 * bagian DAFTAR KOMODITAS (bergerbang `useCitraDaftar` SENDIRI — muat/galat/
 * kosong/isi) → ajakan pilih kabupaten + `RegionPicker` (bila `?target=`
 * tanpa `?kab=`) → `DaftarDesaSel` (bila keduanya terisi).
 *
 * `MutuSel` dan `DaftarDesaSel` HANYA bergantung pada `useCitraSel` dan
 * `?target=`/`?kab=` — TIDAK digerbang `useCitraDaftar` (review #5). Bila
 * keduanya digerbang query daftar, galat/muat daftar komoditas (yang tidak
 * relevan bagi sel yang sudah berhasil dimuat) membuat peta berwarna
 * sementara seluruh badan panel diam.
 *
 * `useCitraSel` dipanggil LAGI di sini — BUKAN permintaan baru, `queryKey`
 * sama dengan yang dipanggil `useCitraData` di `dashboard-shell.tsx` (cache
 * TanStack dibagi) — pola sama seperti `PetaPeranPanel` memanggil ulang
 * `usePetaPeranPeta`.
 */

import { useMemo } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { BreadcrumbWilayah, type ChipWilayah } from "@/shared/components/breadcrumb-wilayah";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { RegionPicker } from "@/shared/components/region-picker";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useCitraDaftar, useCitraSel } from "../hooks/queries";
import { barisSkor } from "../services/sel";
import { DaftarDesaSel } from "./daftar-desa-sel";
import { DaftarSel } from "./daftar-sel";
import { MutuSel } from "./mutu-sel";

type WilayahState = ReturnType<typeof useWilayahParams>;

const JUMLAH_KERANGKA = 3;

export function CitraPotensiPanel({ wilayah }: { wilayah: WilayahState }) {
  const { prov, kab, target, desa, hapusKab, pilihTarget, pilihDesa, reset } = wilayah;
  const pusat = usePusat();

  const daftar = useCitraDaftar(prov, true);
  const sel = useCitraSel(prov, target, true);
  // 2.651 entri + sort — dihitung ulang HANYA saat sel atau kabupaten
  // berganti (review #4), bukan tiap render shell (mis. tiap `pointermove`
  // saat lebar panel ditarik). Dipanggil TANPA SYARAT di atas early return
  // `!prov` di bawah (Rules of Hooks); guard `sel.data && kab` di DALAM
  // callback, bukan pada pemanggilan hook-nya.
  const barisSel = useMemo(
    () => (sel.data && kab ? barisSkor(sel.data, kab) : []),
    [sel.data, kab],
  );

  if (!prov) {
    return (
      <>
        <section className="rounded-card bg-surface p-5">
          <p className="text-body-md text-ink">Pilih provinsi di peta, atau dari daftar di bawah.</p>
        </section>
        <RegionPicker wilayah={wilayah} />
      </>
    );
  }

  const chip: ChipWilayah[] = [];
  chip.push({
    tingkat: "prov",
    label: pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? prov,
    onHapus: reset,
  });
  if (kab) {
    chip.push({
      tingkat: "kab",
      label: pusat.data?.kabupaten.find((k) => k.idkab === kab)?.nmkab ?? kab,
      // `hapusKab` (BUKAN `pilihProv(prov)`, review #2) — provinsinya TIDAK
      // berganti di sini, hanya naik ke tingkat kabupaten; `pilihProv` selalu
      // membuang `target` karena dibangun untuk provinsi yang benar-benar
      // berganti, dan itu membuang komoditas terpilih diam-diam.
      onHapus: hapusKab,
    });
  }

  // Task 11: `isPending` (BUKAN `isLoading`) dipertahankan sesuai gotcha
  // review ronde 3 fase 5 — lihat komentar di masing-masing blok render di
  // bawah. `kosong: !sel.data` menangkap keadaan settled-sukses-tanpa-data
  // yang sebelumnya ditulis manual (`!sel.isPending && !sel.isError &&
  // !sel.data`); prioritas `pilihKeadaan` memastikan itu hanya berlaku
  // sesudah galat/tertunda/muat disingkirkan.
  const keadaanSel = pilihKeadaan({
    isPending: sel.isPending,
    isPaused: sel.isPaused,
    isError: sel.isError,
    kosong: !sel.data,
  });
  const keadaanDaftar = pilihKeadaan({
    isPending: daftar.isPending,
    isPaused: daftar.isPaused,
    isError: daftar.isError,
    kosong: !daftar.data || daftar.data.daftar.length === 0,
  });

  return (
    <>
      <BreadcrumbWilayah chip={chip} />

      {/* Task 22 GOTCHA: `?target=` mati (deep-link ke sel yang 404, atau
          galat lain) tidak boleh membuat panel diam byte-identik dengan
          "belum ada komoditas dipilih" — gerbang pada nilai MENTAH `target`,
          bukan pada hasil `sel`nya (pola sama dengan `JalurEkonomiPanel`
          review Jalur Ekonomi #3). `MutuSel` HANYA bergantung pada `sel` di
          sini — TIDAK digerbang query `daftar` (review #5). */}
      {/* Review ronde 3 fase 5, R2 (LOW), masih berlaku sesudah Task 11:
          `sel.isPending` (BUKAN `!sel.isError && !sel.data`) sebagai masukan
          `pilihKeadaan` — `data` boleh `null` walau query SUDAH settled
          sukses (skema OpenAPI proyek ini), jadi kerangka tidak boleh
          digerbang ketiadaan `data` semata. Task 11 menambah `isPaused`
          eksplisit di sini — SEBELUMNYA tergabung diam-diam ke dalam
          `isPending` (R3: retryer TanStack menahan `fetchStatus: "fetching"`
          sepanjang loop retry TERMASUK jeda `"paused"`-nya) sehingga keadaan
          offline tidak pernah beda rupa dari muat biasa; kini keduanya
          kalimat yang berbeda. */}
      {target && keadaanSel === "muat" && <KerangkaMuat baris={1} />}
      {target && keadaanSel === "tertunda" && (
        <>
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi data komoditas ini belum bisa dimuat." />
          <button
            type="button"
            onClick={() => sel.refetch()}
            className={`mt-1 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </>
      )}
      {target && sel.isError && (
        <p className="px-1 py-2 text-label text-muted">{pesanGalat(sel.error).judul}</p>
      )}
      {target && sel.data && <MutuSel sel={sel.data} />}
      {target && keadaanSel === "kosong" && (
        <p className="px-1 py-2 text-micro text-muted">Belum ada data untuk ditampilkan.</p>
      )}

      {/* Bagian DAFTAR KOMODITAS — bergerbang query `daftar` SENDIRI. Sebuah
          galat di sini menggantikan HANYA bagian ini, bukan seluruh badan
          panel (review #5). Pola `pilihKeadaan` yang sama seperti `sel` di
          atas (Task 11) — `daftar.isPending` tetap masukannya, alasannya
          sama (review ronde 3 fase 5, R2/R3). */}
      {keadaanDaftar === "muat" && <KerangkaMuat baris={JUMLAH_KERANGKA} />}

      {keadaanDaftar === "tertunda" && (
        <section className="rounded-card bg-surface p-5">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar komoditas belum bisa dimuat." />
          <button
            type="button"
            onClick={() => daftar.refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </section>
      )}

      {daftar.isError && <BlokGalat galat={daftar.error} onCobaLagi={() => daftar.refetch()} />}

      {keadaanDaftar === "kosong" && !daftar.data && (
        <p className="px-1 py-2 text-micro text-muted">Belum ada data untuk ditampilkan.</p>
      )}

      {keadaanDaftar === "kosong" && daftar.data && daftar.data.daftar.length === 0 && (
        <section className="rounded-card bg-surface p-5">
          <p className="text-title-sm text-ink">Belum ada komoditas tervalidasi</p>
          <p className="mt-1 text-body-md text-muted">
            Belum ada komoditas yang lolos uji di provinsi ini.
          </p>
        </section>
      )}

      {keadaanDaftar === "isi" && daftar.data && daftar.data.daftar.length > 0 && (
        <DaftarSel
          daftar={daftar.data.daftar}
          targetAktif={target}
          onPilih={pilihTarget}
          lengkap={daftar.data.lengkap}
        />
      )}

      {/* Ajakan pilih kabupaten + jalan keluarnya (review #3): satu-satunya
          jalan sebelumnya adalah mengeklik lingkaran di peta, dan itu tidak
          disebut di mana pun. `RegionPicker` sudah menampilkan daftar
          kabupaten begitu `prov` ada, dan sudah memakai `pilihKab` yang
          mempertahankan `target`. */}
      {target && !kab && (
        <>
          <section className="rounded-card bg-surface p-5">
            <p className="text-title-sm text-ink">Pilih kabupaten untuk melihat peringkat desa</p>
            <p className="mt-1 text-body-md text-muted">
              Skor komoditas ini dihitung relatif di dalam kabupaten, jadi daftar peringkatnya baru muncul setelah kabupaten dipilih.
            </p>
          </section>
          {/* `tanpaBreadcrumb` (review ronde 2 fase 5, B4): `BreadcrumbWilayah`
              milik panel ini sudah dirender di atas (baris 100), jadi chip
              wilayah bawaan `RegionPicker` di sini hanya menduplikasinya. */}
          <RegionPicker wilayah={wilayah} tanpaBreadcrumb />
        </>
      )}

      {/* `DaftarDesaSel` HANYA bergantung pada `sel` dan `?kab=` — TIDAK
          digerbang query `daftar` (review #5). */}
      {target && kab && sel.data && (
        <DaftarDesaSel
          key={`${target}-${kab}`}
          kab={kab}
          baris={barisSel}
          desaAktif={desa}
          onPilihDesa={pilihDesa}
        />
      )}
    </>
  );
}
