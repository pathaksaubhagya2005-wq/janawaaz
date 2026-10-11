import type { AppNotification, NotificationType } from "./types";

export const NOTIF_META: Record<
  NotificationType,
  { en: string; hi: string; tone: "blue" | "green" | "orange" | "red" | "indigo" }
> = {
  submitted: { en: "Complaint submitted", hi: "शिकायत दर्ज हुई", tone: "blue" },
  verified: { en: "Complaint verified", hi: "शिकायत सत्यापित हुई", tone: "indigo" },
  assigned: { en: "Complaint assigned", hi: "शिकायत विभाग को सौंपी गई", tone: "indigo" },
  started: { en: "Work started", hi: "कार्य शुरू हुआ", tone: "orange" },
  resolved: { en: "Complaint resolved", hi: "शिकायत का समाधान हुआ", tone: "green" },
  reopened: { en: "Complaint reopened", hi: "शिकायत दोबारा खोली गई", tone: "red" },
  confirmed: { en: "Resolution confirmed", hi: "समाधान की पुष्टि हुई", tone: "green" },
  new_report: { en: "New complaint received", hi: "नई शिकायत प्राप्त हुई", tone: "blue" },
};

export function notifTitle(n: AppNotification, hi: boolean): string {
  const m = NOTIF_META[n.type];
  return hi ? m.hi : m.en;
}

export function notifMessage(n: AppNotification, hi: boolean): string {
  const id = n.complaintNumber ?? "";
  switch (n.type) {
    case "submitted":
      return hi
        ? `आपकी शिकायत ${id} सफलतापूर्वक दर्ज हो गई है।`
        : `Your complaint ${id} has been submitted successfully.`;
    case "verified":
      return hi
        ? `AI ने ${id} को सत्यापित कर दिया है और डुप्लिकेट की जाँच पूरी हो गई है।`
        : `AI verified ${id} and finished the duplicate check.`;
    case "assigned":
      return hi
        ? `${id} स्वतः ${n.extra ?? "संबंधित विभाग"} को सौंपी गई।`
        : `${id} was automatically assigned to ${n.extra ?? "the responsible department"}.`;
    case "started":
      return hi
        ? `${id} पर कार्य शुरू हो गया है। टीम मौके पर है।`
        : `Work has started on ${id}. A team is on site.`;
    case "resolved":
      return hi
        ? `${id} का समाधान हो गया है। कृपया पुष्टि करें कि समस्या ठीक हुई या नहीं।`
        : `${id} was marked resolved. Please confirm whether the issue is actually fixed.`;
    case "reopened":
      return hi
        ? `${id} दोबारा खोली गई${n.extra ? `: ${n.extra}` : ""}।`
        : `${id} was reopened${n.extra ? `: ${n.extra}` : ""}.`;
    case "confirmed":
      return hi
        ? `नागरिक ने ${id} के समाधान की पुष्टि की। मामला बंद।`
        : `The citizen confirmed the fix for ${id}. Case closed.`;
    case "new_report":
      return hi
        ? `${id} प्राप्त हुई${n.extra ? ` (${n.extra})` : ""}।`
        : `${id} received${n.extra ? ` (${n.extra})` : ""}.`;
  }
}
