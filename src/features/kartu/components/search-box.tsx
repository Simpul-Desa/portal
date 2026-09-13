"use client";

import { useState, useRef, useEffect } from "react";

import { pesanGalat } from "@/lib/api/galat-ui";
import { KeadaanKosong } from "@/shared/components/blok-keadaan";
import { FOCUS_RING, FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import { SearchIcon } from "@/shared/components/icons";
import { pilihKeadaan } from "@/shared/components/keadaan";
import { useCariDesa } from "@/shared/hooks/queries-wilayah";
import type { useWilayahParams } from "@/shared/hooks/use-wilayah-params";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/shared/components/ui/combobox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

type WilayahState = ReturnType<typeof useWilayahParams>;

type SearchBoxProps = {
  onPilih: WilayahState["pilihDesa"];
};

export function SearchBox({ onPilih }: SearchBoxProps) {
  const [q, setQ] = useState("");
  const [terbuka, setTerbuka] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data, isPending, isPaused, isError, error, refetch } = useCariDesa(q);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (q.trim() === "") setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [q]);

  function pilihHasil(hasil: NonNullable<typeof data>[number]) {
    onPilih(hasil.iddesa, { prov: hasil.idkab.slice(0, 2), kab: hasil.idkab });
    setQ("");
    setTerbuka(false);
    setIsExpanded(false);
  }

  const keadaan = pilihKeadaan({
    isPending,
    isPaused,
    isError,
    kosong: (data?.length ?? 0) === 0,
  });

  return (
    <div ref={containerRef} className={`relative transition-all duration-300 ease-in-out ${isExpanded ? "w-52 sm:w-64 md:w-80" : "w-8.5 md:w-10"}`}>
      <Combobox 
        open={terbuka && q.trim().length >= 2} 
        onOpenChange={setTerbuka}
        value={null}
        onValueChange={(val: unknown) => {
          if (val && typeof val === "object" && "iddesa" in val) {
            pilihHasil(val as NonNullable<typeof data>[number]);
          }
        }}
        inputValue={q}
        onInputValueChange={(newQ: string) => {
          setQ(newQ);
          setTerbuka(true);
        }}
      >
        <label 
          className={`flex h-8.5 md:h-10 items-center rounded-full bg-float shadow-float transition-all duration-300 border border-line/70 ${isExpanded ? "px-2.5 md:px-3 gap-2 border-line-strong" : "justify-center cursor-pointer hover:scale-105"}`}
          onClick={(e) => {
            if (!isExpanded) {
              e.preventDefault();
              setIsExpanded(true);
            }
          }}
        >
          <SearchIcon className={`shrink-0 size-3.5 md:size-4.5 ${isExpanded ? "text-muted" : "text-ink"}`} />
          {isExpanded && (
            <ComboboxPrimitive.Input
              autoFocus
              name="cari-desa"
              autoComplete="off"
              aria-label="Cari desa"
              placeholder="Cari desa…"
              className="w-full h-full min-w-0 truncate bg-transparent text-body-md text-ink placeholder:text-muted focus:outline-none focus:ring-0 outline-none"
            />
          )}
        </label>

        <ComboboxContent align="start" sideOffset={8} className="w-[--anchor-width] z-50 max-h-80 overflow-hidden rounded-xl bg-float p-0 shadow-float-strong border border-line flex flex-col outline-none ring-0">
          <ScrollArea className="max-h-80">
            <ComboboxList className="p-2 outline-none ring-0">
              {keadaan === "muat" &&
                Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-12 animate-pulse rounded-lg bg-surface mb-1" aria-hidden="true" />
                ))}

              {keadaan === "tertunda" && (
                <div className="px-3 py-4">
                  <KeadaanKosong kalimat="Sambungan terputus, hasil belum bisa dimuat." />
                  <button
                    type="button"
                    onClick={() => refetch()}
                    className={`mt-1 flex h-10 items-center rounded-full bg-float px-4 text-button-md text-ink ${FOCUS_RING}`}
                  >
                    Coba lagi
                  </button>
                </div>
              )}

              {isError && (
                <div className="px-3 py-4 text-body-md text-muted">{pesanGalat(error).judul}</div>
              )}

              {keadaan === "kosong" && (
                <div className="px-3 py-4 text-body-md text-muted">Tidak ada desa cocok — coba nama lain</div>
              )}

              {keadaan === "isi" &&
                data?.map((d) => (
                  <ComboboxItem
                    key={d.iddesa}
                    value={d}
                    showIndicator={false}
                    className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left data-highlighted:bg-surface data-highlighted:text-ink cursor-pointer outline-none ring-0 border-0"
                  >
                    <span className="text-title-sm text-ink">{d.nmdesa}</span>
                    <span className="text-label text-muted">
                      Kec. {d.nmkec} • Kab. {d.nmkab}
                    </span>
                  </ComboboxItem>
                ))}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
