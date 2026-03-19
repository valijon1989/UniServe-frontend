"use client";

import type { ReactNode } from "react";

export function ShopCatalogShell({
  sidebar,
  topbar,
  children
}: {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="space-y-4">{sidebar}</aside>
      <div className="space-y-5">
        {topbar}
        {children}
      </div>
    </div>
  );
}

