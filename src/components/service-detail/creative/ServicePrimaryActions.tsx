"use client";

type PrimaryAction = {
  key: string;
  label: string;
  tone?: "primary" | "secondary" | "ghost";
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
};

type SupportAction = {
  key: string;
  label: string;
  onClick: () => void;
};

type ServicePrimaryActionsProps = {
  status?: string | null;
  actions: PrimaryAction[];
  supportActions?: SupportAction[];
};

export function ServicePrimaryActions({
  status,
  actions,
  supportActions = []
}: ServicePrimaryActionsProps) {
  return (
    <section className="rounded-[1.9rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <div className="space-y-3">
        {actions.map((action) => {
          const className = `inline-flex w-full items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
            action.tone === "secondary"
              ? "border border-slate-300 bg-white text-slate-900 hover:bg-slate-50"
              : action.tone === "ghost"
                ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                : "bg-slate-950 text-white shadow-lg shadow-slate-200 hover:bg-slate-800"
          } ${action.disabled || action.busy ? "cursor-not-allowed opacity-60" : ""}`;

          return (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              disabled={action.disabled || action.busy}
              className={className}
            >
              {action.busy ? "Yuklanmoqda..." : action.label}
            </button>
          );
        })}
      </div>

      {status ? (
        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {status}
        </div>
      ) : null}

      {supportActions.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {supportActions.map((action) => (
            <button
              key={action.key}
              type="button"
              onClick={action.onClick}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      ) : null}
    </section>
  );
}
