"use client";

import { useEffect, type RefObject } from "react";
import Link from "next/link";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { PERAN_PEMBUKA, type Kemampuan } from "@/core/akses";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { CloseIcon } from "@/shared/components/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";

type DialogTerkunciProps = {
  kemampuan: Kemampuan;
  nama: string;
  tujuan: string;
  adaSesi: boolean;
  onTutup: () => void;
  kembaliKe?: RefObject<HTMLElement | null>;
};

export function DialogTerkunci({
  kemampuan,
  nama,
  tujuan,
  adaSesi,
  onTutup,
  kembaliKe,
}: DialogTerkunciProps) {
  useEffect(() => {
    const targetKembali = kembaliKe?.current;
    return () => {
      targetKembali?.focus();
    };
  }, [kembaliKe]);

  const lanjut = encodeURIComponent(tujuan);

  return (
    <AlertDialog open={true} onOpenChange={(open) => { if (!open) onTutup(); }}>
      <AlertDialogContent className="w-full max-w-[380px] rounded-card border border-line/60 bg-float p-6 shadow-float-strong">
        <AlertDialogHeader className="flex flex-row items-start justify-between gap-3 text-left space-y-0">
          <AlertDialogTitle className="text-title-md font-semibold text-ink leading-tight">
            {nama} terkunci
          </AlertDialogTitle>
          <AlertDialogPrimitive.Cancel asChild>
            <button
              type="button"
              title="Tutup"
              aria-label="Tutup"
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:bg-surface hover:text-ink transition-colors ${FOCUS_RING}`}
            >
              <CloseIcon />
            </button>
          </AlertDialogPrimitive.Cancel>
        </AlertDialogHeader>

        <div className="my-1 h-px bg-hairline" />

        <AlertDialogDescription className="text-body-md text-body">
          {PERAN_PEMBUKA[kemampuan]}
        </AlertDialogDescription>

        <AlertDialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
          {adaSesi ? (
            <AlertDialogAction asChild>
              <button type="button">Tutup</button>
            </AlertDialogAction>
          ) : (
            <>
              <AlertDialogCancel asChild>
                <button type="button">Batal</button>
              </AlertDialogCancel>
              <AlertDialogAction variant="outline" asChild>
                <Link href={`/daftar?lanjut=${lanjut}`}>Daftar</Link>
              </AlertDialogAction>
              <AlertDialogAction asChild>
                <Link href={`/masuk?lanjut=${lanjut}`}>Masuk</Link>
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
