import { appApi, client } from "./client";
import { normalizeAdminHref } from "@/lib/adminRouteAlias";
import type {
  AdminPermission,
  AdminContentItem,
  AdminControlCenter,
  AdminEntityActor,
  AdminEntityHistoryItem,
  AdminEntityReportItem,
  AdminRelatedEntitySummary,
  AdminSystemSettings,
  AnalyticsOverview,
  ModerationCenterResponse,
  OperationalAgentItem,
  OperationalOrderItem,
  OperationalPaymentItem,
  OperationalUserItem,
  TaxonomyNodeItem
} from "@/types/admin";

const asRecord = (value: unknown): Record<string, any> | null => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, any>;
};

const asArray = <T = any>(value: unknown): T[] => (Array.isArray(value) ? value : []);

const asString = (value: unknown, fallback = "") => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const asOptionalString = (value: unknown) => {
  const next = asString(value, "").trim();
  return next || null;
};

const asNumber = (value: unknown, fallback = 0) => {
  const next = Number(value);
  return Number.isFinite(next) ? next : fallback;
};

const asBoolean = (value: unknown, fallback = false) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value > 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "active", "enabled"].includes(normalized)) return true;
    if (["false", "0", "no", "disabled"].includes(normalized)) return false;
  }
  return fallback;
};

const getPayload = (value: unknown) => {
  const root = asRecord(value) || {};
  return asRecord(root.data) || root;
};

const normalizeActor = (value: unknown): AdminEntityActor | null => {
  const raw = asRecord(value);
  if (!raw) return null;
  return {
    id: asOptionalString(raw.id || raw._id || raw.userId || raw.actorId) || undefined,
    name: asOptionalString(raw.name || raw.actorName || raw.fullName || raw.email),
    email: asOptionalString(raw.email),
    role: asOptionalString(raw.role || raw.actorRole)
  };
};

const normalizeHistoryItem = (value: unknown): AdminEntityHistoryItem | null => {
  const raw = asRecord(value);
  if (!raw) return null;
  const action = asString(raw.action || raw.type || raw.event || raw.status || "updated");
  return {
    id: asString(raw.id || raw._id || `${action}-${raw.createdAt || raw.at || Math.random()}`),
    action,
    status: asOptionalString(raw.status),
    reason: asOptionalString(raw.reason),
    note: asOptionalString(raw.note || raw.comment || raw.internalNote),
    actor: normalizeActor(raw.actor || raw.admin || raw.user || raw),
    createdAt: asString(raw.createdAt || raw.at || new Date().toISOString())
  };
};

const normalizeHistoryList = (value: unknown) => {
  return asArray(value)
    .map(normalizeHistoryItem)
    .filter(Boolean) as AdminEntityHistoryItem[];
};

const normalizeReasonHistoryList = (value: unknown, action = "note") => {
  return asArray(value)
    .map((item, index) => {
      const reason = asString(item).trim();
      if (!reason) return null;
      return {
        id: `${action}-${index}-${reason.slice(0, 12)}`,
        action,
        reason,
        createdAt: new Date().toISOString()
      } satisfies AdminEntityHistoryItem;
    })
    .filter(Boolean) as AdminEntityHistoryItem[];
};

const normalizeReportItem = (value: unknown): AdminEntityReportItem | null => {
  const raw = asRecord(value);
  if (!raw) return null;
  return {
    id: asString(raw.id || raw._id || raw.reportId || Math.random()),
    reason: asOptionalString(raw.reason || raw.category),
    status: asOptionalString(raw.status),
    reporterName: asOptionalString(raw.reporterName || raw.reportedByName || raw.authorName),
    createdAt: asString(raw.createdAt || new Date().toISOString())
  };
};

const normalizeReports = (value: unknown) => {
  return asArray(value)
    .map(normalizeReportItem)
    .filter(Boolean) as AdminEntityReportItem[];
};

const normalizeRelatedEntity = (value: unknown): AdminRelatedEntitySummary | null => {
  const raw = asRecord(value);
  if (!raw) return null;
  const id = asString(raw.id || raw._id || raw.listingId || raw.productId || raw.serviceId, "");
  if (!id) return null;
  return {
    id,
    title: asString(raw.title || raw.name || raw.label || raw.slug || id),
    status: asOptionalString(raw.status),
    kind: asOptionalString(raw.kind || raw.type || raw.module)
  };
};

const normalizeRelatedEntityList = (value: unknown) => {
  return asArray(value)
    .map(normalizeRelatedEntity)
    .filter(Boolean) as AdminRelatedEntitySummary[];
};

const normalizeParty = (value: unknown) => {
  const raw = asRecord(value);
  if (!raw) return null;
  const id = asString(raw.id || raw._id || raw.userId || raw.agentId, "");
  if (!id) return null;
  return {
    id,
    name: asString(raw.name || raw.fullName || raw.email || "Unknown"),
    email: asOptionalString(raw.email)
  };
};

const normalizeOperationalUser = (value: unknown): OperationalUserItem => {
  const raw = asRecord(value) || {};
  const linkedActivity = asRecord(raw.linkedActivity) || {};
  const activitySummary = asRecord(raw.activitySummary) || {};
  const warningHistory = normalizeHistoryList(raw.warnings || raw.warningHistory);
  const history = normalizeHistoryList(raw.history || raw.actionHistory || raw.statusHistory || raw.recentActions);
  return {
    id: asString(raw.id || raw._id || raw.userId),
    name: asString(raw.name || raw.fullName || raw.username || raw.email || "Unknown user"),
    email: asString(raw.email),
    username: asString(raw.username || raw.handle || raw.email || ""),
    status: asString(raw.status || raw.accountStatus || "ACTIVE"),
    warningCount: asNumber(raw.warningCount || raw.warningsCount),
    reportCount: asNumber(raw.reportCount || raw.reportsCount),
    restrictionReason: asOptionalString(raw.restrictionReason || raw.suspensionReason),
    internalNotes: asOptionalString(raw.internalNotes || raw.note),
    joinedAt: asString(raw.joinedAt || raw.createdAt || new Date().toISOString()),
    region: asOptionalString(raw.region || raw.country || raw.location),
    verificationStatus: asBoolean(raw.verificationStatus || raw.isVerified || raw.verified),
    linkedActivity: {
      orders: asNumber(linkedActivity.orders || activitySummary.orders || raw.orderCount),
      payments: asNumber(linkedActivity.payments || activitySummary.payments || raw.paymentCount),
      posts: asNumber(linkedActivity.posts || activitySummary.posts || raw.postCount)
    },
    activitySummary: {
      orders: asNumber(activitySummary.orders || linkedActivity.orders || raw.orderCount),
      payments: asNumber(activitySummary.payments || linkedActivity.payments || raw.paymentCount),
      posts: asNumber(activitySummary.posts || linkedActivity.posts || raw.postCount),
      followers: asNumber(activitySummary.followers || raw.followers || raw.followersCount),
      following: asNumber(activitySummary.following || raw.following || raw.followingCount),
      totalSignals: asNumber(
        activitySummary.totalSignals ||
          asNumber(linkedActivity.orders || activitySummary.orders || raw.orderCount) +
            asNumber(linkedActivity.payments || activitySummary.payments || raw.paymentCount) +
            asNumber(linkedActivity.posts || activitySummary.posts || raw.postCount)
      )
    },
    followers: asNumber(raw.followers || raw.followersCount || activitySummary.followers),
    following: asNumber(raw.following || raw.followingCount || activitySummary.following),
    lastActiveAt: asOptionalString(raw.lastActiveAt || raw.lastSeenAt),
    lastAdminActionAt: asOptionalString(raw.lastAdminActionAt || raw.lastModeratedAt),
    warnings: warningHistory.length ? warningHistory : normalizeReasonHistoryList(raw.warnings, "warning"),
    reports: normalizeReports(raw.reports || raw.reportItems),
    history,
    flags: asArray<string>(raw.flags || raw.riskFlags || raw.warnings).map((item) => asString(item)).filter(Boolean)
  };
};

const normalizeOperationalAgent = (value: unknown): OperationalAgentItem => {
  const raw = asRecord(value) || {};
  const complaintsSummary = asRecord(raw.complaintsSummary) || {};
  const verificationSummary = asRecord(raw.verificationSummary) || {};
  const linkedProducts = normalizeRelatedEntityList(raw.linkedProducts || raw.products);
  const linkedServices = normalizeRelatedEntityList(raw.linkedServices || raw.services);
  const linkedListings = normalizeRelatedEntityList(raw.linkedListings || [...linkedProducts, ...linkedServices]);
  const actionHistory = normalizeHistoryList(raw.actionHistory || raw.history || raw.recentActions);
  const statusHistory = normalizeHistoryList(raw.statusHistory || raw.recentActions);
  return {
    id: asString(raw.id || raw._id || raw.agentId),
    userId: asOptionalString(raw.userId) || undefined,
    name: asString(raw.name || raw.fullName || raw.businessName || "Unknown agent"),
    email: asOptionalString(raw.email),
    kind: asString(raw.kind || raw.type || "service"),
    adminStatus: asString(raw.adminStatus || raw.status || "PENDING"),
    verifiedByAdmin: asBoolean(raw.verifiedByAdmin || raw.isVerifiedByAdmin),
    faceIdVerified: asBoolean(raw.faceIdVerified || raw.faceVerified),
    badge: asOptionalString(raw.badge),
    rating: asNumber(raw.rating),
    ratingCount: asNumber(raw.ratingCount),
    complaints: asNumber(raw.complaints || raw.complaintCount),
    responseRate: asNumber(raw.responseRate),
    productsCount: asNumber(raw.productsCount || raw.productCount),
    servicesCount: asNumber(raw.servicesCount || raw.serviceCount),
    orderCount: asNumber(raw.orderCount),
    internalNotes: asOptionalString(raw.internalNotes || raw.note),
    lastModeratedAt: asOptionalString(raw.lastModeratedAt || raw.updatedAt),
    createdAt: asString(raw.createdAt || new Date().toISOString()),
    verificationQueuePosition: raw.verificationQueuePosition == null ? null : asNumber(raw.verificationQueuePosition),
    verificationSummary: {
      verifiedByAdmin: asBoolean(verificationSummary.verifiedByAdmin || raw.verifiedByAdmin),
      faceIdVerified: asBoolean(verificationSummary.faceIdVerified || raw.faceIdVerified),
      requiresReview: asBoolean(verificationSummary.requiresReview, !asBoolean(raw.verifiedByAdmin) || !asBoolean(raw.faceIdVerified))
    },
    linkedListings,
    linkedProducts,
    linkedServices,
    statusHistory: statusHistory.length ? statusHistory : actionHistory,
    actionHistory,
    complaintsSummary: {
      open: asNumber(complaintsSummary.open || raw.complaints || raw.complaintCount),
      resolved: asNumber(complaintsSummary.resolved),
      escalated: asNumber(complaintsSummary.escalated)
    },
    pendingChecklist: asArray<string>(raw.pendingChecklist || raw.verificationChecklist)
      .map((item) => asString(item))
      .filter(Boolean),
    internalFlags: asArray<string>(raw.internalFlags || raw.flags).map((item) => asString(item)).filter(Boolean)
  };
};

const normalizeOperationalOrder = (value: unknown): OperationalOrderItem => {
  const raw = asRecord(value) || {};
  const paymentSummary = asRecord(raw.paymentSummary);
  const itemsPreview = asArray(raw.itemsPreview)
    .map((item) => {
      const preview = asRecord(item) || {};
      return {
        productId: asOptionalString(preview.productId),
        title: asString(preview.title || preview.name || "Item"),
        qty: asNumber(preview.qty || preview.quantity),
        unitPrice: asNumber(preview.unitPrice || preview.price),
        image: asOptionalString(preview.image)
      };
    })
    .filter((item) => item.title);
  const listingFromItems =
    itemsPreview[0] &&
    ({
      id: itemsPreview[0].productId || asString(raw.id || raw._id),
      title: itemsPreview[0].title,
      status: asOptionalString(raw.status),
      kind: asOptionalString(raw.kind)
    } satisfies AdminRelatedEntitySummary);
  return {
    id: asString(raw.id || raw._id || raw.orderId),
    kind: asString(raw.kind || raw.type || "product"),
    status: asString(raw.status || "PENDING"),
    user: normalizeParty(raw.user || raw.customer),
    agent: normalizeParty(raw.agent || raw.provider),
    total: asNumber(raw.total || raw.amount),
    currency: asString(raw.currency || "USD"),
    itemCount: asNumber(raw.itemCount || raw.quantity || 1, 1),
    itemsPreview,
    source: asString(raw.source || raw.channel || "marketplace"),
    bookingAt: asOptionalString(raw.bookingAt || raw.scheduledAt),
    disputeReason: asOptionalString(raw.disputeReason),
    refundReason: asOptionalString(raw.refundReason),
    note: asOptionalString(raw.note || raw.internalNote),
    listing: normalizeRelatedEntity(raw.listing || raw.product || raw.service) || listingFromItems || null,
    paymentState: asOptionalString(
      raw.paymentState ||
        raw.paymentStatus ||
        (paymentSummary
          ? paymentSummary.flagged
            ? "FLAGGED"
            : paymentSummary.escalated
              ? "ESCALATED"
              : paymentSummary.successful
                ? "SUCCESS"
                : null
          : null)
    ),
    refundState: asOptionalString(raw.refundState || raw.refundStatus),
    disputeState: asOptionalString(raw.disputeState || raw.disputeStatus),
    shipping: (() => {
      const shipping = asRecord(raw.shipping);
      if (!shipping) return null;
      return {
        name: asString(shipping.name),
        phone: asString(shipping.phone),
        address1: asString(shipping.address1),
        address2: asOptionalString(shipping.address2),
        postalCode: asOptionalString(shipping.postalCode)
      };
    })(),
    paymentMethod: (() => {
      const method = asRecord(raw.paymentMethod);
      if (!method) return null;
      return {
        method: asString(method.method),
        provider: asOptionalString(method.provider),
        transactionId: asOptionalString(method.transactionId),
        paidAt: asOptionalString(method.paidAt)
      };
    })(),
    paymentSummary: paymentSummary
      ? {
          totalTransactions: asNumber(paymentSummary.totalTransactions),
          successful: asNumber(paymentSummary.successful),
          failed: asNumber(paymentSummary.failed),
          refunded: asNumber(paymentSummary.refunded),
          flagged: asNumber(paymentSummary.flagged),
          escalated: asNumber(paymentSummary.escalated),
          payouts: asNumber(paymentSummary.payouts),
          refunds: asNumber(paymentSummary.refunds),
          totalAmount: asNumber(paymentSummary.totalAmount)
        }
      : null,
    payments: asArray(raw.payments).map((item) => {
      const payment = asRecord(item) || {};
      return {
        id: asString(payment.id || payment._id || payment.transactionId),
        status: asString(payment.status || "PENDING"),
        financeStatus: asOptionalString(payment.financeStatus),
        kind: asOptionalString(payment.kind),
        amount: asNumber(payment.amount),
        provider: asString(payment.provider || payment.gateway || "unknown")
      };
    }),
    createdAt: asString(raw.createdAt || new Date().toISOString()),
    updatedAt: asOptionalString(raw.updatedAt),
    timeline: normalizeHistoryList(raw.timeline || raw.history || raw.statusHistory || raw.recentActions)
  };
};

const normalizeOperationalPayment = (value: unknown): OperationalPaymentItem => {
  const raw = asRecord(value) || {};
  const payout = asRecord(raw.payout);
  const refund = asRecord(raw.refund);
  return {
    id: asString(raw.id || raw._id || raw.paymentId),
    status: asString(raw.status || "PENDING"),
    financeStatus: asString(raw.financeStatus || raw.reviewStatus || "OPEN"),
    riskLevel: asString(raw.riskLevel || "low"),
    kind: asString(raw.kind || raw.type || "transaction"),
    provider: asString(raw.provider || raw.gateway || "unknown"),
    amount: asNumber(raw.amount),
    currency: asString(raw.currency || "USD"),
    note: asOptionalString(raw.note || raw.internalNote),
    transactionId: asOptionalString(raw.transactionId || raw.reference),
    user: normalizeParty(raw.user || raw.customer),
    order: (() => {
      const order = asRecord(raw.order);
      if (!order) return null;
      return {
        id: asString(order.id || order._id || order.orderId),
        status: asOptionalString(order.status),
        total: order.total == null ? null : asNumber(order.total),
        kind: asOptionalString(order.kind),
        source: asOptionalString(order.source)
      };
    })(),
    createdAt: asString(raw.createdAt || new Date().toISOString()),
    paymentMethod: asOptionalString(raw.paymentMethod?.method || raw.paymentMethod || raw.method),
    failureCode: asOptionalString(raw.failureCode || raw.errorCode),
    suspiciousSignals: asArray<string>(raw.suspiciousSignals || raw.flags || raw.issueFlags).map((item) => asString(item)).filter(Boolean),
    issueFlags: asArray<string>(raw.issueFlags || raw.flags).map((item) => asString(item)).filter(Boolean),
    payout: payout
      ? {
          id: asString(payout.id || payout._id || payout.payoutId),
          status: asOptionalString(payout.status),
          amount: payout.amount == null ? null : asNumber(payout.amount)
        }
      : null,
    refund: refund
      ? {
          id: asString(refund.id || refund._id || refund.refundId),
          status: asOptionalString(refund.status),
          amount: refund.amount == null ? null : asNumber(refund.amount)
        }
      : null,
    history: normalizeHistoryList(raw.history || raw.reviewHistory || raw.timeline || raw.recentActions)
  };
};

const normalizeContentItem = (value: unknown): AdminContentItem => {
  const raw = asRecord(value) || {};
  const updatedBy = asRecord(raw.updatedBy);
  const payload = (asRecord(raw.payload) || {}) as Record<string, unknown>;
  return {
    id: asString(raw.id || raw._id || raw.contentId),
    key: asString(raw.key || raw.slug),
    title: asString(raw.title || raw.name || raw.key),
    kind: asString(
      raw.kind === "featured_content"
        ? "featured"
        : raw.kind === "static_page"
          ? "static"
          : raw.kind || raw.type || "banner"
    ),
    status: asString(raw.status === "ACTIVE" ? "PUBLISHED" : raw.status || "DRAFT"),
    audience: asOptionalString(raw.audience),
    priority: asNumber(raw.priority),
    payload,
    slot: asOptionalString(raw.slot || payload.slot),
    placement: asOptionalString(raw.placement || payload.placement),
    updatedByName: asOptionalString(raw.updatedByName || updatedBy?.name || updatedBy?.email || raw.updatedBy),
    updatedBy: updatedBy
      ? {
          id: asString(updatedBy.id || updatedBy._id),
          name: asOptionalString(updatedBy.name || updatedBy.email)
        }
      : null,
    payloadKeys: asArray<string>(raw.payloadKeys).length
      ? asArray<string>(raw.payloadKeys).map((item) => asString(item)).filter(Boolean)
      : Object.keys(payload),
    startsAt: asOptionalString(raw.startsAt || payload.startsAt),
    endsAt: asOptionalString(raw.endsAt || payload.endsAt),
    updatedAt: asString(raw.updatedAt || raw.createdAt || new Date().toISOString()),
    createdAt: asString(raw.createdAt || new Date().toISOString())
  };
};

const normalizeTaxonomyNode = (value: unknown): TaxonomyNodeItem => {
  const raw = asRecord(value) || {};
  const metadata = (asRecord(raw.metadata) || {}) as Record<string, unknown>;
  const updatedBy = asRecord(raw.updatedBy);
  return {
    id: asString(raw.id || raw._id || raw.nodeId),
    module: asString(raw.module || "products"),
    kind: asString(raw.kind || "category"),
    key: asString(raw.key || raw.slug),
    label: asString(raw.label || raw.title || raw.name || raw.key),
    slug: asOptionalString(raw.slug),
    parentId: asOptionalString(raw.parentId || raw.parent?._id || raw.parent?.id),
    parentLabel: asOptionalString(raw.parentLabel || raw.parent?.label),
    status: asString(raw.status || "ACTIVE"),
    sortOrder: asNumber(raw.sortOrder),
    metadata,
    updatedAt: asString(raw.updatedAt || raw.createdAt || new Date().toISOString()),
    childCount: raw.childCount == null ? undefined : asNumber(raw.childCount),
    usageCount: raw.usageCount == null ? undefined : asNumber(raw.usageCount),
    path: asArray<string>(raw.path).map((item) => asString(item)).filter(Boolean),
    metadataKeys: asArray<string>(raw.metadataKeys).length
      ? asArray<string>(raw.metadataKeys).map((item) => asString(item)).filter(Boolean)
      : Object.keys(metadata),
    updatedBy: updatedBy
      ? {
          id: asString(updatedBy.id || updatedBy._id),
          name: asOptionalString(updatedBy.name || updatedBy.email)
        }
      : null
  };
};

export async function getAdminControlCenter(): Promise<AdminControlCenter> {
  const res = await appApi.get("/api/admin/dashboard/control-center");
  const payload = getPayload(res.data);
  return {
    cards: {
      totalUsers: asNumber(payload.cards?.totalUsers),
      totalAgents: asNumber(payload.cards?.totalAgents),
      activeListings: asNumber(payload.cards?.activeListings),
      pendingApprovals: asNumber(payload.cards?.pendingApprovals),
      unresolvedReports: asNumber(payload.cards?.unresolvedReports),
      todayOrders: asNumber(payload.cards?.todayOrders),
      todayBookings: asNumber(payload.cards?.todayBookings),
      paymentIssues: asNumber(payload.cards?.paymentIssues),
      suspiciousAccounts: asNumber(payload.cards?.suspiciousAccounts),
      suspiciousActions: asNumber(payload.cards?.suspiciousActions),
      systemStatus: asString(payload.cards?.systemStatus || "unknown")
    },
    queues: (payload.queues as Record<string, number>) || {},
    queueSummary: asArray(payload.queueSummary).map((item) => ({
      id: asString(item?.id || item?._id),
      label: asString(item?.label || item?.title || item?.id),
      count: asNumber(item?.count),
      tone: asOptionalString(item?.tone) || undefined,
      href: normalizeAdminHref(asOptionalString(item?.href)) || undefined,
      module: asOptionalString(item?.module) || undefined,
      description: asOptionalString(item?.description) || undefined,
      permissionAny: asArray<string>(item?.permissionAny).map((value) => asString(value) as AdminPermission)
    })),
    alerts: asArray(payload.alerts).map((item) => ({
      id: asOptionalString(item?.id) || undefined,
      level: asString(item?.level || "low") as "low" | "medium" | "high",
      title: asString(item?.title),
      description: asOptionalString(item?.description) || undefined,
      count: asNumber(item?.count),
      href: normalizeAdminHref(asOptionalString(item?.href)) || undefined,
      module: asOptionalString(item?.module) || undefined,
      permissionAny: asArray<string>(item?.permissionAny).map((value) => asString(value) as AdminPermission)
    })),
    escalations: asArray(payload.escalations).map((item) => ({
      id: asOptionalString(item?.id) || undefined,
      level: asString(item?.level || "low") as "low" | "medium" | "high",
      title: asString(item?.title),
      description: asOptionalString(item?.description) || undefined,
      count: asNumber(item?.count),
      href: normalizeAdminHref(asOptionalString(item?.href)) || undefined,
      module: asOptionalString(item?.module) || undefined,
      permissionAny: asArray<string>(item?.permissionAny).map((value) => asString(value) as AdminPermission)
    })),
    recentAdminActions: asArray(payload.recentAdminActions).map((item) => ({
      id: asString(item?.id || item?._id),
      actorId: asOptionalString(item?.actorId) || undefined,
      actorName: asOptionalString(item?.actorName),
      actorRole: asOptionalString(item?.actorRole) || undefined,
      action: asString(item?.action),
      entityType: asOptionalString(item?.entityType) || undefined,
      entityId: asOptionalString(item?.entityId) || undefined,
      reason: asOptionalString(item?.reason) || undefined,
      createdAt: asString(item?.createdAt || new Date().toISOString())
    })),
    recentOrders: asArray(payload.recentOrders).map((item) => ({
      id: asString(item?.id),
      kind: asOptionalString(item?.kind) || undefined,
      status: asString(item?.status),
      total: asNumber(item?.total),
      currency: asString(item?.currency || "USD"),
      userName: asOptionalString(item?.userName),
      bookingAt: asOptionalString(item?.bookingAt),
      createdAt: asString(item?.createdAt || new Date().toISOString())
    })),
    recentPayments: asArray(payload.recentPayments).map((item) => ({
      id: asString(item?.id),
      status: asString(item?.status),
      amount: asNumber(item?.amount),
      currency: asString(item?.currency || "USD"),
      userName: asOptionalString(item?.userName),
      createdAt: asString(item?.createdAt || new Date().toISOString())
    })),
    systemHealth: {
      api: asOptionalString(payload.systemHealth?.api),
      moderation: asOptionalString(payload.systemHealth?.moderation),
      storage: asOptionalString(payload.systemHealth?.storage),
      overall: asOptionalString(payload.systemHealth?.overall)
    }
  };
}

export async function getModerationCenter(params: {
  page?: number;
  limit?: number;
  module?: string;
  sort?: string;
  urgent?: boolean;
  unresolved?: boolean;
  escalated?: boolean;
  repeatedOffender?: boolean;
} = {}): Promise<ModerationCenterResponse> {
  const res = await appApi.get("/api/admin/moderation/center", {
    params: {
      page: params.page || 1,
      limit: params.limit || 50,
      module: params.module || undefined,
      sort: params.sort || undefined,
      urgent: params.urgent || undefined,
      unresolved: params.unresolved || undefined,
      escalated: params.escalated || undefined,
      repeatedOffender: params.repeatedOffender || undefined
    }
  });
  const payload = getPayload(res.data);
  return {
    items: asArray(payload.items).map((item) => ({
      module: asString(item?.module),
      queueType: asString(item?.queueType),
      queueLabel: asString(item?.queueLabel || item?.queueType),
      entityType: asString(item?.entityType),
      id: asString(item?.id || item?._id),
      title: asString(item?.title),
      status: asString(item?.status),
      riskLevel: asString(item?.riskLevel || "low") as "low" | "medium" | "high",
      reportCount: asNumber(item?.reportCount),
      ownerName: asOptionalString(item?.ownerName),
      createdAt: asString(item?.createdAt || new Date().toISOString()),
      updatedAt: asOptionalString(item?.updatedAt) || undefined,
      reason: asOptionalString(item?.reason) || undefined,
      preview: item?.preview
        ? {
            summary: asOptionalString(item.preview.summary) || undefined,
            imageUrl: asOptionalString(item.preview.imageUrl)
          }
        : undefined,
      detailRows: asArray(item?.detailRows).map((row) => ({
        label: asString(row?.label),
        value: asString(row?.value)
      })),
      linkedEntity: item?.linkedEntity
        ? {
            type: asString(item.linkedEntity.type),
            id: asOptionalString(item.linkedEntity.id) || undefined,
            label: asString(item.linkedEntity.label),
            subtitle: asOptionalString(item.linkedEntity.subtitle)
          }
        : undefined,
      history: normalizeHistoryList(item?.history),
      internalNotes: asArray<string>(item?.internalNotes).map((entry) => asString(entry)).filter(Boolean),
      flags: {
        urgent: asBoolean(item?.flags?.urgent),
        unresolved: asBoolean(item?.flags?.unresolved),
        escalated: asBoolean(item?.flags?.escalated),
        repeatedOffender: asBoolean(item?.flags?.repeatedOffender)
      },
      actions: asArray<string>(item?.actions).map((action) => asString(action))
    })),
    summary: asArray(payload.summary).map((item) => ({
      id: asString(item?.id || item?._id),
      label: asString(item?.label || item?.title || item?.id),
      count: asNumber(item?.count),
      permissionAny: asArray<string>(item?.permissionAny).map((value) => asString(value) as AdminPermission)
    })),
    total: asNumber(payload.total, 0),
    page: asNumber(payload.page, 1),
    limit: asNumber(payload.limit, params.limit || 50)
  };
}

export async function applyModerationCenterAction(payload: {
  id: string;
  module: string;
  entityType: string;
  action: string;
  reason?: string;
  note?: string;
}) {
  const res = await appApi.post("/api/admin/moderation/center/action", payload);
  return getPayload(res.data);
}

export async function getOperationalUsers(params: {
  page?: number;
  limit?: number;
  status?: string;
  region?: string;
  search?: string;
}) {
  const res = await appApi.get("/api/admin/users/operations", { params });
  const payload = getPayload(res.data);
  return {
    items: asArray(payload.items).map(normalizeOperationalUser),
    total: asNumber(payload.total, 0),
    page: asNumber(payload.page, 1),
    limit: asNumber(payload.limit, params.limit || 25)
  };
}

export async function updateOperationalUser(id: string, payload: { action: string; reason?: string; note?: string }) {
  const res = await appApi.post(`/api/admin/users/${id}/action`, payload);
  return getPayload(res.data);
}

export async function getOperationalAgents(params: {
  page?: number;
  limit?: number;
  status?: string;
  badge?: string;
  search?: string;
}) {
  const res = await appApi.get("/api/admin/agents/operations", { params });
  const payload = getPayload(res.data);
  return {
    items: asArray(payload.items).map(normalizeOperationalAgent),
    total: asNumber(payload.total, 0),
    page: asNumber(payload.page, 1),
    limit: asNumber(payload.limit, params.limit || 25)
  };
}

export async function updateOperationalAgent(
  id: string,
  payload: { action: string; reason?: string; note?: string; badge?: string }
) {
  const res = await appApi.post(`/api/admin/agents/${id}/action`, payload);
  return getPayload(res.data);
}

export async function getOperationalOrders(params: { page?: number; limit?: number; status?: string; kind?: string }) {
  const res = await appApi.get("/api/admin/orders/operations", { params });
  const payload = getPayload(res.data);
  return {
    items: asArray(payload.items).map(normalizeOperationalOrder),
    total: asNumber(payload.total, 0),
    page: asNumber(payload.page, 1),
    limit: asNumber(payload.limit, params.limit || 25)
  };
}

export async function updateOperationalOrder(
  id: string,
  payload: {
    status: string;
    note?: string;
    disputeReason?: string;
    refundReason?: string;
    reason?: string;
  }
) {
  const res = await appApi.post(`/api/admin/orders/${id}/status`, payload);
  return getPayload(res.data);
}

export async function getOperationalPayments(params: {
  page?: number;
  limit?: number;
  status?: string;
  financeStatus?: string;
  riskLevel?: string;
}) {
  const res = await appApi.get("/api/admin/payments/operations", { params });
  const payload = getPayload(res.data);
  return {
    items: asArray(payload.items).map(normalizeOperationalPayment),
    total: asNumber(payload.total, 0),
    page: asNumber(payload.page, 1),
    limit: asNumber(payload.limit, params.limit || 25)
  };
}

export async function reviewOperationalPayment(
  id: string,
  payload: { action: string; confirmed?: boolean; note?: string; reason?: string }
) {
  const res = await appApi.post(`/api/admin/payments/${id}/review`, payload);
  return getPayload(res.data);
}

export async function getContentItems(params: { kind?: string; status?: string } = {}) {
  const res = await appApi.get("/api/admin/content/items", {
    params: {
      ...params,
      kind:
        params.kind === "featured" ? "featured_content" : params.kind === "static" ? "static_page" : params.kind,
      status: params.status === "PUBLISHED" ? "ACTIVE" : params.status
    }
  });
  const payload = getPayload(res.data);
  return asArray(payload.items).map(normalizeContentItem);
}

export async function saveContentItem(payload: {
  id?: string;
  key: string;
  title: string;
  kind: string;
  status: string;
  audience?: string;
  priority?: number;
  slot?: string;
  placement?: string;
  startsAt?: string;
  endsAt?: string;
  payload: Record<string, unknown>;
  reason?: string;
}) {
  const path = payload.id ? `/api/admin/content/items/${payload.id}` : "/api/admin/content/items";
  const method = payload.id ? appApi.patch : appApi.post;
  const res = await method(path, {
    ...payload,
    kind:
      payload.kind === "featured" ? "featured_content" : payload.kind === "static" ? "static_page" : payload.kind,
    status: payload.status === "PUBLISHED" ? "ACTIVE" : payload.status,
    payload: {
      ...(payload.payload || {}),
      ...(payload.slot ? { slot: payload.slot } : {}),
      ...(payload.placement ? { placement: payload.placement } : {}),
      ...(payload.startsAt ? { startsAt: payload.startsAt } : {}),
      ...(payload.endsAt ? { endsAt: payload.endsAt } : {})
    }
  });
  return getPayload(res.data);
}

export async function getTaxonomyNodes(params: { module?: string; kind?: string } = {}) {
  const res = await appApi.get("/api/admin/taxonomy/nodes", { params });
  const payload = getPayload(res.data);
  return asArray(payload.items).map(normalizeTaxonomyNode);
}

export async function saveTaxonomyNode(payload: {
  id?: string;
  module: string;
  kind: string;
  key: string;
  label: string;
  slug?: string | null;
  parentId?: string | null;
  status?: string;
  sortOrder?: number;
  metadata?: Record<string, unknown>;
  reason?: string;
}) {
  const path = payload.id ? `/api/admin/taxonomy/nodes/${payload.id}` : "/api/admin/taxonomy/nodes";
  const method = payload.id ? appApi.patch : appApi.post;
  const res = await method(path, payload);
  return getPayload(res.data);
}

export async function getAnalyticsOverview(): Promise<AnalyticsOverview> {
  const res = await appApi.get("/api/admin/analytics/overview");
  const payload = getPayload(res.data);
  return {
    summary: {
      newUsers30d: asNumber(payload.summary?.newUsers30d),
      newUsersDelta: asNumber(payload.summary?.newUsersDelta),
      newAgents30d: asNumber(payload.summary?.newAgents30d),
      newAgentsDelta: asNumber(payload.summary?.newAgentsDelta),
      orders30d: asNumber(payload.summary?.orders30d),
      grossVolume30d: asNumber(payload.summary?.grossVolume30d),
      paymentVolume30d: asNumber(payload.summary?.paymentVolume30d),
      completionRate: asNumber(payload.summary?.completionRate),
      paymentSuccessRate: asNumber(payload.summary?.paymentSuccessRate)
    },
    growth: {
      users: asArray(payload.growth?.users).map((item) => ({
        _id: asString(item?._id || item?.label || item?.date),
        count: asNumber(item?.count)
      })),
      agents: asArray(payload.growth?.agents).map((item) => ({
        _id: asString(item?._id || item?.label || item?.date),
        count: asNumber(item?.count)
      }))
    },
    orders: asArray(payload.orders).map((item) => ({
      _id: asString(item?._id || item?.status || "unknown"),
      count: asNumber(item?.count),
      volume: asNumber(item?.volume)
    })),
    complaints: {
      users: asNumber(payload.complaints?.users),
      agents: asNumber(payload.complaints?.agents),
      posts: asNumber(payload.complaints?.posts),
      groups: asNumber(payload.complaints?.groups)
    },
    complaintRate: {
      users: {
        affected: asNumber(payload.complaintRate?.users?.affected),
        total: asNumber(payload.complaintRate?.users?.total),
        rate: asNumber(payload.complaintRate?.users?.rate)
      },
      agents: {
        affected: asNumber(payload.complaintRate?.agents?.affected),
        total: asNumber(payload.complaintRate?.agents?.total),
        rate: asNumber(payload.complaintRate?.agents?.rate)
      },
      posts: {
        affected: asNumber(payload.complaintRate?.posts?.affected),
        total: asNumber(payload.complaintRate?.posts?.total),
        rate: asNumber(payload.complaintRate?.posts?.rate)
      },
      groups: {
        affected: asNumber(payload.complaintRate?.groups?.affected),
        total: asNumber(payload.complaintRate?.groups?.total),
        rate: asNumber(payload.complaintRate?.groups?.rate)
      }
    },
    categoryDemand: {
      products: asArray(payload.categoryDemand?.products).map((item) => ({
        _id: asString(item?._id || "uncategorized"),
        count: asNumber(item?.count)
      })),
      services: asArray(payload.categoryDemand?.services).map((item) => ({
        _id: asString(item?._id || "uncategorized"),
        count: asNumber(item?.count)
      }))
    },
    agentPerformance: asArray(payload.agentPerformance).map((item) => ({
      id: asString(item?.id || item?._id || item?.agentId),
      name: asString(item?.name || item?.agentName || "Agent"),
      rating: asNumber(item?.rating),
      responseRate: asNumber(item?.responseRate),
      complaints: asNumber(item?.complaints)
    })),
    listingPerformance: {
      products: asArray(payload.listingPerformance?.products).map((item) => ({
        id: asString(item?.id || item?._id || item?.listingId),
        title: asString(item?.title || item?.name || "Listing"),
        category: asOptionalString(item?.category),
        status: asOptionalString(item?.status),
        orders: asNumber(item?.orders),
        views: asNumber(item?.views),
        likes: asNumber(item?.likes),
        createdAt: asOptionalString(item?.createdAt)
      })),
      services: asArray(payload.listingPerformance?.services).map((item) => ({
        id: asString(item?.id || item?._id || item?.listingId),
        title: asString(item?.title || item?.name || "Listing"),
        category: asOptionalString(item?.category),
        status: asOptionalString(item?.status),
        orders: asNumber(item?.orders),
        views: asNumber(item?.views),
        likes: asNumber(item?.likes),
        createdAt: asOptionalString(item?.createdAt)
      }))
    },
    conversionTrends: {
      orders30d: {
        total: asNumber(payload.conversionTrends?.orders30d?.total),
        completed: asNumber(payload.conversionTrends?.orders30d?.completed),
        disputed: asNumber(payload.conversionTrends?.orders30d?.disputed),
        cancelled: asNumber(payload.conversionTrends?.orders30d?.cancelled)
      },
      payments30d: {
        total: asNumber(payload.conversionTrends?.payments30d?.total),
        successful: asNumber(payload.conversionTrends?.payments30d?.successful),
        failed: asNumber(payload.conversionTrends?.payments30d?.failed),
        refunded: asNumber(payload.conversionTrends?.payments30d?.refunded),
        flagged: asNumber(payload.conversionTrends?.payments30d?.flagged)
      },
      rates: {
        orderCompletionRate: asNumber(payload.conversionTrends?.rates?.orderCompletionRate),
        disputeRate: asNumber(payload.conversionTrends?.rates?.disputeRate),
        paymentSuccessRate: asNumber(payload.conversionTrends?.rates?.paymentSuccessRate),
        paymentFailureRate: asNumber(payload.conversionTrends?.rates?.paymentFailureRate)
      }
    },
    moderationLoad: {
      pendingServices: asNumber(payload.moderationLoad?.pendingServices),
      pendingAgentVerifications: asNumber(payload.moderationLoad?.pendingAgentVerifications),
      reportedPosts: asNumber(payload.moderationLoad?.reportedPosts),
      flaggedGroups: asNumber(payload.moderationLoad?.flaggedGroups),
      openFinanceIssues: asNumber(payload.moderationLoad?.openFinanceIssues),
      disputedOrders: asNumber(payload.moderationLoad?.disputedOrders)
    }
  };
}

export async function getAdminSettings(): Promise<AdminSystemSettings> {
  const res = await client.get("/admin/settings/system");
  const payload = getPayload(res.data);
  return ((payload.settings as AdminSystemSettings) || payload || {}) as AdminSystemSettings;
}

export async function saveAdminSettings(payload: AdminSystemSettings & { reason?: string }) {
  const res = await client.put("/admin/settings/system", payload);
  return getPayload(res.data);
}
