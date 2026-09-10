/**
 * Nama berkas dan penyimpanan unduhan Laporan Desa.
 *
 * `namaLaporan` murni (diuji Vitest). `simpanBerkas` menyentuh DOM dan TIDAK
 * diuji — environment Vitest proyek ini `node`, tanpa `document`. Karena itu
 * ia dijaga sekecil mungkin: nol cabang, nol keputusan.
 */

/**
 * Nama berkas unduhan. Dibangun di klien, BUKAN dibaca dari
 * `Content-Disposition`: header itu tidak terbaca lintas origin (`api/`
 * tidak mengirim `Access-Control-Expose-Headers`). Nilainya sudah dikunci
 * kontrak PRD `api/` §5.
 */
export function namaLaporan(iddesa: string): string {
  return `laporan-desa-${iddesa}.pdf`;
}

/** Simpan `blob` sebagai unduhan bernama `nama`. */
export function simpanBerkas(blob: Blob, nama: string): void {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = nama;
  document.body.append(tautan);
  tautan.click();
  tautan.remove();
  URL.revokeObjectURL(url);
}
