import { describe, expect, it } from "vitest";

import {
  hapusDesa,
  labelKemajuan,
  MAKS_DESA_SEGARKAN,
  ringkasHasil,
  tambahDesa,
  type DesaTerpilih,
} from "./segarkan";

function buatDesa(iddesa: string): DesaTerpilih {
  return { iddesa, nmdesa: `Desa ${iddesa}`, nmkec: "Kec Uji" };
}

describe("tambahDesa", () => {
  it("desa baru masuk di ekor daftar", () => {
    const hasil = tambahDesa([buatDesa("1")], buatDesa("2"));

    expect(hasil).toEqual([buatDesa("1"), buatDesa("2")]);
  });

  it("iddesa yang sudah ada tidak menambah panjang", () => {
    const hasil = tambahDesa([buatDesa("1")], buatDesa("1"));

    expect(hasil.length).toBe(1);
  });

  it("daftar penuh menolak desa ke-51", () => {
    const daftarPenuh = Array.from({ length: MAKS_DESA_SEGARKAN }, (_, i) =>
      buatDesa(String(i)),
    );

    const hasil = tambahDesa(daftarPenuh, buatDesa("baru"));

    expect(hasil.length).toBe(MAKS_DESA_SEGARKAN);
  });

  it("daftar asal tidak bermutasi", () => {
    const daftarAsal = [buatDesa("1")];
    const panjangSebelum = daftarAsal.length;

    tambahDesa(daftarAsal, buatDesa("2"));

    expect(daftarAsal.length).toBe(panjangSebelum);
  });
});

describe("hapusDesa", () => {
  it("iddesa yang ada terbuang dari daftar", () => {
    const hasil = hapusDesa([buatDesa("1"), buatDesa("2")], "1");

    expect(hasil).toEqual([buatDesa("2")]);
  });

  it("iddesa yang tidak ada tidak mengubah isi daftar", () => {
    const hasil = hapusDesa([buatDesa("1")], "tidak-ada");

    expect(hasil).toEqual([buatDesa("1")]);
  });
});

describe("labelKemajuan", () => {
  it("pekerjaan sebagian menghasilkan kalimat kemajuan", () => {
    const hasil = labelKemajuan(12, 30);

    expect(hasil).toBe("Selesai 12 dari 30 desa");
  });
});

describe("ringkasHasil", () => {
  it("cacah bernilai nol tetap tertulis", () => {
    const hasil = ringkasHasil({
      iddesa: "1234",
      n_baru: 0,
      n_duplikat: 0,
      n_dibuang: 0,
      n_gagal: 0,
      galat: null,
    });

    expect(hasil).toBe("baru 0 · duplikat 0 · dibuang 0 · gagal 0");
  });
});
