"use client";

import { RegionPicker } from "@/shared/components/region-picker";
import { formatAngka } from "@/shared/format";
import { usePusat, useRingkasan } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";

type WilayahState = ReturnType<typeof useWilayahParams>;

type EmptyStateProps = {
  wilayah: Pick<WilayahState, "prov" | "kab" | "pilihProv" | "pilihKab" | "reset">;
};

/**
 * Keadaan tanpa desa terpilih (Task 25): pemilih wilayah (Task 22) + kartu
 * ajakan bernada ajakan, BUKAN galat. Cacah mengikuti TINGKAT AKTIF —
 * kabupaten terpilih → cacah desa kabupaten itu; provinsi terpilih (tanpa
 * kabupaten) → cacah desa+kabupaten provinsi itu; belum ada apa-apa → total
 * `useRingkasan`. Sumber data sudah dimuat di tempat lain (`usePusat` juga
 * dipakai `RegionPicker`/pengendali layer peta) — tidak ada permintaan baru.
 */
export function EmptyState({ wilayah }: EmptyStateProps) {
  const { prov, kab } = wilayah;
  const ringkasan = useRingkasan();
  const pusat = usePusat();

  let cacah: string | null = null;
  if (kab) {
    const k = pusat.data?.kabupaten.find((x) => x.idkab === kab);
    if (k) cacah = `${formatAngka(k.n_desa)} desa`;
  } else if (prov) {
    const p = pusat.data?.provinsi.find((x) => x.idprov === prov);
    if (p) cacah = `${formatAngka(p.n_desa)} desa • ${formatAngka(p.n_kabupaten)} kabupaten`;
  } else if (ringkasan.data) {
    cacah = `${formatAngka(ringkasan.data.n_desa)} desa • ${formatAngka(ringkasan.data.n_kabupaten)} kabupaten`;
  }

  return (
    <>
      <RegionPicker wilayah={wilayah} />

      <section className="rounded-card bg-surface p-5">
        <p className="text-body-md text-ink">Pilih desa lewat peta atau kolom cari.</p>
        {cacah && <p className="mt-1 text-label text-muted">{cacah}</p>}
      </section>
    </>
  );
}
