import React from "react";

/** JanAwaaz mark: a speech bubble (voice) holding a location pin. */
export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      role="img"
      aria-label="JanAwaaz logo"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="ja-lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#2563eb" />
          <stop offset="1" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="13" fill="url(#ja-lg)" />
      <path
        d="M12 9h24a4 4 0 0 1 4 4v14a4 4 0 0 1-4 4H27l-7 7v-7h-8a4 4 0 0 1-4-4V13a4 4 0 0 1 4-4z"
        fill="#fff"
      />
      <path
        d="M24 13.2c-3.5 0-6.2 2.7-6.2 6 0 4.3 6.2 9.6 6.2 9.6s6.2-5.3 6.2-9.6c0-3.3-2.7-6-6.2-6z"
        fill="#ea580c"
      />
      <circle cx="24" cy="19.2" r="2.4" fill="#fff" />
      <path d="M40.5 5.5c2 1.6 3 3.7 3 6" stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path d="M44 2.5c3 2.4 4.2 5.6 4.2 9" stroke="#bfdbfe" strokeWidth="2" strokeLinecap="round" fill="none" opacity=".7" />
    </svg>
  );
}

export function Logo({
  size = 40,
  showTagline = false,
  light = false,
}: {
  size?: number;
  showTagline?: boolean;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={size} />
      <span className="flex flex-col leading-tight">
        <span
          className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-brand-900"}`}
        >
          Jan<span className="text-brand-600">Awaaz</span>
        </span>
        {showTagline && (
          <span className={`text-[11px] font-medium ${light ? "text-brand-200" : "text-slate-500"}`}>
            Samasya Se Samadhaan Tak
          </span>
        )}
      </span>
    </span>
  );
}
