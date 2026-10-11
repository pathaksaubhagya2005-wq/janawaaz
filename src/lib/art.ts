import type { CategoryKey } from "./types";

/**
 * Simulated "photos" for the prototype. Evidence images stored as
 * "demo:before:pothole" / "demo:after:pothole" tokens are turned into small SVG scenes,
 * so the app needs no image files, no storage service and no external API.
 */

function scene(kind: "before" | "after", cat: CategoryKey): string {
  const before = kind === "before";
  let body = "";

  switch (cat) {
    case "pothole":
      body = before
        ? `<ellipse cx="330" cy="292" rx="128" ry="44" fill="#4b5563"/>
           <ellipse cx="330" cy="288" rx="104" ry="32" fill="#111827"/>
           <ellipse cx="318" cy="282" rx="60" ry="14" fill="#030712"/>
           <path d="M200 290 L150 262 M205 306 L140 322 M460 288 L520 262 M455 306 L530 318 M330 246 L336 214" stroke="#1f2937" stroke-width="4" fill="none" stroke-linecap="round"/>
           <circle cx="290" cy="318" r="5" fill="#9ca3af"/><circle cx="380" cy="322" r="4" fill="#9ca3af"/><circle cx="415" cy="262" r="4" fill="#9ca3af"/>`
        : `<ellipse cx="330" cy="292" rx="124" ry="42" fill="#374151"/>
           <ellipse cx="330" cy="288" rx="110" ry="34" fill="#1f2937"/>
           <path d="M236 280 Q330 262 424 280" stroke="#4b5563" stroke-width="3" fill="none"/>`;
      break;
    case "garbage":
      body = before
        ? `<g>
             <ellipse cx="330" cy="318" rx="150" ry="30" fill="#374151" opacity=".35"/>
             <circle cx="270" cy="290" r="38" fill="#16a34a"/><circle cx="330" cy="272" r="44" fill="#ea580c"/>
             <circle cx="390" cy="294" r="36" fill="#2563eb"/><circle cx="310" cy="310" r="30" fill="#7c3aed"/>
             <rect x="352" y="300" width="56" height="30" rx="6" fill="#eab308"/><rect x="236" y="306" width="46" height="26" rx="6" fill="#dc2626"/>
             <circle cx="440" cy="322" r="14" fill="#6b7280"/><circle cx="210" cy="326" r="12" fill="#6b7280"/>
           </g>`
        : `<rect x="300" y="236" width="70" height="92" rx="8" fill="#15803d"/><rect x="294" y="228" width="82" height="16" rx="6" fill="#166534"/>
           <path d="M318 262 h34 M318 282 h34" stroke="#bbf7d0" stroke-width="4" stroke-linecap="round"/>`;
      break;
    case "streetlight":
      body = `<rect x="322" y="70" width="12" height="260" rx="4" fill="#374151"/>
              <path d="M328 78 Q400 62 430 98" stroke="#374151" stroke-width="10" fill="none" stroke-linecap="round"/>
              <rect x="410" y="94" width="48" height="16" rx="8" fill="${before ? "#4b5563" : "#fde047"}"/>
              ${
                before
                  ? ""
                  : `<ellipse cx="434" cy="190" rx="92" ry="120" fill="#fde047" opacity=".28"/><ellipse cx="434" cy="300" rx="110" ry="22" fill="#fef08a" opacity=".5"/>`
              }`;
      break;
    case "water":
      body = before
        ? `<rect x="120" y="262" width="400" height="16" rx="8" fill="#6b7280"/>
           <ellipse cx="330" cy="318" rx="160" ry="36" fill="#38bdf8" opacity=".75"/>
           <path d="M330 262 Q322 232 312 214 M330 262 Q338 226 352 208 M330 262 Q330 220 330 196" stroke="#7dd3fc" stroke-width="5" fill="none" stroke-linecap="round"/>
           <circle cx="300" cy="206" r="6" fill="#bae6fd"/><circle cx="360" cy="200" r="5" fill="#bae6fd"/>`
        : `<rect x="120" y="262" width="400" height="16" rx="8" fill="#6b7280"/>
           <rect x="300" y="256" width="60" height="28" rx="6" fill="#16a34a"/>
           <rect x="310" y="262" width="40" height="4" fill="#bbf7d0"/>`;
      break;
    case "drain":
      body = before
        ? `<rect x="230" y="270" width="180" height="70" rx="8" fill="#1f2937"/>
           <path d="M246 280 v50 M270 280 v50 M294 280 v50 M318 280 v50 M342 280 v50 M366 280 v50 M390 280 v50" stroke="#374151" stroke-width="6"/>
           <ellipse cx="320" cy="334" rx="190" ry="30" fill="#92400e" opacity=".55"/>
           <circle cx="280" cy="290" r="12" fill="#a16207"/><circle cx="350" cy="296" r="10" fill="#16a34a"/><rect x="372" y="282" width="30" height="16" rx="4" fill="#dc2626"/>`
        : `<rect x="230" y="270" width="180" height="70" rx="8" fill="#374151"/>
           <path d="M246 280 v50 M270 280 v50 M294 280 v50 M318 280 v50 M342 280 v50 M366 280 v50 M390 280 v50" stroke="#9ca3af" stroke-width="6"/>`;
      break;
    case "safety":
      body = before
        ? `<ellipse cx="330" cy="298" rx="96" ry="34" fill="#4b5563"/><ellipse cx="330" cy="296" rx="80" ry="26" fill="#030712"/>
           <path d="M470 330 L492 262 L514 330 Z" fill="#f97316"/><rect x="466" y="328" width="56" height="8" rx="3" fill="#ea580c"/>
           <path d="M481 300 h22 M486 284 h12" stroke="#fff" stroke-width="5"/>`
        : `<ellipse cx="330" cy="298" rx="96" ry="34" fill="#4b5563"/><ellipse cx="330" cy="296" rx="80" ry="26" fill="#6b7280"/>
           <path d="M270 296 h120 M290 282 h80 M290 310 h80" stroke="#374151" stroke-width="4"/>`;
      break;
    default:
      body = before
        ? `<rect x="190" y="276" width="110" height="60" rx="6" fill="#9ca3af"/><rect x="312" y="288" width="120" height="52" rx="6" fill="#d1d5db" transform="rotate(-6 372 314)"/>
           <path d="M250 276 L280 336 M388 292 L372 338" stroke="#4b5563" stroke-width="4"/>`
        : `<rect x="190" y="276" width="120" height="60" rx="6" fill="#d1d5db"/><rect x="318" y="276" width="124" height="60" rx="6" fill="#d1d5db"/>`;
  }

  const label = before ? "BEFORE" : "AFTER";
  const labelColor = before ? "#dc2626" : "#16a34a";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400" width="640" height="400">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfdbfe"/><stop offset="1" stop-color="#eff6ff"/></linearGradient>
    </defs>
    <rect width="640" height="400" fill="url(#sky)"/>
    <rect x="30" y="70" width="90" height="100" fill="#cbd5e1"/><rect x="130" y="40" width="70" height="130" fill="#94a3b8"/>
    <rect x="470" y="60" width="100" height="110" fill="#cbd5e1"/><rect x="580" y="90" width="60" height="80" fill="#94a3b8"/>
    <rect y="150" width="640" height="250" fill="#6b7280"/>
    <rect y="150" width="640" height="10" fill="#9ca3af"/>
    <rect x="40" y="368" width="90" height="8" rx="4" fill="#e5e7eb"/><rect x="250" y="368" width="90" height="8" rx="4" fill="#e5e7eb"/><rect x="460" y="368" width="90" height="8" rx="4" fill="#e5e7eb"/>
    ${body}
    <rect x="16" y="16" width="104" height="32" rx="16" fill="${labelColor}"/>
    <text x="68" y="38" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" font-weight="700" fill="#fff">${label}</text>
    <text x="624" y="386" text-anchor="end" font-family="Arial, sans-serif" font-size="12" fill="#e5e7eb">Simulated demo photo</text>
  </svg>`;
}

export function demoImage(kind: "before" | "after", cat: CategoryKey): string {
  return `demo:${kind}:${cat}`;
}

/** Turns stored image references into something an <img> can display. */
export function resolveImage(src?: string): string | undefined {
  if (!src) return undefined;
  if (src.startsWith("demo:")) {
    const [, kind, cat] = src.split(":");
    const svg = scene(kind === "after" ? "after" : "before", (cat as CategoryKey) || "other");
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
  return src;
}
