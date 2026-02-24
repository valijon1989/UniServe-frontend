import { client } from "../api/client";

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
