/**
 * Perataan LIMA bentuk grup `GET /api/model/jalur-ekonomi/{varian}/{id_jalur}`
 * (rencana `.claude/PRPs/plans/fase-3-4-peta-peran-jalur-ekonomi.plan.md` (lokal saja)
 * § "Bentuk artefak dan respons nyata") ke satu kontrak `JalurTernormalisasi`
 * (`../types.ts`) dipakai `lib/map/jalur.ts` dan `detail-jalur.tsx`.
 *
 * Deteksi bentuk grup MENIRU `api/src/jalur_ekonomi/service.py`
 * `anggota_iddesa()`: kunci poros dicoba berurutan `poros` → `lokasi` →
 * `basis` → grup itu sendiri (satu-satunya bentuk tanpa ketiganya adalah
 * baris `cold-storage` unit EKSISTING). Kunci daftar anggota, kunci menit,
 * dan arti `bobot` berbeda per VARIAN (bukan per bentuk poros) — lihat tabel
 * lima bentuk di rencana.
 *
 * Fungsi ini TIDAK PERNAH melempar: grup cacat (kunci artefak hilang)
 * menghasilkan bentuk seragam bernilai kosong (`pusat.iddesa: ""`,
 * `anggota: []`, `bobot: null`) alih-alih exception — satu grup rusak tidak
 * boleh menjatuhkan seluruh render panel (pola `_lewati()` di `api/`, yang
 * mencatat lalu melompati satu grup cacat tanpa menjatuhkan seluruh daftar).
 */

import type { Varian } from "@/lib/url-state";

import type { JalurTernormalisasi } from "../types";

function str(v: unknown): string {
  return typeof v === "string" ? v : "";
}

function strOrNull(v: unknown): string | null {
  return typeof v === "string" ? v : null;
}

function num(v: unknown): number | null {
  return typeof v === "number" ? v : null;
}

function arr(v: unknown): unknown[] {
  return Array.isArray(v) ? v : [];
}

function obj(v: unknown): Record<string, unknown> {
  return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : {};
}

function strArr(v: unknown): string[] {
  return arr(v).filter((x): x is string => typeof x === "string");
}

type SumberPoros = {
  src: Record<string, unknown>;
  porosAdalahPeran: boolean;
  /** Hanya relevan untuk varian `cold-storage`, yang punya DUA bentuk grup
   * berbeda — lihat `kunciVarian` di bawah. */
  punyaLokasi: boolean;
};

/**
 * Sumber blok poros + peran GLOSSARY, dideteksi dari BENTUK `grup` sendiri —
 * bukan dari `varian` — karena `cold-storage` sendiri punya dua bentuk
 * (`lokasi` untuk unit baru yang diusulkan model, grup itu sendiri untuk
 * unit eksisting).
 */
function sumberPoros(grup: Record<string, unknown>): SumberPoros {
  if ("poros" in grup) return { src: obj(grup.poros), porosAdalahPeran: true, punyaLokasi: false };
  if ("lokasi" in grup) return { src: obj(grup.lokasi), porosAdalahPeran: true, punyaLokasi: true };
  if ("basis" in grup) return { src: obj(grup.basis), porosAdalahPeran: true, punyaLokasi: false };
  // Grup itu sendiri adalah sumber poros: baris `cs-eksisting` (GLOSSARY —
  // `porosAdalahPeran` SENGAJA `false`, unit yang sudah berdiri bukan temuan
  // model) ATAU grup cacat kunci hilang (fallback aman: tidak pernah mengaku
  // sebagai Desa Poros bila datanya tidak bisa dipastikan).
  return { src: grup, porosAdalahPeran: false, punyaLokasi: false };
}

type KunciVarian = {
  kunciAnggota: string;
  kunciMenit: string;
  kunciBobotAnggota: "volume" | "bobot";
  kunciBobotGrup: string;
  /** Label singkat DESIGN.md `label` di atas figur — bukan satuan
   * (M6/L2, review Blok E): "Volume", "Kapasitas", atau "Bobot registri". */
  label: string;
  /** Satuan yang berjalan SETELAH angka, dipisah spasi (GLOSSARY §
   * Konvensi penulisan). `null` untuk `wisata` — bobotnya indeks registri,
   * bukan ukuran fisik, jadi tidak punya satuan. "ruta" (identifier `data/`)
   * TIDAK PERNAH tampil ke pengguna — bentuk terlihatnya selalu "rumah
   * tangga". */
  unit: string | null;
};

/**
 * Kunci anggota/menit/bobot per VARIAN (tabel rencana § "Bentuk artefak").
 * `punyaLokasi` hanya membedakan dua bentuk `cold-storage`; varian lain
 * mengabaikannya. Diagram sebagai lookup (bukan `switch`) supaya TypeScript
 * menjamin keempat varian tercakup tanpa cabang `default` yang bisa lupa
 * diperbarui saat varian baru ditambah.
 */
function kunciVarian(varian: Varian, punyaLokasi: boolean): KunciVarian {
  if (varian === "cold-storage") {
    return punyaLokasi
      ? {
          kunciAnggota: "desa_layanan",
          kunciMenit: "menit_ke_cs",
          kunciBobotAnggota: "volume",
          kunciBobotGrup: "volume",
          label: "Volume",
          unit: "rumah tangga rantai dingin",
        }
      : {
          kunciAnggota: "desa_layanan",
          kunciMenit: "menit_ke_cs",
          kunciBobotAnggota: "volume",
          kunciBobotGrup: "kapasitas_ton",
          label: "Kapasitas",
          unit: "ton",
        };
  }

  const KUNCI: Record<Exclude<Varian, "cold-storage">, KunciVarian> = {
    komoditas: {
      kunciAnggota: "anggota",
      kunciMenit: "menit_ke_poros",
      kunciBobotAnggota: "volume",
      kunciBobotGrup: "volume",
      label: "Volume",
      unit: "rumah tangga",
    },
    "gudang-kopdes": {
      kunciAnggota: "desa_layanan",
      kunciMenit: "menit_ke_gudang",
      kunciBobotAnggota: "volume",
      kunciBobotGrup: "volume",
      label: "Volume",
      unit: "rumah tangga tani",
    },
    wisata: {
      kunciAnggota: "desa",
      kunciMenit: "menit_ke_basis",
      kunciBobotAnggota: "bobot",
      kunciBobotGrup: "bobot",
      label: "Bobot registri",
      unit: null,
    },
  };
  return KUNCI[varian];
}

/**
 * Ratakan satu grup mentah (bentuk `Record<string, unknown>` — OpenAPI
 * mengetiknya `dict[str, Any]`) jadi `JalurTernormalisasi`. `anggota` disalin
 * APA ADANYA dari `grup[kunciAnggota]` (termasuk baris yang `iddesa`-nya sama
 * dengan poros pada varian `komoditas`/`gudang-kopdes`/`wisata` — lihat
 * catatan artefak); `nAnggota` dibaca TERPISAH dari `grup[`n_${kunciAnggota}`]`
 * (`n_anggota`/`n_desa_layanan`/`n_desa`) — BUKAN `anggota.length` — karena
 * `arr()` jatuh ke array kosong bila kunci daftar anggota hilang atau
 * berganti nama, sedangkan kunci cacahnya bisa tetap ada; memakai
 * `anggota.length` sebagai cacah akan salah persis pada kasus itu (Task 26
 * GOTCHA 1: "tampilkan `n_anggota` apa adanya").
 */
export function normalisasiJalur(varian: Varian, grup: Record<string, unknown>): JalurTernormalisasi {
  const { src, porosAdalahPeran, punyaLokasi } = sumberPoros(grup);
  const kunci = kunciVarian(varian, punyaLokasi);

  const anggota = arr(grup[kunci.kunciAnggota]).map((item) => {
    const a = obj(item);
    return {
      iddesa: str(a.iddesa),
      nmdesa: str(a.nmdesa),
      nmkec: strOrNull(a.nmkec),
      bobot: num(a[kunci.kunciBobotAnggota]),
      menit: num(a[kunci.kunciMenit]),
    };
  });

  return {
    id_jalur: str(grup.id_jalur),
    porosAdalahPeran,
    pusat: { iddesa: str(src.iddesa), nmdesa: str(src.nmdesa), nmkec: strOrNull(src.nmkec) },
    anggota,
    nAnggota: num(grup[`n_${kunci.kunciAnggota}`]),
    label: kunci.label,
    unit: kunci.unit,
    bobot: num(grup[kunci.kunciBobotGrup]),
    kecamatan: strArr(grup.kecamatan),
  };
}
