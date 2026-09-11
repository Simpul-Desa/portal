import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

describe("proxy onboarding redirection", () => {
  it("mengalihkan kunjungan pertama di beranda ke /onboarding jika belum ada cookie", () => {
    const req = new NextRequest("http://localhost:3000/");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3000/onboarding");
  });

  it("menyimpan parameter lanjut saat pengguna mengakses halaman dalam tanpa cookie", () => {
    const req = new NextRequest("http://localhost:3000/admin?tab=berita");
    const res = proxy(req);

    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/onboarding?lanjut=%2Fadmin%3Ftab%3Dberita",
    );
  });

  it("mengizinkan akses ke /onboarding tanpa pengalihan", () => {
    const req = new NextRequest("http://localhost:3000/onboarding");
    const res = proxy(req);

    expect(res.status).toBe(200);
  });

  it("mengizinkan akses ke beranda jika cookie simpul_onboarded sudah ada", () => {
    const req = new NextRequest("http://localhost:3000/", {
      headers: {
        cookie: "simpul_onboarded=1",
      },
    });
    const res = proxy(req);

    expect(res.status).toBe(200);
  });

  it("mengizinkan rute API dan internal _next tanpa pengalihan", () => {
    const reqApi = new NextRequest("http://localhost:3000/api/wilayah/ringkasan");
    expect(proxy(reqApi).status).toBe(200);

    const reqNext = new NextRequest("http://localhost:3000/_next/static/chunks/main.js");
    expect(proxy(reqNext).status).toBe(200);
  });
});
