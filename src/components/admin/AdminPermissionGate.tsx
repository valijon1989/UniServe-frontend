"use client";

import type { ReactNode } from "react";
import type { AdminPermission } from "@/types/admin";
import { AdminAccessDeniedState } from "@/components/admin/AdminAccessDeniedState";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useI18n } from "@/context/i18n";

interface Props {
  permission?: AdminPermission;
  permissionsAny?: AdminPermission[];
  managerOnly?: boolean;
  primaryOnly?: boolean;
  children: ReactNode;
}

export function AdminPermissionGate({ permission, permissionsAny, managerOnly, primaryOnly, children }: Props) {
  const { t } = useI18n();
  const admin = useAdminAccess();

  if (admin.loading) {
    return <div className="text-sm text-slate-300">Loading...</div>;
  }

  if (primaryOnly && !admin.isPrimary) {
    return <AdminAccessDeniedState description={t({ en: "Primary admin access required.", uz: "Primary admin ruxsati kerak.", ru: "Требуется доступ primary admin.", ko: "Primary 관리자 권한이 필요합니다." })} />;
  }

  if (managerOnly && !admin.isManager) {
    return <AdminAccessDeniedState description={t({ en: "Manager-level admin access required.", uz: "Manager darajadagi ruxsat kerak.", ru: "Требуется уровень manager.", ko: "매니저 레벨 권한이 필요합니다." })} />;
  }

  if (permission && !admin.can(permission)) {
    return <AdminAccessDeniedState description={t({ en: "You do not have this permission.", uz: "Bu amal uchun ruxsat yo'q.", ru: "У вас нет этого разрешения.", ko: "이 권한이 없습니다." })} />;
  }

  if (permissionsAny && permissionsAny.length > 0 && !admin.canAny(permissionsAny)) {
    return <AdminAccessDeniedState description={t({ en: "You do not have access to this admin module.", uz: "Bu admin moduliga kirish ruxsati yo'q.", ru: "У вас нет доступа к этому модулю.", ko: "이 관리자 모듈에 접근할 수 없습니다." })} />;
  }

  return <>{children}</>;
}
