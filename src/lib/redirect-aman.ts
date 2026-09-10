/**
 * Sanitasi param `?lanjut=` (tujuan setelah masuk/daftar) — pengaman open
 * redirect, bukan kenyamanan. `lanjut` datang dari URL yang bisa dikirim
 * siapa pun; melewatkannya apa adanya ke `router.replace` membuat halaman
 * masuk jadi batu loncatan phishing.
 */

/**
 * Diperiksa lewat PARSER, bukan lewat prefiks (tinjauan pra-commit fase 1–8,
 * temuan K1). Versi lama memeriksa `startsWith("/")`, `startsWith("//")`, dan
 * `includes("\\")` dengan tangan, dan itu bisa ditembus:
 * `?lanjut=%2F%09%2Fevil.com` men-decode jadi `"/" + TAB + "/evil.com"`, yang
 * lolos ketiga pemeriksaan karena karakter keduanya TAB, bukan slash. Parser
 * URL WHATWG kemudian MEMBUANG TAB/LF/CR sebelum mengurai, sehingga string
 * yang sama menjadi `//evil.com` — URL protokol-relatif — dan peramban
 * mendarat di origin penyerang. Sinknya tiga: `masuk-form.tsx`,
 * `daftar-form.tsx`, dan `use-alihkan-bila-masuk.ts` — yang terakhir menembak
 * di efek mount, jadi pengguna yang SUDAH masuk terlempar keluar tanpa satu
 * klik pun.
 *
 * Karena itu penjaganya kini memakai `new URL` — algoritma yang SAMA dengan
 * yang akan dipakai peramban — lalu mengembalikan hasil NORMALISASINYA,
 * supaya router tidak bisa mengurainya berbeda dari yang sudah diperiksa di
 * sini.
 */

/** Origin uji yang mustahil dimiliki siapa pun; TLD `.invalid` dijamin RFC 2606. */
const ASAL_UJI = "https://tujuan.invalid";

/** Kembalikan `lanjut` HANYA bila ia path absolut yang tetap di origin ini; selain itu `"/"`. */
export function tujuanAman(lanjut: string | null): string {
  if (!lanjut) return "/";

  // Path absolut saja. Tanpa penjaga ini, `"lensa"` (tanpa slash) akan
  // diterima sebagai `/lensa` — aman, tetapi bukan bentuk yang pernah dikirim
  // antarmuka ini, jadi ditolak supaya permukaannya tetap sempit.
  if (!lanjut.startsWith("/")) return "/";

  try {
    const url = new URL(lanjut, ASAL_UJI);
    // Menolak sekaligus: `//evil.com`, `/\evil.com`, TAB/LF/CR yang dibuang
    // parser, dan skema apa pun (`javascript:` menghasilkan origin `"null"`).
    if (url.origin !== ASAL_UJI) return "/";
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return "/";
  }
}
