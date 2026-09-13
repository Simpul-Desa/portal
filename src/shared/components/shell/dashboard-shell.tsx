"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

import type * as maplibregl from "maplibre-gl";
import { usePathname, useSearchParams } from "next/navigation";

import { bisa, KEMAMPUAN_LENSA, type Kemampuan } from "@/core/akses";
import { useSesi } from "@/core/sesi";
import { PanelAsisten } from "@/features/asisten/components/panel-asisten";
import { useAsisten } from "@/features/asisten/hooks/use-asisten";
import { DialogTerkunci } from "@/features/auth/components/dialog-terkunci";
import { LegendaCitraMap } from "@/features/citra-potensi/components/legenda-citra-map";
import { CitraPotensiPanel } from "@/features/citra-potensi/components/panel";
import { useCitraData, useCitraLayers } from "@/features/citra-potensi/hooks/use-map-layers";
import { DesaKembarPanel } from "@/features/desa-kembar/components/panel";
import { useKembarLayers } from "@/features/desa-kembar/hooks/use-map-layers";
import { JalurEkonomiPanel } from "@/features/jalur-ekonomi/components/panel";
import { KartuDesaJalurMap } from "@/features/jalur-ekonomi/components/kartu-desa-jalur-map";
import { useJalurLayers } from "@/features/jalur-ekonomi/hooks/use-map-layers";
import { EmptyState } from "@/features/kartu/components/empty-state";
import { KartuPanel } from "@/features/kartu/components/kartu-panel";
import { SearchBox } from "@/features/kartu/components/search-box";
import { PetaPeranPanel } from "@/features/peta-peran/components/panel";
import { usePetaPeranData, usePetaPeranLayers } from "@/features/peta-peran/hooks/use-map-layers";
import { VARIAN_DEFAULT, type Lensa } from "@/lib/url-state";
import { useGangguanServer } from "@/shared/hooks/use-gangguan-server";
import { useMapBase } from "@/shared/hooks/use-map-base";
import { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

import { LeftPanel } from "./left-panel";
import { MapStage } from "./map-stage";
import { NavbarLokasi } from "./navbar-lokasi";
import { PANEL_DEFAULT, PANEL_MAX } from "./panel-constants";
import { LENSA_ITEMS, SideRail } from "./side-rail";

type DialogState = { kemampuan: Kemampuan; nama: string };
type WilayahState = ReturnType<typeof useWilayahParams>;

/** Satu peta lensa → panel (Task 15, dilengkapi fase 5 Task 24). Tiap entri
 * menerima `wilayah` UTUH supaya tanda tangannya seragam
 * (`Record<Lensa, ...>`); lensa Kartu satu-satunya yang memakainya di titik
 * ini (memilih `KartuPanel`/`EmptyState` lewat `desa`), sisanya meneruskannya
 * ke orkestrator masing-masing. Dibaca lewat `lensaEfektif`, BUKAN
 * `wilayah.lensa` mentah, di `DashboardShell` di bawah. Kelimanya kini
 * berisi — tidak ada lagi lensa stub. */
const PANEL_LENSA: Record<Lensa, (wilayah: WilayahState) => ReactNode> = {
  kartu: (wilayah) =>
    wilayah.desa ? <KartuPanel wilayah={wilayah} /> : <EmptyState wilayah={wilayah} />,
  "peta-peran": (wilayah) => <PetaPeranPanel wilayah={wilayah} />,
  "jalur-ekonomi": (wilayah) => <JalurEkonomiPanel wilayah={wilayah} />,
  "desa-kembar": (wilayah) => <DesaKembarPanel wilayah={wilayah} />,
  "citra-potensi": (wilayah) => <CitraPotensiPanel wilayah={wilayah} />,
};

/**
 * Shell klien dasbor: rail + panel kiri (resizable/lipat) + peta + panel
 * kanan Asisten Desa, dalam satu baris `flex h-dvh` ber-gutter `canvas`.
 * Riwayat percakapan Asisten (`useAsisten`) dipanggil TANPA SYARAT di sini
 * (bukan di dalam `PanelAsisten`, Task 24) — preseden persis `panelWidth` di
 * bawah: state yang mati bersama komponennya membuat "tutup lalu buka" jadi
 * penghapus data yang tidak diminta siapa pun. `PanelAsisten` sendiri dirender
 * sebagai anak KETIGA kotak flex tengah, sesudah `MapStage`, hanya saat
 * `asistenTerbuka` DAN `bisa(peran, "asisten")` (gerbang ganda, lihat komentar
 * di titik render). Satu-satunya konsumen `useWilayahParams` di pohon ini — rail,
 * peta, dan konten panel presentational, menerima state+setter lewat props
 * (`wilayah` diteruskan utuh ke `KartuPanel`/`EmptyState`/`useMapBase`
 * supaya penambahan field baru di hook itu tidak perlu mengubah tanda
 * tangan tiap penerima). Lebar panel (`panelWidth`) diangkat ke sini (bukan
 * state lokal `LeftPanel`) supaya tidak hilang saat panel dilipat lalu
 * dibuka lagi.
 *
 * Saklar lensa (Task 15): `PANEL_LENSA` memetakan tiap `Lensa` ke fungsi
 * render panelnya. `lensaEfektif` — BUKAN `wilayah.lensa` mentah — adalah
 * satu nilai yang dibaca SEMUA konsumen (panel, hook layer, `aria-current`
 * rail) supaya panel dan peta tidak pernah menampilkan lensa berbeda:
 * `wilayah.lensa` bila `bisa(peran, KEMAMPUAN_LENSA[wilayah.lensa])`,
 * kalau tidak `"kartu"` (fallback fase 2, lihat gerbang peran di bawah —
 * berlaku juga saat `memuat` masih true, karena `peran` bawaan `"anonim"`
 * membuat `bisa()` menjawab `false` untuk lensa mana pun kecuali `kartu`,
 * jadi tidak ada kedipan panel terkunci sebelum peran tiba). Sejak fase 5
 * kelima lensa berisi; tidak ada lagi panel stub.
 *
 * `map`/`styleVersion` state di sini (bukan di hook layer) supaya
 * kontraknya persis `MapStage`: `onMapReady` dipanggil SEKALI (`setMap`),
 * `onStyleLoad` tiap kali style berganti (`styleVersion` naik) — `useMapBase`
 * dan hook layer lensa (`usePetaPeranLayers`, `useJalurLayers`) membaca
 * dua-duanya untuk memasang ulang source/layer setelah fallback OSM.
 *
 * Task 20 dipecah dua (lihat docstring `features/peta-peran/hooks/use-map-
 * layers.ts`): `usePetaPeranData` — QUERY + `useMemo` saja, nol efek peta —
 * dipanggil SEBELUM `useMapBase` dan hasilnya (`fiturDesa`/`warnaFill`)
 * diteruskan sebagai opsi `useMapBase`, supaya choropleth zona ikut
 * ter-render lewat layer `desa-fill` milik base alih-alih layer terpisah.
 * `usePetaPeranLayers` — hanya EFEK (mount/bongkar garis putus Belum
 * Terpetakan) — dipanggil SETELAH `useMapBase`, menerima `fiturDesa` yang
 * sama dari `usePetaPeranData` supaya kedua separuh tetap sinkron tanpa
 * memanggil query dua kali dari titik ini.
 *
 * KETUJUH hook peta (`usePetaPeranData`, `useCitraData`, `useMapBase`,
 * `usePetaPeranLayers`, `useCitraLayers`, `useJalurLayers`, `useKembarLayers`)
 * dipanggil TANPA SYARAT setiap render (Rules of Hooks) —
 * `aktif: lensaEfektif === "…"` yang mengontrol isi efeknya (dan `enabled`
 * query di baliknya), bukan pemanggilannya — dan urutannya TETAP (Task 10
 * GOTCHA 2, Task 15 GOTCHA 2, Task 20 defect resolution, fase 5 Task 24):
 * kedua hook DATA lebih dulu (query saja, tidak menyentuh layer sehingga
 * posisi panggilnya tidak mempengaruhi tumpukan), lalu `useMapBase`, baru
 * seluruh hook EFEK. Urutan itu menentukan urutan pemasangan layer di peta,
 * supaya layer milik lensa (garis jalur, garis putus Belum Terpetakan,
 * sorotan Desa Kembar) berakhir DI ATAS `desa-fill` milik base.
 *
 * DUA LENSA MEMPEREBUTKAN SATU SEAM (fase 5 Task 24 GOTCHA 1). `useMapBase`
 * hanya punya satu pasang seam `fiturDesa`/`warnaFill`, dan sejak fase 5 ADA
 * DUA lensa yang menimpanya: Peta Peran (join zona) dan Citra Potensi Desa
 * (join skor). `??` berantai di bawah aman HANYA karena keduanya saling
 * eksklusif — masing-masing mengembalikan `null`/`undefined` kecuali
 * `lensaEfektif` menyebut namanya, jadi paling banyak satu yang non-null pada
 * satu waktu. Begitu ada lensa KETIGA yang ingin menimpa seam yang sama, pola
 * ini WAJIB diganti pemilih eksplisit menurut `lensaEfektif` (mis. sebuah
 * `Record<Lensa, …>` seperti `PANEL_LENSA`) — rantai `??` yang lebih panjang
 * akan diam-diam memilih yang pertama non-null, bukan yang aktif.
 *
 * Urutan render `LeftPanel` sebelum `MapStage` sengaja mengikuti urutan
 * visual desktop (panel kiri, peta kanan) supaya urutan DOM = urutan
 * tab/baca AT; `MapStage` sendiri yang membalik urutan visual lewat kelas
 * `order-first` di bawah breakpoint `md` (peta di atas, panel di bawah).
 *
 * Gerbang peran (rencana fase 2 Task 22): satu `DialogTerkunci` dirender di
 * sini. Dua sumber, satu tampilan: `dialog` (state) dari klik manual —
 * rail (`onKlikTerkunci`) dan tombol Asisten di peta — dan `dialogDeepLink`
 * (DITURUNKAN saat render, bukan `useState`+`useEffect`: menyetel state di
 * dalam efek memicu linter `react-hooks/set-state-in-effect` proyek ini,
 * dan pola turunan ini lebih sederhana lagi) dari `?lensa=` yang terkunci.
 * `dialogAktif = dialog ?? dialogDeepLink` — klik manual menang.
 *
 * "Dibuka sekali, tidak terbuka lagi setelah ditutup" (PRD §5.6) dijaga oleh
 * `dialogOtomatisPernahDitutup`: begitu ADA dialog yang ditutup (manual atau
 * deep-link — `tutupDialog` menyalakan keduanya sekaligus), gerbang
 * deep-link berhenti menawarkan dialog otomatis untuk sisa sesi ini; klik
 * manual baru tetap selalu bisa membuka dialog kapan pun lewat `dialog`.
 * Deep-link sendiri baru dievaluasi setelah `!memuat` (peran belum bawaan
 * anonim yang final belum boleh dikunci-tampilkan). Parameter URL TIDAK
 * PERNAH disentuh oleh gerbang ini — panel jatuh balik ke `lensaEfektif`
 * `"kartu"` (di atas) hanya saat lensa di URL terkunci untuk peran ini;
 * `?lensa=` sendiri tidak berubah, jadi begitu peran naik dialog hilang dan
 * lensa yang diminta langsung terbuka tanpa navigasi baru.
 *
 * Pemberitahuan gangguan (perbaikan galat diam terlaporkan 10 September
 * 2026, dua giliran): `BlokNotifikasi` dirender sebagai anak PERTAMA
 * `LeftPanel`, sebelum `PANEL_LENSA[lensaEfektif]`, supaya terlihat di
 * lensa mana pun yang sedang aktif. Dua sumber galat, SATU blok tampil:
 * `galatPeran` (`useSesi`, hanya berjalan saat ADA sesi — sesi bisa
 * berhasil sementara bacaan peran dari `api/` gagal, jaringan mati atau
 * 401/403/503, lihat docstring `core/sesi.tsx`) menang atas `gangguanServer`
 * (`useGangguanServer`, berjalan untuk SEMUA pengguna termasuk anonim lewat
 * `useRingkasan`/`usePusat`) bila keduanya ada — galat peran menjelaskan
 * konsekuensi yang lebih tajam (fitur terkunci). Tanpa `gangguanServer`,
 * pengunjung anonim dengan `api/` mati sebelumnya tidak mendapat satu
 * pemberitahuan pun.
 */
export function DashboardShell() {
  const wilayah = useWilayahParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { peran, adaSesi, memuat, galatPeran, cobaLagiPeran } = useSesi();

  const gangguanServer = useGangguanServer();

  useEffect(() => {
    if (galatPeran) {
      toast.error("Gagal membaca profil sesi", {
        id: "galat-peran",
        description: "Sesi ini aktif, tetapi perannya belum terbaca. Untuk sementara, akses mengikuti peran terendah (tamu).",
        action: {
          label: "Coba Lagi",
          onClick: () => cobaLagiPeran(),
        },
      });
    } else if (gangguanServer) {
      toast.error("Gangguan sambungan", {
        id: "gangguan-server",
        description: gangguanServer.galat?.message || "Gagal terhubung ke server. Beberapa data mungkin tidak tampil.",
        action: {
          label: "Coba Lagi",
          onClick: () => gangguanServer.cobaLagi(),
        },
      });
    }
  }, [galatPeran, cobaLagiPeran, gangguanServer]);

  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const [styleVersion, setStyleVersion] = useState(0);
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [dialogOtomatisPernahDitutup, setDialogOtomatisPernahDitutup] = useState(false);
  const [asistenTerbuka, setAsistenTerbuka] = useState(false);
  // `useAsisten` dipanggil TANPA SYARAT, di kelompok state, SEBELUM ketujuh
  // hook peta di bawah (Task 24 GOTCHA 1, CRITICAL) — hook ini tidak
  // menyentuh peta, tapi menaruhnya di sini menjamin urutan tumpukan hook
  // peta tidak bergeser sama sekali.
  const asisten = useAsisten();
  const asistenRef = useRef<HTMLButtonElement>(null);

  const kemampuanLensa = KEMAMPUAN_LENSA[wilayah.lensa];
  const lensaDiizinkan = bisa(peran, kemampuanLensa);
  const lensaEfektif: Lensa = lensaDiizinkan ? wilayah.lensa : "kartu";
  const bisaAsisten = bisa(peran, "asisten");

  // Riwayat Asisten hidup di `useState` DI DALAM `useAsisten` (Task 24
  // GOTCHA 3) — bukan cache query, jadi `queryClient.clear()` saat ganti akun
  // (`core/sesi.tsx:99`) tidak menyentuhnya. Dikosongkan di sini lewat pola
  // "menyesuaikan state saat render" (React: bandingkan dengan nilai
  // render sebelumnya yang disimpan `useState`, panggil setter kalau beda) —
  // BUKAN `useEffect`, karena menyetel state di dalam efek melanggar linter
  // `react-hooks/set-state-in-effect` proyek ini (lihat catatan gerbang peran
  // di bawah, yang memakai alasan sama untuk `dialogDeepLink`). Begitu
  // `bisaAsisten` berubah dari true ke false pada render yang sama,
  // `percakapanBaru()` langsung jalan SEBELUM commit — tidak ada render
  // ekstra yang terlihat pengguna.
  const [bisaAsistenSebelumnya, setBisaAsistenSebelumnya] = useState(bisaAsisten);
  if (bisaAsisten !== bisaAsistenSebelumnya) {
    setBisaAsistenSebelumnya(bisaAsisten);
    if (!bisaAsisten) asisten.percakapanBaru();
  }

  const [lensaSebelumnya, setLensaSebelumnya] = useState(lensaEfektif);
  if (lensaEfektif !== lensaSebelumnya) {
    setLensaSebelumnya(lensaEfektif);
    if (lensaEfektif === "citra-potensi") {
      setPanelWidth((prev) => Math.max(prev, PANEL_MAX));
    }
  }

  const petaPeranData = usePetaPeranData({ kab: wilayah.kab, aktif: lensaEfektif === "peta-peran" });
  const citraData = useCitraData({
    prov: wilayah.prov,
    kab: wilayah.kab,
    target: wilayah.target,
    aktif: lensaEfektif === "citra-potensi",
  });
  useMapBase({
    map,
    styleVersion,
    wilayah,
    fiturDesa: petaPeranData.fiturDesa ?? citraData.fiturDesa,
    warnaFill: petaPeranData.warnaFill ?? citraData.warnaFill,
  });
  usePetaPeranLayers({
    map,
    styleVersion,
    aktif: lensaEfektif === "peta-peran",
    fiturDesa: petaPeranData.fiturDesa,
  });
  useCitraLayers({
    map,
    styleVersion,
    aktif: lensaEfektif === "citra-potensi",
    fiturDesa: citraData.fiturDesa,
  });
  useJalurLayers({
    map,
    styleVersion,
    kab: wilayah.kab,
    varian: wilayah.varian ?? VARIAN_DEFAULT,
    idJalur: wilayah.jalur,
    aktif: lensaEfektif === "jalur-ekonomi",
  });
  useKembarLayers({
    map,
    styleVersion,
    kab: wilayah.kab,
    aktif: lensaEfektif === "desa-kembar",
    desa: wilayah.desa,
    // Digerbang `wilayah.desa` (fase 5, temuan review Blok A): `?kembar=`
    // tanpa `?desa=` adalah URL yang sah — `parseWilayahParams` hanya
    // membuang `kembar` yang SAMA dengan `desa`, jadi deep-link
    // `?lensa=desa-kembar&kab=1801&kembar=…` lolos. Tanpa gerbang ini peta
    // menyorot satu desa oranye sementara panel masih meminta desa acuan;
    // sorotan "kembar" tanpa acuan tidak berarti apa-apa.
    kembar: wilayah.desa ? wilayah.kembar : undefined,
  });

  const dialogDeepLink: DialogState | null =
    !dialogOtomatisPernahDitutup && !memuat && !lensaDiizinkan
      ? {
          kemampuan: kemampuanLensa,
          nama: LENSA_ITEMS.find((item) => item.lensa === wilayah.lensa)?.nama ?? wilayah.lensa,
        }
      : null;
  const dialogAktif = dialog ?? dialogDeepLink;

  function handleLogoClick() {
    setPanelCollapsed(true);
    wilayah.reset();
  }

  function tutupDialog() {
    setDialog(null);
    setDialogOtomatisPernahDitutup(true);
  }

  function tutupAsisten() {
    setAsistenTerbuka(false);
    asistenRef.current?.focus();
  }

  const query = searchParams.toString();
  const tujuan = `${pathname}${query ? `?${query}` : ""}`;

  return (
    <div className="flex h-dvh flex-col gap-2 bg-canvas p-4 pl-2 md:flex-row">
      <h1 className="sr-only">SIMPUL DESA</h1>

      <SideRail
        konteks="dasbor"
        collapsed={panelCollapsed}
        onOpenPanel={() => setPanelCollapsed(false)}
        onLogoClick={handleLogoClick}
        onKlikTerkunci={(kemampuan, nama) => setDialog({ kemampuan, nama })}
        onPilihLensa={wilayah.gantiLensa}
        lensaAktif={lensaEfektif}
      />

      {/* Arah flex berubah per breakpoint: kolom di bawah md (peta di atas,
          panel jadi lembar di bawah), baris dari md ke atas. */}
      <main id="isi" className="relative flex flex-1 flex-col gap-2 overflow-hidden md:flex-row">
        <LeftPanel
          collapsed={panelCollapsed}
          onToggleCollapse={() => setPanelCollapsed((sebelumnya) => !sebelumnya)}
          width={panelWidth}
          onWidthChange={setPanelWidth}
          lensaAktif={lensaEfektif}
        >
          {PANEL_LENSA[lensaEfektif](wilayah)}
        </LeftPanel>
        <MapStage
          onMapReady={setMap}
          onStyleLoad={() => setStyleVersion((v) => v + 1)}
          onMapGone={() => setMap(null)}
          navbarLeft={<NavbarLokasi />}
          navbarRight={<SearchBox onPilih={wilayah.pilihDesa} />}
          asistenTerkunci={!bisaAsisten}
          onAsistenTerkunci={() => setDialog({ kemampuan: "asisten", nama: "Asisten Desa" })}
          asistenTerbuka={asistenTerbuka}
          onToggleAsisten={() => setAsistenTerbuka((sebelumnya) => !sebelumnya)}
          asistenRef={asistenRef}
          adaSesi={adaSesi}
          memuat={memuat}
        >
          {lensaEfektif === "citra-potensi" && (
            <LegendaCitraMap
              prov={wilayah.prov}
              kab={wilayah.kab}
              target={wilayah.target}
              desa={wilayah.desa}
            />
          )}
          {lensaEfektif === "jalur-ekonomi" && wilayah.desa && (
            <KartuDesaJalurMap
              varian={wilayah.varian ?? VARIAN_DEFAULT}
              desa={wilayah.desa}
              kab={wilayah.kab}
              jalurAktif={wilayah.jalur}
              onPilihJalur={wilayah.pilihJalur}
              onTutup={() => {
                if (wilayah.kab) wilayah.pilihKab(wilayah.kab);
              }}
            />
          )}
        </MapStage>
        {/* Gerbang ganda (Task 24 GOTCHA 2): tombol di `MapStage` sudah
            digerbangi `asistenTerkunci`, tapi peran bisa turun DI TENGAH sesi
            (mis. sesi kedaluwarsa) — tanpa gerbang kedua di sini, panel yang
            sudah terbuka tetap hidup walau perannya sudah tidak berhak. */}
        {asistenTerbuka && bisaAsisten && (
          <PanelAsisten asisten={asisten} wilayah={wilayah} onTutup={tutupAsisten} />
        )}
      </main>

      {dialogAktif && (
        <DialogTerkunci
          kemampuan={dialogAktif.kemampuan}
          nama={dialogAktif.nama}
          tujuan={tujuan}
          adaSesi={adaSesi}
          onTutup={tutupDialog}
        />
      )}
    </div>
  );
}
