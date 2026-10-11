"use client";

import { Download, Printer } from "lucide-react";
import { Button, Card, Container, PageHeader, PageLoader } from "@/components/ui";
import { CATEGORY_MAP, DEPT_MAP, PRIORITY_META, STATUS_META } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { adminStats, fmtDays } from "@/lib/stats";
import { useApp } from "@/lib/store";
import { downloadCSV, fmtDateTime } from "@/lib/utils";

export default function AdminReports() {
  const allowed = useRequireRole("admin");
  const { tr, lang, complaints, toast } = useApp();
  if (!allowed) return <PageLoader />;
  const hi = lang === "hi";
  const s = adminStats(complaints);
  const exportCsv = () => {
    downloadCSV("janawaaz-complaints.csv", [
      ["ID", "Category", "Address", "Area", "Priority", "Department", "Status", "Reports", "Created"],
      ...complaints.map((c) => [c.complaintNumber, CATEGORY_MAP[c.category].en, c.address, c.area, PRIORITY_META[c.priority].en, DEPT_MAP[c.department].en, STATUS_META[c.status].en, c.reportCount, c.createdAt]),
    ]);
    toast("success", tr("Report exported", "रिपोर्ट एक्सपोर्ट हुई"), "janawaaz-complaints.csv");
  };
  const byDept = Object.values(DEPT_MAP).map((d) => {
    const m = complaints.filter((c) => c.department === d.key);
    return { d, total: m.length, open: m.filter((c) => c.status !== "resolved").length };
  });
  return (
    <Container className="py-8">
      <PageHeader
        title={tr("Reports", "रिपोर्ट")}
        subtitle={`${tr("Generated", "बनाई गई")}: ${fmtDateTime(new Date().toISOString())}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => window.print()} className="no-print"><Printer className="h-4 w-4" />{tr("Print", "प्रिंट")}</Button>
            <Button onClick={exportCsv} className="no-print"><Download className="h-4 w-4" />{tr("Export CSV", "CSV एक्सपोर्ट")}</Button>
          </>
        }
      />
      <Card className="p-5">
        <h2 className="font-bold text-slate-900">{tr("Summary", "सारांश")}</h2>
        <ul className="mt-3 grid gap-2 text-sm text-slate-700 sm:grid-cols-2">
          <li>{tr("Open issues", "खुली समस्याएँ")}: <b>{s.open}</b></li>
          <li>{tr("Critical issues", "अति गंभीर")}: <b>{s.critical}</b></li>
          <li>{tr("In progress", "कार्य जारी")}: <b>{s.inProgress}</b></li>
          <li>{tr("Resolved today", "आज हल")}: <b>{s.resolvedToday}</b></li>
          <li>{tr("Average resolution time", "औसत समाधान समय")}: <b>{s.avgDays ? fmtDays(s.avgDays, hi) : "—"}</b></li>
          <li>{tr("Total complaints (demo)", "कुल शिकायतें (डेमो)")}: <b>{complaints.length}</b></li>
        </ul>
      </Card>
      <Card className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">{tr("Department", "विभाग")}</th><th className="px-4 py-3">{tr("Total", "कुल")}</th><th className="px-4 py-3">{tr("Open", "खुली")}</th><th className="px-4 py-3">{tr("Resolved", "हल")}</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {byDept.map(({ d, total, open }) => (
              <tr key={d.key}><td className="px-4 py-3 font-medium">{hi ? d.hi : d.en}</td><td className="px-4 py-3">{total}</td><td className="px-4 py-3">{open}</td><td className="px-4 py-3">{total - open}</td></tr>
            ))}
          </tbody>
        </table>
      </Card>
    </Container>
  );
}
