"use client";

interface AdminActionButton {
  id: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: "default" | "danger" | "primary";
}

interface Props {
  title?: string;
  reason: string;
  note: string;
  onReasonChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  actions: AdminActionButton[];
  requireReason?: boolean;
  disabled?: boolean;
  helperText?: string;
}

const buttonClasses: Record<NonNullable<AdminActionButton["tone"]>, string> = {
  default: "border-slate-700 text-slate-100 hover:bg-slate-800",
  danger: "border-rose-500/40 text-rose-100 hover:bg-rose-500/10",
  primary: "border-sky-500/40 text-sky-100 hover:bg-sky-500/10"
};

export function AdminActionPanel({
  title = "Actions",
  reason,
  note,
  onReasonChange,
  onNoteChange,
  actions,
  requireReason = true,
  disabled,
  helperText
}: Props) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        {helperText ? <p className="mt-1 text-xs text-slate-400">{helperText}</p> : null}
      </div>

      <input
        value={reason}
        onChange={(event) => onReasonChange(event.target.value)}
        placeholder="Audit reason"
        disabled={disabled}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      />
      <textarea
        value={note}
        onChange={(event) => onNoteChange(event.target.value)}
        placeholder="Internal note (optional)"
        rows={3}
        disabled={disabled}
        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
      />

      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const isDisabled = disabled || action.disabled || (requireReason && !reason.trim());
          return (
            <button
              key={action.id}
              type="button"
              onClick={action.onClick}
              disabled={isDisabled}
              className={`rounded-lg border px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${
                buttonClasses[action.tone || "default"]
              }`}
            >
              {action.loading ? "Working…" : action.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
