import type { ReactNode } from "react";

export type RoleSegmentOption = {
  value: string;
  label: string;
  description?: string;
  accent?: "sky" | "emerald" | "amber";
  icon?: ReactNode;
};

const accentStyles: Record<NonNullable<RoleSegmentOption["accent"]>, string> = {
  sky: "border-sky-500/70 bg-sky-500/12 text-sky-700 shadow-[0_12px_30px_rgba(14,165,233,0.18)]",
  emerald:
    "border-emerald-500/70 bg-emerald-500/12 text-emerald-700 shadow-[0_12px_30px_rgba(16,185,129,0.18)]",
  amber: "border-amber-500/70 bg-amber-500/12 text-amber-700 shadow-[0_12px_30px_rgba(245,158,11,0.18)]"
};

export function RoleSegmentSwitch({
  value,
  options,
  onChange
}: {
  value: string;
  options: RoleSegmentOption[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((option) => {
        const active = option.value === value;
        const accent = accentStyles[option.accent || "sky"];

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              active
                ? accent
                : "border-stone-200 bg-white/75 text-slate-700 shadow-[0_12px_24px_rgba(15,23,42,0.06)] hover:border-stone-300 hover:bg-white"
            }`}
          >
            <div className="flex items-center gap-3">
              {option.icon ? (
                <span className="flex h-9 w-9 items-center justify-center rounded-2xl border border-current/15 bg-white/60">
                  {option.icon}
                </span>
              ) : null}
              <div className="min-w-0">
                <div className="text-sm font-semibold">{option.label}</div>
                {option.description ? (
                  <div className={`mt-1 text-xs ${active ? "text-current/80" : "text-slate-500"}`}>
                    {option.description}
                  </div>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
