"use client";

import type { CaregiverAvailabilityDay } from "@/components/service-detail/caregiver/types";

type AvailabilityBlockProps = {
  workingHours: string[];
  availableDays: string[];
  calendarDays: CaregiverAvailabilityDay[];
};

export function AvailabilityBlock({
  workingHours,
  availableDays,
  calendarDays
}: AvailabilityBlockProps) {
  return (
    <section className="rounded-[1.85rem] border border-slate-200 bg-white/92 p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Availability</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Working hours</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {workingHours.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Available days</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {availableDays.map((item) => (
              <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Weekly view</p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {calendarDays.map((item) => (
            <div
              key={item.key}
              className={`rounded-2xl border px-3 py-3 text-center ${
                item.available
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-500"
              }`}
            >
              <p className="text-xs font-semibold">{item.label}</p>
              <p className="mt-1 text-[11px]">{item.dateLabel}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
