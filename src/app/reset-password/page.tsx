"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthCard } from "@/components/AuthCard";
import { AuthRoute } from "@/components/guards/AuthRoute";
import { useI18n } from "@/context/i18n";
import { apiFetch } from "@/lib/api";

type ResetPasswordValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => (searchParams?.get("token") || "").trim(), [searchParams]);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<ResetPasswordValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    clearErrors("root");

    const password = values.newPassword;
    const confirm = values.confirmPassword;
    if (password.length < 8) {
      setError("newPassword", {
        type: "validate",
        message: t({ en: "Password must be at least 8 characters", uz: "Parol kamida 8 belgi bo'lishi kerak", ru: "Пароль должен быть не менее 8 символов", ko: "비밀번호는 8자 이상이어야 합니다." })
      });
      return;
    }
    if (password !== confirm) {
      setError("confirmPassword", {
        type: "validate",
        message: t({ en: "Passwords do not match", uz: "Parollar mos emas", ru: "Пароли не совпадают", ko: "비밀번호가 일치하지 않습니다." })
      });
      return;
    }
    if (!token) {
      setError("root", {
        type: "validate",
        message: t({ en: "Reset token is missing", uz: "Reset token topilmadi", ru: "Токен сброса отсутствует", ko: "재설정 토큰이 없습니다." })
      });
      return;
    }

    setLoading(true);
    try {
      await apiFetch("/auth/reset-password", {
        method: "POST",
        withAuth: false,
        body: {
          token,
          newPassword: password
        }
      });

      toast.success(
        t({
          en: "Password updated. Please login again.",
          uz: "Parol yangilandi. Endi qayta login qiling.",
          ru: "Пароль обновлен. Войдите снова.",
          ko: "비밀번호가 변경되었습니다. 다시 로그인하세요."
        })
      );
      router.replace("/login");
    } catch (error: any) {
      setError("root", {
        type: "server",
        message:
          error?.message ||
          t({
            en: "Token is invalid or expired",
            uz: "Token yaroqsiz yoki muddati tugagan",
            ru: "Токен недействителен или истек",
            ko: "토큰이 유효하지 않거나 만료되었습니다."
          })
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <AuthRoute>
      <AuthCard
        title={t({ en: "Set new password", uz: "Yangi parol o'rnatish", ru: "Новый пароль", ko: "새 비밀번호 설정" })}
        subtitle={t({ en: "Create a strong password", uz: "Kuchli parol kiriting", ru: "Введите надежный пароль", ko: "강력한 비밀번호를 입력하세요" })}
      >
        {!token ? (
          <div className="space-y-4 text-sm">
            <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-rose-200">
              {t({
                en: "Reset link is invalid.",
                uz: "Tiklash havolasi noto'g'ri.",
                ru: "Ссылка сброса недействительна.",
                ko: "재설정 링크가 올바르지 않습니다."
              })}
            </p>
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs text-sky-300 hover:text-sky-200">
                {t({ en: "Request new link", uz: "Yangi link so'rash", ru: "Запросить новую ссылку", ko: "새 링크 요청" })}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-200">
                {t({ en: "New password", uz: "Yangi parol", ru: "Новый пароль", ko: "새 비밀번호" })}
              </label>
              <div className="relative">
                <input
                  {...register("newPassword", {
                    required: t({ en: "New password is required", uz: "Yangi parol majburiy", ru: "Новый пароль обязателен", ko: "새 비밀번호는 필수입니다." })
                  })}
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t({ en: "At least 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                >
                  {showNewPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.newPassword?.message && <p className="mt-1 text-xs text-rose-300">{errors.newPassword.message}</p>}
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-200">
                {t({ en: "Confirm password", uz: "Parolni tasdiqlang", ru: "Подтвердите пароль", ko: "비밀번호 확인" })}
              </label>
              <div className="relative">
                <input
                  {...register("confirmPassword", {
                    required: t({ en: "Confirm password is required", uz: "Tasdiqlash paroli majburiy", ru: "Подтверждение пароля обязательно", ko: "비밀번호 확인은 필수입니다." })
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t({ en: "Repeat new password", uz: "Yangi parolni qayta kiriting", ru: "Повторите новый пароль", ko: "새 비밀번호를 다시 입력" })}
                  className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 hover:text-slate-100"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.confirmPassword?.message && <p className="mt-1 text-xs text-rose-300">{errors.confirmPassword.message}</p>}
            </div>

            {errors.root?.message && <p className="text-xs text-rose-300">{errors.root.message}</p>}

            <div className="flex items-center justify-between">
              <Link href="/login" className="text-xs text-slate-300 hover:text-slate-100">
                {t({ en: "Back to login", uz: "Loginga qaytish", ru: "Назад ко входу", ko: "로그인으로 돌아가기" })}
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
              >
                {loading && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />}
                {t({ en: "Reset password", uz: "Parolni yangilash", ru: "Сбросить пароль", ko: "비밀번호 재설정" })}
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthRoute>
  );
}

