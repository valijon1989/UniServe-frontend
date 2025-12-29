"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTaxiListings, type TaxiListing } from "@/api/taxi";

const formatLanguages = (languages?: string[] | string) => {
  if (!languages) return "";
  if (Array.isArray(languages)) return languages.join(", ");
  return String(languages);
};

export default function TaxiListingPage() {
  const [items, setItems] = useState<TaxiListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    getTaxiListings()
      .then((data) => {
        if (alive) setItems(data);
      })
      .catch(() => {
        if (alive) setError("Taxi e'lonlarini yuklab bo'lmadi.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const content = useMemo(() => {
    if (loading) {
      return <p className="text-sm text-slate-300">Yuklanmoqda...</p>;
    }
    if (error) {
      return <p className="text-sm text-red-400">{error}</p>;
    }
    if (items.length === 0) {
      return <p className="text-sm text-slate-300">Hozircha e'lonlar yo'q.</p>;
    }
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/taxi/${item.id}`}
            className="card block p-4 transition hover:-translate-y-0.5 hover:border-slate-600"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-slate-100">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {item.city || "Shahar ko'rsatilmagan"}
                </p>
              </div>
              <span className="rounded-full bg-slate-900 px-2 py-1 text-[11px] text-slate-300">
                {item.priceNote || "Kelishuv asosida"}
              </span>
            </div>
            <div className="mt-3 space-y-2 text-xs text-slate-300">
              <p>Avto: {item.carType || "Noma'lum"}</p>
              <p>Yo'lovchi soni: {item.passengersMax ?? "Noma'lum"}</p>
              <p>Tillar: {formatLanguages(item.languages) || "Ko'rsatilmagan"}</p>
              <p>Vaqt: {item.availableHours || "Kelishiladi"}</p>
            </div>
          </Link>
        ))}
      </div>
    );
  }, [error, items, loading]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-100">Taxi e'lonlari</h1>
        <p className="mt-1 text-sm text-slate-400">
          Shaharingizdagi taxi xizmatlarini tanlang.
        </p>
      </header>
      {content}
    </div>
  );
}
