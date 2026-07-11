import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    select: { name: true },
  });

  return (
    <AppShell
      userName={session.name}
      clinicName={clinic?.name || "Clínica"}
      role={session.role}
    >
      {children}
    </AppShell>
  );
}
