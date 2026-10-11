"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[50vh] max-w-lg flex-col items-center justify-center px-4 text-center" role="alert">
      <div className="text-6xl">⚠️</div>
      <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Something went wrong</h1>
      <p className="mt-2 text-slate-600">{error.message || "An unexpected error occurred."}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-700"
      >
        Try again
      </button>
    </div>
  );
}
