/**
 * Pemantau inaktivitas sesi pengguna (Idle Session Timeout).
 *
 * Aturan:
 * 1. Batas inaktivitas default adalah 30 menit (1.800.000 ms).
 * 2. Aktivitas pengguna (mouse, keyboard, touch, scroll) memperbarui timestamp.
 * 3. Timestamp disinkronkan lintas-tab via `localStorage` dan event `storage`.
 * 4. Pengecekan dilakukan berkala via interval dan saat tab kembali aktif
 *    (event `visibilitychange` / `focus`).
 * 5. Ketika batas 30 menit terlampaui tanpa aktivitas, pemicu `onTimeout`
 *    dijalankan untuk melakukan auto-logout.
 */

export const DURASI_TIDAK_AKTIF_MS = 30 * 60 * 1000; // 30 menit
export const KUNCI_STORAGE_AKTIVITAS = "simpul_aktivitas_terakhir";
export const THROTTLE_AKTIVITAS_MS = 5 * 1000; // Throttle 5 detik
export const INTERVAL_PEMERIKSAAN_MS = 15 * 1000; // Periksa tiap 15 detik

/**
 * Membaca timestamp aktivitas terakhir dari localStorage.
 */
export function bacaAktivitasTerakhir(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const nilai = localStorage.getItem(KUNCI_STORAGE_AKTIVITAS);
    if (!nilai) return null;
    const parsed = Number.parseInt(nilai, 10);
    return Number.isFinite(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Menuliskan waktu aktivitas terbaru ke localStorage.
 */
export function tulisAktivitasTerbaru(waktuMs: number = Date.now()): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KUNCI_STORAGE_AKTIVITAS, waktuMs.toString());
  } catch {
    // Abaikan jika storage diblokir
  }
}

/**
 * Memeriksa apakah waktu sejak aktivitas terakhir sudah mencapai batas kedaluwarsa.
 */
export function apakahSesiKedaluwarsa(
  batasMs: number = DURASI_TIDAK_AKTIF_MS,
  waktuSekarangMs: number = Date.now(),
): boolean {
  const terakhir = bacaAktivitasTerakhir();
  if (!terakhir) return false;
  return waktuSekarangMs - terakhir >= batasMs;
}

/**
 * Menghapus catatan aktivitas dari localStorage.
 */
export function hapusCatatanAktivitas(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KUNCI_STORAGE_AKTIVITAS);
  } catch {
    // Abaikan
  }
}

export interface OpsiPemantauInaktivitas {
  onTimeout: () => void;
  batasMs?: number;
  intervalMs?: number;
}

/**
 * Memasang pendengar aktivitas pengguna dan timer pemantau inaktivitas.
 * Mengembalikan fungsi cleanup untuk membatalkan semua listener.
 */
export function pasangPemantauInaktivitas({
  onTimeout,
  batasMs = DURASI_TIDAK_AKTIF_MS,
  intervalMs = INTERVAL_PEMERIKSAAN_MS,
}: OpsiPemantauInaktivitas): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  let waktuLokalTerakhir = Date.now();
  let waktuTulisTerakhir = 0;
  let sudahTimeout = false;

  function catat(): void {
    if (sudahTimeout) return;
    const sekarang = Date.now();
    waktuLokalTerakhir = sekarang;

    // Throttled write ke localStorage
    if (sekarang - waktuTulisTerakhir >= THROTTLE_AKTIVITAS_MS) {
      waktuTulisTerakhir = sekarang;
      tulisAktivitasTerbaru(sekarang);
    }
  }

  function periksa(): void {
    if (sudahTimeout) return;
    const sekarang = Date.now();
    const dariStorage = bacaAktivitasTerakhir();
    const acuan = Math.max(waktuLokalTerakhir, dariStorage ?? 0);

    if (sekarang - acuan >= batasMs) {
      sudahTimeout = true;
      hapusCatatanAktivitas();
      onTimeout();
    }
  }

  // Event aktivitas yang dipantau
  const eventDaftar = ["mousedown", "keydown", "touchstart", "scroll"] as const;
  const handleAktivitas = () => catat();

  for (const namaEvent of eventDaftar) {
    window.addEventListener(namaEvent, handleAktivitas, { passive: true });
  }

  // Mousemove throttled
  let mouseMoveTimer: number | null = null;
  const handleMouseMove = () => {
    if (mouseMoveTimer !== null) return;
    mouseMoveTimer = window.setTimeout(() => {
      mouseMoveTimer = null;
      catat();
    }, 1000);
  };
  window.addEventListener("mousemove", handleMouseMove, { passive: true });

  // Sinkronisasi aktivitas lintas tab
  const handleStorage = (e: StorageEvent) => {
    if (e.key === KUNCI_STORAGE_AKTIVITAS && e.newValue) {
      const parsed = Number.parseInt(e.newValue, 10);
      if (Number.isFinite(parsed) && parsed > waktuLokalTerakhir) {
        waktuLokalTerakhir = parsed;
      }
    }
  };
  window.addEventListener("storage", handleStorage);

  // Periksa langsung saat tab kembali fokus/terlihat
  const handleVisibilityChange = () => {
    if (document.visibilityState === "visible") {
      periksa();
    }
  };
  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("focus", periksa);

  // Timer interval berkala
  const timerInterval = window.setInterval(periksa, intervalMs);

  // Inisialisasi catatan awal
  catat();

  return () => {
    for (const namaEvent of eventDaftar) {
      window.removeEventListener(namaEvent, handleAktivitas);
    }
    window.removeEventListener("mousemove", handleMouseMove);
    if (mouseMoveTimer !== null) {
      window.clearTimeout(mouseMoveTimer);
    }
    window.removeEventListener("storage", handleStorage);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("focus", periksa);
    window.clearInterval(timerInterval);
  };
}
