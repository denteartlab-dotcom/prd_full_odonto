import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Banknote,
  Percent,
  Split,
  Shield,
  MessageCircle,
  Mail,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  module: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "clinico",
    label: "Clínico",
    items: [
      { href: "/app", label: "Início", icon: LayoutDashboard, module: "dashboard" },
      { href: "/app/pacientes", label: "Pacientes", icon: Users, module: "patients" },
      { href: "/app/agenda", label: "Agenda", icon: CalendarDays, module: "schedule" },
    ],
  },
  {
    id: "financeiro",
    label: "Financeiro",
    items: [
      { href: "/app/orcamentos", label: "Orçamentos", icon: Receipt, module: "budgets" },
      { href: "/app/receitas", label: "Contas a receber", icon: ArrowDownCircle, module: "accounts-receivable" },
      { href: "/app/despesas", label: "Contas a pagar", icon: ArrowUpCircle, module: "accounts-payable" },
      { href: "/app/fluxo-caixa", label: "Fluxo de caixa", icon: Banknote, module: "cashflow" },
      { href: "/app/comissoes", label: "Comissões", icon: Percent, module: "commissions" },
      { href: "/app/rateios", label: "Rateios", icon: Split, module: "payment-splits" },
    ],
  },
  {
    id: "gestao",
    label: "Gestão",
    items: [
      { href: "/app/estoque", label: "Estoque", icon: Package, module: "inventory" },
      { href: "/app/relatorios", label: "Relatórios", icon: BarChart3, module: "reports" },
      { href: "/app/analytics", label: "Analytics", icon: Activity, module: "analytics" },
    ],
  },
  {
    id: "automacoes",
    label: "Automações",
    items: [
      { href: "/app/automacoes", label: "WhatsApp", icon: MessageCircle, module: "automations-whatsapp" },
      { href: "/app/automacoes", label: "E-mails", icon: Mail, module: "automations-email" },
    ],
  },
  {
    id: "sistema",
    label: "Sistema",
    items: [
      { href: "/app/permissoes", label: "Permissões", icon: Shield, module: "permissions" },
      { href: "/app/configuracoes", label: "Configurações", icon: Settings, module: "settings" },
    ],
  },
];

/** Lista plana (compatibilidade). */
export const NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
