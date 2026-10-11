"use client";

import React from "react";

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
  sub?: string;
}

/** Vertical bars drawn with CSS so they stay crisp and responsive. */
export function BarChart({
  data,
  height = 200,
  color = "#2563eb",
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 sm:gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center">
          <div className="mb-1 text-xs font-bold text-slate-700">{d.value}</div>
          <div
            className="w-full rounded-t-lg transition-all"
            style={{
              height: `${(d.value / max) * 78}%`,
              background: d.color ?? color,
              minHeight: 4,
            }}
            title={`${d.label}: ${d.value}`}
          />
          <div className="mt-2 truncate text-[11px] font-medium text-slate-500" title={d.label}>
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HBarChart({
  data,
  color = "#2563eb",
  unit = "",
}: {
  data: BarDatum[];
  color?: string;
  unit?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className="space-y-3">
      {data.map((d) => (
        <li key={d.label}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="font-medium text-slate-700">{d.label}</span>
            <span className="font-bold text-slate-900">
              {d.value}
              {unit}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color ?? color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

export interface Series {
  name: string;
  color: string;
  values: number[];
}

export function LineChart({
  labels,
  series,
  height = 240,
  area = true,
  valueSuffix = "",
}: {
  labels: string[];
  series: Series[];
  height?: number;
  area?: boolean;
  valueSuffix?: string;
}) {
  const W = 640;
  const H = 260;
  const padL = 36;
  const padR = 12;
  const padT = 14;
  const padB = 28;
  const all = series.flatMap((s) => s.values);
  const rawMax = Math.max(...all, 1);
  const step = rawMax > 50 ? 20 : rawMax > 10 ? 2 : 1;
  const max = Math.ceil(rawMax / step) * step;
  const x = (i: number) => padL + (i / Math.max(labels.length - 1, 1)) * (W - padL - padR);
  const y = (v: number) => padT + (1 - v / max) * (H - padT - padB);
  const ticks = 4;

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} role="img">
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (max / ticks) * i;
          return (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray="3 4" />
              <text x={padL - 6} y={y(v) + 4} textAnchor="end" fontSize="11" fill="#94a3b8">
                {Number.isInteger(v) ? v : v.toFixed(1)}
              </text>
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={l + i} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="#64748b">
            {l}
          </text>
        ))}
        {series.map((s, si) => {
          const pts = s.values.map((v, i) => `${x(i)},${y(v)}`);
          const line = `M${pts.join(" L")}`;
          const fill = `${line} L${x(s.values.length - 1)},${y(0)} L${x(0)},${y(0)} Z`;
          return (
            <g key={s.name}>
              {area && si === 0 && <path d={fill} fill={s.color} opacity=".1" />}
              <path d={line} fill="none" stroke={s.color} strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r="3.6" fill="#fff" stroke={s.color} strokeWidth="2">
                  <title>{`${s.name} · ${labels[i]}: ${v}${valueSuffix}`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      {series.length > 1 && (
        <div className="mt-1 flex flex-wrap gap-4 text-xs font-medium text-slate-600">
          {series.map((s) => (
            <span key={s.name} className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
              {s.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function Donut({
  value,
  label,
  sub,
  color = "#16a34a",
  size = 170,
}: {
  value: number;
  label: string;
  sub?: string;
  color?: string;
  size?: number;
}) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(Math.max(value, 0), 100) / 100) * c;
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label={`${label} ${value}%`}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="14" />
        <circle
          cx="70"
          cy="70"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c - dash}`}
          transform="rotate(-90 70 70)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-3xl font-extrabold text-slate-900">{value}%</div>
        <div className="text-xs font-semibold text-slate-500">{label}</div>
        {sub && <div className="text-[10px] text-slate-400">{sub}</div>}
      </div>
    </div>
  );
}

/** Two bars per row (e.g. total vs resolved) */
export function GroupedBars({
  rows,
  aLabel,
  bLabel,
  aColor = "#93c5fd",
  bColor = "#16a34a",
}: {
  rows: Array<{ label: string; a: number; b: number }>;
  aLabel: string;
  bLabel: string;
  aColor?: string;
  bColor?: string;
}) {
  const max = Math.max(...rows.map((r) => Math.max(r.a, r.b)), 1);
  return (
    <div>
      <div className="mb-3 flex gap-4 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: aColor }} />
          {aLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: bColor }} />
          {bLabel}
        </span>
      </div>
      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium text-slate-700">{r.label}</span>
              <span className="text-xs font-semibold text-slate-500">
                {r.b}/{r.a} · {Math.round((r.b / Math.max(r.a, 1)) * 100)}%
              </span>
            </div>
            <div className="space-y-1">
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(r.a / max) * 100}%`, background: aColor }} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full" style={{ width: `${(r.b / max) * 100}%`, background: bColor }} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
