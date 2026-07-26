import { getSession } from "@/lib/auth";
import { ReceivablesPage } from "@/components/financeiro/ReceivablesPage";

export default async function ReceitasPage() {
  const session = await getSession();
  if (!session) return null;
  return <ReceivablesPage />;
}
