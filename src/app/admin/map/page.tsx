"use client";

import { useState } from "react";
import { Flame, MapPin } from "lucide-react";
import { ComplaintDrawer } from "@/components/AdminDrawer";
import { CityMap } from "@/components/CityMap";
import { Button, Card, Container, PageHeader, PageLoader } from "@/components/ui";
import { AREAS } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminMap() {
  const allowed = useRequireRole("admin");
  const { tr, complaints } = useApp();
  const [heat, setHeat] = useState(true);
  const [sel, setSel] = useState<string | null>(null);
  if (!allowed) return <PageLoader />;
  const sorted = [...AREAS].sort((a, b) => b.count - a.count);
  const level = (n: number) => (n >= 60 ? ["bg-red-500", tr("High", "उच्च")] : n >= 35 ? ["bg-orange-500", tr("Medium", "मध्यम")] : ["bg-emerald-500", tr("Low", "कम")]);
  return (
    <Container className="py-8">
      <PageHeader
        title={tr("Map / Hotspots", "नक्शा / हॉटस्पॉट")}
        subtitle={tr("Red = high concentration · Orange = medium · Green = low", "लाल = अधिक · नारंगी = मध्यम · हरा = कम")}
        actions={
          <div className="flex rounded-xl border border-slate-200 bg-white p-1">
            <Button size="sm" variant={heat ? "primary" : "ghost"} onClick={() => setHeat(true)}><Flame className="h-4 w-4" />{tr("Heatmap", "हीटमैप")}</Button>
            <Button size="sm" variant={!heat ? "primary" : "ghost"} onClick={() => setHeat(false)}><MapPin className="h-4 w-4" />{tr("Pins", "पिन")}</Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-3 lg:col-span-2">
          <CityMap heat={heat} showLegend complaints={complaints} onSelect={setSel} selectedId={sel} className="h-[28rem] sm:h-[34rem]" />
          <p className="px-2 pt-2 text-xs text-slate-500">{tr("Tap a pin to open the complaint.", "शिकायत खोलने के लिए पिन पर टैप करें।")}</p>
        </Card>
        <Card className="p-5">
          <h2 className="font-bold text-slate-900">{tr("Top Civic Hotspots", "शीर्ष नागरिक हॉटस्पॉट")}</h2>
          <ol className="mt-3 space-y-3">
            {sorted.map((a, i) => {
              const [dot, label] = level(a.count);
              return (
                <li key={a.name} className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-bold text-slate-400">{i + 1}</span>
                  <span className={cn("h-3 w-3 rounded-full", dot)} />
                  <span className="flex-1 font-semibold text-slate-800">{a.name}</span>
                  <span className="text-slate-500">{a.count}</span>
                  <span className="w-14 text-right text-xs text-slate-400">{label}</span>
                </li>
              );
            })}
          </ol>
          <p className="mt-4 text-xs text-slate-400">{tr("Demo data for sample Noida sectors.", "नोएडा के नमूना सेक्टरों का डेमो डेटा।")}</p>
        </Card>
      </div>
      <ComplaintDrawer id={sel} onClose={() => setSel(null)} />
    </Container>
  );
}
