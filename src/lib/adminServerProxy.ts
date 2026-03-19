import { NextRequest, NextResponse } from "next/server";
import type { AdminPermission } from "@/types/admin";

const ENDPOINT_MISSING_STATUSES = new Set([404, 405, 501]);
const API_BASE_URL = String(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api").replace(/\/$/, "");

type ServerAdminLevel = "PRIMARY" | "MANAGER" | "STAFF";
type ServerAdminStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REVOKED";

export interface ServerAdminAccess {
  id: string;
  userId?: string;
  email?: string;
  name?: string;
  level: ServerAdminLevel;
  status: ServerAdminStatus;
  permissions: string[];
}

interface ProxyOptions {
  req: NextRequest;
  upstreamPaths: string[];
  permissionAny?: AdminPermission[];
  primaryOnly?: boolean;
  requireReason?: boolean;
  auditAction?: string;
  entityType?: string;
  entityId?: string;
  body?: Record<string, unknown>;
  searchParams?: URLSearchParams;
  allowBrokenSession?: boolean;
}

class AdminProxyHttpError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const asArray = <T = unknown>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const asOptionalString = (value: unknown) => {
  const next = asString(value, "").trim();
  return next || undefined;
};

const normalizeLevel = (value: unknown): ServerAdminLevel => {
  const level = asString(value || "STAFF").toUpperCase();
  if (level === "PRIMARY" || level === "MANAGER") return level;
  return "STAFF";
};

const normalizeStatus = (value: unknown): ServerAdminStatus => {
  const status = asString(value || "PENDING").toUpperCase();
  if (status === "APPROVED" || status === "SUSPENDED" || status === "REVOKED") return status;
  return "PENDING";
};

const uniqueStrings = (items: string[]) => Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));

const buildBackendUrl = (path: string, searchParams?: URLSearchParams) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL(`${API_BASE_URL}${normalizedPath}`);
  if (searchParams) {
    searchParams.forEach((value, key) => {
      url.searchParams.append(key, value);
    });
  }
  return url;
};

const jsonError = (status: number, message: string) => {
  return NextResponse.json({ message }, { status });
};

const readReason = (body: Record<string, unknown> | null | undefined) => {
  if (!body) return "";
  const direct = asString(body.reason || "", "").trim();
  if (direct) return direct;
  const audit = asRecord(body.audit);
  return asString(audit?.reason || "", "").trim();
};

const getForwardHeaders = (req: NextRequest, hasBody = false) => {
  const headers = new Headers();
  const forwardKeys = ["authorization", "cookie", "user-agent", "x-forwarded-for", "x-real-ip"];
  for (const key of forwardKeys) {
    const value = req.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("accept", "application/json");
  if (hasBody) {
    headers.set("content-type", "application/json");
  }
  return headers;
};

const forwardResponse = async (response: Response) => {
  const text = await response.text();
  const headers = new Headers();
  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) headers.set("set-cookie", setCookie);
  return new NextResponse(text, {
    status: response.status,
    headers
  });
};

const fetchByPaths = async (req: NextRequest, paths: string[], init: RequestInit, searchParams?: URLSearchParams) => {
  let lastResponse: Response | null = null;
  let lastError: unknown = null;

  for (const path of paths) {
    try {
      const response = await fetch(buildBackendUrl(path, searchParams), {
        ...init,
        headers: init.headers,
        cache: "no-store"
      });
      if (ENDPOINT_MISSING_STATUSES.has(response.status)) {
        lastResponse = response;
        continue;
      }
      return response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) return lastResponse;
  throw lastError || new Error("No upstream route matched");
};

const normalizeServerAdminAccess = (rawValue: unknown): ServerAdminAccess | null => {
  const root = asRecord(rawValue) || {};
  const data = asRecord(root.data) || asRecord(root.admin) || root;
  const user = asRecord(data.user) || asRecord(data.admin) || asRecord(data.profile) || {};
  const role = asString(data.role || user.role || "").toUpperCase();
  const level = normalizeLevel(data.level || data.adminLevel || user.adminLevel || data.tier);
  const permissions = uniqueStrings(
    asArray<string>(
      data.permissions ||
        data.permissionKeys ||
        data.assignedPermissionKeys ||
        user.permissions ||
        user.permissionKeys ||
        user.assignedPermissionKeys
    ).map((item) => asString(item))
  );

  if (role !== "ADMIN" && !asString(data.adminLevel || user.adminLevel)) {
    return null;
  }

  return {
    id: asString(data.id || data._id || data.userId || user.id || user._id),
    userId: asOptionalString(data.userId || user.id || user._id),
    email: asOptionalString(data.email || user.email),
    name: asOptionalString(data.name || user.name || user.fullName || data.fullName),
    level,
    status: normalizeStatus(data.status || data.adminAccessStatus || user.adminAccessStatus),
    permissions
  };
};

export const fetchServerAdminAccess = async (req: NextRequest, allowBrokenSession = false) => {
  const authorization = req.headers.get("authorization");
  if (!authorization) {
    if (allowBrokenSession) return null;
    throw new AdminProxyHttpError(401, "Missing authorization");
  }

  const response = await fetchByPaths(
    req,
    ["/admin/auth/me", "/admin/access", "/admin/me", "/admins/me", "/me/admin-access"],
    {
      method: "GET",
      headers: getForwardHeaders(req)
    }
  );

  if (!response.ok) {
    if (allowBrokenSession) return null;
    throw new AdminProxyHttpError(response.status === 401 ? 401 : 403, "Unable to verify admin access");
  }

  const payload = await response.json().catch(() => ({}));
  const access = normalizeServerAdminAccess(payload);
  if (!access) {
    if (allowBrokenSession) return null;
    throw new AdminProxyHttpError(403, "Admin access required");
  }

  if (!allowBrokenSession && access.status !== "APPROVED") {
    throw new AdminProxyHttpError(403, `Admin access is ${access.status.toLowerCase()}`);
  }

  return access;
};

const hasAnyPermission = (access: ServerAdminAccess, permissions?: AdminPermission[]) => {
  if (!permissions?.length) return true;
  if (access.level === "PRIMARY") return true;
  if (access.permissions.includes("admin.manage")) return true;
  return permissions.some((permission) => access.permissions.includes(permission));
};

const injectAudit = (
  req: NextRequest,
  body: Record<string, unknown>,
  access: ServerAdminAccess | null,
  options: Pick<ProxyOptions, "auditAction" | "entityId" | "entityType">
) => {
  const reason = readReason(body);
  const existingAudit = asRecord(body.audit) || {};
  return {
    ...body,
    audit: {
      ...existingAudit,
      action: options.auditAction || existingAudit.action || "admin.action",
      reason: reason || existingAudit.reason || undefined,
      entityId: options.entityId || existingAudit.entityId || undefined,
      entityType: options.entityType || existingAudit.entityType || undefined,
      adminId: access?.userId || access?.id || existingAudit.adminId || undefined,
      adminLevel: access?.level || existingAudit.adminLevel || undefined,
      adminEmail: access?.email || existingAudit.adminEmail || undefined,
      source: "next_admin_proxy",
      ip: req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || existingAudit.ip || undefined,
      userAgent: req.headers.get("user-agent") || existingAudit.userAgent || undefined,
      at: new Date().toISOString()
    }
  };
};

export const proxyAdminRequest = async ({
  req,
  upstreamPaths,
  permissionAny,
  primaryOnly,
  requireReason,
  auditAction,
  entityType,
  entityId,
  body,
  searchParams,
  allowBrokenSession
}: ProxyOptions) => {
  let access: ServerAdminAccess | null = null;
  try {
    access = await fetchServerAdminAccess(req, Boolean(allowBrokenSession));
  } catch (error) {
    if (error instanceof AdminProxyHttpError) {
      return jsonError(error.status, error.message);
    }
    throw error;
  }

  if (!allowBrokenSession && !access) {
    return jsonError(401, "Admin access required");
  }

  if (primaryOnly && access?.level !== "PRIMARY") {
    return jsonError(403, "Primary admin access required");
  }

  if (access && !hasAnyPermission(access, permissionAny)) {
    return jsonError(403, "Missing required admin permission");
  }

  const payload = body ? injectAudit(req, body, access, { auditAction, entityType, entityId }) : undefined;
  if (requireReason && !readReason(payload || body)) {
    return jsonError(400, "Audit reason is required");
  }

  const response = await fetchByPaths(
    req,
    upstreamPaths,
    {
      method: req.method,
      headers: getForwardHeaders(req, Boolean(payload)),
      body: payload ? JSON.stringify(payload) : undefined
    },
    searchParams
  );

  return forwardResponse(response);
};

export const parseRequestBody = async (req: NextRequest) => {
  try {
    const text = await req.text();
    if (!text.trim()) return {};
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return {};
  }
};
