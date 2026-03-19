"use client";

export interface ActiveFilterChip {
  key: string;
  label: string;
}

export function ActiveFilterChips({
  chips,
  onClearAll,
  emptyLabel,
  clearLabel
}: {
  chips: ActiveFilterChip[];
  onClearAll?: () => void;
  emptyLabel?: string;
  clearLabel?: string;
}) {
  if (chips.length === 0) {
    return (
      <p className="text-xs leading-5 text-slate-500">
        {emptyLabel || "Hozircha qo'shimcha filter yo'q. Category yoki narx bo'yicha qidiruvni aniqlashtiring."}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-semibold text-slate-700 shadow-sm"
        >
          {chip.label}
        </span>
      ))}
      {onClearAll ? (
        <button
          type="button"
          onClick={onClearAll}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
        >
          {clearLabel || "Clear filters"}
        </button>
      ) : null}
    </div>
  );
}
