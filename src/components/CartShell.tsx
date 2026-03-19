"use client";

import type { ReactNode } from "react";

export function CartShell({
  items,
  summary
}: {
  items: ReactNode;
  summary: ReactNode;
}) {
  return <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_360px]">{items}{summary}</div>;
}

