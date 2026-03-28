const LEGACY_ADMIN_ROUTE_ALIASES: Record<string, string> = {
  "/admin/products": "/admin/listings",
  "/admin/services": "/admin/listings",
  "/admin/disputes": "/admin/orders",
  "/admin/logs": "/admin/audit",
  "/admin/security": "/admin/settings",
  "/admin/audit-logs": "/admin/audit",
  "/audit/logs": "/admin/audit"
};

const INTERNAL_URL_BASE = "https://uniserve.local";

export const normalizeAdminHref = (href?: string | null) => {
  const raw = String(href || "").trim();
  if (!raw || !raw.startsWith("/")) return raw;

  const url = new URL(raw, INTERNAL_URL_BASE);
  const nextPathname = LEGACY_ADMIN_ROUTE_ALIASES[url.pathname];
  if (!nextPathname) return raw;

  return `${nextPathname}${url.search}${url.hash}`;
};
