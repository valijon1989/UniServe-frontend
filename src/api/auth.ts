import { api } from "./client";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: "USER" | "AGENT";
}

export interface MeResponse {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  avatarUrl?: string;
}

export async function login(payload: LoginPayload) {
  const res = await api.post("/api/auth/login", payload);
  const { token, user } = res.data;
  if (typeof window !== "undefined") {
    localStorage.setItem("uniserve_token", token);
    localStorage.setItem("uniserve_user", JSON.stringify(user));
  }
  return user as MeResponse;
}

export async function signup(payload: SignupPayload) {
  const res = await api.post("/api/auth/register", payload);
  return res.data;
}

export async function getMe(): Promise<MeResponse | null> {
  try {
    const res = await api.get("/api/auth/me");
    return res.data as MeResponse;
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("uniserve_token");
    localStorage.removeItem("uniserve_user");
  }
}
