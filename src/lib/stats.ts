import type { Complaint } from "./types";

const DAY = 86400000;

export function isOpen(c: Complaint): boolean {
  return !(c.status === "resolved");
}

function istDay(ms: number): string {
  return new Date(ms + 330 * 60000).toISOString().slice(0, 10);
}

export function resolvedAt(c: Complaint): number | null {
  const u = [...c.updates].reverse().find((x) => x.status === "resolved");
  return u ? new Date(u.timestamp).getTime() : null;
}

export function adminStats(complaints: Complaint[]) {
  const open = complaints.filter(isOpen);
  const today = istDay(Date.now());
  const resolvedToday = complaints.filter((c) => {
    const t = resolvedAt(c);
    return c.status === "resolved" && t !== null && istDay(t) === today;
  }).length;
  const times = complaints
    .filter((c) => c.status === "resolved")
    .map((c) => {
      const t = resolvedAt(c);
      return t ? (t - new Date(c.createdAt).getTime()) / DAY : null;
    })
    .filter((x): x is number => x !== null && x >= 0);
  const avg = times.length ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  return {
    open: open.length,
    critical: open.filter((c) => c.priority === "critical").length,
    inProgress: complaints.filter((c) => c.status === "in_progress").length,
    resolvedToday,
    avgDays: avg,
  };
}

export function fmtDays(d: number, hi = false): string {
  if (d < 1) {
    const h = Math.max(1, Math.round(d * 24));
    return hi ? `${h} घंटे` : `${h} hrs`;
  }
  return hi ? `${d.toFixed(1)} दिन` : `${d.toFixed(1)} days`;
}
