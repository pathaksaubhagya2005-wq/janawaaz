import type { Role } from "./types";

/** The 16-step guided demo shown in the Demo Mode panel. */
export interface DemoStep {
  key: string;
  role: Role;
  en: string;
  hi: string;
  href?: string;
}

export const DEMO_STEPS: DemoStep[] = [
  { key: "login_citizen", role: "citizen", en: "Login as Citizen", hi: "नागरिक के रूप में लॉगिन करें", href: "/login" },
  { key: "report_started", role: "citizen", en: "Open Report Issue and choose Pothole", hi: "समस्या दर्ज करें खोलें और गड्ढा चुनें", href: "/report?category=pothole" },
  { key: "image", role: "citizen", en: "Upload an image", hi: "फोटो अपलोड करें", href: "/report?category=pothole" },
  { key: "location", role: "citizen", en: "Select location (Use Current Location)", hi: "स्थान चुनें (वर्तमान स्थान)", href: "/report?category=pothole" },
  { key: "ai", role: "citizen", en: "Submit and watch the AI verification", hi: "जमा करें और AI सत्यापन देखें", href: "/report?category=pothole" },
  { key: "duplicate", role: "citizen", en: "See duplicate detection (8 similar reports)", hi: "डुप्लिकेट पहचान देखें (8 समान रिपोर्ट)", href: "/report?category=pothole" },
  { key: "priority", role: "citizen", en: "See smart priority", hi: "स्मार्ट प्राथमिकता देखें", href: "/report?category=pothole" },
  { key: "routing", role: "citizen", en: "See automatic department routing", hi: "स्वचालित विभाग रूटिंग देखें", href: "/report?category=pothole" },
  { key: "track", role: "citizen", en: "Track the complaint", hi: "शिकायत ट्रैक करें", href: "/track" },
  { key: "switch_admin", role: "admin", en: "Switch to Admin", hi: "एडमिन पर स्विच करें" },
  { key: "admin_view", role: "admin", en: "See the complaint in the admin dashboard", hi: "एडमिन डैशबोर्ड में शिकायत देखें", href: "/admin/complaints" },
  { key: "in_progress", role: "admin", en: "Change status to In Progress", hi: "स्थिति 'कार्य जारी' करें", href: "/admin/complaints" },
  { key: "evidence", role: "admin", en: "Upload (simulated) resolution evidence", hi: "समाधान के सबूत अपलोड करें", href: "/admin/complaints" },
  { key: "resolved", role: "admin", en: "Mark the complaint as Resolved", hi: "शिकायत को 'समाधान हुआ' करें", href: "/admin/complaints" },
  { key: "switch_citizen", role: "citizen", en: "Switch back to Citizen", hi: "वापस नागरिक पर स्विच करें" },
  { key: "confirmed", role: "citizen", en: "Confirm the resolution", hi: "समाधान की पुष्टि करें", href: "/track" },
];
