"use client";

import { useEffect, useState } from "react";
import { AgentListingForm } from "@/components/AgentListingForm";
import { createListing, getMyListings, type Listing } from "@/api/agent";
import { useI18n } from "@/context/i18n";

export default function AgentDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useI18n();

  const loadListings = async () => {
    try {
      const data = await getMyListings();
      setListings(data);
    } catch (err) {
      console.error("Agent listings error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadListings();
  }, []);

  const handleCreate = async (values: Listing) => {
    const created = await createListing(values);
    setListings((prev) => [created, ...prev]);
  };

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <h1 className="text-lg font-semibold text-slate-50">
          {t("agents.panelTitle")}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {t("agents.panelSubtitle")}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[2fr,3fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            {t("agents.newListing")}
          </h2>
          <AgentListingForm onSubmit={handleCreate} />
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-100">
            {t("agents.myListings")}
          </h2>
          {loading ? (
            <p className="text-sm text-slate-400">{t("agents.loading")}</p>
          ) : listings.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t("agents.empty")}
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {listings.map((item) => (
                <li
                  key={item._id}
                  className="flex items-start justify-between gap-2 rounded-xl border border-slate-800 bg-slate-900/80 p-3"
                >
                  <div>
                    <p className="font-medium text-slate-100">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {item.category} - {item.price} {item.currency}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {item.description}
                    </p>
                  </div>
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="h-16 w-20 rounded-lg object-cover"
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
