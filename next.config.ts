import type { NextConfig } from "next";

/**
 * Header keamanan lapis kedua. ADR-0017 menetapkan sesi SENGAJA dapat
 * dibaca klien (token disimpan di tempat yang bisa diakses skrip halaman),
 * jadi header di sini adalah satu-satunya pertahanan tambahan terhadap
 * clickjacking dan injeksi konten pihak ketiga — bukan pelengkap opsional.
 *
 * `script-src` SENGAJA tidak dipasang: bootstrap hidrasi Next butuh nonce
 * per-permintaan yang belum ada di proyek ini; menambahkan `script-src`
 * ketat tanpa nonce mematikan hidrasi. Ketiga host pihak ketiga (`img-src`,
 * `font-src`) dikonfirmasi dari `src/lib/map/basemap.ts` — Esri World
 * Imagery, tile OSM cadangan, dan glyph demo MapLibre. `worker-src blob:`
 * wajib untuk worker MapLibre; `img-src blob:` wajib untuk unduhan PDF
 * Laporan Desa (`src/features/laporan/services/unduh.ts`).
 */
/** Host pihak ketiga peta, dikonfirmasi dari `src/lib/map/basemap.ts`. */
const HOST_PETA = [
  "https://server.arcgisonline.com",
  "https://tile.openstreetmap.org",
  "https://demotiles.maplibre.org",
];

/**
 * Dibaca saat BUILD, bukan runtime — CSP disematkan ke header respons, jadi
 * env yang kosong di mesin build menghasilkan `connect-src` yang memblokir
 * `api/` dan Supabase TANPA satu pun galat build. Gagal berisik di sini jauh
 * lebih murah daripada aplikasi hidup yang setiap permintaannya ditolak
 * peramban.
 */
function asalWajib(nama: string): string {
  const nilai = process.env[nama];
  if (!nilai) {
    throw new Error(
      `${nama} belum disetel. CSP menyematkan asal ini ke header saat build; tanpa nilainya, permintaan ke sana diblokir peramban di produksi.`,
    );
  }
  return new URL(nilai).origin;
}

function asalOpsional(nilai?: string): string {
  if (!nilai) return "";
  try {
    return new URL(nilai).origin;
  } catch {
    return "";
  }
}

const CSP = [
  "default-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'none'",
  "object-src 'none'",
  // `blob:` untuk jalur cadangan `arrayBufferToImage` MapLibre, yang
  // membungkus tile jadi blob URL saat `createImageBitmap` tidak tersedia.
  `img-src 'self' data: blob: ${HOST_PETA.join(" ")}`,
  "font-src 'self'",
  "worker-src 'self' blob:",
  "style-src 'self' 'unsafe-inline'",
  // `script-src` WAJIB ditulis eksplisit, dan itu pelajaran mahal (temuan
  // Blok G, terbukti di peramban). Rencana fase 9 menyuruh TIDAK memasang
  // `script-src` supaya bootstrap hidrasi Next tidak terganggu — keliru:
  // saat `script-src` absen, `default-src 'self'` yang mengisi tempatnya,
  // dan `'self'` tidak mengizinkan skrip INLINE. Akibatnya kelima skrip
  // inline Next diblokir, aplikasi tidak terhidrasi sama sekali (nol canvas
  // peta, nol `<main>`), sementara keempat gerbang tetap hijau. Konsolnya
  // berbunyi: "Executing inline script violates the following Content
  // Security Policy directive 'default-src 'self''… Note also that
  // 'script-src' was not explicitly set, so 'default-src' is used as a
  // fallback."
  //
  // `'unsafe-inline'`, BUKAN nonce, dan itu keputusan sadar dengan harga
  // yang diakui. Nonce menuntut header CSP dibangkitkan per permintaan
  // lewat proxy/middleware, dan itu memaksa setiap rute dirender on demand
  // — sementara PRD §8 menuntut `/` dan `/admin` tetap prerender statis.
  // Hash juga ditolak: isi skrip inline Next berubah tiap build, jadi
  // daftar hash harus dibangkitkan ulang setiap kali dan pasti tertinggal.
  //
  // Yang HILANG karena ini: CSP di sini bukan pertahanan XSS. Yang MASIH
  // berlaku dan tetap bernilai: `frame-ancestors 'none'` (clickjacking pada
  // tombol Keluar dan `<select>` peran), `base-uri 'none'`, `object-src
  // 'none'`, dan `connect-src` yang membatasi ke mana token Bearer bisa
  // dikirim. Menaikkannya ke nonce adalah pekerjaan tersendiri, bersama
  process.env.NODE_ENV === "production"
    ? "script-src 'self' 'unsafe-inline'"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  // GOTCHA yang hampir mematikan peta (temuan review gelombang 1): tile
  // raster DAN glyph MapLibre dimuat lewat `getArrayBuffer`, yaitu `fetch` —
  // lihat `maplibre-gl-dev.mjs:1342` (tile) dan `:1626` (glyph). Jadi ketiga
  // host itu WAJIB ada di `connect-src`, bukan cukup di `img-src` dan
  // `font-src`. Tanpa ini peta tidak menggambar satu piksel pun dan konsol
  // penuh pelanggaran CSP, sementara build tetap hijau.
  `connect-src 'self' ${asalWajib("NEXT_PUBLIC_API_URL")} ${asalWajib("NEXT_PUBLIC_SUPABASE_URL")} ${asalOpsional(process.env.NEXT_PUBLIC_PORTAL_URL)} ${asalOpsional(process.env.NEXT_PUBLIC_DOCS_URL)} ${HOST_PETA.join(" ")}`.replace(/\s+/g, " ").trim(),
].join("; ");

const nextConfig: NextConfig = {
  /* config options here */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: CSP },
        ],
      },
    ];
  },
};

export default nextConfig;
