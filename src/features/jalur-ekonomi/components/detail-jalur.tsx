import type { Varian } from "@/lib/url-state";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { formatAngka, strip } from "@/shared/format";

import { type JalurTernormalisasi, VARIAN } from "../types";

type DetailJalurProps = {
  varian: Varian;
  jalur: JalurTernormalisasi;
};

/** Badge kecil "poros" pada baris anggota yang `iddesa`-nya sama dengan poros
 * (pola badge `BadgeSumber` — `rounded-xs bg-inset px-2 py-1 text-badge`). */
function ChipPoros() {
  return <span className="ml-2 rounded-xs bg-inset px-1.5 py-0.5 text-badge text-muted">poros</span>;
}

/**
 * Detail satu jalur (Task 32) — dua bagian dipisah `hairline`. Atas: peran
 * poros — "Desa Poros" GLOSSARY, atau "Cold storage eksisting" HANYA bila
 * `varian === "cold-storage"` DAN `!jalur.porosAdalahPeran`. Gerbang varian
 * WAJIB: `normalisasiJalur` juga memakai `porosAdalahPeran: false` sebagai
 * fallback aman untuk grup CACAT (kunci `poros`/`lokasi`/`basis` hilang)
 * pada varian LAIN — tanpa gerbang ini, grup `komoditas`/`gudang-kopdes`/
 * `wisata` yang cacat ikut berlabel "Cold storage eksisting" pada jalur yang
 * bukan cold storage sama sekali. Bawah: tabel berjudul "Desa Sejalur" —
 * atau "Desa dalam jangkauan" untuk bentuk `cs-eksisting`, karena GLOSSARY
 * mendefinisikan Desa Sejalur sebagai desa yang dilayani sebuah DESA POROS;
 * unit yang bukan Desa Poros tidak membuat desa yang dilayaninya jadi Desa
 * Sejalur — keduanya fakta keterlayanan, bukan peran. "Desa dalam jangkauan"
 * dipilih (review Jalur Ekonomi #4d, MEDIUM — sebelumnya "Desa Terlayani",
 * belum terdaftar GLOSSARY) karena disusun dari kata biasa yang sudah
 * dipakai definisi GLOSSARY sendiri untuk konsep ini — "keterlayanan cold
 * storage adalah desa yang berada dalam jangkauan sebuah unit" — bukan
 * istilah baku baru yang bisa disalahpahami setara "Desa Sejalur". Proposal
 * nama baku resmi untuk GLOSSARY dilaporkan terpisah (bukan berkas yang
 * disunting sesi ini).
 *
 * `jalur.nAnggota` (cacah ARTEFAK — `n_anggota`/`n_desa_layanan`/`n_desa`
 * tergantung bentuk grup, dibaca `normalisasiJalur`) dipakai sebagai cacah
 * desa, BUKAN `jalur.anggota.length`: array anggota bisa jatuh ke kosong
 * pada grup yang kunci daftar anggotanya hilang/berganti nama walau artefak
 * sendiri mencatat cacah bukan nol — memakai panjang array pada kasus itu
 * menampilkan "0 desa" yang salah tanpa galat apa pun.
 */
export function DetailJalur({ varian, jalur }: DetailJalurProps) {
  const namaVarian = VARIAN.find((v) => v.slug === varian)?.nama ?? varian;
  const csEksisting = varian === "cold-storage" && !jalur.porosAdalahPeran;
  const judulPeran = csEksisting ? "Cold storage eksisting" : "Desa Poros";
  const judulTabel = csEksisting ? "Desa dalam jangkauan" : "Desa Sejalur";

  return (
    <section className="divide-y divide-hairline rounded-card bg-surface p-5">
      <div className="pb-4">
        <p className="text-label text-muted">{judulPeran}</p>
        <p className="text-title-sm text-ink">{jalur.pusat.nmdesa}</p>
        <p className="text-label text-muted">Kec. {strip(jalur.pusat.nmkec)}</p>
        <p className="mt-2 text-label text-muted">{namaVarian}</p>
        <p className="mt-2 text-label text-muted">{jalur.label}</p>
        <p className="text-body-md text-ink">
          {strip(jalur.bobot)}
          {jalur.unit ? ` ${jalur.unit}` : ""} · {strip(jalur.nAnggota)} desa
        </p>
      </div>

      <div className="pt-4">
        <h3 className="text-title-sm text-ink">{judulTabel}</h3>

        {jalur.anggota.length === 0 ? (
          <p className="mt-2 text-body-md text-muted">Tidak ada desa yang dilayani unit ini</p>
        ) : (
          <div
            className={`mt-2 -mx-5 overflow-x-auto ${FOCUS_RING}`}
            tabIndex={0}
            role="region"
            aria-label={`Tabel ${judulTabel}, gulir mendatar`}
          >
            <table className="w-full text-body-md">
              <thead>
                <tr className="bg-inset text-label text-muted">
                  <th className="px-5 py-2 text-left font-normal">Desa</th>
                  <th className="px-3 py-2 text-right font-normal">Bobot</th>
                  <th className="px-5 py-2 text-right font-normal">Menit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-hairline">
                {jalur.anggota.map((a) => (
                  <tr key={a.iddesa} className="h-11">
                    <td className="px-5 py-2 text-ink">
                      {a.nmdesa}
                      {jalur.porosAdalahPeran && a.iddesa === jalur.pusat.iddesa && <ChipPoros />}
                    </td>
                    <td className="px-3 py-2 text-right text-ink">{strip(a.bobot)}</td>
                    <td className="px-5 py-2 text-right text-ink">
                      {a.menit === null ? strip(a.menit) : `${formatAngka(a.menit, 1)} menit`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
