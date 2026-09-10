/**
 * Kelas ring fokus bersama — satu sumber dipakai semua elemen fokusable di
 * shell (`side-rail.tsx`, `left-panel.tsx`, `map-stage.tsx`). Token warna dari
 * DESIGN.md § Interaction accents: ring 2px `focus` (#0d8a7e) dengan offset
 * 2px, tampil hanya saat `:focus-visible` (bukan tiap klik mouse).
 *
 * GOTCHA Tailwind v4.3.3: JANGAN tambahkan `outline-none` tanpa syarat di
 * sini. `outline-none` menyetel `outline-style: none` tanpa syarat (var
 * `--tw-outline-style` tertimpa `none`), dan aturan itu menimpa
 * `outline-style` dari varian `focus-visible:outline-2` walau `:focus-visible`
 * sedang aktif — ring jadi tidak pernah tampil. Perbaikannya: `outline-style`
 * hanya disetel LEWAT varian (`focus-visible:outline-solid`), tidak pernah
 * tanpa syarat. Elemen tanpa fokus otomatis tanpa outline (nilai awal CSS
 * `outline-style` memang `none`) — tidak perlu `outline-none` sama sekali.
 *
 * `FOCUS_RING_WITHIN` dipakai saat fokus sungguh jatuh ke WADAH, bukan ke
 * `<input>` di dalamnya (`AuthField`, `SelectPeran`, `CariDesaAdmin`,
 * `SearchBox`) — utilitasnya identik, hanya varian `focus-within:` yang
 * beda dari `focus-visible:`. Beda itu disengaja: `focus-within` menyala
 * pada SETIAP klik mouse ke wadah, sementara `focus-visible` hanya menyala
 * saat navigasi keyboard — makanya keduanya dua konstanta terpisah, bukan
 * satu varian yang dipakai bergantian.
 */
export const FOCUS_RING =
  "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

export const FOCUS_RING_WITHIN =
  "focus-within:outline-solid focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-focus";
