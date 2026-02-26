"use client";

const ACCESS_TOKEN_KEY = "uniserve_token";

const safeSet = (storage: Storage, key: string, value: string) => {
  try {
    storage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const safeRemove = (storage: Storage, key: string) => {
  try {
    storage.removeItem(key);
  } catch {
    // ignore storage write errors
  }
};

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY) || window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string, rememberMe = true): void {
  if (typeof window === "undefined") return;

  const primary = rememberMe ? window.localStorage : window.sessionStorage;
  const secondary = rememberMe ? window.sessionStorage : window.localStorage;

  safeRemove(secondary, ACCESS_TOKEN_KEY);
  if (safeSet(primary, ACCESS_TOKEN_KEY, token)) return;
  safeSet(secondary, ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  if (typeof window === "undefined") return;
  safeRemove(window.localStorage, ACCESS_TOKEN_KEY);
  safeRemove(window.sessionStorage, ACCESS_TOKEN_KEY);
}

