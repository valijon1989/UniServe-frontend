"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ordersMock, type OrderItem, type OrderStatus } from "@/data/ordersMock";
import { useI18n } from "@/context/i18n";
import { Avatar } from "@/components/ui/Avatar";

const statusTone: Record<OrderStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  in_progress: "bg-sky-100 text-sky-800",
  delivered: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-700",
  dispute: "bg-rose-100 text-rose-800"
};

const timelineSteps: Array<{ key: string }> = [
  { key: "placed" },
  { key: "accepted" },
  { key: "in_progress" },
  { key: "delivered" },
  { key: "approval" },
  { key: "completed" }
];

const statusProgress: Record<OrderStatus, number> = {
  pending: 1,
  in_progress: 2,
  delivered: 3,
  completed: 5,
  cancelled: 2,
  dispute: 3
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("overview");
  const order = useMemo<OrderItem | undefined>(() => ordersMock.find((item) => item.id === params.id), [params.id]);
  const { t } = useI18n();

  if (!order) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
        <p className="text-lg font-semibold text-slate-900">{t("orderDetail.notFound.title")}</p>
        <p className="mt-2 text-sm text-slate-500">{t("orderDetail.notFound.desc")}</p>
        <Link
          href="/my-orders"
          className="mt-4 inline-flex rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-white"
        >
          {t("orderDetail.notFound.cta")}
        </Link>
      </div>
    );
  }

  const progressIndex = statusProgress[order.status];

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/my-orders" className="text-xs uppercase tracking-[0.2em] text-slate-400 hover:underline">
              {t("orderDetail.back")}
            </Link>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">{order.serviceTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{t("orderDetail.orderId")}: {order.id}</p>
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

        <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
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
              <Link
                href={`/chat?order=${order.id}`}
                className="ml-auto rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-emerald-300"
              >
                {t("orderDetail.chat.cta")}
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("myOrders.paymentLabel")}</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {order.price} {order.currency}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              {t("myOrders.paymentLabel")}: {t(
                order.paymentStatus === "escrowed"
                  ? "myOrders.payment.escrowed"
                  : order.paymentStatus === "released"
                    ? "myOrders.payment.released"
                    : "myOrders.payment.refunded"
              )}
            </p>
            <p className="mt-2 text-xs text-emerald-700">{t("orderDetail.paymentProtected")}</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "overview", label: t("orderDetail.tabs.overview") },
            { key: "chat", label: t("orderDetail.tabs.chat") },
            { key: "files", label: t("orderDetail.tabs.files") },
            { key: "payments", label: t("orderDetail.tabs.payments") },
            { key: "review", label: t("orderDetail.tabs.review") }
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-full px-4 py-2 text-xs font-semibold transition ${
                activeTab === tab.key
                  ? "bg-slate-900 text-white"
                  : "border border-slate-200 text-slate-600 hover:-translate-y-0.5 hover:border-slate-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("orderDetail.overview.created")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(order.createdAt)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("orderDetail.overview.deadline")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{formatDate(order.deadline)}</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("orderDetail.overview.orderType")}</p>
                  <p className="mt-2 text-sm font-semibold text-slate-900">
                    {order.orderType === "hourly" ? t("myOrders.type.hourly") : t("myOrders.type.package")}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("orderDetail.timeline.title")}</p>
                <div className="mt-4 grid gap-3 md:grid-cols-6">
                  {timelineSteps.map((step, index) => {
                    const active = index <= progressIndex;
                    const label =
                      step.key === "placed"
                        ? t("orderDetail.timeline.placed")
                        : step.key === "accepted"
                          ? t("orderDetail.timeline.accepted")
                          : step.key === "in_progress"
                            ? t("orderDetail.timeline.inProgress")
                            : step.key === "delivered"
                              ? t("orderDetail.timeline.delivered")
                              : step.key === "approval"
                                ? t("orderDetail.timeline.approval")
                                : t("orderDetail.timeline.completed");
                    return (
                      <div key={step.key} className="flex flex-col items-center text-center">
                        <div
                          className={`h-8 w-8 rounded-full border text-xs font-semibold ${
                            active ? "border-emerald-400 bg-emerald-500 text-white" : "border-slate-200 bg-white text-slate-400"
                          }`}
                        >
                          {active ? "✓" : index + 1}
                        </div>
                        <p className="mt-2 text-xs text-slate-500">{label}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{t("orderDetail.chat.desc")}</p>
              <Link
                href={`/chat?order=${order.id}`}
                className="mt-3 inline-flex rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
              >
                {t("orderDetail.chat.cta")}
              </Link>
            </div>
          )}

          {activeTab === "files" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{t("orderDetail.files.desc")}</p>
              <button className="mt-3 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700">
                {t("orderDetail.files.cta")}
              </button>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{t("orderDetail.payments.desc")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
                  {t(
                    order.paymentStatus === "escrowed"
                      ? "myOrders.payment.escrowed"
                      : order.paymentStatus === "released"
                        ? "myOrders.payment.released"
                        : "myOrders.payment.refunded"
                  )}
                </span>
                <span>{t("orderDetail.payments.protectedNote")}</span>
              </div>
            </div>
          )}

          {activeTab === "review" && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-sm text-slate-600">{t("orderDetail.review.desc")}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="h-8 w-8 rounded-full border border-slate-200 text-sm font-semibold text-slate-600 transition hover:-translate-y-0.5 hover:border-emerald-300"
                    type="button"
                  >
                    {star}
                  </button>
                ))}
                <button className="ml-auto rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white">
                  {t("orderDetail.review.submit")}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
