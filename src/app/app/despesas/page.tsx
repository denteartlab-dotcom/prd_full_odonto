import { ContasAPagarPage } from "@/components/financeiro/contas-a-pagar/ContasAPagarPage";
import { getSession } from "@/lib/auth";

export default async function DespesasPage() {
  const session = await getSession();
  if (!session) return null;
  return <ContasAPagarPage />;
}
