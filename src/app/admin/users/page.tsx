"use client";

import { AdminRoute } from "@/components/guards/AdminRoute";

export default function AdminUsersPage() {
  return (
    <AdminRoute>
      <div className="mx-auto max-w-5xl space-y-3 px-4 py-6">
        <h1 className="text-xl font-semibold text-slate-100">Manage Users</h1>
        <p className="text-sm text-slate-400">User list and actions go here.</p>
      </div>
    </AdminRoute>
  );
}
