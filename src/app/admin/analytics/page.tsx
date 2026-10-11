"use client";

import { Card, Container, PageHeader, PageLoader } from "@/components/ui";
import { BarChart, Donut, GroupedBars, HBarChart, LineChart } from "@/components/Charts";
import { ANALYTICS, AREAS, CATEGORY_MAP, DEPT_MAP, LANDING_STATS } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";

export default function AdminAnalytics() {
  const allowed = useRequireRole("admin");
  const { tr, lang } = useApp();
  if (!allowed) return <PageLoader />;
  const hi = lang === "hi";
  const areas = [...AREAS].sort((a, b) => b.count - a.count);
  return (
    <Container className="py-8">
      <PageHeader title={tr("Civic Analytics", "नागरिक विश्लेषण")} subtitle={tr("Platform-wide demo data for the last 12 months", "पिछले 12 महीनों का डेमो डेटा")} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Complaints by category", "श्रेणी के अनुसार शिकायतें")}</h2>
          <BarChart data={ANALYTICS.byCategory.map((d) => ({ label: hi ? CATEGORY_MAP[d.key].hi : CATEGORY_MAP[d.key].en.split(" ")[0], value: d.value }))} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Complaints by area", "क्षेत्र के अनुसार शिकायतें")}</h2>
          <HBarChart data={areas.map((a) => ({ label: a.name, value: a.count }))} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Resolution rate", "समाधान दर")}</h2>
          <Donut value={LANDING_STATS.rate} label={tr("resolved", "हल हुईं")} sub={`${LANDING_STATS.resolved} / ${LANDING_STATS.uniqueCases} ${tr("cases", "मामले")}`} />
          <p className="mt-3 text-center text-xs text-slate-500">{tr("1,248 reports merged into 1,052 unique cases.", "1,248 रिपोर्ट 1,052 अलग मामलों में मिलाई गईं।")}</p>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Average resolution time (days)", "औसत समाधान समय (दिन)")}</h2>
          <LineChart labels={ANALYTICS.months} series={[{ name: tr("Avg days", "औसत दिन"), color: "#f97316", values: ANALYTICS.avgDaysByMonth }]} />
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Department performance", "विभाग प्रदर्शन")}</h2>
          <GroupedBars
            aLabel={tr("Total", "कुल")}
            bLabel={tr("Resolved", "हल")}
            rows={ANALYTICS.departments.map((d) => ({ label: DEPT_MAP[d.key].short, a: d.total, b: d.resolved }))}
          />
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
            {ANALYTICS.departments.map((d) => (
              <li key={d.key}>{DEPT_MAP[d.key].short}: {d.avgDays}d · ★{d.rating}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5">
          <h2 className="mb-4 font-bold text-slate-900">{tr("Complaints over time", "समय के साथ शिकायतें")}</h2>
          <LineChart
            labels={ANALYTICS.months}
            series={[
              { name: tr("Reported", "दर्ज"), color: "#2563eb", values: ANALYTICS.reportedByMonth },
              { name: tr("Resolved", "हल"), color: "#16a34a", values: ANALYTICS.resolvedByMonth },
            ]}
          />
        </Card>
      </div>
      <Card className="mt-5 p-5">
        <h2 className="mb-3 font-bold text-slate-900">{tr("Top Civic Hotspots", "शीर्ष नागरिक हॉटस्पॉट")}</h2>
        <ol className="grid gap-2 sm:grid-cols-3">
          {areas.slice(0, 3).map((a, i) => (
            <li key={a.name} className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-lg font-extrabold text-red-700">{i + 1}</span>
              <span><span className="block font-bold text-slate-900">{a.name}</span><span className="text-sm text-slate-500">{a.count} {tr("complaints", "शिकायतें")}</span></span>
            </li>
          ))}
        </ol>
      </Card>
    </Container>
  );
}
