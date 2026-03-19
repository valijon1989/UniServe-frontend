"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getAuditLogs } from "@/api/admin";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import type { AuditLogItem } from "@/types/admin";

const todayIso = new Date().toISOString().slice(0, 10);

const summarizeObject = (value?: Record<string, unknown> | null) => {
  if (!value || typeof value !== "object") return "—";
  const entries = Object.entries(value)
    .filter(([, item]) => item !== undefined && item !== null && item !== "")
    .slice(0, 3)
    .map(([key, item]) => `${key}: ${typeof item === "object" ? "[object]" : String(item)}`);
  if (!entries.length) return "—";
  return entries.join(" · ");
};

export default function AdminAuditPage() {
  const [items, setItems] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState(todayIso);
  const [dateTo, setDateTo] = useState(todayIso);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await getAuditLogs({
        adminId: adminId || undefined,
        action: action || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page: 1,
        limit: 50
      });
      setItems(res.items);
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || "Failed to load audit logs";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminPermissionGate permissionsAny={["audit.view", "audit.read", "logs.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h1 className="text-xl font-semibold text-slate-100">Audit Logs</h1>
          <p className="mt-1 text-sm text-slate-400">Track admin actions by admin/action/date filters.</p>

          <div className="mt-4 grid gap-2 md:grid-cols-4">
            <input
              value={adminId}
              onChange={(event) => setAdminId(event.target.value)}
              placeholder="Admin ID"
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            />
            <input
              value={action}
              onChange={(event) => setAction(event.target.value)}
              placeholder="Action"
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            />
          </div>

          <button
            type="button"
            onClick={() => void fetchLogs()}
            className="mt-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
          >
            Apply filters
          </button>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          {loading ? (
            <p className="text-sm text-slate-400">Loading logs...</p>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-400">No logs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1080px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2">Time</th>
                    <th className="px-2 py-2">Actor</th>
                    <th className="px-2 py-2">Role</th>
                    <th className="px-2 py-2">Action</th>
                    <th className="px-2 py-2">Entity</th>
                    <th className="px-2 py-2">Reason</th>
                    <th className="px-2 py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-t border-slate-800/70">
                      <td className="px-2 py-2 text-slate-300">{new Date(item.createdAt).toLocaleString()}</td>
                      <td className="px-2 py-2 text-slate-100">{item.actorName || item.actorId || "—"}</td>
                      <td className="px-2 py-2 text-slate-400">{item.actorRole || "—"}</td>
                      <td className="px-2 py-2 text-slate-200">{item.action}</td>
                      <td className="px-2 py-2 text-slate-400">
                        {item.entityType || "Entity"} {item.entityId ? `#${item.entityId}` : ""}
                      </td>
                      <td className="px-2 py-2 text-slate-400">{item.reason || "—"}</td>
                      <td className="px-2 py-2 text-xs text-slate-400">
                        <div>Before: {summarizeObject(item.previousValue)}</div>
                        <div className="mt-1">After: {summarizeObject(item.newValue)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPermissionGate>
  );
}
