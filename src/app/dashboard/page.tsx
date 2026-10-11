"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CheckCircle2, ClipboardList, Clock, FilePlus2, Loader, MapPin, Search, Wrench } from "lucide-react";
import {
  Button,
  CategoryChip,
  Container,
  EmptyState,
  ErrorState,
  ListSkeleton,
  LinkButton,
  PageHeader,
  PageLoader,
  PriorityBadge,
  StatCard,
  StatusBadge,
  inputClass,
  useFakeLoading,
} from "@/components/ui";
import { CATEGORY_MAP, STATUS_META } from "@/lib/data";
import { useRequireRole } from "@/lib/guard";
import { useApp } from "@/lib/store";
import type { Status } from "@/lib/types";
import { fmtDate } from "@/lib/utils";

export default function CitizenDashboard() {
  const allowed = useRequireRole("citizen");
  const { tr, lang, complaints, user } = useApp();
  const loading = useFakeLoading(500);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<Status | "all">("all");

  const mine = useMemo(
    () => complaints.filter((c) => c.userId === user?.id || c.followers.includes(user?.id ?? "")),
    [complaints, user]
  );
  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return mine.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (!t) return true;
      return (
        c.complaintNumber.toLowerCase().includes(t) ||
        c.address.toLowerCase().includes(t) ||
        c.description.toLowerCase().includes(t) ||
        CATEGORY_MAP[c.category].en.toLowerCase().includes(t)
      );
    });
  }, [mine, q, status]);

  if (!allowed) return <PageLoader />;

  const pending = mine.filter((c) => c.status === "reported" || c.status === "verified" || c.status === "assigned" || c.status === "reopened").length;
  const progress = mine.filter((c) => c.status === "in_progress").length;
  const resolved = mine.filter((c) => c.status === "resolved").length;
  const awaiting = mine.filter((c) => c.status === "resolved" && !c.confirmed && c.userId === user?.id);

  return (
    <Container className="py-8">
      <PageHeader
        title={`${tr("Namaste", "नमस्ते")}, ${user?.name.split(" ")[0]}`}
        subtitle={tr("Your complaints and their progress", "आपकी शिकायतें और उनकी प्रगति")}
        actions={
          <LinkButton href="/report">
            <FilePlus2 className="h-4 w-4" />
            {tr("Report an Issue", "समस्या दर्ज करें")}
          </LinkButton>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={<ClipboardList className="h-6 w-6" />} label={tr("Total complaints", "कुल शिकायतें")} value={mine.length} />
        <StatCard icon={<Clock className="h-6 w-6" />} label={tr("Pending", "लंबित")} value={pending} tone="orange" />
        <StatCard icon={<Wrench className="h-6 w-6" />} label={tr("In Progress", "कार्य जारी")} value={progress} tone="indigo" />
        <StatCard icon={<CheckCircle2 className="h-6 w-6" />} label={tr("Resolved", "समाधान हुआ")} value={resolved} tone="green" />
      </div>

      {awaiting.length > 0 && (
        <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-emerald-900">
            {tr(`${awaiting.length} complaint(s) were marked resolved. Is the issue actually fixed?`, `${awaiting.length} शिकायत(ें) हल की गईं। क्या समस्या सचमुच ठीक हुई?`)}
          </p>
          <LinkButton href={`/track?id=${awaiting[0].complaintNumber}`} variant="success" size="sm">
            {tr("Review and confirm", "देखें और पुष्टि करें")}
          </LinkButton>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            className={`${inputClass} pl-9`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={tr("Search by ID, place or issue", "आईडी, स्थान या समस्या से खोजें")}
            aria-label={tr("Search complaints", "शिकायतें खोजें")}
          />
        </div>
        <select className={`${inputClass} sm:w-52`} value={status} onChange={(e) => setStatus(e.target.value as Status | "all")} aria-label={tr("Filter by status", "स्थिति से फ़िल्टर")}>
          <option value="all">{tr("All statuses", "सभी स्थितियाँ")}</option>
          {(Object.keys(STATUS_META) as Status[]).map((s) => (
            <option key={s} value={s}>{lang === "hi" ? STATUS_META[s].hi : STATUS_META[s].en}</option>
          ))}
        </select>
      </div>

      <div className="mt-4">
        {loading ? (
          <ListSkeleton />
        ) : mine.length === 0 ? (
          <EmptyState
            title={tr("No complaints yet", "अभी कोई शिकायत नहीं")}
            description={tr("Report your first civic issue and track it here.", "अपनी पहली नागरिक समस्या दर्ज करें और यहाँ ट्रैक करें।")}
            action={<LinkButton href="/report">{tr("Report an Issue", "समस्या दर्ज करें")}</LinkButton>}
          />
        ) : shown.length === 0 ? (
          <EmptyState
            title={tr("No matching complaints", "कोई मिलती-जुलती शिकायत नहीं")}
            action={<Button variant="secondary" onClick={() => { setQ(""); setStatus("all"); }}>{tr("Clear filters", "फ़िल्टर हटाएँ")}</Button>}
          />
        ) : (
          <ul className="space-y-3">
            {shown.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/track?id=${c.complaintNumber}`}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition hover:border-brand-300 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-bold text-slate-900">{c.complaintNumber}</span>
                      <CategoryChip category={c.category} />
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                      <span className="truncate">{c.address}</span>
                    </p>
                    <p className="text-xs text-slate-400">{fmtDate(c.createdAt)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <PriorityBadge priority={c.priority} />
                    <StatusBadge status={c.status} confirmed={c.confirmed} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}
