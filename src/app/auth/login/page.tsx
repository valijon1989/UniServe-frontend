"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/api/auth";
import { AuthCard } from "@/components/AuthCard";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

type LoginFormValues = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<LoginFormValues>({
    defaultValues: {
      identifier: "",
      password: "",
      rememberMe: true
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    clearErrors("root");
    try {
      const res = await login({ identifier: values.identifier, password: values.password });
      setSession(
        res.token,
        {
          name: res.user.name,
          avatarUrl: (res.user as any).avatarUrl,
          username: (res.user as any).username
        },
        res.user.role as any,
        (res.user as any)._id || (res.user as any).id,
        { rememberMe: values.rememberMe }
      );
      toast.success(
        t({
          en: "Signed in successfully",
          uz: "Muvaffaqiyatli kirdingiz",
          ru: "Вход выполнен",
          ko: "로그인 성공"
        })
      );
      router.replace("/");
    } catch (err: any) {
      const message = err?.response?.data?.message || t({ en: "Email or password is incorrect", uz: "Email yoki parol xato", ru: "Неверный email или пароль", ko: "이메일 또는 비밀번호가 올바르지 않습니다." });
      setError("root", { type: "server", message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthCard
      title={t("auth.login.title")}
      subtitle={t({ en: "Access your UniServe account", uz: "UniServe akkauntingizga kiring", ru: "Войдите в аккаунт UniServe", ko: "UniServe 계정에 로그인하세요" })}
    >
      <form onSubmit={onSubmit} className="space-y-4 text-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-200">
            {t({ en: "User ID or Email", uz: "User ID yoki Email", ru: "User ID или Email", ko: "User ID 또는 이메일" })}
          </label>
          <input
            className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            {...register("identifier", {
              required: t({ en: "User ID or Email is required", uz: "User ID yoki Email kiritish majburiy", ru: "User ID или Email обязателен", ko: "User ID 또는 이메일은 필수입니다." }),
              minLength: {
                value: 3,
                message: t({ en: "Minimum 3 characters", uz: "Kamida 3 ta belgi kiriting", ru: "Минимум 3 символа", ko: "최소 3자 입력" })
              }
            })}
            type="text"
            placeholder={t({ en: "username or email", uz: "username yoki email", ru: "username или email", ko: "username 또는 email" })}
            autoComplete="username"
          />
          {errors.identifier?.message && <p className="mt-1 text-xs text-rose-300">{errors.identifier.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-200">
            {t("auth.login.password")}
          </label>
          <div className="relative">
            <input
              className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              {...register("password", {
                required: t({ en: "Password is required", uz: "Parol kiritish majburiy", ru: "Пароль обязателен", ko: "비밀번호는 필수입니다." }),
                minLength: {
                  value: 8,
                  message: t({ en: "Password must be at least 8 characters", uz: "Parol kamida 8 belgi bo'lishi kerak", ru: "Пароль должен быть не менее 8 символов", ko: "비밀번호는 8자 이상이어야 합니다." })
                }
              })}
              type={showPassword ? "text" : "password"}
              placeholder={t({ en: "At least 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" })}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password?.message && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-slate-300">
            <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 accent-sky-500" />
            <span>{t({ en: "Remember me", uz: "Eslab qolish", ru: "Запомнить меня", ko: "로그인 상태 유지" })}</span>
          </label>
          <Link href="/forgot-password" className="text-xs text-sky-300 hover:text-sky-200">
            {t({ en: "Forgot password?", uz: "Parolni unutdingizmi?", ru: "Забыли пароль?", ko: "비밀번호를 잊으셨나요?" })}
          </Link>
        </div>

        <div className="text-right">
          <Link href="/forgot-id" className="text-xs text-slate-300 hover:text-slate-100">
            {t({ en: "Forgot your ID?", uz: "ID ni unutdingizmi?", ru: "Забыли ID?", ko: "ID를 잊으셨나요?" })}
          </Link>
        </div>

        {errors.root?.message && <p className="text-xs text-rose-300">{errors.root.message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="mt-1 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />}
          {loading ? t("auth.login.loading") : t("auth.login.submit")}
        </button>
      </form>
    </AuthCard>
  );
}
