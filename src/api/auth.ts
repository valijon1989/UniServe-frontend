import { api, appApi } from "./client";
import { decodeJwt } from "@/utils/jwt";

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface AdminLoginPayload extends LoginPayload {
  adminKey?: string;
  mfaCode?: string;
  recoveryCode?: string;
  deviceFingerprint?: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  role: "USER" | "AGENT";
}

export interface AdminSignupPayload {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  adminUsername?: string;
  adminKey?: string;
  inviteToken?: string;
  requireMfa?: boolean;
  registrationMode?: "PRIMARY" | "STAFF";
}

export interface MeResponse {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "AGENT" | "ADMIN";
  avatarUrl?: string;
  isAdmin?: boolean;
  adminLevel?: "PRIMARY" | "MANAGER" | "STAFF";
  adminAccessStatus?: "PENDING" | "APPROVED" | "SUSPENDED" | "REVOKED";
}

export interface LoginResponse {
  token: string;
  user: MeResponse & { id?: string };
}

export interface AdminSignupResponse {
  token?: string;
  user?: MeResponse & { id?: string };
  message?: string;
  status?: string;
}

export interface LogoutEverywhereOptions {
  audience?: "ADMIN" | "USER" | "AGENT";
  reason?: string;
  adminSessionId?: string | null;
  adminStatus?: string | null;
}

export interface LogoutEverywhereResult {
  remoteCleared: boolean;
  error?: unknown;
}

const ENDPOINT_MISSING_STATUSES = [404, 405, 501];

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const getStatus = (error: unknown) => {
  return (error as { response?: { status?: number } })?.response?.status;
};

const shouldTryNextEndpoint = (error: unknown) => {
  const status = getStatus(error);
  return typeof status === "number" && ENDPOINT_MISSING_STATUSES.includes(status);
};

async function postByPaths(paths: string[], body: Record<string, any>, config?: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.post(path, body, config);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No auth endpoint matched");
}

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

const parseAdminStatus = (source: Record<string, any> | null): string => {
  if (!source) return "PENDING";
  if (typeof source.adminAccessStatus === "string") return source.adminAccessStatus;
  if (typeof source.status === "string") return source.status;
  const nestedUser = asRecord(source.user) || asRecord(source.admin);
  if (nestedUser && typeof nestedUser.adminAccessStatus === "string") return nestedUser.adminAccessStatus;
  return "PENDING";
};

const parseAdminSignupResponse = (raw: unknown, fallbackStatus = "PENDING"): AdminSignupResponse => {
  try {
    const parsed = unwrapLoginPayload(raw);
    return { token: parsed.token, user: parsed.user, status: "APPROVED" };
  } catch {
    const root = asRecord(raw);
    const data = asRecord(root?.data) || root;
    return {
      token: readTokenCandidate(data) || undefined,
      user: readUserCandidate(data) || undefined,
      message:
        (typeof data?.message === "string" ? data.message : undefined) ||
        (typeof root?.message === "string" ? root.message : undefined),
      status: parseAdminStatus(data) || fallbackStatus
    };
  }
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

export async function adminLogin(payload: AdminLoginPayload): Promise<LoginResponse> {
  const identifier = payload.identifier.trim();
  const cleanAdminKey = payload.adminKey?.trim() || undefined;
  const requestBody = {
    adminIdentifier: identifier,
    adminPassword: payload.password,
    rememberMe: true,
    mfaCode: payload.mfaCode?.trim() || undefined,
    recoveryCode: payload.recoveryCode?.trim() || undefined,
    deviceFingerprint: payload.deviceFingerprint?.trim() || undefined,
    adminKey: cleanAdminKey,
    inviteCode: cleanAdminKey,
    accessCode: cleanAdminKey,
    code: cleanAdminKey,
    portal: "ADMIN",
    audience: "ADMIN"
  };

  const res = await postByPaths(["/admin/auth/login", "/admins/auth/login", "/auth/admin/login"], requestBody);

  const parsed = unwrapLoginPayload(res.data);
  const role = String(parsed.user?.role || "").toUpperCase();
  const parsedUser = parsed.user as unknown as { isAdmin?: boolean; adminLevel?: string };
  const isAdmin =
    role === "ADMIN" ||
    Boolean(parsedUser?.isAdmin) ||
    Boolean(parsedUser?.adminLevel);

  if (!isAdmin) {
    throw new Error("This login page is only for admin accounts.");
  }

  return parsed;
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

export async function signup(payload: SignupPayload): Promise<LoginResponse> {
  const res = await api.post("/auth/register", payload);
  return unwrapLoginPayload(res.data);
}

export async function adminSignup(payload: AdminSignupPayload): Promise<AdminSignupResponse> {
  const cleanAdminKey = payload.adminKey?.trim() || payload.inviteToken?.trim() || undefined;
  const registrationMode = payload.registrationMode || "STAFF";
  const requestedLevel = registrationMode === "PRIMARY" ? "PRIMARY" : "STAFF";
  const cleanEmail = payload.email.trim();
  const derivedUsername = (payload.adminUsername?.trim() || cleanEmail.split("@")[0] || "admin").toLowerCase();
  const cleanName = payload.name.trim();

  if (registrationMode === "PRIMARY") {
    if (!cleanAdminKey) {
      throw new Error("Primary admin key is required");
    }
    const primaryRegisterBody = {
      adminName: cleanName,
      adminEmail: cleanEmail,
      adminPassword: payload.password,
      adminUsername: derivedUsername,
      department: payload.department.trim(),
      position: payload.position.trim(),
      registrationMode: "PRIMARY",
      adminLevel: "PRIMARY",
      adminAccessCode: cleanAdminKey,
      accessCode: cleanAdminKey,
      inviteCode: cleanAdminKey,
      inviteToken: cleanAdminKey,
      adminInviteToken: cleanAdminKey,
      enableMfa: payload.requireMfa ?? true,
      requireMfa: payload.requireMfa ?? true
    };

    try {
      const primaryRegisterRes = await postByPaths(
        ["/admin/auth/register", "/admins/register", "/auth/admin/register"],
        primaryRegisterBody
      );
      return parseAdminSignupResponse(primaryRegisterRes.data, "APPROVED");
    } catch (error) {
      const status = getStatus(error);
      const canFallbackToBootstrap = typeof status === "number" && [404, 405, 501].includes(status);
      if (!canFallbackToBootstrap) {
        throw error;
      }
    }

    const bootstrapRes = await api.post(
      "/admin/primary/bootstrap",
      {
        email: cleanEmail,
        password: payload.password,
        name: cleanName,
        username: derivedUsername
      },
      {
        headers: {
          "x-admin-bootstrap-key": cleanAdminKey
        }
      }
    );
    return parseAdminSignupResponse(bootstrapRes.data, "APPROVED");
  }

  const requestBody = {
    adminName: cleanName,
    adminEmail: cleanEmail,
    adminPassword: payload.password,
    adminUsername: derivedUsername,
    department: payload.department.trim(),
    position: payload.position.trim(),
    registrationMode,
    adminLevel: requestedLevel,
    inviteToken: cleanAdminKey,
    adminInviteToken: cleanAdminKey,
    adminAccessCode: cleanAdminKey,
    enableMfa: payload.requireMfa ?? true,
    requireMfa: payload.requireMfa ?? true
  };

  const res = await postByPaths(["/admin/auth/register", "/admins/register", "/auth/admin/register"], requestBody);
  return parseAdminSignupResponse(res.data);
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
      avatarUrl: nested.avatarUrl || nested.avatar || undefined,
      isAdmin: Boolean(nested.isAdmin),
      adminLevel: nested.adminLevel || undefined,
      adminAccessStatus: nested.adminAccessStatus || undefined
    };
  } catch {
    return null;
  }
}

const readStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("uniserve_token") || window.sessionStorage.getItem("uniserve_token");
};

const readTokenContext = () => {
  const token = readStoredToken();
  const payload = token ? decodeJwt(token) : null;
  return {
    token,
    sessionId:
      typeof payload?.sid === "string"
        ? payload.sid
        : typeof payload?.sessionId === "string"
          ? payload.sessionId
          : typeof payload?.session_id === "string"
            ? payload.session_id
            : null,
    tokenId: typeof payload?.jti === "string" ? payload.jti : null,
    userId:
      typeof payload?.sub === "string"
        ? payload.sub
        : typeof payload?._id === "string"
          ? payload._id
          : typeof payload?.userId === "string"
            ? payload.userId
            : null,
    role: typeof payload?.role === "string" ? payload.role.toUpperCase() : null
  };
};

const buildLogoutPayload = (options: LogoutEverywhereOptions) => {
  const tokenContext = readTokenContext();
  const audience =
    options.audience ||
    (tokenContext.role === "ADMIN" || tokenContext.role === "AGENT" || tokenContext.role === "USER"
      ? (tokenContext.role as "ADMIN" | "AGENT" | "USER")
      : "USER");
  const sessionId = options.adminSessionId || tokenContext.sessionId || undefined;
  const reason = options.reason || "manual";

  return {
    scope: "all",
    logoutScope: "all",
    revokeCurrentSession: true,
    revokeRefreshToken: true,
    revokeRefreshChain: true,
    revokeRefreshFamily: true,
    invalidateRefreshChain: true,
    invalidateAccessToken: true,
    terminateAdminMode: audience === "ADMIN",
    terminateSession: true,
    audience,
    portal: audience === "ADMIN" ? "ADMIN" : "WEB",
    reason,
    adminSessionId: sessionId,
    sessionId,
    accessTokenJti: tokenContext.tokenId || undefined,
    tokenId: tokenContext.tokenId || undefined,
    userId: tokenContext.userId || undefined,
    adminStatus: options.adminStatus || undefined,
    currentPath: typeof window !== "undefined" ? window.location.pathname : undefined,
    currentUrl: typeof window !== "undefined" ? window.location.href : undefined,
    audit: {
      action: audience === "ADMIN" ? "admin.logout" : "auth.logout",
      reason,
      sessionId,
      userId: tokenContext.userId || undefined
    }
  };
};

const getLogoutPaths = (audience?: LogoutEverywhereOptions["audience"]) => {
  const adminPaths = [
    "/admin/auth/logout",
    "/admins/auth/logout",
    "/admin/logout"
  ];
  const sharedPaths = [
    "/auth/logout",
    "/auth/session/logout",
    "/sessions/logout"
  ];
  return audience === "ADMIN" ? [...adminPaths, ...sharedPaths] : [...sharedPaths, ...adminPaths];
};

export async function logoutEverywhere(options: LogoutEverywhereOptions = {}): Promise<LogoutEverywhereResult> {
  const body = buildLogoutPayload(options);
  const paths = getLogoutPaths(options.audience);
  let lastError: unknown = null;

  if (body.audience === "ADMIN") {
    try {
      await appApi.post("/api/admin/auth/logout", body);
    } catch (error) {
      lastError = error;
    }
  }

  try {
    await postByPaths(paths, body);
    return { remoteCleared: true };
  } catch (error) {
    lastError = error;
  }

  try {
    await postByPaths(paths, body, {
      headers: {
        "X-Skip-Auth": "1"
      }
    });
    return { remoteCleared: true };
  } catch (error) {
    lastError = error;
  }

  return { remoteCleared: false, error: lastError };
}
