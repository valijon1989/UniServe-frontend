"use client";

export function AgentTrustBadges({
  title = "Trust indicators",
  items
}: {
  title?: string;
  items: string[];
}) {
  return (
    <section className="rounded-[1.6rem] border border-white/10 bg-slate-950/45 p-4">
      <p className="text-sm font-semibold text-white">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className="rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1.5 text-[11px] font-medium text-emerald-100">
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}
