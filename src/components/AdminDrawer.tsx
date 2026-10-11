"use client";

import React, { useEffect, useState } from "react";
import { Camera, CheckCircle2, Crosshair, ImagePlus, Play, ShieldCheck, Wand2, X } from "lucide-react";
import { demoImage, resolveImage } from "@/lib/art";
import { DEPARTMENTS, STATUS_META, STATUS_ORDER } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { Complaint, Status } from "@/lib/types";
import { fileToDataUrl, fmtDateTime } from "@/lib/utils";
import { ComplaintView } from "./ComplaintView";
import { Button, Card, Field, Modal, inputClass } from "./ui";

function EvidenceUpload({
  label,
  value,
  onChange,
  testId,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  testId: string;
}) {
  const { tr, toast } = useApp();
  const src = resolveImage(value);
  return (
    <div>
      <div className="mb-1.5 text-sm font-semibold text-slate-800">{label}</div>
      <label
        className="flex aspect-[16/10] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-center text-xs text-slate-500 transition hover:border-brand-400 hover:bg-brand-50/40"
        data-testid={testId}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label} className="h-full w-full object-cover" />
        ) : (
          <>
            <ImagePlus className="mb-1 h-6 w-6" />
            {tr("Tap to upload", "अपलोड करने के लिए टैप करें")}
          </>
        )}
        <input
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (!f.type.startsWith("image/")) {
              toast("error", tr("Invalid file", "अमान्य फ़ाइल"), tr("Please choose an image.", "कृपया एक फोटो चुनें।"));
              return;
            }
            try {
              onChange(await fileToDataUrl(f));
            } catch (err) {
              toast("error", tr("Upload failed", "अपलोड विफल"), (err as Error).message);
            }
          }}
        />
      </label>
    </div>
  );
}

function ResolveModal({
  complaint,
  open,
  onClose,
}: {
  complaint: Complaint;
  open: boolean;
  onClose: () => void;
}) {
  const { tr, resolveComplaint, toast } = useApp();
  const [before, setBefore] = useState<string | undefined>();
  const [after, setAfter] = useState<string | undefined>();
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<{ after?: string; gps?: string }>({});
  const [now, setNow] = useState(() => new Date().toISOString());

  useEffect(() => {
    if (open) {
      setBefore(complaint.imageUrl ?? demoImage("before", complaint.category));
      setAfter(undefined);
      setGps(null);
      setNote("");
      setErrors({});
      setNow(new Date().toISOString());
    }
  }, [open, complaint.imageUrl, complaint.category]);

  const captureGps = () => {
    setGpsLoading(true);
    setTimeout(() => {
      setGps({
        lat: complaint.latitude + (Math.random() - 0.5) * 0.00012,
        lng: complaint.longitude + (Math.random() - 0.5) * 0.00012,
      });
      setGpsLoading(false);
      setErrors((e) => ({ ...e, gps: undefined }));
    }, 700);
  };

  const simulate = () => {
    setBefore(complaint.imageUrl ?? demoImage("before", complaint.category));
    setAfter(demoImage("after", complaint.category));
    setGps({
      lat: complaint.latitude + 0.00003,
      lng: complaint.longitude - 0.00002,
    });
    setNote(tr("Work completed and site cleaned. Verified on site.", "कार्य पूरा हुआ और स्थल साफ किया गया। मौके पर सत्यापित।"));
    setErrors({});
    toast("info", tr("Simulated evidence added", "सिम्युलेटेड सबूत जोड़े गए"));
  };

  const submit = () => {
    const e: { after?: string; gps?: string } = {};
    if (!after) e.after = tr("An after photo is required.", "बाद की फोटो आवश्यक है।");
    if (!gps) e.gps = tr("Capture the GPS location at the site.", "स्थल पर जीपीएस स्थान कैप्चर करें।");
    setErrors(e);
    if (e.after || e.gps || !after || !gps) return;
    resolveComplaint(complaint.id, {
      beforeImage: before ?? demoImage("before", complaint.category),
      afterImage: after,
      latitude: gps.lat,
      longitude: gps.lng,
      timestamp: new Date().toISOString(),
      note: note.trim() || undefined,
    });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      wide
      title={tr("Upload resolution evidence", "समाधान के सबूत अपलोड करें")}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tr("Cancel", "रद्द करें")}
          </Button>
          <Button variant="success" onClick={submit}>
            <CheckCircle2 className="h-4 w-4" />
            {tr("Mark as Resolved", "समाधान हुआ चिह्नित करें")}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={simulate}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-brand-300 bg-brand-50 px-4 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-100"
        >
          <Wand2 className="h-4 w-4" />
          {tr("Fill with simulated evidence (demo)", "सिम्युलेटेड सबूत भरें (डेमो)")}
        </button>

        <div className="grid gap-4 sm:grid-cols-2">
          <EvidenceUpload label={tr("Before photo", "पहले की फोटो")} value={before} onChange={setBefore} testId="before-upload" />
          <div>
            <EvidenceUpload label={tr("After photo *", "बाद की फोटो *")} value={after} onChange={(v) => { setAfter(v); setErrors((e) => ({ ...e, after: undefined })); }} testId="after-upload" />
            {errors.after && <p className="mt-1 text-xs font-medium text-red-600">{errors.after}</p>}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 text-sm font-semibold text-slate-800">{tr("GPS location *", "जीपीएस स्थान *")}</div>
            <Button variant="secondary" className="w-full" onClick={captureGps} loading={gpsLoading}>
              <Crosshair className="h-4 w-4" />
              {gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : tr("Capture GPS at site", "स्थल पर जीपीएस लें")}
            </Button>
            {errors.gps && <p className="mt-1 text-xs font-medium text-red-600">{errors.gps}</p>}
          </div>
          <div>
            <div className="mb-1.5 text-sm font-semibold text-slate-800">{tr("Resolution timestamp", "समाधान का समय")}</div>
            <div className="flex h-11 items-center rounded-xl bg-slate-100 px-3.5 text-sm text-slate-700">
              {fmtDateTime(now)}
            </div>
          </div>
        </div>

        <Field label={tr("Officer note (optional)", "अधिकारी की टिप्पणी (वैकल्पिक)")} htmlFor="res-note">
          <textarea
            id="res-note"
            rows={2}
            className={inputClass}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </Field>
      </div>
    </Modal>
  );
}

const NEXT_ACTION: Partial<Record<Status, { to: Status; en: string; hi: string }>> = {
  reported: { to: "verified", en: "Verify complaint", hi: "शिकायत सत्यापित करें" },
  verified: { to: "assigned", en: "Assign to department", hi: "विभाग को सौंपें" },
  assigned: { to: "in_progress", en: "Start work · set In Progress", hi: "कार्य शुरू करें · कार्य जारी" },
};

export function AdminControls({ complaint }: { complaint: Complaint }) {
  const { tr, lang, updateStatus, assignDepartment, askConfirm } = useApp();
  const [resolveOpen, setResolveOpen] = useState(false);
  const next = NEXT_ACTION[complaint.status];
  const canResolve = complaint.status === "in_progress" || complaint.status === "reopened";

  return (
    <Card className="border-brand-200 bg-white p-5 ring-2 ring-brand-100">
      <div className="mb-4 flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-brand-600" />
        <h3 className="font-bold text-slate-900">{tr("Officer actions", "अधिकारी की कार्रवाई")}</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label={tr("Assigned department", "सौंपा गया विभाग")} htmlFor="dept-select">
          <select
            id="dept-select"
            className={inputClass}
            value={complaint.department}
            onChange={(e) => {
              const d = DEPARTMENTS.find((x) => x.key === e.target.value);
              if (!d) return;
              askConfirm({
                title: tr("Re-assign department?", "विभाग बदलें?"),
                message: tr(
                  `Move ${complaint.complaintNumber} to ${d.en}?`,
                  `${complaint.complaintNumber} को ${d.hi} को सौंपें?`
                ),
                confirmLabel: tr("Re-assign", "बदलें"),
                onConfirm: () => assignDepartment(complaint.id, d.key),
              });
            }}
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.key} value={d.key}>
                {lang === "hi" ? d.hi : d.en}
              </option>
            ))}
          </select>
        </Field>

        <Field label={tr("Change status", "स्थिति बदलें")} htmlFor="status-select">
          <select
            id="status-select"
            className={inputClass}
            value={complaint.status}
            onChange={(e) => {
              const s = e.target.value as Status;
              if (s === complaint.status) return;
              if (s === "resolved") {
                setResolveOpen(true);
                return;
              }
              updateStatus(complaint.id, s);
            }}
          >
            {[...STATUS_ORDER, "reopened" as Status].map((s) => (
              <option key={s} value={s} disabled={s === "reopened"}>
                {lang === "hi" ? STATUS_META[s].hi : STATUS_META[s].en}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        {next && (
          <Button size="lg" className="flex-1" onClick={() => updateStatus(complaint.id, next.to)}>
            <Play className="h-4 w-4" />
            {lang === "hi" ? next.hi : next.en}
          </Button>
        )}
        {canResolve && (
          <Button size="lg" variant="success" className="flex-1" onClick={() => setResolveOpen(true)}>
            <Camera className="h-4 w-4" />
            {tr("Upload evidence & mark Resolved", "सबूत अपलोड करें और समाधान चिह्नित करें")}
          </Button>
        )}
        {complaint.status === "resolved" && (
          <div className="flex flex-1 items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            {complaint.confirmed
              ? tr("Resolved and confirmed by citizen", "समाधान हुआ और नागरिक द्वारा पुष्टि की गई")
              : tr("Resolved · waiting for citizen confirmation", "समाधान हुआ · नागरिक की पुष्टि की प्रतीक्षा")}
          </div>
        )}
      </div>

      <ResolveModal complaint={complaint} open={resolveOpen} onClose={() => setResolveOpen(false)} />
    </Card>
  );
}

export function ComplaintDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const { complaints, tr } = useApp();
  const complaint = complaints.find((c) => c.id === id);

  useEffect(() => {
    if (!id) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [id, onClose]);

  if (!id || !complaint) return null;
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={tr("Complaint details", "शिकायत का विवरण")}
        className="absolute inset-y-0 right-0 w-full max-w-5xl animate-slideIn overflow-y-auto bg-slate-50 p-4 shadow-pop sm:p-6"
      >
        <div className="mb-4 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
            {tr("Close", "बंद करें")}
          </Button>
        </div>
        <ComplaintView complaint={complaint} adminControls={<AdminControls complaint={complaint} />} />
      </aside>
    </div>
  );
}
