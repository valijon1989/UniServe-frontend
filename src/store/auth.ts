"use client";

import { create } from "zustand";
import { decodeJwt } from "@/utils/jwt";

export type UserRole = "USER" | "AGENT" | "ADMIN";

interface UserProfile {
  name?: string;
  avatarUrl?: string;
  username?: string;
}

interface AuthState {
  token: string | null;
  userId: string | null;
  role: UserRole | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setSession: (token: string, profile?: UserProfile | null, role?: UserRole | null, userId?: string | null) => void;
  logout: () => void;
  hydrateFromStorage: () => void;
}

const TOKEN_KEY = "uniserve_token";

function parseToken(token: string) {
  const payload = decodeJwt(token);
  if (!payload) return { role: null, userId: null, name: undefined, avatarUrl: undefined, username: undefined };
  return {
    role: (payload.role || payload.roleName || payload.userRole || payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]) as UserRole | null,
    userId: (payload.sub || payload._id || payload.userId || payload.id || payload.uid || null) as string | null,
    name: payload.name as string | undefined,
    avatarUrl: payload.avatar || payload.avatarUrl || undefined,
    username: payload.username || payload.nick || undefined
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  role: null,
  profile: null,
  isAuthenticated: false,
  isHydrated: false,
  setSession: (token, profile, roleOverride, userIdOverride) => {
    const parsed = parseToken(token);
    const role = roleOverride || parsed.role;
    const userId = userIdOverride || parsed.userId;
    const mergedProfile: UserProfile | null = {
      name: profile?.name ?? parsed.name,
      avatarUrl: profile?.avatarUrl ?? parsed.avatarUrl,
      username: profile?.username ?? parsed.username
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, token);
      if (mergedProfile) {
        window.localStorage.setItem("uniserve_user_profile", JSON.stringify(mergedProfile));
      }
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
  logout: () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("uniserve_user_profile");
      window.localStorage.removeItem("uniserve_user");
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
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    if (!storedToken) {
      set({ isHydrated: true, isAuthenticated: false, token: null, role: null, userId: null, profile: null });
      return;
    }
    const parsed = parseToken(storedToken);
    if (!parsed || (!parsed.userId && !parsed.role)) {
      window.localStorage.removeItem(TOKEN_KEY);
      set({ isHydrated: true, isAuthenticated: false, token: null, role: null, userId: null, profile: null });
      return;
    }
    let storedProfile: UserProfile | null = null;
    const rawProfile = window.localStorage.getItem("uniserve_user_profile");
    if (rawProfile) {
      try {
        storedProfile = JSON.parse(rawProfile);
      } catch {
        storedProfile = null;
      }
    }
    set({
      token: storedToken,
      userId: parsed.userId,
      role: parsed.role ?? null,
      profile: storedProfile || { name: parsed.name, avatarUrl: parsed.avatarUrl, username: parsed.username },
      isAuthenticated: true,
      isHydrated: true
    });
  }
}));
