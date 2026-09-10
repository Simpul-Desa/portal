/**
 * Ratakan `jejak_fungsi` mentah dari `POST /api/chat` jadi baris siap-render
 * blok "Sumber jawaban" — label GLOSSARY, ringkasan argumen aman-tampil, dan
 * tujuan URL tervalidasi. Mengikuti pola `features/jalur-ekonomi/services/
 * normalisasi.ts`: meratakan bentuk `api/` (di sini `argumen: Record<string,
 * unknown>` — keluaran MODEL, bukan data tervalidasi) ke bentuk render, TIDAK
 * PERNAH melempar untuk argumen cacat.
 *
 * `tujuan` selalu dibangun lewat `parseWilayahParams` (`@/lib/url-state`) —
 * satu validator dipakai seluruh dasbor, supaya regex wilayah tidak disalin
 * ganda ke sini (Task 10 rencana fase 6, § Patterns "VALIDASI ARGUMEN LEWAT
 * PARSER YANG SUDAH ADA").
 */

import { parseWilayahParams, type Varian } from "@/lib/url-state";

import type { BarisJejak, JejakFungsi, TujuanJejak } from "../types";

/** Label GLOSSARY per alat (rencana fase 6 § "Delapan alat dan tautannya";
 * `cek_cakupan_wilayah` ditambahkan belakangan, kontrak `api/` kini sembilan
 * alat). Alat di luar daftar ini (kontrak `api/` bertambah lagi) jatuh ke
 * label mentah di `barisJejak`, bukan di sini — kontrak baru tidak boleh
 * hilang diam-diam. */
const LABEL_ALAT: Record<string, string> = {
  cari_desa: "Cari desa",
  kartu_ekonomi: "Kartu Ekonomi Desa",
  peta_peran: "Peta Peran",
  desa_kembar: "Desa Kembar",
  jalur_ekonomi: "Jalur Ekonomi",
  berita_desa: "Berita Desa",
  citra_potensi: "Citra Potensi Desa",
  wilayah_ringkasan: "Ringkasan wilayah",
  cek_cakupan_wilayah: "Cek cakupan wilayah",
};

/** Label GLOSSARY varian Jalur Ekonomi (GLOSSARY § Varian Jalur Ekonomi).
 * Ditulis ulang di sini alih-alih diimpor dari `features/jalur-ekonomi/` —
 * rencana Task 10 membatasi impor berkas ini ke `@/lib/url-state` dan
 * `../types` saja. */
const LABEL_VARIAN: Record<Varian, string> = {
  komoditas: "Komoditas",
  "gudang-kopdes": "Gudang Kopdes",
  "cold-storage": "Cold Storage",
  wisata: "Wisata",
};

/** `argumen` server adalah `dict[str, Any]` — keluaran model, bukan data
 * tervalidasi. Tiap pembacaan WAJIB lewat penjaga tipe eksplisit (Task 10
 * GOTCHA 1), bukan cast: `null`, angka, dan objek semuanya mungkin muncul. */
function str(nilai: unknown): string | null {
  return typeof nilai === "string" ? nilai : null;
}

/** Label varian tampil, atau nilai mentah bila varian tidak dikenal
 * `LABEL_VARIAN` — pola fallback yang sama dengan `daftar-jalur.tsx`. */
function labelVarian(nilai: string): string {
  return Object.hasOwn(LABEL_VARIAN, nilai) ? LABEL_VARIAN[nilai as Varian] : nilai;
}

/** Tujuan tiga alat ber-`iddesa` yang menuju SATU lensa desa. Cukup mengirim
 * `desa` ke `parseWilayahParams` — `prov`/`kab` diturunkan sendiri dari
 * prefiksnya saat URL dibaca ulang (Task 5 GOTCHA 2), jadi tidak perlu
 * ditulis di sini. */
function tujuanDesa(lensa: TujuanJejak["lensa"], argumen: Record<string, unknown>): TujuanJejak | null {
  const iddesa = str(argumen.iddesa);
  const sp = new URLSearchParams();
  sp.set("lensa", lensa);
  if (iddesa) sp.set("desa", iddesa);

  const hasil = parseWilayahParams(sp);
  return hasil.desa ? { lensa, desa: hasil.desa } : null;
}

function tujuanJalur(argumen: Record<string, unknown>): TujuanJejak | null {
  const varianMentah = str(argumen.varian);
  const kabMentah = str(argumen.kab);
  const sp = new URLSearchParams();
  sp.set("lensa", "jalur-ekonomi");
  if (varianMentah) sp.set("varian", varianMentah);
  if (kabMentah) sp.set("kab", kabMentah);

  const hasil = parseWilayahParams(sp);
  if (!hasil.varian) return null;
  return { lensa: "jalur-ekonomi", varian: hasil.varian, ...(hasil.kab ? { kab: hasil.kab } : {}) };
}

function tujuanCitra(argumen: Record<string, unknown>): TujuanJejak | null {
  const provMentah = str(argumen.prov);
  const targetMentah = str(argumen.target);
  const sp = new URLSearchParams();
  sp.set("lensa", "citra-potensi");
  if (provMentah) sp.set("prov", provMentah);
  if (targetMentah) sp.set("target", targetMentah);

  const hasil = parseWilayahParams(sp);
  return hasil.prov && hasil.target ? { lensa: "citra-potensi", prov: hasil.prov, target: hasil.target } : null;
}

/**
 * Tujuan navigasi satu pemanggilan alat, berdasarkan bentuk argumennya
 * (§ "Delapan alat dan tautannya", kolom Tujuan). `cari_desa` (nama bebas)
 * dan `wilayah_ringkasan` (bukan lensa) selalu jatuh ke `default` → `null`.
 * `status: "gagal"` diperiksa di `barisJejak`, bukan di sini, supaya fungsi
 * per-alat ini tetap murni soal BENTUK argumen.
 */
function tujuanAlat(fungsi: string, argumen: Record<string, unknown>): TujuanJejak | null {
  switch (fungsi) {
    case "kartu_ekonomi":
      return tujuanDesa("kartu", argumen);
    case "peta_peran":
      return tujuanDesa("peta-peran", argumen);
    case "desa_kembar":
      return tujuanDesa("desa-kembar", argumen);
    // Berita Desa adalah seksi di dalam Kartu Ekonomi Desa (PRD §5.5), bukan
    // lensa tersendiri (Task 10 GOTCHA 2) — mengantar ke lensa Kartu desa
    // yang sama.
    case "berita_desa":
      return tujuanDesa("kartu", argumen);
    case "jalur_ekonomi":
      return tujuanJalur(argumen);
    case "citra_potensi":
      return tujuanCitra(argumen);
    default:
      return null;
  }
}

/**
 * Ringkasan argumen aman-tampil untuk baris kedua (§ "rincian"). Dibaca dari
 * `argumen` mentah lewat penjaga tipe SAJA — TIDAK bergantung pada validitas
 * `tujuan`, supaya baris tanpa tautan (mis. varian asing, kode wilayah cacat)
 * tetap menampilkan rincian yang bisa dibaca manusia, persis pola sketsa C
 * rencana fase 6.
 */
function rincianAlat(fungsi: string, argumen: Record<string, unknown>): string {
  switch (fungsi) {
    case "kartu_ekonomi":
    case "peta_peran":
    case "desa_kembar":
    case "berita_desa": {
      const iddesa = str(argumen.iddesa);
      return iddesa ? `Desa ${iddesa}` : "";
    }
    case "jalur_ekonomi": {
      const varianMentah = str(argumen.varian);
      if (!varianMentah) return "";
      const kab = str(argumen.kab);
      const label = labelVarian(varianMentah);
      return kab ? `${label} · Kab. ${kab}` : label;
    }
    case "citra_potensi": {
      const prov = str(argumen.prov);
      const target = str(argumen.target);
      return prov && target ? `Prov ${prov} · ${target}` : "";
    }
    // `cek_cakupan_wilayah` berbagi bentuk argumen dengan `cari_desa` (satu
    // `nama` bebas dari pengguna), jadi rinciannya dirakit sama: nama yang
    // dicek, dalam tanda kutip.
    case "cari_desa":
    case "cek_cakupan_wilayah": {
      const nama = str(argumen.nama);
      return nama ? `"${nama}"` : "";
    }
    default:
      return "";
  }
}

/**
 * Kunci dedupe: `fungsi` + pasangan kunci-nilai `argumen` DIURUTKAN menurut
 * kunci (Task 10 GOTCHA 4) — BUKAN `JSON.stringify` mentah, supaya dua
 * objek argumen setara dengan urutan kunci berbeda tidak lolos sebagai dua
 * baris berbeda.
 */
function kunciDedupe(fungsi: string, argumen: Record<string, unknown>): string {
  const pasangan = Object.keys(argumen)
    .sort()
    .map((kunci) => `${kunci}=${String(argumen[kunci])}`)
    .join("&");
  return `${fungsi}::${pasangan}`;
}

/**
 * `status: "gagal"` SELALU `tujuan: null` — datanya tidak pernah kembali,
 * mengantar pengguna ke lensa kosong adalah janji palsu (Task 10). Baris
 * dengan `fungsi` + argumen identik (kunci dedupe sama) muncul sekali; urutan
 * kemunculan PERTAMA yang dipertahankan.
 */
export function barisJejak(jejak: readonly JejakFungsi[]): BarisJejak[] {
  const hasil: BarisJejak[] = [];
  const terlihat = new Set<string>();

  for (const j of jejak) {
    const kunci = kunciDedupe(j.fungsi, j.argumen);
    if (terlihat.has(kunci)) continue;
    terlihat.add(kunci);

    const sukses = j.status === "sukses";
    hasil.push({
      fungsi: j.fungsi,
      label: LABEL_ALAT[j.fungsi] ?? j.fungsi,
      rincian: rincianAlat(j.fungsi, j.argumen),
      sukses,
      tujuan: sukses ? tujuanAlat(j.fungsi, j.argumen) : null,
    });
  }

  return hasil;
}
