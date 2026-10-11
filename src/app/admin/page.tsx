"use client";

import Link from "next/link";
import { AlertOctagon, CheckCheck, Clock3, FolderOpen, Wrench } from "lucide-react";
import { CityMap } from "@/components/CityMap";
import { Card, CategoryChip, Container, EmptyState, LinkButton, PageHeader, PageLoader, PriorityBadge, StatCard, StatusBadge, deptName } from "@/components/ui";
import { PRIORITY_META } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { adminStats, fmtDays } from "@/lib/stats";
import { useApp } from "@/lib/store";
import { timeAgo } from "@/lib/utils";

export default function AdminHome() {
  const allowed = useRequireRole("admin");
  const { tr, lang, complaints, user } = useApp();
  if (!allowed) return <PageLoader />;
  const hi = lang === "hi";
  const s = adminStats(complaints);
  const urgent = complaints
    .filter((c) => c.status !== "resolved")
    .sort((a, b) => PRIORITY_META[b.priority].rank - PRIORITY_META[a.priority].rank || +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 6);
  const fresh = complaints.filter((c) => c.status === "reported" || c.status === "verified").length;

  return (
    <Container className="py-8">
      <PageHeader
        title={tr("Control Room Dashboard", "कंट्रोल रूम डैशबोर्ड")}
        subtitle={`${user?.name} · ${user?.designation}`}
        actions={<LinkButton href="/admin/complaints">{tr("Manage complaints", "शिकायतें प्रबंधित करें")}</LinkButton>}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <StatCard icon={<FolderOpen className="h-6 w-6" />} label={tr("Total Open Issues", "कुल खुली समस्याएँ")} value={s.open} />
        <StatCard icon={<AlertOctagon className="h-6 w-6" />} label={tr("Critical Issues", "अति गंभीर समस्याएँ")} value={s.critical} tone="red" />
        <StatCard icon={<Wrench className="h-6 w-6" />} label={tr("In Progress", "कार्य जारी")} value={s.inProgress} tone="indigo" />
        <StatCard icon={<CheckCheck className="h-6 w-6" />} label={tr("Resolved Today", "आज हल हुईं")} value={s.resolvedToday} tone="green" />
        <StatCard icon={<Clock3 className="h-6 w-6" />} label={tr("Avg Resolution Time", "औसत समाधान समय")} value={s.avgDays ? fmtDays(s.avgDays, hi) : "—"} tone="orange" />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-5">
        <Card className="p-5 lg:col-span-3">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">{tr("Needs attention", "ध्यान चाहिए")}</h2>
            <span className="text-xs text-slate-500">{fresh} {tr("awaiting verification or routing", "सत्यापन/रूटिंग की प्रतीक्षा में")}</span>
          </div>
          {urgent.length === 0 ? (
            <EmptyState title={tr("All clear", "सब ठीक है")} />
          ) : (
            <ul className="divide-y divide-slate-100">
              {urgent.map((c) => (
                <li key={c.id}>
                  <Link href={`/admin/complaints?open=${c.id}`} className="flex flex-col gap-2 py-3 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm font-bold">{c.complaintNumber}</span>
                        <CategoryChip category={c.category} />
                      </div>
                      <p className="truncate text-sm text-slate-600">{c.address}</p>
                      <p className="text-xs text-slate-400">{deptName(c.department, hi)} · {timeAgo(c.createdAt, hi)}</p>
                    </div>
                    <div className="flex gap-2">
                      <PriorityBadge priority={c.priority} />
                      <StatusBadge status={c.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-3 lg:col-span-2">
          <h2 className="px-2 pb-2 pt-2 font-bold text-slate-900">{tr("Hotspot overview", "हॉटस्पॉट अवलोकन")}</h2>
          <CityMap heat showLegend complaints={complaints.filter((c) => c.status !== "resolved")} className="h-72" />
          <div className="p-2">
            <Link href="/admin/map" className="text-sm font-semibold text-brand-600 hover:underline">{tr("Open full map →", "पूरा नक्शा खोलें →")}</Link>
          </div>
        </Card>
      </div>
    </Container>
  );
}
