"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { adminLogin, adminSignup } from "@/api/auth";
import { AdminAccessCard } from "@/components/admin/AdminAccessCard";
import { AdminAccessShell } from "@/components/admin/AdminAccessShell";
import { RoleSegmentSwitch } from "@/components/auth/RoleSegmentSwitch";
import { AuthRoute } from "@/components/guards/AuthRoute";
import {
  PRIMARY_ADMIN_EMAIL,
  PRIMARY_ADMIN_NAME,
  PRIMARY_ADMIN_PASSWORD,
  PRIMARY_ADMIN_USERNAME
} from "@/constants/primaryAdmin";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

type AdminSignupFormValues = {
  name: string;
  email: string;
  password: string;
  department: string;
  position: string;
  adminKey: string;
  requireMfa: boolean;
};

const DEPARTMENTS = ["General", "Listings", "Users", "Agents", "Community", "Audit", "Security"];
type RegistrationMode = "PRIMARY" | "STAFF";

const adminFieldClass =
  "w-full rounded-2xl border border-slate-700/80 bg-slate-950/75 px-4 py-3 text-sm text-slate-100 placeholder-slate-500 outline-none ring-0 transition focus:border-cyan-400/55 focus:bg-slate-950";
const adminInfoClass =
  "rounded-2xl border border-white/8 bg-white/[0.04] px-4 py-3 text-xs leading-6 text-slate-400";
const adminErrorClass = "mt-1 text-xs text-rose-300";

export function AdminSignupView() {
  const router = useRouter();
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);
  const [registrationMode, setRegistrationMode] = useState<RegistrationMode>("PRIMARY");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AdminSignupFormValues>({
    defaultValues: {
      name: PRIMARY_ADMIN_NAME,
      email: PRIMARY_ADMIN_EMAIL,
      password: PRIMARY_ADMIN_PASSWORD,
      department: "General",
      position: "",
      adminKey: "",
      requireMfa: true
    }
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const isPrimaryMode = registrationMode === "PRIMARY";
      const effectiveName = isPrimaryMode ? PRIMARY_ADMIN_NAME : values.name;
      const effectiveEmail = isPrimaryMode ? PRIMARY_ADMIN_EMAIL : values.email;
      const effectivePassword = isPrimaryMode ? PRIMARY_ADMIN_PASSWORD : values.password;
      const cleanAdminKey = values.adminKey.trim();

      if (!cleanAdminKey) {
        toast.error(
          isPrimaryMode
            ? t({
                en: "Primary bootstrap key is required.",
                uz: "Primary bootstrap kaliti majburiy.",
                ru: "Нужен primary bootstrap ключ.",
                ko: "Primary bootstrap 키가 필요합니다."
              })
            : t({
                en: "Invite token or staff access code is required.",
                uz: "Taklif tokeni yoki staff access code majburiy.",
                ru: "Нужен invite token или staff access code.",
                ko: "invite token 또는 staff access code가 필요합니다."
              })
        );
        return;
      }

      const res = await adminSignup({
        name: effectiveName,
        email: effectiveEmail,
        password: effectivePassword,
        department: values.department,
        position: values.position,
        adminUsername: isPrimaryMode ? PRIMARY_ADMIN_USERNAME : undefined,
        adminKey: cleanAdminKey || undefined,
        requireMfa: values.requireMfa,
        registrationMode
      });

      const responseStatus = String(res.status || "").toUpperCase();
      const isApproved = responseStatus === "APPROVED";

      if (res.token && res.user && (registrationMode === "PRIMARY" || isApproved)) {
        setSession(
          res.token,
          {
            name: res.user.name,
            avatarUrl: (res.user as { avatarUrl?: string }).avatarUrl,
            username: (res.user as { username?: string }).username
          },
          "ADMIN",
          (res.user as { _id?: string; id?: string })._id || (res.user as { _id?: string; id?: string }).id
        );
        toast.success(
          t({
            en: "Admin access initialized",
            uz: "Admin access yaratildi",
            ru: "Доступ администратора создан",
            ko: "관리자 접근 권한이 생성되었습니다"
          })
        );
        router.replace("/admin");
        return;
      }

      if (isPrimaryMode && isApproved) {
        try {
          const loginRes = await adminLogin({
            identifier: PRIMARY_ADMIN_USERNAME,
            password: PRIMARY_ADMIN_PASSWORD,
            adminKey: cleanAdminKey || undefined
          });
          setSession(
            loginRes.token,
            {
              name: loginRes.user.name,
              avatarUrl: (loginRes.user as { avatarUrl?: string }).avatarUrl,
              username: (loginRes.user as { username?: string }).username
            },
            "ADMIN",
            (loginRes.user as { _id?: string; id?: string })._id ||
              (loginRes.user as { _id?: string; id?: string }).id
          );
          toast.success(
            t({
              en: "Primary admin is ready",
              uz: "Primary admin tayyor",
              ru: "Primary admin готов",
              ko: "기본 관리자가 준비되었습니다"
            })
          );
          router.replace("/admin");
          return;
        } catch {
          // Auto-login can fail if account already exists with different credentials.
        }
      }

      toast.success(
        registrationMode === "PRIMARY"
          ? isApproved
            ? t({
                en: "Primary admin created. Continue from admin login.",
                uz: "Primary admin yaratildi. Admin login orqali davom eting.",
                ru: "Primary admin создан. Продолжайте через admin login.",
                ko: "기본 관리자가 생성되었습니다. 관리자 로그인으로 계속하세요."
              })
            : t({
                en: "Primary bootstrap request submitted.",
                uz: "Primary bootstrap so'rovi yuborildi.",
                ru: "Запрос на primary bootstrap отправлен.",
                ko: "기본 bootstrap 요청이 제출되었습니다."
              })
          : t({
              en: "Admin access request submitted. Login opens after approval.",
              uz: "Admin access so'rovi yuborildi. Login tasdiqdan keyin ochiladi.",
              ru: "Запрос на admin access отправлен. Вход откроется после одобрения.",
              ko: "관리자 접근 요청이 제출되었습니다. 승인 후 로그인할 수 있습니다."
            })
      );
      router.replace("/admin/login");
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const rawMessage =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        (error as { message?: string })?.message ||
        "";
      const normalized = String(rawMessage).toLowerCase();

      if (status === 409 && normalized.includes("primary admin already exists")) {
        toast.error(
          t({
            en: "Primary admin already exists. Use admin login or switch to invited setup.",
            uz: "Primary admin allaqachon bor. Admin login qiling yoki invited setup'ga o‘ting.",
            ru: "Primary admin уже существует. Войдите через admin login или перейдите в invited setup.",
            ko: "기본 관리자가 이미 존재합니다. 관리자 로그인 또는 초대 설정으로 이동하세요."
          })
        );
        router.replace("/admin/login");
        return;
      }

      if (status === 403 && normalized.includes("invalid bootstrap key")) {
        toast.error(
          t({
            en: "Bootstrap key did not match.",
            uz: "Bootstrap key mos kelmadi.",
            ru: "Bootstrap key не совпал.",
            ko: "Bootstrap key가 일치하지 않습니다."
          })
        );
        return;
      }

      toast.error(rawMessage || t("form.error"));
    }
  });

  const isPrimaryMode = registrationMode === "PRIMARY";

  return (
    <AuthRoute>
      <AdminAccessShell
        badge={isPrimaryMode ? "Primary bootstrap" : "Restricted request"}
        title={
          isPrimaryMode
            ? "Initialize your primary admin layer"
            : "Request or activate privileged admin access"
        }
        description={
          isPrimaryMode
            ? "Primary setup creates the first controlled administrator for UniServe. Continue only with the approved bootstrap key."
            : "Invited admins and departmental operators use a separate secure path. Access stays inactive until approval is complete."
        }
        securityItems={[
          {
            title: "Approval-led entry",
            description: "Admin sign-up is not a public registration flow. Every request is tied to bootstrap or invite approval."
          },
          {
            title: "MFA-first posture",
            description: "Sensitive write actions remain blocked until admin mode and MFA requirements are satisfied."
          },
          {
            title: "Audit-backed onboarding",
            description: "Bootstrap, invite activation, and permission changes can be inspected later from audit logs."
          }
        ]}
      >
        <AdminAccessCard
          badge={isPrimaryMode ? "Primary admin setup" : "Invited admin setup"}
          title={
            isPrimaryMode
              ? t({ en: "Primary admin bootstrap", uz: "Primary admin bootstrap", ru: "Primary admin bootstrap", ko: "기본 관리자 bootstrap" })
              : t({ en: "Admin access request", uz: "Admin access so'rovi", ru: "Запрос admin access", ko: "관리자 접근 요청" })
          }
          subtitle={
            isPrimaryMode
              ? t({
                  en: "This path is reserved for the first trusted administrator.",
                  uz: "Bu yo'l birinchi ishonchli administrator uchun.",
                  ru: "Этот путь zarезервирован для первого доверенного администратора.",
                  ko: "이 경로는 첫 번째 신뢰 관리자 전용입니다."
                })
              : t({
                  en: "Use your invite token or staff code to continue the setup.",
                  uz: "Davom etish uchun invite token yoki staff code dan foydalaning.",
                  ru: "Используйте invite token или staff code, чтобы продолжить.",
                  ko: "계속하려면 invite token 또는 staff code를 사용하세요."
                })
          }
          footer={
            <div className={adminInfoClass}>
              <p>
                {t({ en: "Already approved?", uz: "Allaqachon tasdiqlanganmisiz?", ru: "Уже одобрены?", ko: "이미 승인되었나요?" })}{" "}
                <Link href="/admin/login" className="font-medium text-cyan-300 hover:text-cyan-200">
                  {t({ en: "Use admin login", uz: "Admin login", ru: "Admin login", ko: "관리자 로그인" })}
                </Link>
              </p>
              <p className="mt-2">
                {t({ en: "Need regular access?", uz: "Oddiy access kerakmi?", ru: "Нужен обычный доступ?", ko: "일반 접근이 필요한가요?" })}{" "}
                <Link href="/signup" className="font-medium text-cyan-300 hover:text-cyan-200">
                  {t({ en: "Open public signup", uz: "Public signup", ru: "Публичная регистрация", ko: "공개 회원가입" })}
                </Link>
              </p>
            </div>
          }
        >
          <form onSubmit={onSubmit} className="space-y-5 text-sm">
            <RoleSegmentSwitch
              value={registrationMode}
              onChange={(value) => setRegistrationMode(value as RegistrationMode)}
              options={[
                {
                  value: "PRIMARY",
                  label: t({ en: "Primary bootstrap", uz: "Primary bootstrap", ru: "Primary bootstrap", ko: "기본 bootstrap" }),
                  description: t({
                    en: "Create the first platform-wide administrator.",
                    uz: "Platforma bo'ylab birinchi administratorni yarating.",
                    ru: "Создайте первого администратора платформы.",
                    ko: "플랫폼 전역 첫 관리자를 생성합니다."
                  }),
                  accent: "sky"
                },
                {
                  value: "STAFF",
                  label: t({ en: "Invited admin", uz: "Taklif qilingan admin", ru: "Приглашенный админ", ko: "초대 관리자" }),
                  description: t({
                    en: "Activate a departmental or helper admin path.",
                    uz: "Department yoki helper admin yo'lini faollashtiring.",
                    ru: "Активируйте путь departmental/helper admin.",
                    ko: "부서 또는 헬퍼 관리자 경로를 활성화합니다."
                  }),
                  accent: "amber"
                }
              ]}
            />

            <div className={adminInfoClass}>
              {isPrimaryMode
                ? t({
                    en: "Bootstrap mode pre-fills the primary identity and expects a valid bootstrap key.",
                    uz: "Bootstrap rejim primary identity ni tayyorlaydi va haqiqiy bootstrap key kutadi.",
                    ru: "Режим bootstrap использует primary identity и ожидает валидный bootstrap key.",
                    ko: "Bootstrap 모드는 기본 식별자를 사용하며 유효한 bootstrap key를 요구합니다."
                  })
                : t({
                    en: "Invited admin setup stays inactive until a higher-level admin approves the request.",
                    uz: "Taklif qilingan admin setup yuqori admin tasdig'isiz faol bo'lmaydi.",
                    ru: "Настройка приглашенного админа не активируется без одобрения старшего админа.",
                    ko: "초대 관리자 설정은 상위 관리자 승인 전까지 활성화되지 않습니다."
                  })}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {t({ en: "Full name", uz: "To'liq ism", ru: "Полное имя", ko: "이름" })}
                </label>
                <input
                  type="text"
                  placeholder={t({ en: "Your full name", uz: "Ism familiya", ru: "Ваше имя", ko: "이름" })}
                  readOnly={isPrimaryMode}
                  className={`${adminFieldClass} ${isPrimaryMode ? "cursor-not-allowed opacity-80" : ""}`}
                  {...register("name", {
                    required: t({ en: "Name is required", uz: "Ism majburiy", ru: "Имя обязательно", ko: "이름은 필수입니다." }),
                    minLength: { value: 2, message: t({ en: "Minimum 2 characters", uz: "Kamida 2 ta belgi", ru: "Минимум 2 символа", ko: "최소 2자" }) }
                  })}
                />
                {errors.name?.message && <p className={adminErrorClass}>{errors.name.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {t({ en: "Work email", uz: "Ishchi email", ru: "Рабочий email", ko: "업무 이메일" })}
                </label>
                <input
                  type="email"
                  placeholder="admin@company.com"
                  readOnly={isPrimaryMode}
                  className={`${adminFieldClass} ${isPrimaryMode ? "cursor-not-allowed opacity-80" : ""}`}
                  {...register("email", {
                    required: t({ en: "Email is required", uz: "Email majburiy", ru: "Email обязателен", ko: "이메일은 필수입니다." }),
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: t({ en: "Invalid email format", uz: "Email noto'g'ri", ru: "Некорректный email", ko: "이메일 형식이 올바르지 않습니다." })
                    }
                  })}
                />
                {errors.email?.message && <p className={adminErrorClass}>{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {t("auth.login.password")}
                </label>
                <input
                  type="password"
                  placeholder={t({ en: "At least 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" })}
                  readOnly={isPrimaryMode}
                  className={`${adminFieldClass} ${isPrimaryMode ? "cursor-not-allowed opacity-80" : ""}`}
                  {...register("password", {
                    required: t({ en: "Password is required", uz: "Parol majburiy", ru: "Пароль обязателен", ko: "비밀번호는 필수입니다." }),
                    minLength: { value: 8, message: t({ en: "Minimum 8 characters", uz: "Kamida 8 ta belgi", ru: "Минимум 8 символов", ko: "최소 8자" }) }
                  })}
                />
                {errors.password?.message && <p className={adminErrorClass}>{errors.password.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {isPrimaryMode
                    ? t({ en: "Bootstrap key", uz: "Bootstrap key", ru: "Bootstrap key", ko: "Bootstrap key" })
                    : t({ en: "Invite token / staff code", uz: "Invite token / staff code", ru: "Invite token / staff code", ko: "Invite token / staff code" })}
                </label>
                <input
                  type="text"
                  placeholder={
                    isPrimaryMode
                      ? t({ en: "Primary signup code", uz: "Primary signup code", ru: "Primary signup code", ko: "Primary signup code" })
                      : t({ en: "Invite token or access code", uz: "Invite token yoki access code", ru: "Invite token или access code", ko: "Invite token 또는 access code" })
                  }
                  className={adminFieldClass}
                  {...register("adminKey")}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {t({ en: "Department", uz: "Bo'lim", ru: "Отдел", ko: "부서" })}
                </label>
                <select
                  className={adminFieldClass}
                  {...register("department", {
                    required: t({ en: "Department is required", uz: "Bo'lim majburiy", ru: "Отдел обязателен", ko: "부서는 필수입니다." })
                  })}
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
                {errors.department?.message && <p className={adminErrorClass}>{errors.department.message}</p>}
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  {t({ en: "Position", uz: "Lavozim", ru: "Должность", ko: "직책" })}
                </label>
                <input
                  type="text"
                  placeholder={t({ en: "Moderator / Manager", uz: "Moderator / Manager", ru: "Модератор / Менеджер", ko: "모더레이터 / 매니저" })}
                  className={adminFieldClass}
                  {...register("position", {
                    required: t({ en: "Position is required", uz: "Lavozim majburiy", ru: "Должность обязательна", ko: "직책은 필수입니다." }),
                    minLength: { value: 2, message: t({ en: "Minimum 2 characters", uz: "Kamida 2 ta belgi", ru: "Минимум 2 символа", ko: "최소 2자" }) }
                  })}
                />
                {errors.position?.message && <p className={adminErrorClass}>{errors.position.message}</p>}
              </div>
            </div>

            <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
              <span>{t({ en: "Require MFA for future admin mode", uz: "Kelajakdagi admin mode uchun MFA talab qilinsin", ru: "Требовать MFA для будущего admin mode", ko: "향후 관리자 모드에 MFA 요구" })}</span>
              <input type="checkbox" className="h-4 w-4 accent-cyan-400" {...register("requireMfa")} />
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 py-3 text-sm font-semibold text-slate-950 shadow-[0_18px_38px_rgba(34,211,238,0.26)] transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {isSubmitting && <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />}
              {isSubmitting
                ? t("auth.signup.loading")
                : isPrimaryMode
                  ? t({ en: "Initialize primary admin", uz: "Primary admin yaratish", ru: "Инициализировать primary admin", ko: "기본 관리자 초기화" })
                  : t({ en: "Submit admin access request", uz: "Admin access so'rovi yuborish", ru: "Отправить запрос admin access", ko: "관리자 접근 요청 제출" })}
            </button>
          </form>
        </AdminAccessCard>
      </AdminAccessShell>
    </AuthRoute>
  );
}
