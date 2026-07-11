import { Suspense } from "react";
import { getSession } from "@/lib/auth";
import { PatientProfilePage } from "@/components/patient-profile";

export default async function PacientePerfilPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return null;

  return (
    <Suspense fallback={<div className="p-8 text-sm text-slate-400">Carregando perfil...</div>}>
      <PatientProfilePage
        patientId={id}
        userName={session.name}
        role={session.role}
      />
    </Suspense>
  );
}
