"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button, Card, Field, PageLoader, inputClass } from "@/components/ui";
import { DEMO_CREDENTIALS } from "@/lib/data";
import { useApp } from "@/lib/store";

function LoginInner() {
  const { tr, login, loginWithCredentials } = useApp();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const go = (role: "citizen" | "admin") => {
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    const allowed = safeNext && (role === "admin" ? safeNext.startsWith("/admin") : !safeNext.startsWith("/admin"));
    router.push(allowed ? safeNext! : role === "admin" ? "/admin" : "/dashboard");
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) errs.email = tr("Enter a valid email address.", "सही ईमेल पता डालें।");
    if (password.length < 4) errs.password = tr("Password must be at least 4 characters.", "पासवर्ड कम से कम 4 अक्षरों का हो।");
    if (Object.keys(errs).length) return setErrors(errs);
    setBusy(true);
    setTimeout(() => {
      const role = loginWithCredentials(email, password);
      setBusy(false);
      if (!role) return setErrors({ form: tr("Wrong email or password. Use the demo accounts below.", "ईमेल या पासवर्ड गलत है। नीचे दिए डेमो खातों का उपयोग करें।") });
      go(role);
    }, 400);
  };

  const quick = (role: "citizen" | "admin") => {
    login(role);
    go(role);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2">
      <Card className="p-6 sm:p-8">
        <Logo size={44} showTagline />
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">{tr("Welcome back", "वापसी पर स्वागत है")}</h1>
        <p className="text-sm text-slate-500">{tr("Login to report and track civic issues.", "समस्याएँ दर्ज और ट्रैक करने के लिए लॉगिन करें।")}</p>
        <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
          {errors.form && (
            <div role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{errors.form}</div>
          )}
          <Field label={tr("Email", "ईमेल")} htmlFor="email" error={errors.email} required>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input id="email" type="email" autoComplete="email" className={`${inputClass} pl-9`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="citizen@janawaaz.demo" />
            </div>
          </Field>
          <Field label={tr("Password", "पासवर्ड")} htmlFor="password" error={errors.password} required>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input id="password" type="password" autoComplete="current-password" className={`${inputClass} pl-9`} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
            </div>
          </Field>
          <Button type="submit" size="lg" className="w-full" loading={busy}>{tr("Login", "लॉगिन")}</Button>
        </form>
      </Card>

      <Card className="border-orange-200 bg-orange-50/40 p-6 sm:p-8">
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{tr("DEMO ACCOUNTS", "डेमो खाते")}</span>
        <h2 className="mt-3 text-xl font-extrabold text-slate-900">{tr("One-click demo login", "एक क्लिक में डेमो लॉगिन")}</h2>
        <div className="mt-5 space-y-3">
          <button onClick={() => quick("citizen")} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-brand-400">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><User className="h-6 w-6" /></span>
            <span>
              <span className="block font-bold text-slate-900">{tr("Login as Citizen", "नागरिक के रूप में लॉगिन")}</span>
              <span className="block text-xs text-slate-500">Aarav Sharma · {DEMO_CREDENTIALS.citizen.email} / {DEMO_CREDENTIALS.citizen.password}</span>
            </span>
          </button>
          <button onClick={() => quick("admin")} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-card transition hover:border-brand-400">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><ShieldCheck className="h-6 w-6" /></span>
            <span>
              <span className="block font-bold text-slate-900">{tr("Login as Official / Admin", "अधिकारी / एडमिन के रूप में लॉगिन")}</span>
              <span className="block text-xs text-slate-500">Neha Verma · {DEMO_CREDENTIALS.admin.email} / {DEMO_CREDENTIALS.admin.password}</span>
            </span>
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">
          {tr("Prototype only: no real authentication or data. Passwords here are demo values.", "केवल प्रोटोटाइप: असली प्रमाणीकरण या डेटा नहीं। यहाँ पासवर्ड डेमो मान हैं।")}
        </p>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<PageLoader />}>
      <LoginInner />
    </Suspense>
  );
}
