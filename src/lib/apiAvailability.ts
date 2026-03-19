"use client";

const API_UNAVAILABLE_KEY = "uniserve_api_unavailable_until";
const DEFAULT_API_UNAVAILABLE_MS = 30_000;

const readStorage = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage;
};

const readUnavailableUntil = () => {
  const storage = readStorage();
  if (!storage) return 0;
  const raw = storage.getItem(API_UNAVAILABLE_KEY);
  const value = Number(raw || 0);
  return Number.isFinite(value) ? value : 0;
};

export const isApiTemporarilyUnavailable = () => {
  if (typeof window === "undefined") return false;
  return readUnavailableUntil() > Date.now();
};

export const markApiTemporarilyUnavailable = (durationMs = DEFAULT_API_UNAVAILABLE_MS) => {
  const storage = readStorage();
  if (!storage) return;
  storage.setItem(API_UNAVAILABLE_KEY, String(Date.now() + durationMs));
};

export const clearApiTemporarilyUnavailable = () => {
  const storage = readStorage();
  if (!storage) return;
  storage.removeItem(API_UNAVAILABLE_KEY);
};

export const isBackendNetworkError = (error: unknown) => {
  const code = (error as { code?: string })?.code || "";
  const message = String((error as { message?: string })?.message || "");
  const status = (error as { response?: { status?: number } })?.response?.status;
  return (
    typeof status !== "number" &&
    (code === "ERR_NETWORK" ||
      code === "ERR_API_UNAVAILABLE" ||
      /network error/i.test(message) ||
      /api temporarily unavailable/i.test(message))
  );
};
