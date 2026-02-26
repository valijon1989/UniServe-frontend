import { client } from "../api/client";
import { getAccessToken } from "./auth";

export const api = client;

// Kept for compatibility. Auth header is now managed by src/api/client.ts interceptor.
export const setAuthToken = (_token: string | null) => undefined;

export const API = {
  login: "/auth/login",
  register: "/auth/register",
  services: "/services",
  posts: "/posts",
  agents: "/agents"
};

const DEFAULT_BASE_URL = "http://localhost:5001/api";

const normalizeBaseUrl = (baseUrl: string) => baseUrl.replace(/\/+$/, "");

const buildRequestUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) return path;
  const baseUrl = normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL || DEFAULT_BASE_URL);
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export type ApiFetchOptions = Omit<RequestInit, "body" | "headers"> & {
  body?: unknown;
  headers?: Record<string, string>;
  withAuth?: boolean;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const {
    body,
    headers,
    withAuth = true,
    ...rest
  } = options;

  const finalHeaders: Record<string, string> = {
    ...(headers || {})
  };

  let finalBody: BodyInit | undefined;
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || typeof body === "string" || body instanceof URLSearchParams || body instanceof Blob) {
      finalBody = body as BodyInit;
      if (body instanceof FormData) {
        delete finalHeaders["Content-Type"];
        delete finalHeaders["content-type"];
      }
    } else {
      finalBody = JSON.stringify(body);
      if (!finalHeaders["Content-Type"]) {
        finalHeaders["Content-Type"] = "application/json";
      }
    }
  }

  if (withAuth) {
    const token = getAccessToken();
    if (token && !finalHeaders.Authorization) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(buildRequestUrl(path), {
    credentials: "include",
    ...rest,
    headers: finalHeaders,
    body: finalBody
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    let message = "Request failed";
    if (typeof payload === "string" && payload.trim()) {
      message = payload;
    } else if (payload && typeof payload === "object") {
      message = (payload as any).message || (payload as any).error || message;
    }
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
