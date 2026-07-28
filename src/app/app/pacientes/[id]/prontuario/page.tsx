import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { PatientProfilePage } from "@/components/patient-profile";

export default async function PacienteProntuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const { id } = await params;

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-500">Carregando prontuário...</div>}>
      <PatientProfilePage
        patientId={id}
        userName={session.name}
        role={session.role}
        initialTab="prontuario"
      />
    </Suspense>
  );
}
