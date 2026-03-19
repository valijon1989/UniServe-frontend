"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getAdminControlCenter } from "@/api/adminEnterprise";
import type { AdminControlCenter, AdminDashboardQueueItem } from "@/types/admin";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { useAdminAccess } from "@/hooks/useAdminAccess";

const emptyState: AdminControlCenter = {
  cards: {
    totalUsers: 0,
    totalAgents: 0,
    activeListings: 0,
    pendingApprovals: 0,
    unresolvedReports: 0,
    todayOrders: 0,
    todayBookings: 0,
    paymentIssues: 0,
    suspiciousAccounts: 0,
    suspiciousActions: 0,
    systemStatus: "unknown"
  },
  queues: {},
  queueSummary: [],
  alerts: [],
  escalations: [],
  recentAdminActions: [],
  recentOrders: [],
  recentPayments: [],
  systemHealth: {
    api: null,
    moderation: null,
    storage: null,
    overall: null
  }
};

const cardConfig = [
  { id: "total-users", label: "Total Users", helper: "All non-admin user accounts", permissionAny: ["users.view", "users.read"] as const, getValue: (state: AdminControlCenter) => state.cards.totalUsers },
  { id: "total-agents", label: "Total Agents", helper: "Verified and pending agent profiles", permissionAny: ["agents.view", "agents.read"] as const, getValue: (state: AdminControlCenter) => state.cards.totalAgents },
  { id: "active-listings", label: "Active Listings", helper: "Live products and services", permissionAny: ["products.view", "services.view", "listings.read_all"] as const, getValue: (state: AdminControlCenter) => state.cards.activeListings },
  { id: "pending-approvals", label: "Pending Approvals", helper: "Listings and agents waiting for review", permissionAny: ["products.approve", "services.approve", "agents.verify"] as const, getValue: (state: AdminControlCenter) => state.cards.pendingApprovals },
  { id: "unresolved-reports", label: "Unresolved Reports", helper: "Open abuse and moderation workload", permissionAny: ["reports.view", "moderation.view", "community.moderate"] as const, getValue: (state: AdminControlCenter) => state.cards.unresolvedReports },
  { id: "today-orders", label: "Today Orders", helper: "Product orders created today", permissionAny: ["orders.view", "orders.read"] as const, getValue: (state: AdminControlCenter) => state.cards.todayOrders },
  { id: "today-bookings", label: "Today Bookings", helper: "Service bookings created today", permissionAny: ["orders.view", "orders.read"] as const, getValue: (state: AdminControlCenter) => state.cards.todayBookings },
  { id: "payment-issues", label: "Payment Issues", helper: "Failed, flagged, or open finance events", permissionAny: ["payments.view", "payments.read", "payments.manage"] as const, getValue: (state: AdminControlCenter) => state.cards.paymentIssues },
  { id: "suspicious-accounts", label: "Suspicious Accounts", helper: "Repeated offenders across users and agents", permissionAny: ["users.view", "agents.view", "reports.view"] as const, getValue: (state: AdminControlCenter) => state.cards.suspiciousAccounts },
  { id: "system-health", label: "System Health", helper: "API, moderation, and storage status", permissionAny: ["technical.view", "system.health.view"] as const, getValue: (state: AdminControlCenter) => state.cards.systemStatus }
];

const canViewQueue = (admin: ReturnType<typeof useAdminAccess>, item: AdminDashboardQueueItem) =>
  !item.permissionAny?.length || admin.canAny(item.permissionAny);

export default function AdminPage() {
  const admin = useAdminAccess();
  const [state, setState] = useState<AdminControlCenter>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAdminControlCenter()
      .then((next) => {
        if (!active) return;
        setState(next);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError((err as { message?: string })?.message || "Failed to load control center");
        setState(emptyState);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const visibleCards = useMemo(() => cardConfig.filter((item) => admin.canAny([...item.permissionAny])), [admin]);
  const visibleQueues = useMemo(() => state.queueSummary.filter((item) => canViewQueue(admin, item)), [admin, state.queueSummary]);
  const visibleAlerts = useMemo(() => state.alerts.filter((item) => !item.permissionAny?.length || admin.canAny(item.permissionAny)), [admin, state.alerts]);
  const visibleEscalations = useMemo(() => state.escalations.filter((item) => !item.permissionAny?.length || admin.canAny(item.permissionAny)), [admin, state.escalations]);
  const visibleRecentOrders = useMemo(() => (admin.canAny(["orders.view", "orders.read"]) ? state.recentOrders : []), [admin, state.recentOrders]);
  const visibleRecentPayments = useMemo(() => (admin.canAny(["payments.view", "payments.read"]) ? state.recentPayments : []), [admin, state.recentPayments]);

  return (
    <AdminPermissionGate permissionsAny={["dashboard.view", "dashboard.read"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Operational Control Center</h1>
              <p className="mt-1 max-w-3xl text-sm text-slate-400">
                Queue-first overview for approvals, reported entities, suspicious accounts, finance anomalies, and recent admin activity.
              </p>
            </div>
            <AdminStatusBadge value={state.systemHealth.overall || state.cards.systemStatus} />
          </div>
        </section>

        <AdminDataState loading={loading} error={error}>
          <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {visibleCards.map((item) => {
              const value = item.getValue(state);
              return (
                <article key={item.id} className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-2xl font-semibold text-slate-100">{value}</p>
                    {item.id === "system-health" ? <AdminStatusBadge value={String(value)} /> : null}
                  </div>
                  <p className="mt-2 text-xs text-slate-400">{item.helper}</p>
                </article>
              );
            })}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr,0.85fr]">
            <div className="space-y-4">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-100">Pending Queues</h2>
                    <p className="mt-1 text-sm text-slate-400">Approval, review, and escalation queues that need action today.</p>
                  </div>
                  <Link href="/admin/moderation" className="text-sm text-sky-300 hover:text-sky-200">
                    Open Moderation Center
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {visibleQueues.length ? (
                    visibleQueues.map((item) => {
                      const card = (
                        <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-100">{item.label}</p>
                            <span className="text-lg font-semibold text-slate-100">{item.count}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">{item.description || "Queue summary"}</p>
                        </div>
                      );
                      return item.href ? (
                        <Link key={item.id} href={item.href} className="block">
                          {card}
                        </Link>
                      ) : (
                        <div key={item.id}>{card}</div>
                      );
                    })
                  ) : (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-400">
                      No active queues are assigned to this admin scope.
                    </div>
                  )}
                </div>
              </article>

              <section className="grid gap-4 lg:grid-cols-2">
                <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <h2 className="text-lg font-semibold text-slate-100">Alerts</h2>
                  <div className="mt-4 space-y-3">
                    {visibleAlerts.length ? (
                      visibleAlerts.map((alert) => (
                        <Link
                          key={alert.id || `${alert.level}-${alert.title}`}
                          href={alert.href || "/admin"}
                          className="block rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-100">{alert.title}</p>
                            <AdminStatusBadge value={alert.level} />
                          </div>
                          {alert.description ? <p className="mt-2 text-xs text-slate-400">{alert.description}</p> : null}
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Count {alert.count}</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No live alerts for the current admin scope.</p>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <h2 className="text-lg font-semibold text-slate-100">Escalations</h2>
                  <div className="mt-4 space-y-3">
                    {visibleEscalations.length ? (
                      visibleEscalations.map((item) => (
                        <Link
                          key={item.id || `${item.level}-${item.title}`}
                          href={item.href || "/admin/moderation"}
                          className="block rounded-xl border border-slate-800 bg-slate-900/60 p-3"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-medium text-slate-100">{item.title}</p>
                            <AdminStatusBadge value={item.level} />
                          </div>
                          {item.description ? <p className="mt-2 text-xs text-slate-400">{item.description}</p> : null}
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Cases {item.count}</p>
                        </Link>
                      ))
                    ) : (
                      <p className="text-sm text-slate-400">No escalated cases in your current access scope.</p>
                    )}
                  </div>
                </article>
              </section>
            </div>

            <div className="space-y-4">
              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h2 className="text-lg font-semibold text-slate-100">Recent Admin Actions</h2>
                <div className="mt-4 space-y-3">
                  {state.recentAdminActions.length ? (
                    state.recentAdminActions.map((item) => (
                      <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-medium text-slate-100">{item.action}</p>
                          <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                        </div>
                        <p className="mt-2 text-xs text-slate-300">
                          {item.actorName || item.actorRole || "Admin"}
                          {item.entityType ? ` · ${item.entityType}` : ""}
                          {item.entityId ? ` #${item.entityId}` : ""}
                        </p>
                        {item.reason ? <p className="mt-1 text-xs text-slate-400">{item.reason}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No recent admin actions are visible with your current permissions.</p>
                  )}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <h2 className="text-lg font-semibold text-slate-100">System Health</h2>
                <div className="mt-4 grid gap-2">
                  {[
                    { label: "API", value: state.systemHealth.api || "unknown" },
                    { label: "Moderation", value: state.systemHealth.moderation || "unknown" },
                    { label: "Storage", value: state.systemHealth.storage || "unknown" }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                      <span className="text-sm text-slate-300">{item.label}</span>
                      <AdminStatusBadge value={item.value} />
                    </div>
                  ))}
                </div>
              </article>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Recent Orders & Bookings</h2>
              <div className="mt-4 space-y-3">
                {visibleRecentOrders.length ? (
                  visibleRecentOrders.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-100">{item.userName || "Unknown customer"}</p>
                        <AdminStatusBadge value={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.kind === "SERVICE" ? "Booking" : "Order"} · {item.total} {item.currency}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Order and booking activity is hidden for this admin scope.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Recent Payments</h2>
              <div className="mt-4 space-y-3">
                {visibleRecentPayments.length ? (
                  visibleRecentPayments.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-medium text-slate-100">{item.userName || "Unknown account"}</p>
                        <AdminStatusBadge value={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.amount} {item.currency}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Payment activity is hidden for this admin scope.</p>
                )}
              </div>
            </article>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
