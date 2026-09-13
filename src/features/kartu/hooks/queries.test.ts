import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/api/client", () => ({
  kirim: vi.fn(),
  ambil: vi.fn(),
}));

import { kirim } from "@/lib/api/client";
import { aiInsightBuat } from "@/lib/api/endpoints";

const kirimMock = vi.mocked(kirim);

describe("aiInsightBuat", () => {
  it("mengirim permintaan POST ke /api/ai-insight dengan bertoken true", async () => {
    const mockData = {
      iddesa: "1801040001",
      kondisi_ekonomi: "Kondisi ekonomi desa...",
      rekomendasi_aktor: [{ aktor: "Pemerintah", aksi: "Bangun jalan" }],
      teks_lengkap: "Teks lengkap...",
    };
    kirimMock.mockResolvedValueOnce({ data: mockData, meta: null });

    const hasil = await aiInsightBuat("1801040001", true);

    expect(kirimMock).toHaveBeenCalledWith("/api/ai-insight", {
      badan: { iddesa: "1801040001", generate_ulang: true },
      bertoken: true,
    });
    expect(hasil.data).toEqual(mockData);
  });
});
