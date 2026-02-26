import { api } from "./client";

export interface LoginPayload {
  identifier: string;
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

export interface LoginResponse {
  token: string;
  user: MeResponse & { id?: string };
}

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const readTokenCandidate = (source: Record<string, any> | null): string | null => {
  if (!source) return null;
  const direct = source.token || source.accessToken || source.access_token || source.jwt;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const nestedAuth = asRecord(source.auth) || asRecord(source.tokens);
  if (!nestedAuth) return null;
  const nested = nestedAuth.token || nestedAuth.accessToken || nestedAuth.access_token || nestedAuth.jwt;
  return typeof nested === "string" && nested.trim() ? nested.trim() : null;
};

const readUserCandidate = (source: Record<string, any> | null): (MeResponse & { id?: string }) | null => {
  if (!source) return null;
  const directUser = asRecord(source.user) || asRecord(source.me) || asRecord(source.profile);
  if (directUser) return directUser as MeResponse & { id?: string };

  if (typeof source._id === "string" || typeof source.id === "string") {
    return source as MeResponse & { id?: string };
  }

  return null;
};

const unwrapLoginPayload = (raw: unknown): LoginResponse => {
  const root = asRecord(raw);
  const data = asRecord(root?.data);
  const payload = asRecord(root?.payload);
  const result = asRecord(root?.result);
  const candidates = [root, data, payload, result];

  let token: string | null = null;
  let user: (MeResponse & { id?: string }) | null = null;

  for (const candidate of candidates) {
    if (!token) token = readTokenCandidate(candidate);
    if (!user) user = readUserCandidate(candidate);
    if (token && user) break;
  }

  if (!token || !user) {
    throw new Error("Invalid login response");
  }

  return { token, user };
};

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const identifier = payload.identifier.trim();
  const requestBody = {
    identifier,
    email: identifier,
    username: identifier,
    password: payload.password
  };
  const res = await api.post("/auth/login", requestBody);
  return unwrapLoginPayload(res.data);
}

export async function forgotUsername(email: string): Promise<void> {
  await api.post("/auth/forgot-username", { email: email.trim() });
}

export async function forgotPassword(identifier: string): Promise<void> {
  const clean = identifier.trim();
  await api.post("/auth/forgot-password", {
    identifier: clean,
    email: clean,
    username: clean
  });
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  await api.post("/auth/reset-password", {
    token: token.trim(),
    newPassword
  });
}

export async function signup(payload: SignupPayload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function getMe(): Promise<MeResponse | null> {
  try {
    const res = await api.get("/auth/me");
    const root = asRecord(res.data);
    const nested = asRecord(root?.user) || asRecord(root?.data) || root;
    if (!nested) return null;
    return {
      _id: String(nested._id || nested.id || ""),
      name: String(nested.name || ""),
      email: String(nested.email || ""),
      role: (nested.role || "USER") as "USER" | "AGENT" | "ADMIN",
      avatarUrl: nested.avatarUrl || nested.avatar || undefined
    };
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("uniserve_token");
    sessionStorage.removeItem("uniserve_token");
    localStorage.removeItem("uniserve_user");
    sessionStorage.removeItem("uniserve_user");
  }
}
