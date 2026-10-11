"use client";

import { useRouter } from "next/navigation";
import { LogOut, Mail, MapPin, Phone, RotateCcw } from "lucide-react";
import { Button, Card, Container, PageHeader, PageLoader } from "@/components/ui";
import { useApp } from "@/lib/store";
import { useRequireRole } from "@/lib/guard";

export default function ProfilePage() {
  const allowed = useRequireRole("citizen");
  const { tr, user, complaints, logout, askConfirm, resetDemo, lang, setLang } = useApp();
  const router = useRouter();
  if (!allowed || !user) return <PageLoader />;
  const mine = complaints.filter((c) => c.userId === user.id);
  const rows = [
    { icon: Mail, k: tr("Email", "ईमेल"), v: user.email },
    { icon: Phone, k: tr("Phone", "फ़ोन"), v: user.phone },
    { icon: MapPin, k: tr("Ward / Area", "वार्ड / क्षेत्र"), v: user.ward },
  ];
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader title={tr("Profile", "प्रोफ़ाइल")} />
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-600 text-2xl font-extrabold text-white">{user.name[0]}</span>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{tr("Citizen", "नागरिक")} · {mine.length} {tr("complaints filed", "शिकायतें दर्ज")}</p>
          </div>
        </div>
        <dl className="mt-5 divide-y divide-slate-100">
          {rows.map((r) => (
            <div key={r.k} className="flex items-center gap-3 py-3 text-sm">
              <r.icon className="h-4 w-4 text-brand-600" />
              <dt className="w-28 text-slate-500">{r.k}</dt>
              <dd className="font-medium text-slate-900">{r.v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card className="mt-5 p-6">
        <h3 className="font-bold text-slate-900">{tr("Language", "भाषा")}</h3>
        <div className="mt-3 flex gap-2">
          <Button variant={lang === "en" ? "primary" : "secondary"} size="sm" onClick={() => setLang("en")}>English</Button>
          <Button variant={lang === "hi" ? "primary" : "secondary"} size="sm" onClick={() => setLang("hi")}>हिन्दी</Button>
        </div>
      </Card>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button
          variant="secondary"
          onClick={() => askConfirm({
            title: tr("Reset demo data?", "डेमो डेटा रीसेट करें?"),
            message: tr("All complaints you created in this demo will be removed and the sample data restored.", "इस डेमो में बनाई गई सभी शिकायतें हटेंगी और नमूना डेटा लौट आएगा।"),
            confirmLabel: tr("Reset", "रीसेट"),
            tone: "danger",
            onConfirm: resetDemo,
          })}
        >
          <RotateCcw className="h-4 w-4" />
          {tr("Reset demo data", "डेमो डेटा रीसेट करें")}
        </Button>
        <Button variant="danger" onClick={() => { logout(); router.push("/"); }}>
          <LogOut className="h-4 w-4" />
          {tr("Logout", "लॉगआउट")}
        </Button>
      </div>
    </Container>
  );
}
