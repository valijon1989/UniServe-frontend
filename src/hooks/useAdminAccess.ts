"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { enterAdminMode, enterAdminModeWithPasskey, getAdminAccess, setupAdminMfa, verifyAdminMfa } from "@/api/admin";
import { logoutEverywhere } from "@/api/auth";
import {
  ADMIN_MODE_TTL_MS,
  clearAdminModeTimestamp,
  deriveAdminModeTimestamp,
  getCachedAdminAccess,
  getCachedAdminAccessPromise,
  persistAdminModeTimestamp,
  readAdminModeTimestamp,
  resetAdminAccessClientState,
  setCachedAdminAccess,
  setCachedAdminAccessPromise
} from "@/lib/adminAccessState";
import { triggerClientLogout } from "@/lib/authSession";
import type { AdminAccess, AdminPermission, AdminScope } from "@/types/admin";
import { useAuthStore } from "@/store/auth";

export { resetAdminAccessClientState } from "@/lib/adminAccessState";

type UseAdminAccessResult = {
  loading: boolean;
  error: string | null;
  isUnauthorized: boolean;
  access: AdminAccess | null;
  status: string;
  isApproved: boolean;
  isBlocked: boolean;
  needsMfaSetup: boolean;
  needsAdminMode: boolean;
  isPrimary: boolean;
  isManager: boolean;
  mfaEnabled: boolean;
  requiresMfaSetup: boolean;
  roleBadge?: string;
  permissions: AdminPermission[];
  scopes: AdminScope[];
  workspace: AdminAccess["workspace"];
  adminSession: AdminAccess["adminSession"];
  adminModeAt: number;
  adminModeActive: boolean;
  refresh: (options?: { force?: boolean }) => Promise<void>;
  can: (permission: AdminPermission) => boolean;
  canAny: (permissionList: AdminPermission[]) => boolean;
  hasScope: (module: string, category?: string, subcategory?: string) => boolean;
  enterMode: (payload: { totpCode?: string; passkeyAssertion?: string }) => Promise<void>;
  enterModeWithPasskey: () => Promise<void>;
  clearMode: () => void;
  requireFreshMode: () => boolean;
  beginMfaSetup: (method: "TOTP" | "EMAIL_OTP") => Promise<any>;
  confirmMfaSetup: (payload: { method: "TOTP" | "EMAIL_OTP"; code: string }) => Promise<any>;
};

const AdminAccessContext = createContext<UseAdminAccessResult | null>(null);

const readAccessShared = async (force = false) => {
  if (!force) {
    const cachedAccess = getCachedAdminAccess();
    if (cachedAccess) return cachedAccess;

    const cachedPromise = getCachedAdminAccessPromise();
    if (cachedPromise) return cachedPromise;
  }

  const request = getAdminAccess()
    .then((value) => {
      setCachedAdminAccess(value);
      return value;
    })
    .finally(() => {
      setCachedAdminAccessPromise(null);
    });

  setCachedAdminAccessPromise(request);
  return request;
};

const getErrorStatus = (error: unknown) => {
  return (error as { response?: { status?: number } })?.response?.status;
};

const normalizeScopeValue = (value: string | undefined) => {
  return String(value || "")
    .trim()
    .toLowerCase();
};

const isScopeMatch = (scope: AdminScope, module: string, category?: string, subcategory?: string) => {
  const scopeModule = normalizeScopeValue(scope.module);
  const targetModule = normalizeScopeValue(module);
  const moduleMatch = scopeModule === "*" || scopeModule === targetModule;
  if (!moduleMatch) return false;
  const targetCategory = normalizeScopeValue(category);
  if (!targetCategory) return true;

  const scopeCategory = normalizeScopeValue(scope.category);
  if (!scopeCategory || scopeCategory === "*") return true;
  if (scopeCategory !== targetCategory) return false;

  const targetSubcategory = normalizeScopeValue(subcategory);
  if (!targetSubcategory) return true;

  const scopeSubcategory = normalizeScopeValue(scope.subcategory);
  if (!scopeSubcategory || scopeSubcategory === "*") return true;
  return scopeSubcategory === targetSubcategory;
};

function useAdminAccessState(): UseAdminAccessResult {
  const { token, role, isAuthenticated, isHydrated, hydrateFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [access, setAccess] = useState<AdminAccess | null>(null);
  const [adminModeAt, setAdminModeAt] = useState(0);
  const forcedLogoutRef = useRef(false);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const clearAccessState = useCallback((unauthorized = true) => {
    resetAdminAccessClientState();
    setAccess(null);
    setError(null);
    setIsUnauthorized(unauthorized);
    setAdminModeAt(0);
    setLoading(false);
  }, []);

  const forceLogout = useCallback(
    async (reason: string, payload?: { adminSessionId?: string; adminStatus?: string }) => {
      if (forcedLogoutRef.current) return;
      forcedLogoutRef.current = true;

      await logoutEverywhere({
        audience: "ADMIN",
        reason,
        adminSessionId: payload?.adminSessionId,
        adminStatus: payload?.adminStatus
      });

      triggerClientLogout({
        audience: "ADMIN",
        reason,
        source: "forced"
      });
    },
    []
  );

  const refresh = useCallback(
    async (options?: { force?: boolean }) => {
      if (!isHydrated) {
        setLoading(true);
        return;
      }

      if (!isAuthenticated || !token || role !== "ADMIN") {
        forcedLogoutRef.current = false;
        clearAccessState(true);
        return;
      }

      setLoading(true);
      setError(null);
      setIsUnauthorized(false);

      try {
        const data = await readAccessShared(Boolean(options?.force));
        if (data.status !== "APPROVED") {
          await forceLogout(`admin_status_${String(data.status).toLowerCase()}`, {
            adminSessionId: data.adminSession?.sessionId,
            adminStatus: data.status
          });
          clearAccessState(true);
          return;
        }

        forcedLogoutRef.current = false;
        setAccess(data);

        const storedVerifiedAt = readAdminModeTimestamp();
        const derivedVerifiedAt = deriveAdminModeTimestamp(data);
        const nextVerifiedAt = Math.max(storedVerifiedAt, derivedVerifiedAt);
        if (nextVerifiedAt > 0 && Date.now() - nextVerifiedAt < ADMIN_MODE_TTL_MS) {
          persistAdminModeTimestamp(nextVerifiedAt);
          setAdminModeAt(nextVerifiedAt);
        } else {
          clearAdminModeTimestamp();
          setAdminModeAt(0);
        }
      } catch (err: unknown) {
        const status = getErrorStatus(err);
        if (status === 401 || status === 403) {
          await forceLogout("admin_access_denied");
          clearAccessState(true);
          return;
        }

        setError((err as { message?: string })?.message || "Admin access check failed");
        setAccess(null);
        setIsUnauthorized(false);
      } finally {
        setLoading(false);
      }
    },
    [clearAccessState, forceLogout, isAuthenticated, isHydrated, role, token]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!isHydrated || !isAuthenticated || role !== "ADMIN" || !token || typeof window === "undefined") {
      return;
    }

    const onFocus = () => {
      void refresh({ force: true });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void refresh({ force: true });
      }
    };
    const intervalId = window.setInterval(() => {
      void refresh({ force: true });
    }, 60_000);

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated, isHydrated, refresh, role, token]);

  const adminModeAgeMs = Date.now() - adminModeAt;
  const adminModeActive = adminModeAt > 0 && adminModeAgeMs < ADMIN_MODE_TTL_MS;
  const mfaEnabled = Boolean(access?.mfaEnabled);
  const requiresMfaSetup = Boolean(access?.requiresMfaSetup);
  const status = access?.status || "PENDING";
  const isApproved = status === "APPROVED";
  const isBlocked = status === "SUSPENDED" || status === "REVOKED";
  const needsMfaSetup = isApproved && !mfaEnabled && requiresMfaSetup;
  const needsAdminMode = isApproved && mfaEnabled && !adminModeActive;

  const permissions = access?.permissions || [];
  const scopes = access?.scopes || [];

  const can = useCallback(
    (permission: AdminPermission) => {
      if (!isApproved) return false;
      if (permission === "agents.read") {
        return permissions.includes("agents.read") || permissions.includes("agents.verify");
      }
      if (permission === "agents.verify") {
        return permissions.includes("agents.verify") || permissions.includes("agents.read");
      }
      return permissions.includes(permission);
    },
    [isApproved, permissions]
  );

  const canAny = useCallback(
    (permissionList: AdminPermission[]) => {
      if (!permissionList.length) return false;
      return permissionList.some((permission) => can(permission));
    },
    [can]
  );

  const hasScope = useCallback(
    (module: string, category?: string, subcategory?: string) => {
      if (!isApproved) return false;
      if (!scopes.length) return true;
      return scopes.some((scope) => isScopeMatch(scope, module, category, subcategory));
    },
    [isApproved, scopes]
  );

  const enterMode = useCallback(async (payload: { totpCode?: string; passkeyAssertion?: string }) => {
    await enterAdminMode(payload);
    const now = Date.now();
    persistAdminModeTimestamp(now);
    setAdminModeAt(now);
  }, []);

  const enterModeWithPasskey = useCallback(async () => {
    await enterAdminModeWithPasskey();
    const now = Date.now();
    persistAdminModeTimestamp(now);
    setAdminModeAt(now);
  }, []);

  const clearMode = useCallback(() => {
    clearAdminModeTimestamp();
    setAdminModeAt(0);
  }, []);

  const beginMfaSetup = useCallback(async (method: "TOTP" | "EMAIL_OTP") => {
    return setupAdminMfa({ method });
  }, []);

  const confirmMfaSetup = useCallback(
    async (payload: { method: "TOTP" | "EMAIL_OTP"; code: string }) => {
      const result = await verifyAdminMfa(payload);
      setCachedAdminAccess(null);
      await refresh({ force: true });
      return result;
    },
    [refresh]
  );

  const requireFreshMode = useCallback(() => {
    if (!mfaEnabled) return true;
    if (!adminModeAt) return false;
    return Date.now() - adminModeAt < ADMIN_MODE_TTL_MS;
  }, [adminModeAt, mfaEnabled]);

  return useMemo(
    () => ({
      loading,
      error,
      isUnauthorized,
      access,
      status,
      isApproved,
      isBlocked,
      needsMfaSetup,
      needsAdminMode,
      isPrimary: access?.level === "PRIMARY",
      isManager: access?.level === "MANAGER" || access?.level === "PRIMARY",
      mfaEnabled,
      requiresMfaSetup,
      roleBadge: access?.roleBadge,
      permissions,
      scopes,
      workspace: access?.workspace,
      adminSession: access?.adminSession,
      adminModeAt,
      adminModeActive,
      refresh,
      can,
      canAny,
      hasScope,
      enterMode,
      enterModeWithPasskey,
      clearMode,
      requireFreshMode,
      beginMfaSetup,
      confirmMfaSetup
    }),
    [
      loading,
      error,
      isUnauthorized,
      access,
      status,
      isApproved,
      isBlocked,
      needsMfaSetup,
      needsAdminMode,
      mfaEnabled,
      requiresMfaSetup,
      permissions,
      scopes,
      access?.roleBadge,
      access?.workspace,
      access?.adminSession,
      adminModeAt,
      adminModeActive,
      refresh,
      can,
      canAny,
      hasScope,
      enterMode,
      enterModeWithPasskey,
      clearMode,
      requireFreshMode,
      beginMfaSetup,
      confirmMfaSetup
    ]
  );
}

export function AdminAccessProvider({ children }: { children: ReactNode }) {
  const value = useAdminAccessState();
  return createElement(AdminAccessContext.Provider, { value }, children);
}

export function useAdminAccess() {
  const context = useContext(AdminAccessContext);
  if (!context) {
    throw new Error("useAdminAccess must be used within AdminAccessProvider");
  }
  return context;
}
