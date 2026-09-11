import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  apakahSesiKedaluwarsa,
  bacaAktivitasTerakhir,
  DURASI_TIDAK_AKTIF_MS,
  hapusCatatanAktivitas,
  KUNCI_STORAGE_AKTIVITAS,
  pasangPemantauInaktivitas,
  tulisAktivitasTerbaru,
} from "./sesi-timeout";

describe("sesi-timeout (Idle Session Timeout)", () => {
  let mockStorage: Record<string, string> = {};
  let originalWindow: typeof globalThis.window;
  let originalDocument: typeof globalThis.document;
  let originalLocalStorage: typeof globalThis.localStorage;

  beforeEach(() => {
    mockStorage = {};
    vi.useFakeTimers();

    const storage = {
      getItem: (k: string) => mockStorage[k] ?? null,
      setItem: (k: string, v: string) => {
        mockStorage[k] = v;
      },
      removeItem: (k: string) => {
        delete mockStorage[k];
      },
      clear: () => {
        mockStorage = {};
      },
    };

    class MockWindow extends EventTarget {
      localStorage = storage;
      setTimeout = globalThis.setTimeout.bind(globalThis);
      clearTimeout = globalThis.clearTimeout.bind(globalThis);
      setInterval = globalThis.setInterval.bind(globalThis);
      clearInterval = globalThis.clearInterval.bind(globalThis);
    }

    class MockDocument extends EventTarget {
      visibilityState: DocumentVisibilityState = "visible";
    }

    const mockWin = new MockWindow();
    const mockDoc = new MockDocument();

    originalWindow = globalThis.window;
    originalDocument = globalThis.document;
    originalLocalStorage = globalThis.localStorage;

    // @ts-expect-error mock window for test
    globalThis.window = mockWin;
    // @ts-expect-error mock document for test
    globalThis.document = mockDoc;
    // @ts-expect-error mock localStorage for test
    globalThis.localStorage = storage;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();

    if (originalWindow !== undefined) globalThis.window = originalWindow;
    else delete (globalThis as { window?: unknown }).window;

    if (originalDocument !== undefined) globalThis.document = originalDocument;
    else delete (globalThis as { document?: unknown }).document;

    if (originalLocalStorage !== undefined) globalThis.localStorage = originalLocalStorage;
    else delete (globalThis as { localStorage?: unknown }).localStorage;
  });

  it("mengembalikan null saat belum ada catatan aktivitas", () => {
    expect(bacaAktivitasTerakhir()).toBeNull();
  });

  it("mencatat dan membaca timestamp aktivitas terbaru", () => {
    tulisAktivitasTerbaru(1700000000000);
    expect(bacaAktivitasTerakhir()).toBe(1700000000000);
  });

  it("menghapus catatan aktivitas", () => {
    tulisAktivitasTerbaru(1700000000000);
    expect(bacaAktivitasTerakhir()).toBe(1700000000000);

    hapusCatatanAktivitas();
    expect(bacaAktivitasTerakhir()).toBeNull();
  });

  it("menentukan apakah sesi sudah kedaluwarsa dengan tepat", () => {
    const waktuMulai = 1000000;
    tulisAktivitasTerbaru(waktuMulai);

    // Belum kedaluwarsa (mis. baru 10 menit berlalu)
    const sepuluhMenit = 10 * 60 * 1000;
    expect(apakahSesiKedaluwarsa(DURASI_TIDAK_AKTIF_MS, waktuMulai + sepuluhMenit)).toBe(false);

    // Tepat 30 menit berlalu
    const tigaPuluhMenit = 30 * 60 * 1000;
    expect(apakahSesiKedaluwarsa(DURASI_TIDAK_AKTIF_MS, waktuMulai + tigaPuluhMenit)).toBe(true);

    // Lebih dari 30 menit
    expect(apakahSesiKedaluwarsa(DURASI_TIDAK_AKTIF_MS, waktuMulai + tigaPuluhMenit + 1000)).toBe(true);
  });

  it("memanggil onTimeout saat pengguna tidak aktif melebihi batas waktu", () => {
    const onTimeout = vi.fn();
    const batal = pasangPemantauInaktivitas({
      onTimeout,
      batasMs: 1000,
      intervalMs: 100,
    });

    expect(onTimeout).not.toHaveBeenCalled();

    // Lewati 500ms (belum timeout)
    vi.advanceTimersByTime(500);
    expect(onTimeout).not.toHaveBeenCalled();

    // Lewati sisa waktu hingga melewati 1000ms
    vi.advanceTimersByTime(600);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    batal();
  });

  it("memperbarui waktu aktivitas saat terjadi interaksi pengguna", () => {
    const onTimeout = vi.fn();
    const batal = pasangPemantauInaktivitas({
      onTimeout,
      batasMs: 1000,
      intervalMs: 100,
    });

    // Maju 700ms
    vi.advanceTimersByTime(700);

    // Pengguna menekan tombol keyboard (interaksi)
    window.dispatchEvent(new Event("keydown"));

    // Maju 500ms lagi (total 1200ms dari awal, tapi baru 500ms sejak keydown)
    vi.advanceTimersByTime(500);
    expect(onTimeout).not.toHaveBeenCalled();

    // Maju 600ms lagi (melewati 1000ms sejak keydown)
    vi.advanceTimersByTime(600);
    expect(onTimeout).toHaveBeenCalledTimes(1);

    batal();
  });

  it("langsung memicu onTimeout saat tab kembali aktif jika sudah melewati batas inaktivitas", () => {
    const onTimeout = vi.fn();
    const batal = pasangPemantauInaktivitas({
      onTimeout,
      batasMs: 1000,
      intervalMs: 5000, // Interval besar agar pemicu utamanya adalah visibilitychange
    });

    // Maju waktu melampaui batas (1500ms)
    vi.advanceTimersByTime(1500);
    expect(onTimeout).not.toHaveBeenCalled(); // Karena interval belum tick

    // Tab kembali fokus/visible
    window.dispatchEvent(new Event("focus"));
    expect(onTimeout).toHaveBeenCalledTimes(1);

    batal();
  });

  it("menyinkronkan aktivitas dari tab lain melalui event storage", () => {
    const onTimeout = vi.fn();
    const batal = pasangPemantauInaktivitas({
      onTimeout,
      batasMs: 1000,
      intervalMs: 100,
    });

    vi.advanceTimersByTime(700);

    // Tab lain menulis timestamp baru
    const waktuTabLain = Date.now();
    const event = new Event("storage");
    Object.assign(event, {
      key: KUNCI_STORAGE_AKTIVITAS,
      newValue: waktuTabLain.toString(),
    });
    window.dispatchEvent(event);

    // Maju 500ms lagi
    vi.advanceTimersByTime(500);
    expect(onTimeout).not.toHaveBeenCalled();

    batal();
  });
});
