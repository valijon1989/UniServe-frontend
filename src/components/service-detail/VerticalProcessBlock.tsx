"use client";

type ProcessStep = {
  title: string;
  description: string;
};

type VerticalProcessBlockProps = {
  title: string;
  description?: string;
  steps: ProcessStep[];
};

export function VerticalProcessBlock({
  title,
  description,
  steps
}: VerticalProcessBlockProps) {
  return (
    <section className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/15">
      <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/80">Process</p>
      <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p> : null}
      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {steps.map((step, index) => (
          <div key={`${step.title}-${index}`} className="grid gap-3 rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-4 md:grid-cols-[auto_1fr]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/16 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/30">
              {index + 1}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-100">{step.title}</p>
              <p className="mt-1 text-sm leading-6 text-slate-400">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
