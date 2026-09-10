/**
 * Sumber tunggal batas lebar panel kiri. Angka di sini HARUS sama dengan
 * token `--spacing-panel-min` / `--spacing-panel` / `--spacing-panel-max` di
 * `src/app/globals.css` (yang menurunkan kelas utilitas `w-panel-min` /
 * `w-panel` / `w-panel-max`). Diekspor sebagai angka murni — bukan string
 * token — karena dipakai logika clamp JS saat drag (`left-panel.tsx`), yang
 * butuh aritmetika, bukan nilai CSS. Ubah token CSS dan angka di sini
 * bersamaan; jangan salah satu.
 */
export const PANEL_MIN = 400;
export const PANEL_DEFAULT = 480;
export const PANEL_MAX = 640;
