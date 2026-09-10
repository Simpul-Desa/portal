"use client";

/**
 * Tab Berita Halaman Admin: dua kartu independen. Kartu Segarkan memicu
 * pekerjaan panen RSS di `api/` untuk desa yang dipilih; kartu Hapus berita
 * nyasar membiarkan admin membuang satu per satu berita yang salah tempel ke
 * desa (akibat panen berbasis nama, bukan `iddesa` — lihat komentar kartu
 * itu sendiri).
 */

import { useEffect, useRef, useState } from "react";

import type { GalatApi } from "@/lib/api/client";
import { pesanGalat } from "@/lib/api/galat-ui";
import { useBerita, type ItemBerita } from "@/features/berita/hooks/queries";
import { labelMeta, catatanTerpotong } from "@/features/berita/services/berita";
import { BlokGalat, KeadaanKosong, KerangkaMuat } from "@/shared/components/blok-keadaan";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { StatusChip } from "@/shared/components/status-chip";

import { CariDesaAdmin } from "./cari-desa-admin";
import { PemilihDesa } from "./pemilih-desa";
import { useStatusAdmin } from "../hooks/queries";
import { useHapusBerita, useSegarkanBerita } from "../hooks/use-aksi-admin";
import { hapusDesa, labelKemajuan, tambahDesa, type DesaTerpilih } from "../services/segarkan";

function KartuSegarkanBerita() {
  const [terpilih, setTerpilih] = useState<readonly DesaTerpilih[]>([]);
  const { segarkan, sedangKirim, hasil, galat } = useSegarkanBerita();
  const status = useStatusAdmin();
  const penyegaran = status.data?.penyegaran;
  const sedangBerjalan = penyegaran?.keadaan === "berjalan";

  return (
    <section className="rounded-card bg-surface p-5">
      <h2 className="text-title-md text-ink">Segarkan Berita Desa</h2>
      <p className="mt-1 text-body-md text-body">
        Panen ulang RSS untuk desa yang dipilih. Server hanya menjalankan satu pekerjaan sekaligus.
      </p>

      <div className="mt-4">
        <PemilihDesa
          terpilih={terpilih}
          onTambah={(desa) => setTerpilih((d) => tambahDesa(d, desa))}
          onHapus={(iddesa) => setTerpilih((d) => hapusDesa(d, iddesa))}
        />
      </div>

      <button
        type="button"
        disabled={terpilih.length === 0 || sedangKirim}
        aria-busy={sedangKirim || undefined}
        onClick={() => segarkan(terpilih.map((d) => d.iddesa))}
        className={`mt-4 flex h-10 items-center rounded-full bg-primary px-[18px] text-button-md text-ink disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`}
      >
        {sedangKirim ? "Menyegarkan…" : "Segarkan berita"}
      </button>

      {/* Chip + kemajuan pekerjaan berjalan dirender TANPA SYARAT galat (Task
          6) — sebelumnya cuma tampil di cabang 409, jadi pekerjaan yang
          sudah berjalan SEBELUM kartu ini dipasang (mis. admin lain memulai
          lebih dulu) tidak pernah terlihat sampai admin ini mengklik Segarkan
          dan menabrak 409. */}
      {sedangBerjalan && penyegaran && (
        <div className="mt-3 flex items-center gap-2">
          <StatusChip status="caution">berjalan</StatusChip>
          <p className="text-body-md text-body">{labelKemajuan(penyegaran.selesai, penyegaran.total)}</p>
        </div>
      )}

      {hasil && !sedangKirim && (
        <p className="mt-3 text-body-md text-body">
          Pekerjaan dimulai untuk {hasil.n_desa} desa. Kemajuannya ada di tab Status.
        </p>
      )}

      {galat &&
        (galat.status === 409 ? (
          // Baris kemajuan sudah tampil TANPA SYARAT di atas — di sini cukup
          // bilang KENAPA permintaan ini sendiri ditolak, tanpa mengulang
          // kemajuannya lagi.
          <div role="alert" className="mt-3">
            <p className="flex items-center gap-1.5 text-body-md text-ink">
              <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
              Pekerjaan penyegaran lain masih berjalan.
            </p>
          </div>
        ) : (
          // TANPA tombol "Coba lagi": tombol Segarkan sendiri sudah jadi jalan
          // mencoba ulang, dan dua kontrol untuk satu aksi adalah kelebihan.
          <div role="alert" className="mt-3">
            <p className="flex items-center gap-1.5 text-title-sm text-ink">
              <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
              {pesanGalat(galat).judul}
            </p>
            <p className="mt-1 text-body-md text-body">{pesanGalat(galat).pesan}</p>
            <p className="mt-1 text-micro text-muted">{galat.kode}</p>
          </div>
        ))}
    </section>
  );
}

/** `id` tombol "Hapus" satu baris — dipakai baris sendiri untuk memasang
 * `id` dan induk (`KartuHapusBeritaNyasar`) untuk mengarahkan fokus ke baris
 * TETANGGA setelah satu baris terhapus (Task 9b). */
const idTombolHapus = (id: number) => `tab-berita-hapus-${id}`;

type BarisHapusBeritaProps = {
  item: ItemBerita;
  iddesa: string;
  idKonfirmasi: number | null;
  onKonfirmasi: (id: number | null) => void;
  idSedangHapus: number | undefined;
  /** Galat hapus MILIK BARIS INI, atau `null` — sudah diresolusi induk dari
   * `galatPerId` (Task 1). */
  galat: GalatApi | null;
  hapus: ReturnType<typeof useHapusBerita>["hapus"];
  /** Dipanggil SETELAH hapus berhasil, dengan `id` baris yang baru terhapus —
   * induk memakainya menghitung baris tetangga mana yang harus menerima
   * fokus (Task 9b), karena hanya induk yang memegang daftar penuh. */
  onSetelahHapus: (id: number) => void;
};

/** Tombol geometri `button-secondary` (`bg-float`, TANPA bayangan) dipakai
 * berulang di baris ini — konstanta lokal supaya ketiga tombol tetap sama
 * persis tanpa menyalin string panjang tiga kali. */
const KELAS_TOMBOL_BARIS = `flex h-10 items-center rounded-full bg-float px-[18px] text-button-md text-ink disabled:opacity-40 disabled:pointer-events-none ${FOCUS_RING}`;

function BarisHapusBerita({
  item,
  iddesa,
  idKonfirmasi,
  onKonfirmasi,
  idSedangHapus,
  galat,
  hapus,
  onSetelahHapus,
}: BarisHapusBeritaProps) {
  const sedangDihapus = idSedangHapus === item.id;
  const sedangKonfirmasi = idKonfirmasi === item.id;

  // Penyerahan fokus (Task 9b): masuk mode konfirmasi memindah fokus ke
  // "Batal" (opsi aman); membatalkan mengembalikannya ke "Hapus" baris ini
  // sendiri. Cuma `.focus()` DOM dan mutasi ref di sini, TANPA `setState` —
  // linter proyek ini menolak `react-hooks/set-state-in-effect`, tapi aturan
  // itu soal state React, bukan efek DOM imperatif seperti fokus.
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
    <div
      aria-busy={sedangDihapus}
      className="flex flex-col gap-2 py-3 md:flex-row md:items-start md:justify-between"
    >
      <div>
        <p className="text-title-sm text-ink">{item.judul}</p>
        <p className="text-micro text-muted">{labelMeta(item)}</p>

        {galat && (
          <p role="alert" className="mt-1 flex items-center gap-1.5 text-micro text-ink">
            <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            {pesanGalat(galat).pesan}
            <span className="text-micro text-muted">{galat.kode}</span>
          </p>
        )}
      </div>

      {sedangKonfirmasi ? (
        <div
          role="group"
          aria-live="polite"
          aria-label={`Konfirmasi hapus ${item.judul}`}
          className="flex gap-2"
        >
          <button
            ref={batalRef}
            type="button"
            disabled={sedangDihapus}
            onClick={() => onKonfirmasi(null)}
            className={KELAS_TOMBOL_BARIS}
          >
            Batal
          </button>
          <button
            type="button"
            disabled={sedangDihapus}
            // Callback `onSuccess` lokal ke `mutate` (bukan `useEffect`) yang
            // mengembalikan `idKonfirmasi` ke `null` — linter proyek ini
            // menolak `set-state-in-effect`, dan ini opsi paling sederhana:
            // TanStack Query menjalankannya sekali persis saat permintaan INI
            // berhasil, tanpa perlu menurunkan status dari daftar berita.
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
            className={KELAS_TOMBOL_BARIS}
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
          className={KELAS_TOMBOL_BARIS}
        >
          Hapus
        </button>
      )}
    </div>
  );
}

function KartuHapusBeritaNyasar() {
  const [desa, setDesa] = useState<{ iddesa: string; nmdesa: string } | null>(null);
  // SATU nilai untuk seluruh daftar, BUKAN boolean per baris: membuka
  // konfirmasi di satu baris harus menutup konfirmasi baris lain yang masih
  // terbuka, supaya admin tidak pernah menghapus baris yang salah karena dua
  // konfirmasi tampil bersamaan.
  const [idKonfirmasi, setIdKonfirmasi] = useState<number | null>(null);
  const judulRef = useRef<HTMLHeadingElement>(null);

  // Dipanggil TANPA SYARAT (Rules of Hooks) — `useBerita` sendiri sudah
  // digerbangi `enabled: Boolean(iddesa)`, jadi aman dipanggil sebelum desa
  // dipilih.
  const { data, isPending, isPaused, isError, error, refetch } = useBerita(desa?.iddesa);
  const { hapus, idSedangHapus, galatPerId, resetGalat } = useHapusBerita();
  const kosong = data?.daftar.length === 0;
  const keadaan = pilihKeadaan({ isPending, isPaused, isError, kosong });

  // Kosongkan galat baris tersimpan begitu desa terpilih berganti (R17) —
  // galat baris berita desa lama tidak boleh menempel ke desa baru.
  const [iddesaSebelumnya, setIddesaSebelumnya] = useState(desa?.iddesa);
  if (desa?.iddesa !== iddesaSebelumnya) {
    setIddesaSebelumnya(desa?.iddesa);
    resetGalat();
  }

  /** Fokus baris TETANGGA setelah satu baris terhapus, atau judul kartu bila
   * daftar jadi kosong (Task 9b) — dihitung dari `data` SEBELUM refetch
   * invalidasi selesai (baris yang baru dihapus masih ada di closure ini,
   * jadi tetangganya masih bisa dicari). */
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
    <section className="rounded-card bg-surface p-5">
      <h2 ref={judulRef} tabIndex={-1} className="text-title-md text-ink outline-none">
        Hapus berita nyasar
      </h2>
      <p className="mt-1 text-body-md text-body">
        Berita dipanen dari nama desa, jadi desa senama bisa kebagian berita yang bukan miliknya.
        Pilih desanya, lalu buang beritanya satu per satu.
      </p>

      <div className="mt-4">
        <CariDesaAdmin
          label="Cari desa"
          placeholder="Ketik nama desa…"
          onPilih={(hasil) => {
            setDesa({ iddesa: hasil.iddesa, nmdesa: hasil.nmdesa });
            setIdKonfirmasi(null);
          }}
        />
      </div>

      {desa && <p className="mt-3 text-label text-muted">Berita {desa.nmdesa}</p>}

      {desa === null && (
        <p className="mt-4 text-body-md text-muted">Pilih desa dulu untuk melihat beritanya.</p>
      )}

      {desa && keadaan === "muat" && (
        <div className="mt-4">
          <KerangkaMuat tinggi="h-16" baris={2} />
        </div>
      )}

      {desa && keadaan === "tertunda" && (
        <div className="mt-4">
          <KeadaanKosong kalimat="Sambungan sedang terputus, jadi daftar berita belum bisa dimuat." />
          <button
            type="button"
            onClick={() => refetch()}
            className={`mt-3 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink shadow-float ${FOCUS_RING}`}
          >
            Coba lagi
          </button>
        </div>
      )}

      {desa && keadaan === "galat" && error && (
        <div className="mt-4">
          <BlokGalat galat={error} onCobaLagi={() => refetch()} penempatan="inline" />
        </div>
      )}

      {desa && keadaan === "kosong" && (
        <p className="mt-4 text-body-md text-muted">Belum ada berita untuk desa ini.</p>
      )}

      {desa && keadaan === "isi" && data && (
        <>
          <div className="mt-4 divide-y divide-hairline">
            {data.daftar.map((item) => (
              <BarisHapusBerita
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
          </div>
          {catatanTerpotong(data.total, data.daftar.length) && (
            <p className="mt-2 text-micro text-muted">
              {catatanTerpotong(data.total, data.daftar.length)}
            </p>
          )}
        </>
      )}
    </section>
  );
}

export function TabBerita() {
  return (
    <div className="flex flex-col gap-2">
      <KartuSegarkanBerita />
      <KartuHapusBeritaNyasar />
    </div>
  );
}
