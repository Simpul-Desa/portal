"use client";

import { Loader2 } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import {
  Combobox,
  ComboboxContent,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/shared/components/ui/combobox";

import { adalahPeranBaru, PERAN_PILIHAN } from "../services/pengguna";
import type { PeranBaru } from "../types";

type SelectPeranProps = {
  id: string;
  nilai: PeranBaru;
  sedangKirim: boolean;
  onUbah: (peran: PeranBaru) => void;
};

type InfoPeran = {
  id: PeranBaru;
  nama: string;
  deskripsi: string;
  dotColor: string;
};

const INFO_PERAN: Record<PeranBaru, InfoPeran> = {
  tamu: {
    id: "tamu",
    nama: "Tamu",
    deskripsi: "Akses dasar penjelajahan publik",
    dotColor: "bg-muted",
  },
  pemerintah: {
    id: "pemerintah",
    nama: "Pemerintah",
    deskripsi: "Akses data analitik desa & peta peran",
    dotColor: "bg-blue-600",
  },
  swasta: {
    id: "swasta",
    nama: "Swasta",
    deskripsi: "Akses potensi pasar, komoditas & jalur",
    dotColor: "bg-amber-600",
  },
  admin: {
    id: "admin",
    nama: "Admin",
    deskripsi: "Hak akses penuh sistem & pengguna",
    dotColor: "bg-primary",
  },
};

export function SelectPeran({ id, nilai, sedangKirim, onUbah }: SelectPeranProps) {
  const infoAktif = INFO_PERAN[nilai] ?? INFO_PERAN.tamu;

  return (
    <div aria-busy={sedangKirim} className="relative w-full">
      <Combobox
        items={PERAN_PILIHAN}
        value={nilai}
        onValueChange={(val: unknown) => {
          if (sedangKirim) return;
          if (typeof val === "string" && adalahPeranBaru(val)) {
            if (val !== nilai) {
              onUbah(val);
            }
          }
        }}
      >
        <ComboboxTrigger
          id={id}
          disabled={sedangKirim}
          aria-label={`Ubah peran pengguna, saat ini ${infoAktif.nama}`}
          className={`flex h-10 w-full items-center justify-between gap-2 rounded-xl bg-surface/80 px-3 text-left border border-line/70 hover:bg-white hover:border-line-strong hover:shadow-xs transition-all cursor-pointer ${FOCUS_RING} ${
            sedangKirim ? "opacity-60 pointer-events-none" : ""
          }`}
        >
          <div className="flex items-center gap-2 min-w-0">
            {sedangKirim ? (
              <Loader2 size={14} className="animate-spin text-primary shrink-0" />
            ) : (
              <span className={`size-2 rounded-full ${infoAktif.dotColor} shrink-0`} aria-hidden="true" />
            )}
            <span className="text-micro font-medium text-ink truncate">
              {sedangKirim ? "Menyimpan…" : infoAktif.nama}
            </span>
          </div>
        </ComboboxTrigger>

        <ComboboxContent
          align="end"
          sideOffset={6}
          className="w-64 z-50 overflow-hidden rounded-xl bg-white p-1.5 shadow-float-strong border border-line flex flex-col outline-none ring-0"
        >
          <div className="px-2.5 py-1.5 border-b border-hairline mb-1">
            <p className="text-micro font-medium uppercase tracking-wider text-muted">
              Pilih Peran Pengguna
            </p>
          </div>

          <ComboboxList className="p-0.5 outline-none ring-0 space-y-1">
            {PERAN_PILIHAN.map((peranKey) => {
              const item = INFO_PERAN[peranKey];
              return (
                <ComboboxItem
                  key={item.id}
                  value={item.id}
                  className="flex w-full items-start justify-between gap-2 rounded-lg px-2.5 py-2 text-left transition-colors cursor-pointer outline-none data-highlighted:bg-surface/80 text-body data-highlighted:text-ink"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`size-2 rounded-full ${item.dotColor} shrink-0`} aria-hidden="true" />
                      <p className="text-title-sm font-semibold text-ink leading-tight">
                        {item.nama}
                      </p>
                    </div>
                    <p className="mt-1 text-micro text-muted leading-snug">
                      {item.deskripsi}
                    </p>
                  </div>
                </ComboboxItem>
              );
            })}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
