"use client";

import { create } from "zustand";
import { decodeJwt } from "@/utils/jwt";

export type UserRole = "USER" | "AGENT" | "ADMIN";

interface UserProfile {
  name?: string;
  avatarUrl?: string;
  username?: string;
}

interface SessionOptions {
  rememberMe?: boolean;
}

interface SessionMeta {
  role?: UserRole | null;
  userId?: string | null;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (
    token: string,
    profile?: UserProfile | null,
    role?: UserRole | null,
    userId?: string | null,
    options?: SessionOptions
  ) => void;
  setRole: (role: UserRole | null) => void;
  updateProfile: (patch: Partial<UserProfile>) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

const TOKEN_KEY = "uniserve_token";
const PROFILE_KEY = "uniserve_user_profile";
const SESSION_META_KEY = "uniserve_session_meta";
const MAX_PERSISTED_DATA_AVATAR_LENGTH = 120_000;

function isQuotaExceeded(error: unknown) {
  return error instanceof DOMException && (error.name === "QuotaExceededError" || error.code === 22);
}

function safeSetItem(storage: Storage, key: string, value: string) {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function safeRemoveItem(storage: Storage, key: string) {
  try {
    storage.removeItem(key);
  } catch {
    // ignore storage write errors
  }
}

function readStorageItem(key: string) {
  if (typeof window === "undefined") return null;
  const localValue = window.localStorage.getItem(key);
  if (localValue) return localValue;
  return window.sessionStorage.getItem(key);
}

function shouldRememberFromStorage() {
  if (typeof window === "undefined") return true;
  if (window.localStorage.getItem(TOKEN_KEY)) return true;
  if (window.sessionStorage.getItem(TOKEN_KEY)) return false;
  return true;
}

function sanitizeProfileForStorage(profile: UserProfile | null): UserProfile | null {
  if (!profile) return null;
  const next: UserProfile = {};

  if (typeof profile.name === "string" && profile.name.trim()) {
    next.name = profile.name.trim();
  }
  if (typeof profile.username === "string" && profile.username.trim()) {
    next.username = profile.username.trim();
  }
  if (typeof profile.avatarUrl === "string" && profile.avatarUrl.trim()) {
    const avatar = profile.avatarUrl.trim();
    if (!avatar.startsWith("data:") || avatar.length <= MAX_PERSISTED_DATA_AVATAR_LENGTH) {
      next.avatarUrl = avatar;
    }
  }

  return Object.keys(next).length ? next : null;
}

function persistProfileToStorage(profile: UserProfile | null, rememberMe = true) {
  if (typeof window === "undefined") return;
  const primary = rememberMe ? window.localStorage : window.sessionStorage;
  const secondary = rememberMe ? window.sessionStorage : window.localStorage;

  const safeProfile = sanitizeProfileForStorage(profile);
  if (!safeProfile) {
    safeRemoveItem(primary, PROFILE_KEY);
    safeRemoveItem(secondary, PROFILE_KEY);
    return;
  }

  safeRemoveItem(secondary, PROFILE_KEY);
  const serialized = JSON.stringify(safeProfile);

  try {
    primary.setItem(PROFILE_KEY, serialized);
    return;
  } catch (error) {
    if (isQuotaExceeded(error)) {
      const minimalProfile: UserProfile = {};
      if (safeProfile.name) minimalProfile.name = safeProfile.name;
      if (safeProfile.username) minimalProfile.username = safeProfile.username;
      const minimalSerialized = JSON.stringify(minimalProfile);

      try {
        if (Object.keys(minimalProfile).length > 0) {
          primary.setItem(PROFILE_KEY, minimalSerialized);
        } else {
          primary.removeItem(PROFILE_KEY);
        }
        return;
      } catch {
        if (Object.keys(minimalProfile).length > 0 && safeSetItem(secondary, PROFILE_KEY, minimalSerialized)) {
          return;
        }
      }
    }
  }

  safeRemoveItem(primary, PROFILE_KEY);
  safeRemoveItem(secondary, PROFILE_KEY);
}

function persistTokenToStorage(token: string, rememberMe = true) {
  if (typeof window === "undefined") return;
  const primary = rememberMe ? window.localStorage : window.sessionStorage;
  const secondary = rememberMe ? window.sessionStorage : window.localStorage;

  safeRemoveItem(secondary, TOKEN_KEY);
  if (safeSetItem(primary, TOKEN_KEY, token)) {
    return;
  }

  if (safeSetItem(secondary, TOKEN_KEY, token)) return;

  safeRemoveItem(primary, TOKEN_KEY);
  safeRemoveItem(secondary, TOKEN_KEY);
}

function sanitizeSessionMeta(meta: SessionMeta | null | undefined): SessionMeta | null {
  if (!meta) return null;
  const clean: SessionMeta = {};
  if (typeof meta.userId === "string" && meta.userId.trim()) clean.userId = meta.userId.trim();
  if (meta.role === "USER" || meta.role === "AGENT" || meta.role === "ADMIN") clean.role = meta.role;
  return Object.keys(clean).length ? clean : null;
}

function persistSessionMetaToStorage(meta: SessionMeta | null, rememberMe = true) {
  if (typeof window === "undefined") return;
  const primary = rememberMe ? window.localStorage : window.sessionStorage;
  const secondary = rememberMe ? window.sessionStorage : window.localStorage;

  const safeMeta = sanitizeSessionMeta(meta);
  if (!safeMeta) {
    safeRemoveItem(primary, SESSION_META_KEY);
    safeRemoveItem(secondary, SESSION_META_KEY);
    return;
  }

  safeRemoveItem(secondary, SESSION_META_KEY);
  if (safeSetItem(primary, SESSION_META_KEY, JSON.stringify(safeMeta))) {
    return;
  }

  if (safeSetItem(secondary, SESSION_META_KEY, JSON.stringify(safeMeta))) {
    return;
  }

  safeRemoveItem(primary, SESSION_META_KEY);
  safeRemoveItem(secondary, SESSION_META_KEY);
}

function readSessionMetaFromStorage(): SessionMeta | null {
  const raw = readStorageItem(SESSION_META_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as SessionMeta;
    return sanitizeSessionMeta(parsed);
  } catch {
    return null;
  }
}

function parseToken(token: string) {
  const payload = decodeJwt(token);
  if (!payload) {
    return { role: null, userId: null, name: undefined, avatarUrl: undefined, username: undefined, exp: null };
  }
  const rawRole = String(
    payload.role ||
      payload.roleName ||
      payload.userRole ||
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      ""
  )
    .trim()
    .toUpperCase();
  const role: UserRole | null =
    rawRole === "USER" || rawRole === "AGENT" || rawRole === "ADMIN" ? (rawRole as UserRole) : null;
  const rawExp = payload.exp;
  const exp = typeof rawExp === "number" && Number.isFinite(rawExp) ? rawExp : null;
  return {
    role,
    userId: (payload.sub || payload._id || payload.userId || payload.id || payload.uid || null) as string | null,
    name: payload.name as string | undefined,
    avatarUrl: payload.avatar || payload.avatarUrl || undefined,
    username: payload.username || payload.nick || undefined,
    exp
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  profile: null,
  isAuthenticated: false,
  isHydrated: false,
  setSession: (token, profile, roleOverride, userIdOverride, options) => {
    const parsed = parseToken(token);
    const role = roleOverride || parsed.role;
    const userId = userIdOverride || parsed.userId;
    const rememberMe = options?.rememberMe !== false;
    const mergedProfile: UserProfile | null = {
      name: profile?.name ?? parsed.name,
      avatarUrl: profile?.avatarUrl ?? parsed.avatarUrl,
      username: profile?.username ?? parsed.username
    };
    if (typeof window !== "undefined") {
      persistTokenToStorage(token, rememberMe);
      persistProfileToStorage(mergedProfile, rememberMe);
      persistSessionMetaToStorage({ role: role ?? null, userId: userId ?? null }, rememberMe);
    }
    set({
      token,
      userId: userId ?? null,
      role: role ?? null,
      profile: mergedProfile,
      isAuthenticated: true,
      isHydrated: true
    });
  },
  setRole: (role) => {
    set((state) => {
      const safeRole = role === "USER" || role === "AGENT" || role === "ADMIN" ? role : null;
      if (typeof window !== "undefined") {
        persistSessionMetaToStorage({ role: safeRole, userId: state.userId ?? null }, shouldRememberFromStorage());
      }
      return { role: safeRole };
    });
  },
  updateProfile: (patch) => {
    set((state) => {
      const nextProfile: UserProfile = {
        ...(state.profile || {}),
        ...patch
      };

      if (typeof window !== "undefined") {
        persistProfileToStorage(nextProfile, shouldRememberFromStorage());
      }

      return { profile: nextProfile };
    });
  },
  logout: () => {
    if (typeof window !== "undefined") {
      safeRemoveItem(window.localStorage, TOKEN_KEY);
      safeRemoveItem(window.localStorage, PROFILE_KEY);
      safeRemoveItem(window.localStorage, SESSION_META_KEY);
      safeRemoveItem(window.localStorage, "uniserve_user");
      safeRemoveItem(window.sessionStorage, TOKEN_KEY);
      safeRemoveItem(window.sessionStorage, PROFILE_KEY);
      safeRemoveItem(window.sessionStorage, SESSION_META_KEY);
      safeRemoveItem(window.sessionStorage, "uniserve_user");
    }
    set({
      token: null,
      userId: null,
      role: null,
      profile: null,
      isAuthenticated: false,
      isHydrated: true
    });
  },
  hydrateFromStorage: () => {
    if (typeof window === "undefined") return;
    const storedToken = readStorageItem(TOKEN_KEY);
    if (!storedToken) {
      set({ isHydrated: true, isAuthenticated: false, token: null, role: null, userId: null, profile: null });
      return;
    }
    const parsed = parseToken(storedToken);
    const isExpired = typeof parsed.exp === "number" && Date.now() >= parsed.exp * 1000;
    if (isExpired) {
      safeRemoveItem(window.localStorage, TOKEN_KEY);
      safeRemoveItem(window.sessionStorage, TOKEN_KEY);
      safeRemoveItem(window.localStorage, PROFILE_KEY);
      safeRemoveItem(window.sessionStorage, PROFILE_KEY);
      safeRemoveItem(window.localStorage, SESSION_META_KEY);
      safeRemoveItem(window.sessionStorage, SESSION_META_KEY);
      set({ isHydrated: true, isAuthenticated: false, token: null, role: null, userId: null, profile: null });
      return;
    }
    const meta = readSessionMetaFromStorage();
    // Prefer explicit stored meta to avoid stale JWT role after in-app role upgrades.
    const role = meta?.role ?? parsed.role ?? null;
    const userId = parsed.userId ?? meta?.userId ?? null;
    let storedProfile: UserProfile | null = null;
    const rawProfile = readStorageItem(PROFILE_KEY);
    if (rawProfile) {
      try {
        storedProfile = JSON.parse(rawProfile);
      } catch {
        storedProfile = null;
      }
    }
    set({
      token: storedToken,
      userId,
      role,
      profile: storedProfile || { name: parsed.name, avatarUrl: parsed.avatarUrl, username: parsed.username },
      isAuthenticated: true,
      isHydrated: true
    });
  }
}));
