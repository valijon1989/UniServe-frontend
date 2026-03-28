"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api";
import type { User, AuthResponse } from "../types/auth";
import { AUTH_LOGOUT_EVENT } from "@/lib/authSession";
import { useAuthStore } from "@/store/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "AGENT";
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "uniserve_token";
const SOCKET_TOKEN_KEY = "accessToken";

const readStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY) || window.sessionStorage.getItem(TOKEN_KEY);
};

const clearStoredToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(SOCKET_TOKEN_KEY);
};

const syncSocketToken = (token: string | null) => {
  if (typeof window === "undefined") return;

  if (token) {
    window.localStorage.setItem(SOCKET_TOKEN_KEY, token);
    return;
  }

  window.localStorage.removeItem(SOCKET_TOKEN_KEY);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const {
    token: storeToken,
    userId: storeUserId,
    role: storeRole,
    profile: storeProfile,
    isAuthenticated: storeAuthenticated,
    isHydrated: storeHydrated,
    hydrateFromStorage,
    setSession: setStoreSession,
    logout: logoutStore
  } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!storeHydrated) return;

    setToken(storeToken);
    syncSocketToken(storeToken);

    if (storeAuthenticated && storeRole) {
      setUser({
        id: storeUserId || "",
        name: storeProfile?.name || "",
        email: "",
        role: storeRole,
        avatarUrl: storeProfile?.avatarUrl
      });
    } else {
      setUser(null);
    }

    setLoading(false);
  }, [storeAuthenticated, storeHydrated, storeProfile?.avatarUrl, storeProfile?.name, storeRole, storeToken, storeUserId]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleLogoutSignal = () => {
      setUser(null);
      setToken(null);
      setLoading(false);
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleLogoutSignal as EventListener);
    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleLogoutSignal as EventListener);
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    setUser(res.data.user);
    setToken(res.data.token);
    syncSocketToken(res.data.token);
    setStoreSession(
      res.data.token,
      {
        name: res.data.user.name,
        avatarUrl: res.data.user.avatarUrl
      },
      res.data.user.role,
      res.data.user.id || null
    );
  };

  const signup = async (data: {
    name: string;
    email: string;
    password: string;
    role: "USER" | "AGENT";
  }) => {
    const res = await api.post<AuthResponse>("/auth/register", data);
    setUser(res.data.user);
    setToken(res.data.token);
    syncSocketToken(res.data.token);
    setStoreSession(
      res.data.token,
      {
        name: res.data.user.name,
        avatarUrl: res.data.user.avatarUrl
      },
      res.data.user.role,
      res.data.user.id || null
    );
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    syncSocketToken(null);
    clearStoredToken();
    logoutStore();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
