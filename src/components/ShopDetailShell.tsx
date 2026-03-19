"use client";

import type { ReactNode } from "react";

export function ShopDetailShell({
  sidebar,
  children,
  mobileActions
}: {
  sidebar: ReactNode;
  children: ReactNode;
  mobileActions?: ReactNode;
}) {
  return (
    <>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_380px]">
        <div className="space-y-6">{children}</div>
        <aside className="space-y-4 xl:sticky xl:top-24 xl:h-fit">{sidebar}</aside>
      </div>
      {mobileActions}
    </>
  );
}

