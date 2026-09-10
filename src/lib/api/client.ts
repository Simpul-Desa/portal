/**
 * Klien fetch sadar-amplop untuk `api/` lokal. Amplop respons persis
 * `../api/PRD.md` §6: `{sukses, data, galat, meta}` — `sukses:false` ATAU
 * status HTTP non-2xx sama-sama berarti galat, dilempar sebagai `GalatApi`.
 * Geo (`ambilGeo`) adalah SATU-SATUNYA pengecualian amplop (GeoJSON mentah
 * saat sukses) — galatnya sendiri TETAP amplop JSON biasa.
 *
 * ETag/304 sepenuhnya urusan `fetch` bawaan browser — modul ini TIDAK
 * pernah menulis cache sendiri.
 */

import { API_URL } from "@/core/config";

import type { components } from "./openapi";

type Galat = components["schemas"]["Galat"];
type Meta = components["schemas"]["Meta"];

type ParamValue = string | number | undefined;

/** Kode fallback saat body respons galat bukan JSON amplop (mis. halaman HTML server). */
const KODE_GALAT_SERVER = "GALAT_SERVER";
/** Kode saat `fetch` sendiri gagal (jaringan putus/DNS/CORS) — bukan status HTTP asli, jadi `status` diisi 0. */
const KODE_GALAT_JARINGAN = "GALAT_JARINGAN";

/**
 * Satu seam untuk mengambil token sesi — didaftarkan sekali oleh
 * `SesiProvider` (`@/core/sesi`). Boleh `null` (render pertama sebelum
 * provider siap, atau uji unit) — diperlakukan sama dengan "tidak ada
 * token", bukan galat.
 */
let pengambilToken: (() => Promise<string | null>) | null = null;

/** Daftarkan pengambil token sesi. Dipanggil sekali oleh `SesiProvider`. */
export function daftarkanPengambilToken(fn: () => Promise<string | null>): void {
  pengambilToken = fn;
}

/**
 * Header `Authorization` HANYA dibangun bila diminta (`bertoken: true`).
 * Token diambil FRESH lewat registri tiap kali dipanggil — jangan
 * menyimpan `access_token` di variabel modul (kedaluwarsa setelah refresh
 * otomatis).
 */
async function buatHeaderAuth(bertoken?: boolean): Promise<Record<string, string> | undefined> {
  if (!bertoken || !pengambilToken) return undefined;

  const token = await pengambilToken();
  return token ? { Authorization: `Bearer ${token}` } : undefined;
}

/** Galat terlempar `ambil`/`ambilGeo` — selalu punya `kode` mesin dan `status` HTTP (0 untuk galat jaringan). */
export class GalatApi extends Error {
  readonly kode: string;
  readonly pesan: string;
  readonly status: number;

  constructor(kode: string, pesan: string, status: number) {
    super(pesan);
    this.name = "GalatApi";
    this.kode = kode;
    this.pesan = pesan;
    this.status = status;
  }
}

interface Amplop<T> {
  sukses: boolean;
  data?: T | null;
  galat?: Galat | null;
  meta?: Meta | null;
}

function buatQuery(params?: Record<string, ParamValue>): string {
  if (!params) return "";

  const sp = new URLSearchParams();
  for (const [kunci, nilai] of Object.entries(params)) {
    if (nilai === undefined) continue;
    sp.set(kunci, String(nilai));
  }

  const query = sp.toString();
  return query ? `?${query}` : "";
}

/** Bungkus `fetch` supaya reject (TypeError jaringan) selalu jadi `GalatApi`, bukan galat mentah. */
async function fetchAman(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new GalatApi(
      KODE_GALAT_JARINGAN,
      "Tidak bisa menghubungi server — periksa sambungan internet.",
      0,
    );
  }
}

/**
 * Baca amplop respons dan kembalikan `{data, meta}` bila sukses — dipakai
 * bersama oleh `ambil` (GET) dan `kirim` (POST), supaya keduanya menegakkan
 * satu jalur galat yang sama alih-alih dua parser amplop yang bisa berdrift.
 * `sukses:false` ATAU status HTTP non-2xx sama-sama dianggap galat — kontrak
 * api selalu menyelaraskan keduanya, tapi klien tidak menaruh kepercayaan
 * buta di salah satunya saja.
 */
async function bacaAmplop<T>(respons: Response): Promise<{ data: T; meta: Meta | null }> {
  let amplop: Amplop<T>;
  try {
    amplop = await respons.json();
  } catch {
    throw new GalatApi(
      KODE_GALAT_SERVER,
      "Server mengirim respons yang tidak bisa dibaca.",
      respons.status,
    );
  }

  if (!respons.ok || !amplop.sukses) {
    throw new GalatApi(
      amplop.galat?.kode ?? KODE_GALAT_SERVER,
      amplop.galat?.pesan ?? "Server mengirim galat tanpa keterangan.",
      respons.status,
    );
  }

  return { data: amplop.data as T, meta: amplop.meta ?? null };
}

/**
 * Fetch satu endpoint beramplop dan kembalikan `{data, meta}` bila sukses.
 * `sukses:false` ATAU status HTTP non-2xx sama-sama dianggap galat — kontrak
 * api selalu menyelaraskan keduanya, tapi klien tidak menaruh kepercayaan
 * buta di salah satunya saja.
 */
export async function ambil<T>(
  path: string,
  opsi?: { params?: Record<string, ParamValue>; bertoken?: boolean },
): Promise<{ data: T; meta: Meta | null }> {
  const headers = await buatHeaderAuth(opsi?.bertoken);
  const respons = await fetchAman(
    `${API_URL}${path}${buatQuery(opsi?.params)}`,
    headers && { headers },
  );

  return bacaAmplop<T>(respons);
}

/**
 * Kirim satu permintaan POST beramplop dan kembalikan `{data, meta}` bila
 * sukses — dipakai rute yang menulis, mulai dari `POST /api/chat`. Tidak
 * menerima `params` query string: rute yang memakainya belum ada, dan jalur
 * yang tak terpakai menyalahi CLAUDE.md §2.
 */
export async function kirim<T, B>(
  path: string,
  opsi: { badan: B; bertoken?: boolean },
): Promise<{ data: T; meta: Meta | null }> {
  const auth = await buatHeaderAuth(opsi.bertoken);
  const respons = await fetchAman(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...auth },
    body: JSON.stringify(opsi.badan),
  });
  return bacaAmplop<T>(respons);
}

/**
 * Kirim satu permintaan DELETE beramplop. Badan suksesnya TETAP amplop
 * (`{sukses, data, …}`), berbeda dari `ambilBerkas` — jadi jalur bacanya
 * `bacaAmplop`, sama dengan `ambil` dan `kirim`. Tanpa badan permintaan:
 * satu-satunya rute penghapus proyek ini (`DELETE /api/admin/berita/{id}`)
 * membawa seluruh identitasnya di path, dan header `Content-Type` pada
 * permintaan tanpa badan hanya menambah preflight CORS yang tidak perlu.
 */
export async function hapus<T>(
  path: string,
  opsi?: { bertoken?: boolean },
): Promise<{ data: T; meta: Meta | null }> {
  const auth = await buatHeaderAuth(opsi?.bertoken);
  const respons = await fetchAman(`${API_URL}${path}`, {
    method: "DELETE",
    ...(auth ? { headers: auth } : {}),
  });
  return bacaAmplop<T>(respons);
}

/**
 * Lempar `GalatApi` dari respons NON-amplop yang gagal. Badan galat rute
 * non-amplop (geo, laporan) TETAP amplop JSON biasa — hanya badan
 * SUKSES-nya yang bukan. Dipakai bersama `ambilGeo` dan `ambilBerkas`
 * supaya keduanya tidak berdrift.
 */
async function lemparGalatAmplop(respons: Response): Promise<never> {
  let galat: Galat | null | undefined;
  try {
    const amplop: Amplop<never> = await respons.json();
    galat = amplop.galat;
  } catch {
    // Body galat bukan JSON amplop — pakai fallback di bawah.
  }

  throw new GalatApi(
    galat?.kode ?? KODE_GALAT_SERVER,
    galat?.pesan ?? "Server mengirim galat tanpa keterangan.",
    respons.status,
  );
}

/**
 * Fetch GeoJSON batas desa satu kabupaten — TANPA amplop saat sukses
 * (pengecualian kontrak, PRD api §6). Galat (404 wilayah/berkas tak ada,
 * dst.) TETAP amplop JSON biasa, jadi baris galat di bawah mem-parse
 * `{galat}` seperti `ambil`.
 */
export async function ambilGeo(idkab: string): Promise<GeoJSON.FeatureCollection> {
  const respons = await fetchAman(`${API_URL}/api/geo/desa/${idkab}`);

  if (!respons.ok) await lemparGalatAmplop(respons);

  return (await respons.json()) as GeoJSON.FeatureCollection;
}

/**
 * Unduh satu berkas biner (PDF Laporan Desa) — pengecualian amplop KEDUA
 * sesudah `ambilGeo`: badan sukses adalah byte, bukan `{sukses, data, …}`.
 * `ambil()` TIDAK bisa dipakai untuk rute ini; ia memanggil `respons.json()`
 * pada byte PDF dan selalu melempar `GALAT_SERVER`.
 *
 * Nama berkas TIDAK dibaca dari `Content-Disposition`: header itu bukan
 * CORS-safelisted dan `api/` tidak mengirim `Access-Control-Expose-Headers`,
 * jadi JS tidak pernah melihatnya. Pemanggil membangun namanya sendiri dari
 * `iddesa` (kontrak PRD `api/` §5).
 */
export async function ambilBerkas(
  path: string,
  opsi?: { bertoken?: boolean },
): Promise<Blob> {
  const headers = await buatHeaderAuth(opsi?.bertoken);
  const respons = await fetchAman(`${API_URL}${path}`, headers && { headers });

  if (!respons.ok) await lemparGalatAmplop(respons);

  return respons.blob();
}
