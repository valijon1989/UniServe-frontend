const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export function getApiOrigin() {
  const clean = RAW_API_URL.replace(/\/+$/, "");
  return clean.replace(/\/api$/, "");
}

export function normalizeImageUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^https?:\/\//i.test(trimmed) || /^data:/i.test(trimmed) || /^blob:/i.test(trimmed)) {
    return trimmed;
  }

  const apiOrigin = getApiOrigin();
  const normalized = trimmed.startsWith("/") ? trimmed : `/${trimmed.replace(/^\/+/, "")}`;

  if (normalized.startsWith("/static/")) return `${apiOrigin}${normalized}`;
  if (normalized.startsWith("/uploads/")) return `${apiOrigin}${normalized}`;
  if (normalized.startsWith("/media/")) return `${apiOrigin}${normalized}`;
  if (normalized.startsWith("/api/")) return `${apiOrigin}${normalized.replace(/^\/api/, "")}`;

  return `${apiOrigin}${normalized}`;
}
