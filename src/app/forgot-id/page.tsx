"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { AuthCard } from "@/components/AuthCard";
import { AuthRoute } from "@/components/guards/AuthRoute";
import { useI18n } from "@/context/i18n";
import { apiFetch } from "@/lib/api";

type ForgotIdValues = {
  email: string;
};

export default function ForgotIdPage() {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotIdValues>({
    defaultValues: { email: "" }
  });

  const onSubmit = handleSubmit(async (values) => {
    setLoading(true);
    try {
      await apiFetch("/auth/forgot-username", {
        method: "POST",
        withAuth: false,
        body: {
          email: values.email.trim()
        }
      });
    } catch {
      // Security requirement: do not leak account existence details.
    } finally {
      setLoading(false);
      setSubmitted(true);
      toast.success(
        t({
          en: "If this account exists, instructions were sent to your email.",
          uz: "Agar hisob mavjud bo'lsa, email manzilga yo'l-yo'riq yuborildi.",
          ru: "Если аккаунт существует, инструкция отправлена на email.",
          ko: "계정이 존재하면 이메일로 안내를 보냈습니다."
        })
      );
    }
  });

  return (
    <AuthRoute>
      <AuthCard
        title={t({ en: "Find your ID", uz: "ID ni tiklash", ru: "Восстановить ID", ko: "ID 찾기" })}
        subtitle={t({ en: "Enter your email to recover username", uz: "Username ni topish uchun emailingizni kiriting", ru: "Введите email для восстановления username", ko: "username 복구를 위해 이메일을 입력하세요" })}
      >
        {submitted ? (
          <div className="space-y-4 text-sm">
            <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 text-emerald-200">
              {t({
                en: "If this account exists, we sent recovery instructions to your email.",
                uz: "Agar hisob mavjud bo'lsa, emailga tiklash bo'yicha ko'rsatma yuborildi.",
                ru: "Если аккаунт существует, инструкция отправлена на email.",
                ko: "계정이 존재하면 이메일로 안내를 보냈습니다."
              })}
            </p>
            <div className="text-right">
              <Link href="/login" className="text-xs text-sky-300 hover:text-sky-200">
                {t({ en: "Back to login", uz: "Login sahifasiga qaytish", ru: "Вернуться ко входу", ko: "로그인으로 돌아가기" })}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 text-sm">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-200">
                {t({ en: "Email", uz: "Email", ru: "Email", ko: "이메일" })}
              </label>
              <input
                {...register("email", {
                  required: t({ en: "Email is required", uz: "Email kiritish majburiy", ru: "Email обязателен", ko: "이메일은 필수입니다." }),
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: t({ en: "Invalid email format", uz: "Email noto'g'ri formatda", ru: "Неверный формат email", ko: "이메일 형식이 올바르지 않습니다." })
                  }
                })}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/85 px-3 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              />
              {errors.email?.message && <p className="mt-1 text-xs text-rose-300">{errors.email.message}</p>}
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

