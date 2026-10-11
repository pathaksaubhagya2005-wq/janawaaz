"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Building2,
  CheckCheck,
  FilePlus2,
  PlayCircle,
  Route,
  ScanSearch,
  Search,
  Wrench,
} from "lucide-react";
import { CityMap } from "@/components/CityMap";
import { Logo } from "@/components/Logo";
import { Card, Container, LinkButton, btnClass } from "@/components/ui";
import { LANDING_CATEGORIES, LANDING_STATS } from "@/lib/data";
import { useApp } from "@/lib/store";

export default function LandingPage() {
  const { tr, lang, complaints, user, setDemoMode, demoMode } = useApp();
  const hi = lang === "hi";

  const steps = [
    { icon: FilePlus2, en: "Report", hi: "रिपोर्ट", dEn: "Describe the problem with photo, voice and location.", dHi: "फोटो, आवाज़ और स्थान के साथ समस्या बताएँ।" },
    { icon: ScanSearch, en: "AI Verification", hi: "AI सत्यापन", dEn: "AI checks the issue and finds duplicate reports.", dHi: "AI समस्या जाँचता है और डुप्लिकेट पहचानता है।" },
    { icon: Route, en: "Smart Routing", hi: "स्मार्ट रूटिंग", dEn: "Priority is set and the right department is assigned.", dHi: "प्राथमिकता तय होती है और सही विभाग को भेजा जाता है।" },
    { icon: Bell, en: "Track", hi: "ट्रैक", dEn: "Follow every stage with timestamps and alerts.", dHi: "हर चरण को समय और सूचनाओं के साथ देखें।" },
    { icon: Wrench, en: "Resolve", hi: "समाधान", dEn: "Officials fix it and upload before/after proof.", dHi: "अधिकारी ठीक करके पहले/बाद का सबूत डालते हैं।" },
    { icon: BadgeCheck, en: "Confirm", hi: "पुष्टि", dEn: "You confirm the fix, or reopen the complaint.", dHi: "आप समाधान की पुष्टि करते हैं या शिकायत दोबारा खोलते हैं।" },
  ];

  const stats = [
    { v: LANDING_STATS.reported.toLocaleString("en-IN"), en: "Issues Reported", hi: "दर्ज की गई समस्याएँ", c: "text-brand-700" },
    { v: LANDING_STATS.resolved.toLocaleString("en-IN"), en: "Issues Resolved", hi: "हल की गई समस्याएँ", c: "text-emerald-600" },
    { v: `${LANDING_STATS.rate}%`, en: "Resolution Rate", hi: "समाधान दर", c: "text-emerald-600" },
    { v: String(LANDING_STATS.hotspots), en: "Active Hotspots", hi: "सक्रिय हॉटस्पॉट", c: "text-orange-600" },
  ];

  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand-100/60 blur-3xl" />
        <Container className="relative grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-20">
          <div>
            <Logo size={52} showTagline />
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              {tr("Your City. Your Voice. ", "आपका शहर। आपकी आवाज़। ")}
              <span className="text-brand-600">{tr("Your Solution.", "आपका समाधान।")}</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              {tr(
                "Report potholes, garbage, broken streetlights, water leaks and more in under a minute. JanAwaaz verifies, routes and tracks every complaint until it is truly resolved.",
                "गड्ढे, कचरा, खराब स्ट्रीटलाइट, पानी का रिसाव और अन्य समस्याएँ एक मिनट में दर्ज करें। JanAwaaz हर शिकायत को सत्यापित, रूट और ट्रैक करता है जब तक वह सचमुच हल न हो जाए।"
              )}
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <LinkButton href="/report" size="lg">
                <FilePlus2 className="h-5 w-5" />
                {tr("Report an Issue", "समस्या दर्ज करें")}
              </LinkButton>
              <LinkButton href="/track" size="lg" variant="secondary">
                <Search className="h-5 w-5" />
                {tr("Track Complaint", "शिकायत ट्रैक करें")}
              </LinkButton>
            </div>
            {!demoMode && (
              <button
                onClick={() => setDemoMode(true)}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-700 hover:underline"
              >
                <PlayCircle className="h-4 w-4" />
                {tr("Presenting to judges? Start the guided Demo Mode", "जजों को दिखा रहे हैं? गाइडेड डेमो मोड शुरू करें")}
              </button>
            )}
            <p className="mt-6 text-xs font-medium text-slate-500">
              {tr("Team PENTABYTE · Demo prototype with sample data", "टीम PENTABYTE · नमूना डेटा के साथ डेमो प्रोटोटाइप")}
            </p>
          </div>

          <Card className="p-3 shadow-pop">
            <CityMap complaints={complaints} showLegend className="h-72 sm:h-96" />
            <div className="flex items-center justify-between px-2 pb-1 pt-3 text-sm">
              <span className="font-semibold text-slate-800">
                {tr("Live civic complaints (demo)", "लाइव नागरिक शिकायतें (डेमो)")}
              </span>
              <span className="text-slate-500">{complaints.length} {tr("on map", "नक्शे पर")}</span>
            </div>
          </Card>
        </Container>
      </section>

      {/* stats */}
      <section className="border-y border-slate-200 bg-white">
        <Container className="grid grid-cols-2 gap-6 py-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.en} className="text-center">
              <div className={`text-3xl font-extrabold sm:text-4xl ${s.c}`}>{s.v}</div>
              <div className="mt-1 text-sm font-medium text-slate-500">{hi ? s.hi : s.en}</div>
            </div>
          ))}
        </Container>
        <p className="pb-4 text-center text-xs text-slate-400">
          {tr("Impact statistics are demo data.", "प्रभाव के आँकड़े डेमो डेटा हैं।")}
        </p>
      </section>

      {/* categories */}
      <section className="py-14">
        <Container>
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {tr("What can you report?", "आप क्या रिपोर्ट कर सकते हैं?")}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {LANDING_CATEGORIES.map((c) => (
              <Link
                key={c.en}
                href={`/report?category=${c.category}`}
                className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-brand-300"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-2xl">{c.emoji}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{hi ? c.hi : c.en}</h3>
                <p className="text-sm text-slate-500">{hi ? c.descHi : c.descEn}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  {tr("Report now", "अभी रिपोर्ट करें")}
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* how it works */}
      <section className="bg-white py-14">
        <Container>
          <h2 className="text-center text-2xl font-extrabold text-slate-900 sm:text-3xl">
            {tr("How JanAwaaz Works", "JanAwaaz कैसे काम करता है")}
          </h2>
          <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.en} className="relative rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                <span className="absolute right-4 top-4 text-3xl font-black text-slate-200">{i + 1}</span>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                  <s.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-3 font-bold text-slate-900">{hi ? s.hi : s.en}</h3>
                <p className="mt-1 text-sm text-slate-600">{hi ? s.dHi : s.dEn}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* cta */}
      <section className="py-14">
        <Container>
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-6 py-10 text-center text-white">
            <CheckCheck className="h-9 w-9 text-emerald-300" />
            <h2 className="text-2xl font-extrabold sm:text-3xl">
              {tr("Samasya Se Samadhaan Tak", "समस्या से समाधान तक")}
            </h2>
            <p className="max-w-xl text-brand-100">
              {tr("Every complaint gets a number, a department and a deadline for accountability.", "हर शिकायत को एक नंबर, एक विभाग और जवाबदेही मिलती है।")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href={user ? (user.role === "admin" ? "/admin" : "/dashboard") : "/login"} className={btnClass("secondary", "lg")}>
                <Building2 className="h-5 w-5" />
                {user ? tr("Go to my dashboard", "मेरे डैशबोर्ड पर जाएँ") : tr("Login (Citizen / Official)", "लॉगिन (नागरिक / अधिकारी)")}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        JanAwaaz · {tr("Samasya Se Samadhaan Tak", "समस्या से समाधान तक")} · Team PENTABYTE ·{" "}
        {tr("All locations and numbers are demo data", "सभी स्थान और संख्याएँ डेमो डेटा हैं")}
      </footer>
    </div>
  );
}
