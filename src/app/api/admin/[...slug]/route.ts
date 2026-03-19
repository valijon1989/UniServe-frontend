import { NextRequest, NextResponse } from "next/server";
import type { AdminPermission } from "@/types/admin";
import { parseRequestBody, proxyAdminRequest, fetchServerAdminAccess } from "@/lib/adminServerProxy";

const readSlug = async (params: Promise<{ slug: string[] }>) => (await params).slug || [];

const match = (slug: string[], pattern: string[]) => {
  if (slug.length !== pattern.length) return false;
  return pattern.every((part, index) => part.startsWith(":") || slug[index] === part);
};

const permissionForUserAction = (action: string): AdminPermission[] => {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "warn") return ["users.warn"];
  if (normalized === "ban") return ["users.ban"];
  return ["users.suspend"];
};

const permissionForAgentAction = (action: string): AdminPermission[] => {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "verify") return ["agents.verify"];
  if (normalized === "badge") return ["agents.badge"];
  if (normalized === "note") return ["agents.note", "agents.verify"];
  return ["agents.suspend"];
};

const permissionForPaymentAction = (action: string): AdminPermission[] => {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "approve_refund") return ["refunds.manage"];
  if (normalized === "approve_payout") return ["payouts.approve"];
  return ["payments.manage"];
};

const permissionForListingAction = (action: string): AdminPermission[] => {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "pause") return ["listings.pause_force"];
  if (normalized === "approve") return ["listings.approve_reject", "products.approve", "services.approve"];
  return ["listings.approve_reject", "products.reject", "services.reject"];
};

const permissionForCommunityAction = (action: string): AdminPermission[] => {
  const normalized = String(action || "").toLowerCase();
  if (normalized === "delete") return ["community.delete_post", "posts.moderate"];
  return ["community.moderate", "reports.resolve"];
};

const permissionForModerationCenterAction = (module: string, entityType: string, action: string): AdminPermission[] => {
  const normalizedModule = String(module || entityType || "").toLowerCase();
  const normalizedAction = String(action || "").toLowerCase();

  if (normalizedModule.includes("payment") || normalizedModule.includes("finance")) {
    return permissionForPaymentAction(normalizedAction);
  }
  if (normalizedModule.includes("agent")) {
    return permissionForAgentAction(normalizedAction);
  }
  if (normalizedModule.includes("user")) {
    return permissionForUserAction(normalizedAction);
  }
  if (normalizedModule.includes("listing") || normalizedModule.includes("product") || normalizedModule.includes("service")) {
    return permissionForListingAction(normalizedAction);
  }
  if (normalizedModule.includes("community") || normalizedModule.includes("post") || normalizedModule.includes("group")) {
    return permissionForCommunityAction(normalizedAction);
  }

  return ["admin.manage"];
};

const allowedSettingsSections = (access: Awaited<ReturnType<typeof fetchServerAdminAccess>>) => {
  if (!access) return [] as string[];
  if (access.level === "PRIMARY") {
    return ["security", "moderation", "notifications", "features", "platform", "finance", "content"];
  }
  if (access.permissions.includes("settings.manage")) {
    return ["moderation", "notifications", "features", "platform", "content"];
  }
  return ["notifications", "features", "platform", "content"];
};

const filterSettingsPayload = (body: Record<string, unknown>, allowedSections: string[]) => {
  const next: Record<string, unknown> = {};
  for (const key of allowedSections) {
    if (key in body) next[key] = body[key];
  }
  if ("reason" in body) next.reason = body.reason;
  if ("audit" in body) next.audit = body.audit;
  return next;
};

async function handleRequest(req: NextRequest, slug: string[]) {
  const method = req.method.toUpperCase();

  if (method === "GET" && match(slug, ["access"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/auth/me", "/admin/access", "/admin/me", "/admins/me", "/me/admin-access"]
    });
  }

  if (method === "GET" && match(slug, ["dashboard", "control-center"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/dashboard/control-center"],
      permissionAny: ["dashboard.view", "dashboard.read"]
    });
  }

  if (method === "GET" && match(slug, ["admins"])) {
    const searchParams = new URLSearchParams(req.nextUrl.searchParams);
    if (!searchParams.has("role")) searchParams.set("role", "ADMIN");
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/admins", "/admins", "/admin/users"],
      permissionAny: ["admins.view", "admins.read", "admins.manage", "admins.create", "admins.assign_permissions"],
      searchParams
    });
  }

  if (method === "POST" && match(slug, ["admins", "invite"])) {
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/admins/invite", "/admins/invite", "/admin/invite"],
      permissionAny: ["admins.create", "admins.invite"],
      primaryOnly: true,
      requireReason: true,
      auditAction: "admin.invite",
      entityType: "admin",
      body
    });
  }

  if (method === "POST" && match(slug, ["admins", ":id", "status"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const nextStatus = String(body.status || "").toUpperCase();
    const isApprove = nextStatus === "APPROVED";
    return proxyAdminRequest({
      req,
      upstreamPaths: isApprove ? ["/admin/admins/approve"] : ["/admin/admins/revoke"],
      permissionAny: [isApprove ? "admins.approve" : "admins.revoke"],
      primaryOnly: true,
      requireReason: true,
      auditAction: `admin.status.${nextStatus.toLowerCase() || "update"}`,
      entityType: "admin",
      entityId: id,
      body: {
        ...body,
        userId: id
      }
    });
  }

  if (method === "PATCH" && match(slug, ["admins", ":id", "roles"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/admins/${id}/roles`],
      permissionAny: ["admins.roles.manage", "admins.roles.write"],
      primaryOnly: true,
      requireReason: true,
      auditAction: "admin.roles.update",
      entityType: "admin",
      entityId: id,
      body
    });
  }

  if (method === "PATCH" && match(slug, ["admins", ":id", "scopes"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/admins/${id}/scopes`, `/admins/${id}/scopes`, `/admin/users/${id}/scopes`],
      permissionAny: ["admins.scopes.manage", "admins.scopes.write"],
      primaryOnly: true,
      requireReason: true,
      auditAction: "admin.scopes.update",
      entityType: "admin",
      entityId: id,
      body
    });
  }

  if (method === "PATCH" && match(slug, ["admins", ":id", "org"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/admins/${id}/department-position`],
      permissionAny: ["admins.department.manage", "admins.department.write"],
      primaryOnly: true,
      requireReason: true,
      auditAction: "admin.org.update",
      entityType: "admin",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["permissions"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/permissions"],
      permissionAny: ["admins.assign_permissions", "rbac.view", "rbac.read"]
    });
  }

  if (method === "PATCH" && match(slug, ["admins", ":id", "permissions"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/admins/${id}/permissions`],
      permissionAny: ["admins.assign_permissions", "rbac.manage", "rbac.write"],
      primaryOnly: true,
      requireReason: true,
      auditAction: "admin.permissions.update",
      entityType: "admin",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["audit-logs"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/audit-logs", "/admin/logs", "/audit/logs"],
      permissionAny: ["audit.view", "audit.read", "logs.read"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "GET" && match(slug, ["listings", "moderation"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/listings/moderation", "/admin/listings/pending", "/admin/moderation/listings", "/listings"],
      permissionAny: ["products.view", "services.view", "listings.read_all", "listings.moderate"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["listings", ":id", "moderate"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const action = String(body.action || body.decision || "").toLowerCase();
    return proxyAdminRequest({
      req,
      upstreamPaths: [
        `/admin/listings/${id}/moderate`,
        `/admin/listings/${id}/${action}`,
        `/admin/moderation/listings/${id}/${action}`
      ],
      permissionAny: permissionForListingAction(action),
      requireReason: true,
      auditAction: `listing.${action || "moderate"}`,
      entityType: "listing",
      entityId: id,
      body: {
        ...body,
        decision: body.decision || action,
        status:
          body.status ||
          (action === "approve" ? "ACTIVE" : action === "pause" ? "PAUSED" : action === "reject" ? "REJECTED" : undefined)
      }
    });
  }

  if (method === "GET" && match(slug, ["community", "reports"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/community/reports", "/community/reports", "/admin/reports/community"],
      permissionAny: ["community.moderate", "reports.view", "posts.moderate", "content.moderate"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["community", "reports", ":id", "resolve"])) {
    const id = slug[2];
    const body = await parseRequestBody(req);
    const action = String(body.action || body.resolution || "").toLowerCase();
    return proxyAdminRequest({
      req,
      upstreamPaths: [
        `/admin/community/reports/${id}/resolve`,
        `/community/reports/${id}/resolve`,
        `/admin/reports/community/${id}/resolve`
      ],
      permissionAny: permissionForCommunityAction(action),
      requireReason: true,
      auditAction: `community.report.${action || "resolve"}`,
      entityType: "community_report",
      entityId: id,
      body: {
        ...body,
        resolution: body.resolution || action,
        status: body.status || (action === "delete" ? "DELETED" : "DISMISSED")
      }
    });
  }

  if (method === "GET" && match(slug, ["moderation", "center"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/moderation/center"],
      permissionAny: ["moderation.view", "reports.view", "community.moderate", "content.moderate", "listings.moderate"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["moderation", "center", "action"])) {
    const body = await parseRequestBody(req);
    const action = String(body.action || "");
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/moderation/center/action"],
      permissionAny: permissionForModerationCenterAction(String(body.module || ""), String(body.entityType || ""), action),
      requireReason: true,
      auditAction: `moderation.center.${action || "action"}`,
      entityType: asOptionalEntityType(body.entityType),
      entityId: asOptionalEntityId(body.id),
      body
    });
  }

  if (method === "GET" && match(slug, ["users", "operations"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/users/operations"],
      permissionAny: ["users.view", "users.read", "users.update"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["users", ":id", "action"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const action = String(body.action || "");
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/users/${id}/action`],
      permissionAny: permissionForUserAction(action),
      requireReason: true,
      auditAction: `user.${action || "action"}`,
      entityType: "user",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["agents", "operations"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/agents/operations"],
      permissionAny: ["agents.view", "agents.read", "agents.verify"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["agents", ":id", "action"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const action = String(body.action || "");
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/agents/${id}/action`],
      permissionAny: permissionForAgentAction(action),
      requireReason: true,
      auditAction: `agent.${action || "action"}`,
      entityType: "agent",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["orders", "operations"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/orders/operations"],
      permissionAny: ["orders.view", "orders.read", "orders.manage"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["orders", ":id", "status"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const status = String(body.status || "").toUpperCase();
    const permissionAny: AdminPermission[] = status === "REFUNDED" ? ["orders.manage", "refunds.manage"] : ["orders.manage"];
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/orders/${id}/status`],
      permissionAny,
      requireReason: true,
      auditAction: `order.${status.toLowerCase() || "status"}`,
      entityType: "order",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["payments", "operations"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/payments/operations"],
      permissionAny: ["payments.view", "payments.read", "payments.manage", "refunds.manage", "payouts.approve"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["payments", ":id", "review"])) {
    const id = slug[1];
    const body = await parseRequestBody(req);
    const action = String(body.action || "");
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/payments/${id}/review`],
      permissionAny: permissionForPaymentAction(action),
      requireReason: true,
      auditAction: `payment.${action || "review"}`,
      entityType: "payment",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["content", "items"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/content/items"],
      permissionAny: ["content.view", "content.manage", "content.moderate"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["content", "items"])) {
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/content/items"],
      permissionAny: ["content.manage"],
      requireReason: true,
      auditAction: "content.create",
      entityType: "content",
      body
    });
  }

  if (method === "PATCH" && match(slug, ["content", "items", ":id"])) {
    const id = slug[2];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/content/items/${id}`],
      permissionAny: ["content.manage"],
      requireReason: true,
      auditAction: "content.update",
      entityType: "content",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["taxonomy", "nodes"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/taxonomy/nodes"],
      permissionAny: ["taxonomy.view", "taxonomy.manage"],
      searchParams: req.nextUrl.searchParams
    });
  }

  if (method === "POST" && match(slug, ["taxonomy", "nodes"])) {
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/taxonomy/nodes"],
      permissionAny: ["taxonomy.manage"],
      requireReason: true,
      auditAction: "taxonomy.create",
      entityType: "taxonomy",
      body
    });
  }

  if (method === "PATCH" && match(slug, ["taxonomy", "nodes", ":id"])) {
    const id = slug[2];
    const body = await parseRequestBody(req);
    return proxyAdminRequest({
      req,
      upstreamPaths: [`/admin/taxonomy/nodes/${id}`],
      permissionAny: ["taxonomy.manage"],
      requireReason: true,
      auditAction: "taxonomy.update",
      entityType: "taxonomy",
      entityId: id,
      body
    });
  }

  if (method === "GET" && match(slug, ["analytics", "overview"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/analytics/overview"],
      permissionAny: ["analytics.view"]
    });
  }

  if (method === "GET" && match(slug, ["settings", "system"])) {
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/settings/system"],
      permissionAny: ["settings.manage", "settings.update", "technical.manage"]
    });
  }

  if (method === "PUT" && match(slug, ["settings", "system"])) {
    const body = await parseRequestBody(req);
    let access;
    try {
      access = await fetchServerAdminAccess(req);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Admin access required";
      const status = typeof error === "object" && error && "status" in error ? Number((error as { status?: number }).status || 403) : 403;
      return NextResponse.json({ message }, { status });
    }
    const allowedSections = allowedSettingsSections(access);
    const hasRestrictedSection = Object.keys(body).some(
      (key) => !["reason", "audit"].includes(key) && !allowedSections.includes(key)
    );
    if (hasRestrictedSection) {
      return NextResponse.json({ message: "Helper admin cannot perform primary-level settings changes." }, { status: 403 });
    }
    return proxyAdminRequest({
      req,
      upstreamPaths: ["/admin/settings/system"],
      permissionAny: ["settings.manage", "settings.update", "technical.manage"],
      requireReason: true,
      auditAction: "settings.update",
      entityType: "settings",
      body: filterSettingsPayload(body, allowedSections)
    });
  }

  if (method === "POST" && match(slug, ["auth", "logout"])) {
    const body = await parseRequestBody(req);
    try {
      return await proxyAdminRequest({
        req,
        upstreamPaths:
          String(body.audience || "").toUpperCase() === "ADMIN"
            ? ["/admin/auth/logout", "/admins/auth/logout", "/admin/logout", "/auth/logout", "/auth/session/logout", "/sessions/logout"]
            : ["/auth/logout", "/auth/session/logout", "/sessions/logout", "/admin/auth/logout", "/admins/auth/logout", "/admin/logout"],
        auditAction: String(body.audience || "").toUpperCase() === "ADMIN" ? "admin.logout" : "auth.logout",
        entityType: "session",
        body,
        allowBrokenSession: true
      });
    } catch {
      return NextResponse.json({ remoteCleared: false }, { status: 200 });
    }
  }

  return NextResponse.json({ message: "Admin route not implemented" }, { status: 404 });
}

const asOptionalEntityType = (value: unknown) => {
  const next = String(value || "").trim();
  return next || undefined;
};

const asOptionalEntityId = (value: unknown) => {
  const next = String(value || "").trim();
  return next || undefined;
};

export async function GET(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, await readSlug(context.params));
}

export async function POST(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, await readSlug(context.params));
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, await readSlug(context.params));
}

export async function PUT(req: NextRequest, context: { params: Promise<{ slug: string[] }> }) {
  return handleRequest(req, await readSlug(context.params));
}
