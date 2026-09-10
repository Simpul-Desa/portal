import { describe, expect, it } from "vitest";

import { pilihKeadaan } from "./keadaan";

describe("pilihKeadaan", () => {
  it("mengembalikan isi saat tidak ada penanda apa pun yang menyala", () => {
    expect(pilihKeadaan({})).toBe("isi");
  });

  it("mengembalikan muat saat isPending menyala", () => {
    expect(pilihKeadaan({ isPending: true })).toBe("muat");
  });

  it("mengembalikan tertunda saat isPaused menyala", () => {
    expect(pilihKeadaan({ isPaused: true })).toBe("tertunda");
  });

  it("mengembalikan galat saat isError menyala", () => {
    expect(pilihKeadaan({ isError: true })).toBe("galat");
  });

  it("mengembalikan kosong saat kosong menyala tanpa penanda lain", () => {
    expect(pilihKeadaan({ kosong: true })).toBe("kosong");
  });

  it("galat menang atas kosong saat keduanya menyala", () => {
    expect(pilihKeadaan({ isError: true, kosong: true })).toBe("galat");
  });

  it("tertunda menang atas muat saat keduanya menyala", () => {
    expect(pilihKeadaan({ isPaused: true, isPending: true })).toBe("tertunda");
  });
});
