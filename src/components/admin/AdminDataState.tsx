"use client";

export function AdminDataState({
  loading,
  error,
  empty,
  emptyTitle,
  emptyDescription,
  children
}: {
  loading?: boolean;
  error?: string | null;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children: React.ReactNode;
}) {
  if (loading) {
    return <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">Loading…</div>;
  }
  if (error) {
    return <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>;
  }
  if (empty) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
        <p className="font-medium text-slate-200">{emptyTitle || "No records found."}</p>
        {emptyDescription ? <p className="mt-1 text-slate-400">{emptyDescription}</p> : null}
      </div>
    );
  }
  return <>{children}</>;
}
