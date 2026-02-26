"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";
import { getMe } from "@/api/auth";
import { Avatar } from "@/components/ui/Avatar";

const LOCAL_PROFILE_OVERRIDES_KEY = "profile-local-overrides-v1";

export function Header() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useI18n();
  const { role, profile, userId, isAuthenticated, hydrateFromStorage, logout, updateProfile } = useAuthStore();
  const [resolvedAvatarUrl, setResolvedAvatarUrl] = useState("");
  const hasFetchedMeRef = useRef(false);
  const isNewsPage = pathname?.startsWith("/news");
  const isProductsPage = pathname?.startsWith("/products");
  const headerBg = isProductsPage
    ? "linear-gradient(90deg, rgba(12,12,12,0.78), rgba(0,0,0,0.55)), url('/images/products/bosh.png'), url('/header-bg.png')"
    : isNewsPage
      ? "linear-gradient(120deg, rgba(2,6,23,0.8), rgba(14,116,144,0.45)), url('/images/news-header.jpg')"
      : "url('/header-bg.png')";

  const baseNav = useMemo(
    () => [
      { href: "/", label: t("nav.home") },
      { href: "/news", label: t("nav.news") },
      { href: "/products", label: t("nav.products") },
      { href: "/agents?view=services", label: t("nav.services") },
      { href: "/agents", label: t("nav.agents") },
      { href: "/community", label: t("nav.community") }
    ],
    [t]
  );

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isAuthenticated) {
      hasFetchedMeRef.current = false;
      return;
    }
    if (hasFetchedMeRef.current) return;
    hasFetchedMeRef.current = true;

    let active = true;
    getMe()
      .then((me) => {
        if (!active || !me) return;
        updateProfile({
          name: me.name,
          username: (me as { username?: string }).username,
          avatarUrl: (me as { avatarUrl?: string }).avatarUrl
        });
      })
      .catch((error: unknown) => {
        const status = error instanceof AxiosError ? error.response?.status : undefined;
        if (status === 401 || status === 403) {
          logout();
        }
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, logout, updateProfile]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleAccountClick = () => {
    const shouldLogout = window.confirm(
      t({
        en: "Do you want to log out?",
        uz: "Haqiqatan ham tizimdan chiqmoqchimisiz?",
        ru: "Вы действительно хотите выйти?",
        ko: "정말 로그아웃하시겠습니까?"
      })
    );
    if (!shouldLogout) return;
    handleLogout();
  };

  const extraNav = useMemo(() => {
    if (!isAuthenticated || !role) {
      return [];
    }
    if (role === "ADMIN") {
      return [
        { href: "/admin", label: t("nav.admin.dashboard") },
        { href: "/admin/users", label: t("nav.admin.users") },
        { href: "/admin/agents", label: t("nav.admin.agents") },
        { href: "/admin/moderation", label: t("nav.admin.moderation") }
      ];
    }
    if (role === "AGENT") {
      return [
        { href: "/agent/listings", label: t("nav.agent.listings") },
        { href: "/agent/listings/new", label: t("nav.agent.new") },
        { href: "/profile", label: t("nav.profile") }
      ];
    }
    return [
      { href: "/agents", label: t("nav.explore") },
      { href: "/profile", label: t("nav.profile") }
    ];
  }, [isAuthenticated, role, t]);

  const navItems = useMemo(() => {
    const combined = isAuthenticated ? [...baseNav, ...extraNav] : baseNav;
    const seen = new Set<string>();
    return combined.filter((item) => {
      if (seen.has(item.href)) return false;
      seen.add(item.href);
      return true;
    });
  }, [baseNav, extraNav, isAuthenticated]);

  const isActive = (href: string) => {
    const [base, query] = href.split("?");
    const pathMatch = pathname === base || pathname.startsWith(`${base}/`);
    if (!pathMatch) return false;
    if (!query) {
      if (base === "/agents" && searchParams?.get("view") === "services") {
        return false;
      }
      return true;
    }
    const requiredParams = new URLSearchParams(query);
    for (const [key, value] of requiredParams.entries()) {
      if (searchParams?.get(key) !== value) {
        return false;
      }
    }
    return true;
  };

  const displayNickname =
    profile?.username?.trim() ||
    profile?.name?.trim() ||
    t({ en: "User", uz: "Foydalanuvchi", ru: "Пользователь", ko: "사용자" });

  useEffect(() => {
    if (!isAuthenticated) {
      setResolvedAvatarUrl("");
      return;
    }

    const fromSession = profile?.avatarUrl?.trim();
    if (fromSession) {
      setResolvedAvatarUrl(fromSession);
      return;
    }

    if (typeof window === "undefined") {
      setResolvedAvatarUrl("");
      return;
    }

    let localAvatar = "";
    let legacyUserId = "";
    let legacyUsername = "";

    try {
      const rawLegacyUser = window.localStorage.getItem("uniserve_user");
      if (rawLegacyUser) {
        const parsedLegacyUser = JSON.parse(rawLegacyUser) as { _id?: string; id?: string; username?: string };
        legacyUserId = String(parsedLegacyUser?._id || parsedLegacyUser?.id || "").trim();
        legacyUsername = String(parsedLegacyUser?.username || "").trim();
      }
    } catch {
      // ignore local parsing errors
    }

    try {
      const rawOverrides = window.localStorage.getItem(LOCAL_PROFILE_OVERRIDES_KEY);
      if (rawOverrides) {
        const parsed = JSON.parse(rawOverrides) as Record<string, unknown>;
        const candidateKeys = [userId, profile?.username, legacyUserId, legacyUsername, "me"].filter(Boolean) as string[];
        for (const key of candidateKeys) {
          const scoped = parsed?.[key] as { avatarUrl?: string } | undefined;
          const value = scoped?.avatarUrl?.trim();
          if (value) {
            localAvatar = value;
            break;
          }
        }
      }
    } catch {
      // ignore local parsing errors
    }

    if (!localAvatar) {
      try {
        const rawProfile = window.localStorage.getItem("uniserve_user_profile");
        if (rawProfile) {
          const parsedProfile = JSON.parse(rawProfile) as { avatarUrl?: string };
          const value = parsedProfile?.avatarUrl?.trim();
          if (value) {
            localAvatar = value;
          }
        }
      } catch {
        // ignore local parsing errors
      }
    }

    setResolvedAvatarUrl(localAvatar);
  }, [isAuthenticated, pathname, profile?.avatarUrl, profile?.username, userId]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
        style={{
          backgroundImage: headerBg,
          backgroundSize: isProductsPage ? "cover, cover, cover" : isNewsPage ? "cover" : "cover",
          backgroundRepeat: isProductsPage ? "no-repeat, no-repeat, no-repeat" : isNewsPage ? "no-repeat" : undefined,
          backgroundPosition: "center"
        }}
        aria-hidden="true"
      />
      <div className="relative mx-auto flex max-w-6xl items-center justify-between px-4 py-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9">
            <Image
              src="/logo.svg"
              alt={t({ en: "UniServe logo", uz: "UniServe logotipi", ru: "Логотип UniServe", ko: "UniServe 로고" })}
              fill
              sizes="36px"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-100">
              {t({ en: "UniServe", uz: "UniServe", ru: "UniServe", ko: "UniServe" })}
            </p>
            <p className="text-[11px] text-slate-400">
              {t("header.subtitle")}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-slate-800 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1 transition ${
                isActive(item.href)
                  ? "bg-sky-100 text-sky-700"
                  : "hover:bg-slate-200"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <>
              <button
                onClick={handleAccountClick}
                className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80"
              >
                <Avatar
                  src={resolvedAvatarUrl}
                  alt={profile?.name || t({ en: "User", uz: "Foydalanuvchi", ru: "Пользователь", ko: "사용자" })}
                  fallbackText={displayNickname}
                  size={24}
                  className="ring-1 ring-slate-700/70"
                />
                <span className="inline">
                  {displayNickname}
                </span>
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1 text-xs text-slate-700 hover:bg-slate-200"
              >
                {t("auth.loginLink")}
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-sky-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400"
              >
                {t("auth.signupLink")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
