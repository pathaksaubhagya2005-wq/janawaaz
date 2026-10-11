"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { ComplaintDrawer } from "@/components/AdminDrawer";
import { Button, Card, CategoryChip, Container, EmptyState, ListSkeleton, PageHeader, PageLoader, PriorityBadge, StatusBadge, deptName, inputClass, useFakeLoading } from "@/components/ui";
import { CATEGORIES, DEPARTMENTS, PRIORITY_META, STATUS_META } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";
import type { CategoryKey, DeptKey, Priority, Status } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

function Inner() {
  const allowed = useRequireRole("admin");
  const { tr, lang, complaints, mark } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const openId = params.get("open");
  const loading = useFakeLoading(450);
  const hi = lang === "hi";

  const [q, setQ] = useState("");
  const [dept, setDept] = useState<DeptKey | "all">("all");
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [pri, setPri] = useState<Priority | "all">("all");
  const [st, setSt] = useState<Status | "all">("all");
  const [range, setRange] = useState<"all" | "today" | "7" | "30">("all");

  useEffect(() => mark("admin_view"), [mark]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    const now = Date.now();
    const limit = range === "today" ? 1 : range === "7" ? 7 : range === "30" ? 30 : 0;
    return complaints
      .filter((c) => {
        if (dept !== "all" && c.department !== dept) return false;
        if (cat !== "all" && c.category !== cat) return false;
        if (pri !== "all" && c.priority !== pri) return false;
        if (st !== "all" && c.status !== st) return false;
        if (limit && now - new Date(c.createdAt).getTime() > limit * 86400000) return false;
        if (t && !(c.complaintNumber.toLowerCase().includes(t) || c.address.toLowerCase().includes(t) || c.description.toLowerCase().includes(t))) return false;
        return true;
      })
      .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  }, [complaints, q, dept, cat, pri, st, range]);

  if (!allowed) return <PageLoader />;
  const clear = () => { setQ(""); setDept("all"); setCat("all"); setPri("all"); setSt("all"); setRange("all"); };
  const filtered = q || dept !== "all" || cat !== "all" || pri !== "all" || st !== "all" || range !== "all";

  return (
    <Container className="py-8">
      <PageHeader title={tr("Complaints", "शिकायतें")} subtitle={`${rows.length} ${tr("of", "में से")} ${complaints.length}`} />
      <Card className="mb-4 p-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <div className="relative sm:col-span-2 lg:col-span-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Search by ID, place or description", "आईडी, स्थान या विवरण से खोजें")} aria-label={tr("Search complaints", "शिकायतें खोजें")} />
          </div>
          <select className={inputClass} value={dept} onChange={(e) => setDept(e.target.value as DeptKey | "all")} aria-label={tr("Department", "विभाग")}>
            <option value="all">{tr("All departments", "सभी विभाग")}</option>
            {DEPARTMENTS.map((d) => <option key={d.key} value={d.key}>{hi ? d.hi : d.en}</option>)}
          </select>
          <select className={inputClass} value={cat} onChange={(e) => setCat(e.target.value as CategoryKey | "all")} aria-label={tr("Category", "श्रेणी")}>
            <option value="all">{tr("All categories", "सभी श्रेणियाँ")}</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{hi ? c.hi : c.en}</option>)}
          </select>
          <select className={inputClass} value={pri} onChange={(e) => setPri(e.target.value as Priority | "all")} aria-label={tr("Priority", "प्राथमिकता")}>
            <option value="all">{tr("All priorities", "सभी प्राथमिकताएँ")}</option>
            {(Object.keys(PRIORITY_META) as Priority[]).map((p) => <option key={p} value={p}>{hi ? PRIORITY_META[p].hi : PRIORITY_META[p].en}</option>)}
          </select>
          <select className={inputClass} value={st} onChange={(e) => setSt(e.target.value as Status | "all")} aria-label={tr("Status", "स्थिति")}>
            <option value="all">{tr("All statuses", "सभी स्थितियाँ")}</option>
            {(Object.keys(STATUS_META) as Status[]).map((s) => <option key={s} value={s}>{hi ? STATUS_META[s].hi : STATUS_META[s].en}</option>)}
          </select>
          <select className={inputClass} value={range} onChange={(e) => setRange(e.target.value as typeof range)} aria-label={tr("Date", "तारीख")}>
            <option value="all">{tr("Any date", "कोई भी तारीख")}</option>
            <option value="today">{tr("Last 24 hours", "पिछले 24 घंटे")}</option>
            <option value="7">{tr("Last 7 days", "पिछले 7 दिन")}</option>
            <option value="30">{tr("Last 30 days", "पिछले 30 दिन")}</option>
          </select>
          <Button variant="ghost" onClick={clear} disabled={!filtered}>{tr("Clear filters", "फ़िल्टर हटाएँ")}</Button>
        </div>
      </Card>

      {loading ? (
        <ListSkeleton rows={6} />
      ) : rows.length === 0 ? (
        <EmptyState title={tr("No complaints match these filters", "इन फ़िल्टरों से कोई शिकायत नहीं मिली")} action={<Button variant="secondary" onClick={clear}>{tr("Clear filters", "फ़िल्टर हटाएँ")}</Button>} />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                {["ID", tr("Issue", "समस्या"), tr("Location", "स्थान"), tr("Priority", "प्राथमिकता"), tr("Department", "विभाग"), tr("Status", "स्थिति"), tr("Date", "तारीख")].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((c) => (
                <tr key={c.id} tabIndex={0} onClick={() => router.push(`/admin/complaints?open=${c.id}`)} onKeyDown={(e) => e.key === "Enter" && router.push(`/admin/complaints?open=${c.id}`)} className="cursor-pointer hover:bg-brand-50/40 focus:bg-brand-50/60">
                  <td className="whitespace-nowrap px-4 py-3 font-mono font-bold text-slate-900">{c.complaintNumber.replace("JA-2026-", "JA-")}</td>
                  <td className="px-4 py-3"><CategoryChip category={c.category} /></td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-slate-600">{c.address}</td>
                  <td className="px-4 py-3"><PriorityBadge priority={c.priority} /></td>
                  <td className="px-4 py-3 text-slate-600">{deptName(c.department, hi)}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} confirmed={c.confirmed} /></td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-500">{fmtDate(c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      <ComplaintDrawer id={openId} onClose={() => router.push("/admin/complaints")} />
    </Container>
  );
}

export default function AdminComplaints() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Inner />
    </Suspense>
  );
}
