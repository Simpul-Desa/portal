"use client";

/**
 * Orkestrator lensa Citra Potensi Desa.
 * Layout 2 kolom:
 * - Kolom 1 (Kiri): Daftar Komoditas tervalidasi. Komoditas aktif menampilkan
 *   nilai mutu uji tertahan dan rentang keyakinan langsung di bawahnya.
 * - Kolom 2 (Kanan):
 *   - Bila kabupaten belum dipilih: Informasi & daftar pilihan kabupaten.
 *   - Bila kabupaten sudah dipilih: Daftar desa berperingkat dari no 1 ke bawah,
 *     lengkap dengan skor dan tautan ke Kartu Ekonomi Desa.
 */

import { useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { BlokGalat, KeadaanKosong, KerangkaMuatPrimer } from "@/shared/components/blok-keadaan";
import { EmptyState } from "@/shared/components/empty-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { usePusat } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { useCitraDaftar, useCitraSel } from "../hooks/queries";
import { barisSkor, namaKomoditas } from "../services/sel";
import { DaftarDesaSel } from "./daftar-desa-sel";
import { DaftarSel } from "./daftar-sel";

type WilayahState = ReturnType<typeof useWilayahParams>;

export function CitraPotensiPanel({ wilayah }: { wilayah: WilayahState }) {
  const {
    prov,
    kab,
    target,
    desa,
    pilihKab,
    hapusKab,
    pilihTarget,
    pilihDesa,
    bukaTujuan,
  } = wilayah;
  const pusat = usePusat();

  const daftar = useCitraDaftar(prov, true);
  const sel = useCitraSel(prov, target, true);

  // Auto-select komoditas pertama bila belum ada target terpilih
  useEffect(() => {
    if (!target && daftar.data?.daftar && daftar.data.daftar.length > 0) {
      pilihTarget(daftar.data.daftar[0].target);
    }
  }, [target, daftar.data, pilihTarget]);

  const barisSel = useMemo(
    () => (sel.data && kab ? barisSkor(sel.data, kab) : []),
    [sel.data, kab],
  );

  const namaProv =
    pusat.data?.provinsi.find((p) => p.idprov === prov)?.nama ?? "";
  const namaKab =
    pusat.data?.kabupaten.find((k) => k.idkab === kab)?.nmkab ?? "";

  const daftarKab = useMemo(
    () => (prov ? pusat.data?.kabupaten.filter((k) => k.idprov === prov) ?? [] : []),
    [pusat.data?.kabupaten, prov],
  );

  const komoditasAktif = useMemo(() => {
    if (!target || !daftar.data?.daftar) return null;
    return daftar.data.daftar.find((s) => s.target === target) ?? null;
  }, [target, daftar.data]);

  if (!prov) {
    return (
      <EmptyState pesan="Pilih provinsi di peta atau kolom pencarian terlebih dahulu" />
    );
  }

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
    <div className="space-y-4">
      {/* Header Wilayah */}
      <div className="flex items-center justify-between px-1">
        <div className="min-w-0">
          <h2 className="text-title-md text-ink font-semibold truncate">
            {kab
              ? `Kab. ${namaKab || kab}, Provinsi ${namaProv || prov}`
              : `Provinsi ${namaProv || prov}`}
          </h2>
          <p className="mt-0.5 text-micro text-muted">
            Pemodelan potensi komoditas desa berbasis citra satelit & data sensus
          </p>
        </div>
        {kab && (
          <button
            type="button"
            onClick={() => hapusKab()}
            className={`shrink-0 text-micro text-muted hover:text-ink px-2.5 py-1 rounded-control hover:bg-surface border border-transparent hover:border-hairline transition-all cursor-pointer ${FOCUS_RING}`}
            title="Ganti kabupaten terpilih"
          >
            Ganti Kab.
          </button>
        )}
      </div>

      {/* Kontainer 2 Kolom: Kolom 1 (Komoditas) lebih ringkas daripada Kolom 2 (Peringkat Desa) */}
      <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-4 items-start">
        {/* Kolom 1: List Komoditas yang ada */}
        <div className="min-w-0 space-y-4">
          {keadaanDaftar === "muat" && <KerangkaMuatPrimer />}

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

          {daftar.isError && (
            <BlokGalat galat={daftar.error} onCobaLagi={() => daftar.refetch()} />
          )}

          {keadaanDaftar === "kosong" && !daftar.data && (
            <p className="px-1 py-2 text-micro text-muted">
              Belum ada data untuk ditampilkan.
            </p>
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
        </div>

        {/* Kolom 2: Peringkat Desa / Informasi Pilih Kabupaten */}
        <div className="min-w-0 space-y-4">
          {!kab ? (
            /* Peringkat baru muncul ketika user sudah memilih kabupaten */
            <section className="flex flex-col items-center text-center py-4 px-1">
              <div className="mb-2.5 flex size-10 items-center justify-center rounded-full bg-float border border-line text-muted shadow-2xs">
                <MapPin className="size-5 text-muted" strokeWidth={1.75} />
              </div>
              <h3 className="text-title-sm font-semibold text-ink">Pilih Kabupaten</h3>
              <p className="mt-1 text-micro text-muted max-w-[280px] leading-relaxed">
                Peringkat desa baru muncul setelah kabupaten dipilih, karena skor komoditas dihitung relatif di dalam kabupaten.
              </p>

              {daftarKab.length > 0 && (
                <div className="mt-4 w-full text-left pt-3 border-t border-hairline">
                  <p className="text-micro font-medium text-muted mb-2 px-1">
                    Pilih kabupaten di {namaProv || "provinsi ini"}:
                  </p>
                  <div className="max-h-64 overflow-y-auto divide-y divide-hairline border-y border-hairline">
                    {daftarKab.map((k) => (
                      <button
                        key={k.idkab}
                        type="button"
                        onClick={() => pilihKab(k.idkab)}
                        className={`flex w-full items-center justify-between px-2 py-2 text-left rounded-md hover:bg-surface transition-colors cursor-pointer ${FOCUS_RING}`}
                      >
                        <span className="text-body-md font-medium text-ink truncate">
                          {k.nmkab}
                        </span>
                        <span className="text-micro text-muted shrink-0 font-mono">
                          {k.n_desa} desa
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          ) : !target ? (
            <section className="py-8 text-center">
              <p className="text-title-sm font-semibold text-ink">Pilih Komoditas</p>
              <p className="mt-1 text-micro text-muted">
                Pilih salah satu komoditas di kolom kiri untuk menampilkan peringkat desa.
              </p>
            </section>
          ) : (
            /* Kabupaten dan komoditas sudah dipilih -> Tampilkan peringkat desa */
            <>
              {keadaanSel === "muat" && <KerangkaMuatPrimer />}

              {keadaanSel === "tertunda" && (
                <section className="py-6 text-center">
                  <KeadaanKosong kalimat="Sambungan sedang terputus, jadi data komoditas belum bisa dimuat." />
                  <button
                    type="button"
                    onClick={() => sel.refetch()}
                    className={`mt-3 inline-flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
                  >
                    Coba lagi
                  </button>
                </section>
              )}

              {sel.isError && (
                <p className="px-1 py-2 text-micro text-muted">
                  {pesanGalat(sel.error).judul}
                </p>
              )}

              {sel.data && (
                <DaftarDesaSel
                  key={`${target}-${kab}`}
                  kab={kab}
                  baris={barisSel}
                  desaAktif={desa}
                  onPilihDesa={pilihDesa}
                  onBukaKartu={(iddesa) => {
                    bukaTujuan({
                      lensa: "kartu",
                      prov: iddesa.slice(0, 2),
                      kab: iddesa.slice(0, 4),
                      desa: iddesa,
                    });
                  }}
                  namaKab={namaKab}
                  namaKomoditas={komoditasAktif ? namaKomoditas(komoditasAktif.nama) : undefined}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
