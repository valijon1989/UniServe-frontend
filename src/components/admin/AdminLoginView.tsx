"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminLogin } from "@/api/auth";
import { AdminAccessCard } from "@/components/admin/AdminAccessCard";
import { AdminAccessShell } from "@/components/admin/AdminAccessShell";
import {
  PRIMARY_ADMIN_PASSWORD,
  PRIMARY_ADMIN_USERNAME
} from "@/constants/primaryAdmin";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

type AdminLoginFormValues = {
  identifier: string;
  password: string;
  adminKey: string;
  rememberMe: boolean;
};

export function AdminLoginView() {
  const router = useRouter();
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);
  const adminFieldClass =
    "w-full rounded-2xl border border-slate-700/80 bg-slate-950/75 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-0 transition focus:border-cyan-400/55 focus:bg-slate-950";
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminLoginFormValues>({
    defaultValues: {
      identifier: PRIMARY_ADMIN_USERNAME,
      password: PRIMARY_ADMIN_PASSWORD,
      adminKey: "",
      rememberMe: true
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await adminLogin({
        identifier: values.identifier,
        password: values.password,
        adminKey: values.adminKey || undefined
      });
      setSession(
        res.token,
        {
          name: res.user.name,
          avatarUrl: (res.user as { avatarUrl?: string }).avatarUrl,
          username: (res.user as { username?: string }).username
        },
        "ADMIN",
        (res.user as { _id?: string; id?: string })._id || (res.user as { _id?: string; id?: string }).id,
        { rememberMe: values.rememberMe }
      );
      toast.success(
        t({
          en: "Admin login successful",
          uz: "Admin kirish muvaffaqiyatli",
          ru: "Вход администратора выполнен",
          ko: "관리자 로그인 성공"
        })
      );
      router.replace("/admin");
    } catch (error: unknown) {
      const rawMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "";
      const status = (error as { response?: { status?: number } })?.response?.status;
      const normalized = String(rawMessage || "").toLowerCase();
      const message =
        status === 403 || normalized.includes("pending") || normalized.includes("approval")
          ? t({
              en: "Access is pending moderator approval.",
              uz: "Kirish moderator tasdig'ini kutmoqda.",
              ru: "Доступ ожидает одобрения модератора.",
              ko: "접근 권한은 모더레이터 승인 대기 중입니다."
            })
          : rawMessage || t("form.error");
      toast.error(message);
    }
  });

  return (
    <AdminAccessShell
      badge="Restricted access"
      title="Secure administrator entry point"
      description="This environment is separate from public user and agent sign-in. Only approved administrators should continue."
      securityItems={[
        {
          title: "Approved admins only",
          description: "Primary admins and explicitly approved department admins can continue past this gate."
        },
        {
          title: "Admin mode aware",
          description: "Write actions may still require re-authentication, MFA verification, or a fresh admin mode session."
        },
        {
          title: "Controlled access keys",
          description: "Invite codes, access codes, and recovery steps belong to internal governance flow, not public onboarding."
        }
      ]}
    >
      <AdminAccessCard
        badge="Verified admins only"
        title={t({ en: "Admin login", uz: "Admin kirish", ru: "Вход администратора", ko: "관리자 로그인" })}
        subtitle={t({
          en: "Use your work email or admin ID together with the secure credentials assigned to your admin role.",
          uz: "Ishchi email yoki admin ID va admin rolingizga biriktirilgan secure credential bilan kiring.",
          ru: "Используйте рабочий email или admin ID вместе с secure credential, назначенными вашей admin роли.",
          ko: "업무 이메일 또는 관리자 ID와 관리자 역할에 할당된 보안 자격 증명을 사용하세요."
        })}
        footer={
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-xs leading-6 text-slate-400">
            <p>
              {t({ en: "User or agent account?", uz: "User yoki agent akkauntmi?", ru: "Аккаунт user или agent?", ko: "사용자 또는 에이전트 계정인가요?" })}{" "}
              <Link href="/login" className="font-medium text-cyan-300 hover:text-cyan-200">
                {t({ en: "Use public login", uz: "Public login", ru: "Публичный вход", ko: "공개 로그인" })}
              </Link>
            </p>
            <p className="mt-2">
              {t({ en: "Need admin access setup?", uz: "Admin access setup kerakmi?", ru: "Нужен admin access setup?", ko: "관리자 접근 설정이 필요한가요?" })}{" "}
              <Link href="/admin/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
                {t({ en: "Open request flow", uz: "So'rov flow'ini ochish", ru: "Открыть flow запроса", ko: "요청 플로우 열기" })}
              </Link>
            </p>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-5 text-sm">
          <div className="rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-xs leading-6 text-slate-400">
            {t({
              en: "All entry attempts may be logged. If your approval is still pending, this screen will not activate your workspace.",
              uz: "Barcha kirish urinishlari log qilinishi mumkin. Agar tasdiq pending bo'lsa, bu ekran workspace'ni ochmaydi.",
              ru: "Все попытки входа могут логироваться. Если approval еще pending, этот экран не откроет workspace.",
              ko: "모든 로그인 시도는 기록될 수 있습니다. 승인이 대기 중이면 이 화면은 워크스페이스를 열지 않습니다."
            })}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {t({ en: "Work email or admin ID", uz: "Ishchi email yoki Admin ID", ru: "Рабочий email или Admin ID", ko: "업무 이메일 또는 관리자 ID" })}
            </label>
            <input
              type="text"
              autoComplete="username"
              placeholder={PRIMARY_ADMIN_USERNAME}
              className={adminFieldClass}
              {...register("identifier", {
                required: t({ en: "Identifier is required", uz: "ID yoki email majburiy", ru: "ID или email обязателен", ko: "ID 또는 이메일은 필수입니다." }),
                minLength: { value: 3, message: t({ en: "Minimum 3 characters", uz: "Kamida 3 ta belgi", ru: "Минимум 3 символа", ko: "최소 3자" }) }
              })}
            />
            {errors.identifier?.message && <p className="mt-1 text-xs text-rose-300">{errors.identifier.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {t("auth.login.password")}
            </label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder={t({ en: "At least 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" })}
              className={adminFieldClass}
              {...register("password", {
                required: t({ en: "Password is required", uz: "Parol majburiy", ru: "Пароль обязателен", ko: "비밀번호는 필수입니다." }),
                minLength: { value: 8, message: t({ en: "Minimum 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" }) }
              })}
            />
            {errors.password?.message && <p className="mt-1 text-xs text-rose-300">{errors.password.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {t({ en: "Access key or invite code", uz: "Access key yoki invite code", ru: "Access key или invite code", ko: "액세스 키 또는 초대 코드" })}
            </label>
            <input
              type="text"
              placeholder={t({ en: "Invite code, access code, or bootstrap key", uz: "Invite code, access code yoki bootstrap key", ru: "Invite code, access code или bootstrap key", ko: "초대 코드, 액세스 코드 또는 bootstrap key" })}
              className={adminFieldClass}
              {...register("adminKey")}
            />
          </div>

          <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
            <span>{t({ en: "Remember this device", uz: "Qurilmani eslab qolish", ru: "Запомнить это устройство", ko: "이 기기 기억하기" })}</span>
            <input type="checkbox" className="h-4 w-4 accent-cyan-400" {...register("rememberMe")} />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_38px_rgba(34,211,238,0.26)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600"
          >
            {isSubmitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />}
            {isSubmitting
              ? t("auth.login.loading")
              : t({ en: "Verify and continue", uz: "Tasdiqlab davom etish", ru: "Проверить и продолжить", ko: "확인 후 계속" })}
          </button>
        </form>
      </AdminAccessCard>
    </AdminAccessShell>
  );
}
