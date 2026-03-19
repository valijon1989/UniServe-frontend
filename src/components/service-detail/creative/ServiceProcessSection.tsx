"use client";

import type { CreativeProcessStep } from "@/components/service-detail/creative/types";

type ServiceProcessSectionProps = {
  title?: string;
  subtitle?: string;
  steps: CreativeProcessStep[];
};

export function ServiceProcessSection({
  title = "How it works",
  subtitle,
  steps
}: ServiceProcessSectionProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Process</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{title}</h2>
        {subtitle ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{subtitle}</p> : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article key={`${step.step}-${step.title}`} className="relative rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
                {index + 1}
              </span>
              {step.eta ? (
                <span className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 shadow-sm">
                  {step.eta}
                </span>
              ) : null}
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{step.step}</p>
            <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
