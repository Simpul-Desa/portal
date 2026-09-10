/**
 * Matriks akses murni — sumber sah `../PRD.md` §3 (akar), diterjemahkan ke
 * kode. Satu objek konstanta per kemampuan (bukan rantai `if`/`switch`), dan
 * peran BUKAN tangga angka: `laporan` sengaja tidak diwariskan dari
 * `asisten` (swasta punya asisten tapi tidak laporan) — sel per kemampuan
 * adalah satu-satunya bentuk yang benar untuk pengecualian ini.
 *
 * Tanpa dependensi framework (murni, testable tanpa DOM) — hanya `Lensa`
 * yang diimpor untuk memetakan lensa → kemampuan.
 */

import type { Lensa } from "@/lib/url-state";

/** Lima peran tersimpan plus keadaan tanpa login. Definisi nama di `../GLOSSARY.md` § Peran pengguna. */
export type Peran = "anonim" | "tamu" | "pemerintah" | "swasta" | "admin";

/** Enam kemampuan yang digerbangi — baris matriks `../PRD.md` §3. */
export type Kemampuan =
  | "kartu"
  | "lensa-lain"
  | "berita"
  | "asisten"
  | "laporan"
  | "admin";

/** Peran mana saja yang membuka tiap kemampuan — persis matriks `../PRD.md` §3. */
const MATRIKS: Record<Kemampuan, readonly Peran[]> = {
  kartu: ["anonim", "tamu", "pemerintah", "swasta", "admin"],
  "lensa-lain": ["tamu", "pemerintah", "swasta", "admin"],
  berita: ["tamu", "pemerintah", "swasta", "admin"],
  asisten: ["pemerintah", "swasta", "admin"],
  laporan: ["pemerintah", "admin"],
  admin: ["admin"],
};

/** `true` bila `peran` boleh memakai `kemampuan`. Penegakan sesungguhnya tetap di `api/` — ini hanya gate antarmuka. */
export function bisa(peran: Peran, kemampuan: Kemampuan): boolean {
  return MATRIKS[kemampuan].includes(peran);
}

const SEMUA_PERAN: readonly string[] = [
  "anonim",
  "tamu",
  "pemerintah",
  "swasta",
  "admin",
];

/**
 * Validasi nilai peran yang datang dari luar (respons `api/` mengetiknya
 * `string`) di batas sistem, bukan lewat cast. Nilai asing diperlakukan
 * sebagai bukan-peran supaya antarmuka jatuh ke keadaan terkunci — `api/`
 * sendiri sudah menolak peran tak dikenal dengan 403 `PERAN_TIDAK_DIKENAL`.
 */
export function adalahPeran(nilai: unknown): nilai is Peran {
  return typeof nilai === "string" && SEMUA_PERAN.includes(nilai);
}

type ParamPeranEfektif = {
  /** Ada sesi Supabase (cookie terbaca), lepas dari apakah perannya sudah terbaca. */
  adaSesi: boolean;
  /** `profil?.peran` mentah dari `GET /api/profil/saya` — divalidasi di sini lewat `adalahPeran`. */
  peranProfil: unknown;
  /** Query peran GAGAL (`galatPeran` terisi) — beda dari "masih memuat". */
  adaGalat: boolean;
};

/**
 * Peran efektif dipakai antarmuka (perbaikan galat diam terlaporkan 10
 * September 2026). Tanpa sesi selalu `"anonim"`. Dengan sesi: peran
 * sungguhan menang begitu terbaca; kalau BELUM (query masih memuat) tetap
 * `"anonim"` supaya lensa tidak berkedip terbuka lalu terkunci; tapi kalau
 * bacaannya GAGAL (`adaGalat`, mis. `api/` mati), lantainya `"tamu"` —
 * `../PRD.md` §3 (akar) menjamin registrasi mandiri selalu menghasilkan
 * tamu, jadi itu lantai jujur untuk sesi yang sah, bukan tebakan. Peran
 * asing (nilai sukses tapi tak dikenal, tanpa galat) jatuh ke `"anonim"` —
 * kasus itu seharusnya sudah ditolak `api/` sebagai galat 403 lebih dulu.
 */
export function peranEfektif({ adaSesi, peranProfil, adaGalat }: ParamPeranEfektif): Peran {
  if (!adaSesi) return "anonim";
  if (adalahPeran(peranProfil)) return peranProfil;
  return adaGalat ? "tamu" : "anonim";
}

/**
 * Satu kalimat per kemampuan: siapa yang bisa membukanya. Satu sumber supaya
 * salinan dialog tidak ditulis ulang di tiap pemanggil. Kalimatnya berdiri
 * sendiri — dialog memakainya apa adanya sebagai isi, tanpa baris pembuka
 * tambahan yang cuma mengulang judul ("… terkunci") dan tombolnya ("Masuk").
 */
export const PERAN_PEMBUKA: Record<Kemampuan, string> = {
  kartu: "Terbuka untuk semua, termasuk yang belum masuk.",
  "lensa-lain": "Peran tamu sudah cukup untuk membukanya.",
  berita: "Peran tamu sudah cukup untuk membukanya.",
  asisten: "Hanya peran pemerintah dan swasta yang bisa membukanya.",
  laporan: "Hanya peran pemerintah yang bisa membukanya.",
  admin: "Hanya peran admin yang bisa membukanya.",
};

/** Kemampuan yang digerbangi tiap lensa — rail memetakan lewat ini, bukan `switch` tersebar. */
export const KEMAMPUAN_LENSA: Record<Lensa, Kemampuan> = {
  kartu: "kartu",
  "peta-peran": "lensa-lain",
  "jalur-ekonomi": "lensa-lain",
  "desa-kembar": "lensa-lain",
  "citra-potensi": "lensa-lain",
};
