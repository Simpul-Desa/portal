# Portal SIMPUL DESA

Portal adalah dasbor web pengguna SIMPUL DESA (DATATHON 2026 — Sistem
Intelijen Potensi dan Kesiapan Ekonomi Desa): satu shell peta dengan lima
lensa fitur di atas layanan backend terpisah. Nilai yang tampil di panel dan
di peta adalah nilai yang dikirim backend apa adanya — repo ini tidak
menghitung ulang angka domain apa pun.

Repo ini adalah modul Portal, satu dari empat modul SIMPUL DESA (DATATHON 2026 — Sistem
Intelijen Potensi dan Kesiapan Ekonomi Desa):

| Modul | Repo | Peran |
|---|---|---|
| Portal | [Simpul-Desa/portal](https://github.com/Simpul-Desa/portal) | dasbor web pengguna |
| API | [Simpul-Desa/api](https://github.com/Simpul-Desa/api) | layanan backend yang menyajikan seluruh endpoint |
| Data | [Simpul-Desa/data](https://github.com/Simpul-Desa/data) | panen data dan pemodelan |
| Dokumentasi | [Simpul-Desa/docs](https://github.com/Simpul-Desa/docs) | situs dokumentasi project SIMPUL DESA |

## Status

Shell dasbor lengkap: rail navigasi, panel kiri yang bisa diubah lebar dan
dilipat, panggung peta MapLibre, dan panel Asisten Desa, dalam satu tata
letak empat kolom. Kelima lensa (lihat bagian Lima lensa di bawah) sudah
merender panel dan bentuk petanya masing-masing. Autentikasi lewat Supabase
menggerbang lima peran (`anonim`, `tamu`, `pemerintah`, `swasta`, `admin`) di
sisi antarmuka; ada halaman Admin terpisah untuk peran admin. Fitur Asisten
Desa (chat), Berita Desa, dan Laporan Desa (unduh PDF) masing-masing sudah
punya folder fitur sendiri dengan komponen, hook, dan service.

Uji: 324 lulus di 28 berkas. `npx tsc --noEmit`, `npx eslint src`, dan
`npm run build` bersih di kondisi repo saat ini — nol galat, nol peringatan.

Satu catatan jujur soal lint: `npm run lint` menjalankan ESLint atas seluruh
folder, termasuk dua berkas worker MapLibre terminifikasi yang disalin ke
`public/` oleh `sync:maplibre-worker`. Keduanya kode vendor dan menghasilkan
±1.080 peringatan gaya yang bukan milik repo ini. Yang dipakai sebagai
gerbang karena itu `npx eslint src`.

## Mulai cepat

Prasyarat: Node.js dan npm.

```bash
npm install
cp .env.example .env.local
```

Isi `.env.local`:

| Variabel | Isi |
|---|---|
| `NEXT_PUBLIC_API_URL` | alamat layanan backend, mis. `http://localhost:8000` |
| `NEXT_PUBLIC_PORTAL_URL` | alamat portal web dasbor, mis. `http://localhost:3000` |
| `NEXT_PUBLIC_DOCS_URL` | alamat situs dokumentasi/panduan, mis. `http://localhost:3001` |
| `NEXT_PUBLIC_SUPABASE_URL` | URL proyek Supabase |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | kunci publishable Supabase (`sb_publishable_…`) — bukan kunci anon JWT lama, bukan `service_role` |


Backend harus bisa diakses di alamat `NEXT_PUBLIC_API_URL` sebelum dasbor
bisa memuat data apa pun — Portal murni klien, tidak menyimpan salinan data
sendiri.

```bash
npm run dev
```

Buka `http://localhost:3000`.

`npm run dev` dan `npm run build` otomatis menjalankan skrip
`sync:maplibre-worker` lebih dulu (hook `predev`/`prebuild`). Skrip itu
menyalin `maplibre-gl-worker.mjs` dan `maplibre-gl-shared.mjs` dari
`node_modules/maplibre-gl/dist/` ke `public/`, lalu `src/lib/map/basemap.ts`
menunjuk worker itu secara manual lewat `setWorkerUrl("/maplibre-gl-worker.mjs")`.
Alasannya: resolusi worker bawaan MapLibre menurunkan URL-nya dari
`import.meta.url` modul MapLibre sendiri, tapi di bawah Turbopack nilai itu
menunjuk URL chunk Next, bukan berkas worker sungguhan. Worker mati saat
lahir tanpa satu pun galat di konsol, dan seluruh layer GeoJSON (lingkaran
berjenjang, batas desa) tidak pernah tergambar — basemap raster tetap tampil
karena jalurnya tidak lewat worker, sehingga kegagalannya mudah tidak
disadari tanpa penunjukan manual ini.

## Peta folder

```
src/
├── app/         rute Next.js App Router — tiap page.tsx adalah satu rute
├── features/    satu folder per fitur produk: komponen, hook, service, types
├── shared/      komponen dan hook dipakai lebih dari satu fitur (shell, blok keadaan, dst.)
├── core/        akses lintas aplikasi: sesi, matriks peran, provider React, konfigurasi
└── lib/         logika murni tanpa JSX: klien fetch, ekspresi peta, parsing state URL
```

Rute yang ada: `/` (dasbor), `/admin` (Halaman Admin), `/masuk` dan `/daftar`
(autentikasi).

Aturan penempatan komponen: komponen milik satu fitur hidup di
`features/<fitur>/components/`; begitu dipakai lebih dari satu fitur, ia
pindah ke `shared/components/`. Logika tanpa tampilan yang dipakai lintas
fitur (klien API, ekspresi MapLibre, parsing `?lensa=` dkk.) hidup di `lib/`.
State dan konfigurasi lintas aplikasi — sesi pengguna, matriks akses,
provider React — hidup di `core/`.

## Lima lensa

Urutan dan nama persis seperti di rail navigasi:

1. **Peta Peran** — panel: ringkasan kabupaten/provinsi, filter zona, dan
   daftar desa berpaginasi dengan detail per desa. Peta: choropleth desa
   diwarnai per zona, dengan garis batas zona di atasnya.
2. **Kartu Ekonomi Desa** — panel: kartu satu desa penuh (entitas, zona,
   potensi, kesiapan, dan seksi lain), atau ajakan memilih desa bila belum
   ada yang dipilih. Peta: geo dasar apa adanya, tanpa lapisan tambahan —
   bentuk peta yang dipakai lensa lain sebagai bawaan.
3. **Jalur Ekonomi** — panel: pemilih varian (komoditas, gudang Kopdes, cold
   storage, wisata), daftar jalur, dan detail satu jalur terpilih. Peta:
   garis dari Desa Poros ke setiap desa anggota jalurnya.
4. **Desa Kembar** — panel: daftar desa paling mirip dengan desa acuan, dan
   kartu banding dua desa saat salah satunya dipilih. Peta: sorotan warna
   pada desa kembar yang dipilih.
5. **Citra Potensi Desa** — panel: pemilih sel subsektor/komoditas dan
   daftar skor desa dalam sel itu. Peta: choropleth desa diwarnai skor 0–100.

## Empat fitur tambahan

Di luar lima lensa dasbor (fitur utama), empat fitur tambahan terintegrasi di Portal:

1. **Asisten Desa** — antarmuka percakapan yang menjawab hanya dari data SIMPUL DESA, dan menolak topik di luar itu (panel sisi kanan dasbor).
2. **Berita Desa** — berita per desa hasil panen otomatis, tersimpan per `iddesa`, tampil di Kartu Ekonomi Desa.
3. **Laporan Desa** — dokumen PDF per desa yang memuat sekurangnya Peta Peran dan Kartu Ekonomi Desa (tombol unduh PDF).
4. **Halaman Admin** — kelola penyegaran berita, daftar pengguna, kenaikan peran, dan status sistem (halaman khusus di rute `/admin`).

## Arsitektur

Shell terdiri dari empat bagian dalam satu baris: rail navigasi, panel kiri
(bisa diubah lebar, bisa dilipat ke rail), panggung peta, dan panel Asisten
Desa. Wilayah dan lensa yang sedang dibuka hidup di parameter URL
(`?lensa=&prov=&kab=&desa=`, plus parameter per lensa seperti `?zona=` atau
`?varian=`), diparsing lewat `src/lib/url-state.ts` — jadi setiap tampilan
bisa dibagikan lewat tautan apa adanya.

Pengambilan data lewat TanStack Query, di atas klien fetch sadar-amplop
(`src/lib/api/client.ts`) yang menegakkan satu bentuk respons dari backend:
`{sukses, data, galat, meta}`. Tipe responsnya (`src/lib/api/openapi.d.ts`)
dibangkitkan dari skema OpenAPI backend lewat `npm run generate:api-types`
dan ikut ter-commit, bukan ditulis tangan.

Peran pengguna (`src/core/akses.ts`) menggerbang tampilan di sisi
antarmuka saja — tombol dan lensa yang terkunci hanya menyembunyikan
tampilan; penegakan yang sesungguhnya ada di sisi backend, bukan di kode
ini.

## Keadaan dan aksesibilitas

Setiap panel yang membaca query TanStack Query memakai satu selektor
keadaan yang sama (`src/shared/components/keadaan.ts`): `kosong`, `muat`,
`galat`, `tertunda`, atau `isi`. Keadaan `tertunda` menutup celah yang mudah
lolos — permintaan yang dimulai saat koneksi terputus tidak `isLoading`
maupun `isError`, hanya diam tanpa kerangka muat, tanpa pesan, dan tanpa
tombol coba lagi kalau tidak ditangani eksplisit.

Skor Lighthouse untuk aksesibilitas mengukur 100 di kelima lensa dan di
Halaman Admin, diverifikasi langsung di peramban. Token warna, tipografi,
spasi, dan pola komponen yang menopangnya ada di [DESIGN.md](./DESIGN.md).

## Responsif

Empat breakpoint, didefinisikan di DESIGN.md:

- **≥1280px** — tata letak empat kolom penuh.
- **1024–1279px** — panel kiri menyempit ke `400px`.
- **768–1023px** — panel kiri menjadi drawer melayang di atas peta, dengan
  scrim di belakangnya; klik scrim atau tekan Esc untuk melipatnya. Kontrol
  peta yang tertutup panel Asisten dikeluarkan dari urutan Tab, bukan cuma
  disembunyikan, supaya fokus keyboard tidak mendarat pada tombol tak
  terlihat.
- **<768px** — satu kolom. Peta mengambil 45vh bagian atas layar (dengan
  lantai tinggi supaya kontrolnya tidak terpotong di lanskap), panel
  bertumpuk di bawahnya sebagai lembar yang bisa digulir, dan rail berbaring
  menjadi strip mendatar di kaki layar.

## Perintah

| Perintah | Yang diperiksa/dihasilkan |
|---|---|
| `npm run dev` | server pengembangan, `localhost:3000` |
| `npm run build` | build produksi Next.js |
| `npm start` | menjalankan hasil `npm run build` |
| `npm run lint` | ESLint atas seluruh folder (`eslint-config-next` core-web-vitals + typescript). Menyertakan berkas vendor di `public/` — lihat catatan di bagian Status |
| `npx eslint src` | ESLint atas kode repo ini saja; inilah gerbang yang dipakai |
| `npm test` | Vitest, seluruh suite unit/integrasi |
| `npx tsc --noEmit` | pemeriksaan tipe TypeScript tanpa emit |
| `npm run generate:api-types` | membangkitkan ulang `src/lib/api/openapi.d.ts` dari skema OpenAPI backend lokal (`localhost:8000/openapi.json`) — backend harus jalan lokal lebih dulu |
| `npm run sync:maplibre-worker` | menyalin berkas worker MapLibre ke `public/`; berjalan otomatis lewat `predev`/`prebuild` |

## Deploy

Portal adalah aplikasi Next.js standar, bisa dideploy ke host mana pun yang
mendukung Next.js. `NEXT_PUBLIC_API_URL` dan `NEXT_PUBLIC_SUPABASE_URL` wajib
diset di host sebelum build dijalankan — `next.config.ts` membaca keduanya
saat build (bukan saat runtime) untuk menyusun `connect-src` Content-Security-
Policy, dan sengaja menggagalkan build dengan pesan jelas bila salah satu
kosong. Alasannya: CSP disematkan ke header respons saat build, jadi env
kosong menghasilkan build yang lolos tapi memblokir semua permintaan ke
backend dan Supabase di peramban tanpa satu pun galat build — gagal berisik
di sini jauh lebih murah daripada aplikasi hidup yang setiap permintaannya
ditolak diam-diam.

Header keamanan yang dikirim tiap respons: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy:
strict-origin-when-cross-origin`, dan `Content-Security-Policy` (membatasi
`connect-src` ke origin sendiri, backend, Supabase, dan host tile peta;
`frame-ancestors 'none'`; `object-src 'none'`; `base-uri 'none'`).
