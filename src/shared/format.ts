/**
 * Format angka/tanggal sesuai GLOSSARY.md bagian "Konvensi penulisan".
 * Satu-satunya tempat aturan format ditulis — komponen tidak boleh
 * memformat angka/tanggal sendiri.
 */

/** Koma desimal + titik ribuan, mis. `72,4` dan `1.248`. */
export function formatAngka(n: number, maksDesimal = 3): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: maksDesimal,
  }).format(n);
}

/** Persen menempel ke angkanya, mis. `68%`. */
export function formatPersen(n: number): string {
  return `${formatAngka(n)}%`;
}

/** Satuan dipisah spasi dari angkanya, mis. `3,2 km`. */
export function formatSatuan(n: number, satuan: string): string {
  return `${formatAngka(n)} ${satuan}`;
}

/** Tabel bulan 3 huruf sendiri — `toLocaleDateString` menghasilkan "Agt", GLOSSARY menuntut "Agu". */
const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
] as const;

const REGEX_ISO_TANGGAL = /^(\d{4})-(\d{2})-(\d{2})/;

/** Tanggal ringkas dari ISO `YYYY-MM-DD`, mis. `24 Agu 25`. Format tak dikenal
 * atau bulan di luar 1–12 → "—" alih-alih "undefined undefined 0". */
export function formatTanggal(iso: string): string {
  const cocok = REGEX_ISO_TANGGAL.exec(iso);
  if (!cocok) return "—";

  const [, tahunStr, bulanStr, tanggalStr] = cocok;
  const bulan = Number(bulanStr);
  if (bulan < 1 || bulan > 12) return "—";

  return `${Number(tanggalStr)} ${NAMA_BULAN[bulan - 1]} ${tahunStr.slice(-2)}`;
}

/** "—" untuk null/undefined saja — nol bukan kosong, tetap tampil "0".
 * Angka selalu lewat `formatAngka` supaya format GLOSSARY (koma desimal,
 * titik ribuan) ikut berlaku, bukan `String(nilai)` mentah. */
export function strip(nilai: string | number | null | undefined): string {
  if (nilai === null || nilai === undefined) return "—";
  if (typeof nilai === "number") return formatAngka(nilai);
  return String(nilai);
}
