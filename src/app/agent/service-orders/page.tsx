"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentRoute } from "@/components/guards/AgentRoute";
import {
  getIncomingServiceOrders,
  updateIncomingServiceOrderStatus,
  type ServiceOrder,
  type ServiceOrderStatus
} from "@/api/serviceInteractions";
import { useAuthStore } from "@/store/auth";

const statusLabel: Record<ServiceOrderStatus, string> = {
  PENDING: "Kutilmoqda",
  ACCEPTED: "Qabul qilingan",
  REJECTED: "Rad etilgan",
  CANCELLED: "Bekor qilingan",
  COMPLETED: "Yakunlangan"
};

const statusBadgeClass: Record<ServiceOrderStatus, string> = {
  PENDING: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  ACCEPTED: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  REJECTED: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  CANCELLED: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  COMPLETED: "bg-sky-500/20 text-sky-200 border-sky-500/40"
};

function AgentServiceOrdersContent() {
  const { token, hydrateFromStorage, isHydrated } = useAuthStore();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated || !token) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    getIncomingServiceOrders(token)
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((err: any) => {
        if (active) setError(err?.response?.data?.message || "Kiruvchi xizmat buyurtmalarini yuklab bo'lmadi.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [isHydrated, token]);

  const handleStatus = async (orderId: string, status: ServiceOrderStatus) => {
    if (!token) return;
    try {
      const next = await updateIncomingServiceOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((item) => (item.id === orderId ? next : item)));
    } catch (err: any) {
      setError(err?.response?.data?.message || "Statusni yangilab bo'lmadi.");
    }
  };

  const content = useMemo(() => {
    if (loading) return <p className="text-sm text-slate-300">Yuklanmoqda...</p>;
    if (error) return <p className="text-sm text-red-400">{error}</p>;
    if (orders.length === 0) return <p className="text-sm text-slate-300">Hozircha xizmat buyurtmalari yo'q.</p>;

    return (
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4 text-sm text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-100">{order.serviceTitle}</p>
                <p className="text-xs text-slate-400">
                  Buyurtmachi: {order.customerName} · {order.customerPhone}
                </p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-[11px] ${statusBadgeClass[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="mt-3 grid gap-2 text-xs text-slate-400 md:grid-cols-2">
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-semibold text-slate-200">Asosiy manzil</p>
                <p className="mt-1">{order.customerAddress}</p>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                <p className="font-semibold text-slate-200">Borish manzili</p>
                <p className="mt-1">{order.destinationAddress || "Ko'rsatilmagan"}</p>
              </div>
            </div>
            {order.note && (
              <div className="mt-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">Izoh</p>
                <p className="mt-1">{order.note}</p>
              </div>
            )}
            {order.status === "PENDING" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleStatus(order.id, "ACCEPTED")}
                  className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30"
                >
                  Qabul qilish
                </button>
                <button
                  onClick={() => handleStatus(order.id, "REJECTED")}
                  className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs text-rose-200 hover:bg-rose-500/30"
                >
                  Rad etish
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [error, loading, orders]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Kiruvchi xizmat buyurtmalari</h1>
        <p className="mt-1 text-sm text-slate-400">
          Mijoz yuborgan manzil, telefon va izohlar shu yerda ko'rinadi.
        </p>
      </header>
      {content}
    </div>
  );
}

export default function AgentServiceOrdersPage() {
  return (
    <AgentRoute>
      <AgentServiceOrdersContent />
    </AgentRoute>
  );
}
