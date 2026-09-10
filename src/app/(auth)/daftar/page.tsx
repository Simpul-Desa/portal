import { DaftarForm } from "@/features/auth/components/daftar-form";

/** `searchParams` di Next 16 adalah Promise — wajib `await` (server component). */
function bacaLanjut(nilai: string | string[] | undefined): string {
  return typeof nilai === "string" ? nilai : "/";
}

export default async function DaftarPage({ searchParams }: PageProps<"/daftar">) {
  const { lanjut } = await searchParams;

  return <DaftarForm lanjut={bacaLanjut(lanjut)} />;
}
