/**
 * Parse/serialize state URL `?lensa=&prov=&kab=&desa=`. Murni — tanpa
 * dependensi Next.js, supaya bisa diuji tanpa DOM/router dan dipakai baik
 * di server maupun di hook client (Task terkait: `use-wilayah-params.ts`).
 */

export type Lensa =
  | "peta-peran"
  | "kartu"
  | "jalur-ekonomi"
  | "desa-kembar"
  | "citra-potensi";

const LENSA_VALID: readonly Lensa[] = [
  "peta-peran",
  "kartu",
  "jalur-ekonomi",
  "desa-kembar",
  "citra-potensi",
];

/** Lensa bawaan bila param hilang atau tidak sah (PRD §5.2). */
export const LENSA_DEFAULT: Lensa = "kartu";

/** Slug URL → nama GLOSSARY lengkap. Nilai yang dikirim ke `api/` (`zona=`)
 * SELALU nama GLOSSARY lewat `ZONA_SLUG[slug]` — nama berspasi tidak pernah
 * ditaruh langsung di URL. */
export const ZONA_SLUG = {
  pemerintah: "Zona Pemerintah",
  mitra: "Zona Mitra",
  poros: "Zona Poros",
  bantuan: "Zona Bantuan",
  "belum-terpetakan": "Belum Terpetakan",
} as const;
export type ZonaSlug = keyof typeof ZONA_SLUG;

export type Varian = "komoditas" | "gudang-kopdes" | "cold-storage" | "wisata";

const VARIAN_VALID: readonly Varian[] = ["komoditas", "gudang-kopdes", "cold-storage", "wisata"];

/** Varian bawaan lensa Jalur Ekonomi — tidak ditulis ke URL saat aktif,
 * mengikuti perlakuan `lensa` bawaan supaya URL tetap bersih. */
export const VARIAN_DEFAULT: Varian = "komoditas";

export type WilayahParams = {
  lensa: Lensa;
  prov?: string;
  kab?: string;
  desa?: string;
  zona?: ZonaSlug;
  varian?: Varian;
  jalur?: string;
  target?: string;
  kembar?: string;
};

const REGEX_PROV = /^\d{2}$/;
const REGEX_KAB = /^\d{4}$/;
const REGEX_DESA = /^\d{10}$/;
/** Skema `id_jalur` `api/`: `{idkab}-{target}-{n}` dan variannya
 * (`gudang-{n}`, `cs-baru-{n}`, `cs-eksisting-{n}`, `kawasan-{n}`) — validasi
 * di sini LONGGAR (bentuk umum), bukan parser skema penuh. */
const REGEX_JALUR = /^[A-Za-z0-9_-]{1,64}$/;
/** Skema `target` (kode sel Citra Potensi) `api/`: `kom_prov_horti_01` dan
 * sejenisnya — validasi LONGGAR (bentuk umum), bukan parser skema penuh. */
const REGEX_TARGET = /^[a-z0-9_]{1,64}$/;

function isLensa(nilai: string | null): nilai is Lensa {
  return nilai !== null && (LENSA_VALID as readonly string[]).includes(nilai);
}

function isZonaSlug(nilai: string | null): nilai is ZonaSlug {
  return nilai !== null && Object.hasOwn(ZONA_SLUG, nilai);
}

function isVarian(nilai: string | null): nilai is Varian {
  return nilai !== null && (VARIAN_VALID as readonly string[]).includes(nilai);
}

/** Bentuk minimal yang dibutuhkan dari URLSearchParams — cocok juga dengan
 * `ReadonlyURLSearchParams` next/navigation tanpa mengimpor tipe Next di sini. */
type BisaDibaca = Pick<URLSearchParams, "get">;

/**
 * Kode wilayah tak sah (regex tidak cocok) dibuang, bukan diteruskan apa
 * adanya. Bila `desa` sah, prefiksnya adalah sumber kebenaran hirarki:
 * `prov`/`kab` selalu diturunkan darinya (10 digit desa = 2 digit prov + 2
 * digit kab berikutnya), menimpa `prov`/`kab` lain di URL bila absen atau
 * tidak konsisten — desa yatim tidak boleh terjadi.
 *
 * Aturan yang SAMA berlaku satu tingkat di atasnya (review ronde 3 temuan
 * #2): bila `kab` sah (dan `desa` tidak ada), prefiksnya (2 digit pertama)
 * adalah sumber kebenaran `prov`, menimpa `prov` lain di URL bila absen
 * atau tidak konsisten — kab yatim tidak boleh terjadi. Reachable tanpa
 * menyunting URL tangan: baris Jalur Ekonomi mengisi `?kab=` lewat
 * `pilihJalur(id, {kab})` TANPA `prov` (`use-wilayah-params.ts`), dan tanpa
 * derivasi ini breadcrumb kehilangan chip Kab (digerbang `prov && kab` di
 * pemanggil) — satu-satunya jalan keluar jadi logo (reset total).
 */
export function parseWilayahParams(sp: BisaDibaca): WilayahParams {
  const lensaMentah = sp.get("lensa");
  const lensa = isLensa(lensaMentah) ? lensaMentah : LENSA_DEFAULT;

  const desaMentah = sp.get("desa");
  const desa = desaMentah && REGEX_DESA.test(desaMentah) ? desaMentah : undefined;

  const zonaMentah = sp.get("zona");
  const zona = isZonaSlug(zonaMentah) ? zonaMentah : undefined;

  const varianMentah = sp.get("varian");
  const varian = isVarian(varianMentah) ? varianMentah : undefined;

  const jalurMentah = sp.get("jalur");
  const jalur = jalurMentah && REGEX_JALUR.test(jalurMentah) ? jalurMentah : undefined;

  const targetMentah = sp.get("target");
  const target = targetMentah && REGEX_TARGET.test(targetMentah) ? targetMentah : undefined;

  const kembarMentah = sp.get("kembar");
  const kembarSah = kembarMentah && REGEX_DESA.test(kembarMentah) ? kembarMentah : undefined;

  if (desa) {
    // `kembar` sama dengan `desa` dibuang — desa acuan dibandingkan dengan
    // dirinya sendiri tidak punya arti (GOTCHA 2 rencana fase 5).
    const kembar = kembarSah && kembarSah !== desa ? kembarSah : undefined;

    return {
      lensa,
      prov: desa.slice(0, 2),
      kab: desa.slice(0, 4),
      desa,
      ...(zona ? { zona } : {}),
      ...(varian ? { varian } : {}),
      ...(jalur ? { jalur } : {}),
      ...(target ? { target } : {}),
      ...(kembar ? { kembar } : {}),
    };
  }

  const provMentah = sp.get("prov");
  const kabMentah = sp.get("kab");
  const kab = kabMentah && REGEX_KAB.test(kabMentah) ? kabMentah : undefined;
  // `kab` sah menimpa `prov` URL (bila absen ATAU tidak konsisten) dengan
  // prefiksnya sendiri — pola yang sama dengan derivasi `desa` di atas.
  const prov = kab ? kab.slice(0, 2) : provMentah && REGEX_PROV.test(provMentah) ? provMentah : undefined;
  // Tanpa `desa` (sisi kiri belum ada), tidak ada "sama dengan dirinya
  // sendiri" untuk diperiksa — `kembar` diteruskan apa adanya bila sah.
  const kembar = kembarSah;

  return {
    lensa,
    ...(prov ? { prov } : {}),
    ...(kab ? { kab } : {}),
    ...(zona ? { zona } : {}),
    ...(varian ? { varian } : {}),
    ...(jalur ? { jalur } : {}),
    ...(target ? { target } : {}),
    ...(kembar ? { kembar } : {}),
  };
}

const URUTAN_KUNCI = [
  "lensa",
  "prov",
  "kab",
  "desa",
  "zona",
  "varian",
  "jalur",
  "target",
  "kembar",
] as const;

/** Urutan kunci selalu tetap; nilai kosong/undefined dihapus dari hasil.
 * `lensa` bawaan (`kartu`) dan `varian` bawaan (`komoditas`) juga tidak
 * ditulis, supaya URL tetap bersih. */
export function serialize(params: Partial<WilayahParams>): string {
  const sp = new URLSearchParams();

  for (const kunci of URUTAN_KUNCI) {
    const nilai = params[kunci];
    if (!nilai) continue;
    if (kunci === "lensa" && nilai === LENSA_DEFAULT) continue;
    if (kunci === "varian" && nilai === VARIAN_DEFAULT) continue;
    sp.set(kunci, nilai);
  }

  return sp.toString();
}
