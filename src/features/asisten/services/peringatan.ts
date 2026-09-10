/**
 * Pemetaan kode `peringatan` `POST /api/chat` (rencana fase 6 § "Tujuh kode
 * `peringatan` yang mungkin datang") jadi kalimat siap-tampil. Satu modul
 * dipakai satu tempat, mengikuti pola `lib/api/galat-ui.ts`: pemetaan
 * kode/status → kalimat Indonesia terkumpul di satu berkas, bukan tersebar
 * di komponen.
 *
 * Kalimat di `PESAN` masih draf — dipoles skill `/humanizer` di Blok D
 * (Task 26) tanpa mengubah kode atau perilaku fungsi ini.
 */

/** Kalimat siap-tampil untuk kode yang MENGUBAH ARTI jawaban (keputusan user
 * 10 September 2026 § 4). */
const PESAN: Record<string, string> = {
  PUTARAN_ALAT_HABIS: "Jawaban ini berhenti sebelum semua data terkumpul.",
  ANGKA_TANPA_ASAL: "Ada angka di jawaban ini yang tidak muncul di daftar sumber.",
};

/** Sinyal internal: dicatat `api/`, tidak dibawa ke pembaca.
 * `JAWABAN_KOSONG` sengaja masuk sini — `api/` SUDAH mengganti seluruh teks
 * jawaban dengan kalimat permintaan maaf (`constants.py` `TEKS_JAWABAN_KOSONG`),
 * jadi memberi tahu pengguna dua kali adalah pengulangan, bukan transparansi. */
const INTERNAL = new Set(["SUSPEK_INJEKSI", "SUSPEK_INJEKSI_ALAT", "BOCOR_PROMPT", "MARKUP_DIBUANG", "JAWABAN_KOSONG"]);

/**
 * Pisahkan kode `peringatan` jadi kalimat siap-tampil (`kalimat`) dan kode
 * asing yang tampil mentah (`kodeAsing`) — kode internal dibuang seluruhnya.
 * Kedua daftar di-dedupe: server bisa menambah kode yang sama tiap putaran
 * alat.
 */
export function peringatanTampil(kode: readonly string[]): { kalimat: string[]; kodeAsing: string[] } {
  const kalimat: string[] = [];
  const kodeAsing: string[] = [];
  const kalimatTerlihat = new Set<string>();
  const kodeAsingTerlihat = new Set<string>();

  for (const satu of kode) {
    if (INTERNAL.has(satu)) continue;

    const pesan = PESAN[satu];
    if (pesan) {
      if (!kalimatTerlihat.has(pesan)) {
        kalimatTerlihat.add(pesan);
        kalimat.push(pesan);
      }
      continue;
    }

    if (!kodeAsingTerlihat.has(satu)) {
      kodeAsingTerlihat.add(satu);
      kodeAsing.push(satu);
    }
  }

  return { kalimat, kodeAsing };
}
