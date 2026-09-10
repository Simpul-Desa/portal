import { ChevronDownIcon, ChevronUpIcon, CloseIcon, StarIcon } from "./icons";

const READINGS = [
  { label: "Kelembapan", value: "15%" },
  { label: "Suhu", value: "32°C" },
  { label: "Air tanah", value: "42 kPa" },
  { label: "Tingkat pH", value: "2,5" },
];

export function MapDetailCard() {
  return (
    <article className="w-[380px] rounded-card bg-float p-5 shadow-float">
      <header className="flex items-start justify-between">
        <div>
          <h2 className="flex items-center gap-1.5 text-title-md text-ink">
            Area 1 : Sentra Padi
            <StarIcon className="size-4 text-caution" />
          </h2>
          <p className="mt-1 font-mono text-label text-muted">#SD-23BC-12</p>
        </div>
        <CloseIcon className="text-muted" />
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-y-1">
        <dt className="text-label text-muted">Tanggal tanam</dt>
        <dt className="text-label text-muted">Tanggal panen</dt>
        <dd className="text-title-sm text-ink">24 Agu 25</dd>
        <dd className="text-title-sm text-ink">12 Nov 25</dd>
      </dl>

      <div className="mt-3">
        <div className="flex items-baseline justify-between">
          <p className="text-label text-muted">Kesehatan lahan</p>
          <p className="text-body-md font-medium text-ink">Baik</p>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
          <span className="block h-full w-[78%] rounded-full bg-positive" />
        </div>
      </div>

      <section className="mt-3 rounded-inset bg-inset p-3">
        <header className="flex items-center justify-between">
          <h3 className="text-body-md font-medium text-ink">Data terpantau</h3>
          <ChevronUpIcon className="size-4 text-muted" />
        </header>
        <dl className="mt-3 space-y-2">
          {READINGS.map((reading) => (
            <div key={reading.label} className="flex justify-between text-body-md">
              <dt className="text-body">{reading.label}</dt>
              <dd className="font-medium text-ink">{reading.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-3 flex items-center justify-between rounded-inset bg-inset p-3">
        <h3 className="text-body-md font-medium text-ink">Log sensor</h3>
        <ChevronDownIcon className="size-4 text-muted" />
      </section>

      <section className="mt-3 rounded-inset bg-deep p-3.5">
        <p className="flex items-center gap-1.5 text-body-md font-medium text-white">
          <span className="rounded-[6px] bg-positive-deep px-1.5 py-0.5 text-badge">AI</span>
          Insight
        </p>
        <p className="mt-2 text-label leading-relaxed text-white/85">
          Jaga air tanah di 40 kPa dan pH di bawah 2,6 untuk memaksimalkan hasil panen
          musim ini.
        </p>
      </section>
    </article>
  );
}
