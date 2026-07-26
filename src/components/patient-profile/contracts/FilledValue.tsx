"use client";

/**
 * Valor preenchido no contrato: apenas texto, sem fundo/destaque.
 */
export function Filled({ children }: { children: React.ReactNode }) {
  if (children === null || children === undefined || children === "") {
    return <span>________________</span>;
  }
  return <span>{children}</span>;
}
