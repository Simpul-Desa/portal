/**
 * `panel-insight` (Task 24, seksi 4) — satu-satunya blok gelap di layar
 * (DESIGN.md: "At most one per screen"). Teks apa adanya dari
 * `rekomendasi_aksi`, tanpa olahan klien. Token teks putih di atas
 * `surface-dark` memakai `text-white` bawaan Tailwind, BUKAN hex baru —
 * `globals.css` belum mengalirkan token `on-dark` DESIGN.md (nilainya
 * `#ffffff`, sama persis dengan `white` bawaan); layak ditambahkan token
 * eksplisit saat DESIGN.md dibarui (Task 26).
 *
 * Padding + header row (review Blok D #15) mengikuti spec `panel-insight`
 * persis: `12px 16px` (`py-3 px-4`), lalu penanda SUMBER rekomendasi
 * ("Aturan tetap" — GLOSSARY: dirakit mesin aturan tetap, bukan LLM)
 * diikuti label putih.
 *
 * ISI HIJAU BADGE DIBUANG, 10 September 2026 (tinjauan pra-commit temuan
 * A2). Docstring versi lama mengklaim `positive-deep` "lolos" kontras untuk
 * teks badge. Diukur: putih di `#2c905a` = 4,00:1, sementara `text-badge`
 * 11px menuntut 4,5:1 dan tidak dapat pengecualian ukuran (batasnya 18,66px
 * tebal atau 24px). `ink` di warna yang sama justru lebih buruk, 3,20:1 —
 * jadi tidak ada warna teks yang menyelamatkan isi `positive-deep` pada
 * ukuran ini.
 *
 * Yang dipakai sekarang adalah aturan sistem yang sudah ada, disesuaikan ke
 * ground GELAP: warna menumpang di titik, kata-katanya terbaca. Di atas
 * `deep` `#323232` putih mengukur 12,82:1 dan titik `positive` `#31a863`
 * mengukur 4,22:1 — jauh di atas ambang 3:1 untuk penanda non-teks. Pola
 * `status-chip` berlatar `surface-inset` (obat untuk badge serupa di ground
 * TERANG) sengaja tidak dipakai di sini: pil nyaris putih di dalam
 * satu-satunya blok gelap di layar akan menjadi benda paling terang dan
 * menarik mata ke tempat yang salah.
 */
export function SeksiRekomendasi({ teks }: { teks: string }) {
  return (
    <section className="rounded-inset bg-deep px-4 py-3">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 text-badge text-white">
          <span className="size-1.5 shrink-0 rounded-full bg-positive" aria-hidden="true" />
          Aturan tetap
        </span>
        <p className="text-label text-white">Rekomendasi Aksi</p>
      </div>
      <p className="mt-2 text-body-md text-white">{teks}</p>
    </section>
  );
}
