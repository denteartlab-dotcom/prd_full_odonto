import { getSession } from "@/lib/auth";
import { DashboardView } from "@/components/dashboard/DashboardView";

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) return null;

  return <DashboardView userName={session.name} role={session.role} />;
}
