import { PanelCakupan } from "@/features/auth/components/panel-cakupan";

/**
 * Kerangka dua-blok halaman auth (Task 20) — dipakai `/masuk` dan `/daftar`
 * lewat route group `(auth)` (tanpa segmen URL tambahan). Kartu kiri
 * (`{children}` = `MasukForm`/`DaftarForm`) di bawah `lg` selebar penuh; dari
 * `lg` (1024px) menjadi dua kolom sejajar — kartu menyempit ke `panel-min`
 * (400px), lalu dari `xl` (1280px) ke `panel` penuh (480px). `PanelCakupan`
 * mengisi sisa lebar dari `lg` ke atas; di bawah `lg` ia tersusun di bawah
 * kartu (blok gelap sendiri yang mengatur wujud ringkasnya per breakpoint).
 *
 * `LayoutProps<"/">` (bukan `"/masuk"`/`"/daftar"`): `next typegen` tidak
 * menerbitkan entri `LayoutRoutes` terpisah untuk layout di bawah route
 * group tanpa segmen dinamis — `(auth)` menormalisasi ke `"/"` yang sama
 * dengan root layout. Bentuknya identik (`params: Promise<{}>`, tanpa slot)
 * jadi tidak ada perbedaan perilaku, hanya literal rute yang dipinjam.
 */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-dvh flex-col gap-2 bg-canvas p-2 lg:flex-row">
      {/* `<main id="isi">`, bukan `<div>` (temuan Lighthouse fase 9): kedua
          rute auth sebelumnya tidak punya landmark utama sama sekali, jadi
          skip link layout akar menunjuk jangkar yang tidak ada di sini.
          Kartu form adalah isi utama halaman ini; `PanelCakupan` di
          sebelahnya bukti pendukung. */}
      <main id="isi" className="w-full shrink-0 lg:w-panel-min xl:w-panel">
        {children}
      </main>
      <div className="w-full lg:flex-1">
        <PanelCakupan />
      </div>
    </div>
  );
}
