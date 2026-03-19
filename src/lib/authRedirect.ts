export const sanitizeInternalRedirect = (value: unknown, fallback = "/") => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;

  try {
    const url = new URL(raw, "http://localhost");
    if (url.origin !== "http://localhost") return fallback;
    return `${url.pathname}${url.search}${url.hash}` || fallback;
  } catch {
    return fallback;
  }
};

export const buildLoginRedirect = (returnTo?: unknown) => {
  const safePath = sanitizeInternalRedirect(returnTo, "/");
  if (safePath === "/") return "/login";
  return `/login?redirect=${encodeURIComponent(safePath)}`;
};

export const isUnauthorizedApiError = (error: unknown) =>
  ((error as { response?: { status?: number } })?.response?.status || 0) === 401;
