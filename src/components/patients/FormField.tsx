"use client";

import { cn } from "@/lib/utils";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

export function FieldLabel({
  children,
  required,
  htmlFor,
}: {
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}) {
  return (
    <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-slate-700">
      {children}
      {required ? <span className="ml-0.5 text-red-500">*</span> : null}
    </label>
  );
}

export function FormInput({
  label,
  required,
  className,
  trailing,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  required?: boolean;
  trailing?: ReactNode;
}) {
  const id = props.id || props.name;
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <div className="relative">
        <input
          id={id}
          className={cn(
            "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15",
            trailing && "pr-10",
            className
          )}
          {...props}
        />
        {trailing ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            {trailing}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export function FormSelect({
  label,
  required,
  children,
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  const id = props.id || props.name;
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <select
        id={id}
        className={cn(
          "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function FormTextarea({
  label,
  required,
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  required?: boolean;
}) {
  const id = props.id || props.name;
  return (
    <div className="min-w-0">
      <FieldLabel htmlFor={id} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={id}
        className={cn(
          "min-h-[96px] w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/15",
          className
        )}
        {...props}
      />
    </div>
  );
}

export function FormSectionCard({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgb(15_23_42/0.04)] sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-slate-800">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
