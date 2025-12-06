"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/api/auth";
import { AuthCard } from "@/components/AuthCard";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@camerashop.com");
  const [password, setPassword] = useState("Admin123!");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ email, password });
      if (res?.token && res?.user) {
        setSession(res.token, {
          name: res.user.name,
          avatarUrl: (res.user as any).avatarUrl,
          username: (res.user as any).username
        }, res.user.role as any, (res.user as any)._id || (res.user as any).id);
      }
      router.push("/");
    } catch (err: any) {
      setError(err?.response?.data?.message || t("auth.login.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={t("auth.login.title")}
      subtitle={t("auth.login.subtitle")}
    >
      <form onSubmit={handleSubmit} className="space-y-3 text-sm">
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("auth.login.email")}
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("auth.login.password")}
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="--------"
            required
          />
        </div>

        {error && <p className="text-xs text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 w-full rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? t("auth.login.loading") : t("auth.login.submit")}
        </button>
      </form>
    </AuthCard>
  );
}
