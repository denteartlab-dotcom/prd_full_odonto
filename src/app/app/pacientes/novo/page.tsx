import { getSession } from "@/lib/auth";
import { PatientFormPage } from "@/components/patients/PatientFormPage";

export default async function NovoPacientePage() {
  const session = await getSession();
  if (!session) return null;

  return <PatientFormPage userName={session.name} role={session.role} />;
}
