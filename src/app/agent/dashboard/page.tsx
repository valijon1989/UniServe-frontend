"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";
import { useRideSocket, type RideStatus } from "@/hooks/useRideSocket";

interface AgentListing {
  id: string;
  title: string;
  type: "PRODUCT" | "SERVICE";
  category: string;
  price?: number;
  currency?: string;
  location?: string;
  isActive: boolean;
}

export default function AgentDashboardPage() {
  const { user, token } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);
  const { status: rideSocketStatus, rides, sendRideEvent } = useRideSocket({
    token,
    enabled: Boolean(user)
  });

  useEffect(() => {
    if (!user) return;
    if (user.role !== "AGENT" && user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    api
      .get<AgentListing[]>("/agents/me/listings")
      .then((res) => setListings(res.data))
      .catch((err) => console.error("Failed to load listings", err))
      .finally(() => setLoading(false));
  }, [user, router]);

  if (!user) {
    return (
      <p className="mt-8 text-sm text-slate-300">
        Please login as agent to see dashboard.
      </p>
    );
  }

  if (user.role !== "AGENT" && user.role !== "ADMIN") {
    return (
      <p className="mt-8 text-sm text-slate-300">
        Only agents can access this page.
      </p>
    );
  }

  const rideRequests = useMemo(
    () => rides.filter((ride) => ride.status === "requested"),
    [rides]
  );
  const activeRides = useMemo(
    () => rides.filter((ride) => ride.status !== "requested"),
    [rides]
  );

  const formatSocketStatus = (status: string) => {
    const map: Record<string, string> = {
      idle: "To'xtatilgan",
      connecting: "Ulanmoqda",
      open: "Onlayn",
      closed: "Ulanish uzildi",
      error: "Xatolik"
    };
    return map[status] || status;
  };

  const formatRideStatus = (status: RideStatus) => {
    const map: Record<RideStatus, string> = {
      requested: "Yangi so'rov",
      assigned: "Biriktirildi",
      taken: "Qabul qilindi",
      confirmed: "Tasdiqlandi",
      completed: "Yakunlandi"
    };
    return map[status] || status;
  };

  const handleTakeRide = (rideId: string) => {
    sendRideEvent("ride_taken", { rideId });
  };

  return (
    <div className="mt-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Agent dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Manage your UniServe products and services.
          </p>
        </div>
        <button className="btn-primary text-xs">
          + New listing (coming soon)
        </button>
      </header>

      <section className="card p-4 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Live taxi so'rovlari</h2>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
            {formatSocketStatus(rideSocketStatus)}
          </span>
        </div>
        {rideRequests.length === 0 ? (
          <p className="mt-3 text-xs text-slate-400">
            Hozircha yangi so'rov yo'q.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {rideRequests.map((ride) => (
              <div
                key={ride.rideId}
                className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-200"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">Ride #{ride.rideId}</p>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">
                      {formatRideStatus(ride.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleTakeRide(ride.rideId)}
                      className="rounded-full bg-sky-500/20 px-3 py-0.5 text-[11px] text-sky-200"
                      disabled={rideSocketStatus !== "open"}
                    >
                      Qabul qilish
                    </button>
                  </div>
                </div>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {ride.pickupLocation && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Qayerdan</p>
                      <p>{ride.pickupLocation}</p>
                    </div>
                  )}
                  {ride.dropoffLocation && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Qayerga</p>
                      <p>{ride.dropoffLocation}</p>
                    </div>
                  )}
                  {(ride.seatCount || ride.taxiClass) && (
                    <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {ride.seatCount && (
                        <span className="rounded-full bg-slate-900 px-2 py-1">
                          {ride.seatCount} kishi
                        </span>
                      )}
                      {ride.taxiClass && (
                        <span className="rounded-full bg-slate-900 px-2 py-1">
                          {ride.taxiClass}
                        </span>
                      )}
                    </div>
                  )}
                  {(ride.offeredFare || ride.estimatedFare) && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-500">Narx</p>
                      <p>
                        {ride.offeredFare || ride.estimatedFare} {ride.currency || "UZS"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {activeRides.length > 0 && (
          <div className="mt-4">
            <p className="text-xs font-semibold text-slate-300">Aktiv safarlar</p>
            <div className="mt-2 space-y-2 text-xs">
              {activeRides.map((ride) => (
                <div
                  key={ride.rideId}
                  className="rounded-xl border border-slate-800 bg-slate-900/40 px-3 py-2 text-slate-300"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>Ride #{ride.rideId}</span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[11px] text-slate-400">
                      {formatRideStatus(ride.status)}
                    </span>
                  </div>
                  {(ride.finalFare || ride.payoutAmount) && (
                    <p className="mt-1 text-[11px] text-slate-400">
                      Yakuniy: {ride.finalFare || "—"} · To'lov: {ride.payoutAmount || "—"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="card p-4 text-sm">
        <h2 className="mb-3 text-sm font-semibold">
          Your listings
        </h2>
        {loading && (
          <p className="text-slate-400">Loading listings...</p>
        )}
        {!loading && listings.length === 0 && (
          <p className="text-slate-400">
            You don&apos;t have listings yet. Later you will be able to
            publish products and services from here.
          </p>
        )}
        {!loading && listings.length > 0 && (
          <div className="space-y-2">
            {listings.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-100">
                    {item.title}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {item.type.toLowerCase()} - {item.category}{" "}
                    {item.location ? `- ${item.location}` : ""}
                  </p>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  {item.price && (
                    <p>
                      {item.price} {item.currency || "USD"}
                    </p>
                  )}
                  <p
                    className={
                      item.isActive
                        ? "text-emerald-400"
                        : "text-slate-500"
                    }
                  >
                    {item.isActive ? "Active" : "Paused"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
