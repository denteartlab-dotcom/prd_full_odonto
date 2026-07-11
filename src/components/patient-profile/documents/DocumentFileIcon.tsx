"use client";

import {
  File,
  FileArchive,
  FileSpreadsheet,
  FileText,
  FileType,
  Image as ImageIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DocumentFileType } from "@/lib/document-types";

const CONFIG: Record<
  DocumentFileType,
  { icon: React.ComponentType<{ className?: string }>; bg: string; color: string }
> = {
  pdf: { icon: FileText, bg: "bg-red-50", color: "text-red-600" },
  word: { icon: FileType, bg: "bg-blue-50", color: "text-blue-600" },
  excel: { icon: FileSpreadsheet, bg: "bg-emerald-50", color: "text-emerald-600" },
  image: { icon: ImageIcon, bg: "bg-violet-50", color: "text-violet-600" },
  zip: { icon: FileArchive, bg: "bg-amber-50", color: "text-amber-600" },
  txt: { icon: FileText, bg: "bg-slate-50", color: "text-slate-500" },
  csv: { icon: FileSpreadsheet, bg: "bg-slate-50", color: "text-slate-500" },
  other: { icon: File, bg: "bg-slate-50", color: "text-slate-500" },
};

export function DocumentFileIcon({
  fileType,
  size = "md",
  className,
}: {
  fileType: DocumentFileType;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const { icon: Icon, bg, color } = CONFIG[fileType];
  const sizes = {
    sm: { box: "h-8 w-8", icon: "h-4 w-4" },
    md: { box: "h-10 w-10", icon: "h-5 w-5" },
    lg: { box: "h-14 w-14", icon: "h-7 w-7" },
  };
  const s = sizes[size];

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl",
        bg,
        s.box,
        className
      )}
    >
      <Icon className={cn(s.icon, color)} />
    </div>
  );
}
