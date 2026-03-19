"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getCommunityReports, moderateCommunityReport } from "@/api/admin";
import { AdminPermissionGate } from "@/components/admin/AdminPermissionGate";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import type { CommunityReportItem } from "@/types/admin";

type ReportAction = "dismiss" | "delete";

const normalizeError = (error: unknown) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (responseMessage && responseMessage.trim()) return responseMessage;
  return (error as { message?: string })?.message || "Request failed";
};

const formatWhen = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export default function AdminCommunityPage() {
  const admin = useAdminAccess();
  const [reports, setReports] = useState<CommunityReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const nextReports = await getCommunityReports({ page: 1, limit: 100 });
      setReports(nextReports);
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const requireFreshForSensitive = useCallback(() => {
    if (!admin.mfaEnabled) return true;
    if (admin.requireFreshMode()) return true;
    toast.error("Re-enter admin mode to continue sensitive action.");
    admin.clearMode();
    return false;
  }, [admin]);

  const handleAction = async (report: CommunityReportItem, action: ReportAction) => {
    if (action === "delete" && !admin.can("community.delete_post")) {
      toast.error("Missing permission: community.delete_post");
      return;
    }
    if (action === "dismiss" && !admin.canAny(["community.moderate", "reports.resolve"])) {
      toast.error("Missing permission: reports.resolve");
      return;
    }
    if (!requireFreshForSensitive()) return;
    const reason = window.prompt(`Audit reason for ${action}`)?.trim();
    if (!reason) return;

    setProcessingId(report.id);
    try {
      await moderateCommunityReport(report.id, action, reason);
      setReports((prev) => prev.filter((entry) => entry.id !== report.id));
      if (action === "delete") toast.success("Post deleted");
      if (action === "dismiss") toast.success("Report dismissed");
    } catch (error) {
      toast.error(normalizeError(error));
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminPermissionGate permissionsAny={["community.moderate", "reports.view", "posts.moderate", "content.moderate"]}>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">Community Moderation</h1>
              <p className="mt-1 text-sm text-slate-400">Review reported posts and take action.</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchReports()}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-800"
            >
              Refresh
            </button>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-20 animate-pulse rounded-xl border border-slate-800 bg-slate-900/50" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <p className="text-sm text-slate-400">No reports in queue.</p>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => {
                const isProcessing = processingId === report.id;
                return (
                  <article key={report.id} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                    <p className="text-sm font-medium text-slate-100">{report.reason || "Reported content"}</p>
                    <p className="text-xs text-slate-400">
                      Author: {report.authorName || "Unknown"} · At: {formatWhen(report.createdAt)}
                    </p>
                    <p className="mt-1 text-sm text-slate-300">{report.content || "No content preview available."}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {admin.can("community.delete_post") && (
                        <button
                          type="button"
                          onClick={() => void handleAction(report, "delete")}
                          disabled={isProcessing}
                          className="rounded border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Delete post
                        </button>
                      )}
                      {admin.canAny(["community.moderate", "reports.resolve"]) && (
                        <button
                          type="button"
                          onClick={() => void handleAction(report, "dismiss")}
                          disabled={isProcessing}
                          className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Dismiss
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
