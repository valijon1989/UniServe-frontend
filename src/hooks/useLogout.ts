"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { logoutEverywhere } from "@/api/auth";
import { getDefaultLogoutRedirect, triggerClientLogout } from "@/lib/authSession";

type LogoutOptions = {
  redirectTo?: string;
  reason?: string;
  audience?: "ADMIN" | "USER" | "AGENT";
  adminSessionId?: string | null;
  adminStatus?: string | null;
};

const readErrorMessage = (error: unknown) => {
  const apiMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (typeof apiMessage === "string" && apiMessage.trim()) return apiMessage.trim();
  const fallback = (error as { message?: string })?.message;
  if (typeof fallback === "string" && fallback.trim()) return fallback.trim();
  return null;
};

export function useLogout(defaultOptions?: { redirectTo?: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  const logout = useCallback(
    async (options?: LogoutOptions) => {
      if (isLoggingOut) return;

      const audience = options?.audience;
      const redirectTo = options?.redirectTo || defaultOptions?.redirectTo || getDefaultLogoutRedirect(audience);
      const reason = options?.reason || "manual";
      let message: string | null = null;

      setIsLoggingOut(true);
      setLogoutError(null);

      try {
        const result = await logoutEverywhere({
          audience,
          reason,
          adminSessionId: options?.adminSessionId,
          adminStatus: options?.adminStatus
        });
        message = result.remoteCleared ? null : readErrorMessage(result.error);
      } finally {
        triggerClientLogout({
          audience,
          reason,
          redirectTo,
          source: reason === "manual" ? "manual" : "forced"
        });
        if (message) {
          setLogoutError(message);
        }
        router.replace(redirectTo);
        setIsLoggingOut(false);
      }
    },
    [defaultOptions?.redirectTo, isLoggingOut, router]
  );

  const forceLogout = useCallback(
    (options?: LogoutOptions) => {
      const audience = options?.audience;
      const redirectTo = options?.redirectTo || defaultOptions?.redirectTo || getDefaultLogoutRedirect(audience);
      triggerClientLogout({
        audience,
        reason: options?.reason || "forced",
        redirectTo,
        source: "forced"
      });
      router.replace(redirectTo);
    },
    [defaultOptions?.redirectTo, router]
  );

  return {
    logout,
    forceLogout,
    isPending: isLoggingOut,
    warning: logoutError,
    isLoggingOut,
    logoutError
  };
}
