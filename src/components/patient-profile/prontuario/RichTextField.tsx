"use client";

import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  CheckSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function RichTextField({
  label,
  value,
  onChange,
  placeholder,
  minHeight = 88,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    if (ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || "";
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label className="text-[13px] font-medium text-slate-700">{label}</label>
        <div className="flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-0.5">
          {[
            { icon: Bold, cmd: "bold", title: "Negrito" },
            { icon: Italic, cmd: "italic", title: "Itálico" },
            { icon: Underline, cmd: "underline", title: "Sublinhado" },
            { icon: List, cmd: "insertUnorderedList", title: "Marcadores" },
            { icon: ListOrdered, cmd: "insertOrderedList", title: "Numeração" },
          ].map(({ icon: Icon, cmd, title }) => (
            <button
              key={cmd}
              type="button"
              title={title}
              onMouseDown={(e) => {
                e.preventDefault();
                exec(cmd);
              }}
              className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
          <button
            type="button"
            title="Checklist"
            onMouseDown={(e) => {
              e.preventDefault();
              exec("insertUnorderedList");
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
          >
            <CheckSquare className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            title="Link"
            onMouseDown={(e) => {
              e.preventDefault();
              const url = window.prompt("URL do link");
              if (url) exec("createLink", url);
            }}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white hover:text-indigo-600"
          >
            <Link2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-label={label}
        data-placeholder={placeholder || "Digite aqui..."}
        onInput={() => {
          if (ref.current) onChange(ref.current.innerHTML);
        }}
        className={cn(
          "prose-sm max-w-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15",
          "empty:before:pointer-events-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)]"
        )}
        style={{ minHeight }}
      />
    </div>
  );
}
