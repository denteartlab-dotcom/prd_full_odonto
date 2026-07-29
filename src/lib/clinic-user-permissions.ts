import { NAV_GROUPS } from "@/lib/nav";

export type ClinicUserRole =
  | "admin"
  | "proprietario"
  | "dentista"
  | "recepcao"
  | "financeiro";

export const CLINIC_USER_ROLES: { value: ClinicUserRole; label: string }[] = [
  { value: "admin", label: "Administrador" },
  { value: "proprietario", label: "Proprietário" },
  { value: "dentista", label: "Dentista" },
  { value: "recepcao", label: "Recepção" },
  { value: "financeiro", label: "Financeiro" },
];

export type SystemModuleOption = {
  id: string;
  label: string;
  group: string;
};

export const SYSTEM_MODULES: SystemModuleOption[] = NAV_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    id: item.module,
    label: item.label,
    group: group.label,
  }))
);

const ALL_MODULE_IDS = SYSTEM_MODULES.map((m) => m.id);

export const ROLE_DEFAULT_PERMISSIONS: Record<ClinicUserRole, string[]> = {
  admin: ALL_MODULE_IDS,
  proprietario: ALL_MODULE_IDS,
  dentista: [
    "dashboard",
    "patients",
    "schedule",
    "prescriptions",
    "budgets",
    "reports",
  ],
  recepcao: ["dashboard", "patients", "schedule", "budgets", "accounts-receivable"],
  financeiro: [
    "dashboard",
    "finance-general",
    "budgets",
    "accounts-receivable",
    "accounts-payable",
    "cashflow",
    "commissions",
    "payment-splits",
    "reports",
    "analytics",
  ],
};

export function parsePermissions(raw?: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x): x is string => typeof x === "string");
  } catch {
    return [];
  }
}

export function serializePermissions(modules: string[]): string {
  const unique = Array.from(new Set(modules));
  return JSON.stringify(unique);
}

export function roleLabel(role: string) {
  return CLINIC_USER_ROLES.find((r) => r.value === role)?.label || role;
}

export function canManageUsers(role: string) {
  return role === "admin" || role === "proprietario";
}

export type ClinicUserDTO = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  permissions: string[];
  commissionEnabled: boolean;
  commissionPercent: number;
  createdAt: string;
};
