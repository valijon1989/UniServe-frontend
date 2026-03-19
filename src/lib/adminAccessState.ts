import type { AdminAccess } from "@/types/admin";

export const ADMIN_MODE_KEY = "uniserve_admin_mode_v1";
export const ADMIN_MODE_TTL_MINUTES = 15;
export const ADMIN_MODE_TTL_MS = ADMIN_MODE_TTL_MINUTES * 60_000;

let accessCache: AdminAccess | null = null;
let accessPromise: Promise<AdminAccess> | null = null;

export const getCachedAdminAccess = () => accessCache;

export const setCachedAdminAccess = (value: AdminAccess | null) => {
  accessCache = value;
};

export const getCachedAdminAccessPromise = () => accessPromise;

export const setCachedAdminAccessPromise = (value: Promise<AdminAccess> | null) => {
  accessPromise = value;
};

export const readAdminModeTimestamp = () => {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(ADMIN_MODE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw) as { verifiedAt?: number };
    const value = Number(parsed?.verifiedAt || 0);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
};

export const persistAdminModeTimestamp = (verifiedAt: number) => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(ADMIN_MODE_KEY, JSON.stringify({ verifiedAt }));
  } catch {
    // ignore storage write errors
  }
};

export const clearAdminModeTimestamp = () => {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(ADMIN_MODE_KEY);
  } catch {
    // ignore storage write errors
  }
};

export const deriveAdminModeTimestamp = (access: AdminAccess | null) => {
  const expiresAt = access?.adminSession?.adminModeUntil ? new Date(access.adminSession.adminModeUntil).getTime() : 0;
  if (!expiresAt || Number.isNaN(expiresAt)) return 0;
  return expiresAt - ADMIN_MODE_TTL_MS;
};

export const resetAdminAccessClientState = () => {
  accessCache = null;
  accessPromise = null;
  clearAdminModeTimestamp();
};
