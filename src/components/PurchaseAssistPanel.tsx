"use client";

import type { ReactNode } from "react";
import { RequestFormPanel } from "@/components/detail/RequestFormPanel";

export function PurchaseAssistPanel({
  title,
  description,
  submitLabel,
  submitting,
  onSubmit,
  children
}: {
  title: string;
  description: string;
  submitLabel: string;
  submitting?: boolean;
  onSubmit: () => void;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.8rem] border border-slate-200 bg-white/92 p-5 shadow-[0_20px_40px_rgba(15,23,42,0.08)]">
      <RequestFormPanel
        title={title}
        description={description}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        submitting={submitting}
      >
        {children}
      </RequestFormPanel>
    </section>
  );
}

