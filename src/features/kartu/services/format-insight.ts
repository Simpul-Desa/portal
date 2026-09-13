/**
 * Layanan pemformat teks AI Insight:
 * Mengurai data AI Insight (kondisi_ekonomi & rekomendasi_aktor)
 * menjadi paragraf berformat dengan penonjolan kata kunci (bold),
 * tanpa HTML mentah (nol dangerouslySetInnerHTML) demi keamanan.
 */

export type BlokInsight =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] };

const KATA_KUNCI_SOROTAN = [
  "Dana Desa",
  "Desa BISA",
  "Desa Ekspor",
  "Kemitraan Swasta (Logistik)",
  "Kemitraan Swasta",
  "BUMDes",
  "KDMP",
  "Jadesta",
  "Zona Mitra",
  "Zona Tumbuh",
  "Zona Berdaya",
  "Zona Mandiri",
  "Zona Tertinggal",
  "Simpul Logistik",
  "IDM Mandiri",
  "IDM Maju",
  "IDM Berkembang",
  "IDM Tertinggal",
  "IDM Sangat Tertinggal",
  "Mandiri",
  "Maju",
  "Berkembang",
  "Tertinggal",
];

/**
 * Menebalkan kata-kata kunci penting (program pemerintah, zona, peran ekonomi, status IDM)
 * jika belum dalam format bold markdown (**kata**).
 */
export function tebalkanKataKunci(teks: string): string {
  if (!teks) return "";
  let hasil = teks;

  for (const kata of KATA_KUNCI_SOROTAN) {
    const escaped = kata.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(?<!\\*\\*)(\\b${escaped}\\b)(?!\\*\\*)`, "g");
    hasil = hasil.replace(regex, "**$1**");
  }

  // Tebalkan status di dalam tanda petik tunggal, misal 'Maju' -> '**Maju**'
  hasil = hasil.replace(/'([A-Z][a-zA-Z\s]+)'/g, "'**$1**'");

  return hasil;
}

/**
 * Mengurai teks markdown sederhana (paragraf & list bullet) menjadi blok terstruktur.
 */
export function parseTeksInsight(teks: string): BlokInsight[] {
  if (!teks || !teks.trim()) return [];
  const barisDaftar = teks.split("\n");
  const hasil: BlokInsight[] = [];
  let butirAktif: string[] | null = null;

  for (const barisMentah of barisDaftar) {
    const baris = barisMentah.trim();
    if (!baris) {
      if (butirAktif && butirAktif.length > 0) {
        hasil.push({ type: "ul", items: butirAktif });
        butirAktif = null;
      }
      continue;
    }

    if (baris.startsWith("- ") || baris.startsWith("* ") || baris.startsWith("• ")) {
      const itemText = baris.replace(/^[-*•]\s+/, "").trim();
      if (!butirAktif) {
        butirAktif = [];
      }
      butirAktif.push(itemText);
    } else {
      if (butirAktif && butirAktif.length > 0) {
        hasil.push({ type: "ul", items: butirAktif });
        butirAktif = null;
      }
      hasil.push({ type: "p", text: baris });
    }
  }

  if (butirAktif && butirAktif.length > 0) {
    hasil.push({ type: "ul", items: butirAktif });
  }

  return hasil;
}

/**
 * Membersihkan penanda markdown untuk teks ringkasan (preview).
 */
export function stripMarkdown(teks: string): string {
  if (!teks) return "";
  return teks
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/^[-*•]\s+/gm, "")
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/```/g, "")
    .replace(/\n+/g, " ")
    .trim();
}
