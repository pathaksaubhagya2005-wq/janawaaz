"use client";

import { CheckCheck } from "lucide-react";
import { NotificationIcon, useMyNotifications, useOpenNotification } from "@/components/AppShell";
import { Button, Card, Container, EmptyState, PageHeader, PageLoader } from "@/components/ui";
import { notifMessage, notifTitle } from "@/lib/notif";
import { useApp } from "@/lib/store";
import { cn, timeAgo } from "@/lib/utils";
import { useRequireRole } from "@/lib/guard";

export default function NotificationsPage() {
  const allowed = useRequireRole("citizen");
  const { tr, lang, markAllRead } = useApp();
  const items = useMyNotifications();
  const open = useOpenNotification();
  const hi = lang === "hi";
  if (!allowed) return <PageLoader />;
  const unread = items.filter((n) => !n.read).length;
  return (
    <Container className="max-w-3xl py-8">
      <PageHeader
        title={tr("Notifications", "सूचनाएँ")}
        subtitle={unread ? tr(`${unread} unread`, `${unread} अपठित`) : tr("You are all caught up", "सब देख लिया गया है")}
        actions={unread > 0 ? <Button variant="secondary" size="sm" onClick={markAllRead}><CheckCheck className="h-4 w-4" />{tr("Mark all read", "सभी पढ़ा हुआ करें")}</Button> : undefined}
      />
      {items.length === 0 ? (
        <EmptyState title={tr("No notifications yet", "अभी कोई सूचना नहीं")} description={tr("Updates about your complaints will appear here.", "आपकी शिकायतों के अपडेट यहाँ दिखेंगे।")} />
      ) : (
        <Card className="divide-y divide-slate-100 overflow-hidden">
          {items.map((n) => (
            <button key={n.id} onClick={() => open(n)} className={cn("flex w-full items-start gap-3 px-4 py-4 text-left hover:bg-slate-50", !n.read && "bg-brand-50/50")}>
              <NotificationIcon type={n.type} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900">{notifTitle(n, hi)}</span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(n.timestamp, hi)}</span>
                </span>
                <span className="mt-0.5 block text-sm text-slate-600">{notifMessage(n, hi)}</span>
              </span>
              {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" aria-label="unread" />}
            </button>
          ))}
        </Card>
      )}
    </Container>
  );
}
