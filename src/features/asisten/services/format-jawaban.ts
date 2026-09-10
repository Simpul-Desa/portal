/**
 * Formatter minimal buatan sendiri (keputusan user 10 September 2026 § 3):
 * teks jawaban `POST /api/chat` diratakan jadi blok paragraf/butir yang
 * dirender komponen — nol dependensi, nol `dangerouslySetInnerHTML`. Sumber
 * teks bisa berasal dari LLM yang membaca konten eksternal (hasil alat
 * `berita_desa` adalah hasil scraping), jadi keluarannya SELALU struktur
 * data, tidak pernah HTML.
 *
 * Urutan aturan MENGIKAT (Task 8 GOTCHA 3): penanda tebal/miring dibuang
 * SEBELUM baris dikenali sebagai butir. Terbalik, `**Sukarame** — desil 9`
 * terbaca sebagai butir berisi `*Sukarame** — desil 9`.
 */

export type BlokJawaban = { jenis: "paragraf"; teks: string } | { jenis: "butir"; butir: string[] };

/** Pagar judul markdown (`#` sampai `######`) di awal baris — kata-katanya
 * tetap, hanya pagarnya dibuang. */
const REGEX_PAGAR = /^\s*#{1,6}\s+/;

/** Penanda butir (`-`, `*`, `•`) di awal baris, sesudah pagar dan tebal
 * dibuang — Task 8 aturan 3. */
const REGEX_BUTIR = /^\s*[-*•]\s+/;

/** Penanda miring markdown satu bintang (`*teks*`). Dibuang SESUDAH butir
 * dikenali, kalau tidak `* Sukarame` kehilangan penanda butirnya.
 *
 * Garis bawah tunggal (`_teks_`) SENGAJA tidak ikut dibuang: kode target sel
 * Citra Potensi Desa berbentuk `kom_prov_horti_01`, dan pola pasangan garis
 * bawah akan memakan potongan di tengahnya. Bintang tidak pernah muncul di
 * identifier mana pun yang dikirim `api/`.
 *
 * Ditemukan lewat uji terhadap `api/` lokal, bukan tes unit: Gemini
 * mengirim `*(Catatan: keyakinan rendah)*` dan bintangnya sampai ke layar. */
const REGEX_MIRING = /\*([^*\n]+)\*/g;

/** Backtick markdown (`kode`). Dibuang seperti penanda miring: DESIGN.md
 * tidak punya gaya kode sebaris di dalam jawaban chat, dan backtick mentah
 * di layar hanya bising. Isinya (kode BPS, nama kolom) tetap utuh. */
const REGEX_BACKTICK = /`([^`\n]+)`/g;

/** Baris yang seluruhnya penanda garis horizontal markdown (`---`, `***`,
 * `___`) atau pagar blok kode (```` ``` ````). Dibuang seluruhnya: DESIGN.md
 * § Shapes menetapkan hairline sebagai satu-satunya pembatas, dan garis itu
 * milik bingkai kartu, bukan teks jawaban. */
const REGEX_GARIS = /^\s*(?:-{3,}|\*{3,}|_{3,}|`{3,})\s*$/;

function hapusPenanda(teks: string): string {
  return teks.replace(REGEX_MIRING, "$1").replace(REGEX_BACKTICK, "$1");
}

export function formatJawaban(teks: string): BlokJawaban[] {
  const hasil: BlokJawaban[] = [];
  let butirAktif: string[] | null = null;

  for (const barisMentah of teks.split("\n")) {
    // Garis horizontal diperiksa pada baris MENTAH, sebelum `**`/`__`
    // dibuang di bawah: `___` akan menyusut jadi `_` kalau diperiksa
    // sesudahnya dan lolos sebagai paragraf berisi satu garis bawah.
    if (REGEX_GARIS.test(barisMentah)) {
      butirAktif = null;
      continue;
    }

    // Aturan 2: pagar judul dan penanda tebal/miring dibuang DULU, baru
    // baris dikenali sebagai butir (aturan 3) — kata-katanya tetap, spasi
    // ganda DI DALAM baris tidak dirapatkan (Task 8 GOTCHA 2).
    const bersih = barisMentah.replace(REGEX_PAGAR, "").replaceAll("**", "").replaceAll("__", "");
    const trimmed = bersih.trim();

    if (trimmed === "") {
      // Baris kosong menutup blok butir yang sedang berjalan dan memisahkan
      // paragraf (aturan 5); baris kosong beruntun tidak menghasilkan apa-apa
      // lagi sesudah yang pertama (aturan 6).
      butirAktif = null;
      continue;
    }

    const cocokButir = REGEX_BUTIR.exec(bersih);
    if (cocokButir) {
      const isiButir = hapusPenanda(bersih.slice(cocokButir[0].length).trim());
      if (butirAktif) {
        butirAktif.push(isiButir);
      } else {
        butirAktif = [isiButir];
        hasil.push({ jenis: "butir", butir: butirAktif });
      }
      continue;
    }

    // Baris bernomor (`1. `, `2) `) TETAP paragraf, nomornya utuh (aturan 4)
    // — tidak butuh cabang terpisah, karena baris berawal digit tidak pernah
    // cocok `REGEX_BUTIR`. Paragraf berurutan tidak digabung (aturan 5): tiap
    // baris non-butir jadi bloknya sendiri.
    butirAktif = null;
    hasil.push({ jenis: "paragraf", teks: hapusPenanda(trimmed) });
  }

  return hasil;
}
