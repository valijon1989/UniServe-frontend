"use client";

export function AdminAccessDeniedState({
  title = "Access denied",
  description = "You do not have permission to open this admin surface."
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-amber-100/80">{description}</p>
    </div>
  );
}
