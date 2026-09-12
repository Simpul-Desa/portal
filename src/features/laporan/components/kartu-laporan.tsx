"use client";

/**
 * Kartu Laporan Desa — kartu terakhir di panel, hanya dirender untuk peran
 * yang berhak (gerbang `bisa(peran, "laporan")` ada di pemanggil, bukan di
 * sini). Tombol mengunci diri selama PDF dirakit (`aria-busy`) dan, saat
 * gagal, MENJADI tombol coba lagi sendiri — tidak ada tombol kedua yang
 * mengulang aksi yang sama.
 */

import { Download } from "lucide-react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { FOCUS_RING } from "@/shared/components/focus-ring";

import { useUnduhLaporan } from "../hooks/use-unduh-laporan";

export function KartuLaporan({ iddesa }: { iddesa: string }) {
  const { unduh, sedangMenyusun, galat } = useUnduhLaporan();

  return (
    <section className="rounded-card bg-surface p-5">
      <h3 className="text-title-md text-ink">Laporan Desa</h3>
      <p className="mt-1 text-body-md text-body">
        PDF komprehensif berisi Kartu Ekonomi Desa, Detail Peta Peran, Citra Potensi Unggulan, dan komparasi Desa Kembar.
      </p>

      <button
        type="button"
        onClick={() => {
          if (!sedangMenyusun) unduh(iddesa);
        }}
        aria-disabled={sedangMenyusun || undefined}
        aria-busy={sedangMenyusun}
        className={`mt-4 flex h-10 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-float px-[18px] text-button-md text-ink ring-1 ring-inset ring-line-strong aria-disabled:opacity-40 aria-disabled:pointer-events-none ${FOCUS_RING}`}
      >
        <Download aria-hidden="true" size={16} strokeWidth={1.5} />
        {sedangMenyusun ? "Menyusun laporan…" : "Unduh PDF"}
      </button>

      {galat && (
        <div role="alert" className="mt-3">
          <p className="flex items-center gap-1.5 text-title-sm text-ink">
            <span className="size-1.5 shrink-0 rounded-full bg-critical" aria-hidden="true" />
            {pesanGalat(galat).judul}
          </p>
          <p className="mt-1 text-body-md text-body">{pesanGalat(galat).pesan}</p>
          <p className="mt-1 text-micro text-muted">{galat.kode}</p>
        </div>
      )}
    </section>
  );
}
