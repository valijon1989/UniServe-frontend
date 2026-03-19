"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAdminAccess } from "@/hooks/useAdminAccess";
import { useLogout } from "@/hooks/useLogout";
import { useI18n } from "@/context/i18n";
import { Avatar } from "@/components/ui/Avatar";
import { AdminAuthEnter } from "./AdminAuthEnter";
import { AdminMfaSetupCard } from "./AdminMfaSetupCard";
import { AdminSidebar } from "./AdminSidebar";

interface Props {
  children: React.ReactNode;
}

const fmt = (value: number) => {
  if (!value) return "00:00";
  const mins = Math.floor(value / 60_000);
  const secs = Math.floor((value % 60_000) / 1000);
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

export function AdminShell({ children }: Props) {
  const router = useRouter();
  const { t } = useI18n();
  const admin = useAdminAccess();
  const { logout, isPending: isLoggingOut, warning: logoutWarning } = useLogout();
  const [authLoading, setAuthLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (admin.loading) return;
    if (admin.access) return;
    if (admin.isUnauthorized || !admin.error) {
      router.replace("/admin/login");
    }
  }, [admin.access, admin.error, admin.isUnauthorized, admin.loading, router]);

  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  if (admin.loading) {
    return <div className="mx-auto max-w-3xl px-4 py-8 text-sm text-slate-300">Loading admin access...</div>;
  }

  if (!admin.access) {
    if (admin.isUnauthorized || !admin.error) {
      return null;
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5">
          <h1 className="text-lg font-semibold text-slate-100">
            {t({
              en: "Unable to verify admin access.",
              uz: "Admin kirishini tekshirib bo'lmadi.",
              ru: "Не удалось проверить доступ администратора.",
              ko: "관리자 접근을 확인할 수 없습니다."
            })}
          </h1>
          <p className="mt-2 text-sm text-slate-400">{admin.error}</p>
          <button
            type="button"
            onClick={() => void admin.refresh({ force: true })}
            className="mt-4 inline-flex rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-100 hover:bg-slate-900"
          >
            {t({ en: "Retry", uz: "Qayta urinish", ru: "Повторить", ko: "다시 시도" })}
          </button>
        </div>
      </div>
    );
  }

  const ageMs = Date.now() - admin.adminModeAt;
  const remainingMs = Math.max(0, 15 * 60_000 - ageMs);

  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[260px,minmax(0,1fr)]">
      <div className="space-y-3">
        <AdminSidebar
          can={admin.can}
          canAny={admin.canAny}
          hasScope={admin.hasScope}
          isPrimary={admin.isPrimary}
          items={admin.workspace?.sidebar}
        />
      </div>

      <section className="space-y-3">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-950/80 px-4 py-3">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Admin Mode</p>
            <p className="text-sm text-slate-200">
              {admin.access.name} · {admin.roleBadge || admin.access.level}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {admin.mfaEnabled && (
              <span className="rounded-full bg-slate-900 px-2 py-1 text-xs text-slate-300">
                {t({ en: "Session", uz: "Sessiya", ru: "Сессия", ko: "세션" })}: {fmt(remainingMs)}
              </span>
            )}

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((value) => !value)}
                disabled={isLoggingOut}
                className="flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-left text-slate-100 transition hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <div className="hidden text-right sm:block">
                  <p className="text-xs font-medium text-slate-100">{admin.access.name}</p>
                  <p className="text-[11px] text-slate-400">{admin.roleBadge || admin.access.level}</p>
                </div>
                <Avatar
                  src={null}
                  alt={admin.access.name}
                  fallbackText={admin.access.name}
                  size={32}
                  className="ring-1 ring-slate-700/80"
                />
                <span className="text-xs text-slate-400">{menuOpen ? "^" : "v"}</span>
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-2xl border border-slate-800 bg-slate-950/95 p-2 shadow-2xl shadow-black/30">
                  <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-3">
                    <p className="text-sm font-medium text-slate-100">{admin.access.name}</p>
                    <p className="mt-1 text-xs text-slate-400">{admin.access.email}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
                      {admin.roleBadge || admin.access.level}
                    </p>
                  </div>

                  {admin.mfaEnabled && (
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        admin.clearMode();
                        router.replace("/admin");
                      }}
                      className="mt-2 flex w-full rounded-xl px-3 py-2 text-left text-sm text-slate-200 transition hover:bg-slate-900"
                    >
                      {t({
                        en: "Re-enter admin mode",
                        uz: "Admin mode qayta kirish",
                        ru: "Повторно войти в admin mode",
                        ko: "관리자 모드 재인증"
                      })}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      void logout({
                        audience: "ADMIN",
                        redirectTo: "/admin/login",
                        reason: "manual",
                        adminSessionId: admin.adminSession?.sessionId,
                        adminStatus: admin.status
                      });
                    }}
                    disabled={isLoggingOut}
                    className="mt-1 flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm text-rose-100 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    <span>{t({ en: "Logout", uz: "Chiqish", ru: "Выйти", ko: "로그아웃" })}</span>
                    {isLoggingOut && (
                      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-100/30 border-t-rose-100" />
                    )}
                  </button>

                  {logoutWarning && (
                    <p className="px-3 pt-2 text-[11px] text-amber-300">
                      {logoutWarning}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {admin.needsMfaSetup && (
          <AdminMfaSetupCard
            loading={authLoading}
            onSetup={async (method) => {
              setAuthLoading(true);
              try {
                return await admin.beginMfaSetup(method);
              } finally {
                setAuthLoading(false);
              }
            }}
            onVerify={async (payload) => {
              setAuthLoading(true);
              try {
                return await admin.confirmMfaSetup(payload);
              } finally {
                setAuthLoading(false);
              }
            }}
          />
        )}

        {!admin.needsMfaSetup && admin.needsAdminMode && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-sky-100/70">Re-auth Required</p>
            <p className="mt-2 text-sm text-sky-50">
              {t({
                en: "Read-only access is available. Re-enter admin mode for approvals, suspensions, and other sensitive actions.",
                uz: "Ko'rish rejimi ochiq. Approve, suspend va boshqa muhim actionlar uchun admin mode’ga qayta kiring.",
                ru: "Просмотр доступен. Для approve, suspend и других чувствительных действий заново войдите в admin mode.",
                ko: "읽기 전용 접근은 가능합니다. 승인, 정지 등 민감한 작업을 위해 관리자 모드에 다시 인증하세요."
              })}
            </p>
            <div className="mt-4">
              <AdminAuthEnter
                loading={authLoading}
                onSubmit={async (payload) => {
                  setAuthLoading(true);
                  try {
                    await admin.enterMode(payload);
                    toast.success(
                      t({
                        en: "Admin mode enabled",
                        uz: "Admin mode yoqildi",
                        ru: "Режим администратора активирован",
                        ko: "관리자 모드가 활성화되었습니다"
                      })
                    );
                  } finally {
                    setAuthLoading(false);
                  }
                }}
                onPasskey={async () => {
                  setAuthLoading(true);
                  try {
                    await admin.enterModeWithPasskey();
                    toast.success(
                      t({
                        en: "Admin mode enabled",
                        uz: "Admin mode yoqildi",
                        ru: "Режим администратора активирован",
                        ko: "관리자 모드가 활성화되었습니다"
                      })
                    );
                  } finally {
                    setAuthLoading(false);
                  }
                }}
              />
            </div>
          </div>
        )}

        {children}
      </section>
    </div>
  );
}
