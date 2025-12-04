"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/api/auth";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "AGENT">("USER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await signup({ name, email, password, role });
      if (res?.token && res?.user) {
        setSession(res.token, {
          name: res.user.name,
          avatarUrl: (res.user as any).avatarUrl,
          username: (res.user as any).username
        }, res.user.role as any, (res.user as any)._id || (res.user as any).id);
        router.push("/");
      } else {
        router.push("/auth/login");
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || t("auth.signup.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center bg-[#020617]">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-orange-500/20 pointer-events-none -z-10" />

      <div className="relative z-10 pointer-events-auto w-full max-w-md rounded-3xl border border-cyan-500/40 bg-black/60 p-8 shadow-xl">
        <h1 className="mb-1 text-xl font-semibold text-slate-50">
          {t("auth.signup.title")}
        </h1>
        <p className="mb-5 text-sm text-slate-400">
          {t("auth.signup.subtitle")}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              {t("auth.signup.name")}
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ismingiz"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-300">
              {t("auth.signup.email")}
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
              {t("auth.signup.password")}
            </label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Kamida 8 ta belgi"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-xs text-slate-300">
              {t("auth.signup.roleLabel")}
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`rounded-lg border px-3 py-2 ${
                  role === "USER"
                    ? "border-sky-500 bg-sky-500/10 text-sky-300"
                    : "border-slate-700 bg-slate-900/80 text-slate-300"
                }`}
              >
                {t("auth.signup.roleUser")}
              </button>
              <button
                type="button"
                onClick={() => setRole("AGENT")}
                className={`rounded-lg border px-3 py-2 ${
                  role === "AGENT"
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-300"
                    : "border-slate-700 bg-slate-900/80 text-slate-300"
                }`}
              >
                {t("auth.signup.roleAgent")}
              </button>
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {loading ? t("auth.signup.loading") : t("auth.signup.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
