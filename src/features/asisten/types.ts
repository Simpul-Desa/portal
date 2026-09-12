/**
 * `POST /api/chat` adalah satu-satunya rute fase ini dengan skema OpenAPI
 * sungguhan (bukan `dict[str, Any]`), jadi tipenya diambil langsung dari
 * `components` — pengecualian sadar dan satu-satunya di seluruh dasbor. Di
 * tempat lain tipe respons datang lewat `DataDari` (`lib/api/endpoints.ts`);
 * `DataDari` hanya mengekstrak respons metode GET, jadi tidak bisa dipakai
 * untuk rute POST ini. Jangan membaca impor `components` di sini sebagai
 * kelalaian pola — ini keputusan Task 4 rencana fase 6.
 */

import type { components } from "@/lib/api/openapi";
import type { Lensa, Varian } from "@/lib/url-state";

export type PesanChat = components["schemas"]["Pesan"]; // {role, isi}
export type JawabanChat = components["schemas"]["DataJawaban"];
export type JejakFungsi = components["schemas"]["JejakFungsi"];

/** Satu giliran percakapan di layar. Bentuknya sengaja SATU objek untuk
 * kedua peran supaya `keMessages` cukup memetik `{role, isi}` tanpa
 * penyempitan union. `jejak`/`peringatan` hanya terisi pada `role: "model"`. */
export type Giliran = {
  role: PesanChat["role"];
  isi: string;
  jejak?: readonly JejakFungsi[];
  peringatan?: readonly string[];
};

/** Parameter URL tujuan satu baris jejak — dikonsumsi `bukaTujuan`. */
export type TujuanJejak = {
  lensa: Lensa;
  prov?: string;
  kab?: string;
  desa?: string;
  varian?: Varian;
  target?: string;
  jalur?: string;
};

/** Satu baris siap render di blok "Sumber jawaban". */
export type BarisJejak = {
  /** Nama alat mentah — kunci React dan penanda alat yang belum dikenal. */
  fungsi: string;
  /** Label GLOSSARY, atau nama mentah bila alatnya belum dikenal. */
  label: string;
  /** Ringkasan argumen yang sudah aman ditampilkan. Kosong = tanpa baris kedua. */
  rincian: string;
  sukses: boolean;
  /** `null` = baris tidak bertautan (bukan lensa, argumen cacat, atau gagal). */
  tujuan: TujuanJejak | null;
  /** Argumen asli keluaran model untuk ditampilkan sebagai blok JSON. */
  argumenMentah: Record<string, unknown>;
};
