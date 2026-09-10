import { MasukForm } from "@/features/auth/components/masuk-form";

/** `searchParams` di Next 16 adalah Promise — wajib `await` (server component). */
function bacaLanjut(nilai: string | string[] | undefined): string {
  return typeof nilai === "string" ? nilai : "/";
}

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  const { lanjut } = await searchParams;

  return <MasukForm lanjut={bacaLanjut(lanjut)} />;
}
