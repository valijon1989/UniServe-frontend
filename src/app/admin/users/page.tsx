"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getOperationalUsers, updateOperationalUser } from "@/api/adminEnterprise";
import { AdminAccessDeniedState } from "@/components/admin/AdminAccessDeniedState";
import { AdminActionPanel } from "@/components/admin/AdminActionPanel";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminDetailCard } from "@/components/admin/AdminDetailCard";
import { AdminEntityTable } from "@/components/admin/AdminEntityTable";
import { AdminKeyValueList } from "@/components/admin/AdminKeyValueList";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminSegmentedTabs } from "@/components/admin/AdminSegmentedTabs";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminTimeline } from "@/components/admin/AdminTimeline";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { formatAdminDate, formatAdminDateShort, summarizeList } from "@/lib/adminFormatters";
import type { OperationalUserItem } from "@/types/admin";

const actionOptions = [
  { id: "warn", label: "Send warning", permission: "users.warn", tone: "default" as const },
  { id: "restrict", label: "Restrict access", permission: "users.suspend", tone: "default" as const },
  { id: "suspend", label: "Suspend", permission: "users.suspend", tone: "danger" as const },
  { id: "ban", label: "Ban account", permission: "users.ban", tone: "danger" as const },
  { id: "restore", label: "Restore", permission: "users.suspend", tone: "primary" as const }
];

export default function AdminUsersPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<OperationalUserItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOperationalUsers({
        page: 1,
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined
      });
      setItems(res.items);
      setSelectedId((current) => {
        if (current && res.items.some((item) => item.id === current)) return current;
        return res.items[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load users");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      warned: items.filter((item) => item.status === "WARNED").length,
      suspended: items.filter((item) => item.status === "SUSPENDED" || item.status === "BANNED").length,
      reported: items.filter((item) => item.reportCount > 0).length
    };
  }, [items]);

  const canMutate = admin.requireFreshMode() && admin.canAny(["users.warn", "users.suspend", "users.ban"]);

  const handleAction = async (action: string) => {
    if (!selected) return;
    const key = `${selected.id}:${action}`;
    setProcessingKey(key);
    try {
      await updateOperationalUser(selected.id, {
        action,
        reason: reason.trim(),
        note: note.trim() || undefined
      });
      toast.success(`User action applied: ${action}`);
      setReason("");
      setNote("");
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "User action failed");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["users.view", "users.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Users</h1>
              <p className="mt-1 text-sm text-slate-400">
                Operational account review with warnings, reports, joined date, activity summary, and permission-based actions.
              </p>
            </div>
            <div className="grid gap-2 sm:min-w-[320px] sm:grid-cols-[1fr,160px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search user, email, username"
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">All statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="WARNED">Warned</option>
                <option value="RESTRICTED">Restricted</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="BANNED">Banned</option>
              </select>
            </div>
          </div>
        </section>

        <AdminSegmentedTabs
          value={statusFilter}
          onChange={setStatusFilter}
          items={[
            { id: "all", label: "All", count: stats.total },
            { id: "WARNED", label: "Warned", count: stats.warned },
            { id: "SUSPENDED", label: "Suspended", count: stats.suspended },
            { id: "BANNED", label: "Banned", count: items.filter((item) => item.status === "BANNED").length },
            { id: "ACTIVE", label: "Active", count: items.filter((item) => item.status === "ACTIVE").length }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Warned", value: stats.warned },
            { label: "Restricted", value: items.filter((item) => item.status === "RESTRICTED").length },
            { label: "Reported", value: stats.reported }
          ]}
        />

        <AdminDataState loading={loading} error={error} empty={!items.length}>
          <section className="grid gap-4 xl:grid-cols-[1.45fr,0.95fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
              <AdminEntityTable
                items={items}
                selectedId={selectedId}
                onSelect={setSelectedId}
                columns={[
                  {
                    key: "user",
                    label: "User",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.email || item.username}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.region || "No region"}</p>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "w-[150px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.status} />
                        <AdminStatusBadge value={item.verificationStatus ? "verified" : "unverified"} />
                      </div>
                    )
                  },
                  {
                    key: "signals",
                    label: "Warnings / Reports",
                    className: "w-[180px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>warnings {item.warningCount}</p>
                        <p>reports {item.reportCount}</p>
                        <p className="mt-1 text-slate-500">{summarizeList(item.flags)}</p>
                      </div>
                    )
                  },
                  {
                    key: "joined",
                    label: "Joined",
                    className: "w-[160px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{formatAdminDateShort(item.joinedAt)}</p>
                        <p className="mt-1 text-slate-500">last active {formatAdminDateShort(item.lastActiveAt)}</p>
                      </div>
                    )
                  },
                  {
                    key: "activity",
                    label: "Activity Summary",
                    className: "w-[220px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>orders {item.linkedActivity.orders}</p>
                        <p>payments {item.linkedActivity.payments}</p>
                        <p>posts {item.linkedActivity.posts}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            <AdminDetailCard title={selected?.name || "User detail"} subtitle={selected?.email || "Select a user"}>
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={selected.status} />
                    <AdminStatusBadge value={selected.verificationStatus ? "verified" : "unverified"} />
                  </div>

                  <AdminKeyValueList
                    items={[
                      { label: "Joined", value: formatAdminDate(selected.joinedAt) },
                      { label: "Region", value: selected.region || "—" },
                      { label: "Last Active", value: formatAdminDate(selected.lastActiveAt) },
                      { label: "Restriction", value: selected.restrictionReason || "—" },
                      {
                        label: "Activity",
                        value: `orders ${selected.linkedActivity.orders} · payments ${selected.linkedActivity.payments} · posts ${selected.linkedActivity.posts}`
                      },
                      { label: "Community", value: `followers ${selected.followers} · following ${selected.following}` }
                    ]}
                  />

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Warnings & reports</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Warnings</p>
                        <p className="mt-2 text-sm text-slate-300">{selected.warningCount} active warnings</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {selected.warnings?.[0]?.reason || "No warning history attached to this record."}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Reports</p>
                        <p className="mt-2 text-sm text-slate-300">{selected.reportCount} reports</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {selected.reports?.[0]?.reason || "No report details returned by backend."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Internal note</h3>
                    <p className="mt-2 text-sm text-slate-300">{selected.internalNotes || "No internal notes recorded."}</p>
                  </div>

                  {canMutate ? (
                    <AdminActionPanel
                      title="Support actions"
                      helperText="Sensitive changes require an audit reason and will be written to the backend action log."
                      reason={reason}
                      note={note}
                      onReasonChange={setReason}
                      onNoteChange={setNote}
                      actions={actionOptions
                        .filter((action) => admin.can(action.permission as any))
                        .map((action) => ({
                          id: action.id,
                          label: action.label,
                          tone: action.tone,
                          loading: processingKey === `${selected.id}:${action.id}`,
                          onClick: () => void handleAction(action.id)
                        }))}
                    />
                  ) : (
                    <AdminAccessDeniedState
                      title="Read-only access"
                      description={
                        admin.requireFreshMode()
                          ? "This admin can inspect user records but cannot apply support actions."
                          : "Re-enter admin mode to warn, restrict, suspend, or restore user accounts."
                      }
                    />
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-100">Action history</h3>
                    <AdminTimeline items={selected.history} emptyLabel="No admin action history returned for this user." />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select a user to inspect account history and actions.</p>
              )}
            </AdminDetailCard>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
