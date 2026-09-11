import { MasukForm } from "@/features/auth/components/masuk-form";

/** `searchParams` di Next 16 adalah Promise — wajib `await` (server component). */
function bacaLanjut(nilai: string | string[] | undefined): string {
  return typeof nilai === "string" ? nilai : "/";
}

function bacaAlasan(nilai: string | string[] | undefined): string | undefined {
  return typeof nilai === "string" ? nilai : undefined;
}

export default async function MasukPage({ searchParams }: PageProps<"/masuk">) {
  const params = await searchParams;

  return (
    <MasukForm
      lanjut={bacaLanjut(params.lanjut)}
      alasan={bacaAlasan(params.alasan)}
    />
  );
}
