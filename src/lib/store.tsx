"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ADMIN_USER,
  CITIZEN_USER,
  DEMO_CREDENTIALS,
  DEPT_MAP,
  buildSeedComplaints,
  nearestArea,
} from "./data";
import type {
  AppNotification,
  Complaint,
  DeptKey,
  NewComplaintInput,
  NotificationType,
  ResolutionEvidence,
  Role,
  Status,
  Toast,
  ToastKind,
  User,
} from "./types";
import { uid } from "./utils";

export type Lang = "en" | "hi";

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "primary" | "danger" | "success";
  onConfirm: () => void;
}

interface Persisted {
  v: number;
  lang: Lang;
  user: User | null;
  complaints: Complaint[];
  notifications: AppNotification[];
  demoMode: boolean;
  demoProgress: string[];
}

interface AppContextValue {
  ready: boolean;
  lang: Lang;
  tr: (en: string, hi: string) => string;
  setLang: (l: Lang) => void;

  user: User | null;
  login: (role: Role) => void;
  loginWithCredentials: (email: string, password: string) => Role | null;
  logout: () => void;

  complaints: Complaint[];
  addComplaint: (input: NewComplaintInput) => Complaint;
  supportComplaint: (id: string) => Complaint | undefined;
  updateStatus: (id: string, status: Status, message?: string) => void;
  assignDepartment: (id: string, dept: DeptKey) => void;
  resolveComplaint: (id: string, evidence: ResolutionEvidence) => void;
  confirmResolution: (id: string) => void;
  reopenComplaint: (id: string, reason: string) => void;

  notifications: AppNotification[];
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;

  toasts: Toast[];
  toast: (kind: ToastKind, title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  confirmState: ConfirmOptions | null;
  askConfirm: (o: ConfirmOptions) => void;
  closeConfirm: () => void;

  demoMode: boolean;
  setDemoMode: (v: boolean) => void;
  demoProgress: string[];
  mark: (step: string) => void;
  resetDemo: () => void;
}

const STORAGE_KEY = "janawaaz-state-v3";
const AppContext = createContext<AppContextValue | null>(null);

function buildSeedNotifications(complaints: Complaint[]): AppNotification[] {
  const find = (n: number) => complaints.find((c) => c.complaintNumber.endsWith(String(n)));
  const mk = (
    type: NotificationType,
    audience: Role,
    num: number,
    ts: string,
    read: boolean,
    extra?: string
  ): AppNotification => {
    const c = find(num);
    return {
      id: uid("n"),
      type,
      audience,
      userId: audience === "citizen" ? "u1" : undefined,
      complaintNumber: c?.complaintNumber,
      complaintId: c?.id,
      timestamp: ts,
      read,
      extra,
    };
  };
  const t = (c: number, key: Status | "confirmed") =>
    find(c)?.updates.find((u) => u.status === key)?.timestamp ?? new Date().toISOString();

  return [
    mk("resolved", "citizen", 1247, t(1247, "resolved"), false),
    mk("started", "citizen", 1248, t(1248, "in_progress"), false),
    mk("assigned", "citizen", 1246, t(1246, "assigned"), true, DEPT_MAP.electricity.en),
    mk("verified", "citizen", 1248, t(1248, "verified"), true),
    mk("new_report", "admin", 1243, t(1243, "reported"), false, "Public Safety · Critical"),
    mk("new_report", "admin", 1244, t(1244, "reported"), false, "Blocked Drain · High"),
    mk("new_report", "admin", 1238, t(1238, "reported"), true, "Other · Low"),
  ].sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp));
}

const DEFAULT_MSG = (status: Status, c: Complaint): string => {
  switch (status) {
    case "verified":
      return "AI verified the issue and checked for duplicates.";
    case "assigned":
      return `Routed and assigned to ${DEPT_MAP[c.department].en}.`;
    case "in_progress":
      return "Field team dispatched. Work in progress.";
    case "resolved":
      return "Issue marked as resolved.";
    case "reopened":
      return "Complaint reopened.";
    default:
      return "Status updated.";
  }
};

const STATUS_NOTIF: Partial<Record<Status, NotificationType>> = {
  verified: "verified",
  assigned: "assigned",
  in_progress: "started",
  resolved: "resolved",
  reopened: "reopened",
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lang, setLangState] = useState<Lang>("en");
  const [user, setUser] = useState<User | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [demoMode, setDemoModeState] = useState(false);
  const [demoProgress, setDemoProgress] = useState<string[]>([]);

  const complaintsRef = useRef<Complaint[]>([]);
  const userRef = useRef<User | null>(null);
  const progressRef = useRef<string[]>([]);
  const scheduled = useRef<Set<string>>(new Set());
  complaintsRef.current = complaints;
  userRef.current = user;
  progressRef.current = demoProgress;

  /* ---------------- toasts ---------------- */
  const dismissToast = useCallback((id: string) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const toast = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = uid("t");
      setToasts((t) => [...t.slice(-3), { id, kind, title, message }]);
      setTimeout(() => dismissToast(id), 5200);
    },
    [dismissToast]
  );

  /* ---------------- demo progress ---------------- */
  const mark = useCallback((step: string) => {
    setDemoProgress((p) => (p.includes(step) ? p : [...p, step]));
  }, []);

  /* ---------------- notifications ---------------- */
  const pushNotification = useCallback(
    (n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
      setNotifications((prev) => [
        { ...n, id: uid("n"), timestamp: new Date().toISOString(), read: false },
        ...prev,
      ]);
    },
    []
  );

  const notifyCitizens = useCallback(
    (c: Complaint, type: NotificationType, extra?: string) => {
      const recipients = Array.from(new Set([c.userId, ...c.followers]));
      recipients.forEach((uidv) =>
        pushNotification({
          type,
          audience: "citizen",
          userId: uidv,
          complaintNumber: c.complaintNumber,
          complaintId: c.id,
          extra,
        })
      );
    },
    [pushNotification]
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllRead = useCallback(() => {
    const role = userRef.current?.role;
    const uidv = userRef.current?.id;
    setNotifications((p) =>
      p.map((n) =>
        n.audience === role && (role === "admin" || n.userId === uidv) ? { ...n, read: true } : n
      )
    );
  }, []);

  /* ---------------- complaint mutations ---------------- */
  const patch = useCallback((id: string, fn: (c: Complaint) => Complaint) => {
    setComplaints((prev) => prev.map((c) => (c.id === id ? fn(c) : c)));
  }, []);

  const toastForCitizen = useCallback(
    (c: Complaint, type: NotificationType) => {
      const u = userRef.current;
      if (!u || u.role !== "citizen") return;
      if (c.userId !== u.id && !c.followers.includes(u.id)) return;
      const map: Partial<Record<NotificationType, [ToastKind, string, string]>> = {
        verified: ["info", "Complaint verified", `AI verified ${c.complaintNumber}`],
        assigned: ["info", "Complaint assigned", `${c.complaintNumber} routed to ${DEPT_MAP[c.department].en}`],
        started: ["info", "Work started", `A team started work on ${c.complaintNumber}`],
        resolved: ["success", "Complaint resolved", `Please confirm the fix for ${c.complaintNumber}`],
      };
      const m = map[type];
      if (m) toast(m[0], m[1], m[2]);
    },
    [toast]
  );

  const updateStatus = useCallback(
    (id: string, status: Status, message?: string) => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      const msg = message ?? DEFAULT_MSG(status, existing);
      patch(id, (c) => ({
        ...c,
        status,
        updatedAt: now,
        updates: [...c.updates, { id: uid("up"), status, message: msg, timestamp: now }],
      }));
      const type = STATUS_NOTIF[status];
      if (type) {
        notifyCitizens(
          existing,
          type,
          type === "assigned" ? DEPT_MAP[existing.department].en : undefined
        );
        toastForCitizen(existing, type);
      }
      if (status === "in_progress") mark("in_progress");
    },
    [patch, notifyCitizens, toastForCitizen, mark]
  );

  const scheduleAuto = useCallback(
    (id: string) => {
      if (scheduled.current.has(id)) return;
      scheduled.current.add(id);
      const step = (from: Status, to: Status, delay: number, msg?: string) =>
        setTimeout(() => {
          const c = complaintsRef.current.find((x) => x.id === id);
          if (!c || c.status !== from) return;
          updateStatus(id, to, msg);
          if (to === "assigned") patch(id, (x) => ({ ...x, autoAdvance: false }));
        }, delay);
      step(
        "reported",
        "verified",
        2200,
        "AI verified the issue and finished the duplicate check."
      );
      step("verified", "assigned", 4600);
    },
    [updateStatus, patch]
  );

  const addComplaint = useCallback(
    (input: NewComplaintInput): Complaint => {
      const prev = complaintsRef.current;
      const maxN = prev.reduce(
        (m, c) => Math.max(m, parseInt(c.complaintNumber.split("-")[2] ?? "0", 10)),
        1248
      );
      const n = maxN + 1;
      const now = new Date().toISOString();
      const id = `c${n}`;
      const c: Complaint = {
        id,
        complaintNumber: `JA-2026-${String(n).padStart(6, "0")}`,
        userId: userRef.current?.id ?? CITIZEN_USER.id,
        category: input.category,
        description: input.description,
        imageUrl: input.imageUrl,
        latitude: input.latitude,
        longitude: input.longitude,
        address: input.address,
        area: nearestArea(input.latitude, input.longitude).name,
        priority: input.priority,
        status: "reported",
        department: input.department,
        createdAt: now,
        updatedAt: now,
        reportCount: 1,
        followers: [],
        updates: [
          { id: uid("up"), status: "reported", message: "Complaint submitted by citizen.", timestamp: now },
        ],
        aiConfidence: input.aiConfidence,
        autoAdvance: true,
      };
      setComplaints((p) => [c, ...p]);
      complaintsRef.current = [c, ...prev];
      pushNotification({
        type: "submitted",
        audience: "citizen",
        userId: c.userId,
        complaintNumber: c.complaintNumber,
        complaintId: c.id,
      });
      pushNotification({
        type: "new_report",
        audience: "admin",
        complaintNumber: c.complaintNumber,
        complaintId: c.id,
        extra: `${c.category} · ${c.priority}`,
      });
      toast("success", "Complaint submitted", `Your complaint ${c.complaintNumber} has been registered.`);
      scheduleAuto(c.id);
      return c;
    },
    [pushNotification, toast, scheduleAuto]
  );

  const supportComplaint = useCallback(
    (id: string): Complaint | undefined => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      const u = userRef.current;
      if (!existing || !u) return undefined;
      if (existing.userId === u.id || existing.followers.includes(u.id)) return existing;
      const now = new Date().toISOString();
      const count = existing.reportCount + 1;
      patch(id, (c) => ({
        ...c,
        reportCount: count,
        followers: [...c.followers, u.id],
        updatedAt: now,
        updates: [
          ...c.updates,
          {
            id: uid("up"),
            status: c.status,
            message: `Another citizen confirmed this issue. ${count} citizens have now reported this case.`,
            timestamp: now,
          },
        ],
      }));
      pushNotification({
        type: "submitted",
        audience: "citizen",
        userId: u.id,
        complaintNumber: existing.complaintNumber,
        complaintId: existing.id,
      });
      toast(
        "success",
        "Added to existing case",
        `${count} citizens are now linked to ${existing.complaintNumber}.`
      );
      return { ...existing, reportCount: count, followers: [...existing.followers, u.id] };
    },
    [patch, pushNotification, toast]
  );

  const assignDepartment = useCallback(
    (id: string, dept: DeptKey) => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      if (!existing || existing.department === dept) return;
      const now = new Date().toISOString();
      patch(id, (c) => ({
        ...c,
        department: dept,
        updatedAt: now,
        updates: [
          ...c.updates,
          {
            id: uid("up"),
            status: c.status,
            message: `Re-assigned to ${DEPT_MAP[dept].en} by officer.`,
            timestamp: now,
          },
        ],
      }));
      notifyCitizens({ ...existing, department: dept }, "assigned", DEPT_MAP[dept].en);
      toast("success", "Department updated", `${existing.complaintNumber} → ${DEPT_MAP[dept].en}`);
    },
    [patch, notifyCitizens, toast]
  );

  const resolveComplaint = useCallback(
    (id: string, evidence: ResolutionEvidence) => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      patch(id, (c) => ({
        ...c,
        status: "resolved",
        evidence,
        confirmed: false,
        updatedAt: now,
        updates: [
          ...c.updates,
          {
            id: uid("up"),
            status: "resolved",
            message: "Issue marked as resolved with before/after evidence and GPS stamp.",
            timestamp: now,
          },
        ],
      }));
      notifyCitizens(existing, "resolved");
      toastForCitizen(existing, "resolved");
      toast("success", "Marked as resolved", `${existing.complaintNumber} sent to the citizen for confirmation.`);
      mark("evidence");
      mark("resolved");
    },
    [patch, notifyCitizens, toastForCitizen, toast, mark]
  );

  const confirmResolution = useCallback(
    (id: string) => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      patch(id, (c) => ({
        ...c,
        confirmed: true,
        updatedAt: now,
        updates: [
          ...c.updates,
          { id: uid("up"), status: "confirmed", message: "Citizen confirmed the resolution. Case closed.", timestamp: now },
        ],
      }));
      pushNotification({
        type: "confirmed",
        audience: "admin",
        complaintNumber: existing.complaintNumber,
        complaintId: existing.id,
      });
      toast("success", "Thank you!", "You confirmed the resolution. The case is now closed.");
      mark("confirmed");
    },
    [patch, pushNotification, toast, mark]
  );

  const reopenComplaint = useCallback(
    (id: string, reason: string) => {
      const existing = complaintsRef.current.find((c) => c.id === id);
      if (!existing) return;
      const now = new Date().toISOString();
      patch(id, (c) => ({
        ...c,
        status: "reopened",
        confirmed: false,
        updatedAt: now,
        updates: [
          ...c.updates,
          {
            id: uid("up"),
            status: "reopened",
            message: `Citizen reopened the complaint: ${reason || "issue not resolved"}`,
            timestamp: now,
          },
        ],
      }));
      pushNotification({
        type: "reopened",
        audience: "admin",
        complaintNumber: existing.complaintNumber,
        complaintId: existing.id,
        extra: reason,
      });
      pushNotification({
        type: "reopened",
        audience: "citizen",
        userId: existing.userId,
        complaintNumber: existing.complaintNumber,
        complaintId: existing.id,
      });
      toast("warning", "Complaint reopened", "The department has been notified and must act again.");
    },
    [patch, pushNotification, toast]
  );

  /* ---------------- auth ---------------- */
  const login = useCallback(
    (role: Role) => {
      setUser(role === "admin" ? ADMIN_USER : CITIZEN_USER);
      if (role === "admin") mark("switch_admin");
      else if (progressRef.current.includes("switch_admin")) mark("switch_citizen");
      else mark("login_citizen");
    },
    [mark]
  );

  const loginWithCredentials = useCallback(
    (email: string, password: string): Role | null => {
      const e = email.trim().toLowerCase();
      if (e === DEMO_CREDENTIALS.citizen.email && password === DEMO_CREDENTIALS.citizen.password) {
        login("citizen");
        return "citizen";
      }
      if (e === DEMO_CREDENTIALS.admin.email && password === DEMO_CREDENTIALS.admin.password) {
        login("admin");
        return "admin";
      }
      return null;
    },
    [login]
  );

  const logout = useCallback(() => setUser(null), []);

  /* ---------------- language & demo mode ---------------- */
  const setLang = useCallback((l: Lang) => setLangState(l), []);
  const setDemoMode = useCallback((v: boolean) => setDemoModeState(v), []);

  const resetDemo = useCallback(() => {
    const seeds = buildSeedComplaints();
    scheduled.current.clear();
    setComplaints(seeds);
    setNotifications(buildSeedNotifications(seeds));
    setDemoProgress([]);
    toast("info", "Demo data reset", "All demo complaints were restored.");
  }, [toast]);

  const askConfirm = useCallback((o: ConfirmOptions) => setConfirmState(o), []);
  const closeConfirm = useCallback(() => setConfirmState(null), []);

  /* ---------------- hydrate + persist ---------------- */
  useEffect(() => {
    let loaded: Persisted | null = null;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Persisted;
        if (parsed && parsed.v === 3 && Array.isArray(parsed.complaints)) loaded = parsed;
      }
    } catch {
      loaded = null;
    }
    if (loaded) {
      setLangState(loaded.lang);
      setUser(loaded.user);
      setComplaints(loaded.complaints);
      setNotifications(loaded.notifications);
      setDemoModeState(loaded.demoMode);
      setDemoProgress(loaded.demoProgress);
      complaintsRef.current = loaded.complaints;
      loaded.complaints
        .filter((c) => c.autoAdvance && c.status !== "assigned")
        .forEach((c) => scheduleAuto(c.id));
    } else {
      const seeds = buildSeedComplaints();
      setComplaints(seeds);
      setNotifications(buildSeedNotifications(seeds));
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    const data: Persisted = { v: 3, lang, user, complaints, notifications, demoMode, demoProgress };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // storage full or unavailable: the prototype keeps working in memory
    }
  }, [ready, lang, user, complaints, notifications, demoMode, demoProgress]);

  useEffect(() => {
    if (typeof document !== "undefined") document.documentElement.lang = lang === "hi" ? "hi" : "en";
  }, [lang]);

  const tr = useCallback((en: string, hi: string) => (lang === "hi" ? hi : en), [lang]);

  const value = useMemo<AppContextValue>(
    () => ({
      ready,
      lang,
      tr,
      setLang,
      user,
      login,
      loginWithCredentials,
      logout,
      complaints,
      addComplaint,
      supportComplaint,
      updateStatus,
      assignDepartment,
      resolveComplaint,
      confirmResolution,
      reopenComplaint,
      notifications,
      markNotificationRead,
      markAllRead,
      toasts,
      toast,
      dismissToast,
      confirmState,
      askConfirm,
      closeConfirm,
      demoMode,
      setDemoMode,
      demoProgress,
      mark,
      resetDemo,
    }),
    [
      ready, lang, tr, setLang, user, login, loginWithCredentials, logout, complaints,
      addComplaint, supportComplaint, updateStatus, assignDepartment, resolveComplaint,
      confirmResolution, reopenComplaint, notifications, markNotificationRead, markAllRead,
      toasts, toast, dismissToast, confirmState, askConfirm, closeConfirm, demoMode,
      setDemoMode, demoProgress, mark, resetDemo,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
