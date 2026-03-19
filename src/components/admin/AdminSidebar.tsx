"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AdminPermission, AdminWorkspaceNavItem } from "@/types/admin";
import { useI18n } from "@/context/i18n";

interface NavItem {
  href: string;
  label: string;
  permission?: AdminPermission;
  permissionsAny?: AdminPermission[];
  scopeModules?: string[];
  primaryOrPermission?: AdminPermission;
  primaryOnly?: boolean;
}

interface Props {
  can: (permission: AdminPermission) => boolean;
  canAny: (permissions: AdminPermission[]) => boolean;
  hasScope: (module: string, category?: string, subcategory?: string) => boolean;
  isPrimary: boolean;
  items?: AdminWorkspaceNavItem[];
}

const inferScopeModules = (href: string): string[] => {
  if (href.startsWith("/admin/listings")) return ["products", "services"];
  if (href.startsWith("/admin/agents")) return ["agents"];
  if (href.startsWith("/admin/users")) return ["users"];
  if (href.startsWith("/admin/community")) return ["community"];
  if (href.startsWith("/admin/orders")) return ["orders"];
  if (href.startsWith("/admin/payments")) return ["payments"];
  if (href.startsWith("/admin/content")) return ["content"];
  if (href.startsWith("/admin/taxonomy")) return ["taxonomy", "products", "services"];
  if (href.startsWith("/admin/moderation")) {
    return ["moderation", "reports", "products", "services", "community", "users", "agents", "content", "payments"];
  }
  if (href.startsWith("/admin/reports")) return ["reports", "community", "content", "users", "agents", "payments"];
  return [];
};

export function AdminSidebar({ can, canAny, hasScope, isPrimary, items = [] }: Props) {
  const pathname = usePathname();
  const { t } = useI18n();

  const fallbackItems: NavItem[] = [
    { href: "/admin", label: t("nav.admin.dashboard") },
    {
      href: "/admin/admins",
      label: t({ en: "Admin Management", uz: "Admin boshqaruvi", ru: "Управление админами", ko: "관리자 관리" }),
      permissionsAny: ["admins.view", "admins.read", "admins.manage", "admins.create", "admins.approve", "admins.assign_permissions"]
    },
    { href: "/admin/users", label: t("nav.admin.users"), permission: "users.read", scopeModules: ["users"] },
    {
      href: "/admin/agents",
      label: t("nav.admin.agents"),
      permissionsAny: ["agents.read", "agents.verify"],
      scopeModules: ["agents"]
    },
    {
      href: "/admin/listings",
      label: t({ en: "Listings Moderation", uz: "E'lon moderatsiyasi", ru: "Модерация объявлений", ko: "목록 검수" }),
      permission: "listings.read_all",
      scopeModules: ["listings", "products", "services"]
    },
    {
      href: "/admin/community",
      label: t({ en: "Community Moderation", uz: "Community moderatsiya", ru: "Модерация сообщества", ko: "커뮤니티 검수" }),
      permission: "community.moderate",
      scopeModules: ["community"]
    },
    {
      href: "/admin/orders",
      label: t({ en: "Orders", uz: "Buyurtmalar", ru: "Заказы", ko: "주문" }),
      permission: "orders.read",
      scopeModules: ["orders"]
    },
    {
      href: "/admin/payments",
      label: t({ en: "Payments", uz: "To'lovlar", ru: "Платежи", ko: "결제" }),
      permission: "payments.read",
      scopeModules: ["payments"]
    },
    {
      href: "/admin/content",
      label: t({ en: "Content", uz: "Kontent", ru: "Контент", ko: "콘텐츠" }),
      permissionsAny: ["content.view", "content.manage", "content.moderate"],
      scopeModules: ["content"]
    },
    {
      href: "/admin/taxonomy",
      label: t({ en: "Taxonomy", uz: "Taksonomiya", ru: "Таксономия", ko: "분류 체계" }),
      permissionsAny: ["taxonomy.view", "taxonomy.manage"],
      scopeModules: ["taxonomy"]
    },
    {
      href: "/admin/analytics",
      label: t({ en: "Analytics", uz: "Analitika", ru: "Аналитика", ko: "분석" }),
      permission: "analytics.view",
      scopeModules: ["analytics"]
    },
    {
      href: "/admin/audit",
      label: t({ en: "Audit Logs", uz: "Audit loglar", ru: "Аудит логи", ko: "감사 로그" }),
      permission: "logs.read",
      scopeModules: ["logs"]
    },
    {
      href: "/admin/settings",
      label: t({ en: "Settings", uz: "Sozlamalar", ru: "Настройки", ko: "설정" }),
      permissionsAny: ["settings.manage", "settings.update", "technical.manage"],
      scopeModules: ["settings"]
    }
  ];

  const visibleItems = fallbackItems.filter((item) => {
    if (item.primaryOnly && !isPrimary) return false;
    if (item.primaryOrPermission && !isPrimary && !can(item.primaryOrPermission)) return false;
    if (item.permission && !can(item.permission)) return false;
    if (item.permissionsAny && !canAny(item.permissionsAny)) return false;
    if (item.scopeModules && item.scopeModules.length > 0) {
      const hasAnyScope = item.scopeModules.some((module) => hasScope(module));
      if (!hasAnyScope) return false;
    }
    return true;
  });

  const workspaceItems = items
    .filter((item) => item?.href && item?.label)
    .filter((item) => {
      const permissionAny = Array.isArray(item.permissionAny)
        ? item.permissionAny.filter((permission): permission is AdminPermission => typeof permission === "string")
        : [];
      if (permissionAny.length && !canAny(permissionAny)) return false;
      if (isPrimary) return true;
      const scopeModules = inferScopeModules(item.href);
      if (!scopeModules.length) return true;
      return scopeModules.some((moduleName) => hasScope(moduleName));
    });
  const navItems = workspaceItems.length ? workspaceItems : visibleItems;

  return (
    <aside className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
      <p className="mb-3 px-2 text-xs uppercase tracking-[0.24em] text-slate-500">
        {t({ en: "Admin Panel", uz: "Admin panel", ru: "Админ панель", ko: "관리자 패널" })}
      </p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-500/50"
                  : "text-slate-300 hover:bg-slate-900/80 hover:text-slate-100"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
