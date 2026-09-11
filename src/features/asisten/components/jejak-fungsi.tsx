"use client";

/**
 * Blok "Sumber jawaban" (Task 20, DESIGN.md § Asisten Desa "Trace block")
 * Direkayasa ulang menggunakan gaya visual dan komponen Collapsible dari Shadcn (seperti
 * dokumentasi Tool Calls AI SDK), disesuaikan dengan warna dan sistem desain Simpul Desa.
 */

import { useState } from "react";
import { ChevronRight, Wrench, ChevronDown, ChevronUp } from "lucide-react";

import { FOCUS_RING } from "@/shared/components/focus-ring";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/components/ui/collapsible";
import { Badge } from "@/shared/components/ui/badge";

import { barisJejak } from "../services/jejak";
import type { JejakFungsi as JejakFungsiMentah, TujuanJejak } from "../types";

type JejakFungsiProps = {
  jejak: readonly JejakFungsiMentah[];
  kodeAsing: readonly string[];
  onBuka: (tujuan: TujuanJejak) => void;
};

export function JejakFungsi({ jejak, kodeAsing, onBuka }: JejakFungsiProps) {
  const baris = barisJejak(jejak);

  return (
    <div className="flex flex-col gap-2 w-full mt-2">
      {baris.map((b, i) => (
        <ToolCallCard key={i} baris={b} onBuka={onBuka} />
      ))}

      {kodeAsing.length > 0 && (
        <p className="mt-1 text-micro text-muted px-1">{kodeAsing.join(", ")}</p>
      )}
    </div>
  );
}

function ToolCallCard({ 
  baris, 
  onBuka 
}: { 
  baris: ReturnType<typeof barisJejak>[number]; 
  onBuka: (tujuan: TujuanJejak) => void;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="rounded-inset bg-inset border border-hairline overflow-hidden"
    >
      <div className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <CollapsibleTrigger asChild>
            <button
              className={`flex items-center justify-center shrink-0 size-6 rounded-sm text-muted hover:bg-surface hover:text-ink transition-colors ${FOCUS_RING}`}
              aria-label={open ? "Tutup argumen" : "Buka argumen"}
            >
              {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </CollapsibleTrigger>
          <Wrench className="size-4 shrink-0 text-muted" aria-hidden="true" />
          <span className="truncate text-title-sm text-ink">{baris.label}</span>
          <Badge
            variant="outline"
            className={`ml-2 h-5 px-1.5 text-[10px] font-mono tracking-wider uppercase rounded-sm border-transparent ${
              baris.sukses ? "bg-positive/15 text-positive" : "bg-critical/15 text-critical"
            }`}
          >
            {baris.sukses ? "completed" : "error"}
          </Badge>
        </div>
        {baris.tujuan && (
          <button
            type="button"
            onClick={() => onBuka(baris.tujuan!)}
            className={`flex shrink-0 items-center gap-1 rounded-sm px-2 py-1 text-micro text-ink outline outline-1 outline-transparent hover:bg-surface hover:outline-line-strong transition-all ml-2 ${FOCUS_RING}`}
            title="Buka lensa dari data ini"
          >
            Buka lensa
            <ChevronRight className="size-3.5 text-muted" />
          </button>
        )}
      </div>
      <CollapsibleContent>
        <div className="p-3 border-t border-hairline bg-surface/30">
          <pre className="text-micro text-ink overflow-x-auto whitespace-pre-wrap font-mono">
            {JSON.stringify(baris.argumenMentah, null, 2)}
          </pre>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
