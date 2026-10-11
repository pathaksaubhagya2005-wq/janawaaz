"use client";

import React, { useRef } from "react";
import { AREAS, MAP_BOUNDS } from "@/lib/data";
import { useApp } from "@/lib/store";
import type { Complaint, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";

const W = 800;
const H = 600;

export function project(lat: number, lng: number) {
  const { latMin, latMax, lngMin, lngMax } = MAP_BOUNDS;
  return {
    x: ((lng - lngMin) / (lngMax - lngMin)) * W,
    y: ((latMax - lat) / (latMax - latMin)) * H,
  };
}

export function unproject(x: number, y: number) {
  const { latMin, latMax, lngMin, lngMax } = MAP_BOUNDS;
  return {
    lat: latMax - (y / H) * (latMax - latMin),
    lng: lngMin + (x / W) * (lngMax - lngMin),
  };
}

const PIN_COLOR: Record<Priority, string> = {
  critical: "#dc2626",
  high: "#f97316",
  medium: "#f59e0b",
  low: "#64748b",
};

const ROWS = [0, 100, 200, 310, 420, 520, 600];
const COLS = [0, 110, 230, 350, 470, 590, 800];

function heatColor(count: number) {
  if (count >= 60) return "red";
  if (count >= 35) return "orange";
  return "green";
}

interface Props {
  complaints?: Complaint[];
  heat?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onPick?: (lat: number, lng: number) => void;
  picked?: { lat: number; lng: number } | null;
  focus?: { lat: number; lng: number } | null;
  className?: string;
  showLegend?: boolean;
  showAreaLabels?: boolean;
}

export function CityMap({
  complaints = [],
  heat = false,
  selectedId,
  onSelect,
  onPick,
  picked,
  focus,
  className,
  showLegend = false,
  showAreaLabels = true,
}: Props) {
  const { tr } = useApp();
  const svgRef = useRef<SVGSVGElement>(null);

  let viewBox = `0 0 ${W} ${H}`;
  let k = 1;
  if (focus) {
    const p = project(focus.lat, focus.lng);
    const w = 270;
    const h = 200;
    const x = Math.min(Math.max(p.x - w / 2, 0), W - w);
    const y = Math.min(Math.max(p.y - h / 2, 0), H - h);
    viewBox = `${x} ${y} ${w} ${h}`;
    k = 0.5;
  }

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onPick || !svgRef.current) return;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const m = svg.getScreenCTM();
    if (!m) return;
    const p = pt.matrixTransform(m.inverse());
    const ll = unproject(p.x, p.y);
    onPick(ll.lat, ll.lng);
  };

  const pinPath = "M0 0C-4-8-12-14-12-24A12 12 0 1 1 12-24C12-14 4-8 0 0Z";

  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-slate-200 bg-white", className)}>
      <svg
        ref={svgRef}
        viewBox={viewBox}
        className={cn("block h-full w-full", onPick && "cursor-crosshair")}
        onClick={handleClick}
        role="img"
        aria-label={tr("Illustrative map of civic complaints (demo)", "नागरिक शिकायतों का चित्रात्मक नक्शा (डेमो)")}
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="heat-red">
            <stop offset="0" stopColor="#ef4444" stopOpacity=".78" />
            <stop offset="1" stopColor="#ef4444" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-orange">
            <stop offset="0" stopColor="#f97316" stopOpacity=".7" />
            <stop offset="1" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat-green">
            <stop offset="0" stopColor="#22c55e" stopOpacity=".6" />
            <stop offset="1" stopColor="#22c55e" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* base + city blocks */}
        <rect width={W} height={H} fill="#f8fafc" />
        {ROWS.slice(0, -1).map((y0, ri) =>
          COLS.slice(0, -1).map((x0, ci) => (
            <rect
              key={`${ri}-${ci}`}
              x={x0 + 9}
              y={y0 + 9}
              width={COLS[ci + 1] - x0 - 18}
              height={ROWS[ri + 1] - y0 - 18}
              rx={10}
              fill="#e6edf5"
            />
          ))
        )}
        {/* parks */}
        <rect x="245" y="215" width="95" height="85" rx="12" fill="#cdeed7" />
        <rect x="485" y="435" width="92" height="75" rx="12" fill="#cdeed7" />
        <rect x="24" y="115" width="72" height="75" rx="12" fill="#cdeed7" />
        {/* river + expressway */}
        <path
          d="M700 -10 C 745 150, 670 300, 735 420 S 770 560 775 620"
          stroke="#bcd9f7"
          strokeWidth="46"
          fill="none"
          strokeLinecap="round"
        />
        <path d="M-10 575 L690 40" stroke="#cbd5e1" strokeWidth="22" strokeLinecap="round" />
        <path d="M-10 575 L690 40" stroke="#ffffff" strokeWidth="16" strokeLinecap="round" />
        <path d="M-10 575 L690 40" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="10 10" />

        {/* heat blobs */}
        {heat &&
          AREAS.map((a) => {
            const p = project(a.lat, a.lng);
            const c = heatColor(a.count);
            const r = 52 + a.count * 1.15;
            return <circle key={a.name} cx={p.x} cy={p.y} r={r} fill={`url(#heat-${c})`} />;
          })}

        {/* area labels */}
        {showAreaLabels &&
          AREAS.map((a) => {
            const p = project(a.lat, a.lng);
            return (
              <g key={a.name} pointerEvents="none">
                <text
                  x={p.x}
                  y={p.y + 30 * k}
                  textAnchor="middle"
                  fontSize={12.5 * (focus ? 0.62 : 1)}
                  fontWeight={700}
                  fill="#334155"
                  stroke="#fff"
                  strokeWidth={3.5 * (focus ? 0.6 : 1)}
                  paintOrder="stroke"
                >
                  {a.name}
                </text>
                {heat && (
                  <text
                    x={p.x}
                    y={p.y + 46 * k}
                    textAnchor="middle"
                    fontSize={11 * (focus ? 0.62 : 1)}
                    fontWeight={600}
                    fill="#64748b"
                    stroke="#fff"
                    strokeWidth={3}
                    paintOrder="stroke"
                  >
                    {a.count} {tr("complaints", "शिकायतें")}
                  </text>
                )}
              </g>
            );
          })}

        {/* complaint pins */}
        {complaints.map((c) => {
          const p = project(c.latitude, c.longitude);
          const done = c.status === "resolved";
          const color = done ? "#16a34a" : PIN_COLOR[c.priority];
          const selected = selectedId === c.id;
          const s = (selected ? 1.25 : 1) * (focus ? 0.6 : 0.78);
          return (
            <g
              key={c.id}
              transform={`translate(${p.x} ${p.y})`}
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.(c.id);
              }}
              className={onSelect ? "cursor-pointer" : undefined}
            >
              <title>{`${c.complaintNumber} · ${c.address}`}</title>
              {(selected || (c.priority === "critical" && !done)) && (
                <circle
                  r={12 * s}
                  cy={-2}
                  fill={color}
                  className="origin-center animate-ping2 [transform-box:fill-box]"
                  opacity="0.5"
                />
              )}
              <ellipse cx={0} cy={1} rx={7 * s} ry={2.6 * s} fill="#0f172a" opacity=".22" />
              <path d={pinPath} transform={`scale(${s})`} fill={color} stroke="#fff" strokeWidth={1.8} />
              <circle cy={-24 * s} r={4.6 * s} fill="#fff" />
            </g>
          );
        })}

        {/* picked location (report form) */}
        {picked &&
          (() => {
            const p = project(picked.lat, picked.lng);
            const s = focus ? 0.9 : 1.15;
            return (
              <g transform={`translate(${p.x} ${p.y})`} pointerEvents="none">
                <circle
                  r={14 * s}
                  cy={-2}
                  fill="#2563eb"
                  className="origin-center animate-ping2 [transform-box:fill-box]"
                  opacity=".5"
                />
                <path d={pinPath} transform={`scale(${s})`} fill="#2563eb" stroke="#fff" strokeWidth={2} />
                <circle cy={-24 * s} r={4.8 * s} fill="#fff" />
              </g>
            );
          })()}
      </svg>

      <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-medium text-slate-500 shadow-sm">
        {tr("Illustrative demo map", "चित्रात्मक डेमो नक्शा")}
      </div>

      {showLegend && (
        <div className="pointer-events-none absolute bottom-2 left-2 flex flex-col gap-1 rounded-xl bg-white/95 p-2.5 text-[11px] font-medium text-slate-700 shadow-card">
          {heat ? (
            <>
              <Legend color="#ef4444" label={tr("High concentration", "अधिक संकेंद्रण")} />
              <Legend color="#f97316" label={tr("Medium", "मध्यम")} />
              <Legend color="#22c55e" label={tr("Low", "कम")} />
            </>
          ) : (
            <>
              <Legend color="#dc2626" label={tr("Critical", "अति गंभीर")} />
              <Legend color="#f97316" label={tr("High", "उच्च")} />
              <Legend color="#f59e0b" label={tr("Medium", "मध्यम")} />
              <Legend color="#16a34a" label={tr("Resolved", "समाधान हुआ")} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
