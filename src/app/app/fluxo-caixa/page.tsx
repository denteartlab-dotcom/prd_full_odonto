import { getSession } from "@/lib/auth";
import { FluxoCaixaPage } from "@/components/financeiro/fluxo-caixa/FluxoCaixaPage";

export default async function FluxoCaixaRoutePage() {
  const session = await getSession();
  if (!session) return null;
  return <FluxoCaixaPage />;
}
