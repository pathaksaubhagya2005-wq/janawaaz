"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Inbox,
  Loader2,
  X,
} from "lucide-react";
import { CATEGORY_MAP, DEPT_MAP, PRIORITY_META, STATUS_META } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { CategoryKey, DeptKey, Priority, Status } from "@/lib/types";
import { cn } from "@/lib/utils";

/* ---------------- primitives ---------------- */

export function Card({
  className,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-slate-200 bg-white shadow-card", className)}
      {...rest}
    >
      {children}
    </div>
  );
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "orange";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm focus-visible:ring-brand-400",
  secondary:
    "bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 focus-visible:ring-slate-300",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm focus-visible:ring-red-300",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm focus-visible:ring-emerald-300",
  orange: "bg-orange-500 text-white hover:bg-orange-600 shadow-sm focus-visible:ring-orange-300",
};
const SIZE: Record<Size, string> = {
  sm: "h-9 px-3 text-sm gap-1.5",
  md: "h-11 px-4 text-sm gap-2",
  lg: "h-14 px-6 text-base gap-2.5",
};

export function btnClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-xl font-semibold transition focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-50",
    VARIANT[variant],
    SIZE[size],
    extra
  );
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}) {
  return (
    <button
      className={btnClass(variant, size, className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
  onClick,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className={btnClass(variant, size, className)}>
      {children}
    </Link>
  );
}

/* ---------------- badges ---------------- */

export function StatusBadge({ status, confirmed }: { status: Status; confirmed?: boolean }) {
  const { lang } = useApp();
  const m = STATUS_META[status];
  const label = lang === "hi" ? m.hi : m.en;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        m.badge
      )}
    >
      {status === "resolved" && <CheckCircle2 className="h-3.5 w-3.5" />}
      {label}
      {status === "resolved" && confirmed && (
        <span className="ml-0.5 text-[10px] font-bold uppercase opacity-80">✓</span>
      )}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { lang } = useApp();
  const m = PRIORITY_META[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        m.badge
      )}
    >
      <span className={cn("h-2 w-2 rounded-full", m.dot)} />
      {lang === "hi" ? m.hi : m.en}
    </span>
  );
}

export function CategoryChip({ category, className }: { category: CategoryKey; className?: string }) {
  const { lang } = useApp();
  const m = CATEGORY_MAP[category];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-medium text-slate-800", className)}>
      <span className="text-base leading-none">{m.emoji}</span>
      {lang === "hi" ? m.hi : m.en}
    </span>
  );
}

export function deptName(key: DeptKey, hi: boolean): string {
  return hi ? DEPT_MAP[key].hi : DEPT_MAP[key].en;
}

/* ---------------- stat card ---------------- */

const TONES: Record<string, string> = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function StatCard({
  icon,
  label,
  value,
  tone = "blue",
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  tone?: keyof typeof TONES;
  sub?: string;
}) {
  return (
    <Card className="flex items-center gap-4 p-4 sm:p-5">
      <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl", TONES[tone])}>
        {icon}
      </span>
      <div className="min-w-0">
        <div className="text-2xl font-extrabold tracking-tight text-slate-900">{value}</div>
        <div className="truncate text-sm font-medium text-slate-500">{label}</div>
        {sub && <div className="truncate text-xs text-slate-400">{sub}</div>}
      </div>
    </Card>
  );
}

/* ---------------- states ---------------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 px-6 py-12 text-center">
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-card">
        {icon ?? <Inbox className="h-7 w-7" />}
      </span>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center"
    >
      <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-500 shadow-card">
        <AlertTriangle className="h-7 w-7" />
      </span>
      <h3 className="text-base font-semibold text-red-800">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-red-700/80">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-slate-200/70", className)} />;
}

export function PageLoader({ label }: { label?: string }) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-6xl flex-col items-center justify-center gap-3 px-4 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
      <span className="text-sm">{label ?? "Loading…"}</span>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

/** Simulates a short network round-trip so loading states are visible in the demo. */
export function useFakeLoading(ms = 550) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return loading;
}

/* ---------------- layout helpers ---------------- */

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Container({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100 disabled:bg-slate-100";

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
      {error && (
        <p className="mt-1 flex items-center gap-1 text-xs font-medium text-red-600" role="alert">
          <AlertTriangle className="h-3.5 w-3.5" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ---------------- modal ---------------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative flex max-h-[92vh] w-full animate-fadeUp flex-col rounded-t-3xl bg-white shadow-pop sm:rounded-3xl",
          wide ? "sm:max-w-2xl" : "sm:max-w-md"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
