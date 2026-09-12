"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Search, X, ChevronDown, Check, Sparkles } from "lucide-react";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";

import type { Varian } from "@/lib/url-state";
import { FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/shared/components/ui/combobox";
import { formatAngka } from "@/shared/format";

import { useJalurDaftar } from "../hooks/queries";
import type { BarisJalur } from "../types";

type CariJalurComboboxProps = {
  varian: Varian;
  kab?: string;
  jalurAktif?: string;
  onPilih: (jalur: string, opsi?: { kab?: string }) => void;
  onReset?: () => void;
};

function labelTampil(varian: Varian, label: string): string {
  if (varian === "gudang-kopdes") return "Gudang Kopdes";
  if (varian === "cold-storage") {
    if (label === "cs-baru") return "Cold storage baru";
    if (label === "cs-eksisting") return "Cold storage eksisting";
    return "Cold storage";
  }
  return label;
}

/**
 * Combobox pencarian & pemilihan Jalur Ekonomi / Desa Poros:
 * Memenuhi arahan UX: panel tidak langsung menggelar 50 list panjang yang memakan ruang,
 * melainkan menyediakan search input + combobox dropdown untuk memilih Desa Poros.
 */
export function CariJalurCombobox({
  varian,
  kab,
  jalurAktif,
  onPilih,
  onReset,
}: CariJalurComboboxProps) {
  const [q, setQ] = useState("");
  const [terbuka, setTerbuka] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading } = useJalurDaftar({
    varian,
    kab,
    hal: 1,
    batas: 100,
    aktif: true,
  });

  const rawDaftar = data?.data;
  const daftar = useMemo(() => rawDaftar ?? [], [rawDaftar]);

  const jalurTerpilih = useMemo(() => {
    if (!jalurAktif) return null;
    return daftar.find((b) => b.id_jalur === jalurAktif) ?? null;
  }, [daftar, jalurAktif]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const tersaring = useMemo(() => {
    if (!q.trim()) return daftar;
    const lower = q.toLowerCase().trim();
    return daftar.filter((b) => {
      const namaPoros = b.poros.nmdesa.toLowerCase();
      const namaKec = (b.poros.nmkec ?? "").toLowerCase();
      const namaKab = (b.nmkab ?? "").toLowerCase();
      const label = labelTampil(varian, b.label).toLowerCase();
      return (
        namaPoros.includes(lower) ||
        namaKec.includes(lower) ||
        namaKab.includes(lower) ||
        label.includes(lower)
      );
    });
  }, [daftar, q, varian]);

  return (
    <div ref={containerRef} className="relative w-full">
      <Combobox
        open={terbuka}
        onOpenChange={setTerbuka}
        value={null}
        onValueChange={(val: unknown) => {
          if (val && typeof val === "object" && "id_jalur" in val) {
            const item = val as BarisJalur;
            onPilih(item.id_jalur, { kab: item.idkab });
            setTerbuka(false);
            setQ("");
          }
        }}
        inputValue={q}
        onInputValueChange={setQ}
      >
        <div
          onClick={() => {
            if (!terbuka) setTerbuka(true);
          }}
          className={`flex h-11 w-full items-center gap-2.5 rounded-card bg-surface px-3.5 shadow-xs border transition-all cursor-pointer ${
            terbuka ? `border-line-strong ${FOCUS_RING_WITHIN}` : "border-line/40 hover:border-line-strong"
          }`}
        >
          <Search className="size-4 shrink-0 text-muted" />

          {terbuka ? (
            <ComboboxPrimitive.Input
              autoFocus
              name="cari-desa-poros"
              autoComplete="off"
              aria-label="Cari desa poros"
              placeholder="Ketik nama desa poros atau komoditas..."
              className="w-full h-full min-w-0 bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none"
            />
          ) : (
            <div className="flex flex-1 items-center justify-between min-w-0">
              <span className={`truncate text-body-md ${jalurTerpilih ? "font-medium text-ink" : "text-muted"}`}>
                {jalurTerpilih
                  ? `Poros: ${jalurTerpilih.poros.nmdesa} (${jalurTerpilih.label})`
                  : "Cari atau pilih desa poros..."}
              </span>
              <div className="flex items-center gap-1 shrink-0 ml-2">
                {jalurTerpilih && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onReset?.();
                      setQ("");
                    }}
                    title="Hapus pilihan poros"
                    aria-label="Hapus pilihan poros"
                    className="flex size-5 items-center justify-center rounded-full bg-float text-muted hover:text-ink"
                  >
                    <X className="size-3" />
                  </button>
                )}
                <ChevronDown className="size-4 text-muted" />
              </div>
            </div>
          )}
        </div>

        <ComboboxContent
          align="start"
          sideOffset={6}
          className="w-[--anchor-width] z-50 max-h-80 overflow-hidden rounded-card bg-surface p-0 shadow-float-strong border border-line flex flex-col outline-none ring-0"
        >
          <ScrollArea className="max-h-80">
            <ComboboxList className="p-1.5 outline-none ring-0">
              {isLoading && (
                <div className="p-3 text-center text-micro text-muted">Memuat daftar poros...</div>
              )}

              {!isLoading && tersaring.length === 0 && (
                <div className="p-3 text-center text-micro text-muted">
                  Tidak ditemukan desa poros dengan kata kunci tersebut.
                </div>
              )}

              {!isLoading &&
                tersaring.map((b) => {
                  const terpilih = b.id_jalur === jalurAktif;
                  return (
                    <ComboboxItem
                      key={b.id_jalur}
                      value={b}
                      showIndicator={false}
                      className={`flex w-full items-center justify-between gap-2 rounded-control px-3 py-2 text-left transition-colors cursor-pointer data-highlighted:bg-inset ${
                        terpilih ? "bg-inset font-medium" : ""
                      }`}
                    >
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="size-3 text-amber-600 shrink-0" />
                          <span className="text-title-sm text-ink truncate font-medium">
                            {b.poros.nmdesa}
                          </span>
                        </div>
                        <span className="text-micro text-muted truncate">
                          {labelTampil(varian, b.label)} · {formatAngka(b.n_anggota)} desa sejalur
                          {b.poros.nmkec && ` · Kec. ${b.poros.nmkec}`}
                          {!kab && ` · Kab. ${b.nmkab}`}
                        </span>
                      </div>

                      {terpilih && <Check className="size-4 text-ink shrink-0" />}
                    </ComboboxItem>
                  );
                })}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
