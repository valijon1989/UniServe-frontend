"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { applyModerationCenterAction, getModerationCenter } from "@/api/adminEnterprise";
import type { AdminDashboardQueueItem, ModerationCenterItem } from "@/types/admin";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminDetailCard } from "@/components/admin/AdminDetailCard";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { useAdminAccess } from "@/hooks/useAdminAccess";

export default function AdminModerationPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<ModerationCenterItem[]>([]);
  const [summary, setSummary] = useState<AdminDashboardQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moduleFilter, setModuleFilter] = useState("");
  const [sort, setSort] = useState("urgent");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [unresolvedOnly, setUnresolvedOnly] = useState(true);
  const [escalatedOnly, setEscalatedOnly] = useState(false);
  const [repeatedOnly, setRepeatedOnly] = useState(false);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const itemKey = (item: Pick<ModerationCenterItem, "module" | "entityType" | "id">) => `${item.module}:${item.entityType}:${item.id}`;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getModerationCenter({
        page: 1,
        limit: 100,
        module: moduleFilter || undefined,
        sort,
        urgent: urgentOnly || undefined,
        unresolved: unresolvedOnly || undefined,
        escalated: escalatedOnly || undefined,
        repeatedOffender: repeatedOnly || undefined
      });
      setItems(res.items);
      setSummary(res.summary);
      setSelectedKey((current) => current || (res.items[0] ? itemKey(res.items[0]) : null));
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load moderation center");
      setItems([]);
      setSummary([]);
    } finally {
      setLoading(false);
    }
  }, [escalatedOnly, moduleFilter, repeatedOnly, sort, unresolvedOnly, urgentOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!items.length) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey((current) => (current && items.some((item) => itemKey(item) === current) ? current : itemKey(items[0])));
  }, [items]);

  const selected = useMemo(() => items.find((item) => itemKey(item) === selectedKey) || null, [items, selectedKey]);
  const selectedActions = useMemo(() => {
    if (!selected) return [];
    return selected.actions.filter((action) => {
      if (selected.module === "products") {
        if (action === "approve") return admin.canAny(["products.approve", "listings.moderate"]);
        return admin.canAny(["products.reject", "listings.moderate"]);
      }
      if (selected.module === "services") {
        if (action === "approve") return admin.canAny(["services.approve", "listings.moderate"]);
        if (action === "reject" || action === "request_changes" || action === "hide") return admin.canAny(["services.reject", "listings.moderate"]);
      }
      if (selected.module === "community" || selected.module === "content") {
        if (action === "resolve") return admin.canAny(["reports.resolve", "community.moderate", "content.moderate"]);
        if (action === "hide" || action === "restore") {
          return admin.canAny(["community.moderate", "groups.moderate", "posts.moderate", "content.moderate"]);
        }
        if (action === "warn") return admin.can("users.warn");
        if (action === "escalate") return admin.canAny(["escalations.manage", "community.moderate", "content.moderate", "reports.resolve"]);
      }
      if (selected.module === "users") {
        if (action === "warn") return admin.can("users.warn");
        if (action === "suspend" || action === "resolve") return admin.can("users.suspend");
        if (action === "ban") return admin.can("users.ban");
      }
      if (selected.module === "agents") {
        if (action === "verify" || action === "resolve") return admin.can("agents.verify");
        if (action === "suspend") return admin.can("agents.suspend");
        if (action === "note" || action === "request_changes") return admin.canAny(["agents.note", "agents.verify"]);
      }
      if (selected.module === "payments") {
        if (action === "mark_reviewed" || action === "flag" || action === "clear_flag" || action === "resolve") {
          return admin.can("payments.manage");
        }
        if (action === "approve_refund") return admin.can("refunds.manage");
        if (action === "escalate") return admin.canAny(["payments.manage", "escalations.manage"]);
      }
      return true;
    });
  }, [admin, selected]);

  const stats = useMemo(() => {
    return {
      highRisk: items.filter((item) => item.riskLevel === "high").length,
      unresolved: items.length,
      escalated: items.filter((item) => item.flags.escalated).length,
      repeated: items.filter((item) => item.flags.repeatedOffender).length
    };
  }, [items]);

  const visibleSummary = useMemo(
    () => summary.filter((item) => !item.permissionAny?.length || admin.canAny(item.permissionAny)),
    [admin, summary]
  );

  const handleAction = async (item: ModerationCenterItem, action: string) => {
    const key = `${item.module}:${item.id}:${action}`;
    setProcessingKey(key);
    try {
      const requiresReason = ["reject", "request_changes", "suspend", "ban", "escalate", "flag"].includes(action);
      const requiresConfirmation = ["approve_refund", "ban", "suspend", "hide", "reject"].includes(action);
      const reason = requiresReason ? window.prompt(`Reason for "${action.replace(/_/g, " ")}"`, selected?.reason || "") || undefined : undefined;
      const note = action === "request_changes" || action === "note" ? window.prompt("Internal note", selected?.internalNotes?.[0] || "") || undefined : undefined;

      if (requiresConfirmation && !window.confirm(`Apply "${action.replace(/_/g, " ")}" to "${item.title}"?`)) {
        return;
      }
      await applyModerationCenterAction({
        id: item.id,
        module: item.module,
        entityType: item.entityType,
        action,
        reason,
        note
      });
      toast.success(`Action applied: ${action}`);
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Action failed");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["moderation.view", "reports.view", "community.moderate", "content.moderate", "listings.moderate"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Moderation Center</h1>
              <p className="mt-1 text-sm text-slate-400">
                Unified queue for product approvals, service approvals, agent verification, reported entities, media violations, and escalations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={moduleFilter}
                onChange={(event) => setModuleFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="">All modules</option>
                <option value="products">Products</option>
                <option value="services">Services</option>
                <option value="agents">Agents</option>
                <option value="users">Users</option>
                <option value="community">Community</option>
                <option value="content">Content</option>
                <option value="payments">Payments</option>
              </select>
              <select
                value={sort}
                onChange={(event) => setSort(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="urgent">Urgent</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { label: "Urgent", active: urgentOnly, setActive: setUrgentOnly },
              { label: "Unresolved", active: unresolvedOnly, setActive: setUnresolvedOnly },
              { label: "Escalated", active: escalatedOnly, setActive: setEscalatedOnly },
              { label: "Repeated offender", active: repeatedOnly, setActive: setRepeatedOnly }
            ].map((filter) => (
              <button
                key={filter.label}
                type="button"
                onClick={() => filter.setActive(!filter.active)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  filter.active
                    ? "border-sky-500/50 bg-sky-500/10 text-sky-200"
                    : "border-slate-700 bg-slate-900/70 text-slate-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </section>

        <AdminStatGrid
          items={[
            { label: "High Risk", value: stats.highRisk },
            { label: "Unresolved", value: stats.unresolved },
            { label: "Escalated", value: stats.escalated },
            { label: "Repeated", value: stats.repeated }
          ]}
        />

        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {visibleSummary.map((item) => (
            <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-slate-100">{item.count}</p>
            </article>
          ))}
        </section>

        <AdminDataState
          loading={loading}
          error={error}
          empty={!items.length}
          emptyTitle="No moderation cases match the current filters."
          emptyDescription="Try clearing one or more queue filters to widen the moderation view."
        >
          <section className="grid gap-4 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <button
                    key={itemKey(item)}
                    type="button"
                    onClick={() => setSelectedKey(itemKey(item))}
                    className={`w-full rounded-xl border p-3 text-left ${
                      selectedKey === itemKey(item) ? "border-sky-500/50 bg-sky-500/10" : "border-slate-800 bg-slate-900/60"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{item.queueLabel}</p>
                        <p className="mt-1 text-sm font-medium text-slate-100">{item.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <AdminStatusBadge value={item.status} />
                        <AdminStatusBadge value={item.riskLevel} />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-slate-400">
                      {item.module} · reports {item.reportCount}
                      {item.ownerName ? ` · ${item.ownerName}` : ""}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.flags.urgent ? <AdminStatusBadge value="urgent" /> : null}
                      {item.flags.escalated ? <AdminStatusBadge value="escalated" /> : null}
                      {item.flags.repeatedOffender ? <AdminStatusBadge value="high" /> : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <AdminDetailCard
              title={selected?.title || "No selection"}
              subtitle={selected ? `${selected.queueLabel} · ${selected.entityType}` : "Choose an item from the queue"}
            >
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={selected.queueLabel} tone="neutral" />
                    <AdminStatusBadge value={selected.status} />
                    <AdminStatusBadge value={selected.riskLevel} />
                    {selected.flags.escalated ? <AdminStatusBadge value="escalated" /> : null}
                    {selected.flags.repeatedOffender ? <AdminStatusBadge value="high" /> : null}
                  </div>

                  {selected.preview?.summary ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-sm text-slate-300">
                      {selected.preview.summary}
                    </div>
                  ) : null}

                  <div className="grid gap-2 text-sm text-slate-300">
                    <p>Owner: {selected.ownerName || "—"}</p>
                    <p>Reports: {selected.reportCount}</p>
                    <p>Reason: {selected.reason || "—"}</p>
                    <p>Created: {new Date(selected.createdAt).toLocaleString()}</p>
                    {selected.updatedAt ? <p>Updated: {new Date(selected.updatedAt).toLocaleString()}</p> : null}
                  </div>

                  {selected.detailRows?.length ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Item Preview</p>
                      <div className="mt-3 grid gap-2">
                        {selected.detailRows.map((row) => (
                          <div key={`${row.label}-${row.value}`} className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-400">{row.label}</span>
                            <span className="text-right text-slate-200">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {selected.linkedEntity ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Linked Entity</p>
                      <p className="mt-2 text-sm font-medium text-slate-100">{selected.linkedEntity.label}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {selected.linkedEntity.type}
                        {selected.linkedEntity.subtitle ? ` · ${selected.linkedEntity.subtitle}` : ""}
                      </p>
                    </div>
                  ) : null}

                  {selected.internalNotes.length ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Internal Notes</p>
                      <div className="mt-3 space-y-2">
                        {selected.internalNotes.map((note) => (
                          <p key={note} className="text-sm text-slate-300">
                            {note}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Moderation History</p>
                    <div className="mt-3 space-y-3">
                      {selected.history.length ? (
                        selected.history.map((entry) => (
                          <div key={entry.id} className="border-l border-slate-700 pl-3">
                            <p className="text-sm font-medium text-slate-100">{entry.action}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              {entry.actor?.name || entry.actor?.role || "Admin"} · {new Date(entry.createdAt).toLocaleString()}
                            </p>
                            {entry.reason || entry.note ? (
                              <p className="mt-1 text-xs text-slate-500">{entry.reason || entry.note}</p>
                            ) : null}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No prior moderation history for this entity.</p>
                      )}
                    </div>
                  </div>

                  <div className="sticky bottom-0 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-950/95 pt-2">
                    {selectedActions.map((action) => {
                      const key = `${selected.module}:${selected.id}:${action}`;
                      return (
                        <button
                          key={action}
                          type="button"
                          onClick={() => void handleAction(selected, action)}
                          disabled={processingKey === key}
                          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:opacity-50"
                        >
                          {processingKey === key ? "Working…" : action.replace(/_/g, " ")}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select queue item to inspect details.</p>
              )}
            </AdminDetailCard>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
