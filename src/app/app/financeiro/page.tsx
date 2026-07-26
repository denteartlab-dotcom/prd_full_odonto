import { FinanceiroGeralPage } from "@/components/financeiro/geral/FinanceiroGeralPage";
import { getSession } from "@/lib/auth";

export default async function FinanceiroPage() {
  const session = await getSession();
  if (!session) return null;
  return <FinanceiroGeralPage />;
}
