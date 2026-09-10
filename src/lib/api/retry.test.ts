import { beforeAll, describe, expect, it, vi } from "vitest";

/**
 * `retry.ts` mengimpor `GalatApi` dari `client.ts`, yang membaca
 * `@/core/config` saat modul di-import (lempar Error bila salah satu env
 * kosong) — ketiganya di-stub SEBELUM `retry.ts` dimuat, meniru pola
 * `client.test.ts`. Import dinamis untuk KEDUANYA, bukan `import` statis
 * yang di-hoist ke atas berkas.
 */
let GalatApi: typeof import("./client").GalatApi;
let bolehUlang: typeof import("./retry").bolehUlang;

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_contoh");
  ({ GalatApi } = await import("./client"));
  ({ bolehUlang } = await import("./retry"));
});

describe("bolehUlang", () => {
  it("menolak mengulang galat 404", () => {
    const galat = new GalatApi("TIDAK_DITEMUKAN", "Desa tidak ditemukan", 404);
    expect(bolehUlang(0, galat)).toBe(false);
  });

  it("menolak mengulang galat 401", () => {
    const galat = new GalatApi("TIDAK_BEROTORISASI", "Sesi berakhir", 401);
    expect(bolehUlang(0, galat)).toBe(false);
  });

  it("menolak mengulang galat 422", () => {
    const galat = new GalatApi("VALIDASI_GAGAL", "Input tidak valid", 422);
    expect(bolehUlang(0, galat)).toBe(false);
  });

  it("menerima mengulang galat 503", () => {
    const galat = new GalatApi("GALAT_SERVER", "Layanan terganggu", 503);
    expect(bolehUlang(0, galat)).toBe(true);
  });

  it("menerima mengulang galat jaringan (status 0)", () => {
    const galat = new GalatApi("GALAT_JARINGAN", "Jaringan terputus", 0);
    expect(bolehUlang(0, galat)).toBe(true);
  });

  it("berhenti mengulang pada percobaan kedua", () => {
    const galat = new GalatApi("GALAT_SERVER", "Layanan terganggu", 503);
    expect(bolehUlang(2, galat)).toBe(false);
  });

  it("tetap mengulang galat yang bukan GalatApi", () => {
    expect(bolehUlang(0, new Error("galat tak terduga"))).toBe(true);
  });
});
