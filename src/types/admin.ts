export type AdminAccessStatus = "PENDING" | "APPROVED" | "SUSPENDED" | "REVOKED";
export type AdminLevel = "PRIMARY" | "MANAGER" | "STAFF";

export type AdminPermission =
  | "admin.manage"
  | "dashboard.view"
  | "dashboard.read"
  | "analytics.view"
  | "settings.manage"
  | "settings.update"
  | "admins.view"
  | "admins.create"
  | "admins.read"
  | "admins.manage"
  | "admins.invite"
  | "admins.approve"
  | "admins.revoke"
  | "admins.assign_permissions"
  | "admins.roles.manage"
  | "admins.roles.write"
  | "admins.scopes.manage"
  | "admins.scopes.write"
  | "admins.department.manage"
  | "admins.department.write"
  | "rbac.view"
  | "rbac.read"
  | "rbac.manage"
  | "rbac.write"
  | "users.view"
  | "users.read"
  | "users.edit"
  | "users.update"
  | "users.warn"
  | "users.suspend"
  | "users.ban"
  | "users.freeze"
  | "agents.view"
  | "agents.read"
  | "agents.verify"
  | "agents.suspend"
  | "agents.freeze"
  | "agents.note"
  | "agents.badge"
  | "products.create"
  | "products.view"
  | "products.edit"
  | "products.approve"
  | "products.reject"
  | "products.delete"
  | "products.feature"
  | "services.create"
  | "services.view"
  | "services.edit"
  | "services.approve"
  | "services.reject"
  | "services.delete"
  | "services.feature"
  | "listings.read_all"
  | "listings.moderate"
  | "listings.approve_reject"
  | "listings.pause_force"
  | "community.view"
  | "community.moderate"
  | "community.delete_post"
  | "groups.view"
  | "groups.moderate"
  | "posts.moderate"
  | "comments.moderate"
  | "moderation.view"
  | "reports.view"
  | "reports.resolve"
  | "disputes.view"
  | "disputes.resolve"
  | "escalations.manage"
  | "content.view"
  | "content.manage"
  | "content.moderate"
  | "media.moderate"
  | "taxonomy.view"
  | "taxonomy.manage"
  | "orders.view"
  | "orders.read"
  | "orders.manage"
  | "payments.view"
  | "payments.read"
  | "payments.manage"
  | "refunds.manage"
  | "payouts.approve"
  | "audit.view"
  | "audit.read"
  | "logs.read"
  | "sessions.view"
  | "sessions.read"
  | "sessions.revoke"
  | "technical.view"
  | "technical.manage"
  | "system.health.view";

export interface AdminScope {
  module: string;
  region?: string;
  countryCode?: string;
  category?: string;
  subcategory?: string;
}

export interface AdminWorkspaceNavItem {
  id: string;
  label: string;
  href: string;
  layer?: string;
  description?: string;
  permissionAny?: string[];
}

export interface AdminWorkspaceLayer {
  id: string;
  label: string;
  items: AdminWorkspaceNavItem[];
}

export interface AdminWorkspace {
  model?: string;
  accessTier?: string;
  department?: string | null;
  roleNames?: string[];
  sidebar: AdminWorkspaceNavItem[];
  layers?: AdminWorkspaceLayer[];
}

export interface AdminSessionInfo {
  sessionId?: string;
  adminModeUntil?: string;
  lastSeenAt?: string;
}

export interface AdminAccess {
  id: string;
  userId?: string;
  name: string;
  email: string;
  status: AdminAccessStatus;
  level: AdminLevel;
  department?: string;
  position?: string;
  mfaEnabled: boolean;
  permissions: AdminPermission[];
  scopes: AdminScope[];
  roleNames?: string[];
  roleBadge?: string;
  requiresMfaSetup?: boolean;
  workspace?: AdminWorkspace;
  adminSession?: AdminSessionInfo;
}

export interface AdminDashboardStats {
  pendingApprovals: number;
  reportedPosts: number;
  pendingListings: number;
}

export interface AdminDashboardAlert {
  id?: string;
  level: "low" | "medium" | "high";
  title: string;
  description?: string;
  count: number;
  href?: string;
  module?: string;
  permissionAny?: AdminPermission[];
}

export interface AdminDashboardQueueItem {
  id: string;
  label: string;
  count: number;
  tone?: string;
  href?: string;
  module?: string;
  description?: string;
  permissionAny?: AdminPermission[];
}

export interface AdminDashboardRecentAction {
  id: string;
  actorId?: string;
  actorName?: string | null;
  actorRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  reason?: string;
  createdAt: string;
}

export interface AdminRecentOrderSummary {
  id: string;
  kind?: string;
  status: string;
  total: number;
  currency: string;
  userName?: string | null;
  bookingAt?: string | null;
  createdAt: string;
}

export interface AdminRecentPaymentSummary {
  id: string;
  status: string;
  amount: number;
  currency: string;
  userName?: string | null;
  createdAt: string;
}

export interface AdminControlCenter {
  cards: {
    totalUsers: number;
    totalAgents: number;
    activeListings: number;
    pendingApprovals: number;
    unresolvedReports: number;
    todayOrders: number;
    todayBookings: number;
    paymentIssues: number;
    suspiciousAccounts: number;
    suspiciousActions: number;
    systemStatus: string;
  };
  queues: Record<string, number>;
  queueSummary: AdminDashboardQueueItem[];
  alerts: AdminDashboardAlert[];
  escalations: AdminDashboardAlert[];
  recentAdminActions: AdminDashboardRecentAction[];
  recentOrders: AdminRecentOrderSummary[];
  recentPayments: AdminRecentPaymentSummary[];
  systemHealth: {
    api?: string | null;
    moderation?: string | null;
    storage?: string | null;
    overall?: string | null;
  };
}

export interface AdminListItem extends AdminAccess {
  invitedAt?: string;
  invitedBy?: string;
  invitedByName?: string | null;
  approvedAt?: string;
  approvedBy?: string;
  approvedByName?: string | null;
  createdBy?: string | null;
  createdByName?: string | null;
  lastActivityAt?: string | null;
  adminModeUntil?: string | null;
  adminModeActive?: boolean;
  activeSessionCount?: number;
  permissionKeys?: string[];
  assignedPermissionKeys?: string[];
}

export interface AdminPermissionCatalogItem {
  key: string;
  label: string;
  group: string;
  groupLabel: string;
  description: string;
  critical?: boolean;
  legacy?: boolean;
}

export interface AdminListResponse {
  items: AdminListItem[];
  total: number;
  page: number;
  limit: number;
}

export interface InviteAdminPayload {
  email: string;
  name?: string;
  department?: string;
  position?: string;
  reason?: string;
}

export interface AuditLogItem {
  id: string;
  actorId?: string;
  actorName?: string | null;
  actorRole?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  reason?: string;
  previousValue?: Record<string, unknown> | null;
  newValue?: Record<string, unknown> | null;
  ip?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AuditLogResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
}

export interface ModerationListingItem {
  id: string;
  title: string;
  category?: string;
  subcategory?: string;
  status?: string;
  ownerName?: string;
  module?: string;
  createdAt?: string;
}

export interface CommunityReportItem {
  id: string;
  reason?: string;
  content?: string;
  authorName?: string;
  targetId?: string;
  createdAt?: string;
}

export interface ModerationCenterItem {
  module: string;
  queueType: string;
  queueLabel: string;
  entityType: string;
  id: string;
  title: string;
  status: string;
  riskLevel: "low" | "medium" | "high";
  reportCount: number;
  ownerName?: string | null;
  createdAt: string;
  updatedAt?: string;
  reason?: string;
  preview?: {
    summary?: string;
    imageUrl?: string | null;
  };
  detailRows?: Array<{ label: string; value: string }>;
  linkedEntity?: {
    type: string;
    id?: string;
    label: string;
    subtitle?: string | null;
  };
  history: AdminEntityHistoryItem[];
  internalNotes: string[];
  flags: {
    urgent: boolean;
    unresolved: boolean;
    escalated: boolean;
    repeatedOffender: boolean;
  };
  actions: string[];
}

export interface ModerationCenterResponse {
  items: ModerationCenterItem[];
  summary: AdminDashboardQueueItem[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminEntityActor {
  id?: string;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface AdminEntityHistoryItem {
  id: string;
  action: string;
  status?: string | null;
  reason?: string | null;
  note?: string | null;
  actor?: AdminEntityActor | null;
  createdAt: string;
}

export interface AdminEntityReportItem {
  id: string;
  reason?: string | null;
  status?: string | null;
  reporterName?: string | null;
  createdAt: string;
}

export interface AdminRelatedEntitySummary {
  id: string;
  title: string;
  status?: string | null;
  kind?: string | null;
  category?: string | null;
  createdAt?: string | null;
}

export interface OrderPaymentSummary {
  totalTransactions: number;
  successful: number;
  failed: number;
  refunded: number;
  flagged: number;
  escalated: number;
  payouts: number;
  refunds: number;
  totalAmount: number;
}

export interface OperationalUserItem {
  id: string;
  name: string;
  email: string;
  username: string;
  status: string;
  warningCount: number;
  reportCount: number;
  restrictionReason?: string | null;
  internalNotes?: string | null;
  joinedAt: string;
  region?: string | null;
  verificationStatus: boolean;
  linkedActivity: {
    orders: number;
    payments: number;
    posts: number;
  };
  activitySummary?: {
    orders: number;
    payments: number;
    posts: number;
    followers: number;
    following: number;
    totalSignals: number;
  };
  followers: number;
  following: number;
  lastActiveAt?: string | null;
  lastAdminActionAt?: string | null;
  warnings?: AdminEntityHistoryItem[];
  reports?: AdminEntityReportItem[];
  history?: AdminEntityHistoryItem[];
  flags?: string[];
}

export interface OperationalAgentItem {
  id: string;
  userId?: string;
  name: string;
  email?: string | null;
  kind: string;
  adminStatus: string;
  verifiedByAdmin: boolean;
  faceIdVerified: boolean;
  badge?: string | null;
  rating: number;
  ratingCount: number;
  complaints: number;
  responseRate: number;
  productsCount: number;
  servicesCount: number;
  orderCount: number;
  internalNotes?: string | null;
  lastModeratedAt?: string | null;
  createdAt: string;
  verificationQueuePosition?: number | null;
  verificationSummary?: {
    verifiedByAdmin: boolean;
    faceIdVerified: boolean;
    requiresReview: boolean;
  };
  linkedListings?: AdminRelatedEntitySummary[];
  linkedProducts?: AdminRelatedEntitySummary[];
  linkedServices?: AdminRelatedEntitySummary[];
  statusHistory?: AdminEntityHistoryItem[];
  actionHistory?: AdminEntityHistoryItem[];
  complaintsSummary?: {
    open: number;
    resolved: number;
    escalated: number;
  };
  pendingChecklist?: string[];
  internalFlags?: string[];
}

export interface OperationalOrderItem {
  id: string;
  kind: string;
  status: string;
  user: { id: string; name: string; email?: string | null } | null;
  agent: { id: string; name: string; email?: string | null } | null;
  total: number;
  currency: string;
  itemCount: number;
  itemsPreview?: Array<{
    productId?: string | null;
    title: string;
    qty: number;
    unitPrice: number;
    image?: string | null;
  }>;
  source: string;
  bookingAt?: string | null;
  disputeReason?: string | null;
  refundReason?: string | null;
  note?: string | null;
  listing?: AdminRelatedEntitySummary | null;
  paymentState?: string | null;
  refundState?: string | null;
  disputeState?: string | null;
  shipping?: {
    name: string;
    phone: string;
    address1: string;
    address2?: string | null;
    postalCode?: string | null;
  } | null;
  paymentMethod?: {
    method: string;
    provider?: string | null;
    transactionId?: string | null;
    paidAt?: string | null;
  } | null;
  paymentSummary?: OrderPaymentSummary | null;
  payments: Array<{ id: string; status: string; financeStatus?: string | null; kind?: string | null; amount: number; provider: string }>;
  createdAt: string;
  updatedAt?: string | null;
  timeline?: AdminEntityHistoryItem[];
}

export interface OperationalPaymentItem {
  id: string;
  status: string;
  financeStatus: string;
  riskLevel: string;
  kind: string;
  provider: string;
  amount: number;
  currency: string;
  note?: string | null;
  transactionId?: string | null;
  user: { id: string; name: string; email?: string | null } | null;
  order: { id: string; status?: string | null; total?: number | null; kind?: string | null; source?: string | null } | null;
  createdAt: string;
  paymentMethod?: string | null;
  failureCode?: string | null;
  suspiciousSignals?: string[];
  issueFlags?: string[];
  payout?: { id: string; status?: string | null; amount?: number | null } | null;
  refund?: { id: string; status?: string | null; amount?: number | null } | null;
  history?: AdminEntityHistoryItem[];
}

export interface AdminContentItem {
  id: string;
  key: string;
  title: string;
  kind: string;
  status: string;
  audience?: string | null;
  priority: number;
  payload: Record<string, unknown>;
  slot?: string | null;
  placement?: string | null;
  updatedByName?: string | null;
  updatedBy?: { id: string; name?: string | null } | null;
  payloadKeys?: string[];
  startsAt?: string | null;
  endsAt?: string | null;
  updatedAt: string;
  createdAt: string;
}

export interface TaxonomyNodeItem {
  id: string;
  module: string;
  kind: string;
  key: string;
  label: string;
  slug?: string | null;
  parentId?: string | null;
  parentLabel?: string | null;
  status: string;
  sortOrder: number;
  metadata: Record<string, unknown>;
  updatedAt: string;
  childCount?: number;
  usageCount?: number;
  path?: string[];
  metadataKeys?: string[];
  updatedBy?: { id: string; name?: string | null } | null;
}

export interface AnalyticsOverview {
  summary: {
    newUsers30d: number;
    newUsersDelta: number;
    newAgents30d: number;
    newAgentsDelta: number;
    orders30d: number;
    grossVolume30d: number;
    paymentVolume30d: number;
    completionRate: number;
    paymentSuccessRate: number;
  };
  growth: {
    users: Array<{ _id: string; count: number }>;
    agents: Array<{ _id: string; count: number }>;
  };
  orders: Array<{ _id: string; count: number; volume: number }>;
  complaints: {
    users: number;
    agents: number;
    posts: number;
    groups: number;
  };
  complaintRate: {
    users: { affected: number; total: number; rate: number };
    agents: { affected: number; total: number; rate: number };
    posts: { affected: number; total: number; rate: number };
    groups: { affected: number; total: number; rate: number };
  };
  categoryDemand: {
    products: Array<{ _id: string; count: number }>;
    services: Array<{ _id: string; count: number }>;
  };
  agentPerformance: Array<{
    id: string;
    name: string;
    rating: number;
    responseRate: number;
    complaints: number;
  }>;
  listingPerformance: {
    products: Array<{
      id: string;
      title: string;
      category?: string | null;
      status?: string | null;
      orders?: number;
      views?: number;
      likes?: number;
      createdAt?: string | null;
    }>;
    services: Array<{
      id: string;
      title: string;
      category?: string | null;
      status?: string | null;
      orders?: number;
      views?: number;
      likes?: number;
      createdAt?: string | null;
    }>;
  };
  conversionTrends: {
    orders30d: {
      total: number;
      completed: number;
      disputed: number;
      cancelled: number;
    };
    payments30d: {
      total: number;
      successful: number;
      failed: number;
      refunded: number;
      flagged: number;
    };
    rates: {
      orderCompletionRate: number;
      disputeRate: number;
      paymentSuccessRate: number;
      paymentFailureRate: number;
    };
  };
  moderationLoad: {
    pendingServices: number;
    pendingAgentVerifications: number;
    reportedPosts: number;
    flaggedGroups: number;
    openFinanceIssues: number;
    disputedOrders: number;
  };
}

export interface AdminSystemSettings {
  security?: {
    requireMfaForAdmins?: boolean;
    revokeSessionsOnAccessChange?: boolean;
    adminModeTtlMinutes?: number;
    helperAdminApprovalRequired?: boolean;
    sessionIdleTimeoutMinutes?: number;
  };
  moderation?: {
    flagThreshold?: number;
    complaintEscalationRate?: number;
    autoSuspendThreshold?: number;
    queueSlaMinutes?: number;
    autoEscalateRepeatedOffender?: boolean;
    maxWarningsBeforeSuspend?: number;
    agentComplaintSuspendThreshold?: number;
  };
  notifications?: {
    queueDigestEnabled?: boolean;
    financeAlertsEnabled?: boolean;
    securityAlertsEnabled?: boolean;
    adminDigestEmail?: string;
    urgentAlertsEmail?: boolean;
    paymentFailureAlerts?: boolean;
    suspensionAlertsEnabled?: boolean;
  };
  features?: {
    featuredContentAutopilot?: boolean;
    manualAgentReviewRequired?: boolean;
    payoutsEnabled?: boolean;
    contentSchedulingEnabled?: boolean;
    communityEnabled?: boolean;
    escrowEnabled?: boolean;
    bookingsEnabled?: boolean;
    dynamicPricingEnabled?: boolean;
  };
  platform?: {
    supportEmail?: string;
    defaultCurrency?: string;
    homepageLayout?: string;
    locale?: string;
    defaultLocale?: string;
    supportInboxEmail?: string;
    allowNewRegistrations?: boolean;
    maintenanceMode?: boolean;
  };
  finance?: {
    suspiciousAmountThreshold?: number;
    refundApprovalRequired?: boolean;
    payoutHoldHours?: number;
  };
  content?: {
    homepageAutoRotate?: boolean;
    defaultFeaturedDurationDays?: number;
    announcementsRequireApproval?: boolean;
  };
  [section: string]: Record<string, unknown> | string | undefined;
}
