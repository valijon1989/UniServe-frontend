"use client";

import { Avatar } from "@/components/ui/Avatar";

export type ProfileSectionKey =
  | "overview"
  | "security"
  | "listings"
  | "reviews"
  | "wallet"
  | "notifications";

export interface SidebarUserSummary {
  name: string;
  username: string;
  role: string;
  avatarUrl?: string;
  verified?: boolean;
}

interface ProfileSidebarProps {
  user: SidebarUserSummary;
  activeSection: ProfileSectionKey;
  isAgent: boolean;
  onSectionChange: (key: ProfileSectionKey) => void;
  onEditProfile: () => void;
  onLogout: () => void;
}

const roleTone: Record<string, string> = {
  ADMIN: "bg-rose-500/15 text-rose-300 border-rose-500/40",
  AGENT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
  USER: "bg-sky-500/15 text-sky-300 border-sky-500/40"
};

export function ProfileSidebar({
  user,
  activeSection,
  isAgent,
  onSectionChange,
  onEditProfile,
  onLogout
}: ProfileSidebarProps) {
  const items: Array<{ key: ProfileSectionKey; label: string; show: boolean }> = [
    { key: "overview", label: "Profile", show: true },
    { key: "security", label: "Security", show: true },
    { key: "listings", label: "My Listings", show: true },
    { key: "reviews", label: "Reviews / Ratings", show: isAgent },
    { key: "wallet", label: "Wallet / Payments", show: true },
    { key: "notifications", label: "Notifications", show: true }
  ];

  const normalizedRole = String(user.role || "USER").toUpperCase();
  const tone = roleTone[normalizedRole] || "bg-slate-700/30 text-slate-200 border-slate-600";

  return (
    <aside className="md:sticky md:top-24">
      <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
        <div className="flex items-start gap-3">
          <Avatar
            src={user.avatarUrl}
            alt={user.name}
            fallbackText={user.name}
            size={64}
            className="border border-slate-700 bg-slate-900"
          />
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold text-slate-100">{user.name}</h1>
            <p className="truncate text-sm text-slate-400">@{user.username}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-wide ${tone}`}>
                {normalizedRole}
              </span>
              {user.verified && (
                <span className="inline-flex rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="w-full rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-500"
        >
          Edit profile
        </button>

        <nav className="space-y-1">
          {items
            .filter((item) => item.show)
            .map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => onSectionChange(item.key)}
                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                  activeSection === item.key
                    ? "border-sky-500/60 bg-sky-500/10 text-sky-200"
                    : "border-slate-800 bg-slate-900/50 text-slate-300 hover:border-slate-700"
                }`}
              >
                {item.label}
              </button>
            ))}
        </nav>

        <button
          type="button"
          onClick={onLogout}
          className="w-full rounded-xl border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
