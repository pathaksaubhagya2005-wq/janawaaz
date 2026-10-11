"use client";

import React from "react";
import { Building2, Calendar, MapPin, Sparkles, Users } from "lucide-react";
import { resolveImage } from "@/lib/art";
import { CATEGORY_MAP, DEPT_MAP, userName } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { Complaint } from "@/lib/types";
import { fmtDateTime } from "@/lib/utils";
import { CityMap } from "./CityMap";
import { ResolutionPanel } from "./ResolutionPanel";
import { Timeline } from "./Timeline";
import { Card, CategoryChip, PriorityBadge, StatusBadge, deptName } from "./ui";

export function RoutingExplainer({ complaint }: { complaint: Complaint }) {
  const { tr, lang } = useApp();
  const cat = CATEGORY_MAP[complaint.category];
  return (
    <div className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-brand-800">
        <Sparkles className="h-4 w-4" />
        {tr("AI automatically routed this complaint to the correct department.", "AI ने इस शिकायत को स्वचालित रूप से सही विभाग को भेजा।")}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
        <span className="rounded-lg bg-white px-2.5 py-1.5 font-semibold shadow-sm ring-1 ring-slate-200">
          {cat.emoji} {lang === "hi" ? cat.hi : cat.en}
        </span>
        <span className="text-brand-500">→</span>
        <span className="rounded-lg bg-brand-600 px-2.5 py-1.5 font-semibold text-white shadow-sm">
          {deptName(complaint.department, lang === "hi")}
        </span>
      </div>
    </div>
  );
}

export function ComplaintView({
  complaint,
  adminControls,
}: {
  complaint: Complaint;
  adminControls?: React.ReactNode;
}) {
  const { tr, lang } = useApp();
  const img = resolveImage(complaint.imageUrl);
  const dept = DEPT_MAP[complaint.department];

  return (
    <div className="space-y-5">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {tr("Complaint", "शिकायत")}
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              #{complaint.complaintNumber}
            </h2>
            <div className="mt-2">
              <CategoryChip category={complaint.category} className="text-base" />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={complaint.status} confirmed={complaint.confirmed} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>
        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <span className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {complaint.address}
          </span>
          <span className="flex items-start gap-2">
            <Calendar className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {tr("Reported", "दर्ज")}: {fmtDateTime(complaint.createdAt)}
          </span>
          <span className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {lang === "hi" ? dept.hi : dept.en}
          </span>
          <span className="flex items-start gap-2">
            <Users className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            {complaint.reportCount} {tr("citizen(s) reported this case", "नागरिकों ने यह मामला दर्ज किया")}
          </span>
        </div>
      </Card>

      {adminControls}

      <div className="grid gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          <Card className="p-5">
            <h3 className="mb-2 font-bold text-slate-900">{tr("Description", "विवरण")}</h3>
            <p className="text-sm leading-relaxed text-slate-700">{complaint.description}</p>
            <div className="mt-2 text-xs text-slate-500">
              {tr("Reported by", "दर्ज करने वाले")}: {userName(complaint.userId)}
              {complaint.aiConfidence ? ` · ${tr("AI confidence", "AI विश्वास")} ${complaint.aiConfidence}%` : ""}
            </div>
            {img && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={tr("Complaint evidence", "शिकायत का सबूत")} className="max-h-72 w-full object-cover" />
              </div>
            )}
          </Card>

          <RoutingExplainer complaint={complaint} />
          <ResolutionPanel complaint={complaint} />

          <Card className="p-5">
            <h3 className="mb-3 font-bold text-slate-900">{tr("Activity log", "गतिविधि लॉग")}</h3>
            <ul className="space-y-3">
              {[...complaint.updates].reverse().map((u) => (
                <li key={u.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <div className="text-slate-800">{u.message}</div>
                    <div className="text-xs text-slate-500">{fmtDateTime(u.timestamp)}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="space-y-5 lg:col-span-2">
          <Card className="p-5">
            <h3 className="mb-4 font-bold text-slate-900">{tr("Progress timeline", "प्रगति समयरेखा")}</h3>
            <Timeline complaint={complaint} />
          </Card>
          <Card className="p-3">
            <h3 className="mb-2 px-2 pt-2 font-bold text-slate-900">{tr("Location", "स्थान")}</h3>
            <CityMap
              complaints={[complaint]}
              focus={{ lat: complaint.latitude, lng: complaint.longitude }}
              selectedId={complaint.id}
              className="h-64"
            />
            <p className="px-2 pb-2 pt-2 text-xs text-slate-500">
              {complaint.latitude.toFixed(5)}, {complaint.longitude.toFixed(5)}
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
