import { Suspense } from "react";

import { DashboardShell } from "@/shared/components/shell/dashboard-shell";

/**
 * Kerangka statis dasbor — fallback Suspense sebelum `DashboardShell`
 * (konsumen `useSearchParams`, wajib di bawah Suspense di Next 16) siap
 * dirender. Tiga blok bulat ber-gutter meniru siluet shell nyata
 * (rail-panel-peta), tanpa teks. `w-1/3 max-w-panel-max` dipakai (bukan lebar
 * tetap) supaya blok panel tidak pernah meluber di viewport sempit — ini
 * render sekali-lewat, bukan representasi keadaan muat data.
 */
function KerangkaShell() {
  return (
    <div className="flex h-dvh gap-2 bg-canvas p-4 pl-2">
      <div className="w-16 shrink-0 rounded-card bg-transparent" />
      <div className="w-1/3 max-w-panel-max shrink-0 rounded-card bg-surface" />
      <div className="flex-1 rounded-card bg-canvas" />
    </div>
  );
}

export default function Beranda() {
  return (
    <Suspense fallback={<KerangkaShell />}>
      <DashboardShell />
    </Suspense>
  );
}
