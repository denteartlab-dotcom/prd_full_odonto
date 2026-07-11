"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Download,
  Eye,
  FolderInput,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MENU_WIDTH = 192;

function computeMenuPosition(button: HTMLElement, menuHeight: number) {
  const rect = button.getBoundingClientRect();
  const padding = 8;
  let top = rect.bottom + 4;
  let left = rect.right - MENU_WIDTH;

  if (left < padding) left = padding;
  if (left + MENU_WIDTH > window.innerWidth - padding) {
    left = window.innerWidth - MENU_WIDTH - padding;
  }
  if (top + menuHeight > window.innerHeight - padding) {
    top = Math.max(padding, rect.top - menuHeight - 4);
  }

  return { top, left };
}

export function DocumentActionsMenu({
  onView,
  onDownload,
  onRename,
  onMove,
  onDelete,
}: {
  onView: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const items = [
    { icon: Eye, label: "Visualizar", onClick: onView },
    { icon: Download, label: "Baixar", onClick: onDownload },
    { icon: Pencil, label: "Renomear", onClick: onRename },
    { icon: FolderInput, label: "Mover categoria", onClick: onMove },
    { icon: Trash2, label: "Excluir", onClick: onDelete, danger: true },
  ];

  const updatePosition = useCallback(() => {
    if (!buttonRef.current || !menuRef.current) return;
    const height = menuRef.current.offsetHeight || items.length * 36;
    setMenuPos(computeMenuPosition(buttonRef.current, height));
  }, [items.length]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target))
        return;
      setOpen(false);
    }

    function handleReposition() {
      updatePosition();
    }

    document.addEventListener("mousedown", handleClick);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClick);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updatePosition]);

  const menu =
    open && mounted
      ? createPortal(
          <>
            <div
              className="fixed inset-0 z-[9998]"
              aria-hidden
              onClick={() => setOpen(false)}
            />
            <div
              ref={menuRef}
              className="fixed z-[9999] w-48 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
              style={{ top: menuPos.top, left: menuPos.left }}
              onClick={(e) => e.stopPropagation()}
            >
              {items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpen(false);
                    item.onClick();
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition",
                    item.danger
                      ? "text-red-600 hover:bg-red-50"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0 opacity-70" />
                  {item.label}
                </button>
              ))}
            </div>
          </>,
          document.body
        )
      : null;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        aria-label="Mais opções"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {menu}
    </>
  );
}
