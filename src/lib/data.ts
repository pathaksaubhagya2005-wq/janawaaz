import { demoImage } from "./art";
import type {
  CategoryKey,
  Complaint,
  ComplaintUpdate,
  DeptKey,
  Priority,
  Status,
  User,
} from "./types";

/* ------------------------------------------------------------------ */
/* Static metadata                                                      */
/* ------------------------------------------------------------------ */

export interface CategoryMeta {
  key: CategoryKey;
  emoji: string;
  en: string;
  hi: string;
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "pothole", emoji: "🛣️", en: "Pothole", hi: "गड्ढा" },
  { key: "garbage", emoji: "🗑️", en: "Garbage", hi: "कचरा" },
  { key: "streetlight", emoji: "💡", en: "Broken Streetlight", hi: "खराब स्ट्रीटलाइट" },
  { key: "water", emoji: "💧", en: "Water Leakage", hi: "पानी का रिसाव" },
  { key: "drain", emoji: "🚰", en: "Blocked Drain", hi: "जाम नाली" },
  { key: "safety", emoji: "🚨", en: "Public Safety", hi: "सार्वजनिक सुरक्षा" },
  { key: "other", emoji: "📍", en: "Other", hi: "अन्य" },
];

export const CATEGORY_MAP: Record<CategoryKey, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c])
) as Record<CategoryKey, CategoryMeta>;

/** Landing-page category tiles */
export const LANDING_CATEGORIES: Array<{
  emoji: string;
  en: string;
  hi: string;
  category: CategoryKey;
  descEn: string;
  descHi: string;
}> = [
  { emoji: "🛣️", en: "Potholes & Roads", hi: "गड्ढे और सड़कें", category: "pothole", descEn: "Potholes, cracks, broken roads", descHi: "गड्ढे, दरारें, टूटी सड़कें" },
  { emoji: "🗑️", en: "Garbage & Sanitation", hi: "कचरा और स्वच्छता", category: "garbage", descEn: "Garbage piles, overflowing bins", descHi: "कचरे के ढेर, भरे हुए डिब्बे" },
  { emoji: "💡", en: "Streetlights & Electricity", hi: "स्ट्रीटलाइट और बिजली", category: "streetlight", descEn: "Dark streets, exposed wires", descHi: "अंधेरी सड़कें, खुले तार" },
  { emoji: "💧", en: "Water & Drainage", hi: "पानी और जल-निकासी", category: "water", descEn: "Leaks, blocked drains, flooding", descHi: "रिसाव, जाम नालियाँ, जलभराव" },
  { emoji: "🚨", en: "Public Safety", hi: "सार्वजनिक सुरक्षा", category: "safety", descEn: "Open manholes, hazards", descHi: "खुले मैनहोल, खतरे" },
  { emoji: "📍", en: "Other", hi: "अन्य", category: "other", descEn: "Anything else in your area", descHi: "आपके क्षेत्र की अन्य समस्याएँ" },
];

export interface DeptMeta {
  key: DeptKey;
  en: string;
  hi: string;
  short: string;
  head: string;
  phone: string;
  categories: CategoryKey[];
}

export const DEPARTMENTS: DeptMeta[] = [
  { key: "roads", en: "Municipal Roads Department", hi: "नगर सड़क विभाग", short: "Roads", head: "Er. Rakesh Gupta", phone: "0120-000-0101", categories: ["pothole"] },
  { key: "sanitation", en: "Sanitation Department", hi: "स्वच्छता विभाग", short: "Sanitation", head: "Smt. Anita Rawat", phone: "0120-000-0102", categories: ["garbage"] },
  { key: "electricity", en: "Electricity Department", hi: "विद्युत विभाग", short: "Electricity", head: "Er. Sanjay Mishra", phone: "0120-000-0103", categories: ["streetlight"] },
  { key: "water", en: "Water Supply Department", hi: "जल आपूर्ति विभाग", short: "Water", head: "Er. Pooja Tyagi", phone: "0120-000-0104", categories: ["water"] },
  { key: "drainage", en: "Drainage Department", hi: "जल-निकासी विभाग", short: "Drainage", head: "Er. Vikram Chauhan", phone: "0120-000-0105", categories: ["drain"] },
  { key: "emergency", en: "Emergency & Municipal Department", hi: "आपातकालीन एवं नगर विभाग", short: "Emergency", head: "Shri. Deepak Malik", phone: "0120-000-0100", categories: ["safety"] },
  { key: "general", en: "General Municipal Department", hi: "सामान्य नगर विभाग", short: "General", head: "Smt. Kavita Joshi", phone: "0120-000-0199", categories: ["other"] },
];

export const DEPT_MAP: Record<DeptKey, DeptMeta> = Object.fromEntries(
  DEPARTMENTS.map((d) => [d.key, d])
) as Record<DeptKey, DeptMeta>;

export const CATEGORY_DEPT: Record<CategoryKey, DeptKey> = {
  pothole: "roads",
  garbage: "sanitation",
  streetlight: "electricity",
  water: "water",
  drain: "drainage",
  safety: "emergency",
  other: "general",
};

export const PRIORITY_META: Record<
  Priority,
  { en: string; hi: string; badge: string; dot: string; rank: number }
> = {
  critical: { en: "Critical", hi: "अति गंभीर", badge: "bg-red-50 text-red-700 ring-red-200", dot: "bg-red-600", rank: 4 },
  high: { en: "High", hi: "उच्च", badge: "bg-orange-50 text-orange-700 ring-orange-200", dot: "bg-orange-500", rank: 3 },
  medium: { en: "Medium", hi: "मध्यम", badge: "bg-amber-50 text-amber-700 ring-amber-200", dot: "bg-amber-400", rank: 2 },
  low: { en: "Low", hi: "सामान्य", badge: "bg-slate-100 text-slate-600 ring-slate-200", dot: "bg-slate-400", rank: 1 },
};

export const STATUS_META: Record<
  Status,
  { en: string; hi: string; badge: string; idx: number }
> = {
  reported: { en: "Reported", hi: "दर्ज किया गया", badge: "bg-slate-100 text-slate-700 ring-slate-200", idx: 0 },
  verified: { en: "Verified", hi: "सत्यापित", badge: "bg-sky-50 text-sky-700 ring-sky-200", idx: 1 },
  assigned: { en: "Assigned", hi: "सौंपा गया", badge: "bg-indigo-50 text-indigo-700 ring-indigo-200", idx: 2 },
  in_progress: { en: "In Progress", hi: "कार्य जारी", badge: "bg-blue-50 text-blue-700 ring-blue-200", idx: 3 },
  resolved: { en: "Resolved", hi: "समाधान हुआ", badge: "bg-emerald-50 text-emerald-700 ring-emerald-200", idx: 4 },
  reopened: { en: "Reopened", hi: "पुनः खोला गया", badge: "bg-rose-50 text-rose-700 ring-rose-200", idx: 3 },
};

export const STATUS_ORDER: Status[] = ["reported", "verified", "assigned", "in_progress", "resolved"];

/* ------------------------------------------------------------------ */
/* Demo geography (Noida sectors, approximate - clearly demo data)      */
/* ------------------------------------------------------------------ */

export interface AreaMeta {
  name: string;
  lat: number;
  lng: number;
  count: number; // demo complaint volume
}

export const AREAS: AreaMeta[] = [
  { name: "Sector 62", lat: 28.627, lng: 77.365, count: 82 },
  { name: "Sector 15", lat: 28.583, lng: 77.31, count: 67 },
  { name: "Sector 18", lat: 28.57, lng: 77.321, count: 54 },
  { name: "Sector 76", lat: 28.564, lng: 77.3885, count: 46 },
  { name: "Sector 50", lat: 28.571, lng: 77.3655, count: 39 },
  { name: "Sector 137", lat: 28.509, lng: 77.401, count: 33 },
  { name: "Sector 29", lat: 28.571, lng: 77.329, count: 27 },
  { name: "Sector 119", lat: 28.544, lng: 77.399, count: 21 },
];

export const MAP_BOUNDS = { latMin: 28.49, latMax: 28.65, lngMin: 77.29, lngMax: 77.42 };

export function nearestArea(lat: number, lng: number): AreaMeta {
  let best = AREAS[0];
  let bestD = Infinity;
  for (const a of AREAS) {
    const d = (a.lat - lat) ** 2 + (a.lng - lng) ** 2;
    if (d < bestD) {
      best = a;
      bestD = d;
    }
  }
  return best;
}

/** The spot used by "Use Current Location" in demo mode: next to the Sector 62 school pothole. */
export const DEMO_GPS = { lat: 28.62715, lng: 77.36545 };

/* ------------------------------------------------------------------ */
/* Demo users                                                           */
/* ------------------------------------------------------------------ */

export const CITIZEN_USER: User = {
  id: "u1",
  name: "Aarav Sharma",
  email: "citizen@janawaaz.demo",
  role: "citizen",
  phone: "+91 98100 00001",
  ward: "Sector 62, Noida",
};

export const ADMIN_USER: User = {
  id: "a1",
  name: "Neha Verma",
  email: "admin@janawaaz.demo",
  role: "admin",
  phone: "+91 98100 00099",
  ward: "Noida Municipal Control Room",
  designation: "Senior Municipal Officer",
};

export const DEMO_CREDENTIALS = {
  citizen: { email: "citizen@janawaaz.demo", password: "demo123" },
  admin: { email: "admin@janawaaz.demo", password: "admin123" },
};

const OTHER_CITIZENS: Record<string, string> = {
  u2: "Priya Singh",
  u3: "Rohit Verma",
  u4: "Meera Iyer",
  u5: "Imran Khan",
};

export function userName(id: string): string {
  if (id === CITIZEN_USER.id) return CITIZEN_USER.name;
  if (id === ADMIN_USER.id) return ADMIN_USER.name;
  return OTHER_CITIZENS[id] ?? "Citizen";
}

/* ------------------------------------------------------------------ */
/* Seed complaints (12+ realistic demo complaints)                      */
/* ------------------------------------------------------------------ */

const IST_OFFSET_MIN = 330;

/** ISO timestamp for `daysAgo` days before today (IST) at the given wall-clock time. */
function at(daysAgo: number, hh: number, mm: number): string {
  const nowIst = new Date(Date.now() + IST_OFFSET_MIN * 60000);
  const utc = Date.UTC(
    nowIst.getUTCFullYear(),
    nowIst.getUTCMonth(),
    nowIst.getUTCDate() - daysAgo,
    hh,
    mm
  );
  return new Date(utc - IST_OFFSET_MIN * 60000).toISOString();
}

type Stamp = [Status | "confirmed", string, string];

function mkUpdates(id: string, stamps: Stamp[]): ComplaintUpdate[] {
  return stamps.map(([status, timestamp, message], i) => ({
    id: `${id}-u${i}`,
    status,
    timestamp,
    message,
  }));
}

interface SeedInput {
  n: number;
  userId: string;
  category: CategoryKey;
  description: string;
  address: string;
  area: string;
  lat: number;
  lng: number;
  priority: Priority;
  status: Status;
  reports: number;
  conf: number;
  created: string;
  stamps: Array<[Status | "confirmed", string, string?]>;
  evidence?: { ts: string; note: string };
  confirmed?: boolean;
  followers?: string[];
}

const MSG: Record<string, string> = {
  reported: "Complaint submitted by citizen.",
  verified: "AI verified the issue and checked for duplicates.",
  assigned: "Automatically routed and assigned to the responsible department.",
  in_progress: "Field team dispatched. Work in progress.",
  resolved: "Issue marked as resolved with before/after evidence.",
  confirmed: "Citizen confirmed the resolution.",
};

function seed(s: SeedInput): Complaint {
  const id = `c${s.n}`;
  const stamps: Stamp[] = s.stamps.map(([st, ts, msg]) => [st, ts, msg ?? MSG[st]]);
  const last = stamps[stamps.length - 1][1];
  return {
    id,
    complaintNumber: `JA-2026-${String(s.n).padStart(6, "0")}`,
    userId: s.userId,
    category: s.category,
    description: s.description,
    latitude: s.lat,
    longitude: s.lng,
    address: s.address,
    area: s.area,
    priority: s.priority,
    status: s.status,
    department: CATEGORY_DEPT[s.category],
    createdAt: s.created,
    updatedAt: last,
    reportCount: s.reports,
    followers: s.followers ?? [],
    updates: mkUpdates(id, stamps),
    aiConfidence: s.conf,
    confirmed: s.confirmed,
    evidence: s.evidence
      ? {
          beforeImage: demoImage("before", s.category),
          afterImage: demoImage("after", s.category),
          latitude: s.lat + 0.00003,
          longitude: s.lng - 0.00002,
          timestamp: s.evidence.ts,
          note: s.evidence.note,
        }
      : undefined,
    imageUrl: demoImage("before", s.category),
  };
}

export function buildSeedComplaints(): Complaint[] {
  return [
    seed({
      n: 1248, userId: "u1", category: "pothole",
      description: "Large pothole near Government Inter College gate. Two-wheelers are swerving into traffic during school hours and a child almost fell yesterday.",
      address: "Near Govt. Inter College, Sector 62, Noida", area: "Sector 62",
      lat: 28.6272, lng: 77.3655, priority: "high", status: "in_progress", reports: 8, conf: 94,
      created: at(1, 10, 32),
      stamps: [
        ["reported", at(1, 10, 32)],
        ["verified", at(1, 10, 34), "AI verified: pothole detected (94% confidence). 7 similar reports merged into this case."],
        ["assigned", at(1, 10, 40)],
        ["in_progress", at(0, 9, 15), "Road repair crew dispatched with cold-mix asphalt."],
      ],
    }),
    seed({
      n: 1247, userId: "u1", category: "garbage",
      description: "Garbage pile near the vegetable market has not been cleared for a week. Strong smell and stray dogs.",
      address: "Vegetable Market, Sector 18, Noida", area: "Sector 18",
      lat: 28.5705, lng: 77.3235, priority: "medium", status: "resolved", reports: 5, conf: 96,
      created: at(4, 8, 5),
      stamps: [
        ["reported", at(4, 8, 5)],
        ["verified", at(4, 8, 7)],
        ["assigned", at(4, 8, 12)],
        ["in_progress", at(3, 7, 30), "Sanitation truck scheduled. Clearing started."],
        ["resolved", at(0, 8, 20), "Garbage cleared and area sanitised. Evidence uploaded."],
      ],
      evidence: { ts: at(0, 8, 20), note: "Area cleared, sanitised and a new bin placed." },
    }),
    seed({
      n: 1246, userId: "u1", category: "streetlight",
      description: "Streetlight not working on the main road, the whole stretch is dark after 7 PM.",
      address: "Main Road near Park, Sector 15, Noida", area: "Sector 15",
      lat: 28.5835, lng: 77.3105, priority: "medium", status: "assigned", reports: 3, conf: 92,
      created: at(2, 19, 40),
      stamps: [
        ["reported", at(2, 19, 40)],
        ["verified", at(2, 19, 42)],
        ["assigned", at(2, 19, 49)],
      ],
    }),
    seed({
      n: 1245, userId: "u2", category: "water",
      description: "Major water pipeline leakage, clean water flowing on the road for two days.",
      address: "Block C Main Road, Sector 76, Noida", area: "Sector 76",
      lat: 28.5648, lng: 77.3885, priority: "high", status: "in_progress", reports: 6, conf: 95,
      created: at(3, 6, 50),
      stamps: [
        ["reported", at(3, 6, 50)],
        ["verified", at(3, 6, 52)],
        ["assigned", at(3, 7, 1)],
        ["in_progress", at(1, 11, 10), "Valve isolated. Pipe repair underway."],
      ],
    }),
    seed({
      n: 1244, userId: "u3", category: "drain",
      description: "Blocked drain overflowing near the bus stop, sewage water on the footpath.",
      address: "Bus Stop, Sector 50, Noida", area: "Sector 50",
      lat: 28.5715, lng: 77.3655, priority: "high", status: "verified", reports: 4, conf: 91,
      created: at(0, 7, 12),
      stamps: [
        ["reported", at(0, 7, 12)],
        ["verified", at(0, 7, 14)],
      ],
    }),
    seed({
      n: 1243, userId: "u4", category: "safety",
      description: "Open manhole on a busy road near the metro station. Vehicles are at risk, especially at night.",
      address: "Metro Station Road, Sector 137, Noida", area: "Sector 137",
      lat: 28.5095, lng: 77.4015, priority: "critical", status: "assigned", reports: 11, conf: 97,
      created: at(0, 6, 3),
      stamps: [
        ["reported", at(0, 6, 3)],
        ["verified", at(0, 6, 4), "AI verified: open manhole detected. Escalated as CRITICAL."],
        ["assigned", at(0, 6, 6), "Routed to Emergency & Municipal Department with priority alert."],
      ],
    }),
    seed({
      n: 1242, userId: "u2", category: "water",
      description: "Road flooding after rain near the underpass, vehicles are getting stuck.",
      address: "Underpass, Sector 18, Noida", area: "Sector 18",
      lat: 28.569, lng: 77.319, priority: "high", status: "reported", reports: 2, conf: 89,
      created: at(0, 5, 30),
      stamps: [["reported", at(0, 5, 30)]],
    }),
    seed({
      n: 1241, userId: "u1", category: "pothole",
      description: "Medium-sized pothole on the service road next to the petrol pump.",
      address: "Service Road near HP Petrol Pump, Sector 15, Noida", area: "Sector 15",
      lat: 28.5815, lng: 77.3118, priority: "medium", status: "resolved", reports: 2, conf: 93,
      created: at(9, 9, 15), confirmed: true,
      stamps: [
        ["reported", at(9, 9, 15)],
        ["verified", at(9, 9, 17)],
        ["assigned", at(9, 9, 25)],
        ["in_progress", at(7, 10, 0)],
        ["resolved", at(6, 15, 30), "Pothole filled and levelled."],
        ["confirmed", at(5, 18, 5), "Citizen confirmed the resolution."],
      ],
      evidence: { ts: at(6, 15, 30), note: "Patch work completed with hot-mix asphalt." },
    }),
    seed({
      n: 1240, userId: "u5", category: "garbage",
      description: "Overflowing community bin outside the apartment society gate.",
      address: "Society Gate 2, Sector 29, Noida", area: "Sector 29",
      lat: 28.5712, lng: 77.3295, priority: "medium", status: "in_progress", reports: 3, conf: 90,
      created: at(2, 9, 0),
      stamps: [
        ["reported", at(2, 9, 0)],
        ["verified", at(2, 9, 2)],
        ["assigned", at(2, 9, 11)],
        ["in_progress", at(0, 7, 45)],
      ],
    }),
    seed({
      n: 1239, userId: "u3", category: "streetlight",
      description: "Exposed live wire hanging from an electric pole near the school bus stop. Dangerous!",
      address: "School Bus Stop, Sector 62, Noida", area: "Sector 62",
      lat: 28.624, lng: 77.369, priority: "critical", status: "in_progress", reports: 9, conf: 96,
      created: at(1, 16, 20),
      stamps: [
        ["reported", at(1, 16, 20)],
        ["verified", at(1, 16, 21), "AI verified: dangerous electrical hazard. Escalated as CRITICAL."],
        ["assigned", at(1, 16, 24)],
        ["in_progress", at(1, 17, 5), "Power isolated. Electricians at site."],
      ],
    }),
    seed({
      n: 1238, userId: "u4", category: "other",
      description: "Broken footpath tiles near the park, elderly people find it difficult to walk.",
      address: "Park Walkway, Sector 119, Noida", area: "Sector 119",
      lat: 28.5442, lng: 77.3992, priority: "low", status: "reported", reports: 1, conf: 84,
      created: at(0, 8, 40),
      stamps: [["reported", at(0, 8, 40)]],
    }),
    seed({
      n: 1237, userId: "u5", category: "pothole",
      description: "Deep pothole cluster on the road outside the school turning. Vehicles slow down suddenly and it floods when it rains.",
      address: "School Road, Sector 62, Noida", area: "Sector 62",
      lat: 28.6279, lng: 77.365, priority: "high", status: "verified", reports: 8, conf: 94,
      created: at(1, 12, 10),
      stamps: [
        ["reported", at(1, 12, 10)],
        ["verified", at(1, 12, 12)],
      ],
    }),
    seed({
      n: 1236, userId: "u2", category: "garbage",
      description: "Illegal dumping of construction waste beside the drain.",
      address: "Drain Side Road, Sector 76, Noida", area: "Sector 76",
      lat: 28.566, lng: 77.386, priority: "medium", status: "resolved", reports: 2, conf: 91,
      created: at(5, 14, 0), confirmed: true,
      stamps: [
        ["reported", at(5, 14, 0)],
        ["verified", at(5, 14, 3)],
        ["assigned", at(5, 14, 10)],
        ["in_progress", at(3, 9, 0)],
        ["resolved", at(0, 7, 45), "Waste removed with JCB and tipper."],
        ["confirmed", at(0, 9, 30)],
      ],
      evidence: { ts: at(0, 7, 45), note: "Dumped waste lifted and site cleaned." },
    }),
  ];
}

export const SEED_COUNT = 13;

/* ------------------------------------------------------------------ */
/* Demo analytics (platform-wide numbers, clearly demo data)            */
/* ------------------------------------------------------------------ */

export const LANDING_STATS = {
  reported: 1248,
  resolved: 936,
  rate: 89,
  hotspots: 14,
  uniqueCases: 1052, // 1,248 reports merged into 1,052 unique cases -> 936 / 1,052 = 89%
};

export const ANALYTICS = {
  byCategory: [
    { key: "pothole" as CategoryKey, value: 342 },
    { key: "garbage" as CategoryKey, value: 298 },
    { key: "streetlight" as CategoryKey, value: 187 },
    { key: "water" as CategoryKey, value: 156 },
    { key: "drain" as CategoryKey, value: 121 },
    { key: "safety" as CategoryKey, value: 74 },
    { key: "other" as CategoryKey, value: 70 },
  ],
  months: ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
  reportedByMonth: [78, 84, 90, 96, 99, 104, 108, 111, 115, 118, 121, 124],
  resolvedByMonth: [58, 63, 68, 73, 76, 78, 80, 82, 84, 86, 88, 100],
  avgDaysByMonth: [5.8, 5.5, 5.3, 5.0, 4.7, 4.4, 4.1, 3.9, 3.6, 3.4, 3.2, 3.0],
  departments: [
    { key: "roads" as DeptKey, total: 342, resolved: 251, avgDays: 3.4, rating: 4.2 },
    { key: "sanitation" as DeptKey, total: 298, resolved: 236, avgDays: 2.2, rating: 4.5 },
    { key: "electricity" as DeptKey, total: 187, resolved: 156, avgDays: 2.8, rating: 4.3 },
    { key: "water" as DeptKey, total: 156, resolved: 112, avgDays: 3.9, rating: 3.9 },
    { key: "drainage" as DeptKey, total: 121, resolved: 78, avgDays: 4.6, rating: 3.6 },
    { key: "emergency" as DeptKey, total: 74, resolved: 62, avgDays: 1.1, rating: 4.7 },
    { key: "general" as DeptKey, total: 70, resolved: 41, avgDays: 5.2, rating: 3.4 },
  ],
};
