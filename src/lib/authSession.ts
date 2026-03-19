"use client";

import { resetAdminAccessClientState } from "@/lib/adminAccessState";
import { useAuthStore } from "@/store/auth";

export const AUTH_LOGOUT_EVENT = "uniserve:auth-logout";
export const AUTH_LOGOUT_STORAGE_KEY = "uniserve_logout_at";

const AUTH_BROADCAST_CHANNEL = "uniserve:auth";
const AUTH_STORAGE_KEYS = [
  "uniserve_token",
  "uniserve_user",
  "uniserve_user_profile",
  "uniserve_session_meta",
  "uniserve_admin_mode_v1"
];
const DEFAULT_AUTH_COOKIE_NAMES = [
  "uniserve_token",
  "uniserve_refresh",
  "uniserve_refresh_token",
  "uniserve_session",
  "admin_session",
  "uniserve_admin_mode",
  "access_token",
  "refresh_token",
  "accessToken",
  "refreshToken",
  "auth_token",
  "auth_refresh",
  "admin_mode",
  "connect.sid",
  "__session"
];
const AUTH_COOKIE_PATHS = ["/", "/api", "/api/auth", "/api/admin"];

export interface AuthLogoutSignal {
  at: number;
  reason?: string;
  audience?: "ADMIN" | "USER" | "AGENT";
  redirectTo?: string | null;
  source?: "manual" | "forced" | "sync";
}

let lastHandledLogoutAt = 0;
let logoutChannel: BroadcastChannel | null = null;

const safeRemoveItem = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // ignore storage write errors
  }
};

const normalizeLogoutSignal = (value?: Partial<AuthLogoutSignal>): AuthLogoutSignal => ({
  at: Number(value?.at || Date.now()),
  reason: value?.reason ? String(value.reason) : undefined,
  audience:
    value?.audience === "ADMIN" || value?.audience === "USER" || value?.audience === "AGENT"
      ? value.audience
      : undefined,
  redirectTo: typeof value?.redirectTo === "string" ? value.redirectTo : undefined,
  source:
    value?.source === "manual" || value?.source === "forced" || value?.source === "sync"
      ? value.source
      : "forced"
});

const readConfiguredCookieNames = () => {
  const configured = String(process.env.NEXT_PUBLIC_AUTH_COOKIE_NAMES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  return Array.from(new Set([...DEFAULT_AUTH_COOKIE_NAMES, ...configured]));
};

const expireCookie = (name: string) => {
  const encoded = encodeURIComponent(name);
  for (const path of AUTH_COOKIE_PATHS) {
    const expired = `${encoded}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=${path}; SameSite=Lax`;
    document.cookie = expired;
    document.cookie = `${expired}; Secure`;
  }
};

const emitLogoutEvent = (signal: AuthLogoutSignal) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<AuthLogoutSignal>(AUTH_LOGOUT_EVENT, { detail: signal }));
};

const redirectAfterLogout = (signal: AuthLogoutSignal) => {
  if (typeof window === "undefined") return;
  const redirectTo =
    signal.redirectTo ||
    (signal.source === "forced" || signal.source === "sync" ? getDefaultLogoutRedirect(signal.audience) : undefined);

  if (!redirectTo) return;
  if (window.location.pathname === redirectTo) return;
  window.location.replace(redirectTo);
};

const getLogoutChannel = () => {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") return null;
  if (!logoutChannel) {
    logoutChannel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  }
  return logoutChannel;
};

export const getDefaultLogoutRedirect = (audience?: AuthLogoutSignal["audience"]) => {
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
    return "/admin/login";
  }
  return audience === "ADMIN" ? "/admin/login" : "/login";
};

export const clearClientAuthArtifacts = () => {
  if (typeof window === "undefined") return;

  for (const key of AUTH_STORAGE_KEYS) {
    safeRemoveItem(window.localStorage, key);
    safeRemoveItem(window.sessionStorage, key);
  }

  for (const cookieName of readConfiguredCookieNames()) {
    expireCookie(cookieName);
  }
};

export const applyLogoutSignal = (value?: Partial<AuthLogoutSignal>) => {
  const signal = normalizeLogoutSignal(value);
  if (signal.at <= lastHandledLogoutAt) {
    return signal;
  }

  lastHandledLogoutAt = signal.at;
  resetAdminAccessClientState();
  clearClientAuthArtifacts();
  useAuthStore.getState().logout();
  emitLogoutEvent(signal);

  return signal;
};

export const triggerClientLogout = (value?: Partial<AuthLogoutSignal>) => {
  const signal = applyLogoutSignal({
    ...value,
    source: value?.source || "manual"
  });

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(AUTH_LOGOUT_STORAGE_KEY, String(signal.at));
    } catch {
      // ignore storage write errors
    }

    try {
      getLogoutChannel()?.postMessage(signal);
    } catch {
      // ignore broadcast channel failures
    }
  }

  redirectAfterLogout(signal);

  return signal;
};

export const subscribeToLogoutBroadcast = (handler: (signal: AuthLogoutSignal) => void) => {
  const channel = getLogoutChannel();
  if (!channel) return () => undefined;

  const listener = (event: MessageEvent<AuthLogoutSignal>) => {
    handler(normalizeLogoutSignal(event.data));
  };

  channel.addEventListener("message", listener);
  return () => channel.removeEventListener("message", listener);
};
