"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthCard } from "@/components/AuthCard";
import { AuthRoute } from "@/components/guards/AuthRoute";
import { useI18n } from "@/context/i18n";
import { apiFetch } from "@/lib/api";

type ForgotPasswordValues = {
  identifier: string;
};

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordValues>({
    defaultValues: { identifier: "" }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      const clean = values.identifier.trim();
      await apiFetch("/auth/forgot-password", {
        method: "POST",
        withAuth: false,
        body: {
          identifier: clean,
          email: clean,
          username: clean
        }
      });
    } catch {
      // Security requirement: do not leak account existence details.
    } finally {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        t({
          en: "If this account exists, reset instructions were sent.",
          uz: "Agar hisob mavjud bo'lsa, tiklash ko'rsatmasi yuborildi.",
          ru: "Если аккаунт существует, инструкция отправлена.",
          ko: "계정이 존재하면 재설정 안내를 보냈습니다."
        })
      );
    }
  });

  return (
    <AuthRoute>
      <AuthCard
        title={t({ en: "Reset password", uz: "Parolni tiklash", ru: "Сброс пароля", ko: "비밀번호 재설정" })}
        subtitle={t({ en: "Enter username or email", uz: "Username yoki email kiriting", ru: "Введите username или email", ko: "username 또는 이메일을 입력하세요" })}
      >
        {submitted ? (
          <div className="space-y-4 text-sm">
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">
              {t({
                en: "If this account exists, reset instructions were sent.",
                uz: "Agar hisob mavjud bo'lsa, emailga tiklash ko'rsatmasi yuborildi.",
                ru: "Если аккаунт существует, инструкция отправлена.",
                ko: "계정이 존재하면 이메일로 안내를 보냈습니다."
              })}
            </p>
            <div className="text-right">
              <Link href="/login" className="text-xs text-sky-300 hover:text-sky-200">
                {t({ en: "Back to login", uz: "Loginga qaytish", ru: "Вернуться ко входу", ko: "로그인으로 돌아가기" })}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-200">
                {t({ en: "User ID or Email", uz: "User ID yoki Email", ru: "User ID или Email", ko: "User ID 또는 이메일" })}
              </label>
              <input
                {...register("identifier", {
                  required: t({ en: "User ID or Email is required", uz: "User ID yoki Email kiritish majburiy", ru: "User ID или Email обязателен", ko: "User ID 또는 이메일은 필수입니다." }),
                  minLength: {
                    value: 3,
                    message: t({ en: "Minimum 3 characters", uz: "Kamida 3 ta belgi kiriting", ru: "Минимум 3 символа", ko: "최소 3자 입력" })
                  }
                })}
                type="text"
                autoComplete="username"
                placeholder={t({ en: "username or email", uz: "username yoki email", ru: "username или email", ko: "username 또는 email" })}
                className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              />
              {errors.identifier?.message && <p className="mt-1 text-xs text-rose-300">{errors.identifier.message}</p>}
            </div>

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
                {t({ en: "Send", uz: "Yuborish", ru: "Отправить", ko: "전송" })}
              </button>
            </div>
          </form>
        )}
      </AuthCard>
    </AuthRoute>
  );
}

