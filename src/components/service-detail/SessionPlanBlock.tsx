"use client";

type SessionPlanBlockProps = {
  title: string;
  items: string[];
  note?: string;
};

export function SessionPlanBlock({ title, items, note }: SessionPlanBlockProps) {
  return (
    <section className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/80">Plan</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h2>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {items.map((item, index) => (
          <div key={`${item}-${index}`} className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-slate-300">
            {index + 1}. {item}
          </div>
        ))}
      </div>
      {note ? <p className="mt-4 text-sm leading-7 text-slate-300">{note}</p> : null}
    </section>
  );
}
