import { Card, PageHeader, Badge } from "@/components/ui";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function PermissoesPage() {
  const session = await getSession();
  if (!session) return null;
  const users = await prisma.user.findMany({
    where: { clinicId: session.clinicId },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Permissões" description="Papéis e acessos (modules/permissions + auth)." />
      <Card title="Usuários da clínica">
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <Badge tone="blue">{u.role}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
