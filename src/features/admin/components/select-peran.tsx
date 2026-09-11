"use client";

import { FOCUS_RING_WITHIN } from "@/shared/components/focus-ring";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
} from "@/shared/components/ui/combobox";

import { adalahPeranBaru, PERAN_PILIHAN } from "../services/pengguna";
import type { PeranBaru } from "../types";

type SelectPeranProps = {
  id: string;
  nilai: PeranBaru;
  sedangKirim: boolean;
  onUbah: (peran: PeranBaru) => void;
};

export function SelectPeran({ id, nilai, sedangKirim, onUbah }: SelectPeranProps) {
  return (
    <div
      aria-busy={sedangKirim}
      className={`relative w-full ${FOCUS_RING_WITHIN}`}
    >
      <Combobox 
        value={nilai} 
        onValueChange={(val: unknown) => {
          if (sedangKirim) return;
          if (typeof val === "string" && adalahPeranBaru(val)) {
            onUbah(val);
          }
        }}
      >
        <ComboboxInput 
          id={id}
          disabled={sedangKirim}
          showTrigger={true}
          className="w-full h-11 bg-inset border-none rounded-inset text-body-md text-ink disabled:opacity-50"
          placeholder="Pilih peran..."
        />
        <ComboboxContent>
          <ComboboxList>
            {PERAN_PILIHAN.map((peran) => (
              <ComboboxItem key={peran} value={peran}>
                {peran}
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </div>
  );
}
