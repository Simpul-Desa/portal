"use client";

import { useEffect, type RefObject } from "react";
import Link from "next/link";
import { AlertDialog as AlertDialogPrimitive } from "radix-ui";

import { PERAN_PEMBUKA, type Kemampuan } from "@/core/akses";
import { FOCUS_RING } from "@/shared/components/focus-ring";
import { CloseIcon } from "@/shared/components/icons";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
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
    // We can manually focus `kembaliKe` on unmount if needed, 
    // but radix UI handles focus return automatically in most cases.
    return () => {
      kembaliKe?.current?.focus();
    };
  }, [kembaliKe]);

  const lanjut = encodeURIComponent(tujuan);

  return (
    <AlertDialog open={true} onOpenChange={(open) => { if (!open) onTutup(); }}>
      <AlertDialogContent className="w-full max-w-[380px] p-5 border-0">
        <AlertDialogHeader className="flex flex-row items-start justify-between gap-3 text-left space-y-0">
          <AlertDialogTitle className="text-title-md text-ink leading-none mt-1">
            {nama} terkunci
          </AlertDialogTitle>
          <AlertDialogPrimitive.Cancel asChild>
            <button
              title="Tutup"
              aria-label="Tutup"
              className={`flex size-8 shrink-0 items-center justify-center rounded-full text-muted hover:text-ink ${FOCUS_RING}`}
            >
              <CloseIcon />
            </button>
          </AlertDialogPrimitive.Cancel>
        </AlertDialogHeader>

        <div className="my-1 h-px bg-hairline" />

        <AlertDialogDescription className="text-body-md text-body">
          {PERAN_PEMBUKA[kemampuan]}
        </AlertDialogDescription>

        <AlertDialogFooter className="mt-2">
          {adaSesi ? (
            <AlertDialogPrimitive.Cancel asChild>
              <button
                className={`flex h-10 items-center justify-center rounded-full bg-primary px-[18px] text-button-md text-ink hover:bg-primary-active transition-colors ${FOCUS_RING}`}
              >
                Tutup
              </button>
            </AlertDialogPrimitive.Cancel>
          ) : (
            <div className="flex w-full justify-end gap-2">
              <AlertDialogPrimitive.Action asChild>
                <Link
                  href={`/masuk?lanjut=${lanjut}`}
                  className={`flex h-10 items-center justify-center rounded-full bg-primary px-[18px] text-button-md text-ink hover:bg-primary-active transition-colors ${FOCUS_RING}`}
                >
                  Masuk
                </Link>
              </AlertDialogPrimitive.Action>
              <AlertDialogPrimitive.Action asChild>
                <Link
                  href={`/daftar?lanjut=${lanjut}`}
                  className={`flex h-10 items-center justify-center rounded-full bg-inset px-[18px] text-button-md text-ink hover:bg-surface transition-colors ${FOCUS_RING}`}
                >
                  Daftar
                </Link>
              </AlertDialogPrimitive.Action>
            </div>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
