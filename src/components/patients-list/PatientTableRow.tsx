"use client";

import { Eye, History, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDisplayDate,
  formatPatientCity,
  type ListPatient,
} from "@/lib/patients-list-mock";

export function PatientTableRow({
  patient,
  onOpen,
  onEdit,
  onHistory,
  onDelete,
}: {
  patient: ListPatient;
  onOpen: () => void;
  onEdit: () => void;
  onHistory: () => void;
  onDelete: () => void;
}) {
  const whatsapp = patient.phone.replace(/\D/g, "");

  return (
    <tr
      className="group cursor-pointer border-b border-slate-50 transition hover:bg-indigo-50/40"
      onClick={onOpen}
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white",
              patient.avatarColor
            )}
          >
            {patient.initials}
          </div>
          <span className="font-medium text-slate-800">{patient.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 tabular-nums text-slate-600">{patient.cpf}</td>
      <td className="px-4 py-3">
        <a
          href={`https://wa.me/55${whatsapp}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 text-slate-600 hover:text-emerald-600"
        >
          <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
          <span className="tabular-nums">{patient.phone}</span>
        </a>
      </td>
      <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{patient.email}</td>
      <td className="hidden px-4 py-3 text-slate-600 md:table-cell">
        {formatPatientCity(patient)}
      </td>
      <td className="hidden px-4 py-3 text-slate-600 xl:table-cell">
        {formatDisplayDate(patient.lastVisit)}
      </td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
            patient.status === "ativo"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {patient.status === "ativo" ? "Ativo" : "Inativo"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div
          className="flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onOpen}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600"
            aria-label="Ver perfil"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600"
            aria-label="Editar"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onHistory}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-indigo-600"
            aria-label="Histórico"
          >
            <History className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
            aria-label="Excluir"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}
