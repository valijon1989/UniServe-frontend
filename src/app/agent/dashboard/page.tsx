"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { api } from "../../../lib/api";

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
  const { user } = useAuth();
  const router = useRouter();
  const [listings, setListings] = useState<AgentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "AGENT" && user.role !== "ADMIN") {
      router.push("/");
      return;
    }
    api
      .get<AgentListing[]>("/api/agents/me/listings")
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
        <h2 className="mb-3 text-sm font-semibold">
          Your listings
        </h2>
        {loading && (
          <p className="text-slate-400">Loading listings…</p>
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
                    {item.type.toLowerCase()} • {item.category}{" "}
                    {item.location ? `• ${item.location}` : ""}
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
