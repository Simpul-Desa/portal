"use client";

import { useEffect, useRef, type ReactNode, type Ref } from "react";

import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { ID_PANEL_ASISTEN } from "@/features/asisten/components/panel-asisten";
import { buatStyleEsri, buatStyleOsm, CAKUPAN_BBOX, FIT_OPTIONS } from "@/lib/map/basemap";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import { LocateIcon, LockBadge, SparkIcon, ZoomInIcon, ZoomOutIcon } from "../icons";

type MapStageProps = {
  /** Dipanggil TEPAT SEKALI setelah event `load` peta pertama. */
  onMapReady?: (map: maplibregl.Map) => void;
  /** Dipanggil tiap kali style berganti (event `style.load`), termasuk setelah fallback OSM. */
  onStyleLoad?: (map: maplibregl.Map) => void;
  /** Dipanggil di cleanup unmount, SETELAH `map.remove()` — pemanggil memakai
   * ini untuk `setMap(null)` supaya `use-map-layers` berhenti menyentuh
   * instance peta yang sudah dilepas saat Fast Refresh/remount (review Blok D #6). */
  onMapGone?: () => void;
  /** Slot kolom cari top-center (Task 23) — map-stage hanya menyediakan posisi
   * + lebar (`flex-1 min-w-0 max-w-[520px]`); isi kolom (pill, dropdown, a11y)
   * sepenuhnya milik pemanggil (`SearchBox`). Kosong bila tidak diisi. */
  searchSlot?: ReactNode;
  /** `!bisa(peran, "asisten")` — anonim/tamu. Menentukan apakah klik membuka
   * `DialogTerkunci` (rencana fase 2 Task 22). Dihitung dari peran BAWAAN
   * anonim, tidak menunggu `memuat` — hanya lencananya yang menunggu
   * (lihat prop `memuat` di bawah), supaya tombolnya tidak pernah tampak
   * "terbuka" sesaat sebelum peran nyata diketahui. */
  asistenTerkunci: boolean;
  /** `useSesi().adaSesi` — memisahkan DUA sebab terkunci yang kalimatnya
   * berbeda: belum masuk sama sekali (ajakan masuk sah) versus sudah masuk
   * tetapi perannya belum membuka fitur ini (menyuruh masuk lagi adalah
   * antarmuka yang menyangkal sesi pengguna). */
  adaSesi: boolean;
  /** Klik tombol Asisten saat terkunci → buka `DialogTerkunci` (shell). */
  onAsistenTerkunci: () => void;
  /** Panel Asisten sedang terbuka (Task 23) — menentukan `aria-expanded`,
   * gaya aktif tombol, dan dipakai shell untuk memilih `onToggleAsisten`
   * alih-alih `onAsistenTerkunci` saat TIDAK terkunci. */
  asistenTerbuka: boolean;
  /** Klik tombol Asisten saat TIDAK terkunci → buka/tutup panel (shell,
   * Task 24). Panel Asisten sendiri sudah berisi (fase 6, Blok C). */
  onToggleAsisten: () => void;
  /** Ref tombol Asisten — dipegang shell untuk fokus balik saat panel
   * ditutup (Task 24; panel bukan modal, jadi fokus baliknya diurus di luar
   * `PanelAsisten`, bukan di dalamnya). */
  asistenRef?: Ref<HTMLButtonElement>;
  /** `useSesi().memuat` — lencana kunci hanya dirender saat `!memuat`,
   * supaya pengguna yang sudah masuk (pemerintah/swasta/admin) tidak
   * melihat lencana berkedip sebelum perannya selesai dimuat. */
  memuat: boolean;
};

/**
 * Peta MapLibre nyata: basemap satelit Esri dengan cadangan OSM otomatis
 * (lihat `basemap.ts` untuk style, dan badan efek di bawah untuk syarat
 * fallback-nya). Lingkaran berjenjang dan layer batas desa dipasang
 * gelombang D (Task 21) lewat dua kontrak callback:
 *
 * - `onMapReady(map)` — dipanggil TEPAT SEKALI, setelah event `load` peta
 *   pertama (style + source awal siap).
 * - `onStyleLoad(map)` — dipanggil SETIAP KALI style berganti (event
 *   `style.load`), termasuk setelah fallback OSM — dipakai gelombang D untuk
 *   memasang ulang source/layer yang hilang saat style diganti (mengganti
 *   style membuang semua source/layer lama).
 * - `onMapGone()` — dipanggil di cleanup unmount, setelah `map.remove()`
 *   (review Blok D #6): pemanggil memakainya untuk `setMap(null)` supaya
 *   pengendali layer (`useMapLayers`) berhenti menyentuh instance peta yang
 *   sudah dilepas saat Fast Refresh/remount.
 *
 * Ketiga callback dibaca lewat `useRef` (selalu versi terbaru dari induk)
 * supaya tidak perlu jadi dependency efek init peta — efek itu sengaja jalan
 * sekali per mount (StrictMode-safe lewat cleanup di bawah).
 */
export function MapStage({
  onMapReady,
  onStyleLoad,
  onMapGone,
  searchSlot,
  asistenTerkunci,
  onAsistenTerkunci,
  asistenTerbuka,
  onToggleAsisten,
  asistenRef,
  adaSesi,
  memuat,
}: MapStageProps) {
  // Dua sebab terkunci, dua kalimat. Menyuruh "Masuk" kepada pengguna yang
  // sesinya sudah ada adalah antarmuka yang menyangkal sesi itu sendiri —
  // keadaan yang nyata terjadi saat `api/` mati dan peran belum terbaca,
  // sehingga peran efektif melantai ke tamu (lihat `peranEfektif`).
  const teksTerkunci = adaSesi
    ? "Asisten Desa terkunci. Peran akun ini belum membukanya."
    : "Asisten Desa terkunci. Masuk untuk membukanya.";
  const labelTerkunci = adaSesi
    ? "Asisten Desa, terkunci. Peran akun ini belum membukanya."
    : "Asisten Desa, terkunci. Masuk untuk membukanya.";

  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  const onStyleLoadRef = useRef(onStyleLoad);
  const onMapGoneRef = useRef(onMapGone);

  useEffect(() => {
    onMapReadyRef.current = onMapReady;
    onStyleLoadRef.current = onStyleLoad;
    onMapGoneRef.current = onMapGone;
  });

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: buatStyleEsri(),
      bounds: CAKUPAN_BBOX,
      fitBoundsOptions: FIT_OPTIONS,
      attributionControl: false,
    });
    mapRef.current = map;
    map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-left");

    map.once("load", () => {
      onMapReadyRef.current?.(map);
    });
    map.on("style.load", () => {
      onStyleLoadRef.current?.(map);
    });

    // Fallback OSM diskriminatif. Dua syarat, keduanya wajib:
    // (a) galat benar datang dari source "esri" — tipe `ErrorEvent` MapLibre
    //     v6 tidak menyatakan `sourceId` secara statis (properti itu
    //     ditembakkan lewat mekanisme evented-parent internal MapLibre, bukan
    //     bagian tetap kelas `ErrorEvent`), jadi dicek dengan guard defensif
    //     alih-alih diasumsikan selalu ada;
    // (b) source "esri" belum pernah "settle" (`esriSudahSettle`, dari
    //     `sourcedata`/`isSourceLoaded`). PENTING soal nama: `isSourceLoaded`
    //     berarti "tidak ada request jaringan tersisa" — true juga kalau
    //     SEMUA tile-nya gagal, bukan cuma kalau sukses (lihat dok
    //     `MapSourceDataEvent.isSourceLoaded` MapLibre). Jaminan yang
    //     membuat fallback tetap benar walau begitu: kalau Esri gagal total,
    //     error tile PERTAMA selalu tiba sebelum `sourcedata` yang men-set
    //     flag ini — tile itu sendiri harus settle dulu sebelum "semua tile
    //     settle" bisa true — jadi `handleTileError` di bawah sudah menembak
    //     fallback (dan unsubscribe diri) sebelum flag ini sempat true.
    //     Gunanya flag ini murni untuk KEJADIAN SETELAHNYA: satu tile gagal
    //     transien setelah source pernah settle tidak lagi memicu fallback.
    let esriSudahSettle = false;

    function handleSourceData(e: maplibregl.MapSourceDataEvent) {
      if (e.sourceId === "esri" && e.isSourceLoaded) {
        esriSudahSettle = true;
      }
    }
    map.on("sourcedata", handleSourceData);

    function handleTileError(e: maplibregl.ErrorEvent) {
      const galat = e as maplibregl.ErrorEvent & { sourceId?: string };
      if (!("sourceId" in e) || galat.sourceId !== "esri" || esriSudahSettle) return;
      map.setStyle(buatStyleOsm());
      map.off("error", handleTileError);
    }
    map.on("error", handleTileError);

    // Tanpa ResizeObserver manual: MapLibre v6 sudah memasang
    // ResizeObserver-nya sendiri pada container (opsi `trackResize`, bawaan
    // `true`) dan mengurus `map.resize()` + redraw dengan throttle internal —
    // observer kedua di sini cuma duplikasi kerja yang sama.
    return () => {
      map.off("sourcedata", handleSourceData);
      map.off("error", handleTileError);
      map.remove();
      mapRef.current = null;
      onMapGoneRef.current?.();
    };
    // Dependency array sengaja kosong: init peta sekali per mount
    // (StrictMode-safe lewat cleanup di atas). Tidak butuh eslint-disable —
    // satu-satunya nilai luar yang dipakai (`containerRef`) adalah ref
    // stabil; `onMapReady`/`onStyleLoad` dibaca lewat ref di atas, bukan
    // langsung, jadi bukan dependency reaktif.
  }, []);

  return (
    <div className="relative order-first h-[45vh] min-h-[260px] shrink-0 overflow-hidden rounded-card md:order-none md:h-auto md:min-h-0 md:flex-1">
      {/* `h-full w-full` (bukan `absolute inset-0`) SENGAJA: `maplibre-gl.css`
          menyetel `.maplibregl-map { position: relative }` tanpa `@layer` —
          CSS tak berlapis selalu menang atas utilitas Tailwind v4 (yang
          hidup di `@layer utilities`) walau urutan impor JS Tailwind lebih
          akhir, jadi `absolute` dari sini tidak pernah menang dan `inset-0`
          pada elemen `position:relative` tidak mengatur ukuran (bukan
          `absolute`) — container kolaps tinggi 0. `h-full`/`w-full` bekerja
          sama baiknya untuk `position:relative` selama induk (`div` di atas)
          punya tinggi pasti, dan tidak perlu melawan cascade sama sekali. */}
      <div ref={containerRef} className="h-full w-full" />

      {/* Baris atas: SATU flex row (field cari + tombol), bukan dua elemen
          absolute yang berbagi band-y — itu yang membuat field cari
          tertindih klaster tombol kanan-atas di viewport <744px lebar peta.
          Field cari (`flex-1 min-w-0`, dibatasi `max-w-[520px]`) memakai
          semua ruang bebas; klaster tombol (`shrink-0 ml-auto`) menempel ke
          ujung kanan lewat margin-auto — BUKAN div spacer terpisah. Spacer
          `flex-1` sempat dipakai di sini tapi keliru: ia ikut berebut ruang
          bebas 50/50 dengan field cari (sama-sama flex-1), jadi field cari
          malah mengecil sia-sia di viewport sempit (mis. 375px, kolom cari
          bisa terkompres sampai nyaris tak terlihat) padahal ruang itu
          harusnya jadi miliknya. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center gap-3 p-6 md:pl-[calc(var(--spacing-panel-min)+var(--spacing)*2)] lg:pl-6">
        <div className="pointer-events-auto min-w-0 max-w-[520px] flex-1">{searchSlot}</div>

        {/* `hidden lg:flex` saat Asisten terbuka (bukan `opacity-0`): tombol
            ini berbagi tepi kanan peta dengan panel Asisten di rentang
            drawer/lembar (di bawah lg), jadi harus keluar dari urutan Tab DAN
            pohon aksesibilitas sekaligus, bukan cuma tak kasatmata. */}
        <div
          className={`pointer-events-auto ml-auto shrink-0 items-center gap-2 ${asistenTerbuka ? "hidden lg:flex" : "flex"}`}
        >
          <button
            type="button"
            ref={asistenRef}
            onClick={asistenTerkunci ? onAsistenTerkunci : onToggleAsisten}
            title={
              asistenTerkunci
                ? teksTerkunci
                : asistenTerbuka
                  ? "Tutup Asisten Desa"
                  : "Asisten Desa"
            }
            aria-label={
              asistenTerkunci
                ? labelTerkunci
                : asistenTerbuka
                  ? "Tutup Asisten Desa"
                  : "Asisten Desa"
            }
            aria-expanded={asistenTerkunci ? undefined : asistenTerbuka}
            aria-controls={asistenTerkunci ? undefined : ID_PANEL_ASISTEN}
            className={`relative flex size-10 items-center justify-center rounded-full shadow-float ${FOCUS_RING} ${
              asistenTerbuka ? "bg-surface text-ink" : "bg-float text-muted"
            }`}
          >
            <SparkIcon />
            {!memuat && asistenTerkunci && <LockBadge />}
          </button>
        </div>
      </div>

      {/* Bottom-right: stack map-control (44px) — zoom in, zoom out, locate.
          Sama alasan `hidden lg:flex` dengan klaster di atas. */}
      <div
        className={`pointer-events-none absolute right-6 bottom-6 flex-col gap-2 ${asistenTerbuka ? "hidden lg:flex" : "flex"}`}
      >
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn()}
          title="Perbesar"
          aria-label="Perbesar"
          className={`pointer-events-auto flex size-11 items-center justify-center rounded-control bg-float text-ink shadow-float ${FOCUS_RING}`}
        >
          <ZoomInIcon />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut()}
          title="Perkecil"
          aria-label="Perkecil"
          className={`pointer-events-auto flex size-11 items-center justify-center rounded-control bg-float text-ink shadow-float ${FOCUS_RING}`}
        >
          <ZoomOutIcon />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.fitBounds(CAKUPAN_BBOX, FIT_OPTIONS)}
          title="Tampilkan cakupan penuh"
          aria-label="Tampilkan cakupan penuh"
          className={`pointer-events-auto flex size-11 items-center justify-center rounded-control bg-float text-ink shadow-float ${FOCUS_RING}`}
        >
          <LocateIcon />
        </button>
      </div>
    </div>
  );
}
