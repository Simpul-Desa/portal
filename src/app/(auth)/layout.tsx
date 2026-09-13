// Layout auth

/**
 * Kerangka dua-blok halaman auth (Task 20) — dipakai `/masuk` dan `/daftar`
 * lewat route group `(auth)` (tanpa segmen URL tambahan). Kartu kiri
 * (`{children}` = `MasukForm`/`DaftarForm`) di bawah `lg` selebar penuh; dari
 * `lg` (1024px) menjadi dua kolom sejajar — kartu menyempit ke `panel-min`
 * (400px), lalu dari `xl` (1280px) ke `panel` penuh (480px).
 *
 * `LayoutProps<"/">` (bukan `"/masuk"`/`"/daftar"`): `next typegen` tidak
 * menerbitkan entri `LayoutRoutes` terpisah untuk layout di bawah route
 * group tanpa segmen dinamis — `(auth)` menormalisasi ke `"/"` yang sama
 * dengan root layout. Bentuknya identik (`params: Promise<{}>`, tanpa slot)
 * jadi tidak ada perbedaan perilaku, hanya literal rute yang dipinjam.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas p-6 md:p-10 selection:bg-primary/20 selection:text-ink">
      <img
        src="/bg-login.png"
        alt="Background Login"
        className="absolute inset-0 z-0 h-full w-full object-cover"
      />
      <main id="isi" className="relative z-10 w-full max-w-sm md:max-w-4xl">
        {children}
      </main>
    </div>
  );
}
