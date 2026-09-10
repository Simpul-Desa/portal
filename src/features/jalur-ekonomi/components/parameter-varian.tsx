import type { Varian } from "@/lib/url-state";
import { formatAngka } from "@/shared/format";

type ParameterVarianProps = {
  varian: Varian;
  /** `meta.parameter` dari `useJalurDaftar` — blok `parameter` berkas hasil
   * `api/`, bentuk BERBEDA per varian. `undefined`/`null` saat belum termuat. */
  parameter: Record<string, unknown> | null | undefined;
};

function angka(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function objek(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

/** GLOSSARY § Delapan tema sub-skor — enam subsektor dipakai `SUBSEKTOR` varian Komoditas. */
const NAMA_SUBSEKTOR: Record<string, string> = {
  tp: "Tanaman Pangan",
  horti: "Hortikultura",
  kebun: "Perkebunan",
  ternak: "Peternakan",
  ikan: "Perikanan Budidaya",
  hutan: "Kehutanan",
};

/**
 * Satu baris spek waktu tempuh + volume (`{t_maks, v_min, min_mutlak}`) —
 * bentuk dipakai `SUBSEKTOR` (komoditas, satu per subsektor), `GUDANG`
 * (gudang-kopdes), dan `SPEK` (cold-storage, wisata). Baca DEFENSIF per
 * kunci (`typeof x === "number"`) — bentuk `parameter` berbeda per varian,
 * bukan satu skema tetap (GOTCHA 1 rencana Task 28).
 */
function BarisSpek({ judul, spek }: { judul: string; spek: Record<string, unknown> }) {
  const tMaks = angka(spek.t_maks);
  const vMin = angka(spek.v_min);
  const minMutlak = angka(spek.min_mutlak);

  const bagian: string[] = [];
  if (tMaks !== null) bagian.push(`waktu tempuh maksimum ${formatAngka(tMaks)} menit`);
  if (vMin !== null && minMutlak !== null) {
    bagian.push(`volume minimum ${formatAngka(vMin)} (mutlak ${formatAngka(minMutlak)})`);
  } else if (vMin !== null) {
    bagian.push(`volume minimum ${formatAngka(vMin)}`);
  } else if (minMutlak !== null) {
    bagian.push(`volume minimum mutlak ${formatAngka(minMutlak)}`);
  }
  if (bagian.length === 0) return null;

  return (
    <div className="py-1.5">
      <p className="text-label text-muted">{judul}</p>
      <p className="text-body-md text-ink">{bagian.join(", ")}</p>
    </div>
  );
}

/**
 * `parameter.label`/`parameter.KANDIDAT` artefak membawa istilah solver
 * MENTAH — Inggris (`"Conditional (p,q)-median"`), atau menyebut kandidat
 * yang KALAH (label Wisata masih berbunyi "W5 + bobot v2 terkompresi…" walau
 * kandidat yang MENANG dan dipakai model adalah W6). GLOSSARY § Varian Jalur
 * Ekonomi menamai kandidat terpilih tiap varian secara eksplisit — dipetakan
 * ke situ persis, TIDAK PERNAH string mentah apa adanya (temuan review Jalur
 * Ekonomi #2, HIGH). Komoditas sengaja tidak dipetakan: GLOSSARY tidak
 * menyebut kandidat bernama untuknya (varian ini tanpa biaya buka), dan
 * artefaknya memang tidak membawa kunci `label` sama sekali. Nilai artefak
 * yang tidak cocok dengan yang diketahui (mis. solver berganti label suatu
 * saat) jatuh ke "—" — pola sama seperti `formatTanggal` di
 * `shared/format.ts` untuk masukan yang tidak bisa diformat, bukan
 * `labelTampil` di `daftar-jalur.tsx` (chip status, bukan garis putus).
 */
function labelKandidat(varian: Varian, label: string): string {
  if (varian === "gudang-kopdes" && label === "Biaya buka endogen") {
    return "opsi B, biaya buka endogen";
  }
  if (varian === "cold-storage" && label === "Conditional (p,q)-median") {
    return "K2, median (p,q) berkondisi";
  }
  if (varian === "wisata" && label.startsWith("W5")) {
    return "W6";
  }
  return "—";
}

/**
 * Parameter varian aktif (Task 28) — `card-inset` merender `meta.parameter`
 * apa adanya untuk kunci yang bisa dibaca manusia: `MIN_ANGGOTA`/
 * `MAKS_ANGGOTA`, `t_maks`/`v_min`/`min_mutlak` per subsektor/SPEK, dan nama
 * kandidat (lewat `labelKandidat`, BUKAN `label` mentah). Bentuk dideteksi
 * lewat KUNCI yang ADA (`SUBSEKTOR` vs `GUDANG`/`SPEK`), bukan lewat
 * parameter `varian` terpisah — kode ini tetap benar walau urutan atau nama
 * varian berubah di `api/`; `varian` sendiri HANYA dipakai `labelKandidat`
 * untuk memilih nama GLOSSARY yang benar. Kunci solver (`SKALA`, `DET_*`,
 * `PEKERJA`, `catatan_anggaran`, `V_ROBUST_RULE`, `beta_biaya_buka`, `OPSI`,
 * `KANDIDAT`, dan sisanya) SENGAJA tidak dirender — itu catatan solver,
 * bukan parameter yang dibaca pengguna panel.
 */
export function ParameterVarian({ varian, parameter }: ParameterVarianProps) {
  if (!parameter) return null;

  const minAnggota = angka(parameter.MIN_ANGGOTA);
  const maksAnggota = angka(parameter.MAKS_ANGGOTA);
  const label = typeof parameter.label === "string" ? parameter.label : null;

  const subsektor = objek(parameter.SUBSEKTOR);
  const entriSubsektor = Object.entries(subsektor);
  const specTunggal = objek(parameter.GUDANG ?? parameter.SPEK);
  const punyaSpecTunggal = entriSubsektor.length === 0 && Object.keys(specTunggal).length > 0;

  return (
    <section className="divide-y divide-hairline rounded-inset bg-inset px-3">
      {minAnggota !== null && maksAnggota !== null && (
        <div className="py-1.5">
          <p className="text-label text-muted">Anggota</p>
          <p className="text-body-md text-ink">
            {formatAngka(minAnggota)}–{formatAngka(maksAnggota)} desa
          </p>
        </div>
      )}

      {entriSubsektor.map(([kunci, nilai]) => (
        <BarisSpek key={kunci} judul={NAMA_SUBSEKTOR[kunci] ?? kunci} spek={objek(nilai)} />
      ))}

      {punyaSpecTunggal && <BarisSpek judul="Ketentuan" spek={specTunggal} />}

      {label && (
        <div className="py-1.5">
          <p className="text-label text-muted">Kandidat terpilih</p>
          <p className="text-body-md text-ink">{labelKandidat(varian, label)}</p>
        </div>
      )}
    </section>
  );
}
