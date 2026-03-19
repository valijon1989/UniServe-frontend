"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getOperationalPayments, reviewOperationalPayment } from "@/api/adminEnterprise";
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
import { formatAdminCurrency, formatAdminDate, summarizeList } from "@/lib/adminFormatters";
import type { AdminPermission, OperationalPaymentItem } from "@/types/admin";

const actionOptions: Array<{
  id: string;
  label: string;
  permission: AdminPermission;
  tone: "default" | "danger" | "primary";
}> = [
  { id: "mark_reviewed", label: "Mark reviewed", permission: "payments.manage", tone: "primary" },
  { id: "flag", label: "Flag payment", permission: "payments.manage", tone: "danger" },
  { id: "clear_flag", label: "Clear flag", permission: "payments.manage", tone: "default" },
  { id: "approve_refund", label: "Approve refund", permission: "refunds.manage", tone: "danger" },
  { id: "approve_payout", label: "Approve payout", permission: "payouts.approve", tone: "primary" },
  { id: "escalate", label: "Escalate finance issue", permission: "payments.manage", tone: "danger" }
];

const matchesSegment = (item: OperationalPaymentItem, segment: string) => {
  if (segment === "all") return true;
  if (segment === "refunds") return item.kind.toLowerCase().includes("refund") || Boolean(item.refund);
  if (segment === "payouts") return item.kind.toLowerCase().includes("payout") || Boolean(item.payout);
  if (segment === "failed") return item.status === "FAILED";
  if (segment === "suspicious") return item.riskLevel.toLowerCase() === "high" || item.financeStatus === "ESCALATED";
  return item.kind.toLowerCase().includes(segment);
};

export default function AdminPaymentsPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<OperationalPaymentItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [segment, setSegment] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOperationalPayments({
        page: 1,
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter
      });
      const nextItems = res.items.filter((item) => matchesSegment(item, segment));
      setItems(nextItems);
      setSelectedId((current) => {
        if (current && nextItems.some((item) => item.id === current)) return current;
        return nextItems[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load payments");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [segment, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);
  const canManage = admin.requireFreshMode() && admin.canAny(["payments.manage", "refunds.manage", "payouts.approve"]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      flagged: items.filter((item) => item.status === "FLAGGED").length,
      failed: items.filter((item) => item.status === "FAILED").length,
      suspicious: items.filter((item) => item.riskLevel.toLowerCase() === "high" || item.financeStatus === "ESCALATED").length
    };
  }, [items]);

  const handleAction = async (action: string) => {
    if (!selected) return;
    setProcessingKey(action);
    try {
      await reviewOperationalPayment(selected.id, {
        action,
        confirmed: true,
        note: note.trim() || undefined,
        reason: reason.trim()
      });
      toast.success(`Payment action applied: ${action}`);
      setReason("");
      setNote("");
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Payment action failed");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["payments.view", "payments.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Payments</h1>
              <p className="mt-1 text-sm text-slate-400">
                Transactions, payouts, refunds, failed payments, suspicious finance issues, and finance permission controls.
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
            >
              <option value="all">All statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="FLAGGED">Flagged</option>
              <option value="REFUNDED">Refunded</option>
            </select>
          </div>
        </section>

        <AdminSegmentedTabs
          value={segment}
          onChange={setSegment}
          items={[
            { id: "all", label: "All", count: stats.total },
            { id: "transaction", label: "Transactions", count: items.filter((item) => item.kind.toLowerCase().includes("transaction")).length },
            { id: "payouts", label: "Payouts", count: items.filter((item) => item.kind.toLowerCase().includes("payout") || item.payout).length },
            { id: "refunds", label: "Refunds", count: items.filter((item) => item.kind.toLowerCase().includes("refund") || item.refund).length },
            { id: "failed", label: "Failed", count: stats.failed },
            { id: "suspicious", label: "Suspicious", count: stats.suspicious }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Flagged", value: stats.flagged },
            { label: "Failed", value: stats.failed },
            { label: "Escalated", value: items.filter((item) => item.financeStatus === "ESCALATED").length }
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
                    key: "transaction",
                    label: "Transaction",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.transactionId || item.id}</p>
                        <p className="text-xs text-slate-400">
                          {item.provider} · {item.paymentMethod || item.kind}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{formatAdminDate(item.createdAt)}</p>
                      </div>
                    )
                  },
                  {
                    key: "linked",
                    label: "Linked User / Order",
                    className: "w-[210px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>user {item.user?.name || "—"}</p>
                        <p>order {item.order?.id || "—"}</p>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "w-[190px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.status} />
                        <AdminStatusBadge value={item.financeStatus} />
                        <AdminStatusBadge value={item.riskLevel} />
                      </div>
                    )
                  },
                  {
                    key: "amount",
                    label: "Amount",
                    className: "w-[160px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{formatAdminCurrency(item.amount, item.currency)}</p>
                        <p className="mt-1 text-slate-500">{item.kind}</p>
                      </div>
                    )
                  },
                  {
                    key: "signals",
                    label: "Signals",
                    className: "w-[220px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{summarizeList(item.suspiciousSignals)}</p>
                        <p className="mt-1 text-slate-500">{item.failureCode || item.note || "No extra finance note"}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            <AdminDetailCard title={selected?.transactionId || selected?.id || "Payment detail"} subtitle={selected?.provider || "Select a payment"}>
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={selected.status} />
                    <AdminStatusBadge value={selected.financeStatus} />
                    <AdminStatusBadge value={selected.riskLevel} />
                  </div>

                  <AdminKeyValueList
                    items={[
                      { label: "Amount", value: formatAdminCurrency(selected.amount, selected.currency) },
                      { label: "User", value: selected.user?.name || "—" },
                      { label: "Order", value: selected.order?.id || "—" },
                      { label: "Method", value: selected.paymentMethod || "—" },
                      { label: "Failure Code", value: selected.failureCode || "—" },
                      { label: "Created", value: formatAdminDate(selected.createdAt) }
                    ]}
                  />

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Refund / payout state</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Refund</p>
                        <p className="mt-2 text-sm text-slate-300">
                          {selected.refund
                            ? `${selected.refund.id} · ${selected.refund.status || "pending"}`
                            : "No refund object linked."}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Payout</p>
                        <p className="mt-2 text-sm text-slate-300">
                          {selected.payout
                            ? `${selected.payout.id} · ${selected.payout.status || "pending"}`
                            : "No payout object linked."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Suspicious signals</h3>
                    <p className="mt-2 text-sm text-slate-300">{summarizeList(selected.suspiciousSignals, 6)}</p>
                    <p className="mt-2 text-xs text-slate-500">{selected.note || "No finance note recorded."}</p>
                  </div>

                  {canManage ? (
                    <AdminActionPanel
                      title="Finance actions"
                      helperText="Buttons are permission-filtered. Refund and payout actions stay hidden unless the current admin has the corresponding finance permission."
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
                          loading: processingKey === action.id,
                          onClick: () => void handleAction(action.id)
                        }))}
                    />
                  ) : (
                    <AdminAccessDeniedState
                      title="Read-only access"
                      description={
                        admin.requireFreshMode()
                          ? "This admin can inspect finance records but cannot run payment, refund, or payout actions."
                          : "Re-enter admin mode to review payments, clear flags, approve refunds, or escalate suspicious finance issues."
                      }
                    />
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-100">Review history</h3>
                    <AdminTimeline items={selected.history} emptyLabel="No finance review history returned for this payment." />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select a payment to inspect finance controls and review actions.</p>
              )}
            </AdminDetailCard>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
