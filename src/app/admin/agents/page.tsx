"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getOperationalAgents, updateOperationalAgent } from "@/api/adminEnterprise";
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
import { formatAdminDate, summarizeList } from "@/lib/adminFormatters";
import type { AdminPermission, OperationalAgentItem } from "@/types/admin";

const actionOptions: Array<{
  id: string;
  label: string;
  permission: AdminPermission;
  tone: "default" | "danger" | "primary";
}> = [
  { id: "verify", label: "Verify", permission: "agents.verify", tone: "primary" },
  { id: "badge", label: "Assign badge", permission: "agents.badge", tone: "default" },
  { id: "suspend", label: "Suspend", permission: "agents.suspend", tone: "danger" },
  { id: "restore", label: "Restore", permission: "agents.suspend", tone: "primary" },
  { id: "note", label: "Save note", permission: "agents.note", tone: "default" }
];

export default function AdminAgentsPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<OperationalAgentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [badgeValue, setBadgeValue] = useState("trusted");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOperationalAgents({
        page: 1,
        limit: 100,
        status: statusFilter === "queue" ? "PENDING" : statusFilter === "all" ? undefined : statusFilter,
        search: search.trim() || undefined
      });
      setItems(res.items);
      setSelectedId((current) => {
        if (current && res.items.some((item) => item.id === current)) return current;
        return res.items[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load agents");
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
      pending: items.filter((item) => item.adminStatus === "PENDING").length,
      verified: items.filter((item) => item.verifiedByAdmin).length,
      suspended: items.filter((item) => item.adminStatus === "SUSPENDED").length
    };
  }, [items]);

  const canMutate = admin.requireFreshMode() && admin.canAny(["agents.verify", "agents.suspend", "agents.badge", "agents.note"]);

  const handleAction = async (action: string) => {
    if (!selected) return;
    const key = `${selected.id}:${action}`;
    setProcessingKey(key);
    try {
      await updateOperationalAgent(selected.id, {
        action,
        badge: action === "badge" ? badgeValue : undefined,
        reason: reason.trim(),
        note: note.trim() || undefined
      });
      toast.success(`Agent action applied: ${action}`);
      setReason("");
      setNote("");
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Agent action failed");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["agents.view", "agents.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Agents</h1>
              <p className="mt-1 text-sm text-slate-400">
                Verification queue, ratings, complaints, linked listings, status history, badge controls, and internal notes.
              </p>
            </div>
            <div className="grid gap-2 sm:min-w-[320px] sm:grid-cols-[1fr,160px]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search agent, email, business"
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">All statuses</option>
                <option value="queue">Verification queue</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>
        </section>

        <AdminSegmentedTabs
          value={statusFilter}
          onChange={setStatusFilter}
          items={[
            { id: "all", label: "All", count: stats.total },
            { id: "queue", label: "Verification queue", count: stats.pending },
            { id: "ACTIVE", label: "Active", count: items.filter((item) => item.adminStatus === "ACTIVE").length },
            { id: "SUSPENDED", label: "Suspended", count: stats.suspended }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Queue", value: stats.pending },
            { label: "Verified", value: stats.verified },
            { label: "Complaints", value: items.reduce((sum, item) => sum + item.complaints, 0) }
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
                    key: "agent",
                    label: "Agent",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.name}</p>
                        <p className="text-xs text-slate-400">{item.email || "No email"}</p>
                        <p className="mt-1 text-xs text-slate-500">{item.kind}</p>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: "Verification",
                    className: "w-[170px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.adminStatus} />
                        {item.badge ? <AdminStatusBadge value={item.badge} tone="neutral" /> : null}
                        <p className="text-xs text-slate-500">
                          queue #{item.verificationQueuePosition || "—"}
                        </p>
                      </div>
                    )
                  },
                  {
                    key: "performance",
                    label: "Performance",
                    className: "w-[190px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>rating {item.rating.toFixed(1)} ({item.ratingCount})</p>
                        <p>response {item.responseRate}%</p>
                        <p>complaints {item.complaints}</p>
                      </div>
                    )
                  },
                  {
                    key: "catalog",
                    label: "Linked Services / Products",
                    className: "w-[200px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>services {item.servicesCount}</p>
                        <p>products {item.productsCount}</p>
                        <p>orders {item.orderCount}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            <AdminDetailCard title={selected?.name || "Agent detail"} subtitle={selected?.email || "Select an agent"}>
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={selected.adminStatus} />
                    {selected.badge ? <AdminStatusBadge value={selected.badge} tone="neutral" /> : null}
                    <AdminStatusBadge value={selected.verifiedByAdmin ? "verified" : "pending"} />
                  </div>

                  <AdminKeyValueList
                    items={[
                      { label: "Created", value: formatAdminDate(selected.createdAt) },
                      { label: "Last Moderated", value: formatAdminDate(selected.lastModeratedAt) },
                      {
                        label: "Verification",
                        value: `queue ${selected.verificationQueuePosition || "—"} · face ID ${selected.faceIdVerified ? "yes" : "no"}`
                      },
                      {
                        label: "Complaints",
                        value: `open ${selected.complaintsSummary?.open || 0} · resolved ${selected.complaintsSummary?.resolved || 0} · escalated ${selected.complaintsSummary?.escalated || 0}`
                      },
                      { label: "Catalog", value: `products ${selected.productsCount} · services ${selected.servicesCount}` }
                    ]}
                  />

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Linked listings</h3>
                    <div className="mt-3 space-y-2">
                      {selected.linkedListings?.length ? (
                        selected.linkedListings.slice(0, 5).map((listing) => (
                          <div key={listing.id} className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2">
                            <p className="text-sm text-slate-100">{listing.title}</p>
                            <p className="text-xs text-slate-500">
                              {listing.kind || "listing"} · {listing.status || "unknown"}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No linked services/products returned for this agent.</p>
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Internal notes & checklist</h3>
                    <p className="mt-2 text-sm text-slate-300">{selected.internalNotes || "No internal notes saved."}</p>
                    <p className="mt-3 text-xs text-slate-500">{summarizeList(selected.pendingChecklist)}</p>
                  </div>

                  {admin.can("agents.badge") ? (
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <label className="text-xs uppercase tracking-[0.16em] text-slate-500">Badge preset</label>
                      <select
                        value={badgeValue}
                        onChange={(event) => setBadgeValue(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                      >
                        <option value="trusted">Trusted</option>
                        <option value="top-rated">Top rated</option>
                        <option value="premium">Premium</option>
                      </select>
                    </div>
                  ) : null}

                  {canMutate ? (
                    <AdminActionPanel
                      title="Agent actions"
                      helperText="Verification, badge, suspension, and notes will include the audit reason in the backend action payload."
                      reason={reason}
                      note={note}
                      onReasonChange={setReason}
                      onNoteChange={setNote}
                      actions={actionOptions
                        .filter((action) => admin.can(action.permission))
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
                          ? "This admin can inspect agent records but cannot run verification or suspension actions."
                          : "Re-enter admin mode to verify, suspend, badge, or write notes for agents."
                      }
                    />
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-100">Status history</h3>
                    <AdminTimeline
                      items={selected.statusHistory?.length ? selected.statusHistory : selected.actionHistory}
                      emptyLabel="No status or action history returned for this agent."
                    />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select an agent to inspect verification and performance history.</p>
              )}
            </AdminDetailCard>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
