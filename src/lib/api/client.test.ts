import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

/**
 * `client.ts` membaca `@/core/config` saat modul di-import (lempar Error
 * bila salah satu env kosong) — `config.ts` sejak Task 8 butuh ketiga env
 * (`NEXT_PUBLIC_API_URL` + dua Supabase) sekaligus, jadi ketiganya di-stub
 * SEBELUM modul dimuat. Import-nya dinamis (mirror pola
 * `core/config.test.ts`) alih-alih `import` statis yang di-hoist ke atas
 * berkas.
 */
let client: typeof import("./client");

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_API_URL", "http://localhost:8000");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_contoh");
  client = await import("./client");
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ambil", () => {
  it("meneruskan data dan meta apa adanya saat amplop sukses", async () => {
    const data = [{ idprov: "18", nama: "Lampung" }];
    const meta = { total: 1, hal: 1, batas: 50 };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ sukses: true, data, galat: null, meta }), { status: 200 }),
      ),
    );

    const hasil = await client.ambil("/api/wilayah/provinsi");

    expect(hasil).toEqual({ data, meta });
  });

  it("melempar GalatApi berkode dari galat.kode saat amplop sukses:false (404)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "DESA_TIDAK_ADA", pesan: "desa 9999999999 tidak dikenal" },
            meta: null,
          }),
          { status: 404 },
        ),
      ),
    );

    const janji = client.ambil("/api/model/kartu/9999999999");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "DESA_TIDAK_ADA", status: 404 });
  });

  it("melempar GalatApi berkode fallback GALAT_SERVER saat HTTP 500 berbadan HTML (bukan amplop)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html><body>500 Internal Server Error</body></html>", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const janji = client.ambil("/api/wilayah/ringkasan");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_SERVER", status: 500 });
  });

  it("melempar GalatApi berkode GALAT_JARINGAN berstatus 0 saat fetch reject (mis. jaringan putus)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const janji = client.ambil("/api/wilayah/ringkasan");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_JARINGAN", status: 0 });
  });

  it("melempar GalatApi berstatus 401 saat amplop sukses:false (rute bertoken tanpa sesi sah)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "TIDAK_BERWENANG", pesan: "perlu masuk" },
            meta: null,
          }),
          { status: 401 },
        ),
      ),
    );

    const janji = client.ambil("/api/profil/saya", { bertoken: true });

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "TIDAK_BERWENANG", status: 401 });
  });
});

describe("ambil — header Authorization (opsi bertoken)", () => {
  function stubFetchSukses() {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sukses: true, data: null, galat: null, meta: null }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("melampirkan header Authorization saat bertoken:true dan pengambil token mengembalikan token", async () => {
    client.daftarkanPengambilToken(async () => "token-abc");
    const fetchMock = stubFetchSukses();

    await client.ambil("/api/profil/saya", { bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.headers).toEqual({ Authorization: "Bearer token-abc" });
  });

  it("tidak melampirkan header saat bertoken:true tapi pengambil token mengembalikan null", async () => {
    client.daftarkanPengambilToken(async () => null);
    const fetchMock = stubFetchSukses();

    await client.ambil("/api/profil/saya", { bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.headers).toBeUndefined();
  });

  it("tidak melampirkan header pada rute publik walau token tersedia (tanpa opsi bertoken)", async () => {
    client.daftarkanPengambilToken(async () => "token-abc");
    const fetchMock = stubFetchSukses();

    await client.ambil("/api/wilayah/provinsi");

    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.headers).toBeUndefined();
  });
});

describe("kirim", () => {
  it("mengembalikan data dan meta apa adanya saat amplop sukses", async () => {
    const data = { jawaban: "Halo", jejak_fungsi: [], model: "x", putaran_alat: 1, peringatan: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ sukses: true, data, galat: null, meta: null }), { status: 200 }),
      ),
    );

    const hasil = await client.kirim("/api/chat", { badan: { messages: [] } });

    expect(hasil).toEqual({ data, meta: null });
  });

  it("melempar GalatApi berkode dari galat.kode saat amplop sukses:false berstatus 200", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "BADAN_TIDAK_SAH", pesan: "badan permintaan cacat" },
            meta: null,
          }),
          { status: 200 },
        ),
      ),
    );

    const janji = client.kirim("/api/chat", { badan: { messages: [] } });

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "BADAN_TIDAK_SAH", status: 200 });
  });

  it("melempar GalatApi berstatus 429 saat ambang laju terlampaui", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "TERLALU_BANYAK_PERMINTAAN", pesan: "coba sebentar lagi" },
            meta: null,
          }),
          { status: 429 },
        ),
      ),
    );

    const janji = client.kirim("/api/chat", { badan: { messages: [] } });

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "TERLALU_BANYAK_PERMINTAAN", status: 429 });
  });

  it("melempar GalatApi berkode fallback GALAT_SERVER saat badan respons bukan JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html><body>500 Internal Server Error</body></html>", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const janji = client.kirim("/api/chat", { badan: { messages: [] } });

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_SERVER", status: 500 });
  });

  it("melempar GalatApi berkode GALAT_JARINGAN berstatus 0 saat fetch reject (mis. jaringan putus)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    const janji = client.kirim("/api/chat", { badan: { messages: [] } });

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_JARINGAN", status: 0 });
  });

  it("mengirim metode POST dengan badan sebagai JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sukses: true, data: null, galat: null, meta: null }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await client.kirim("/api/chat", { badan: { messages: [{ role: "user", isi: "halo" }] } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ messages: [{ role: "user", isi: "halo" }] }));
  });
});

describe("kirim — header Authorization (opsi bertoken)", () => {
  function stubFetchSukses() {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sukses: true, data: null, galat: null, meta: null }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("melampirkan header Authorization saat bertoken:true dan pengambil token mengembalikan token", async () => {
    client.daftarkanPengambilToken(async () => "token-abc");
    const fetchMock = stubFetchSukses();

    await client.kirim("/api/chat", { badan: { messages: [] }, bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      Authorization: "Bearer token-abc",
    });
  });

  it("tidak melampirkan header Authorization saat opsi bertoken absen, walau token tersedia", async () => {
    client.daftarkanPengambilToken(async () => "token-abc");
    const fetchMock = stubFetchSukses();

    await client.kirim("/api/chat", { badan: { messages: [] } });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });

  it("tidak melampirkan header Authorization saat bertoken:true tapi pengambil token mengembalikan null", async () => {
    client.daftarkanPengambilToken(async () => null);
    const fetchMock = stubFetchSukses();

    await client.kirim("/api/chat", { badan: { messages: [] }, bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.headers).toEqual({ "Content-Type": "application/json" });
  });
});

describe("ambilGeo", () => {
  it("mengembalikan FeatureCollection geo mentah tanpa unwrap amplop", async () => {
    const geojson = { type: "FeatureCollection", features: [] };
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(JSON.stringify(geojson), { status: 200 })),
    );

    const hasil = await client.ambilGeo("1801");

    expect(hasil).toEqual(geojson);
  });
});

describe("ambilBerkas", () => {
  it("mengembalikan Blob PDF mentah tanpa unwrap amplop saat sukses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(new Blob(["%PDF-1.4"], { type: "application/pdf" }), { status: 200 }),
      ),
    );

    const hasil = await client.ambilBerkas("/api/laporan/1802040032");

    expect(hasil).toBeInstanceOf(Blob);
    expect(hasil.type).toBe("application/pdf");
  });

  it("melempar GalatApi berkode dari galat.kode saat amplop sukses:false (403)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "AKSES_DITOLAK", pesan: "akun ini belum punya akses ke fitur ini" },
            meta: null,
          }),
          { status: 403 },
        ),
      ),
    );

    const janji = client.ambilBerkas("/api/laporan/1802040032");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "AKSES_DITOLAK", status: 403 });
  });

  it("melempar GalatApi berkode fallback GALAT_SERVER saat badan galat bukan JSON (502 HTML)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html><body>502 Bad Gateway</body></html>", {
          status: 502,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const janji = client.ambilBerkas("/api/laporan/1802040032");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_SERVER", status: 502 });
  });

  it("melampirkan header Authorization saat bertoken:true dan pengambil token mengembalikan token", async () => {
    client.daftarkanPengambilToken(async () => "token-uji");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(new Blob(["%PDF-1.4"], { type: "application/pdf" }), { status: 200 }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await client.ambilBerkas("/api/laporan/1802040032", { bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit | undefined;
    expect(init?.headers).toEqual({ Authorization: "Bearer token-uji" });
  });
});

describe("hapus", () => {
  it("mengembalikan data amplop sukses apa adanya", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ sukses: true, data: { id: 7, terhapus: true }, galat: null, meta: null }),
          { status: 200 },
        ),
      ),
    );

    const hasil = await client.hapus("/api/admin/berita/7");

    expect(hasil).toEqual({ data: { id: 7, terhapus: true }, meta: null });
  });

  it("melempar GalatApi berkode dari galat.kode saat amplop sukses:false (404)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            sukses: false,
            data: null,
            galat: { kode: "BERITA_TIDAK_ADA", pesan: "berita 7 tidak ada" },
            meta: null,
          }),
          { status: 404 },
        ),
      ),
    );

    const janji = client.hapus("/api/admin/berita/7");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "BERITA_TIDAK_ADA", status: 404 });
  });

  it("melempar GalatApi berkode fallback GALAT_SERVER saat badan respons bukan JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response("<html><body>500 Internal Server Error</body></html>", {
          status: 500,
          headers: { "content-type": "text/html" },
        }),
      ),
    );

    const janji = client.hapus("/api/admin/berita/7");

    await expect(janji).rejects.toBeInstanceOf(client.GalatApi);
    await expect(janji).rejects.toMatchObject({ kode: "GALAT_SERVER", status: 500 });
  });

  it("mengirim metode DELETE berheader Authorization tanpa Content-Type", async () => {
    client.daftarkanPengambilToken(async () => "token-uji");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ sukses: true, data: null, galat: null, meta: null }), {
        status: 200,
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await client.hapus("/api/admin/berita/7", { bertoken: true });

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("DELETE");
    expect(init.headers).toEqual({ Authorization: "Bearer token-uji" });
  });
});
