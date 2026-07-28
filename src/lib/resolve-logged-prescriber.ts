import { prisma } from "@/lib/db";
import type { SessionPayload } from "@/lib/auth";

export type LoggedPrescriber = {
  id: string | null;
  name: string;
  cro: string | null;
  specialty: string | null;
  phone: string | null;
  email: string | null;
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

/** Resolve o profissional correspondente ao usuário logado. */
export async function resolveLoggedPrescriber(
  session: SessionPayload
): Promise<LoggedPrescriber> {
  const professionals = await prisma.professional.findMany({
    where: { clinicId: session.clinicId, active: true },
    select: {
      id: true,
      name: true,
      cro: true,
      specialty: true,
      phone: true,
      email: true,
    },
  });

  const email = session.email.trim().toLowerCase();
  const byEmail = professionals.find(
    (p) => (p.email || "").trim().toLowerCase() === email
  );
  if (byEmail) {
    return {
      id: byEmail.id,
      name: byEmail.name,
      cro: byEmail.cro,
      specialty: byEmail.specialty,
      phone: byEmail.phone,
      email: byEmail.email,
    };
  }

  const sessionName = normalize(session.name);
  const byExactName = professionals.find(
    (p) => normalize(p.name) === sessionName
  );
  if (byExactName) {
    return {
      id: byExactName.id,
      name: byExactName.name,
      cro: byExactName.cro,
      specialty: byExactName.specialty,
      phone: byExactName.phone,
      email: byExactName.email,
    };
  }

  const byPartialName = professionals.find((p) => {
    const n = normalize(p.name);
    return n.includes(sessionName) || sessionName.includes(n);
  });
  if (byPartialName) {
    return {
      id: byPartialName.id,
      name: byPartialName.name,
      cro: byPartialName.cro,
      specialty: byPartialName.specialty,
      phone: byPartialName.phone,
      email: byPartialName.email,
    };
  }

  // Sem cadastro de profissional: usa o usuário logado (nome da sessão)
  return {
    id: null,
    name: session.name,
    cro: null,
    specialty: null,
    phone: null,
    email: session.email,
  };
}
