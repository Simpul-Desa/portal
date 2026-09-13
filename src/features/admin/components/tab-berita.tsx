"use client";

/**
 * Tab Berita Halaman Admin: dua kartu independen. Kartu Segarkan memicu
 * pekerjaan panen RSS di `api/` untuk desa yang dipilih dengan opsi pembatalan
 * dan status live berputar; kartu Hapus berita nyasar menampilkan daftar desa
 * yang sudah dipanen, detail berita dalam tabel sederhana, dan aksi penghapusan.
 */

import { useEffect, useRef, useState } from "react";
import { ExternalLink, RotateCcw } from "lucide-react";

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { useBerita, type ItemBerita } from "@/features/berita/hooks/queries";
import { catatanTerpotong, urlAman } from "@/features/berita/services/berita";
import { useKartu } from "@/features/kartu/hooks/queries";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { formatTanggal } from "@/shared/format";

import { CariDesaAdmin } from "./cari-desa-admin";
import { PemilihDesa } from "./pemilih-desa";
import { useStatusAdmin } from "../hooks/queries";
import {
  useBatalkanSegarkan,
  useHapusBerita,
  useSegarkanBerita,
} from "../hooks/use-aksi-admin";
import { hapusDesa, labelKemajuan, tambahDesa, type DesaTerpilih } from "../services/segarkan";

function KartuSegarkanBerita() {
  const [terpilih, setTerpilih] = useState<readonly DesaTerpilih[]>([]);
  const { segarkan, sedangKirim, hasil, galat } = useSegarkanBerita();
  const { batalkan, sedangBatal } = useBatalkanSegarkan();
  const status = useStatusAdmin();
  const penyegaran = status.data?.penyegaran;
  const sedangBerjalan = penyegaran?.keadaan === "berjalan";

  return (
    <section className="rounded-2xl border border-hairline bg-surface/30 p-5 md:p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-title-sm font-semibold text-ink">1. Segarkan Berita Desa (Panen RSS)</h3>
          <p className="mt-0.5 text-body-md text-body">
            Panen ulang RSS untuk desa yang dipilih. Server hanya menjalankan satu pekerjaan sekaligus.
          </p>
        </div>
      </div>

      {/* Informasi status pekerjaan sedang berjalan dengan marker berputar dan tombol batal */}
      {sedangBerjalan && penyegaran && (
        <div className="mt-4 rounded-xl border border-caution/30 bg-caution/10 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {/* Animasi radar / marker live berputar */}
              <div className="relative flex size-9 shrink-0 items-center justify-center">
                <span className="absolute inline-flex size-full rounded-full bg-caution/30 animate-ping opacity-75" />
                <span className="relative flex size-8 items-center justify-center rounded-full bg-caution/20 text-caution">
                  <RotateCcw className="size-4 animate-spin text-ink" />
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-title-sm font-semibold text-ink">
                    Penyegaran Berita Sedang Berjalan
                  </span>
                  <span className="rounded-full bg-caution/25 px-2.5 py-0.5 text-micro font-medium text-ink">
                    {labelKemajuan(penyegaran.selesai, penyegaran.total)}
                  </span>
                </div>
                <p className="mt-0.5 text-micro text-muted">
                  Server sedang memanen feed RSS di latar belakang. Anda dapat membatalkan pekerjaan ini kapan saja.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={sedangBatal}
              onClick={() => batalkan()}
              className={`inline-flex h-9 shrink-0 items-center justify-center rounded-xl bg-critical/10 px-4 text-button-md font-medium text-critical hover:bg-critical/20 disabled:opacity-50 transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              {sedangBatal ? "Membatalkan…" : "Batalkan Program"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-4">
        <PemilihDesa
          terpilih={terpilih}
          onTambah={(desa) => setTerpilih((d) => tambahDesa(d, desa))}
          onHapus={(iddesa) => setTerpilih((d) => hapusDesa(d, iddesa))}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={terpilih.length === 0 || sedangKirim || sedangBerjalan}
          aria-busy={sedangKirim || undefined}
          onClick={() => segarkan(terpilih.map((d) => d.iddesa))}
          className={`inline-flex h-10 items-center rounded-xl bg-primary px-5 text-button-md text-white shadow-xs hover:bg-primary-active disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer ${FOCUS_RING}`}
        >
          {sedangKirim ? "Menyegarkan…" : "Segarkan berita"}
        </button>

        {terpilih.length > 0 && !sedangKirim && (
          <button
            type="button"
            onClick={() => setTerpilih([])}
            className={`inline-flex h-10 items-center rounded-xl px-4 text-button-md text-muted hover:text-ink hover:bg-surface transition-colors cursor-pointer ${FOCUS_RING}`}
          >
            Batal pilihan ({terpilih.length})
          </button>
        )}

        {hasil && !sedangKirim && (
          <p className="text-micro text-positive font-medium">
            Pekerjaan dimulai untuk {hasil.n_desa} desa.
          </p>
        )}
      </div>

      {galat &&
        (galat.status === 409 ? (
          <div role="alert" className="mt-4 rounded-xl border border-caution/40 bg-caution/10 p-3">
            <p className="flex items-center gap-2 text-micro font-medium text-ink">
              <span className="size-2 shrink-0 rounded-full bg-caution" aria-hidden="true" />
              Pekerjaan penyegaran lain masih berjalan. Silakan tunggu hingga selesai atau batalkan pekerjaan tersebut.
            </p>
          </div>
        ) : (
          <div role="alert" className="mt-4 rounded-xl border border-critical/30 bg-critical/10 p-3.5">
            <p className="flex items-center gap-2 text-title-sm font-semibold text-critical">
              <span className="size-2 shrink-0 rounded-full bg-critical" aria-hidden="true" />
              {pesanGalat(galat).judul}
            </p>
            <p className="mt-1 text-micro text-ink">{pesanGalat(galat).pesan}</p>
            <p className="mt-1 text-micro text-muted font-mono">{galat.kode}</p>
          </div>
        ))}
    </section>
  );
}

/** `id` tombol "Hapus" satu baris — dipakai baris sendiri untuk memasang
 * `id` dan induk (`KartuHapusBeritaNyasar`) untuk mengarahkan fokus ke baris
 * TETANGGA setelah satu baris terhapus. */
const idTombolHapus = (id: number) => `tab-berita-hapus-${id}`;

type BarisTabelBeritaProps = {
  item: ItemBerita;
  iddesa: string;
  idKonfirmasi: number | null;
  onKonfirmasi: (id: number | null) => void;
  idSedangHapus: number | undefined;
  galat: GalatApi | null;
  hapus: ReturnType<typeof useHapusBerita>["hapus"];
  onSetelahHapus: (id: number) => void;
};

function BarisTabelBerita({
  item,
  iddesa,
  idKonfirmasi,
  onKonfirmasi,
  idSedangHapus,
  galat,
  hapus,
  onSetelahHapus,
}: BarisTabelBeritaProps) {
  const sedangDihapus = idSedangHapus === item.id;
  const sedangKonfirmasi = idKonfirmasi === item.id;
  const tautan = urlAman(item.url);

  const batalRef = useRef<HTMLButtonElement>(null);
  const hapusRef = useRef<HTMLButtonElement>(null);
  const konfirmasiSebelumnyaRef = useRef(sedangKonfirmasi);
  useEffect(() => {
    if (sedangKonfirmasi) {
      batalRef.current?.focus();
    } else if (konfirmasiSebelumnyaRef.current) {
      hapusRef.current?.focus();
    }
    konfirmasiSebelumnyaRef.current = sedangKonfirmasi;
  }, [sedangKonfirmasi]);

  return (
    <tr
      aria-busy={sedangDihapus}
      className="hover:bg-surface/30 transition-colors"
    >
      <td className="py-3 px-4 align-top">
        {tautan ? (
          <a
            href={tautan}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-baseline gap-1 text-body-md font-medium text-ink hover:text-primary transition-colors"
          >
            <span>{item.judul}</span>
            <ExternalLink className="size-3 shrink-0 text-muted group-hover:text-primary" />
          </a>
        ) : (
          <span className="text-body-md font-medium text-ink">{item.judul}</span>
        )}

        {galat && (
          <p role="alert" className="mt-1 flex items-center gap-1.5 text-micro text-critical">
            <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            {pesanGalat(galat).pesan}
            <span className="text-micro text-muted font-mono">{galat.kode}</span>
          </p>
        )}
      </td>

      <td className="py-3 px-4 align-top text-micro text-body">
        {item.sumber}
      </td>

      <td className="py-3 px-4 align-top text-micro text-muted whitespace-nowrap">
        {item.terbit_pada ? formatTanggal(item.terbit_pada) : `Panen: ${formatTanggal(item.dipanen_pada)}`}
      </td>

      <td className="py-3 px-4 align-top text-right whitespace-nowrap">
        {sedangKonfirmasi ? (
          <div
            role="group"
            aria-live="polite"
            aria-label={`Konfirmasi hapus ${item.judul}`}
            className="inline-flex items-center gap-1.5 justify-end"
          >
            <button
              ref={batalRef}
              type="button"
              disabled={sedangDihapus}
              onClick={() => onKonfirmasi(null)}
              className={`inline-flex h-8 items-center rounded-lg bg-surface px-2.5 text-micro font-medium text-ink hover:bg-surface/80 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`}
            >
              Batal
            </button>
            <button
              type="button"
              disabled={sedangDihapus}
              onClick={() =>
                hapus(
                  { id: item.id, iddesa },
                  {
                    onSuccess: () => {
                      onKonfirmasi(null);
                      onSetelahHapus(item.id);
                    },
                  },
                )
              }
              className={`inline-flex h-8 items-center rounded-lg bg-critical px-2.5 text-micro font-medium text-white shadow-xs hover:bg-critical/90 transition-colors cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`}
            >
              {sedangDihapus ? "Menghapus…" : "Ya, hapus"}
            </button>
          </div>
        ) : (
          <button
            ref={hapusRef}
            type="button"
            id={idTombolHapus(item.id)}
            onClick={() => onKonfirmasi(item.id)}
            className={`inline-flex h-8 items-center rounded-lg px-2.5 text-micro font-medium text-critical hover:bg-critical/10 transition-colors cursor-pointer ${FOCUS_RING}`}
          >
            Hapus
          </button>
        )}
      </td>
    </tr>
  );
}

function ItemKartuDesaBerita({
  iddesa,
  dipanenPada,
  onPilih,
}: {
  iddesa: string;
  dipanenPada?: string;
  onPilih: (desa: { iddesa: string; nmdesa: string }) => void;
}) {
  const kartu = useKartu(iddesa);
  const identitas = kartu.data?.identitas as
    | { nama?: string; kecamatan?: string; kabupaten?: string }
    | undefined;
  const nmdesa = identitas?.nama ?? `Desa ${iddesa}`;
  const lokasi =
    identitas?.kecamatan && identitas?.kabupaten
      ? `Kec. ${identitas.kecamatan} • Kab. ${identitas.kabupaten}`
      : `ID: ${iddesa}`;

  return (
    <button
      type="button"
      onClick={() => onPilih({ iddesa, nmdesa })}
      className={`group flex flex-col justify-between rounded-xl border border-hairline/80 bg-float p-3.5 text-left transition-all hover:border-line-strong hover:bg-surface/50 cursor-pointer ${FOCUS_RING}`}
    >
      <div className="w-full">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-micro text-muted">{iddesa}</span>
          {dipanenPada && (
            <span className="text-micro text-muted">
              {formatTanggal(dipanenPada)}
            </span>
          )}
        </div>
        <p className="mt-1 text-title-sm font-semibold text-ink group-hover:text-primary transition-colors">
          {nmdesa}
        </p>
        <p className="text-micro text-muted line-clamp-1">{lokasi}</p>
      </div>
      <div className="mt-3 flex items-center gap-1 text-micro font-medium text-primary">
        <span>Buka rincian berita</span>
        <span aria-hidden="true">→</span>
      </div>
    </button>
  );
}

function KartuHapusBeritaNyasar() {
  const [desa, setDesa] = useState<{ iddesa: string; nmdesa: string } | null>(null);
  const [idKonfirmasi, setIdKonfirmasi] = useState<number | null>(null);
  const judulRef = useRef<HTMLHeadingElement>(null);

  const status = useStatusAdmin();
  const penyegaranTerakhir = status.data?.penyegaran_terakhir ?? [];
  const hasilTerbaru = status.data?.penyegaran?.hasil ?? [];

  // Himpun daftar unik desa yang sudah dipanen berita
  const mapDesa = new Map<string, { iddesa: string; dipanenPada?: string }>();
  for (const p of penyegaranTerakhir) {
    mapDesa.set(p.iddesa, { iddesa: p.iddesa, dipanenPada: p.dipanen_pada });
  }
  for (const h of hasilTerbaru) {
    if (!mapDesa.has(h.iddesa)) {
      mapDesa.set(h.iddesa, { iddesa: h.iddesa });
    }
  }
  const daftarDesaPanen = Array.from(mapDesa.values());

  const { data, isPending, isPaused, isError, error, refetch } = useBerita(desa?.iddesa);
  const { hapus, idSedangHapus, galatPerId, resetGalat } = useHapusBerita();
  const kosong = data?.daftar.length === 0;
  const keadaan = pilihKeadaan({ isPending, isPaused, isError, kosong });

  // Kosongkan galat baris tersimpan begitu desa terpilih berganti
  const [iddesaSebelumnya, setIddesaSebelumnya] = useState(desa?.iddesa);
  if (desa?.iddesa !== iddesaSebelumnya) {
    setIddesaSebelumnya(desa?.iddesa);
    resetGalat();
  }

  function fokusSetelahHapus(idDihapus: number) {
    const daftar = data?.daftar ?? [];
    const indeks = daftar.findIndex((it) => it.id === idDihapus);
    const tetangga = daftar[indeks + 1] ?? daftar[indeks - 1];
    if (tetangga) {
      document.getElementById(idTombolHapus(tetangga.id))?.focus();
    } else {
      judulRef.current?.focus();
    }
  }

  return (
    <section className="rounded-2xl border border-hairline bg-surface/30 p-5 md:p-6">
      <h3 ref={judulRef} tabIndex={-1} className="text-title-sm font-semibold text-ink outline-none">
        2. Hapus Berita Nyasar
      </h3>
      <p className="mt-0.5 text-body-md text-body">
        Berita dipanen dari nama desa, sehingga desa senama bisa kebagian berita yang keliru dikaitkan.
        Pilih desa dari daftar yang sudah dipanen di bawah untuk melihat rincian beritanya, atau cari desa lain.
      </p>

      {/* Jika belum ada desa yang dipilih, tampilkan pencarian + daftar desa yang sudah ada */}
      {desa === null ? (
        <div className="mt-5 space-y-4">
          <CariDesaAdmin
            label="Cari desa lain"
            placeholder="Ketik nama desa jika tidak tercantum di daftar bawah…"
            onPilih={(hasil) => {
              setDesa({ iddesa: hasil.iddesa, nmdesa: hasil.nmdesa });
              setIdKonfirmasi(null);
            }}
          />

          <div>
            <h4 className="text-micro font-semibold uppercase tracking-wider text-muted mb-2.5">
              Daftar Desa yang Sudah Dipanen Berita ({daftarDesaPanen.length})
            </h4>

            {daftarDesaPanen.length === 0 ? (
              <div className="rounded-xl border border-hairline bg-surface p-4 text-center">
                <p className="text-micro text-muted">
                  Belum ada riwayat desa yang dipanen berita. Silakan segarkan berita pada seksi di atas atau gunakan pencarian untuk memilih desa.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {daftarDesaPanen.map((item) => (
                  <ItemKartuDesaBerita
                    key={item.iddesa}
                    iddesa={item.iddesa}
                    dipanenPada={item.dipanenPada}
                    onPilih={(d) => {
                      setDesa(d);
                      setIdKonfirmasi(null);
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Jika desa sudah dipilih: Tampilkan header desa terpilih, tombol kembali, dan tabel sederhana rincian berita */
        <div className="mt-5 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-hairline/80 bg-float p-4">
            <div>
              <span className="text-micro font-semibold uppercase tracking-wider text-muted">
                Rincian Berita Desa
              </span>
              <h4 className="text-title-sm font-semibold text-ink">
                {desa.nmdesa}{" "}
                <span className="font-mono text-micro font-normal text-muted">
                  ({desa.iddesa})
                </span>
              </h4>
            </div>
            <button
              type="button"
              onClick={() => {
                setDesa(null);
                setIdKonfirmasi(null);
              }}
              className={`inline-flex h-9 items-center justify-center rounded-xl bg-surface px-4 text-micro font-medium text-ink hover:bg-surface/80 transition-colors cursor-pointer ${FOCUS_RING}`}
            >
              ← Kembali ke Daftar Desa
            </button>
          </div>

          {keadaan === "muat" && (
            <div className="mt-4">
              <KerangkaMuat tinggi="h-16" baris={3} />
            </div>
          )}

          {keadaan === "tertunda" && (
            <div className="mt-4 rounded-xl border border-hairline bg-surface p-5 text-center">
              <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar berita belum bisa dimuat." />
              <button
                type="button"
                onClick={() => refetch()}
                className={`mt-3 inline-flex h-10 items-center rounded-xl bg-surface px-4 text-button-md text-ink border border-line/60 hover:bg-float transition-colors cursor-pointer ${FOCUS_RING}`}
              >
                Coba lagi
              </button>
            </div>
          )}

          {keadaan === "galat" && error && (
            <div className="mt-4">
              <BlokGalat galat={error} onCobaLagi={() => refetch()} penempatan="inline" />
            </div>
          )}

          {keadaan === "kosong" && (
            <div className="rounded-xl border border-hairline bg-surface p-6 text-center">
              <p className="text-micro text-muted">
                Belum ada berita tersimpan untuk {desa.nmdesa}.
              </p>
            </div>
          )}

          {keadaan === "isi" && data && (
            <div className="overflow-hidden rounded-xl border border-hairline bg-surface">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-body-md">
                  <thead>
                    <tr className="border-b border-hairline bg-surface/40 text-micro font-semibold uppercase tracking-wider text-muted">
                      <th scope="col" className="py-3 px-4">Judul Berita</th>
                      <th scope="col" className="py-3 px-4 w-40">Sumber</th>
                      <th scope="col" className="py-3 px-4 w-36">Tanggal</th>
                      <th scope="col" className="py-3 px-4 w-40 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {data.daftar.map((item) => (
                      <BarisTabelBerita
                        key={item.id}
                        item={item}
                        iddesa={desa.iddesa}
                        idKonfirmasi={idKonfirmasi}
                        onKonfirmasi={setIdKonfirmasi}
                        idSedangHapus={idSedangHapus}
                        galat={galatPerId[String(item.id)] ?? null}
                        hapus={hapus}
                        onSetelahHapus={fokusSetelahHapus}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              {catatanTerpotong(data.total, data.daftar.length) && (
                <div className="border-t border-hairline p-3 text-micro text-muted">
                  {catatanTerpotong(data.total, data.daftar.length)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function TabBerita() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-title-md font-semibold text-ink">Kurasi & Penyegaran Berita</h2>
        <p className="mt-0.5 text-body-md text-body">
          Kelola pemanenan feed RSS berita per desa dan bersihkan berita yang keliru dikaitkan.
        </p>
      </div>

      <KartuSegarkanBerita />
      <KartuHapusBeritaNyasar />
    </div>
  );
}

