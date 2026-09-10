import { describe, expect, it } from "vitest";

import { namaLaporan } from "./unduh";

describe("namaLaporan", () => {
  it("membangun nama berkas laporan-desa-<iddesa>.pdf", () => {
    const hasil = namaLaporan("1802040032");

    expect(hasil).toBe("laporan-desa-1802040032.pdf");
  });

  it("hasilnya bebas dari spasi dan karakter path", () => {
    const hasil = namaLaporan("1802040032");

    expect(hasil).not.toMatch(/[\s/\\]/);
  });
});
