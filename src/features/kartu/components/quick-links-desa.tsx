import { ArrowUpRightIcon, CitraIcon, JalurIcon, KembarIcon } from "@/shared/components/icons";

type LensaTautan = "desa-kembar" | "citra-potensi" | "jalur-ekonomi";

type QuickLinksDesaProps = {
  onPilihLensa: (lensa: LensaTautan) => void;
};

const DAFTAR_TAUTAN: Array<{
  id: LensaTautan;
  label: string;
  sublabel: string;
  Icon: typeof KembarIcon;
}> = [
  {
    id: "desa-kembar",
    label: "Desa Kembar",
    sublabel: "Bandingkan desa serupa",
    Icon: KembarIcon,
  },
  {
    id: "citra-potensi",
    label: "Citra Potensi",
    sublabel: "Analisis satelit & lahan",
    Icon: CitraIcon,
  },
  {
    id: "jalur-ekonomi",
    label: "Jalur Ekonomi",
    sublabel: "Poros koridor pasar",
    Icon: JalurIcon,
  },
];

/**
 * Quick link 3 fitur pelengkap: Desa Kembar, Citra Potensi, dan Jalur Ekonomi.
 * Menjaga UI tetap ringkas dengan estetika minimalis dan interaksi borderless-by-default.
 */
export function QuickLinksDesa({ onPilihLensa }: QuickLinksDesaProps) {
  return (
    <section aria-label="Tautan Cepat Fitur Wilayah">
      <div className="grid grid-cols-3 gap-2">
        {DAFTAR_TAUTAN.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onPilihLensa(item.id)}
            className="group flex flex-col justify-between rounded-inset bg-surface p-3 text-left border border-transparent hover:border-line-strong hover:bg-float transition-all duration-200 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="flex size-7 items-center justify-center rounded-full bg-float text-ink group-hover:text-primary transition-colors">
                <item.Icon className="size-4" />
              </div>
              <ArrowUpRightIcon className="size-3.5 text-muted opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
            <div className="mt-2.5 min-w-0">
              <p className="truncate text-title-sm font-medium text-ink group-hover:text-primary transition-colors">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-micro text-muted">
                {item.sublabel}
              </p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
