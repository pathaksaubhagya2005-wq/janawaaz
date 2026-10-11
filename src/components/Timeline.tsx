"use client";

import React from "react";
import { Check, Circle, Loader } from "lucide-react";
import { useApp } from "@/lib/store";
import type { Complaint } from "@/lib/types";
import { cn, fmtDateTime } from "@/lib/utils";

type StageKey = "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "confirmed";

const STAGES: Array<{ key: StageKey; en: string; hi: string }> = [
  { key: "reported", en: "Reported", hi: "दर्ज किया गया" },
  { key: "verified", en: "AI Verified", hi: "AI द्वारा सत्यापित" },
  { key: "assigned", en: "Assigned to Department", hi: "विभाग को सौंपा गया" },
  { key: "in_progress", en: "Work In Progress", hi: "कार्य जारी है" },
  { key: "resolved", en: "Resolved", hi: "समाधान हुआ" },
  { key: "confirmed", en: "Citizen Confirmation", hi: "नागरिक की पुष्टि" },
];

/** Returns the index of the stage that is currently "active" (or STAGES.length when everything is done). */
export function currentStageIndex(c: Complaint): number {
  if (c.status === "resolved" && c.confirmed) return STAGES.length;
  switch (c.status) {
    case "reported":
      return 1;
    case "verified":
      return 2;
    case "assigned":
      return 3;
    case "in_progress":
    case "reopened":
      return 3;
    case "resolved":
      return 5;
  }
}

function stageTimestamp(c: Complaint, key: StageKey): string | undefined {
  const matches = c.updates.filter((u) => u.status === key);
  if (!matches.length) return undefined;
  // after a reopen, the "in progress" stage should show the latest event; resolved/confirmed are reset
  return matches[matches.length - 1].timestamp;
}

export function Timeline({ complaint }: { complaint: Complaint }) {
  const { tr, lang } = useApp();
  const cur = currentStageIndex(complaint);
  const reopened = complaint.status === "reopened";

  return (
    <ol className="relative">
      {STAGES.map((s, i) => {
        const done = i < cur;
        const active = i === cur;
        let ts = stageTimestamp(complaint, s.key);
        // hide timestamps of stages that were reset by a reopen
        if (reopened && (s.key === "resolved" || s.key === "confirmed")) ts = undefined;
        if (!done && !active && s.key !== "in_progress") ts = undefined;
        const last = i === STAGES.length - 1;
        return (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!last && (
              <span
                className={cn(
                  "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
                  done ? "bg-emerald-400" : "bg-slate-200"
                )}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
                done && "bg-emerald-500 text-white",
                active && "bg-brand-600 text-white",
                !done && !active && "border-2 border-slate-300 bg-white text-slate-300"
              )}
            >
              {done ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : active ? (
                <>
                  <span className="absolute inset-0 animate-ping2 rounded-full bg-brand-500/50" />
                  <Loader className="relative h-4 w-4 animate-spin" style={{ animationDuration: "2.5s" }} />
                </>
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </span>
            <div className="min-w-0 pt-1">
              <div
                className={cn(
                  "text-sm font-semibold",
                  done && "text-slate-900",
                  active && "text-brand-700",
                  !done && !active && "text-slate-400"
                )}
              >
                {lang === "hi" ? s.hi : s.en}
                {active && (
                  <span className="ml-2 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
                    {s.key === "confirmed"
                      ? tr("Awaiting you", "आपकी प्रतीक्षा")
                      : tr("Current", "वर्तमान")}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">
                {ts
                  ? fmtDateTime(ts)
                  : active
                  ? s.key === "confirmed"
                    ? tr("Waiting for citizen to confirm", "नागरिक की पुष्टि का इंतज़ार")
                    : tr("In progress…", "प्रक्रिया जारी…")
                  : tr("Pending", "प्रतीक्षित")}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
