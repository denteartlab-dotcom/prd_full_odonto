"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Smile } from "lucide-react";
import { NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { ScheduleProvider } from "@/contexts/schedule-context";
import { WaitingPatientsProvider } from "@/contexts/waiting-patients-context";
import { PatientsProvider } from "@/contexts/patients-context";
import {
  GlobalConsultationControl,
  GlobalScheduleToast,
} from "@/components/schedule/GlobalConsultationControl";
import { WaitingScheduleSync } from "@/components/schedule/WaitingScheduleSync";

export function AppShell({
  children,
  userName,
  clinicName,
  role,
}: {
  children: React.ReactNode;
  userName: string;
  clinicName: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isPrintView =
    pathname?.includes("/anamnese/imprimir") || pathname?.includes("/orcamentos/imprimir");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  if (isPrintView) {
    return <PatientsProvider>{children}</PatientsProvider>;
  }

  return (
    <ScheduleProvider>
      <PatientsProvider>
      <WaitingPatientsProvider>
        <WaitingScheduleSync />
        <div className="flex min-h-screen bg-[#f4f6fb] text-slate-900">
        <aside className="flex w-[260px] shrink-0 flex-col bg-[#0b1b34] text-slate-200">
        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-blue-600 text-white shadow-lg shadow-blue-900/40">
              <Smile className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white">Odonto Enterprise</p>
              <p className="truncate text-[11px] text-slate-400">{clinicName}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const active =
                    item.href === "/app"
                      ? pathname === "/app"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={`${group.id}-${item.module}`}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                        active
                          ? "bg-gradient-to-r from-indigo-500 to-blue-600 text-white shadow-md shadow-blue-900/30"
                          : "text-slate-300 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0 opacity-90" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="mb-3 px-1">
            <p className="truncate text-sm font-medium text-white">{userName}</p>
            <p className="text-[11px] capitalize text-slate-400">{role}</p>
          </div>
          <button
            type="button"
            onClick={() => void logout()}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

        <main className="min-w-0 flex-1 overflow-auto p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      <GlobalConsultationControl />
      <GlobalScheduleToast />
      </WaitingPatientsProvider>
      </PatientsProvider>
    </ScheduleProvider>
  );
}
