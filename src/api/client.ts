import axios, { AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";
import { triggerClientLogout } from "@/lib/authSession";
import { useAuthStore } from "@/store/auth";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const ENDPOINT_MISSING_STATUSES = [404, 405, 501];
const REFRESH_PATHS = [
  "/admin/auth/refresh",
  "/auth/refresh",
  "/auth/token/refresh",
  "/session/refresh"
];
const AUTH_RECOVERY_MARKERS = [
  "/auth/login",
  "/auth/register",
  "/auth/logout",
  "/api/auth/logout",
  "/auth/refresh",
  "/auth/token/refresh",
  "/admin/auth/login",
  "/admin/auth/logout",
  "/api/admin/auth/logout",
  "/admin/auth/refresh",
  "/admins/auth/login",
  "/admins/auth/logout"
];

let refreshPromise: Promise<string | null> | null = null;

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const readStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("uniserve_token") || window.sessionStorage.getItem("uniserve_token");
};

const readStoredLocale = () => {
  if (typeof window === "undefined") return "uz";
  const locale = window.localStorage.getItem("uniserve_language");
  return locale && ["uz", "ru", "en", "ko"].includes(locale) ? locale : "uz";
};

const shouldRememberSession = () => {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem("uniserve_token")) return true;
  if (window.sessionStorage.getItem("uniserve_token")) return false;
  return true;
};

const readTokenCandidate = (source: Record<string, any> | null): string | null => {
  if (!source) return null;
  const direct = source.token || source.accessToken || source.access_token || source.jwt;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const nested = asRecord(source.auth) || asRecord(source.tokens);
  const value = nested?.token || nested?.accessToken || nested?.access_token || nested?.jwt;
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

const readUserCandidate = (source: Record<string, any> | null) => {
  if (!source) return null;
  const directUser = asRecord(source.user) || asRecord(source.me) || asRecord(source.profile);
  if (directUser) return directUser;

  if (typeof source._id === "string" || typeof source.id === "string") {
    return source;
  }

  return null;
};

const getStatus = (error: unknown) => {
  return (error as { response?: { status?: number } })?.response?.status;
};

const shouldTryNextEndpoint = (error: unknown) => {
  const status = getStatus(error);
  return typeof status === "number" && ENDPOINT_MISSING_STATUSES.includes(status);
};

const DEFAULT_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

const resolveAppApiBaseURL = (rawBaseUrl: string) => {
  const trimmed = String(rawBaseUrl || "").trim().replace(/\/+$/, "");
  if (!trimmed) return undefined;
  return trimmed.replace(/\/api$/i, "");
};

const isAuthRecoveryRequest = (url?: string) => {
  const value = String(url || "");
  return AUTH_RECOVERY_MARKERS.some((marker) => value.includes(marker));
};

const persistRefreshedSession = (raw: unknown, token: string) => {
  const root = asRecord(raw);
  const candidates = [root, asRecord(root?.data), asRecord(root?.payload), asRecord(root?.result)];
  let user: Record<string, any> | null = null;

  for (const candidate of candidates) {
    if (!user) user = readUserCandidate(candidate);
    if (user) break;
  }

  const state = useAuthStore.getState();
  const rawRole = String(user?.role || state.role || "").toUpperCase();
  const role =
    rawRole === "ADMIN" || rawRole === "AGENT" || rawRole === "USER"
      ? (rawRole as "ADMIN" | "AGENT" | "USER")
      : state.role;
  const userId = String(user?._id || user?.id || state.userId || "").trim() || state.userId || null;

  state.setSession(
    token,
    {
      name: typeof user?.name === "string" ? user.name : state.profile?.name,
      avatarUrl:
        typeof user?.avatarUrl === "string"
          ? user.avatarUrl
          : typeof user?.avatar === "string"
            ? user.avatar
            : state.profile?.avatarUrl,
      username: typeof user?.username === "string" ? user.username : state.profile?.username
    },
    role,
    userId,
    { rememberMe: shouldRememberSession() }
  );
};

const requestTokenRefresh = async () => {
  if (typeof window === "undefined") return null;
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    for (const path of REFRESH_PATHS) {
      try {
        const role = useAuthStore.getState().role;
        const res = await client.post(
          path,
          {
            rotate: true,
            rotation: true,
            revokePrevious: true,
            audience: role === "ADMIN" ? "ADMIN" : "USER",
            portal: role === "ADMIN" ? "ADMIN" : "WEB"
          },
          {
            headers: {
              "X-Skip-Auth": "1"
            }
          }
        );

        const root = asRecord(res.data);
        const token =
          readTokenCandidate(root) ||
          readTokenCandidate(asRecord(root?.data)) ||
          readTokenCandidate(asRecord(root?.payload)) ||
          readTokenCandidate(asRecord(root?.result));

        if (!token) {
          throw new Error("Invalid refresh response");
        }

        persistRefreshedSession(res.data, token);
        return token;
      } catch (error) {
        if (shouldTryNextEndpoint(error)) {
          continue;
        }
        throw error;
      }
    }

    return null;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

const createConfiguredClient = (baseURL?: string) =>
  axios.create({
    baseURL,
    withCredentials: true,
    headers: {
      "Content-Type": "application/json"
    }
  });

const attachInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use((config) => {
  const headers: any = config.headers || {};

  // Do not force JSON content type for FormData requests (avatar/media uploads).
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof headers.delete === "function") {
      headers.delete("Content-Type");
      headers.delete("content-type");
    } else {
      delete headers["Content-Type"];
      delete headers["content-type"];
    }
    config.headers = headers;
  }

  const skipAuthHeader =
    (typeof headers.get === "function"
      ? headers.get("X-Skip-Auth") || headers.get("x-skip-auth")
      : headers["X-Skip-Auth"] || headers["x-skip-auth"]) || "";
  if (skipAuthHeader) {
    if (typeof headers.delete === "function") {
      headers.delete("X-Skip-Auth");
      headers.delete("x-skip-auth");
    } else {
      delete headers["X-Skip-Auth"];
      delete headers["x-skip-auth"];
    }
    config.headers = headers;
    return config;
  }

  if (typeof headers.set === "function") {
    headers.set("X-Locale", readStoredLocale());
    headers.set("Accept-Language", readStoredLocale());
  } else {
    headers["X-Locale"] = readStoredLocale();
    headers["Accept-Language"] = readStoredLocale();
  }

  const token = readStoredToken();
  if (!token) return config;

  const existingAuth =
    (typeof headers.get === "function" ? headers.get("Authorization") || headers.get("authorization") : undefined) ||
    headers.Authorization ||
    headers.authorization;

  if (!existingAuth) {
    if (typeof headers.set === "function") {
      headers.set("Authorization", `Bearer ${token}`);
    } else {
      headers.Authorization = `Bearer ${token}`;
    }
    config.headers = headers;
  }

  return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
    const config = error.config as RetryableRequestConfig | undefined;
    const status = error.response?.status;

    if (!config || typeof window === "undefined") {
      return Promise.reject(error);
    }

    const hasStoredToken = Boolean(readStoredToken());
    const url = String(config.url || "");
    const canAttemptRefresh = hasStoredToken && status === 401 && !config._retry && !isAuthRecoveryRequest(url);

    if (canAttemptRefresh) {
      config._retry = true;

      try {
        const refreshedToken = await requestTokenRefresh();
        if (refreshedToken) {
          const headers: any = config.headers || {};
          if (typeof headers.set === "function") {
            headers.set("Authorization", `Bearer ${refreshedToken}`);
          } else {
            headers.Authorization = `Bearer ${refreshedToken}`;
          }
          config.headers = headers;
          return instance(config);
        }
      } catch {
        // Forced logout fallback is handled below.
      }

      triggerClientLogout({ reason: "unauthorized_refresh", source: "forced" });
      return Promise.reject(error);
    }

    if (hasStoredToken && status === 401 && config._retry && !isAuthRecoveryRequest(url)) {
      triggerClientLogout({ reason: "unauthorized_retry", source: "forced" });
    }

    return Promise.reject(error);
    }
  );
};

export const client = createConfiguredClient(DEFAULT_API_BASE_URL);
export const appApi = createConfiguredClient(resolveAppApiBaseURL(DEFAULT_API_BASE_URL));

attachInterceptors(client);
attachInterceptors(appApi);

// Old name compatibility
export const api = client;
