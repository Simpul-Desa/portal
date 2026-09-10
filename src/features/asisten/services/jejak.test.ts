import { describe, expect, it } from "vitest";

import type { JejakFungsi } from "../types";
import { barisJejak } from "./jejak";

function panggilan(over: Partial<JejakFungsi> = {}): JejakFungsi {
  return { fungsi: "kartu_ekonomi", argumen: { iddesa: "3573010001" }, status: "sukses", ...over };
}

describe("barisJejak", () => {
  it("kartu_ekonomi dengan iddesa sah menghasilkan tujuan lensa kartu berisi desa", () => {
    const hasil = barisJejak([panggilan({ fungsi: "kartu_ekonomi", argumen: { iddesa: "3573010001" } })]);

    expect(hasil[0].tujuan).toEqual({ lensa: "kartu", desa: "3573010001" });
  });

  it("peta_peran menghasilkan tujuan lensa peta-peran", () => {
    const hasil = barisJejak([panggilan({ fungsi: "peta_peran", argumen: { iddesa: "3573010001" } })]);

    expect(hasil[0].tujuan).toEqual({ lensa: "peta-peran", desa: "3573010001" });
  });

  it("desa_kembar menghasilkan tujuan lensa desa-kembar", () => {
    const hasil = barisJejak([panggilan({ fungsi: "desa_kembar", argumen: { iddesa: "3573010001" } })]);

    expect(hasil[0].tujuan).toEqual({ lensa: "desa-kembar", desa: "3573010001" });
  });

  it("berita_desa menuju lensa kartu, bukan lensa tersendiri", () => {
    const hasil = barisJejak([panggilan({ fungsi: "berita_desa", argumen: { iddesa: "3573010001" } })]);

    expect(hasil[0].tujuan).toEqual({ lensa: "kartu", desa: "3573010001" });
  });

  it("jalur_ekonomi dengan varian dan kab sah membawa keduanya di tujuan", () => {
    const hasil = barisJejak([
      panggilan({ fungsi: "jalur_ekonomi", argumen: { varian: "wisata", kab: "3573" } }),
    ]);

    expect(hasil[0].tujuan).toEqual({ lensa: "jalur-ekonomi", varian: "wisata", kab: "3573" });
  });

  it("jalur_ekonomi dengan varian asing menghasilkan tujuan null", () => {
    const hasil = barisJejak([panggilan({ fungsi: "jalur_ekonomi", argumen: { varian: "kopi" } })]);

    expect(hasil[0].tujuan).toBeNull();
  });

  it("citra_potensi dengan prov dan target sah membawa keduanya di tujuan", () => {
    const hasil = barisJejak([
      panggilan({ fungsi: "citra_potensi", argumen: { prov: "18", target: "kom_prov_horti_01" } }),
    ]);

    expect(hasil[0].tujuan).toEqual({ lensa: "citra-potensi", prov: "18", target: "kom_prov_horti_01" });
  });

  it("citra_potensi dengan target berspasi menghasilkan tujuan null", () => {
    const hasil = barisJejak([
      panggilan({ fungsi: "citra_potensi", argumen: { prov: "18", target: "kom prov horti" } }),
    ]);

    expect(hasil[0].tujuan).toBeNull();
  });

  it("iddesa 9 digit menghasilkan tujuan null", () => {
    const hasil = barisJejak([panggilan({ argumen: { iddesa: "357301000" } })]);

    expect(hasil[0].tujuan).toBeNull();
  });

  it("iddesa bukan string menghasilkan tujuan null", () => {
    const hasil = barisJejak([panggilan({ argumen: { iddesa: 3573010001 } })]);

    expect(hasil[0].tujuan).toBeNull();
  });

  it("status gagal dengan argumen sah tetap menghasilkan tujuan null", () => {
    const hasil = barisJejak([panggilan({ status: "gagal" })]);

    expect(hasil[0].tujuan).toBeNull();
  });

  it("alat tak dikenal memakai nama fungsi sebagai label dan tujuan null", () => {
    const hasil = barisJejak([panggilan({ fungsi: "alat_masa_depan", argumen: {} })]);

    expect(hasil[0].label).toBe("alat_masa_depan");
    expect(hasil[0].tujuan).toBeNull();
  });

  it("cari_desa menghasilkan rincian bertanda kutip dan tujuan null", () => {
    const hasil = barisJejak([panggilan({ fungsi: "cari_desa", argumen: { nama: "sukarame" } })]);

    expect(hasil[0].rincian).toBe('"sukarame"');
    expect(hasil[0].tujuan).toBeNull();
  });

  it("wilayah_ringkasan menghasilkan rincian kosong", () => {
    const hasil = barisJejak([panggilan({ fungsi: "wilayah_ringkasan", argumen: {} })]);

    expect(hasil[0].rincian).toBe("");
  });

  it("cek_cakupan_wilayah memakai label GLOSSARY dan tujuan null (bukan lensa)", () => {
    const hasil = barisJejak([panggilan({ fungsi: "cek_cakupan_wilayah", argumen: { nama: "Kediri" } })]);

    expect(hasil[0].label).toBe("Cek cakupan wilayah");
    expect(hasil[0].tujuan).toBeNull();
    expect(hasil[0].rincian).toBe('"Kediri"');
  });

  it("dua panggilan identik menghasilkan satu baris", () => {
    const hasil = barisJejak([panggilan(), panggilan()]);

    expect(hasil).toHaveLength(1);
  });

  it("fungsi sama dengan argumen berbeda menghasilkan dua baris urutan asli", () => {
    const hasil = barisJejak([
      panggilan({ argumen: { iddesa: "3573010001" } }),
      panggilan({ argumen: { iddesa: "3573010002" } }),
    ]);

    expect(hasil).toHaveLength(2);
    expect(hasil.map((b) => b.tujuan?.desa)).toEqual(["3573010001", "3573010002"]);
  });

  it("argumen sama dengan urutan kunci berbeda tetap dianggap satu baris", () => {
    const hasil = barisJejak([
      panggilan({ fungsi: "jalur_ekonomi", argumen: { varian: "wisata", kab: "3573" } }),
      panggilan({ fungsi: "jalur_ekonomi", argumen: { kab: "3573", varian: "wisata" } }),
    ]);

    expect(hasil).toHaveLength(1);
  });
});
