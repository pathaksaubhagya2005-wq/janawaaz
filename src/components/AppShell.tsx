"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CheckCircle2,
  ClipboardList,
  FilePlus2,
  FileText,
  Home,
  Info,
  LayoutDashboard,
  ListChecks,
  LogIn,
  LogOut,
  Map as MapIcon,
  Menu,
  PlayCircle,
  Repeat,
  Search,
  User as UserIcon,
  X,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { notifMessage, notifTitle, NOTIF_META } from "@/lib/notif";
import type { AppNotification } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { DemoGuide } from "./DemoGuide";
import { Logo } from "./Logo";
import { Button, PageLoader } from "./ui";

interface NavItem {
  href: string;
  en: string;
  hi: string;
  icon: React.ReactNode;
}

const ic = "h-4 w-4";

const PUBLIC_NAV: NavItem[] = [
  { href: "/", en: "Home", hi: "होम", icon: <Home className={ic} /> },
  { href: "/report", en: "Report Issue", hi: "समस्या दर्ज करें", icon: <FilePlus2 className={ic} /> },
  { href: "/track", en: "Track Complaint", hi: "शिकायत ट्रैक करें", icon: <Search className={ic} /> },
];

const CITIZEN_NAV: NavItem[] = [
  { href: "/", en: "Home", hi: "होम", icon: <Home className={ic} /> },
  { href: "/report", en: "Report Issue", hi: "समस्या दर्ज करें", icon: <FilePlus2 className={ic} /> },
  { href: "/dashboard", en: "My Complaints", hi: "मेरी शिकायतें", icon: <ClipboardList className={ic} /> },
  { href: "/track", en: "Track Complaint", hi: "शिकायत ट्रैक करें", icon: <Search className={ic} /> },
  { href: "/notifications", en: "Notifications", hi: "सूचनाएँ", icon: <Bell className={ic} /> },
  { href: "/profile", en: "Profile", hi: "प्रोफ़ाइल", icon: <UserIcon className={ic} /> },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", en: "Dashboard", hi: "डैशबोर्ड", icon: <LayoutDashboard className={ic} /> },
  { href: "/admin/complaints", en: "Complaints", hi: "शिकायतें", icon: <ListChecks className={ic} /> },
  { href: "/admin/map", en: "Map / Hotspots", hi: "नक्शा / हॉटस्पॉट", icon: <MapIcon className={ic} /> },
  { href: "/admin/departments", en: "Departments", hi: "विभाग", icon: <Building2 className={ic} /> },
  { href: "/admin/analytics", en: "Analytics", hi: "विश्लेषण", icon: <BarChart3 className={ic} /> },
  { href: "/admin/reports", en: "Reports", hi: "रिपोर्ट", icon: <FileText className={ic} /> },
];

function isActive(pathname: string, href: string) {
  if (href === "/" || href === "/admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

/* ---------------- notification panel ---------------- */

export function useMyNotifications(): AppNotification[] {
  const { notifications, user } = useApp();
  if (!user) return [];
  return notifications.filter(
    (n) => n.audience === user.role && (user.role === "admin" || n.userId === user.id)
  );
}

const TONE: Record<string, string> = {
  blue: "bg-brand-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
  indigo: "bg-indigo-50 text-indigo-600",
};

export function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  const tone = TONE[NOTIF_META[type].tone];
  const icon =
    type === "resolved" || type === "confirmed" ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : type === "reopened" ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Bell className="h-4 w-4" />
    );
  return <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", tone)}>{icon}</span>;
}

export function useOpenNotification() {
  const router = useRouter();
  const { markNotificationRead, user } = useApp();
  return (n: AppNotification) => {
    markNotificationRead(n.id);
    if (user?.role === "admin") router.push(`/admin/complaints?open=${n.complaintId ?? ""}`);
    else if (n.complaintNumber) router.push(`/track?id=${n.complaintNumber}`);
  };
}

function NotificationBell() {
  const { tr, lang, markAllRead } = useApp();
  const items = useMyNotifications();
  const open = useOpenNotification();
  const { user } = useApp();
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    if (!show) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setShow(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShow(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [show]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setShow((s) => !s)}
        aria-label={tr("Notifications", "सूचनाएँ")}
        aria-expanded={show}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>
      {show && (
        <div className="fixed inset-x-3 top-16 z-[70] animate-fadeUp overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h3 className="font-bold text-slate-900">{tr("Notifications", "सूचनाएँ")}</h3>
            <button onClick={markAllRead} className="text-xs font-semibold text-brand-600 hover:underline">
              {tr("Mark all read", "सभी पढ़ा हुआ करें")}
            </button>
          </div>
          <ul className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
            {items.length === 0 && (
              <li className="px-4 py-8 text-center text-sm text-slate-500">
                {tr("No notifications yet", "अभी कोई सूचना नहीं")}
              </li>
            )}
            {items.slice(0, 7).map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => {
                    open(n);
                    setShow(false);
                  }}
                  className={cn("flex w-full gap-3 px-4 py-3 text-left hover:bg-slate-50", !n.read && "bg-brand-50/50")}
                >
                  <NotificationIcon type={n.type} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900">{notifTitle(n, lang === "hi")}</span>
                      <span className="shrink-0 text-[11px] text-slate-400">{timeAgo(n.timestamp, lang === "hi")}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-slate-600">{notifMessage(n, lang === "hi")}</span>
                  </span>
                  {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                </button>
              </li>
            ))}
          </ul>
          {user?.role === "citizen" && (
            <Link
              href="/notifications"
              onClick={() => setShow(false)}
              className="block border-t border-slate-100 px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-slate-50"
            >
              {tr("View all notifications", "सभी सूचनाएँ देखें")}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------------- toasts + confirm ---------------- */

function Toasts() {
  const { toasts, dismissToast } = useApp();
  return (
    <div
      className="pointer-events-none fixed inset-x-3 top-3 z-[100] flex flex-col gap-2 sm:inset-x-auto sm:right-4 sm:top-4 sm:w-96"
      aria-live="polite"
    >
      {toasts.map((t) => {
        const styles =
          t.kind === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : t.kind === "error"
            ? "border-red-200 bg-red-50 text-red-900"
            : t.kind === "warning"
            ? "border-orange-200 bg-orange-50 text-orange-900"
            : "border-brand-200 bg-white text-slate-900";
        const icon =
          t.kind === "success" ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : t.kind === "info" ? (
            <Info className="h-5 w-5 text-brand-600" />
          ) : (
            <AlertTriangle className={cn("h-5 w-5", t.kind === "error" ? "text-red-600" : "text-orange-600")} />
          );
        return (
          <div
            key={t.id}
            role="status"
            className={cn("pointer-events-auto flex animate-slideIn items-start gap-3 rounded-2xl border p-3.5 shadow-pop", styles)}
          >
            <span className="mt-0.5 shrink-0">{icon}</span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold">{t.title}</div>
              {t.message && <div className="text-xs opacity-80">{t.message}</div>}
            </div>
            <button onClick={() => dismissToast(t.id)} aria-label="Dismiss" className="rounded p-0.5 opacity-60 hover:opacity-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function ConfirmDialog() {
  const { confirmState, closeConfirm, tr } = useApp();
  useEffect(() => {
    if (!confirmState) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeConfirm();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [confirmState, closeConfirm]);
  if (!confirmState) return null;
  const tone = confirmState.tone ?? "primary";
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeConfirm} aria-hidden />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-label={confirmState.title}
        className="relative w-full max-w-sm animate-fadeUp rounded-3xl bg-white p-6 shadow-pop"
      >
        <h2 className="text-lg font-bold text-slate-900">{confirmState.title}</h2>
        <p className="mt-2 text-sm text-slate-600">{confirmState.message}</p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={closeConfirm}>
            {confirmState.cancelLabel ?? tr("Cancel", "रद्द करें")}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : tone === "success" ? "success" : "primary"}
            onClick={() => {
              const fn = confirmState.onConfirm;
              closeConfirm();
              fn();
            }}
          >
            {confirmState.confirmLabel ?? tr("Confirm", "पुष्टि करें")}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- header ---------------- */

function LangToggle() {
  const { lang, setLang } = useApp();
  return (
    <div className="flex rounded-xl bg-slate-100 p-0.5 text-xs font-bold" role="group" aria-label="Language">
      {(["en", "hi"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "rounded-[10px] px-2.5 py-1.5 transition",
            lang === l ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          )}
        >
          {l === "en" ? "EN" : "हिं"}
        </button>
      ))}
    </div>
  );
}

function Header() {
  const { user, tr, lang, logout, login, demoMode, setDemoMode } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const [menu, setMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  const nav = !user ? PUBLIC_NAV : user.role === "admin" ? ADMIN_NAV : CITIZEN_NAV;
  const desktopNav = nav.filter((n) => n.href !== "/notifications");

  useEffect(() => setMenu(false), [pathname]);
  useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [userMenu]);

  const switchRole = () => {
    if (!user) return;
    const to = user.role === "admin" ? "citizen" : "admin";
    login(to);
    router.push(to === "admin" ? "/admin" : "/dashboard");
    setUserMenu(false);
    setMenu(false);
  };

  const doLogout = () => {
    logout();
    setUserMenu(false);
    setMenu(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur print:hidden">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href={user?.role === "admin" ? "/admin" : "/"} aria-label="JanAwaaz home" className="shrink-0">
          <Logo size={36} />
        </Link>

        <nav className="ml-4 hidden items-center gap-0.5 xl:flex" aria-label="Main">
          {desktopNav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition",
                isActive(pathname, n.href)
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              {n.icon}
              {lang === "hi" ? n.hi : n.en}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {user && (
            <button
              onClick={switchRole}
              className="hidden items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-bold text-brand-700 hover:bg-brand-100 md:flex"
              title={tr("Demo: switch between citizen and official view", "डेमो: नागरिक और अधिकारी दृश्य बदलें")}
            >
              <Repeat className="h-3.5 w-3.5" />
              {user.role === "admin" ? tr("Switch to Citizen", "नागरिक पर स्विच") : tr("Switch to Admin", "एडमिन पर स्विच")}
            </button>
          )}
          <button
            onClick={() => setDemoMode(!demoMode)}
            aria-pressed={demoMode}
            className={cn(
              "hidden items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition sm:flex",
              demoMode ? "bg-orange-500 text-white" : "bg-orange-50 text-orange-700 hover:bg-orange-100"
            )}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            {tr("Demo Mode", "डेमो मोड")} {demoMode ? tr("ON", "चालू") : ""}
          </button>
          <LangToggle />
          {user && <NotificationBell />}

          {user ? (
            <div className="relative hidden sm:block" ref={userRef}>
              <button
                onClick={() => setUserMenu((m) => !m)}
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 hover:bg-slate-100"
                aria-expanded={userMenu}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                  {user.name.charAt(0)}
                </span>
                <span className="hidden text-left leading-tight lg:block">
                  <span className="block text-sm font-semibold text-slate-900">{user.name}</span>
                  <span className="block text-[11px] text-slate-500">
                    {user.role === "admin" ? tr("Official", "अधिकारी") : tr("Citizen", "नागरिक")}
                  </span>
                </span>
              </button>
              {userMenu && (
                <div className="absolute right-0 top-12 w-56 animate-fadeUp overflow-hidden rounded-2xl border border-slate-200 bg-white py-1 shadow-pop">
                  {user.role === "citizen" && (
                    <Link href="/profile" onClick={() => setUserMenu(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50">
                      <UserIcon className="h-4 w-4" /> {tr("Profile", "प्रोफ़ाइल")}
                    </Link>
                  )}
                  <button onClick={switchRole} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50">
                    <Repeat className="h-4 w-4" />
                    {user.role === "admin" ? tr("Switch to Citizen", "नागरिक पर स्विच") : tr("Switch to Admin", "एडमिन पर स्विच")}
                  </button>
                  <button onClick={doLogout} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
                    <LogOut className="h-4 w-4" /> {tr("Logout", "लॉगआउट")}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 sm:flex"
            >
              <LogIn className="h-4 w-4" /> {tr("Login", "लॉगिन")}
            </Link>
          )}

          <button
            onClick={() => setMenu(true)}
            aria-label="Open menu"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 xl:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* mobile / tablet menu */}
      {menu && (
        <div className="fixed inset-0 z-[90] xl:hidden">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setMenu(false)} aria-hidden />
          <div className="absolute inset-y-0 right-0 flex w-80 max-w-[88vw] animate-slideIn flex-col bg-white shadow-pop">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <Logo size={32} />
              <button onClick={() => setMenu(false)} aria-label="Close menu" className="rounded-lg p-2 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            {user && (
              <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 font-bold text-white">
                  {user.name.charAt(0)}
                </span>
                <div>
                  <div className="text-sm font-semibold">{user.name}</div>
                  <div className="text-xs text-slate-500">
                    {user.role === "admin" ? tr("Municipal Official", "नगर अधिकारी") : tr("Citizen", "नागरिक")}
                  </div>
                </div>
              </div>
            )}
            <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Mobile">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] font-semibold",
                    isActive(pathname, n.href) ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  {n.icon}
                  {lang === "hi" ? n.hi : n.en}
                </Link>
              ))}
            </nav>
            <div className="space-y-2 border-t border-slate-100 p-3">
              <button
                onClick={() => {
                  setDemoMode(!demoMode);
                  setMenu(false);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-3 text-sm font-bold text-orange-700"
              >
                <PlayCircle className="h-4 w-4" />
                {demoMode ? tr("Turn Demo Mode off", "डेमो मोड बंद करें") : tr("Start Demo Mode", "डेमो मोड शुरू करें")}
              </button>
              {user ? (
                <>
                  <button onClick={switchRole} className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-3 py-3 text-sm font-bold text-brand-700">
                    <Repeat className="h-4 w-4" />
                    {user.role === "admin" ? tr("Switch to Citizen", "नागरिक पर स्विच") : tr("Switch to Admin", "एडमिन पर स्विच")}
                  </button>
                  <button onClick={doLogout} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold text-red-600">
                    <LogOut className="h-4 w-4" /> {tr("Logout", "लॉगआउट")}
                  </button>
                </>
              ) : (
                <Link href="/login" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-3 py-3 text-sm font-semibold text-white">
                  <LogIn className="h-4 w-4" /> {tr("Login", "लॉगिन")}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer() {
  const { tr } = useApp();
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white print:hidden">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <Logo size={32} showTagline />
        </div>
        <div className="text-sm text-slate-500 sm:text-right">
          <div className="font-semibold text-slate-700">
            {tr("Mini-project prototype by team", "मिनी-प्रोजेक्ट प्रोटोटाइप, टीम")} <span className="text-brand-700">PENTABYTE</span>
          </div>
          <div>
            {tr(
              "All complaints, locations and statistics shown are demo data.",
              "यहाँ दिखाई गई सभी शिकायतें, स्थान और आँकड़े डेमो डेटा हैं।"
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { ready, tr } = useApp();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[200] focus:rounded-lg focus:bg-white focus:px-3 focus:py-2 focus:shadow-pop"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" className="flex-1">
        {ready ? children : <PageLoader label={tr("Loading JanAwaaz…", "JanAwaaz लोड हो रहा है…")} />}
      </main>
      <Footer />
      <Toasts />
      <ConfirmDialog />
      <DemoGuide />
    </div>
  );
}
