"use client";

import { useState, type ReactNode, type ReactElement } from "react";
import { useSesi } from "@/core/sesi";
import { pesanGalatAuth } from "@/features/auth/services/galat-auth";
import { Combobox as ComboboxPrimitive } from "@base-ui/react";
import {
  Combobox,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxSeparator,
} from "@/shared/components/ui/combobox";
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
import { GalatForm } from "./auth-field";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";

type MenuAkunProps = {
  children: ReactNode;
};

export function MenuAkun({ children }: MenuAkunProps) {
  const { email, peran, keluar } = useSesi();
  const [galatKeluar, setGalatKeluar] = useState<ReturnType<typeof pesanGalatAuth> | null>(null);
  const [konfirmasiTerbuka, setKonfirmasiTerbuka] = useState(false);
  const [sedangKeluar, setSedangKeluar] = useState(false);

  async function handleKonfirmasiKeluar(e: React.MouseEvent) {
    e.preventDefault();
    setSedangKeluar(true);
    try {
      await keluar();
      setKonfirmasiTerbuka(false);
    } catch (error) {
      setGalatKeluar(pesanGalatAuth(error));
      setKonfirmasiTerbuka(false);
    } finally {
      setSedangKeluar(false);
    }
  }

  return (
    <Combobox>
      <ComboboxPrimitive.Trigger render={children as ReactElement} />
      
      <ComboboxContent side="right" align="end" sideOffset={16} className="w-56 p-2 rounded-xl shadow-float-strong border border-line bg-white z-50 outline-none ring-0">
        <div className="px-2 py-1.5">
          <p className="truncate text-label text-muted">{email}</p>
          <p className="mt-0.5 text-body-sm font-medium text-ink">Peran: {peran}</p>
        </div>
        
        <ComboboxSeparator className="my-2 bg-hairline" />
        
        <div className="px-2 pb-1.5">
          <Tabs defaultValue="system" className="w-full">
            <TabsList className="grid w-full grid-cols-3 border border-line bg-transparent p-1 rounded-lg">
              <TabsTrigger 
                value="light" 
                aria-label="Terang"
                className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-surface hover:text-ink transition-colors rounded-md"
              >
                <SunIcon className="size-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="dark" 
                aria-label="Gelap"
                className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-surface hover:text-ink transition-colors rounded-md"
              >
                <MoonIcon className="size-4" />
              </TabsTrigger>
              <TabsTrigger 
                value="system" 
                aria-label="Sistem"
                className="data-[state=active]:bg-ink data-[state=active]:text-white data-[state=active]:shadow-none hover:bg-surface hover:text-ink transition-colors rounded-md"
              >
                <MonitorIcon className="size-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <ComboboxSeparator className="my-2 bg-hairline" />
        
        <ComboboxList className="p-0">
          <ComboboxItem
            showIndicator={false}
            className="data-highlighted:bg-surface data-highlighted:text-ink cursor-pointer rounded-lg px-2.5 py-2"
            onClick={() => setKonfirmasiTerbuka(true)}
          >
            Keluar
          </ComboboxItem>
        </ComboboxList>
        
        {galatKeluar && (
          <div className="mt-2 px-2">
            <GalatForm galat={galatKeluar} />
          </div>
        )}
      </ComboboxContent>

      <AlertDialog open={konfirmasiTerbuka} onOpenChange={setKonfirmasiTerbuka}>
        <AlertDialogContent className="w-full max-w-[380px] rounded-card border border-line/60 bg-float p-6 shadow-float-strong">
          <AlertDialogHeader className="text-left space-y-1">
            <AlertDialogTitle className="text-title-md font-semibold text-ink leading-tight">
              Konfirmasi Keluar
            </AlertDialogTitle>
            <AlertDialogDescription className="text-body-md text-body">
              Apakah Anda yakin ingin keluar dari akun{email ? <> <span className="font-semibold text-ink">{email}</span></> : null}?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex flex-row items-center justify-end gap-2">
            <AlertDialogCancel disabled={sedangKeluar} asChild>
              <button type="button">Batal</button>
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={sedangKeluar}
              onClick={handleKonfirmasiKeluar}
              asChild
            >
              <button type="button">
                {sedangKeluar ? "Keluar..." : "Keluar"}
              </button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Combobox>
  );
}
