import { getSession } from "@/lib/auth";
import { PatientsPage } from "@/components/patients-list";

export default async function PacientesPage() {
  const session = await getSession();
  if (!session) return null;

  return <PatientsPage userName={session.name} role={session.role} />;
}
