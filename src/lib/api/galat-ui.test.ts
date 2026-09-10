import { describe, expect, it } from "vitest";

import type { GalatApi } from "./client";
import { adalahGangguanServer } from "./galat-ui";

/** Bentuk minimal `GalatApi` yang dibutuhkan `adalahGangguanServer` — dipakai
 * sebagai literal (bukan `new GalatApi(...)`) supaya tes ini tidak perlu
 * mengimpor `client.ts` (dan ikut men-stub env `NEXT_PUBLIC_*` yang dibaca
 * modul itu saat di-import). */
function buatGalat(kode: string, status: number): GalatApi {
  return { name: "GalatApi", kode, pesan: "pesan uji", status } as GalatApi;
}

describe("adalahGangguanServer", () => {
  it("mengembalikan true untuk galat jaringan (server tak terjangkau)", () => {
    expect(adalahGangguanServer(buatGalat("GALAT_JARINGAN", 0))).toBe(true);
  });

  it("mengembalikan true untuk status 500", () => {
    expect(adalahGangguanServer(buatGalat("GALAT_SERVER", 500))).toBe(true);
  });

  it("mengembalikan true untuk status 503", () => {
    expect(adalahGangguanServer(buatGalat("GALAT_SERVER", 503))).toBe(true);
  });

  it("mengembalikan false untuk status 401 (perlu masuk)", () => {
    expect(adalahGangguanServer(buatGalat("TIDAK_BERWENANG", 401))).toBe(false);
  });

  it("mengembalikan false untuk status 403 (fitur terkunci)", () => {
    expect(adalahGangguanServer(buatGalat("AKSES_DITOLAK", 403))).toBe(false);
  });

  it("mengembalikan false untuk status 404 (tidak ditemukan)", () => {
    expect(adalahGangguanServer(buatGalat("TIDAK_DITEMUKAN", 404))).toBe(false);
  });

  it("mengembalikan false untuk status 409 (pekerjaan sedang berjalan)", () => {
    expect(adalahGangguanServer(buatGalat("KONFLIK", 409))).toBe(false);
  });

  it("mengembalikan false untuk status 422 (parameter tidak valid)", () => {
    expect(adalahGangguanServer(buatGalat("PARAMETER_TIDAK_VALID", 422))).toBe(false);
  });

  it("mengembalikan false untuk status 429 (terlalu banyak permintaan)", () => {
    expect(adalahGangguanServer(buatGalat("TERLALU_BANYAK_PERMINTAAN", 429))).toBe(false);
  });
});
