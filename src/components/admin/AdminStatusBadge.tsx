"use client";

interface Props {
  value?: string | null;
  tone?: "auto" | "neutral";
}

const resolveClassName = (value: string, tone: "auto" | "neutral") => {
  if (tone === "neutral") return "bg-slate-900 text-slate-200 ring-slate-700";
  const normalized = value.trim().toUpperCase();
  if (["ACTIVE", "APPROVED", "SUCCESS", "COMPLETED", "HEALTHY", "REVIEWED", "PUBLISHED", "VERIFIED"].includes(normalized)) {
    return "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30";
  }
  if (["FAILED", "REJECTED", "REVOKED", "BANNED", "SUSPENDED", "FLAGGED", "ESCALATED", "DISPUTED", "HIGH", "URGENT"].includes(normalized)) {
    return "bg-rose-500/15 text-rose-200 ring-rose-500/30";
  }
  if (["PENDING", "WARNED", "RESTRICTED", "OPEN", "PROCESSING", "PAUSED", "ATTENTION", "BUSY", "DEGRADED", "MEDIUM", "HIDDEN", "UNVERIFIED"].includes(normalized)) {
    return "bg-amber-500/15 text-amber-200 ring-amber-500/30";
  }
  if (["LOW", "INFO", "SCOPED"].includes(normalized)) {
    return "bg-sky-500/15 text-sky-200 ring-sky-500/30";
  }
  return "bg-sky-500/15 text-sky-200 ring-sky-500/30";
};

export function AdminStatusBadge({ value, tone = "auto" }: Props) {
  const label = String(value || "Unknown");
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs ring-1 ${resolveClassName(label, tone)}`}>{label}</span>;
}
