import { CATEGORY_DEPT, CATEGORY_MAP, nearestArea } from "./data";
import type { Analysis, CategoryKey, Complaint, Priority } from "./types";
import { hashStr, haversine } from "./utils";

/**
 * Simulated "AI" for the prototype. It is deterministic rule-based logic, so the demo
 * works offline. In production the same function signature can call a vision/NLP service.
 */

export const DUPLICATE_RADIUS_M = 150;

const KEYWORDS: Array<{ cat: CategoryKey; re: RegExp }> = [
  { cat: "safety", re: /manhole|live wire|exposed wire|sinkhole|collapse|accident|fire|unsafe|hazard/i },
  { cat: "pothole", re: /pothole|crater|road (is )?(broken|damaged)|\bgaddha\b|गड्ढ/i },
  { cat: "garbage", re: /garbage|trash|waste|dump|litter|kachra|कचरा/i },
  { cat: "streetlight", re: /street ?light|lamp|light (is )?(not|off)|dark|bijli|बिजली|स्ट्रीटलाइट/i },
  { cat: "drain", re: /drain|sewer|sewage|gutter|naali|नाली/i },
  { cat: "water", re: /leak|pipeline|water|flood|pani|पानी/i },
];

export interface PriorityRule {
  priority: Priority;
  en: string;
  hi: string;
}

/** Displayed on the "Smart Priority" card and in the README. */
export const PRIORITY_RULES: PriorityRule[] = [
  { priority: "critical", en: "Public safety risk · Open manhole · Major road blockage · Dangerous electrical issue", hi: "सार्वजनिक सुरक्षा का खतरा · खुला मैनहोल · मुख्य सड़क अवरुद्ध · खतरनाक बिजली समस्या" },
  { priority: "high", en: "Large pothole · Major water leakage · Road flooding", hi: "बड़ा गड्ढा · बड़ा जल रिसाव · सड़क पर जलभराव" },
  { priority: "medium", en: "Garbage accumulation · Broken streetlight", hi: "कचरे का जमाव · खराब स्ट्रीटलाइट" },
  { priority: "low", en: "Minor civic inconvenience", hi: "छोटी नागरिक असुविधा" },
];

const CRITICAL_RE =
  /manhole|live wire|exposed wire|sparking|short circuit|electric shock|sinkhole|collapse|road (is )?(completely )?block|accident|gas leak/i;
const MINOR_RE = /\b(minor|small|tiny|cosmetic|slight)\b/i;

function detectCategory(selected: CategoryKey, description: string): CategoryKey {
  if (selected !== "other") return selected;
  for (const k of KEYWORDS) if (k.re.test(description)) return k.cat;
  return "other";
}

function scorePriority(cat: CategoryKey, desc: string): { priority: Priority; en: string; hi: string } {
  if (cat === "safety" || CRITICAL_RE.test(desc)) {
    return {
      priority: "critical",
      en: "Public safety risk detected → escalated to Critical",
      hi: "सार्वजनिक सुरक्षा का खतरा मिला → अति गंभीर श्रेणी में भेजा गया",
    };
  }
  switch (cat) {
    case "pothole":
      if (MINOR_RE.test(desc))
        return { priority: "medium", en: "Small pothole → Medium", hi: "छोटा गड्ढा → मध्यम" };
      return {
        priority: "high",
        en: /school|college|children|child/i.test(desc)
          ? "Large pothole near a school → High"
          : "Large pothole on a public road → High",
        hi: /school|college|children|child|स्कूल/i.test(desc)
          ? "स्कूल के पास बड़ा गड्ढा → उच्च"
          : "सार्वजनिक सड़क पर बड़ा गड्ढा → उच्च",
      };
    case "water":
      if (/major|burst|heavy|main|pipeline|flood|overflow|road/i.test(desc) && !MINOR_RE.test(desc))
        return { priority: "high", en: "Major water leakage / road flooding → High", hi: "बड़ा जल रिसाव / जलभराव → उच्च" };
      return { priority: "medium", en: "Water leakage → Medium", hi: "जल रिसाव → मध्यम" };
    case "drain":
      if (/overflow|flood|sewage|stagnant|road/i.test(desc))
        return { priority: "high", en: "Overflowing drain / flooding risk → High", hi: "उफनती नाली / जलभराव का खतरा → उच्च" };
      return { priority: "medium", en: "Blocked drain → Medium", hi: "जाम नाली → मध्यम" };
    case "garbage":
      if (MINOR_RE.test(desc))
        return { priority: "low", en: "Minor garbage issue → Low", hi: "छोटी कचरा समस्या → सामान्य" };
      return { priority: "medium", en: "Garbage accumulation → Medium", hi: "कचरे का जमाव → मध्यम" };
    case "streetlight":
      return { priority: "medium", en: "Broken streetlight → Medium", hi: "खराब स्ट्रीटलाइट → मध्यम" };
    default:
      return { priority: "low", en: "Minor civic inconvenience → Low", hi: "छोटी नागरिक असुविधा → सामान्य" };
  }
}

export function analyzeComplaint(input: {
  category: CategoryKey;
  description: string;
  latitude: number;
  longitude: number;
  hasImage: boolean;
  existing: Complaint[];
  userId?: string; // the reporter: their own complaints are not treated as duplicates
}): Analysis {
  const detected = detectCategory(input.category, input.description);
  const { priority, en, hi } = scorePriority(detected, input.description);

  const seed = hashStr(`${detected}|${input.description}`) % 7; // 0..6
  const confidence = Math.min(98, 90 + seed + (input.hasImage ? 1 : 0));

  // Duplicate detection: open issue, same category, within 150 m.
  let duplicate: Analysis["duplicate"];
  for (const c of input.existing) {
    if (c.category !== detected) continue;
    if (c.status === "resolved") continue;
    if (input.userId && (c.userId === input.userId || c.followers.includes(input.userId))) continue;
    const d = haversine(input.latitude, input.longitude, c.latitude, c.longitude);
    if (d <= DUPLICATE_RADIUS_M && (!duplicate || d < duplicate.distance)) {
      duplicate = { complaint: c, distance: d };
    }
  }

  return {
    detected,
    confidence,
    priority,
    severity: priority,
    department: CATEGORY_DEPT[detected],
    ruleEn: en,
    ruleHi: hi,
    duplicate,
    area: nearestArea(input.latitude, input.longitude).name,
  };
}

export function detectedLabel(cat: CategoryKey, hi: boolean): string {
  return hi ? CATEGORY_MAP[cat].hi : CATEGORY_MAP[cat].en;
}
