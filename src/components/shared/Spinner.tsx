"use client";

interface SpinnerProps {
  label?: string;
}

export function Spinner({ label }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center gap-3 py-8 text-slate-600">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </div>
  );
}
