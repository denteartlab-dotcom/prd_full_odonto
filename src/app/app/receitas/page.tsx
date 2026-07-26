import { ContasAReceberPage } from "@/components/financeiro/contas-a-receber/ContasAReceberPage";
import { getSession } from "@/lib/auth";

export default async function ReceitasPage() {
  const session = await getSession();
  if (!session) return null;
  return <ContasAReceberPage />;
}
