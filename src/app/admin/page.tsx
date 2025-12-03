"use client";

import { AdminRoute } from "@/components/guards/AdminRoute";

export default function AdminPage() {
  return (
    <AdminRoute>
      <div className="mx-auto max-w-4xl space-y-3 px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-100">Admin Dashboard</h1>
        <p className="text-sm text-slate-400">Overview and moderation tools.</p>
      </div>
    </AdminRoute>
  );
}
