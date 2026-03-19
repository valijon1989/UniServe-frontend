"use client";

import type { CaregiverProcessStep } from "@/components/service-detail/caregiver/types";

type CaregiverProcessProps = {
  steps: CaregiverProcessStep[];
};

export function CaregiverProcess({ steps }: CaregiverProcessProps) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Process</p>
        <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Parvarish jarayoni</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          Buyurtma va chat alohida yuradi. Avval bron so'rovi yuboriladi, keyin tafsilotlar va yakuniy kelishuv tasdiqlanadi.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        {steps.map((step, index) => (
          <article key={`${step.step}-${step.title}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-4">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white">
              {index + 1}
            </span>
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{step.step}</p>
            <h3 className="mt-2 text-lg font-bold tracking-tight text-slate-950">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
