"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Search } from "lucide-react";
import { ComplaintView } from "@/components/ComplaintView";
import { Button, Card, Container, EmptyState, ErrorState, PageHeader, PageLoader, inputClass } from "@/components/ui";
import { useApp } from "@/lib/store";

function TrackInner() {
  const { tr, complaints, user, mark } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const id = (params.get("id") ?? "").trim();
  const [input, setInput] = useState(id);
  const [error, setError] = useState("");

  useEffect(() => setInput(id), [id]);

  const norm = (v: string) => {
    const t = v.trim().toUpperCase().replace(/^#/, "");
    if (/^\d{1,6}$/.test(t)) return `JA-2026-${t.padStart(6, "0")}`;
    return t;
  };
  const found = id ? complaints.find((c) => c.complaintNumber === norm(id)) : undefined;

  useEffect(() => {
    if (found) mark("track");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [found?.id]);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return setError(tr("Enter a complaint ID, for example JA-2026-001248.", "शिकायत आईडी डालें, जैसे JA-2026-001248।"));
    setError("");
    router.push(`/track?id=${encodeURIComponent(norm(input))}`);
  };

  const mine = complaints.filter((c) => c.userId === user?.id).slice(0, 4);

  return (
    <Container className="py-8">
      <PageHeader title={tr("Track Complaint", "शिकायत ट्रैक करें")} subtitle={tr("Enter your complaint ID to see every stage with timestamps.", "हर चरण को समय के साथ देखने के लिए शिकायत आईडी डालें।")} />
      <Card className="mb-6 p-4">
        <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row" noValidate>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input className={`${inputClass} pl-9`} value={input} onChange={(e) => setInput(e.target.value)} placeholder="JA-2026-001248" aria-label={tr("Complaint ID", "शिकायत आईडी")} />
          </div>
          <Button type="submit">{tr("Track", "ट्रैक करें")}</Button>
        </form>
        {error && <p role="alert" className="mt-2 text-sm font-medium text-red-600">{error}</p>}
        {mine.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            {tr("Your complaints:", "आपकी शिकायतें:")}
            {mine.map((c) => (
              <button key={c.id} onClick={() => router.push(`/track?id=${c.complaintNumber}`)} className="rounded-full bg-slate-100 px-2.5 py-1 font-mono font-semibold text-slate-700 hover:bg-brand-50">
                {c.complaintNumber}
              </button>
            ))}
          </div>
        )}
      </Card>

      {!id ? (
        <EmptyState title={tr("Search for a complaint", "शिकायत खोजें")} description={tr("Type an ID above or pick one of your complaints.", "ऊपर आईडी लिखें या अपनी शिकायत चुनें।")} />
      ) : found ? (
        <ComplaintView complaint={found} />
      ) : (
        <ErrorState title={tr("Complaint not found", "शिकायत नहीं मिली")} description={tr(`No complaint matches "${id}". Check the ID and try again.`, `"${id}" से कोई शिकायत नहीं मिली। आईडी जाँचकर फिर कोशिश करें।`)} />
      )}
    </Container>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <TrackInner />
    </Suspense>
  );
}
