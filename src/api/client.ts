import axios from "axios";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

client.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;

  const token = window.localStorage.getItem("uniserve_token");
  if (!token) return config;

  const headers: any = config.headers || {};
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

// Old name compatibility
export const api = client;
