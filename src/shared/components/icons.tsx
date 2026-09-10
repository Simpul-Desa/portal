type IconProps = {
  className?: string;
};

const BASE = "h-[18px] w-[18px] shrink-0";

function Svg({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`${BASE} ${className ?? ""}`}
    >
      {children}
    </svg>
  );
}

export const GridIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Svg>
);

export const CloudIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 18a4 4 0 0 1 .3-8 5.5 5.5 0 0 1 10.5 1.3A3.4 3.4 0 0 1 17.5 18Z" />
  </Svg>
);

export const BoltIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M13 3 5 14h6l-1 7 8-11h-6Z" />
  </Svg>
);

export const CompassIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m15.5 8.5-2 5-5 2 2-5Z" />
  </Svg>
);

export const SensorIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 15a9 9 0 0 1 14 0" />
    <path d="M8 18a5 5 0 0 1 8 0" />
    <circle cx="12" cy="21" r="0.6" fill="currentColor" />
  </Svg>
);

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 5.5 18 12 8 18.5Z" />
  </Svg>
);

export const LinkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 1 0-5.7-5.7L11.3 7" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 1 0 5.7 5.7L12.7 17" />
  </Svg>
);

export const UsersIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.4M17 14.5a5.5 5.5 0 0 1 3.5 4.5" />
  </Svg>
);

export const DocIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h8l4 4v14H6Z" />
    <path d="M14 3v4h4M9 12h6M9 16h6" />
  </Svg>
);

export const SettingsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.4 1.4m10 10 1.4 1.4m0-12.8-1.4 1.4m-10 10-1.4 1.4" />
  </Svg>
);

export const SearchIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const BellIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18 16H6l1.2-2V10a4.8 4.8 0 0 1 9.6 0v4Z" />
    <path d="M10.5 19a1.8 1.8 0 0 0 3 0" />
  </Svg>
);

export const DotsIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5.5" r="0.9" fill="currentColor" />
    <circle cx="12" cy="12" r="0.9" fill="currentColor" />
    <circle cx="12" cy="18.5" r="0.9" fill="currentColor" />
  </Svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m14 6-6 6 6 6" />
  </Svg>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 9 6 6 6-6" />
  </Svg>
);

export const ChevronUpIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 15 6-6 6 6" />
  </Svg>
);

export const MapPinIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 21s6-5.3 6-10a6 6 0 0 0-12 0c0 4.7 6 10 6 10Z" />
    <circle cx="12" cy="11" r="2.2" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Svg>
);

export const StarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="m12 4 2.3 4.9 5.2.7-3.8 3.7.9 5.3-4.6-2.6-4.6 2.6.9-5.3L4.5 9.6l5.2-.7Z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

export const ExpandIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 4H4v5M15 4h5v5M15 20h5v-5M9 20H4v-5" />
  </Svg>
);

export const ZoomInIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 6v12M6 12h12" />
  </Svg>
);

export const ZoomOutIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 12h12" />
  </Svg>
);

export const LocateIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m20 4-7.5 16-2-6.5L4 11.5Z" />
  </Svg>
);

export const WaveIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8c2.5-2 4.5 2 7 0s4.5 2 7 0M3 13c2.5-2 4.5 2 7 0s4.5 2 7 0M3 18c2.5-2 4.5 2 7 0s4.5 2 7 0" />
  </Svg>
);

export const ThermometerIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 14V5a2 2 0 1 1 4 0v9a4 4 0 1 1-4 0Z" />
    <path d="M4 7h4M4 11h4" />
  </Svg>
);

export const DropletIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5c3 3.8 5 6.4 5 9a5 5 0 0 1-10 0c0-2.6 2-5.2 5-9Z" />
  </Svg>
);

export const GaugeIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="m12 12 4-3" />
  </Svg>
);

export const ArrowUpRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 16 16 8M9 8h7v7" />
  </Svg>
);

export const SunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4" />
  </Svg>
);

export const RainIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6.5 14a4 4 0 0 1 .3-8 5.5 5.5 0 0 1 10.5 1.3A3.4 3.4 0 0 1 17.5 14Z" />
    <path d="M9 17.5 8 20m4-2.5-1 2.5m5-2.5-1 2.5" />
  </Svg>
);

export const DownloadIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14" />
  </Svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m10 6 6 6-6 6" />
  </Svg>
);

/** Peta Peran — matriks dua sumbu, empat kuadran (GLOSSARY §Empat zona penanganan). */
export const PetaPeranIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
    <path d="M12 3.5v17M3.5 12h17" />
  </Svg>
);

/** Kartu Ekonomi Desa — kartu profil dengan strip judul dan satu baris isi. */
export const KartuIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18M7.5 14.5h4" />
  </Svg>
);

/** Jalur Ekonomi — satu Desa Poros menyambung ke dua Desa Sejalur. */
export const JalurIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="5.5" r="2.1" />
    <circle cx="5.5" cy="18.5" r="1.7" />
    <circle cx="18.5" cy="18.5" r="1.7" />
    <path d="M10.6 7.4 6.7 16.8M13.4 7.4l3.9 9.4" />
  </Svg>
);

/** Desa Kembar — dua pin ukuran berbeda, mewakili dua desa yang dibandingkan. */
export const KembarIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7.5" cy="8.3" r="3.3" />
    <path d="M7.5 11.6V19" />
    <circle cx="16.3" cy="12.6" r="2.5" />
    <path d="M16.3 15.1v5.4" />
  </Svg>
);

/** Citra Potensi Desa — grid pembacaan citra satelit, lebih rapat dari Peta Peran. */
export const CitraIcon = (p: IconProps) => (
  <Svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
  </Svg>
);

/** Akun — satu pengguna, beda dari `UsersIcon` (banyak aktor). */
export const AkunIcon = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8.5" r="3.3" />
    <path d="M5 20a7 7 0 0 1 14 0" />
  </Svg>
);

/** Asisten — percik/spark empat titik, dipakai untuk Asisten Desa terkunci. */
export const SparkIcon = (p: IconProps) => (
  <Svg {...p}>
    <path
      d="M12 2 13.6 9.4 21 11 13.6 12.6 12 20 10.4 12.6 3 11 10.4 9.4Z"
      fill="currentColor"
      stroke="none"
    />
  </Svg>
);

/**
 * Lencana kunci kecil di sudut ikon fitur yang perlu masuk dulu — dipakai di
 * rail (lensa terkunci, akun) dan tombol Asisten pada peta. Induknya harus
 * `relative` supaya lencana ini menempel dengan benar di pojok kanan-bawah.
 */
export function LockBadge() {
  return (
    <span
      aria-hidden="true"
      className="absolute -right-0.5 -bottom-0.5 flex size-3.5 items-center justify-center rounded-full bg-inset"
    >
      <svg
        viewBox="0 0 24 24"
        width={9}
        height={9}
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-muted"
      >
        <rect x="6" y="11" width="12" height="9" rx="2" />
        <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
      </svg>
    </span>
  );
}
