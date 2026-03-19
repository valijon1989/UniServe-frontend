"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { getModerationListings, moderateListing } from "@/api/admin";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import type { ModerationListingItem } from "@/types/admin";

type QueueStatus = "ALL" | "PENDING" | "ACTIVE" | "PAUSED";
type ModerationAction = "approve" | "reject" | "pause";

const normalizeError = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (responseMessage && responseMessage.trim()) return responseMessage;
  return (error as { message?: string })?.message || "Request failed";
};

const statusClass = (status?: string) => {
  const normalized = String(status || "").toUpperCase();
  if (normalized === "ACTIVE") return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  if (normalized === "PAUSED") return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
  if (normalized === "REJECTED" || normalized === "ARCHIVED") return "bg-rose-500/15 text-rose-200 ring-rose-500/30";
  return "bg-sky-500/15 text-sky-200 ring-sky-500/30";
};

export default function AdminListingsPage() {
  const admin = useAdminAccess();
  const [queueStatus, setQueueStatus] = useState<QueueStatus>("PENDING");
  const [items, setItems] = useState<ModerationListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const nextItems = await getModerationListings({
        status: queueStatus === "ALL" ? undefined : queueStatus,
        page: 1,
        limit: 100
      });
      setItems(nextItems);
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setLoading(false);
    }
  }, [queueStatus]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  const requireFreshForSensitive = useCallback(() => {
    if (!admin.mfaEnabled) return true;
    if (admin.requireFreshMode()) return true;
    toast.error("Re-enter admin mode to continue sensitive action.");
    admin.clearMode();
    return false;
  }, [admin]);

  const scopedItems = useMemo(() => {
    return items.filter((item) => admin.hasScope("listings", item.category, item.subcategory));
  }, [admin, items]);

  const handleAction = async (item: ModerationListingItem, action: ModerationAction) => {
    if (action === "pause" && !admin.can("listings.pause_force")) {
      toast.error("Missing permission: listings.pause_force");
      return;
    }
    if ((action === "approve" || action === "reject") && !admin.can("listings.approve_reject")) {
      toast.error("Missing permission: listings.approve_reject");
      return;
    }
    if (!requireFreshForSensitive()) return;
    const reason = window.prompt(`Audit reason for ${action}`)?.trim();
    if (!reason) return;

    setProcessingId(item.id);
    try {
      await moderateListing(item.id, action, reason);
      setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      if (action === "approve") toast.success("Listing approved");
      if (action === "reject") toast.success("Listing rejected");
      if (action === "pause") toast.success("Listing paused");
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["products.view", "services.view", "listings.read_all"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Listings Moderation</h1>
              <p className="mt-1 text-sm text-slate-400">Only listings in your assigned scope are visible.</p>
            </div>
            <div className="flex gap-2">
              <select
                value={queueStatus}
                onChange={(event) => setQueueStatus(event.target.value as QueueStatus)}
                className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
              >
                <option value="PENDING">Pending</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="ALL">All</option>
              </select>
              <button
                type="button"
                onClick={() => void fetchItems()}
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
              >
                Refresh
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-slate-400">No listings in moderation queue.</p>
          ) : scopedItems.length === 0 ? (
            <p className="text-sm text-slate-400">No listings in your current scope.</p>
          ) : (
            <div className="space-y-2">
              {scopedItems.map((item) => {
                const isProcessing = processingId === item.id;
                return (
                  <article key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-medium text-slate-100">{item.title || "Untitled listing"}</h3>
                        <p className="text-xs text-slate-400">
                          {(item.category || "uncategorized")}/{item.subcategory || "general"}
                        </p>
                        {item.ownerName && <p className="text-xs text-slate-500">Owner: {item.ownerName}</p>}
                      </div>
                      <span className={`inline-flex rounded-full px-2 py-1 text-[11px] ring-1 ${statusClass(item.status)}`}>
                        {String(item.status || queueStatus || "PENDING").toUpperCase()}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {admin.can("listings.approve_reject") && (
                        <button
                          type="button"
                          onClick={() => void handleAction(item, "approve")}
                          disabled={isProcessing}
                          className="rounded border border-emerald-500/40 px-2 py-1 text-xs text-emerald-200 hover:bg-emerald-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Approve
                        </button>
                      )}
                      {admin.can("listings.approve_reject") && (
                        <button
                          type="button"
                          onClick={() => void handleAction(item, "reject")}
                          disabled={isProcessing}
                          className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Reject
                        </button>
                      )}
                      {admin.can("listings.pause_force") && (
                        <button
                          type="button"
                          onClick={() => void handleAction(item, "pause")}
                          disabled={isProcessing}
                          className="rounded border border-amber-500/40 px-2 py-1 text-xs text-amber-200 hover:bg-amber-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Pause
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AdminPermissionGate>
  );
}
