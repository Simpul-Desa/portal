"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { useWilayahParams } from "@/shared/hooks/use-wilayah-params";
import { usePusat, useDesa } from "@/shared/hooks/queries-wilayah";
import { CloseIcon, ChevronDownIcon, SearchIcon } from "@/shared/components/icons";
import { FOCUS_RING, FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/shared/components/ui/combobox";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { formatAngka } from "@/shared/format";
import { useKartu } from "@/features/kartu/hooks/queries";

function WilayahCombobox({
  items,
  placeholder,
  prefix,
  selectedValue,
  selectedLabel,
  onSelect,
  onClear,
}: {
  items: { id: string; label: string; subLabel?: string }[];
  placeholder: string;
  prefix: string;
  selectedValue: string | null;
  selectedLabel: string | null;
  onSelect: (id: string) => void;
  onClear: () => void;
}) {
  const [q, setQ] = useState("");
  const [terbuka, setTerbuka] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTerbuka(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = useMemo(() => {
    if (!q) return items;
    const lowerQ = q.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(lowerQ));
  }, [items, q]);

  return (
    <div ref={containerRef} className={`relative transition-all duration-300 ease-in-out ${terbuka ? "w-64 md:w-72" : ""}`}>
      <Combobox
        open={terbuka}
        onOpenChange={(open) => {
          setTerbuka(open);
          if (!open) setQ(""); // reset search when closed
        }}
        value={null}
        onValueChange={(val: unknown) => {
          if (val && typeof val === "string") {
             onSelect(val);
             setTerbuka(false);
             setQ("");
          }
        }}
        inputValue={q}
        onInputValueChange={setQ}
      >
        <label
          className={`flex h-10 items-center rounded-full bg-float shadow-float transition-all duration-300 ${
            terbuka
              ? `px-3 gap-2 ${FOCUS_RING_WITHIN}`
              : `px-4 gap-2 cursor-pointer hover:bg-surface ${FOCUS_RING} ${selectedValue ? "text-ink font-medium" : "text-muted"}`
          }`}
          onClick={(e) => {
            if (!terbuka) {
              e.preventDefault();
              setTerbuka(true);
            }
          }}
        >
          {!terbuka ? (
            <>
              <span className="whitespace-nowrap">{selectedValue ? `${prefix}: ${selectedLabel}` : placeholder}</span>
              {selectedValue ? (
                <div
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onClear();
                  }}
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full bg-float text-muted hover:text-ink hover:bg-surface shadow-sm ml-auto ${FOCUS_RING}`}
                >
                  <CloseIcon className="size-3" />
                </div>
              ) : (
                <ChevronDownIcon className="size-4 shrink-0 opacity-50 ml-auto" />
              )}
            </>
          ) : (
            <>
              <SearchIcon className="shrink-0 text-muted size-4" />
              <ComboboxPrimitive.Input
                autoFocus
                name="cari-wilayah"
                autoComplete="off"
                aria-label={`Cari ${placeholder.toLowerCase()}`}
                placeholder={`Cari ${placeholder.toLowerCase()}...`}
                className="w-full h-full min-w-0 truncate bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-0"
              />
            </>
          )}
        </label>

        <ComboboxContent align="start" sideOffset={8} className="w-[--anchor-width] z-50 max-h-80 overflow-hidden rounded-xl bg-float p-0 shadow-float-strong border border-line flex flex-col outline-none ring-0">
          <ScrollArea className="max-h-80">
            <ComboboxList className="p-2 outline-none ring-0">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-muted">Tidak ada hasil cocok.</div>
              ) : (
                filtered.map((item) => (
                  <ComboboxItem
                    key={item.id}
                    value={item.id}
                    showIndicator={false}
                    className="flex w-full flex-col items-start gap-0.5 rounded-lg px-3 py-2 text-left data-highlighted:bg-surface data-highlighted:text-ink cursor-pointer outline-none ring-0 border-0"
                  >
                    <span className="text-sm text-ink">{item.label}</span>
                    {item.subLabel && <span className="text-xs text-muted">{item.subLabel}</span>}
                  </ComboboxItem>
                ))
              )}
            </ComboboxList>
          </ScrollArea>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}

export function NavbarLokasi() {
  const wilayah = useWilayahParams();
  const pusat = usePusat();

  const { data: kartuData } = useKartu(wilayah.desa);
  const namaDesa = (kartuData as { identitas?: { nama?: string } } | undefined)?.identitas?.nama;

  const provinsiItems = useMemo(() => {
    if (!pusat.data) return [];
    return pusat.data.provinsi.map(p => ({
      id: p.idprov,
      label: p.nama,
      subLabel: `${formatAngka(p.n_desa)} desa`,
    }));
  }, [pusat.data]);

  const kabupatenItems = useMemo(() => {
    if (!pusat.data || !wilayah.prov) return [];
    return pusat.data.kabupaten
      .filter(k => k.idprov === wilayah.prov)
      .map(k => ({
        id: k.idkab,
        label: k.nmkab,
        subLabel: `${formatAngka(k.n_desa)} desa`,
      }));
  }, [pusat.data, wilayah.prov]);

  const desaQuery = useDesa(wilayah.kab);
  const desaItems = useMemo(() => {
    if (!desaQuery.data) return [];
    return desaQuery.data.daftar.map((d) => ({
      id: d.iddesa,
      label: d.nmdesa,
      subLabel: `Kec. ${d.nmkec}`,
    }));
  }, [desaQuery.data]);

  const namaProv = useMemo(() => {
    if (!wilayah.prov) return null;
    return pusat.data?.provinsi.find((p) => p.idprov === wilayah.prov)?.nama ?? wilayah.prov;
  }, [wilayah.prov, pusat.data]);

  const namaKab = useMemo(() => {
    if (!wilayah.kab) return null;
    return pusat.data?.kabupaten.find((k) => k.idkab === wilayah.kab)?.nmkab ?? wilayah.kab;
  }, [wilayah.kab, pusat.data]);

  return (
    <div className="flex flex-col items-start gap-2">
      <WilayahCombobox
        items={provinsiItems}
        placeholder="Pilih Provinsi"
        prefix="Prov"
        selectedValue={wilayah.prov ?? null}
        selectedLabel={namaProv}
        onSelect={wilayah.pilihProv}
        onClear={wilayah.reset}
      />
      
      {wilayah.prov && (
        <WilayahCombobox
          items={kabupatenItems}
          placeholder="Pilih Kabupaten"
          prefix="Kab"
          selectedValue={wilayah.kab ?? null}
          selectedLabel={namaKab}
          onSelect={wilayah.pilihKab}
          onClear={wilayah.hapusKab}
        />
      )}
      
      {wilayah.kab && (
        <WilayahCombobox
          items={desaItems}
          placeholder="Pilih Desa"
          prefix="Desa"
          selectedValue={wilayah.desa ?? null}
          selectedLabel={namaDesa ?? wilayah.desa ?? null}
          onSelect={(id) => wilayah.pilihDesa(id, { prov: wilayah.prov!, kab: wilayah.kab! })}
          onClear={() => wilayah.pilihKab(wilayah.kab!)}
        />
      )}
    </div>
  );
}
