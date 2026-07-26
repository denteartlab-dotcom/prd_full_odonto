import { getSession } from "@/lib/auth";
import { ClinicSettingsPage } from "@/components/settings/ClinicSettingsPage";

export default async function ConfiguracoesPage() {
  const session = await getSession();
  if (!session) return null;
  return <ClinicSettingsPage />;
}
