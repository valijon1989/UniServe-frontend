"use client";

import type { ReactNode } from "react";
import { DetailHero } from "@/components/service-detail/DetailHero";
import { DetailPageShell } from "@/components/service-detail/DetailPageShell";

type MetaChip = {
  label: string;
  tone?: "emerald" | "sky" | "amber" | "slate";
};

type VerticalDetailShellProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  meta?: MetaChip[];
  hero?: ReactNode;
  heroAside?: ReactNode;
  left: ReactNode;
  right: ReactNode;
  tone?: "default" | "business" | "learning" | "calm" | "structured" | "active";
};

export function VerticalDetailShell({
  eyebrow,
  title,
  subtitle,
  meta,
  hero,
  heroAside,
  left,
  right,
  tone = "default"
}: VerticalDetailShellProps) {
  return (
    <DetailPageShell
      hero={
        <DetailHero
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          meta={meta}
          media={hero}
          aside={heroAside}
          tone={tone}
        />
      }
      sidebar={right}
    >
      {left}
    </DetailPageShell>
  );
}
