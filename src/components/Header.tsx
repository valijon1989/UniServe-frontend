"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useI18n();
  const { role, profile, isAuthenticated, hydrateFromStorage, logout } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = useMemo(() => {
    if (!isAuthenticated || !role) {
      return [
        { href: "/", label: "Home" },
        { href: "/login", label: "Login" },
        { href: "/signup", label: "Signup" }
      ];
    }
    if (role === "ADMIN") {
      return [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/users", label: "Manage Users" },
        { href: "/admin/agents", label: "Manage Agents" },
        { href: "/admin/moderation", label: "Feed Moderation" }
      ];
    }
    if (role === "AGENT") {
      return [
        { href: "/", label: "Home" },
        { href: "/agent/listings", label: "My Listings" },
        { href: "/agent/listings/new", label: "Add Listing" },
        { href: "/profile", label: "Profile" }
      ];
    }
    return [
      { href: "/", label: "Home" },
      { href: "/agents", label: "Explore" },
      { href: "/profile", label: "Profile" }
    ];
  }, [isAuthenticated, role]);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-black/40 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-9 w-9">
            <Image
              src="/logo.svg"
              alt="UniServe logo"
              fill
              sizes="36px"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight text-slate-100">
              UniServe
            </p>
            <p className="text-[11px] text-slate-400">
              {t("header.subtitle")}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-4 text-sm text-slate-300 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-1 transition ${
                pathname === item.href
                  ? "bg-sky-500/10 text-sky-300"
                  : "hover:bg-slate-800/70"
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
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-700/80"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-[11px] font-semibold text-sky-300">
                  {profile?.name?.[0]?.toUpperCase() || "U"}
                </span>
                <span className="hidden sm:inline">
                  {profile?.name || "User"} · {role}
                </span>
              </button>
              <button
                onClick={handleLogout}
                className="rounded-full bg-slate-900/80 px-3 py-1 text-xs text-slate-300 ring-1 ring-slate-700/80 hover:bg-red-500/10 hover:text-red-300 hover:ring-red-500/60"
              >
                {t("auth.logout")}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-1 text-xs text-slate-300 hover:bg-slate-800/70"
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
