import { describe, expect, it } from "vitest";

import { adalahPeranBaru, cariPenggunaSah, labelAkun } from "./pengguna";

describe("cariPenggunaSah", () => {
  it("nilai kosong sah karena berarti tanpa saringan", () => {
    const hasil = cariPenggunaSah("");

    expect(hasil).toBe(true);
  });

  it("email biasa sah", () => {
    const hasil = cariPenggunaSah("adek@bssn.go.id");

    expect(hasil).toBe(true);
  });

  it("nilai berspasi sah", () => {
    const hasil = cariPenggunaSah("nama instansi");

    expect(hasil).toBe(true);
  });

  it("metakarakter persen tidak sah", () => {
    const hasil = cariPenggunaSah("a%b");

    expect(hasil).toBe(false);
  });

  it("nilai lebih dari 64 karakter tidak sah", () => {
    const hasil = cariPenggunaSah("a".repeat(65));

    expect(hasil).toBe(false);
  });
});

describe("labelAkun", () => {
  it("email terisi dikembalikan apa adanya", () => {
    const hasil = labelAkun("a@b.id");

    expect(hasil).toBe("a@b.id");
  });

  it("email null menghasilkan keterangan tanpa email", () => {
    const hasil = labelAkun(null);

    expect(hasil).toBe("Tanpa email");
  });
});

describe("adalahPeranBaru", () => {
  it("peran tersimpan menghasilkan true", () => {
    const hasil = adalahPeranBaru("pemerintah");

    expect(hasil).toBe(true);
  });

  it("peran asing menghasilkan false", () => {
    const hasil = adalahPeranBaru("superadmin");

    expect(hasil).toBe(false);
  });
});
