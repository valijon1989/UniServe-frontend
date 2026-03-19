"use client";

import Link from "next/link";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import type { AdminPermission } from "@/types/admin";

interface Props {
  title: string;
  description: string;
  permission?: AdminPermission;
  links?: Array<{ href: string; label: string }>;
}

export function AdminPlaceholderPage({ title, description, permission, links = [] }: Props) {
  const content = (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <h1 className="text-xl font-semibold text-slate-100">{title}</h1>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </section>

      {links.length > 0 && (
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Available now</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  if (!permission) {
    return content;
  }

  return (
    <AdminPermissionGate permission={permission}>
      {content}
    </AdminPermissionGate>
  );
}
