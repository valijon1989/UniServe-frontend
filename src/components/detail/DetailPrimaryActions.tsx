"use client";

type ActionButton = {
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
  tone?: "primary" | "secondary";
};

export function DetailPrimaryActions({
  title,
  status,
  actions
}: {
  title?: string;
  status?: string | null;
  actions: ActionButton[];
}) {
  return (
    <div className="space-y-3">
      {(title || status) && (
        <div>
          {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
          {status && <p className="mt-1 text-xs text-emerald-700">{status}</p>}
        </div>
      )}
      <div className="space-y-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            disabled={action.disabled || action.busy}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
              action.tone === "secondary"
                ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-100"
                : "bg-emerald-500 text-white shadow hover:bg-emerald-600"
            }`}
          >
            {action.busy ? "Yuborilmoqda..." : action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
