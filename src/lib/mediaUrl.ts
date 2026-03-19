const DEFAULT_API_URL = "http://localhost:5001/api";

const trimTrailingSlashes = (value: string) => value.replace(/\/+$/, "");

const LOCAL_PUBLIC_PREFIXES = [
  "/avatars/",
  "/images/",
  "/fallback/",
  "/placeholders/",
  "/video/",
  "/logo.svg",
  "/favicon.ico",
  "/placeholder.png",
  "/avatar-default.svg"
];

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value) || /^data:/i.test(value) || /^blob:/i.test(value);
const AVATAR_POOL_SIZE = 30;

const normalizeLocalAvatarPath = (value: string) => {
  const match = value.match(/^\/(?:static\/)?avatars\/agent-?(\d+)\.(jpg|jpeg|png|webp)$/i);
  if (!match) return value;
  const numeric = Number(match[1]);
  const normalized = Number.isFinite(numeric) && numeric > 0
    ? ((Math.trunc(numeric) - 1) % AVATAR_POOL_SIZE) + 1
    : 1;
  return `/avatars/agent-${String(normalized).padStart(2, "0")}.jpg`;
};

const getConfiguredApiBase = () => {
  const base =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    DEFAULT_API_URL;
  return trimTrailingSlashes(base);
};

const getConfiguredApiOrigin = () => {
  const apiBase = getConfiguredApiBase();
  return apiBase.replace(/\/api$/, "");
};

const isLocalPublicPath = (value: string) => LOCAL_PUBLIC_PREFIXES.some((prefix) => value.startsWith(prefix));

export function toAbsoluteMediaUrl(input?: string | null) {
  if (!input) return "";
  const trimmed = normalizeLocalAvatarPath(String(input).trim());
  if (!trimmed) return "";
  if (isAbsoluteUrl(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  if (trimmed.startsWith("/")) {
    if (isLocalPublicPath(trimmed)) return trimmed;
    return `${getConfiguredApiOrigin()}${trimmed}`;
  }

  return `${getConfiguredApiOrigin()}/${trimmed.replace(/^\/+/, "")}`;
}
