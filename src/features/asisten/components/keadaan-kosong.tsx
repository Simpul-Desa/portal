"use client";

/**
 * Keadaan kosong Asisten Desa (Task 22, DESIGN.md § Asisten Desa "Empty
 * state") — ajakan bertanya + kejujuran bahwa percakapan hilang saat halaman
 * dimuat ulang.
 */

import Image from "next/image";

import { FOCUS_RING } from "@/shared/components/focus-ring";

const CONTOH_PERTANYAAN = [
  "Desa mana di Kabupaten Tanggamus yang masuk Zona Poros?",
  "Apa isi Kartu Ekonomi Desa Sukarame di Kabupaten Tanggamus?",
  "Bagaimana Skor Kesiapan Ekonomi Desa dihitung?",
];

type KeadaanKosongProps = {
  onPilihContoh: (teks: string) => void;
};

export function KeadaanKosong({ onPilihContoh }: KeadaanKosongProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center roverflow-hidden">
        <Image src="/asisten-desa.svg" alt="" width={56} height={56} />
      </div>
      
      <div className="flex flex-col gap-2">
        <h3 className="text-title-sm font-medium text-ink">Halo, Saya Asisten Desa!</h3>
        <p className="max-w-[280px] mx-auto text-micro text-muted leading-relaxed">
          Tanya apa saja tentang data SIMPUL DESA. Tekan kirim untuk memulai percakapan.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-sm mt-4">
        {CONTOH_PERTANYAAN.map((teks) => (
          <button 
            key={teks} 
            type="button" 
            onClick={() => onPilihContoh(teks)} 
            className={`w-full rounded-2xl bg-surface px-4 py-3 text-micro text-ink text-left border border-line-strong/30 hover:bg-inset hover:border-line-strong transition-all ${FOCUS_RING}`}
          >
            {teks}
          </button>
        ))}
      </div>
    </div>
  );
}
