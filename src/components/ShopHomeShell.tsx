"use client";

import type { ReactNode } from "react";

export function ShopHomeShell({
  hero,
  highlights,
  children
}: {
  hero: ReactNode;
  highlights?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="space-y-6">
      {hero}
      {highlights}
      {children}
    </div>
  );
}

