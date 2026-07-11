import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SchedulePage } from "@/components/schedule/SchedulePage";
import { toIsoDate } from "@/lib/schedule-mock";

export default async function AgendaPage() {
  const session = await getSession();
  if (!session) return null;

  const clinic = await prisma.clinic.findUnique({
    where: { id: session.clinicId },
    select: { name: true },
  });

  const initialDate = toIsoDate(new Date());

  return (
    <SchedulePage
      userName={session.name}
      role={session.role}
      initialDate={initialDate}
      clinicName={clinic?.name}
    />
  );
}
