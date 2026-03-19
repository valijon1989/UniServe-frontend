"use client";

interface AdminSegmentedTab {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  items: AdminSegmentedTab[];
}

export function AdminSegmentedTabs({ value, onChange, items }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const active = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-full border px-3 py-1.5 text-sm transition ${
              active
                ? "border-sky-500/60 bg-sky-500/15 text-sky-100"
                : "border-slate-700 bg-slate-900/70 text-slate-300 hover:bg-slate-800"
            }`}
          >
            {item.label}
            {typeof item.count === "number" ? <span className="ml-2 text-xs text-slate-400">{item.count}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
