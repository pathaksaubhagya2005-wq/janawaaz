"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Check, ChevronDown, ChevronUp, PlayCircle, RotateCcw, X } from "lucide-react";
import { DEMO_STEPS } from "@/lib/demo";
import { useApp } from "@/lib/store";
import { cn } from "@/lib/utils";

export function DemoGuide() {
  const { demoMode, setDemoMode, demoProgress, tr, lang, user, login, resetDemo, askConfirm } = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(true);

  if (!demoMode) return null;

  const done = demoProgress.length;
  const total = DEMO_STEPS.length;
  const next = DEMO_STEPS.find((s) => !demoProgress.includes(s.key));
  const pct = Math.round((DEMO_STEPS.filter((s) => demoProgress.includes(s.key)).length / total) * 100);

  const go = () => {
    if (!next) return;
    if (next.key === "login_citizen") {
      login("citizen");
      router.push("/dashboard");
      return;
    }
    if (next.key === "switch_admin") {
      login("admin");
      router.push("/admin");
      return;
    }
    if (next.key === "switch_citizen") {
      login("citizen");
      router.push("/dashboard");
      return;
    }
    if (user && user.role !== next.role) {
      login(next.role);
      router.push(next.role === "admin" ? "/admin/complaints" : "/dashboard");
      return;
    }
    if (!user) {
      login("citizen");
    }
    if (next.href) router.push(next.href);
  };

  const actionLabel = (() => {
    if (!next) return "";
    if (next.key === "login_citizen") return tr("Login as Citizen", "नागरिक के रूप में लॉगिन");
    if (next.key === "switch_admin") return tr("Switch to Admin", "एडमिन पर स्विच करें");
    if (next.key === "switch_citizen") return tr("Switch to Citizen", "नागरिक पर स्विच करें");
    if (user && user.role !== next.role)
      return next.role === "admin" ? tr("Switch to Admin", "एडमिन पर स्विच करें") : tr("Switch to Citizen", "नागरिक पर स्विच करें");
    return tr("Take me there", "वहाँ ले चलें");
  })();

  return (
    <div className="fixed bottom-3 right-3 z-[55] w-[calc(100vw-1.5rem)] max-w-sm print:hidden">
      <div className="overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-pop">
        <button
          className="flex w-full items-center gap-3 bg-brand-700 px-4 py-3 text-left text-white"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
        >
          <PlayCircle className="h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{tr("Demo Mode", "डेमो मोड")}</div>
            <div className="text-[11px] text-brand-100">
              {tr(`Step ${Math.min(done + 1, total)} of ${total}`, `चरण ${Math.min(done + 1, total)} / ${total}`)} · {pct}%
            </div>
          </div>
          {open ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        </button>
        <div className="h-1 bg-brand-100">
          <div className="h-full bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        {open && (
          <div className="max-h-[60vh] overflow-y-auto p-3">
            {next ? (
              <div className="mb-3 rounded-xl bg-brand-50 p-3">
                <div className="text-[11px] font-bold uppercase tracking-wide text-brand-700">
                  {tr("Next step", "अगला चरण")}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-slate-900">{lang === "hi" ? next.hi : next.en}</div>
                <button
                  onClick={go}
                  className="mt-2 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
                >
                  {actionLabel} →
                </button>
              </div>
            ) : (
              <div className="mb-3 rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
                🎉 {tr("Demo complete! The full journey from report to resolution is done.", "डेमो पूरा! रिपोर्ट से समाधान तक की पूरी यात्रा पूरी हुई।")}
              </div>
            )}

            <ol className="space-y-1">
              {DEMO_STEPS.map((s, i) => {
                const ok = demoProgress.includes(s.key);
                return (
                  <li
                    key={s.key}
                    className={cn(
                      "flex items-start gap-2 rounded-lg px-2 py-1.5 text-[13px]",
                      ok ? "text-slate-500" : next?.key === s.key ? "bg-brand-50 font-semibold text-slate-900" : "text-slate-600"
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                        ok ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-600"
                      )}
                    >
                      {ok ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className={cn(ok && "line-through decoration-slate-300")}>{lang === "hi" ? s.hi : s.en}</span>
                  </li>
                );
              })}
            </ol>

            <div className="mt-3 flex gap-2">
              <button
                onClick={() =>
                  askConfirm({
                    title: tr("Reset demo data?", "डेमो डेटा रीसेट करें?"),
                    message: tr(
                      "This restores the original sample complaints and clears your demo progress.",
                      "इससे मूल नमूना शिकायतें वापस आ जाएँगी और आपकी डेमो प्रगति साफ हो जाएगी।"
                    ),
                    confirmLabel: tr("Reset", "रीसेट"),
                    tone: "danger",
                    onConfirm: () => {
                      resetDemo();
                      router.push("/");
                    },
                  })
                }
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                {tr("Reset demo", "डेमो रीसेट")}
              </button>
              <button
                onClick={() => setDemoMode(false)}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <X className="h-3.5 w-3.5" />
                {tr("Exit demo", "डेमो बंद करें")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
