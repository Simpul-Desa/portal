/**
 * Selektor keadaan murni dipakai semua panel yang membaca query TanStack
 * Query — satu fungsi, satu urutan prioritas, dipakai ulang alih-alih tiap
 * panel menulis cabang `isLoading`/`isError`/`data` sendiri-sendiri.
 *
 * ALASAN keadaan "tertunda" ada: dengan `networkMode: "online"` (bawaan
 * TanStack Query), fetch yang dimulai saat offline mendapat
 * `fetchStatus: "paused"` — jadi `isLoading` bernilai false, `isError` juga
 * false, dan `data` tetap `undefined`. Setiap panel yang hanya bercabang
 * `isLoading → isError → data` merender persegi kosong tanpa kerangka muat,
 * tanpa pesan, dan tanpa tombol coba lagi — bukan galat, bukan berhasil,
 * bukan sedang memuat, hanya diam. Menamai keadaan ini sebagai "tertunda"
 * memberi kata-kata ke persegi yang sebelumnya bisu itu.
 */

export type Keadaan = "muat" | "tertunda" | "galat" | "kosong" | "isi";

type MasukanKeadaan = {
  isPending?: boolean;
  isPaused?: boolean;
  isError?: boolean;
  kosong?: boolean;
};

/**
 * Prioritas TETAP, dalam urutan ini: `galat` menang atas segalanya kecuali
 * tidak ada apa-apa; lalu `tertunda` (fetch offline yang dijeda) menang atas
 * `muat`; lalu `muat`; lalu `kosong`; sisanya `isi`.
 */
export function pilihKeadaan(masukan: MasukanKeadaan): Keadaan {
  if (masukan.isError) return "galat";
  if (masukan.isPaused) return "tertunda";
  if (masukan.isPending) return "muat";
  if (masukan.kosong) return "kosong";
  return "isi";
}
