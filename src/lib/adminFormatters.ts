"use client";

export const formatAdminDate = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

export const formatAdminDateShort = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
};

export const formatAdminCurrency = (amount?: number | null, currency = "USD") => {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2
    }).format(safeAmount);
  } catch {
    return `${currency || "USD"} ${safeAmount.toFixed(2)}`;
  }
};

export const formatAdminNumber = (value?: number | null) => {
  const safeValue = Number.isFinite(Number(value)) ? Number(value) : 0;
  return new Intl.NumberFormat("en-US").format(safeValue);
};

export const summarizeObject = (value?: Record<string, unknown> | null, maxItems = 3) => {
  if (!value || typeof value !== "object") return "—";
  const items = Object.entries(value)
    .filter(([, item]) => item !== undefined && item !== null && item !== "")
    .slice(0, maxItems)
    .map(([key, item]) => `${key}: ${typeof item === "object" ? "[object]" : String(item)}`);
  return items.length ? items.join(" · ") : "—";
};

export const summarizeList = (items?: Array<string | null | undefined>, maxItems = 3) => {
  const safeItems = (items || []).map((item) => String(item || "").trim()).filter(Boolean);
  if (!safeItems.length) return "—";
  const head = safeItems.slice(0, maxItems);
  const suffix = safeItems.length > maxItems ? ` +${safeItems.length - maxItems}` : "";
  return `${head.join(" · ")}${suffix}`;
};
