/**
 * Grafik primitif dipakai lintas fitur — diekstrak dari scratch
 * `panel-charts.tsx` (SOURCE lama: ramp meter baris 29-41, StatusCap baris
 * 91-111) supaya bisa dipakai ulang dengan props alih-alih data contoh.
 */

/** Tinggi meter dalam px — DESIGN.md `ramp-meter.height` (varian "kecil"
 * dipakai 8 `sub_skor` Task 24, belum diformalkan sebagai token). */
const TINGGI: Record<"penuh" | "kecil", number> = { penuh: 36, kecil: 20 };

/** Tick 3px + celah 2px sungguhan lewat mask, bukan 56 `<span flex-1>` yang
 * melar mengikuti lebar kontainer (DESIGN.md `ramp-meter.tickWidth/tickGap`). */
const MASK_TICK = "repeating-linear-gradient(to right, black 0 3px, transparent 3px 5px)";
const GRADIEN_RAMP =
  "linear-gradient(to right, var(--color-ramp-1), var(--color-ramp-2), var(--color-ramp-3), var(--color-ramp-4), var(--color-ramp-5))";

type RampMeterProps = {
  /** Posisi penanda pada skala 0–1 (di luar rentang ini akan dijepit).
   * Opsional: tanpa `nilai`, komponen ini menjadi LEGENDA skala — tick row
   * saja tanpa penanda (dipakai lensa Citra Potensi Desa, DESIGN.md §
   * Map Overlays → Score choropleth). */
  nilai?: number;
  /** Label verdict opsional, tampil rata-kanan di atas meter (pola DESIGN.md). */
  label?: string;
  /** Tinggi meter — "penuh" (36px, bawaan) atau "kecil" (20px, untuk daftar sub_skor). */
  tinggi?: "penuh" | "kecil";
  /** Alternatif teks opsional (Task 23/A15): saat diisi DAN `nilai` ada,
   * wadah meter dibungkus `role="img"` + `aria-label` ini, supaya skor tidak
   * hanya terbaca lewat posisi penanda visual — pemanggil tidak perlu lagi
   * mengingat membungkusnya sendiri di tiap titik pakai (`seksi-potensi.tsx:28`
   * tetap membungkus manual dan tidak berubah). Diabaikan pada varian legenda
   * (`nilai` absen) karena legenda memang tidak punya apa pun untuk diumumkan. */
  ariaLabel?: string;
};

/** Skala kesiapan lima warna dengan penanda posisi — SOURCE `ramp-meter` DESIGN.md. */
export function RampMeter({ nilai, label, tinggi = "penuh", ariaLabel }: RampMeterProps) {
  const posisi = nilai === undefined ? undefined : Math.min(1, Math.max(0, nilai));
  const legenda = posisi === undefined;

  return (
    <div
      role={!legenda && ariaLabel ? "img" : undefined}
      aria-label={!legenda ? ariaLabel : undefined}
      aria-hidden={legenda ? true : undefined}
    >
      {label && <p className="text-right text-label text-body">{label}</p>}
      <div className="relative mt-2" style={{ height: `${TINGGI[tinggi]}px` }}>
        <div
          className="h-full w-full rounded-[1px]"
          style={{
            backgroundImage: GRADIEN_RAMP,
            WebkitMaskImage: MASK_TICK,
            maskImage: MASK_TICK,
          }}
        />
        {posisi !== undefined && (
          <span
            className="absolute top-[-3px] bottom-[-3px] w-[2px] -translate-x-1/2 bg-ink"
            style={{ left: `${posisi * 100}%` }}
          />
        )}
      </div>
    </div>
  );
}

export type StatusCapStatus = "positive" | "caution" | "critical";

/**
 * Status is encoded by shape as well as color: solid for positive, a slotted
 * bar for caution, stacked bars for critical — SOURCE `status-cap` DESIGN.md.
 */
export function StatusCap({ status }: { status: StatusCapStatus }) {
  if (status === "caution") {
    return (
      <span className="flex h-1.5 w-full gap-[2px]">
        <span className="flex-1 rounded-l-[2px] bg-caution" />
        <span className="flex-1 rounded-r-[2px] bg-caution" />
      </span>
    );
  }

  if (status === "critical") {
    return (
      <span className="flex h-1.5 w-full flex-col justify-between">
        <span className="h-[2px] rounded-[1px] bg-critical" />
        <span className="h-[2px] rounded-[1px] bg-critical" />
      </span>
    );
  }

  return <span className="h-1.5 w-full rounded-[2px] bg-positive-deep" />;
}
