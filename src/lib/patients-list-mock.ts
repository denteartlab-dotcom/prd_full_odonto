export type PatientStatus = "ativo" | "inativo";

export type ListPatient = {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  city: string;
  state: string;
  lastVisit: string | null;
  status: PatientStatus;
  insurance: string;
  financialResponsible: string;
  birthDate: string;
  createdAt: string;
  initials: string;
  avatarColor: string;
  profession?: string;
  notes?: string;
};

const firstNames = [
  "João",
  "Maria",
  "Pedro",
  "Ana",
  "Carlos",
  "Fernanda",
  "Lucas",
  "Beatriz",
  "Rafael",
  "Sofia",
  "Paulo",
  "Camila",
  "Diego",
  "Helena",
  "Igor",
  "Juliana",
  "Marcos",
  "Patrícia",
  "Renato",
  "Tatiana",
];

const lastNames = [
  "Silva",
  "Souza",
  "Oliveira",
  "Santos",
  "Lima",
  "Costa",
  "Alves",
  "Pereira",
  "Rodrigues",
  "Ferreira",
  "Martins",
  "Rocha",
  "Carvalho",
  "Gomes",
  "Barbosa",
];

const cities = [
  { city: "São Paulo", state: "SP" },
  { city: "Campinas", state: "SP" },
  { city: "Santos", state: "SP" },
  { city: "Ribeirão Preto", state: "SP" },
  { city: "Guarulhos", state: "SP" },
  { city: "Osasco", state: "SP" },
];

const insurances = [
  "Particular",
  "Unimed",
  "Bradesco Saúde",
  "Amil",
  "SulAmérica",
  "NotreDame Intermédica",
  "Porto Seguro",
];

const avatarColors = [
  "from-indigo-500 to-violet-600",
  "from-sky-500 to-cyan-600",
  "from-emerald-500 to-teal-600",
  "from-violet-500 to-purple-600",
  "from-rose-500 to-pink-600",
  "from-amber-500 to-orange-600",
];

const responsibles = [
  "Próprio paciente",
  "Pai / Mãe",
  "Cônjuge",
  "Empresa",
  "Responsável legal",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toIsoDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function makeCpf(seed: number) {
  const base = String(100000000 + seed * 137).slice(0, 9);
  return `${base.slice(0, 3)}.${base.slice(3, 6)}.${base.slice(6, 9)}-${pad(seed % 90 + 10)}`;
}

function makePhone(seed: number) {
  const ddd = 11 + (seed % 8);
  const n = String(900000000 + seed * 7919).slice(0, 9);
  return `(${ddd}) 9${n.slice(0, 4)}-${n.slice(4, 8)}`;
}

export function createPatientsListMock(count = 48): ListPatient[] {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  return Array.from({ length: count }, (_, i) => {
    const first = firstNames[i % firstNames.length];
    const last = lastNames[(i * 3) % lastNames.length];
    const name = `${first} ${last}${i > 14 ? ` ${String.fromCharCode(65 + (i % 5))}.` : ""}`;
    const loc = cities[i % cities.length];
    const initials = `${first[0]}${last[0]}`.toUpperCase();
    const status: PatientStatus = i % 11 === 0 ? "inativo" : "ativo";

    const created = new Date(currentYear, currentMonth - (i % 4), 1 + (i % 28));
    const birthMonth = i % 6 === 0 ? currentMonth : (i + 2) % 12;
    const birth = new Date(1975 + (i % 30), birthMonth, 5 + (i % 20));

    const lastVisit =
      status === "inativo" && i % 3 === 0
        ? null
        : toIsoDate(new Date(currentYear, currentMonth - (i % 6), 10 + (i % 18)));

    return {
      id: `pat-${String(i + 1).padStart(3, "0")}`,
      name,
      cpf: makeCpf(i + 11),
      phone: makePhone(i + 21),
      email: `${first.toLowerCase()}.${last.toLowerCase()}${i + 1}@email.com`,
      city: loc.city,
      state: loc.state,
      lastVisit,
      status,
      insurance: insurances[i % insurances.length],
      financialResponsible: responsibles[i % responsibles.length],
      birthDate: toIsoDate(birth),
      createdAt: toIsoDate(created),
      initials,
      avatarColor: avatarColors[i % avatarColors.length],
      profession: ["Advogado", "Professora", "Engenheiro", "Designer", "Empresário"][i % 5],
      notes: i % 5 === 0 ? "Paciente preferencial — horário matutino." : undefined,
    };
  });
}

export type PatientSortKey =
  | "name"
  | "cpf"
  | "phone"
  | "email"
  | "city"
  | "lastVisit"
  | "status";

export function formatPatientCity(patient: ListPatient) {
  return `${patient.city} - ${patient.state}`;
}

export function formatDisplayDate(iso: string | null) {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function computePatientKpis(patients: ListPatient[]) {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const active = patients.filter((p) => p.status === "ativo").length;
  const newThisMonth = patients.filter((p) => {
    const d = new Date(p.createdAt + "T12:00:00");
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const birthdays = patients.filter((p) => {
    const d = new Date(p.birthDate + "T12:00:00");
    return d.getMonth() === month;
  }).length;

  return {
    total: patients.length,
    active,
    activeRate: patients.length ? (active / patients.length) * 100 : 0,
    newThisMonth,
    birthdays,
  };
}
