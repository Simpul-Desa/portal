import { SparkIcon } from "@/shared/components/icons";

/**
 * Seksi Rekomendasi Aksi:
 * Menggunakan garis (border) bergradasi di seluruh keliling kartu:
 * warna oranye primer di atas yang memudar memutih ke bawah,
 * dengan latar belakang kartu putih dasar (bg-float).
 */
export function SeksiRekomendasi({ teks }: { teks: string }) {
  return (
    <section className="rounded-card p-[1.5px] bg-gradient-to-b from-primary via-primary/30 to-line/40 shadow-2xs">
      <div className="rounded-[22.5px] bg-float p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-primary">
              <SparkIcon className="size-3.5 text-primary fill-primary" />
            </span>
            <h3 className="text-title-sm font-semibold text-ink">Rekomendasi Aksi</h3>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-badge text-primary font-medium">
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            Aturan Tetap
          </span>
        </div>
        <p className="mt-2.5 text-body-md text-ink leading-relaxed font-normal">{teks}</p>
      </div>
    </section>
  );
}
