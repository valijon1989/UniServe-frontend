"use client";

import { useEffect, useMemo, useState } from "react";
import { getAnalyticsOverview } from "@/api/adminEnterprise";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { AdminDataState } from "@/components/admin/AdminDataState";
import { AdminStatGrid } from "@/components/admin/AdminStatGrid";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import type { AnalyticsOverview } from "@/types/admin";

const emptyState: AnalyticsOverview = {
  summary: {
    newUsers30d: 0,
    newUsersDelta: 0,
    newAgents30d: 0,
    newAgentsDelta: 0,
    orders30d: 0,
    grossVolume30d: 0,
    paymentVolume30d: 0,
    completionRate: 0,
    paymentSuccessRate: 0
  },
  growth: { users: [], agents: [] },
  orders: [],
  complaints: { users: 0, agents: 0, posts: 0, groups: 0 },
  complaintRate: {
    users: { affected: 0, total: 0, rate: 0 },
    agents: { affected: 0, total: 0, rate: 0 },
    posts: { affected: 0, total: 0, rate: 0 },
    groups: { affected: 0, total: 0, rate: 0 }
  },
  categoryDemand: { products: [], services: [] },
  agentPerformance: [],
  listingPerformance: { products: [], services: [] },
  conversionTrends: {
    orders30d: { total: 0, completed: 0, disputed: 0, cancelled: 0 },
    payments30d: { total: 0, successful: 0, failed: 0, refunded: 0, flagged: 0 },
    rates: { orderCompletionRate: 0, disputeRate: 0, paymentSuccessRate: 0, paymentFailureRate: 0 }
  },
  moderationLoad: {
    pendingServices: 0,
    pendingAgentVerifications: 0,
    reportedPosts: 0,
    flaggedGroups: 0,
    openFinanceIssues: 0,
    disputedOrders: 0
  }
};

export default function AdminAnalyticsPage() {
  const [state, setState] = useState<AnalyticsOverview>(emptyState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getAnalyticsOverview()
      .then((next) => {
        if (!active) return;
        setState(next);
      })
      .catch((err: unknown) => {
        if (!active) return;
        setError((err as { message?: string })?.message || "Failed to load analytics");
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

  const complaintTotal = useMemo(
    () => state.complaints.users + state.complaints.agents + state.complaints.posts + state.complaints.groups,
    [state.complaints]
  );
  const latestUserGrowth = state.growth.users[state.growth.users.length - 1]?.count || 0;
  const latestAgentGrowth = state.growth.agents?.[state.growth.agents.length - 1]?.count || 0;
  const listingPerformance = useMemo(
    () => [...state.listingPerformance.products, ...state.listingPerformance.services].slice(0, 8),
    [state.listingPerformance.products, state.listingPerformance.services]
  );

  return (
    <AdminPermissionGate permission="analytics.view">
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <h1 className="text-xl font-semibold text-slate-100">Analytics</h1>
          <p className="mt-1 text-sm text-slate-400">
            User growth, agent performance, listing performance, complaint rate, conversion trends, and moderation workload.
          </p>
        </section>

        <AdminDataState loading={loading} error={error}>
          <AdminStatGrid
            items={[
              { label: "User Growth", value: latestUserGrowth, helper: `${state.summary.newUsers30d} users in 30d` },
              { label: "Agent Growth", value: latestAgentGrowth, helper: `${state.summary.newAgents30d} agents in 30d` },
              { label: "Complaints", value: complaintTotal, helper: "users + agents + community" },
              {
                label: "Completion Rate",
                value: `${state.conversionTrends.rates.orderCompletionRate.toFixed(1)}%`,
                helper: `${state.summary.orders30d} orders in 30d`
              }
            ]}
          />

          <section className="grid gap-4 xl:grid-cols-2">
            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">User & Agent Growth</h2>
              <div className="mt-4 space-y-2">
                {[...state.growth.users.slice(-7)].map((item, index) => (
                  <div key={`user-${item._id}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <span className="text-sm text-slate-300">{item._id}</span>
                    <span className="text-sm text-slate-100">{item.count}</span>
                  </div>
                ))}
                {state.growth.agents?.slice(-3).map((item, index) => (
                  <div key={`agent-${item._id}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2">
                    <span className="text-sm text-slate-400">agent {item._id}</span>
                    <span className="text-sm text-slate-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Complaint Rate</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  ["Users", state.complaintRate.users.rate, state.complaints.users],
                  ["Agents", state.complaintRate.agents.rate, state.complaints.agents],
                  ["Posts", state.complaintRate.posts.rate, state.complaints.posts],
                  ["Groups", state.complaintRate.groups.rate, state.complaints.groups]
                ].map(([label, rate, count]) => (
                  <div key={label} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-100">{Number(rate).toFixed(1)}%</p>
                    <p className="mt-1 text-xs text-slate-500">{count} complaints</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Agent Performance</h2>
              <div className="mt-4 space-y-2">
                {state.agentPerformance.length ? (
                  state.agentPerformance.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-slate-100">{item.name}</p>
                        <AdminStatusBadge value={`${item.rating.toFixed(1)} rating`} tone="neutral" />
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        response {item.responseRate}% · complaints {item.complaints}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No agent performance data returned.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Listing Performance</h2>
              <div className="mt-4 space-y-2">
                {listingPerformance.length ? (
                  listingPerformance.map((item) => (
                    <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-slate-100">{item.title}</p>
                        {item.status ? <AdminStatusBadge value={item.status} /> : null}
                      </div>
                      <p className="mt-2 text-xs text-slate-400">
                        orders {item.orders || 0} · views {item.views || 0} · likes {item.likes || 0}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No listing performance data returned.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Conversion Trends</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Orders 30d</p>
                  <p className="mt-2 text-sm text-slate-300">
                    total {state.conversionTrends.orders30d.total} · completed {state.conversionTrends.orders30d.completed}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    disputed {state.conversionTrends.orders30d.disputed} · cancelled {state.conversionTrends.orders30d.cancelled}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Payments 30d</p>
                  <p className="mt-2 text-sm text-slate-300">
                    total {state.conversionTrends.payments30d.total} · successful {state.conversionTrends.payments30d.successful}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    failed {state.conversionTrends.payments30d.failed} · refunded {state.conversionTrends.payments30d.refunded}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Order completion</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">
                    {state.conversionTrends.rates.orderCompletionRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Payment success</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-100">
                    {state.conversionTrends.rates.paymentSuccessRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <h2 className="text-lg font-semibold text-slate-100">Moderation Workload</h2>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>Pending services: {state.moderationLoad.pendingServices}</p>
                <p>Pending agent verifications: {state.moderationLoad.pendingAgentVerifications}</p>
                <p>Reported posts: {state.moderationLoad.reportedPosts}</p>
                <p>Flagged groups: {state.moderationLoad.flaggedGroups}</p>
                <p>Open finance issues: {state.moderationLoad.openFinanceIssues}</p>
                <p>Disputed orders: {state.moderationLoad.disputedOrders}</p>
              </div>
              <h3 className="mt-6 text-sm font-semibold text-slate-100">Category Demand</h3>
              <div className="mt-3 space-y-2">
                {[...state.categoryDemand.products, ...state.categoryDemand.services].slice(0, 8).map((item, index) => (
                  <div key={`${item._id}-${index}`} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
                    <span className="text-sm text-slate-300">{item._id || "uncategorized"}</span>
                    <span className="text-sm text-slate-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </AdminDataState>
      </div>
    </AdminPermissionGate>
  );
}
