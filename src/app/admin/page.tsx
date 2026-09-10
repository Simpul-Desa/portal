import { HalamanAdmin } from "@/features/admin/components/halaman-admin";

/**
 * Rute `/admin` (PRD app §5.7). Tipis seperti `page.tsx` akar: seluruh isinya
 * milik komponen klien. TANPA pembungkus `Suspense` — berbeda dari `/`,
 * pohon ini tidak memakai `useSearchParams` (tab aktif hidup di state lokal),
 * jadi rutenya tetap prerender statis apa adanya.
 *
 * Penjagaan peran sungguhan ada di `api/`: kelima rute `/api/admin/*`
 * digerbangi `wajib_admin` dan menjawab 401/403 tanpa token admin. Gerbang di
 * `HalamanAdmin` hanya menyembunyikan antarmukanya.
 */
export default function Admin() {
  return <HalamanAdmin />;
}
