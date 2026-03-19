"use client";

import { Suspense, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { login } from "@/api/auth";
import { PublicAuthCard } from "@/components/auth/PublicAuthCard";
import { PublicAuthShell } from "@/components/auth/PublicAuthShell";
import { RoleSegmentSwitch } from "@/components/auth/RoleSegmentSwitch";
import { useI18n } from "@/context/i18n";
import { sanitizeInternalRedirect } from "@/lib/authRedirect";
import { useAuthStore } from "@/store/auth";

type LoginFormValues = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

type LoginAudience = "USER" | "AGENT";

const publicFieldClass =
  "w-full rounded-2xl border border-stone-200 bg-white/88 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white";

const normalizeAudience = (value: string | null): LoginAudience => {
  return value?.toUpperCase() === "AGENT" ? "AGENT" : "USER";
};

function LoginPageContent() {
  const router = useRouter();
  const pathname = usePathname() || "/login";
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const submitLockRef = useRef(false);
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);
  const loginAudience = normalizeAudience(searchParams.get("type"));
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
    if (submitLockRef.current) return;
    submitLockRef.current = true;
    setLoading(true);
    clearErrors("root");
    try {
      const res = await login({ identifier: values.identifier, password: values.password });
      setSession(
        res.token,
        {
          name: res.user.name,
          avatarUrl: (res.user as { avatarUrl?: string }).avatarUrl,
          username: (res.user as { username?: string }).username
        },
        res.user.role as "USER" | "AGENT" | "ADMIN",
        (res.user as { _id?: string; id?: string })._id || (res.user as { _id?: string; id?: string }).id,
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
      const role = String(res.user.role || "").toUpperCase();
      const redirectTarget = sanitizeInternalRedirect(
        searchParams.get("redirect"),
        role === "AGENT" ? "/agent/listings" : "/"
      );
      if (role === "ADMIN") {
        router.replace("/admin");
      } else {
        router.replace(redirectTarget);
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        t({
          en: "Email or password is incorrect",
          uz: "Email yoki parol xato",
          ru: "Неверный email или пароль",
          ko: "이메일 또는 비밀번호가 올바르지 않습니다."
        });
      setError("root", { type: "server", message });
      toast.error(message);
    } finally {
      submitLockRef.current = false;
      setLoading(false);
    }
  });

  const switchAudience = (next: LoginAudience) => {
    clearErrors("root");
    const params = new URLSearchParams(searchParams.toString());
    if (next === "AGENT") {
      params.set("type", "agent");
    } else {
      params.delete("type");
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const cardCopy = {
    title:
      loginAudience === "AGENT"
        ? t({ en: "Agent sign in", uz: "Agent kirishi", ru: "Вход агента", ko: "에이전트 로그인" })
        : t({ en: "Sign in to UniServe", uz: "UniServe'ga kiring", ru: "Войдите в UniServe", ko: "UniServe 로그인" }),
    subtitle:
      loginAudience === "AGENT"
        ? t({
            en: "Manage listings, client conversations, and service operations from one secure workspace.",
            uz: "Listinglar, mijoz suhbatlari va xizmat operatsiyalarini bitta xavfsiz joydan boshqaring.",
            ru: "Управляйте listing, диалогами с клиентами и сервисными операциями из одного защищенного пространства.",
            ko: "하나의 안전한 공간에서 리스팅, 고객 대화, 서비스 운영을 관리하세요."
          })
        : t({
            en: "Access orders, chats, saved services, and everything connected to your UniServe account.",
            uz: "Buyurtmalar, chatlar, saqlangan xizmatlar va UniServe akkauntingizga bog'liq barcha narsaga kiring.",
            ru: "Получите доступ к заказам, чатам, сохраненным сервисам и всему, что связано с аккаунтом UniServe.",
            ko: "주문, 채팅, 저장된 서비스 등 UniServe 계정의 모든 기능에 접근하세요."
          })
  };

  const shellConfig = useMemo(
    () =>
      loginAudience === "AGENT"
        ? {
            badge: t({ en: "Agent access", uz: "Agent access", ru: "Доступ агента", ko: "에이전트 접근" }),
            title: t({
              en: "One professional entry point for every agent workflow",
              uz: "Har bir agent workflow'i uchun bitta professional kirish nuqtasi",
              ru: "Единая профессиональная точка входа для рабочего процесса агента",
              ko: "모든 에이전트 워크플로를 위한 하나의 전문 진입점"
            }),
            description: t({
              en: "Use the same UniServe identity system, but with role-specific guidance for agent operations, listings, and support.",
              uz: "Bir xil UniServe identity tizimi, lekin agent operatsiyalari, listinglar va support uchun role-specific yo'riqnoma bilan.",
              ru: "Та же система идентификации UniServe, но с роль-ориентированными подсказками для агентских операций, listing и поддержки.",
              ko: "같은 UniServe 인증 체계이지만 에이전트 운영, 리스팅, 지원에 맞춘 안내를 제공합니다."
            }),
            stats: [
              { value: "24/7", label: t({ en: "support", uz: "support", ru: "support", ko: "support" }) },
              { value: "3", label: t({ en: "core flows", uz: "asosiy flow", ru: "основные потоки", ko: "핵심 플로우" }) },
              { value: "1", label: t({ en: "shared account", uz: "yagona akkaunt", ru: "единый аккаунт", ko: "공유 계정" }) }
            ],
            highlights: [
              {
                title: t({ en: "Listings and response speed", uz: "Listing va javob tezligi", ru: "Listing и скорость ответа", ko: "리스팅과 응답 속도" }),
                description: t({
                  en: "Move directly into listing management, customer communication, and delivery or service coordination.",
                  uz: "Listing boshqaruvi, mijoz bilan aloqa va yetkazib berish yoki xizmat koordinatsiyasiga tez o'ting.",
                  ru: "Сразу переходите к управлению listing, коммуникации с клиентами и координации доставки или услуг.",
                  ko: "리스팅 관리, 고객 커뮤니케이션, 배송 또는 서비스 조정으로 바로 이동하세요."
                })
              },
              {
                title: t({ en: "Agent support path", uz: "Agent support yo'li", ru: "Путь поддержки агента", ko: "에이전트 지원 경로" }),
                description: t({
                  en: "If your credentials are pending or need help, use the support links below instead of the admin portal.",
                  uz: "Agar credential pending bo'lsa yoki yordam kerak bo'lsa, admin portal o'rniga quyidagi support linklaridan foydalaning.",
                  ru: "Если ваши данные еще ожидают подтверждения или нужна помощь, используйте ссылки поддержки ниже вместо admin portal.",
                  ko: "자격 증명이 대기 중이거나 도움이 필요하면 관리자 포털 대신 아래 지원 링크를 사용하세요."
                })
              }
            ]
          }
        : {
            badge: t({ en: "Public access", uz: "Public access", ru: "Публичный доступ", ko: "공개 접근" }),
            title: t({
              en: "Welcome back to your UniServe workspace",
              uz: "UniServe workspace'ingizga xush kelibsiz",
              ru: "С возвращением в ваше пространство UniServe",
              ko: "UniServe 워크스페이스에 다시 오신 것을 환영합니다"
            }),
            description: t({
              en: "User and agent access stay inside the same public experience so the platform still feels like one connected ecosystem.",
              uz: "User va agent access bir xil public experience ichida qoladi, shunda platforma yagona ekotizim bo'lib seziladi.",
              ru: "Доступ user и agent остается в одном публичном опыте, чтобы платформа ощущалась единой экосистемой.",
              ko: "사용자와 에이전트 접근은 같은 공개 경험 안에 유지되어 하나의 연결된 생태계처럼 느껴집니다."
            }),
            stats: [
              { value: "140+", label: t({ en: "services", uz: "xizmat", ru: "сервисы", ko: "서비스" }) },
              { value: "1", label: t({ en: "account", uz: "akkaunt", ru: "аккаунт", ko: "계정" }) },
              { value: "Safe", label: t({ en: "entry", uz: "kirish", ru: "вход", ko: "입장" }) }
            ],
            highlights: [
              {
                title: t({ en: "Orders, chats, and saved work", uz: "Buyurtma, chat va saqlangan ishlar", ru: "Заказы, чаты и сохраненные действия", ko: "주문, 채팅, 저장된 작업" }),
                description: t({
                  en: "Sign in once to continue browsing, ordering, messaging agents, and managing your profile.",
                  uz: "Bir marta kiring va browsing, buyurtma, agentlar bilan yozishish hamda profilingizni boshqarishni davom ettiring.",
                  ru: "Войдите один раз, чтобы продолжить просмотр, заказы, общение с агентами и управление профилем.",
                  ko: "한 번 로그인하여 탐색, 주문, 에이전트와의 대화, 프로필 관리를 계속하세요."
                })
              },
              {
                title: t({ en: "Admin is separate by design", uz: "Admin alohida qatlam", ru: "Admin отделен по дизайну", ko: "관리자는 별도 계층" }),
                description: t({
                  en: "Privileged access uses a different secure entry. Public sign-in stays clean and customer-facing.",
                  uz: "Privilege access boshqa secure entry dan foydalanadi. Public sign-in esa toza va customer-facing bo'lib qoladi.",
                  ru: "Привилегированный доступ использует другой защищенный вход. Публичный вход остается чистым и пользовательским.",
                  ko: "권한 있는 접근은 별도의 보안 진입점을 사용합니다. 공개 로그인은 고객 중심으로 유지됩니다."
                })
              }
            ]
          },
    [loginAudience, t]
  );

  return (
    <PublicAuthShell
      badge={shellConfig.badge}
      title={shellConfig.title}
      description={shellConfig.description}
      stats={shellConfig.stats}
      highlights={shellConfig.highlights}
    >
      <PublicAuthCard
        eyebrow={loginAudience === "AGENT" ? "Agent sign in" : "Public sign in"}
        title={cardCopy.title}
        subtitle={cardCopy.subtitle}
        footer={
          <div className="rounded-2xl border border-stone-200 bg-white/72 px-4 py-3 text-sm text-slate-600">
            <span className="font-medium text-slate-900">
              {t({ en: "Need privileged access?", uz: "Privilege access kerakmi?", ru: "Нужен привилегированный доступ?", ko: "권한 있는 접근이 필요한가요?" })}
            </span>{" "}
            <Link href="/admin/login" className="font-medium text-sky-700 hover:text-sky-600">
              {t({ en: "Open admin access", uz: "Admin access ochish", ru: "Открыть admin access", ko: "관리자 접근 열기" })}
            </Link>
          </div>
        }
      >
        <form onSubmit={onSubmit} className="space-y-5 text-sm">
          <RoleSegmentSwitch
            value={loginAudience}
            onChange={(next) => switchAudience(next as LoginAudience)}
            options={[
              {
                value: "USER",
                label: t({ en: "User", uz: "Foydalanuvchi", ru: "Пользователь", ko: "사용자" }),
                description: t({
                  en: "Orders, saved services, and account activity.",
                  uz: "Buyurtmalar, saqlangan xizmatlar va akkaunt faolligi.",
                  ru: "Заказы, сохраненные сервисы и активность аккаунта.",
                  ko: "주문, 저장된 서비스, 계정 활동."
                }),
                accent: "sky"
              },
              {
                value: "AGENT",
                label: t({ en: "Agent", uz: "Agent", ru: "Агент", ko: "에이전트" }),
                description: t({
                  en: "Listings, client communication, and operations.",
                  uz: "Listinglar, mijoz bilan aloqa va operatsiyalar.",
                  ru: "Listing, общение с клиентами и операции.",
                  ko: "리스팅, 고객 커뮤니케이션, 운영."
                }),
                accent: "emerald"
              }
            ]}
          />

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {loginAudience === "AGENT"
                ? t({ en: "Agent ID or email", uz: "Agent ID yoki email", ru: "Agent ID или email", ko: "에이전트 ID 또는 이메일" })
                : t({ en: "Username or email", uz: "Username yoki email", ru: "Username или email", ko: "사용자명 또는 이메일" })}
            </label>
            <input
              className={publicFieldClass}
              {...register("identifier", {
                required:
                  loginAudience === "AGENT"
                    ? t({ en: "Agent ID or email is required", uz: "Agent ID yoki email majburiy", ru: "Agent ID или email обязателен", ko: "에이전트 ID 또는 이메일은 필수입니다." })
                    : t({ en: "Username or email is required", uz: "Username yoki email majburiy", ru: "Username или email обязателен", ko: "사용자명 또는 이메일은 필수입니다." }),
                minLength: {
                  value: 3,
                  message: t({ en: "Minimum 3 characters", uz: "Kamida 3 ta belgi", ru: "Минимум 3 символа", ko: "최소 3자" })
                }
              })}
              type="text"
              placeholder={
                loginAudience === "AGENT"
                  ? t({ en: "agent username or work email", uz: "agent username yoki ishchi email", ru: "agent username или рабочий email", ko: "에이전트 username 또는 업무 이메일" })
                  : t({ en: "username or email", uz: "username yoki email", ru: "username или email", ko: "username 또는 email" })
              }
              autoComplete="username"
            />
            {errors.identifier?.message ? <p className="mt-1 text-xs text-rose-500">{errors.identifier.message}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {t("auth.login.password")}
            </label>
            <div className="relative">
              <input
                className={`${publicFieldClass} pr-14`}
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
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-xs font-medium text-slate-500 transition hover:bg-stone-100 hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password?.message ? <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p> : null}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" {...register("rememberMe")} className="h-4 w-4 accent-sky-500" />
              <span>{t({ en: "Remember me", uz: "Eslab qolish", ru: "Запомнить меня", ko: "로그인 상태 유지" })}</span>
            </label>

            <div className="flex flex-wrap gap-4 text-xs">
              <Link href="/forgot-password" className="font-medium text-slate-500 hover:text-slate-900">
                {t({ en: "Forgot password?", uz: "Parolni unutdingizmi?", ru: "Забыли пароль?", ko: "비밀번호를 잊으셨나요?" })}
              </Link>
              <Link href="/forgot-id" className="font-medium text-slate-500 hover:text-slate-900">
                {t({ en: "Forgot your ID?", uz: "ID ni unutdingizmi?", ru: "Забыли ID?", ko: "ID를 잊으셨나요?" })}
              </Link>
            </div>
          </div>

          {errors.root?.message ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              {errors.root.message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.2)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : null}
            {loading
              ? t("auth.login.loading")
              : loginAudience === "AGENT"
                ? t({ en: "Continue as agent", uz: "Agent sifatida davom etish", ru: "Продолжить как агент", ko: "에이전트로 계속" })
                : t({ en: "Continue to UniServe", uz: "UniServe'ga davom etish", ru: "Продолжить в UniServe", ko: "UniServe로 계속" })}
          </button>

          <div className="rounded-2xl border border-stone-200 bg-white/72 px-4 py-3 text-xs leading-6 text-slate-600">
            {loginAudience === "AGENT"
              ? t({
                  en: "Need a fresh agent account? Start from signup and continue with the agent-specific setup.",
                  uz: "Yangi agent akkaunti kerakmi? Signup dan boshlang va agent-specific setup bilan davom eting.",
                  ru: "Нужен новый аккаунт агента? Начните с signup и продолжите через agent-specific настройку.",
                  ko: "새 에이전트 계정이 필요하신가요? 회원가입에서 시작해 에이전트 전용 설정으로 이어가세요."
                })
              : t({
                  en: "New to UniServe? Create a public account first, then switch to agent setup if needed.",
                  uz: "UniServe'ga yangi ekansiz, avval public account yarating, kerak bo'lsa keyin agent setup'ga o'ting.",
                  ru: "Если вы новичок в UniServe, сначала создайте публичный аккаунт, а затем при необходимости перейдите к agent setup.",
                  ko: "UniServe가 처음이라면 먼저 공개 계정을 만든 뒤 필요 시 에이전트 설정으로 이동하세요."
                })}{" "}
            <Link href="/signup" className="font-medium text-sky-700 hover:text-sky-600">
              {t({ en: "Open signup", uz: "Signup ochish", ru: "Открыть signup", ko: "회원가입 열기" })}
            </Link>
          </div>
        </form>
      </PublicAuthCard>
    </PublicAuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff7ee_0%,#f8f3ea_42%,#f1eadf_100%)] px-4 text-sm text-slate-500">
          Loading login...
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
