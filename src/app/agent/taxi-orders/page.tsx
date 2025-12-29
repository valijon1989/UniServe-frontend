"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentRoute } from "@/components/guards/AgentRoute";
import {
  getAgentTaxiOrders,
  updateTaxiOrderStatus,
  type TaxiOrder,
  type TaxiOrderStatus
} from "@/api/taxi";
import { useAuthStore } from "@/store/auth";

const statusLabel: Record<TaxiOrderStatus, string> = {
  pending: "Kutilmoqda",
  accepted: "Qabul qilingan",
  rejected: "Rad etilgan",
  cancelled: "Bekor qilingan",
  completed: "Yakunlangan"
};

const statusBadgeClass: Record<TaxiOrderStatus, string> = {
  pending: "bg-amber-500/20 text-amber-200 border-amber-500/40",
  accepted: "bg-emerald-500/20 text-emerald-200 border-emerald-500/40",
  rejected: "bg-rose-500/20 text-rose-200 border-rose-500/40",
  cancelled: "bg-slate-500/20 text-slate-300 border-slate-500/40",
  completed: "bg-sky-500/20 text-sky-200 border-sky-500/40"
};

function AgentOrdersContent() {
  const { token, hydrateFromStorage, isHydrated } = useAuthStore();
  const [orders, setOrders] = useState<TaxiOrder[]>([]);
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
    let alive = true;
    setLoading(true);
    getAgentTaxiOrders(token)
      .then((data) => {
        if (alive) setOrders(data);
      })
      .catch(() => {
        if (alive) setError("Agent buyurtmalarini yuklab bo'lmadi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [isHydrated, token]);

  const handleStatus = async (orderId: string, status: TaxiOrderStatus) => {
    if (!token) return;
    try {
      const next = await updateTaxiOrderStatus(orderId, status, token);
      setOrders((prev) => prev.map((item) => (item.id === orderId ? { ...item, status: next.status } : item)));
    } catch {
      setError("Status yangilashda xatolik.");
    }
  };

  const content = useMemo(() => {
    if (loading) return <p className="text-sm text-slate-300">Yuklanmoqda...</p>;
    if (error) return <p className="text-sm text-red-400">{error}</p>;
    if (orders.length === 0) return <p className="text-sm text-slate-300">Hozircha buyurtma yo'q.</p>;

    return (
      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order.id} className="card p-4 text-sm text-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-slate-100">
                  {order.listingTitle || "Taxi buyurtma"}
                </p>
                <p className="text-xs text-slate-400">
                  {order.pickupAddress || "Pickup yo'q"} → {order.dropoffAddress || "Dropoff yo'q"}
                </p>
                {order.customerName && (
                  <p className="text-xs text-slate-500">Mijoz: {order.customerName}</p>
                )}
              </div>
              <span className={`rounded-full border px-2 py-1 text-[11px] ${statusBadgeClass[order.status]}`}>
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <span>Vaqt: {order.rideTime || "Kelishiladi"}</span>
              <span>Narx: Kelishuv asosida</span>
            </div>
            {order.status === "pending" && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => handleStatus(order.id, "accepted")}
                  className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs text-emerald-200 hover:bg-emerald-500/30"
                >
                  Qabul qilish
                </button>
                <button
                  onClick={() => handleStatus(order.id, "rejected")}
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
        <h1 className="text-2xl font-semibold text-slate-100">Kiruvchi taxi buyurtmalar</h1>
        <p className="mt-1 text-sm text-slate-400">
          Sizga kelgan taxi buyurtmalari.
        </p>
      </header>
      {content}
    </div>
  );
}

export default function AgentTaxiOrdersPage() {
  return (
    <AgentRoute>
      <AgentOrdersContent />
    </AgentRoute>
  );
}
