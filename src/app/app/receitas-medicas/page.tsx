import { PrescriptionsModulePage } from "@/components/prescriptions/PrescriptionsModulePage";
import { getSession } from "@/lib/auth";

export default async function ReceitasMedicasPage() {
  const session = await getSession();
  if (!session) return null;

  return <PrescriptionsModulePage />;
}
