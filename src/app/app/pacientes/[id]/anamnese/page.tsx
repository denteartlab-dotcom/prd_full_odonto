import { getSession } from "@/lib/auth";
import { AnamnesisPage } from "@/components/anamnesis";

export default async function PacienteAnamnesePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  return (
    <AnamnesisPage
      patientId={id}
      userName={session.name}
      role={session.role}
    />
  );
}
