import { api, appApi } from "./client";
import type {
  AdminAccess,
  AdminAccessStatus,
  AdminDashboardStats,
  AdminLevel,
  AdminListItem,
  AdminListResponse,
  AdminPermissionCatalogItem,
  AdminPermission,
  AdminScope,
  AuditLogItem,
  AuditLogResponse,
  CommunityReportItem,
  InviteAdminPayload,
  ModerationListingItem
} from "@/types/admin";

const ALL_PERMISSIONS: AdminPermission[] = [
  "admin.manage",
  "dashboard.view",
  "dashboard.read",
  "analytics.view",
  "settings.manage",
  "users.read",
  "users.view",
  "users.edit",
  "users.update",
  "users.warn",
  "users.suspend",
  "users.ban",
  "agents.read",
  "agents.view",
  "agents.verify",
  "agents.suspend",
  "agents.note",
  "agents.badge",
  "users.freeze",
  "listings.read_all",
  "listings.moderate",
  "listings.approve_reject",
  "listings.pause_force",
  "products.view",
  "products.create",
  "products.edit",
  "products.approve",
  "products.reject",
  "products.delete",
  "products.feature",
  "services.view",
  "services.create",
  "services.edit",
  "services.approve",
  "services.reject",
  "services.delete",
  "services.feature",
  "community.view",
  "community.moderate",
  "community.delete_post",
  "groups.view",
  "groups.moderate",
  "posts.moderate",
  "comments.moderate",
  "moderation.view",
  "reports.view",
  "reports.resolve",
  "disputes.view",
  "disputes.resolve",
  "escalations.manage",
  "orders.read",
  "orders.view",
  "orders.manage",
  "payments.read",
  "payments.view",
  "payments.manage",
  "refunds.manage",
  "payouts.approve",
  "logs.read",
  "audit.view",
  "audit.read",
  "sessions.view",
  "sessions.read",
  "sessions.revoke",
  "content.view",
  "content.manage",
  "content.moderate",
  "media.moderate",
  "taxonomy.view",
  "taxonomy.manage",
  "technical.view",
  "technical.manage",
  "system.health.view",
  "settings.update",
  "admins.view",
  "admins.create",
  "admins.read",
  "admins.manage",
  "admins.invite",
  "admins.approve",
  "admins.revoke",
  "admins.assign_permissions",
  "admins.roles.manage",
  "admins.roles.write",
  "admins.scopes.manage",
  "admins.scopes.write",
  "admins.department.manage",
  "admins.department.write",
  "rbac.view",
  "rbac.read",
  "rbac.manage",
  "rbac.write"
];

const MANAGER_PERMISSIONS: AdminPermission[] = [
  "admin.manage",
  "dashboard.view",
  "users.read",
  "users.view",
  "users.update",
  "users.warn",
  "users.suspend",
  "agents.read",
  "agents.view",
  "agents.verify",
  "agents.suspend",
  "agents.note",
  "users.freeze",
  "listings.read_all",
  "listings.moderate",
  "listings.approve_reject",
  "listings.pause_force",
  "services.view",
  "services.approve",
  "services.reject",
  "products.view",
  "products.approve",
  "products.reject",
  "community.view",
  "community.moderate",
  "community.delete_post",
  "orders.read",
  "orders.view",
  "orders.manage",
  "logs.read"
];

const STAFF_PERMISSIONS: AdminPermission[] = [
  "users.read",
  "agents.read",
  "agents.view",
  "agents.verify",
  "listings.read_all",
  "services.view",
  "products.view",
  "listings.approve_reject",
  "reports.view",
  "community.moderate",
  "logs.read"
];

const DEFAULT_ADMIN_SCOPES: AdminScope[] = [
  { module: "users" },
  { module: "agents" },
  { module: "listings" },
  { module: "community" },
  { module: "orders" },
  { module: "payments" },
  { module: "logs" }
];

const LEGACY_PERMISSION_ALIASES: Record<string, AdminPermission[]> = {
  "admin.manage": ["admin.manage"],
  "admins.view": ["admin.manage"],
  "admins.read": ["admin.manage"],
  "admins.manage": ["admin.manage"],
  "admins.invite": ["admin.manage"],
  "admins.approve": ["admin.manage"],
  "admins.revoke": ["admin.manage"],
  "admins.roles.manage": ["admin.manage"],
  "admins.roles.write": ["admin.manage"],
  "admins.scopes.manage": ["admin.manage"],
  "admins.scopes.write": ["admin.manage"],
  "admins.department.manage": ["admin.manage"],
  "admins.department.write": ["admin.manage"],
  "rbac.view": ["admin.manage"],
  "rbac.read": ["admin.manage"],
  "rbac.manage": ["admin.manage"],
  "rbac.write": ["admin.manage"],
  "users.read": ["users.read"],
  "users.view": ["users.read"],
  "users.update": ["users.update"],
  "users.edit": ["users.update"],
  "users.freeze": ["users.freeze"],
  "users.warn": ["users.freeze"],
  "users.suspend": ["users.freeze"],
  "users.ban": ["users.freeze"],
  "agents.read": ["agents.read"],
  "agents.view": ["agents.read"],
  "agents.verify": ["agents.verify"],
  "agents.freeze": ["agents.read"],
  "agents.suspend": ["agents.read"],
  "agents.note": ["agents.read"],
  "agents.badge": ["agents.read"],
  "listings.read_all": ["listings.read_all"],
  "products.view": ["listings.read_all"],
  "services.view": ["listings.read_all"],
  "products.create": ["listings.read_all"],
  "services.create": ["listings.read_all"],
  "listings.approve_reject": ["listings.approve_reject"],
  "products.approve": ["listings.approve_reject"],
  "products.reject": ["listings.approve_reject"],
  "services.approve": ["listings.approve_reject"],
  "services.reject": ["listings.approve_reject"],
  "listings.moderate": ["listings.approve_reject", "listings.pause_force"],
  "reports.resolve": ["listings.approve_reject", "community.moderate"],
  "moderation.view": ["listings.approve_reject", "community.moderate"],
  "listings.pause_force": ["listings.pause_force"],
  "products.edit": ["listings.pause_force"],
  "services.edit": ["listings.pause_force"],
  "products.delete": ["listings.pause_force"],
  "services.delete": ["listings.pause_force"],
  "products.feature": ["listings.pause_force"],
  "services.feature": ["listings.pause_force"],
  "community.moderate": ["community.moderate"],
  "community.view": ["community.moderate"],
  "groups.view": ["community.moderate"],
  "groups.moderate": ["community.moderate", "community.delete_post"],
  "posts.moderate": ["community.moderate", "community.delete_post"],
  "comments.moderate": ["community.moderate", "community.delete_post"],
  "community.delete_post": ["community.delete_post"],
  "content.moderate": ["community.moderate", "community.delete_post"],
  "reports.view": ["community.moderate", "listings.approve_reject"],
  "orders.read": ["orders.read"],
  "orders.view": ["orders.read"],
  "orders.manage": ["orders.read"],
  "disputes.view": ["orders.read"],
  "disputes.resolve": ["orders.read"],
  "payments.read": ["payments.read"],
  "payments.view": ["payments.read"],
  "payments.manage": ["payments.read"],
  "refunds.manage": ["payments.read"],
  "payouts.approve": ["payments.read"],
  "logs.read": ["logs.read"],
  "audit.view": ["logs.read"],
  "audit.read": ["logs.read"],
  "sessions.view": ["logs.read"],
  "sessions.read": ["logs.read"],
  "technical.view": ["logs.read"],
  "system.health.view": ["logs.read"],
  "settings.update": ["settings.update"],
  "settings.manage": ["settings.update"],
  "technical.manage": ["settings.update"]
};

const ENDPOINT_MISSING_STATUSES = [404, 405, 501];

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const asArray = <T = any>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const getStatus = (error: unknown) => {
  return (error as { response?: { status?: number } })?.response?.status;
};

const isStatusError = (error: unknown, statuses: number[]) => {
  const status = getStatus(error);
  return typeof status === "number" && statuses.includes(status);
};

const shouldTryNextEndpoint = (error: unknown) => {
  const status = getStatus(error);
  return typeof status === "number" && ENDPOINT_MISSING_STATUSES.includes(status);
};

async function getByPaths(paths: string[], config?: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.get(path, config);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

async function postByPaths(paths: string[], body?: Record<string, any>, config?: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.post(path, body || {}, config);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

async function patchByPaths(paths: string[], body?: Record<string, any>, config?: Record<string, any>) {
  let lastError: unknown = null;
  for (const path of paths) {
    try {
      return await api.patch(path, body || {}, config);
    } catch (error) {
      if (shouldTryNextEndpoint(error)) {
        lastError = error;
        continue;
      }
      throw error;
    }
  }
  if (lastError) throw lastError;
  throw new Error("No endpoint matched");
}

const normalizeStatus = (value: unknown): AdminAccessStatus => {
  if (typeof value !== "string") return "PENDING";
  const status = value.toUpperCase();
  if (status === "APPROVED" || status === "SUSPENDED" || status === "REVOKED") {
    return status;
  }
  return "PENDING";
};

const normalizeLevel = (value: unknown): AdminLevel => {
  if (typeof value !== "string") return "STAFF";
  const level = value.toUpperCase();
  if (level === "PRIMARY" || level === "MANAGER") return level;
  return "STAFF";
};

const dedupePermissions = (value: AdminPermission[]): AdminPermission[] => Array.from(new Set(value));

const mapPermissionAliases = (value: unknown): AdminPermission[] => {
  if (typeof value !== "string") return [];
  const permission = value.trim();
  if (!permission) return [];
  if (ALL_PERMISSIONS.includes(permission as AdminPermission)) {
    return [permission as AdminPermission];
  }
  return LEGACY_PERMISSION_ALIASES[permission] || [];
};

const mergeAdminAccessSource = (value: unknown): Record<string, any> => {
  const raw = asRecord(value) || {};
  const nestedUser = asRecord(raw.user) || asRecord(raw.admin) || asRecord(raw.profile) || {};
  return {
    ...nestedUser,
    ...raw,
    user: nestedUser
  };
};

const normalizeScopes = (value: unknown): AdminScope[] => {
  return asArray(value)
    .map((scope) => {
      const raw = asRecord(scope);
      if (!raw) return null;
      const module = String(raw.module || raw.area || "").trim();
      if (!module) return null;
      const region = String(raw.region || "").trim();
      const countryCode = String(raw.countryCode || "").trim().toUpperCase();
      const category = String(raw.category || raw.categoryId || "").trim();
      const subcategory = String(raw.subcategory || raw.subCategory || raw.subcategoryId || "").trim();
      return {
        module,
        region: region || undefined,
        countryCode: countryCode || undefined,
        category: category || undefined,
        subcategory: subcategory || undefined
      };
    })
    .filter(Boolean) as AdminScope[];
};

const normalizeWorkspaceNavItem = (value: unknown) => {
  const raw = asRecord(value);
  if (!raw) return null;
  const href = String(raw.href || "").trim();
  if (!href) return null;
  return {
    id: String(raw.id || href),
    label: String(raw.label || raw.title || href),
    href,
    layer: raw.layer ? String(raw.layer) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    permissionAny: asArray<string>(raw.permissionAny).map((item) => String(item))
  };
};

const isWorkspaceNavItem = <T>(value: T | null): value is T => Boolean(value);

const normalizeWorkspace = (value: unknown) => {
  const raw = asRecord(value);
  if (!raw) return undefined;

  const sidebar = asArray(raw.sidebar).map(normalizeWorkspaceNavItem).filter(isWorkspaceNavItem);
  const layers = asArray(raw.layers)
    .map((layer) => {
      const item = asRecord(layer);
      if (!item) return null;
      return {
        id: String(item.id || ""),
        label: String(item.label || item.id || ""),
        items: asArray(item.items).map(normalizeWorkspaceNavItem).filter(isWorkspaceNavItem)
      };
    })
    .filter(isWorkspaceNavItem);

  return {
    model: raw.model ? String(raw.model) : undefined,
    accessTier: raw.accessTier ? String(raw.accessTier) : undefined,
    department: raw.department ? String(raw.department) : raw.department === null ? null : undefined,
    roleNames: asArray<string>(raw.roleNames).map((item) => String(item)),
    sidebar,
    layers
  };
};

const normalizeAdminSession = (value: unknown) => {
  const raw = asRecord(value);
  if (!raw) return undefined;
  return {
    sessionId: raw.sessionId ? String(raw.sessionId) : undefined,
    adminModeUntil: raw.adminModeUntil ? String(raw.adminModeUntil) : undefined,
    lastSeenAt: raw.lastSeenAt ? String(raw.lastSeenAt) : undefined
  };
};

const permissionsByLevel = (level: AdminLevel): AdminPermission[] => {
  if (level === "PRIMARY") return ALL_PERMISSIONS;
  if (level === "MANAGER") return MANAGER_PERMISSIONS;
  return STAFF_PERMISSIONS;
};

const normalizePermissions = (value: unknown, level: AdminLevel): AdminPermission[] => {
  const mapped = asArray(value).flatMap((item) => mapPermissionAliases(item));
  return mapped.length ? dedupePermissions(mapped) : permissionsByLevel(level);
};

const normalizeAdminAccess = (value: unknown): AdminAccess => {
  const raw = mergeAdminAccessSource(value);
  const user = asRecord(raw.user) || {};
  const level = normalizeLevel(raw.level || raw.adminLevel || raw.tier || user.adminLevel);
  const permissions = normalizePermissions(raw.permissions || user.permissions, level);
  const scopes = normalizeScopes(raw.scopes || raw.adminScopes || user.scopes || user.adminScopes);
  const workspace = normalizeWorkspace(raw.workspace);
  const roleNames = asArray<string>(raw.roleNames).map((item) => String(item));
  const adminSession = normalizeAdminSession(raw.adminSession);
  const requiresMfaSetup = Boolean(raw.requiresMfaSetup);

  return {
    id: String(raw.id || raw._id || raw.userId || user._id || user.id || ""),
    userId: raw.userId ? String(raw.userId) : user._id ? String(user._id) : user.id ? String(user.id) : undefined,
    name: String(raw.name || user.name || raw.fullName || user.fullName || raw.username || user.username || raw.roleBadge || "Admin"),
    email: String(raw.email || user.email || ""),
    status: normalizeStatus(raw.status || raw.adminAccessStatus || user.adminAccessStatus),
    level,
    department: raw.department ? String(raw.department) : user.department ? String(user.department) : undefined,
    position: raw.position ? String(raw.position) : user.position ? String(user.position) : undefined,
    mfaEnabled: Boolean(
      raw.mfaEnabled ||
        user.mfaEnabled ||
        raw.adminMfaEnabled ||
        user.adminMfaEnabled ||
        raw.requireMfa ||
        user.requireMfa ||
        raw.requiresMfaSetup === false
    ),
    permissions,
    scopes: scopes.length ? scopes : DEFAULT_ADMIN_SCOPES,
    roleNames,
    roleBadge: raw.roleBadge ? String(raw.roleBadge) : undefined,
    requiresMfaSetup,
    workspace,
    adminSession
  };
};

const fallbackAdminByAuthMe = async (): Promise<AdminAccess> => {
  const meRes = await api.get("/auth/me");
  const meRoot = asRecord(meRes.data);
  const me = asRecord(meRoot?.user) || asRecord(meRoot?.data) || meRoot || {};
  const role = String(me.role || "").toUpperCase();
  const isAdmin = role === "ADMIN" || Boolean(me.isAdmin) || Boolean(me.adminLevel);
  if (!isAdmin) {
    throw new Error("Admin role required");
  }
  return normalizeAdminAccess(me);
};

const extractListPayload = (value: unknown) => {
  const root = asRecord(value) || {};
  const payload = asRecord(root.data) || root;
  const items = asArray(payload.items || payload.admins || payload.users || payload.data || []);
  return {
    payload,
    items
  };
};

const toBase64Url = (source: ArrayBuffer | Uint8Array) => {
  const bytes = source instanceof Uint8Array ? source : new Uint8Array(source);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
};

const fromBase64Url = (value: string) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 ? "=".repeat(4 - (normalized.length % 4)) : "";
  const binary = atob(normalized + padding);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const toArrayBuffer = (source: ArrayBufferLike, byteOffset = 0, byteLength = source.byteLength - byteOffset) => {
  const buffer = new ArrayBuffer(byteLength);
  const target = new Uint8Array(buffer);
  target.set(new Uint8Array(source, byteOffset, byteLength));
  return buffer;
};

const normalizeCredentialId = (value: unknown): ArrayBuffer => {
  if (typeof value === "string" && value.trim()) {
    const bytes = fromBase64Url(value.trim());
    return toArrayBuffer(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (Array.isArray(value)) {
    const bytes = new Uint8Array(value);
    return toArrayBuffer(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (ArrayBuffer.isView(value)) return toArrayBuffer(value.buffer, value.byteOffset, value.byteLength);
  throw new Error("Invalid passkey credential id");
};

const normalizePasskeyChallenge = (raw: unknown): PublicKeyCredentialRequestOptions => {
  const root = asRecord(raw) || {};
  const payload = asRecord(root.data) || root;
  const options = asRecord(payload.publicKey) || asRecord(payload.options) || payload;
  const challengeRaw = options.challenge;
  if (!challengeRaw) {
    throw new Error("Passkey challenge missing");
  }
  const challenge = normalizeCredentialId(challengeRaw);
  const validTransports: AuthenticatorTransport[] = ["ble", "hybrid", "internal", "nfc", "usb"];
  const allowCredentials = asArray(options.allowCredentials).map((item) => {
    const entry = asRecord(item) || {};
    const transports = asArray<string>(entry.transports).filter((transport): transport is AuthenticatorTransport =>
      validTransports.includes(transport as AuthenticatorTransport)
    );
    return {
      type: "public-key" as const,
      id: normalizeCredentialId(entry.id),
      transports
    };
  });
  return {
    challenge,
    rpId: options.rpId ? String(options.rpId) : undefined,
    timeout: options.timeout ? Number(options.timeout) : undefined,
    userVerification: options.userVerification,
    allowCredentials
  };
};

const serializeAssertion = (credential: PublicKeyCredential) => {
  const response = credential.response as AuthenticatorAssertionResponse;
  return {
    id: credential.id,
    rawId: toBase64Url(credential.rawId),
    type: credential.type,
    response: {
      clientDataJSON: toBase64Url(response.clientDataJSON),
      authenticatorData: toBase64Url(response.authenticatorData),
      signature: toBase64Url(response.signature),
      userHandle: response.userHandle ? toBase64Url(response.userHandle) : undefined
    },
    clientExtensionResults: credential.getClientExtensionResults?.() || {}
  };
};

export async function getAdminAccess(): Promise<AdminAccess> {
  try {
    const res = await getByPaths([
      "/admin/auth/me",
      "/admin/access",
      "/admin/me",
      "/admins/me",
      "/me/admin-access"
    ]);
    const root = asRecord(res.data);
    const data = asRecord(root?.data) || asRecord(root?.admin) || root;
    return normalizeAdminAccess(data);
  } catch (error) {
    if (isStatusError(error, ENDPOINT_MISSING_STATUSES)) {
      return fallbackAdminByAuthMe();
    }
    throw error;
  }
}

export async function enterAdminMode(payload: { totpCode?: string; passkeyAssertion?: string }) {
  const body = {
    ...payload,
    code: payload.totpCode,
    otp: payload.totpCode,
    mfaCode: payload.totpCode,
    assertion: payload.passkeyAssertion,
    credential: payload.passkeyAssertion
  };
  const res = await postByPaths(
    ["/admin/auth/enter", "/admin/mfa/verify", "/admin/auth/mfa/verify", "/admins/auth/enter"],
    body
  );
  return res.data;
}

async function getPasskeyChallenge() {
  try {
    const res = await getByPaths([
      "/admin/auth/passkey/challenge",
      "/admin/auth/passkey/options",
      "/admin/mfa/passkey/challenge"
    ]);
    return normalizePasskeyChallenge(res.data);
  } catch (error) {
    if (!isStatusError(error, [404, 405])) throw error;
    const res = await postByPaths(
      ["/admin/auth/passkey/challenge", "/admin/auth/passkey/options", "/admin/mfa/passkey/challenge"],
      {}
    );
    return normalizePasskeyChallenge(res.data);
  }
}

async function verifyPasskey(assertion: Record<string, any>) {
  const body = {
    assertion,
    credential: assertion,
    passkeyAssertion: assertion
  };
  try {
    const res = await postByPaths(
      ["/admin/auth/passkey/verify", "/admin/mfa/passkey/verify", "/admin/auth/passkey/assert"],
      body
    );
    return res.data;
  } catch (error) {
    if (!isStatusError(error, [404, 405])) throw error;
    return enterAdminMode({ passkeyAssertion: JSON.stringify(assertion) });
  }
}

export async function enterAdminModeWithPasskey() {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    throw new Error("Passkey is only available in browser");
  }
  if (!("credentials" in navigator) || typeof window.PublicKeyCredential === "undefined") {
    throw new Error("Passkey is not supported in this browser");
  }

  const publicKey = await getPasskeyChallenge();
  const credential = (await navigator.credentials.get({ publicKey })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error("Passkey request was cancelled");
  }
  const assertion = serializeAssertion(credential);
  return verifyPasskey(assertion);
}

export async function setupAdminMfa(payload: { method: "TOTP" | "EMAIL_OTP" }) {
  const res = await postByPaths(["/admin/auth/mfa/setup"], payload);
  return res.data;
}

export async function verifyAdminMfa(payload: { method: "TOTP" | "EMAIL_OTP"; code: string }) {
  const res = await postByPaths(["/admin/auth/mfa/verify"], payload);
  return res.data;
}

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    const res = await getByPaths([
      "/admin/overview",
      "/admin/dashboard/stats",
      "/admin/stats",
      "/admin/metrics"
    ]);
    const root = asRecord(res.data) || {};
    const stats = asRecord(root.data) || root;
    const cards = asRecord(stats.cards) || {};
    const queues = asRecord(stats.queues) || {};

    const readNumber = (...values: unknown[]) => {
      for (const value of values) {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
      return 0;
    };

    return {
      pendingApprovals: readNumber(
        stats.pendingApprovals,
        stats.pendingAdmins,
        stats.adminApprovals,
        cards.pendingApprovals,
        queues.pendingAdminRequests,
        queues.pendingAgentVerifications
      ),
      reportedPosts: readNumber(
        stats.reportedPosts,
        stats.pendingReports,
        stats.communityReports,
        cards.unresolvedReports,
        queues.flaggedPosts,
        queues.flaggedGroups
      ),
      pendingListings: readNumber(stats.pendingListings, stats.listingsPending, stats.listingsQueue, queues.pendingListings)
    };
  } catch (error) {
    if (isStatusError(error, [404])) {
      return {
        pendingApprovals: 0,
        reportedPosts: 0,
        pendingListings: 0
      };
    }
    throw error;
  }
}

export async function getAdmins(params: {
  page?: number;
  limit?: number;
  status?: AdminAccessStatus | "ALL";
  department?: string;
} = {}): Promise<AdminListResponse> {
  const fallbackParams = {
    ...params,
    role: "ADMIN"
  };
  try {
    const res = await appApi.get("/api/admin/admins", { params: fallbackParams });

    const { payload, items: rawItems } = extractListPayload(res.data);
    const items = rawItems
      .map((item): AdminListItem => {
        const normalized = normalizeAdminAccess(item);
        const raw = asRecord(item) || {};
        return {
          ...normalized,
          invitedAt: raw.invitedAt ? String(raw.invitedAt) : undefined,
          invitedBy: raw.invitedBy ? String(raw.invitedBy) : undefined,
          invitedByName: raw.invitedByName ? String(raw.invitedByName) : undefined,
          approvedAt: raw.approvedAt ? String(raw.approvedAt) : undefined,
          approvedBy: raw.approvedBy ? String(raw.approvedBy) : undefined,
          approvedByName: raw.approvedByName ? String(raw.approvedByName) : undefined,
          createdBy: raw.createdBy ? String(raw.createdBy) : undefined,
          createdByName: raw.createdByName ? String(raw.createdByName) : undefined,
          lastActivityAt: raw.lastActivityAt ? String(raw.lastActivityAt) : undefined,
          adminModeUntil: raw.adminModeUntil ? String(raw.adminModeUntil) : undefined,
          adminModeActive: Boolean(raw.adminModeActive),
          activeSessionCount: Number(raw.activeSessionCount || 0),
          permissionKeys: asArray<string>(raw.permissionKeys).map((value) => String(value)),
          assignedPermissionKeys: asArray<string>(raw.assignedPermissionKeys).map((value) => String(value))
        };
      })
      .filter((entry) => {
        if (params.status && params.status !== "ALL") {
          if (entry.status !== params.status) return false;
        }
        if (params.department) {
          const normalizedDepartment = String(entry.department || "").toLowerCase();
          if (normalizedDepartment !== String(params.department).toLowerCase()) return false;
        }
        return true;
      });

    return {
      items,
      total: Number(payload.total || items.length) || items.length,
      page: Number(payload.page || params.page || 1) || 1,
      limit: Number(payload.limit || params.limit || 20) || 20
    };
  } catch (error) {
    if (!isStatusError(error, [404])) {
      throw error;
    }
    return {
      items: [],
      total: 0,
      page: Number(params.page || 1),
      limit: Number(params.limit || 20)
    };
  }
}

export async function inviteAdmin(payload: InviteAdminPayload) {
  const res = await appApi.post("/api/admin/admins/invite", payload);
  return res.data;
}

export async function updateAdminStatus(id: string, payload: { status: AdminAccessStatus; reason?: string }) {
  const res = await appApi.post(`/api/admin/admins/${id}/status`, payload);
  return res.data;
}

const resolveRoleNamesByLevel = (level: AdminLevel, department?: string) => {
  if (level === "PRIMARY") return ["PRIMARY_ROLE"];
  if (level === "MANAGER") return ["OPERATIONS_MANAGER_ROLE"];

  const normalizedDepartment = String(department || "").trim().toLowerCase();
  if (normalizedDepartment === "products") return ["PRODUCT_ADMIN_ROLE"];
  if (normalizedDepartment === "services") return ["SERVICE_ADMIN_ROLE"];
  if (normalizedDepartment === "community") return ["COMMUNITY_ADMIN_ROLE"];
  if (normalizedDepartment === "agents") return ["AGENT_ADMIN_ROLE"];
  if (normalizedDepartment === "finance") return ["FINANCE_ADMIN_ROLE"];
  if (normalizedDepartment === "content") return ["CONTENT_ADMIN_ROLE"];
  if (normalizedDepartment === "support") return ["SUPPORT_ADMIN_ROLE"];
  return ["SUPPORT_ADMIN_ROLE"];
};

export async function updateAdminRole(id: string, payload: { level: AdminLevel; department?: string; reason?: string }) {
  const res = await appApi.patch(`/api/admin/admins/${id}/roles`, {
    level: payload.level,
    adminLevel: payload.level,
    roleNames: resolveRoleNamesByLevel(payload.level, payload.department),
    reason: payload.reason
  });
  return res.data;
}

export async function updateAdminScopes(id: string, payload: { scopes: AdminScope[]; reason?: string }) {
  const res = await appApi.patch(`/api/admin/admins/${id}/scopes`, payload);
  return res.data;
}

export async function updateAdminOrg(id: string, payload: { department?: string; position?: string; reason?: string }) {
  const res = await appApi.patch(`/api/admin/admins/${id}/org`, payload);
  return res.data;
}

export async function getAdminPermissionCatalog(): Promise<AdminPermissionCatalogItem[]> {
  const res = await appApi.get("/api/admin/permissions");
  const root = asRecord(res.data) || {};
  const payload = asRecord(root.data) || root;
  const rawItems = asArray(payload.items || payload.permissions || []);
  return rawItems.map((item) => {
    const raw = asRecord(item) || {};
    return {
      key: String(raw.key || ""),
      label: String(raw.label || raw.key || ""),
      group: String(raw.group || "core"),
      groupLabel: String(raw.groupLabel || raw.group || "Core"),
      description: String(raw.description || ""),
      critical: Boolean(raw.critical),
      legacy: Boolean(raw.legacy)
    };
  });
}

export async function updateAdminPermissions(id: string, payload: { permissionKeys: string[]; reason?: string }) {
  const res = await appApi.patch(`/api/admin/admins/${id}/permissions`, payload);
  return res.data;
}

export async function getAuditLogs(params: {
  page?: number;
  limit?: number;
  adminId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
} = {}): Promise<AuditLogResponse> {
  try {
    const res = await appApi.get("/api/admin/audit-logs", { params });
    const root = asRecord(res.data) || {};
    const payload = asRecord(root.data) || root;
    const rawItems = asArray(payload.items || payload.logs || []);
    const items: AuditLogItem[] = rawItems.map((item, idx) => {
      const raw = asRecord(item) || {};
      return {
        id: String(raw.id || raw._id || idx),
        actorId: raw.actorId ? String(raw.actorId) : raw.adminId ? String(raw.adminId) : undefined,
        actorName:
          raw.actorName
            ? String(raw.actorName)
            : raw.adminName
              ? String(raw.adminName)
              : undefined,
        actorRole: raw.actorRole ? String(raw.actorRole) : undefined,
        action: String(raw.action || "unknown"),
        entityType:
          raw.entityType
            ? String(raw.entityType)
            : raw.targetType
              ? String(raw.targetType)
              : undefined,
        entityId:
          raw.entityId
            ? String(raw.entityId)
            : raw.targetId
              ? String(raw.targetId)
              : undefined,
        reason: raw.reason ? String(raw.reason) : undefined,
        previousValue:
          raw.previousValue && typeof raw.previousValue === "object"
            ? (raw.previousValue as Record<string, unknown>)
            : raw.diff && typeof raw.diff === "object" && raw.diff.before && typeof raw.diff.before === "object"
              ? (raw.diff.before as Record<string, unknown>)
              : undefined,
        newValue:
          raw.newValue && typeof raw.newValue === "object"
            ? (raw.newValue as Record<string, unknown>)
            : raw.diff && typeof raw.diff === "object" && raw.diff.after && typeof raw.diff.after === "object"
              ? (raw.diff.after as Record<string, unknown>)
              : undefined,
        ip: raw.ip ? String(raw.ip) : undefined,
        userAgent: raw.userAgent ? String(raw.userAgent) : undefined,
        createdAt: String(raw.createdAt || raw.timestamp || new Date().toISOString()),
      };
    });
    return {
      items,
      total: Number(payload.total || items.length) || items.length,
      page: Number(payload.page || params.page || 1) || 1,
      limit: Number(payload.limit || params.limit || 20) || 20
    };
  } catch (error) {
    if (!isStatusError(error, [404])) {
      throw error;
    }
    return {
      items: [],
      total: 0,
      page: Number(params.page || 1),
      limit: Number(params.limit || 20)
    };
  }
}

const normalizeModerationListing = (value: unknown, idx: number): ModerationListingItem => {
  const raw = asRecord(value) || {};
  return {
    id: String(raw.id || raw._id || raw.listingId || idx),
    title: String(raw.title || raw.name || "Untitled listing"),
    category: raw.category ? String(raw.category) : undefined,
    subcategory: raw.subcategory ? String(raw.subcategory) : raw.subCategory ? String(raw.subCategory) : undefined,
    status: raw.status ? String(raw.status) : undefined,
    ownerName: raw.ownerName ? String(raw.ownerName) : raw.authorName ? String(raw.authorName) : undefined
  };
};

const normalizeCommunityReport = (value: unknown, idx: number): CommunityReportItem => {
  const raw = asRecord(value) || {};
  return {
    id: String(raw.id || raw._id || raw.reportId || idx),
    reason: raw.reason ? String(raw.reason) : undefined,
    content: raw.content ? String(raw.content) : raw.text ? String(raw.text) : undefined,
    authorName: raw.authorName ? String(raw.authorName) : raw.author?.name ? String(raw.author.name) : undefined,
    targetId: raw.targetId ? String(raw.targetId) : raw.postId ? String(raw.postId) : undefined,
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined
  };
};

export async function getModerationListings(params: {
  status?: string;
  page?: number;
  limit?: number;
} = {}): Promise<ModerationListingItem[]> {
  try {
    const res = await appApi.get("/api/admin/listings/moderation", {
      params: { status: params.status || "PENDING", page: params.page || 1, limit: params.limit || 50 }
    });
    const root = asRecord(res.data) || {};
    const payload = asRecord(root.data) || root;
    const items = asArray(payload.items || payload.listings || payload.data || []);
    return items.map((item, idx) => normalizeModerationListing(item, idx));
  } catch (error) {
    if (isStatusError(error, [404])) return [];
    throw error;
  }
}

export async function moderateListing(id: string, action: "approve" | "reject" | "pause", reason?: string) {
  const body = {
    action,
    decision: action,
    status: action === "approve" ? "ACTIVE" : action === "pause" ? "PAUSED" : "REJECTED",
    reason
  };
  const res = await appApi.post(`/api/admin/listings/${id}/moderate`, body);
  return res.data;
}

export async function getCommunityReports(params: { page?: number; limit?: number } = {}): Promise<CommunityReportItem[]> {
  try {
    const res = await appApi.get("/api/admin/community/reports", {
      params: { page: params.page || 1, limit: params.limit || 50 }
    });
    const root = asRecord(res.data) || {};
    const payload = asRecord(root.data) || root;
    const items = asArray(payload.items || payload.reports || payload.data || []);
    return items.map((item, idx) => normalizeCommunityReport(item, idx));
  } catch (error) {
    if (isStatusError(error, [404])) return [];
    throw error;
  }
}

export async function moderateCommunityReport(id: string, action: "dismiss" | "delete", reason?: string) {
  const body = {
    action,
    resolution: action,
    status: action === "dismiss" ? "DISMISSED" : "DELETED",
    reason
  };
  const res = await appApi.post(`/api/admin/community/reports/${id}/resolve`, body);
  return res.data;
}
