"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getOperationalOrders, updateOperationalOrder } from "@/api/adminEnterprise";
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
import { formatAdminCurrency, formatAdminDate } from "@/lib/adminFormatters";
import type { OperationalOrderItem } from "@/types/admin";

const statusActions = [
  { id: "PROCESSING", label: "Mark processing", tone: "default" as const },
  { id: "COMPLETED", label: "Complete", tone: "primary" as const },
  { id: "CANCELLED", label: "Cancel", tone: "danger" as const },
  { id: "DISPUTED", label: "Open dispute", tone: "danger" as const },
  { id: "REFUNDED", label: "Refund", tone: "danger" as const }
];

export default function AdminOrdersPage() {
  const admin = useAdminAccess();
  const [items, setItems] = useState<OperationalOrderItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kindFilter, setKindFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getOperationalOrders({
        page: 1,
        limit: 100,
        kind: kindFilter === "all" ? undefined : kindFilter,
        status: statusFilter === "all" ? undefined : statusFilter
      });
      setItems(res.items);
      setSelectedId((current) => {
        if (current && res.items.some((item) => item.id === current)) return current;
        return res.items[0]?.id || null;
      });
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to load orders");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [kindFilter, statusFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const selected = useMemo(() => items.find((item) => item.id === selectedId) || null, [items, selectedId]);

  const stats = useMemo(() => {
    return {
      total: items.length,
      disputed: items.filter((item) => item.status === "DISPUTED").length,
      refunded: items.filter((item) => item.status === "REFUNDED").length,
      bookings: items.filter((item) => item.kind.toLowerCase().includes("service")).length
    };
  }, [items]);

  const canManage = admin.requireFreshMode() && admin.can("orders.manage");

  const handleStatus = async (status: string) => {
    if (!selected) return;
    setProcessingKey(status);
    try {
      await updateOperationalOrder(selected.id, {
        status,
        note: note.trim() || undefined,
        reason: reason.trim(),
        disputeReason: status === "DISPUTED" ? reason.trim() : undefined,
        refundReason: status === "REFUNDED" ? reason.trim() : undefined
      });
      toast.success(`Order status updated: ${status}`);
      setReason("");
      setNote("");
      await load();
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Order update failed");
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["orders.view", "orders.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h1 className="text-xl font-semibold text-slate-100">Orders & Bookings</h1>
              <p className="mt-1 text-sm text-slate-400">
                Product orders and service bookings with status tracking, linked parties, listing details, disputes, refunds, and payment state.
              </p>
            </div>
            <div className="grid gap-2 sm:min-w-[320px] sm:grid-cols-2">
              <select
                value={kindFilter}
                onChange={(event) => setKindFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">All types</option>
                <option value="product">Product orders</option>
                <option value="service">Service bookings</option>
              </select>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="all">All statuses</option>
                <option value="PENDING_PAYMENT">Pending payment</option>
                <option value="PAID">Paid</option>
                <option value="PROCESSING">Processing</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPUTED">Disputed</option>
                <option value="REFUNDED">Refunded</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </section>

        <AdminSegmentedTabs
          value={kindFilter}
          onChange={setKindFilter}
          items={[
            { id: "all", label: "All", count: stats.total },
            {
              id: "product",
              label: "Product orders",
              count: items.filter((item) => item.kind.toLowerCase().includes("product")).length
            },
            { id: "service", label: "Service bookings", count: stats.bookings }
          ]}
        />

        <AdminStatGrid
          items={[
            { label: "Total", value: stats.total },
            { label: "Disputed", value: stats.disputed },
            { label: "Refunded", value: stats.refunded },
            { label: "Completed", value: items.filter((item) => item.status === "COMPLETED").length }
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
                    key: "record",
                    label: "Order / Booking",
                    render: (item) => (
                      <div>
                        <p className="font-medium text-slate-100">{item.listing?.title || item.id}</p>
                        <p className="text-xs text-slate-400">
                          {item.kind} · {item.source}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">{item.id}</p>
                      </div>
                    )
                  },
                  {
                    key: "parties",
                    label: "Linked User / Agent",
                    className: "w-[200px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>user {item.user?.name || "—"}</p>
                        <p>agent {item.agent?.name || "—"}</p>
                      </div>
                    )
                  },
                  {
                    key: "status",
                    label: "Status",
                    className: "w-[180px]",
                    render: (item) => (
                      <div className="space-y-2">
                        <AdminStatusBadge value={item.status} />
                        {item.paymentState ? <AdminStatusBadge value={item.paymentState} /> : null}
                      </div>
                    )
                  },
                  {
                    key: "finance",
                    label: "Dispute / Refund",
                    className: "w-[190px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>dispute {item.disputeState || "—"}</p>
                        <p>refund {item.refundState || "—"}</p>
                        <p>payments {item.payments.length}</p>
                      </div>
                    )
                  },
                  {
                    key: "amount",
                    label: "Total",
                    className: "w-[150px]",
                    render: (item) => (
                      <div className="text-xs text-slate-300">
                        <p>{formatAdminCurrency(item.total, item.currency)}</p>
                        <p className="mt-1 text-slate-500">{formatAdminDate(item.createdAt)}</p>
                      </div>
                    )
                  }
                ]}
              />
            </div>

            <AdminDetailCard title={selected?.listing?.title || selected?.id || "Order detail"} subtitle={selected ? `${selected.kind} workflow` : "Select an order"}>
              {selected ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminStatusBadge value={selected.status} />
                    {selected.paymentState ? <AdminStatusBadge value={selected.paymentState} /> : null}
                    {selected.refundState ? <AdminStatusBadge value={selected.refundState} /> : null}
                    {selected.disputeState ? <AdminStatusBadge value={selected.disputeState} /> : null}
                  </div>

                  <AdminKeyValueList
                    items={[
                      { label: "User", value: selected.user?.name || "—" },
                      { label: "Agent", value: selected.agent?.name || "—" },
                      { label: "Listing", value: selected.listing?.title || "—" },
                      { label: "Amount", value: formatAdminCurrency(selected.total, selected.currency) },
                      { label: "Created", value: formatAdminDate(selected.createdAt) },
                      { label: "Booking At", value: formatAdminDate(selected.bookingAt) }
                    ]}
                  />

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Finance and dispute state</h3>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Dispute</p>
                        <p className="mt-2 text-sm text-slate-300">{selected.disputeReason || "No active dispute reason."}</p>
                      </div>
                      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Refund</p>
                        <p className="mt-2 text-sm text-slate-300">{selected.refundReason || "No refund reason recorded."}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                    <h3 className="text-sm font-semibold text-slate-100">Linked payments</h3>
                    <div className="mt-3 space-y-2">
                      {selected.payments.length ? (
                        selected.payments.map((payment) => (
                          <div key={payment.id} className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm text-slate-100">{payment.provider}</p>
                              <AdminStatusBadge value={payment.status} />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">{formatAdminCurrency(payment.amount, selected.currency)}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400">No payment records linked to this order.</p>
                      )}
                    </div>
                  </div>

                  {canManage ? (
                    <AdminActionPanel
                      title="Order workflow actions"
                      helperText="Every state transition is submitted with an audit reason; disputes and refunds reuse the same reason for backend traceability."
                      reason={reason}
                      note={note}
                      onReasonChange={setReason}
                      onNoteChange={setNote}
                      actions={statusActions.map((action) => ({
                        id: action.id,
                        label: action.label,
                        tone: action.tone,
                        loading: processingKey === action.id,
                        onClick: () => void handleStatus(action.id)
                      }))}
                    />
                  ) : (
                    <AdminAccessDeniedState
                      title="Read-only access"
                      description={
                        admin.requireFreshMode()
                          ? "This admin can inspect order workflows but cannot apply status transitions."
                          : "Re-enter admin mode to resolve disputes, mark refunds, or update order status."
                      }
                    />
                  )}

                  <div>
                    <h3 className="mb-3 text-sm font-semibold text-slate-100">Status timeline</h3>
                    <AdminTimeline items={selected.timeline} emptyLabel="No workflow timeline returned for this order." />
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-400">Select an order to inspect linked entities and actions.</p>
              )}
            </AdminDetailCard>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
