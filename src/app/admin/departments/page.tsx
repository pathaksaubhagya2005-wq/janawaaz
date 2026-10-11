"use client";

import Link from "next/link";
import { ArrowRight, Phone, User } from "lucide-react";
import { Card, Container, PageHeader, PageLoader } from "@/components/ui";
import { CATEGORIES, CATEGORY_DEPT, DEPARTMENTS } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";

export default function AdminDepartments() {
  const allowed = useRequireRole("admin");
  const { tr, lang, complaints } = useApp();
  if (!allowed) return <PageLoader />;
  const hi = lang === "hi";
  return (
    <Container className="py-8">
      <PageHeader title={tr("Departments", "विभाग")} subtitle={tr("Complaints are routed automatically by category.", "शिकायतें श्रेणी के अनुसार स्वतः रूट होती हैं।")} />
      <Card className="mb-6 p-5">
        <h2 className="font-bold text-slate-900">{tr("Automatic routing", "स्वचालित रूटिंग")}</h2>
        <p className="mb-3 text-sm text-slate-500">{tr("AI automatically routes each complaint to the correct department.", "AI हर शिकायत को स्वचालित रूप से सही विभाग को भेजता है।")}</p>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIES.map((c) => {
            const d = DEPARTMENTS.find((x) => x.key === CATEGORY_DEPT[c.key])!;
            return (
              <li key={c.key} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm">
                <span>{c.emoji}</span>
                <span className="font-semibold text-slate-800">{hi ? c.hi : c.en}</span>
                <ArrowRight className="h-4 w-4 text-brand-500" />
                <span className="text-slate-600">{d.short}</span>
              </li>
            );
          })}
        </ul>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEPARTMENTS.map((d) => {
          const mine = complaints.filter((c) => c.department === d.key);
          const open = mine.filter((c) => c.status !== "resolved").length;
          const done = mine.length - open;
          return (
            <Card key={d.key} className="flex flex-col p-5">
              <h3 className="font-extrabold text-slate-900">{hi ? d.hi : d.en}</h3>
              <p className="mt-2 flex items-center gap-2 text-sm text-slate-600"><User className="h-4 w-4 text-brand-600" />{d.head}</p>
              <p className="flex items-center gap-2 text-sm text-slate-600"><Phone className="h-4 w-4 text-brand-600" />{d.phone}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-xl bg-orange-50 py-2"><div className="text-xl font-extrabold text-orange-700">{open}</div><div className="text-xs text-slate-500">{tr("Open", "खुली")}</div></div>
                <div className="rounded-xl bg-emerald-50 py-2"><div className="text-xl font-extrabold text-emerald-700">{done}</div><div className="text-xs text-slate-500">{tr("Resolved", "हल")}</div></div>
              </div>
              <Link href={`/admin/complaints`} className="mt-4 text-sm font-semibold text-brand-600 hover:underline">{tr("View complaints →", "शिकायतें देखें →")}</Link>
            </Card>
          );
        })}
      </div>
    </Container>
  );
}
