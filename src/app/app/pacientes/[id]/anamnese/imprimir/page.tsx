import { getSession } from "@/lib/auth";
import { AnamnesisPrintPage } from "@/components/anamnesis/AnamnesisPrintPage";

export default async function AnamneseImprimirPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  return <AnamnesisPrintPage patientId={id} />;
}
