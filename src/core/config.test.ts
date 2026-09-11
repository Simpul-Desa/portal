import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * `config.ts` membaca ketiga env di top-level (`export const X = baca...()`)
 * — modulnya melempar SAAT DIIMPOR bila salah satu kosong. Jadi tiap tes
 * (termasuk yang hanya menguji `API_URL`) wajib menstub ketiganya sekaligus
 * sebelum `import("./config")`, bukan hanya env yang sedang diuji.
 */
const ENV_LENGKAP = {
  NEXT_PUBLIC_API_URL: "http://localhost:8000",
  NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_contoh",
};

function stubEnvLengkap(override: Partial<typeof ENV_LENGKAP> = {}): void {
  const nilai = { ...ENV_LENGKAP, ...override };
  for (const [kunci, isi] of Object.entries(nilai)) {
    vi.stubEnv(kunci, isi);
  }
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("API_URL", () => {
  it("meneruskan nilai tanpa trailing slash apa adanya", async () => {
    stubEnvLengkap();

    const { API_URL } = await import("./config");

    expect(API_URL).toBe("http://localhost:8000");
  });

  it("membuang satu trailing slash", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_API_URL: "http://localhost:8000/" });

    const { API_URL } = await import("./config");

    expect(API_URL).toBe("http://localhost:8000");
  });

  it("membuang banyak trailing slash sekaligus", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_API_URL: "http://localhost:8000///" });

    const { API_URL } = await import("./config");

    expect(API_URL).toBe("http://localhost:8000");
  });

  it("melempar Error saat NEXT_PUBLIC_API_URL kosong", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_API_URL: "" });

    await expect(import("./config")).rejects.toThrow("NEXT_PUBLIC_API_URL kosong");
  });
});

describe("SUPABASE_URL", () => {
  it("meneruskan nilai tanpa trailing slash apa adanya", async () => {
    stubEnvLengkap();

    const { SUPABASE_URL } = await import("./config");

    expect(SUPABASE_URL).toBe("http://localhost:54321");
  });

  it("membuang trailing slash", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321/" });

    const { SUPABASE_URL } = await import("./config");

    expect(SUPABASE_URL).toBe("http://localhost:54321");
  });

  it("melempar Error saat NEXT_PUBLIC_SUPABASE_URL kosong", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_SUPABASE_URL: "" });

    await expect(import("./config")).rejects.toThrow("NEXT_PUBLIC_SUPABASE_URL kosong");
  });
});

describe("SUPABASE_PUBLISHABLE_KEY", () => {
  it("meneruskan nilai apa adanya", async () => {
    stubEnvLengkap();

    const { SUPABASE_PUBLISHABLE_KEY } = await import("./config");

    expect(SUPABASE_PUBLISHABLE_KEY).toBe("sb_publishable_contoh");
  });

  it("melempar Error saat NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY kosong", async () => {
    stubEnvLengkap({ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "" });

    await expect(import("./config")).rejects.toThrow(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY kosong",
    );
  });
});

describe("DOCS_URL", () => {
  it("meneruskan nilai NEXT_PUBLIC_DOCS_URL tanpa trailing slash", async () => {
    stubEnvLengkap();
    vi.stubEnv("NEXT_PUBLIC_DOCS_URL", "https://docs.simpuldesa.id///");

    const { DOCS_URL } = await import("./config");

    expect(DOCS_URL).toBe("https://docs.simpuldesa.id");
  });

  it("jatuh ke fallback http://localhost:3001 saat NEXT_PUBLIC_DOCS_URL tidak disetel", async () => {
    stubEnvLengkap();
    vi.stubEnv("NEXT_PUBLIC_DOCS_URL", "");

    const { DOCS_URL } = await import("./config");

    expect(DOCS_URL).toBe("http://localhost:3001");
  });
});
