"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ordersMock,
  type OrderItem,
  type OrderStatus
} from "@/data/ordersMock";
import { useI18n } from "@/context/i18n";
import { Avatar } from "@/components/ui/Avatar";

type SummaryKey = "active" | "waiting" | "completed" | "issues";

const summaryMap: Record<SummaryKey, OrderStatus[]> = {
  active: ["in_progress"],
  waiting: ["pending"],
  completed: ["completed"],
  issues: ["dispute"]
};

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  delivered: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-700",
  dispute: "bg-rose-100 text-rose-800"
};

const paymentTone: Record<string, string> = {
  escrowed: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  released: "bg-slate-100 text-slate-700 border border-slate-200",
  refunded: "bg-rose-50 text-rose-700 border border-rose-200"
};

const actionsByStatus: Record<OrderStatus, Array<{ labelKey: string; href: (id: string) => string }>> = {
  pending: [{ labelKey: "myOrders.actions.cancel", href: (id) => `/my-orders/${id}?action=cancel` }],
  in_progress: [
    { labelKey: "myOrders.actions.chat", href: (id) => `/chat?order=${id}` },
    { labelKey: "myOrders.actions.upload", href: (id) => `/my-orders/${id}?tab=files` }
  ],
  delivered: [
    { labelKey: "myOrders.actions.review", href: (id) => `/my-orders/${id}?tab=review` },
    { labelKey: "myOrders.actions.revision", href: (id) => `/my-orders/${id}?action=revision` }
  ],
  completed: [
    { labelKey: "myOrders.actions.review", href: (id) => `/my-orders/${id}?tab=review` },
    { labelKey: "myOrders.actions.download", href: (id) => `/my-orders/${id}?tab=files` }
  ],
  cancelled: [{ labelKey: "myOrders.actions.support", href: (id) => `/chat?order=${id}` }],
  dispute: [{ labelKey: "myOrders.actions.support", href: (id) => `/chat?order=${id}` }]
};

const statusProgress: Record<OrderStatus, number> = {
  pending: 15,
  in_progress: 45,
  delivered: 70,
  completed: 100,
  cancelled: 35,
  dispute: 60
};

const timelineSteps = [
  "myOrders.timeline.placed",
  "myOrders.timeline.accepted",
  "myOrders.timeline.inProgress",
  "myOrders.timeline.delivered",
  "myOrders.timeline.approval",
  "myOrders.timeline.completed"
];

const notificationMap: Record<OrderStatus, string[]> = {
  pending: ["myOrders.notification.newMessage", "myOrders.notification.paymentProtected"],
  in_progress: ["myOrders.notification.newDelivery", "myOrders.notification.deadlineReminder"],
  delivered: ["myOrders.notification.waitingApproval", "myOrders.notification.reviewPrompt"],
  completed: ["myOrders.notification.reviewPrompt"],
  cancelled: ["myOrders.notification.cancellation"],
  dispute: ["myOrders.notification.dispute"]
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

const formatCurrency = (price: number, currency: string) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(price);

export default function MyOrdersPage() {
  const [statusFilter, setStatusFilter] = useState<SummaryKey | "all" | OrderStatus>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const { t } = useI18n();

  const summaryCounts = useMemo(() => {
    const counts: Record<SummaryKey, number> = { active: 0, waiting: 0, completed: 0, issues: 0 };
    ordersMock.forEach((order) => {
      (Object.keys(summaryMap) as SummaryKey[]).forEach((key) => {
        if (summaryMap[key].includes(order.status)) counts[key] += 1;
      });
    });
    return counts;
  }, []);

  const filteredOrders = useMemo(() => {
    let list: OrderItem[] = [...ordersMock];

    if (statusFilter !== "all") {
      const statuses =
        statusFilter === "active" || statusFilter === "waiting" || statusFilter === "completed" || statusFilter === "issues"
          ? summaryMap[statusFilter]
          : [statusFilter];
      list = list.filter((order) => statuses.includes(order.status));
    }

    if (categoryFilter !== "all") {
      list = list.filter((order) => order.category === categoryFilter);
    }

    if (dateRange !== "all") {
      const days = Number(dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      list = list.filter((order) => new Date(order.createdAt) >= cutoff);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      list = list.filter((order) =>
        [order.id, order.serviceTitle, order.agent.name].some((value) =>
          value.toLowerCase().includes(query)
        )
      );
    }

    return list;
  }, [statusFilter, categoryFilter, dateRange, search]);

  const handleSummaryClick = (key: SummaryKey) => {
    setStatusFilter(key === statusFilter ? "all" : key);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t("myOrders.title")}</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{t("myOrders.subtitle")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              {t("myOrders.trustNote")}{" "}
              <Link href="/trust-and-safety#payments" className="text-emerald-600 hover:underline">
                {t("myOrders.trustLink")}
              </Link>
            </p>
          </div>
          <Link
            href="/agents"
            className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:-translate-y-0.5 hover:bg-emerald-100"
          >
            {t("myOrders.cta.findService")}
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {(["active", "waiting", "completed", "issues"] as SummaryKey[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleSummaryClick(key)}
            className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${
              statusFilter === key
                ? "border-emerald-300 bg-emerald-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              {t(`myOrders.summary.${key}.desc`)}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{summaryCounts[key]}</p>
            <p className="mt-1 text-sm text-slate-600">{t(`myOrders.summary.${key}.title`)}</p>
          </button>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("myOrders.search.placeholder")}
            className="min-w-[220px] flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm focus:outline-emerald-400"
          />
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as SummaryKey | "all" | OrderStatus)
            }
            className="rounded-full border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">{t("myOrders.filter.status.all")}</option>
            <option value="active">{t("myOrders.filter.status.active")}</option>
            <option value="waiting">{t("myOrders.filter.status.waiting")}</option>
            <option value="completed">{t("myOrders.filter.status.completed")}</option>
            <option value="issues">{t("myOrders.filter.status.issues")}</option>
            <option value="pending">{t("myOrders.filter.status.pending")}</option>
            <option value="in_progress">{t("myOrders.filter.status.inProgress")}</option>
            <option value="delivered">{t("myOrders.filter.status.delivered")}</option>
            <option value="cancelled">{t("myOrders.filter.status.cancelled")}</option>
            <option value="dispute">{t("myOrders.filter.status.dispute")}</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">{t("myOrders.filter.category.all")}</option>
            <option value="consulting">{t("home.category.consulting.title")}</option>
            <option value="translation">{t("home.category.translation.title")}</option>
            <option value="legal">{t("home.category.legal.title")}</option>
            <option value="psychology">{t("home.category.psychology.title")}</option>
            <option value="sports">{t("home.category.sports.title")}</option>
            <option value="products">{t("home.category.products.title")}</option>
          </select>
          <select
            value={dateRange}
            onChange={(event) => setDateRange(event.target.value)}
            className="rounded-full border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="all">{t("myOrders.filter.date.all")}</option>
            <option value="7">{t("myOrders.filter.date.last7")}</option>
            <option value="30">{t("myOrders.filter.date.last30")}</option>
            <option value="90">{t("myOrders.filter.date.last90")}</option>
          </select>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">{t("myOrders.empty.title")}</p>
            <p className="mt-2 text-sm text-slate-500">{t("myOrders.empty.desc")}</p>
            <Link
              href="/agents"
              className="mt-4 inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-600"
            >
              {t("myOrders.empty.cta")}
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredOrders.map((order) => (
              <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                      {t("myOrders.orderIdLabel")}
                    </p>
                    <p className="text-lg font-semibold text-slate-900">{order.id}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[order.status]}`}>
                    {t(
                      order.status === "pending"
                        ? "myOrders.status.pending"
                        : order.status === "in_progress"
                          ? "myOrders.status.inProgress"
                          : order.status === "delivered"
                            ? "myOrders.status.delivered"
                            : order.status === "completed"
                              ? "myOrders.status.completed"
                              : order.status === "cancelled"
                                ? "myOrders.status.cancelled"
                                : "myOrders.status.dispute"
                    )}
                  </span>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1.1fr_0.8fr]">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("myOrders.agentLabel")}</p>
                    <div className="mt-3 flex items-center gap-3">
                      <Link href={`/agents/${order.agent.id}`} className="h-12 w-12 overflow-hidden rounded-full bg-slate-200">
                        <Avatar
                          src={order.agent.avatar}
                          alt={order.agent.name}
                          fallbackText={order.agent.name}
                          size={48}
                          className="h-full w-full border border-slate-300/60"
                        />
                      </Link>
                      <div>
                        <Link href={`/agents/${order.agent.id}`} className="text-sm font-semibold text-slate-900 hover:underline">
                          {order.agent.name}
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{order.agent.role}</span>
                          {order.agent.verified && (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                              {t("services.agent.verified")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("myOrders.orderInfoLabel")}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{order.serviceTitle}</p>
                    <div className="mt-2 space-y-1 text-xs text-slate-500">
                      <span>
                        {t("myOrders.createdLabel")}: {formatDate(order.createdAt)}
                      </span>
                      <span>
                        {t("myOrders.deadlineLabel")}: {formatDate(order.deadline)}
                      </span>
                      <span>
                        {t("myOrders.typeLabel")}:{" "}
                        {order.orderType === "hourly"
                          ? t("myOrders.type.hourly")
                          : t("myOrders.type.package")}
                      </span>
                    </div>
                    <div className="mt-3 h-1 w-full rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: `${statusProgress[order.status]}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {t("myOrders.progressLabel")}: {statusProgress[order.status]}% · {t("myOrders.progressSafety")}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("myOrders.paymentLabel")}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {formatCurrency(order.price, order.currency)}
                    </p>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold ${paymentTone[order.paymentStatus]}`}>
                      {t(
                        order.paymentStatus === "escrowed"
                          ? "myOrders.payment.escrowed"
                          : order.paymentStatus === "released"
                            ? "myOrders.payment.released"
                            : "myOrders.payment.refunded"
                      )}
                    </span>
                    {order.paymentStatus === "escrowed" && (
                      <p className="mt-2 text-xs text-emerald-700">{t("myOrders.payment.escrowNote")}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {notificationMap[order.status].map((note) => (
                    <span key={note} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {t(note)}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {actionsByStatus[order.status].map((action) => (
                    <Link
                      key={action.labelKey}
                      href={action.href(order.id)}
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300"
                    >
                      {t(action.labelKey as any)}
                    </Link>
                  ))}
                  <Link
                    href={`/my-orders/${order.id}`}
                    className="ml-auto rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                  >
                    {t("myOrders.actions.viewDetails")}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
