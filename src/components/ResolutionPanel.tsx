"use client";

import React, { useState } from "react";
import { CheckCircle2, Clock, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import { resolveImage } from "@/lib/art";
import { useApp } from "@/lib/store";
import type { Complaint } from "@/lib/types";
import { fmtDateTime } from "@/lib/utils";
import { Button, Card, Modal, inputClass } from "./ui";

export function BeforeAfter({ before, after }: { before: string; after: string }) {
  const { tr } = useApp();
  const [pos, setPos] = useState(50);
  const b = resolveImage(before);
  const a = resolveImage(after);
  return (
    <div>
      <div className="relative aspect-[16/10] w-full select-none overflow-hidden rounded-2xl bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={a} alt={tr("After photo", "बाद की फोटो")} className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={b} alt={tr("Before photo", "पहले की फोटो")} className="h-full w-full object-cover" />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow" style={{ left: `${pos}%` }}>
          <span className="absolute left-1/2 top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-600 shadow-pop">
            ⇆
          </span>
        </div>
        <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white">
          {tr("BEFORE", "पहले")}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white">
          {tr("AFTER", "बाद में")}
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={tr("Compare before and after", "पहले और बाद की तुलना करें")}
        className="mt-3 w-full accent-brand-600"
      />
      <p className="text-center text-xs text-slate-500">
        {tr("Drag the slider to compare", "तुलना के लिए स्लाइडर खिसकाएँ")}
      </p>
    </div>
  );
}

export function ResolutionPanel({ complaint }: { complaint: Complaint }) {
  const { tr, user, askConfirm, confirmResolution, reopenComplaint } = useApp();
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");

  const ev = complaint.evidence;
  const isCitizenOwner =
    user?.role === "citizen" &&
    (complaint.userId === user.id || complaint.followers.includes(user.id));
  const awaiting = complaint.status === "resolved" && !complaint.confirmed;

  if (!ev || (complaint.status !== "resolved" && complaint.status !== "reopened")) return null;
  const stale = complaint.status === "reopened";

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-emerald-50/60 px-5 py-3">
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
        <h3 className="font-bold text-slate-900">
          {stale
            ? tr("Previous resolution attempt", "पिछला समाधान प्रयास")
            : tr("Resolution Evidence", "समाधान के सबूत")}
        </h3>
      </div>
      <div className="space-y-4 p-5">
        <BeforeAfter before={ev.beforeImage} after={ev.afterImage} />

        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <div className="font-semibold text-slate-800">{tr("GPS location", "जीपीएस स्थान")}</div>
              <div className="text-slate-600">
                {ev.latitude.toFixed(5)}, {ev.longitude.toFixed(5)}
              </div>
              <div className="text-xs text-emerald-700">
                {tr("Matches complaint location", "शिकायत के स्थान से मेल खाता है")}
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 rounded-xl bg-slate-50 p-3">
            <Clock className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
            <div>
              <div className="font-semibold text-slate-800">{tr("Resolution timestamp", "समाधान का समय")}</div>
              <div className="text-slate-600">{fmtDateTime(ev.timestamp)}</div>
            </div>
          </div>
        </div>
        {ev.note && (
          <p className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
            <span className="font-semibold">{tr("Officer note: ", "अधिकारी की टिप्पणी: ")}</span>
            {ev.note}
          </p>
        )}

        {complaint.confirmed && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-5 w-5" />
            {tr("Citizen confirmed this resolution. Case closed.", "नागरिक ने इस समाधान की पुष्टि की। मामला बंद।")}
          </div>
        )}

        {awaiting && isCitizenOwner && (
          <div className="rounded-2xl border-2 border-brand-200 bg-brand-50/60 p-4">
            <h4 className="text-base font-bold text-slate-900">
              {tr("Is the issue actually resolved?", "क्या समस्या वास्तव में हल हो गई है?")}
            </h4>
            <p className="mt-1 text-sm text-slate-600">
              {tr(
                "Your confirmation keeps departments accountable. If it is not fixed, reopen the complaint.",
                "आपकी पुष्टि विभागों को जवाबदेह रखती है। यदि समस्या ठीक नहीं हुई है तो शिकायत दोबारा खोलें।"
              )}
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button
                variant="success"
                size="lg"
                className="flex-1"
                onClick={() =>
                  askConfirm({
                    title: tr("Confirm resolution?", "समाधान की पुष्टि करें?"),
                    message: tr(
                      `You are confirming that ${complaint.complaintNumber} has been fixed. The case will be closed.`,
                      `आप पुष्टि कर रहे हैं कि ${complaint.complaintNumber} ठीक हो गई है। मामला बंद कर दिया जाएगा।`
                    ),
                    confirmLabel: tr("Yes, it is resolved", "हाँ, समाधान हुआ"),
                    tone: "success",
                    onConfirm: () => confirmResolution(complaint.id),
                  })
                }
              >
                ✓ {tr("Yes, Issue Resolved", "हाँ, समस्या हल हुई")}
              </Button>
              <Button variant="secondary" size="lg" className="flex-1" onClick={() => setReopenOpen(true)}>
                <RotateCcw className="h-4 w-4" />
                {tr("Reopen Complaint", "शिकायत दोबारा खोलें")}
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={reopenOpen}
        onClose={() => setReopenOpen(false)}
        title={tr("Reopen complaint", "शिकायत दोबारा खोलें")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setReopenOpen(false)}>
              {tr("Cancel", "रद्द करें")}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                if (reason.trim().length < 5) {
                  setReasonError(tr("Please tell us what is still wrong (min 5 characters).", "कृपया बताएँ कि क्या समस्या बनी हुई है (कम से कम 5 अक्षर)।"));
                  return;
                }
                reopenComplaint(complaint.id, reason.trim());
                setReopenOpen(false);
                setReason("");
                setReasonError("");
              }}
            >
              <RotateCcw className="h-4 w-4" />
              {tr("Reopen", "दोबारा खोलें")}
            </Button>
          </>
        }
      >
        <label htmlFor="reopen-reason" className="mb-1.5 block text-sm font-semibold text-slate-800">
          {tr("What is still wrong?", "अभी भी क्या समस्या है?")}
        </label>
        <textarea
          id="reopen-reason"
          rows={4}
          className={inputClass}
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            setReasonError("");
          }}
          placeholder={tr("e.g. The pothole was only partly filled and water is collecting again.", "जैसे: गड्ढा केवल आधा भरा गया और फिर से पानी जमा हो रहा है।")}
        />
        {reasonError && <p className="mt-1 text-xs font-medium text-red-600">{reasonError}</p>}
      </Modal>
    </Card>
  );
}
