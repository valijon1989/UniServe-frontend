"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { api, setAuthToken } from "../lib/api";
import type { User, AuthResponse } from "../types/auth";

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = typeof window !== "undefined"
      ? window.localStorage.getItem(TOKEN_KEY)
      : null;

    if (storedToken) {
      setToken(storedToken);
      setAuthToken(storedToken);
      api
        .get<User>("/auth/me")
        .then((res) => setUser(res.data))
        .catch(() => {
          window.localStorage.removeItem(TOKEN_KEY);
          setAuthToken(null);
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    setUser(res.data.user);
    setToken(res.data.token);
    setAuthToken(res.data.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, res.data.token);
      window.localStorage.setItem("uniserve_user", JSON.stringify(res.data.user));
    }
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
    setAuthToken(res.data.token);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(TOKEN_KEY, res.data.token);
      window.localStorage.setItem("uniserve_user", JSON.stringify(res.data.user));
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem("uniserve_user");
    }
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
