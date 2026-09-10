import { beforeEach, describe, expect, test, vi } from "vitest";

import type { BarisPetaPeran } from "../types";

/**
 * `ambilPetaPeranPeta` (review M5) — modul-privat sebelumnya, tidak pernah
 * dieksekusi tes. `@/lib/api/endpoints` di-mock UTUH: hook lain di
 * `queries.ts` (`usePetaPeranDaftar`, dst.) tidak dipanggil di sini (butuh
 * `QueryClientProvider`), jadi stub kosong untuk ekspor lain cukup — hanya
 * `modelPetaPeran` yang benar-benar dikendalikan tiap tes.
 */
vi.mock("@/lib/api/endpoints", () => ({
  modelPetaPeran: vi.fn(),
  modelPetaPeranDetail: vi.fn(),
  modelPetaPeranRingkasan: vi.fn(),
  modelPetaPeranRingkasanDaftar: vi.fn(),
}));

import { modelPetaPeran } from "@/lib/api/endpoints";

import { ambilPetaPeranPeta } from "./queries";

const modelPetaPeranMock = vi.mocked(modelPetaPeran);
const BATAS_PETA = 500;

function baris(n: number): BarisPetaPeran[] {
  return Array.from({ length: n }, (_, i) => ({
    iddesa: `1801${String(i).padStart(6, "0")}`,
    nmdesa: "CONTOH",
    nmkec: "CONTOH",
    idkab: "1801",
    nmkab: "LAMPUNG BARAT",
    idprov: "18",
    zona: "Zona Mitra",
    keyakinan: "normal",
    desil_sp: 5,
    desil_sk: 5,
    potensi_dominan: null,
    sumber_dominan: null,
  }));
}

describe("ambilPetaPeranPeta", () => {
  beforeEach(() => {
    modelPetaPeranMock.mockReset();
  });

  test("total di bawah satu halaman (250) — satu permintaan, lengkap", async () => {
    modelPetaPeranMock.mockResolvedValueOnce({
      data: baris(250),
      meta: { total: 250, hal: 1, batas: BATAS_PETA },
    });

    const hasil = await ambilPetaPeranPeta("1801");

    expect(modelPetaPeranMock).toHaveBeenCalledTimes(1);
    expect(hasil.baris).toHaveLength(250);
    expect(hasil.lengkap).toBe(true);
  });

  test("total persis satu halaman (500) — satu permintaan, lengkap", async () => {
    modelPetaPeranMock.mockResolvedValueOnce({
      data: baris(500),
      meta: { total: 500, hal: 1, batas: BATAS_PETA },
    });

    const hasil = await ambilPetaPeranPeta("3306");

    expect(modelPetaPeranMock).toHaveBeenCalledTimes(1);
    expect(hasil.baris).toHaveLength(500);
    expect(hasil.lengkap).toBe(true);
  });

  test("total satu lebih dari satu halaman (501) — dua permintaan, lengkap", async () => {
    modelPetaPeranMock
      .mockResolvedValueOnce({ data: baris(500), meta: { total: 501, hal: 1, batas: BATAS_PETA } })
      .mockResolvedValueOnce({ data: baris(1), meta: { total: 501, hal: 2, batas: BATAS_PETA } });

    const hasil = await ambilPetaPeranPeta("9999");

    expect(modelPetaPeranMock).toHaveBeenCalledTimes(2);
    expect(modelPetaPeranMock.mock.calls[1][0]).toMatchObject({ hal: 2 });
    expect(hasil.baris).toHaveLength(501);
    expect(hasil.lengkap).toBe(true);
  });

  test("total melebihi batas aman putaran (1600) — tiga permintaan, TIDAK lengkap", async () => {
    modelPetaPeranMock
      .mockResolvedValueOnce({ data: baris(500), meta: { total: 1600, hal: 1, batas: BATAS_PETA } })
      .mockResolvedValueOnce({ data: baris(500), meta: { total: 1600, hal: 2, batas: BATAS_PETA } })
      .mockResolvedValueOnce({ data: baris(500), meta: { total: 1600, hal: 3, batas: BATAS_PETA } });

    const hasil = await ambilPetaPeranPeta("7777");

    expect(modelPetaPeranMock).toHaveBeenCalledTimes(3);
    expect(hasil.baris).toHaveLength(1500);
    expect(hasil.lengkap).toBe(false);
  });

  test("meta hilang — TIDAK diam-diam dianggap lengkap (bug fallback lama)", async () => {
    modelPetaPeranMock
      .mockResolvedValueOnce({ data: baris(500), meta: null })
      .mockResolvedValueOnce({ data: baris(0), meta: null })
      .mockResolvedValueOnce({ data: baris(0), meta: null });

    const hasil = await ambilPetaPeranPeta("1802");

    // Fallback lama (`total = respons.meta?.total ?? baris.length`) membuat
    // `total` SELALU sama dengan yang terkumpul saat `meta` hilang, sehingga
    // loop berhenti setelah SATU permintaan dan `lengkap` menjawab `true`
    // walau tidak pernah dikonfirmasi. Fix: `total` tetap `null` (bukan
    // `baris.length`) selama `meta` tidak pernah datang, jadi loop terus
    // mencoba sampai `MAKS_PUTARAN_PETA` dan `lengkap` jujur menjawab `false`.
    expect(modelPetaPeranMock).toHaveBeenCalledTimes(3);
    expect(hasil.baris).toHaveLength(500);
    expect(hasil.lengkap).toBe(false);
  });
});
