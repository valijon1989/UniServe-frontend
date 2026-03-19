"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signup } from "@/api/auth";
import { PublicAuthCard } from "@/components/auth/PublicAuthCard";
import { PublicAuthShell } from "@/components/auth/PublicAuthShell";
import { RoleSegmentSwitch } from "@/components/auth/RoleSegmentSwitch";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";
import { serviceCatalog } from "@/data/serviceCatalog";

const publicFieldClass =
  "w-full rounded-2xl border border-stone-200 bg-white/88 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white";

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<"USER" | "AGENT">("USER");
  const [agentStep, setAgentStep] = useState<1 | 2>(1);
  const [agentKind, setAgentKind] = useState<"SERVICE" | "SELLER">("SERVICE");
  const [agentGroup, setAgentGroup] = useState<"material" | "spiritual">("material");
  const [agentCategory, setAgentCategory] = useState<string>("taxi");
  const [agentServices, setAgentServices] = useState<string[]>([]);
  const [officeAddress, setOfficeAddress] = useState("");
  const [qualification, setQualification] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();
  const setSession = useAuthStore((s) => s.setSession);

  const getCategoryLabel = (id: string, fallback: string) => {
    const labels: Record<string, string> = {
      taxi: t("services.category.taxi"),
      delivery: t("services.category.delivery"),
      technical: t("services.category.technical"),
      construction: t("services.category.construction"),
      moving: t("services.category.moving"),
      cleaning: t("services.category.cleaning"),
      nanny: t("services.category.nanny"),
      marketing: t("services.category.marketing"),
      employment: t("services.category.employment"),
      education: t("services.category.education"),
      consulting: t("services.category.consulting"),
      translation: t("services.category.translation"),
      psychology: t("services.category.psychology"),
      legal: t("services.category.legal"),
      sport: t("services.category.sport")
    };
    return labels[id] || fallback;
  };

  const groupOptions = serviceCatalog.map((group) => ({
    id: group.id,
    label: group.id === "material" ? t("services.group.material") : t("services.group.spiritual"),
    categories: group.categories.map((cat) => ({
      id: cat.id,
      label: getCategoryLabel(cat.id, cat.title)
    }))
  }));

  const selectedGroup = groupOptions.find((group) => group.id === agentGroup) || groupOptions[0];
  const categoryOptions = selectedGroup?.categories || [];

  const toggleAgentService = (id: string) => {
    setAgentServices((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const switchRole = (nextRole: "USER" | "AGENT") => {
    setRole(nextRole);
    setError(null);
    if (nextRole === "USER") {
      setAgentStep(1);
    }
  };

  const canAdvanceToAgentDetails =
    name.trim().length >= 2 && email.trim().length >= 5 && password.trim().length >= 8;

  const handleContinueToAgentDetails = () => {
    if (!canAdvanceToAgentDetails) {
      setError(
        t({
          en: "Complete your basic account details before continuing.",
          uz: "Davom etishdan oldin asosiy akkaunt ma'lumotlarini to'ldiring.",
          ru: "Заполните базовые данные аккаунта перед продолжением.",
          ko: "계속하기 전에 기본 계정 정보를 입력하세요."
        })
      );
      return;
    }
    setError(null);
    setAgentStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (role === "AGENT" && agentStep === 1) {
      handleContinueToAgentDetails();
      return;
    }

    setLoading(true);
    setError(null);

    if (role === "AGENT" && agentKind === "SERVICE" && agentServices.length === 0) {
      setError(
        t({
          en: "Select at least one service focus before submitting.",
          uz: "Yuborishdan oldin kamida bitta xizmat yo'nalishini tanlang.",
          ru: "Перед отправкой выберите хотя бы одно сервисное направление.",
          ko: "제출하기 전에 최소 하나의 서비스 분야를 선택하세요."
        })
      );
      setLoading(false);
      return;
    }

    if (typeof window !== "undefined") {
      if (role === "AGENT") {
        window.localStorage.setItem("uniserve_agent_kind", agentKind);
        if (agentKind === "SERVICE") {
          window.localStorage.setItem("uniserve_agent_group", agentGroup);
          window.localStorage.setItem("uniserve_agent_category", agentCategory);
          window.localStorage.setItem("uniserve_agent_services", JSON.stringify(agentServices));
          window.localStorage.setItem("uniserve_agent_office", officeAddress);
          window.localStorage.setItem("uniserve_agent_qualification", qualification);
        } else {
          window.localStorage.removeItem("uniserve_agent_group");
          window.localStorage.removeItem("uniserve_agent_category");
          window.localStorage.removeItem("uniserve_agent_services");
          window.localStorage.removeItem("uniserve_agent_office");
          window.localStorage.removeItem("uniserve_agent_qualification");
        }
      } else {
        window.localStorage.removeItem("uniserve_agent_kind");
        window.localStorage.removeItem("uniserve_agent_group");
        window.localStorage.removeItem("uniserve_agent_category");
        window.localStorage.removeItem("uniserve_agent_services");
        window.localStorage.removeItem("uniserve_agent_office");
        window.localStorage.removeItem("uniserve_agent_qualification");
      }
    }

    try {
      const res = await signup({ name, email, password, role });
      if (res?.token && res?.user) {
        setSession(
          res.token,
          {
            name: res.user.name,
            avatarUrl: (res.user as { avatarUrl?: string }).avatarUrl,
            username: (res.user as { username?: string }).username
          },
          res.user.role as "USER" | "AGENT" | "ADMIN",
          (res.user as { _id?: string; id?: string })._id || (res.user as { _id?: string; id?: string }).id
        );
        router.push(role === "AGENT" ? "/agent/listings" : "/");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          t("auth.signup.error")
      );
    } finally {
      setLoading(false);
    }
  };

  const shellConfig = useMemo(
    () =>
      role === "AGENT"
        ? {
            badge: t({ en: "Agent onboarding", uz: "Agent onboarding", ru: "Онбординг агента", ko: "에이전트 온보딩" }),
            title: t({
              en: "Build your agent identity without turning signup into a wall of fields",
              uz: "Signup'ni uzun forma qilmasdan agent identity yarating",
              ru: "Создайте agent identity без длинной стены полей",
              ko: "긴 폼 없이 에이전트 신원을 설정하세요"
            }),
            description: t({
              en: "Basic account details come first. Professional category, service focus, and internal notes follow in a cleaner second step.",
              uz: "Avval basic account ma'lumotlari. So'ng professional category, service focus va ichki izohlar ikkinchi bosqichda keladi.",
              ru: "Сначала базовые данные аккаунта. Затем во втором чистом шаге идут category, service focus и внутренние заметки.",
              ko: "먼저 기본 계정 정보를 입력하고, 그 다음 두 번째 단계에서 카테고리와 서비스 집중 분야를 설정합니다."
            }),
            stats: [
              { value: "2", label: t({ en: "steps", uz: "bosqich", ru: "шага", ko: "단계" }) },
              { value: "Clean", label: t({ en: "flow", uz: "flow", ru: "flow", ko: "플로우" }) },
              { value: "Role", label: t({ en: "aware", uz: "aware", ru: "aware", ko: "aware" }) }
            ],
            highlights: [
              {
                title: t({ en: "Step 1: Account basics", uz: "1-bosqich: Basic account", ru: "Шаг 1: Базовый аккаунт", ko: "1단계: 기본 계정" }),
                description: t({
                  en: "Name, email, and password stay consistent with public user signup so the auth family still feels unified.",
                  uz: "Ism, email va parol public user signup bilan bir xil qoladi, shuning uchun auth family yagona ko'rinadi.",
                  ru: "Имя, email и пароль остаются согласованными с user signup, чтобы auth family ощущалась единой.",
                  ko: "이름, 이메일, 비밀번호는 공개 사용자 회원가입과 일관되게 유지됩니다."
                })
              },
              {
                title: t({ en: "Step 2: Agent profile", uz: "2-bosqich: Agent profili", ru: "Шаг 2: Профиль агента", ko: "2단계: 에이전트 프로필" }),
                description: t({
                  en: "Choose service or seller mode, then capture category, service focus, office info, and professional notes.",
                  uz: "Avval service yoki seller rejimini tanlang, keyin category, service focus, office va professional izohlarni kiriting.",
                  ru: "Выберите service или seller режим, затем category, service focus, office и профессиональные заметки.",
                  ko: "서비스 또는 판매자 모드를 선택한 뒤 카테고리, 서비스 초점, 사무실 정보, 전문 메모를 입력하세요."
                })
              }
            ]
          }
        : {
            badge: t({ en: "Public signup", uz: "Public signup", ru: "Публичная регистрация", ko: "공개 회원가입" }),
            title: t({
              en: "Join UniServe with a fast, welcoming account flow",
              uz: "Tez va qulay account flow bilan UniServe'ga qo'shiling",
              ru: "Присоединяйтесь к UniServe через быстрый и понятный поток регистрации",
              ko: "빠르고 환영하는 가입 흐름으로 UniServe에 참여하세요"
            }),
            description: t({
              en: "Users and agents share the same design family so the platform feels cohesive from the very first screen.",
              uz: "User va agent bir xil design family'da qoladi, shuning uchun platforma birinchi ekrandanoq yaxlit ko'rinadi.",
              ru: "User и agent остаются в одной дизайн-семье, чтобы платформа ощущалась цельной с первого экрана.",
              ko: "사용자와 에이전트는 같은 디자인 패밀리를 공유해 첫 화면부터 일관된 경험을 제공합니다."
            }),
            stats: [
              { value: "Fast", label: t({ en: "signup", uz: "signup", ru: "signup", ko: "가입" }) },
              { value: "User", label: t({ en: "first", uz: "first", ru: "first", ko: "우선" }) },
              { value: "Safe", label: t({ en: "start", uz: "start", ru: "start", ko: "시작" }) }
            ],
            highlights: [
              {
                title: t({ en: "Short and familiar", uz: "Qisqa va tanish", ru: "Коротко и знакомо", ko: "짧고 익숙한 흐름" }),
                description: t({
                  en: "Create your public account with only the essentials, then move into the marketplace immediately.",
                  uz: "Faqat zarur ma'lumotlar bilan public account yarating va keyin darhol marketplace'ga o'ting.",
                  ru: "Создайте публичный аккаунт только с базовыми данными и сразу переходите в marketplace.",
                  ko: "필수 정보만으로 공개 계정을 만들고 바로 마켓플레이스로 이동하세요."
                })
              },
              {
                title: t({ en: "Agent upgrade stays nearby", uz: "Agent upgrade yaqin", ru: "Переход к agent рядом", ko: "에이전트 전환도 가까이" }),
                description: t({
                  en: "If you later switch to agent mode, the same card family expands without throwing you into a different visual system.",
                  uz: "Keyin agent mode'ga o'tsangiz, shu card family boshqa visual tizimga tashlamasdan kengayadi.",
                  ru: "Если позже перейдете в agent mode, та же card family расширится без смены всей визуальной системы.",
                  ko: "나중에 에이전트 모드로 전환해도 같은 카드 패밀리가 자연스럽게 확장됩니다."
                })
              }
            ]
          },
    [role, t]
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
        eyebrow={role === "AGENT" ? "Agent signup" : "Public signup"}
        title={
          role === "AGENT"
            ? t({ en: "Create your agent account", uz: "Agent akkaunt yarating", ru: "Создайте аккаунт агента", ko: "에이전트 계정 만들기" })
            : t("auth.signup.title")
        }
        subtitle={
          role === "AGENT"
            ? t({
                en: "Use the shared UniServe signup flow, then continue with role-specific agent setup.",
                uz: "Yagona UniServe signup flow'dan foydalaning va keyin role-specific agent setup bilan davom eting.",
                ru: "Используйте общий signup поток UniServe, а затем продолжите через role-specific agent setup.",
                ko: "공유된 UniServe 회원가입 흐름을 사용한 뒤 역할별 에이전트 설정으로 이어가세요."
              })
            : t("auth.signup.subtitle")
        }
        footer={
          <div className="rounded-2xl border border-stone-200 bg-white/72 px-4 py-3 text-sm text-slate-600">
            <p>
              <span className="font-medium text-slate-900">
                {t({ en: "Already have an account?", uz: "Akkauntingiz bormi?", ru: "Уже есть аккаунт?", ko: "이미 계정이 있나요?" })}
              </span>{" "}
              <Link href="/login" className="font-medium text-sky-700 hover:text-sky-600">
                {t({ en: "Sign in", uz: "Kirish", ru: "Войти", ko: "로그인" })}
              </Link>
            </p>
            <p className="mt-2">
              <span className="font-medium text-slate-900">
                {t({ en: "Need admin setup instead?", uz: "Admin setup kerakmi?", ru: "Нужен admin setup?", ko: "관리자 설정이 필요한가요?" })}
              </span>{" "}
              <Link href="/admin/signup" className="font-medium text-sky-700 hover:text-sky-600">
                {t({ en: "Open admin access request", uz: "Admin access so'rovini ochish", ru: "Открыть запрос admin access", ko: "관리자 접근 요청 열기" })}
              </Link>
            </p>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          <RoleSegmentSwitch
            value={role}
            onChange={(value) => switchRole(value as "USER" | "AGENT")}
            options={[
              {
                value: "USER",
                label: t("auth.signup.roleUser"),
                description: t({
                  en: "Quick public account for orders, chats, and saved services.",
                  uz: "Buyurtma, chat va saqlangan xizmatlar uchun tez public account.",
                  ru: "Быстрый публичный аккаунт для заказов, чатов и сохраненных сервисов.",
                  ko: "주문, 채팅, 저장된 서비스를 위한 빠른 공개 계정."
                }),
                accent: "sky"
              },
              {
                value: "AGENT",
                label: t("auth.signup.roleAgent"),
                description: t({
                  en: "Public account first, then structured agent details in the next step.",
                  uz: "Avval public account, keyin keyingi bosqichda tuzilgan agent tafsilotlari.",
                  ru: "Сначала публичный аккаунт, затем структурированные данные агента на следующем шаге.",
                  ko: "먼저 공개 계정, 다음 단계에서 구조화된 에이전트 정보."
                }),
                accent: "emerald"
              }
            ]}
          />

          {role === "AGENT" ? (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className={`rounded-2xl border px-4 py-3 ${agentStep === 1 ? "border-sky-400 bg-sky-50 text-sky-800" : "border-stone-200 bg-white/70 text-slate-500"}`}>
                <div className="text-xs font-semibold uppercase tracking-[0.2em]">Step 1</div>
                <div className="mt-1 text-sm font-medium">Account basics</div>
              </div>
              <div className={`rounded-2xl border px-4 py-3 ${agentStep === 2 ? "border-emerald-400 bg-emerald-50 text-emerald-800" : "border-stone-200 bg-white/70 text-slate-500"}`}>
                <div className="text-xs font-semibold uppercase tracking-[0.2em]">Step 2</div>
                <div className="mt-1 text-sm font-medium">Agent profile</div>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {t("auth.signup.name")}
              </label>
              <input
                className={publicFieldClass}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ismingiz"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {t("auth.signup.email")}
              </label>
              <input
                className={publicFieldClass}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
              {t("auth.signup.password")}
            </label>
            <input
              className={publicFieldClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Kamida 8 ta belgi"
              required
            />
          </div>

          {role === "AGENT" && agentStep === 2 ? (
            <div className="space-y-5 rounded-[26px] border border-stone-200 bg-white/72 p-4">
              <RoleSegmentSwitch
                value={agentKind}
                onChange={(value) => setAgentKind(value as "SERVICE" | "SELLER")}
                options={[
                  {
                    value: "SERVICE",
                    label: t("auth.signup.agentTypeService"),
                    description: t({
                      en: "Service-focused agent with categories and internal professional details.",
                      uz: "Category va professional tafsilotlarga ega service-focused agent.",
                      ru: "Service-focused агент с category и профессиональными деталями.",
                      ko: "카테고리와 전문 정보를 가진 서비스형 에이전트."
                    }),
                    accent: "emerald"
                  },
                  {
                    value: "SELLER",
                    label: t("auth.signup.agentTypeSeller"),
                    description: t({
                      en: "Seller path for product-oriented operators and storefront activity.",
                      uz: "Product-oriented operator va storefront activity uchun seller yo'li.",
                      ru: "Seller путь для product-oriented операторов и storefront activity.",
                      ko: "상품 중심 운영자와 스토어 활동을 위한 판매자 경로."
                    }),
                    accent: "amber"
                  }
                ]}
              />

              {agentKind === "SERVICE" ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        {t("auth.signup.agentGroupLabel")}
                      </label>
                      <select
                        className={publicFieldClass}
                        value={agentGroup}
                        onChange={(e) => {
                          const nextGroup = e.target.value as "material" | "spiritual";
                          setAgentGroup(nextGroup);
                          const nextCategories =
                            serviceCatalog.find((group) => group.id === nextGroup)?.categories || [];
                          setAgentCategory(nextCategories[0]?.id || "");
                          setAgentServices([]);
                        }}
                      >
                        {groupOptions.map((group) => (
                          <option key={group.id} value={group.id}>
                            {group.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                        {t("auth.signup.agentCategoryLabel")}
                      </label>
                      <select
                        className={publicFieldClass}
                        value={agentCategory}
                        onChange={(e) => setAgentCategory(e.target.value)}
                      >
                        {categoryOptions.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Qaysi xizmat turlari
                    </label>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {categoryOptions.map((cat) => (
                        <label
                          key={cat.id}
                          className="flex items-center gap-2 rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-xs text-slate-700"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 accent-emerald-500"
                            checked={agentServices.includes(cat.id)}
                            onChange={() => toggleAgentService(cat.id)}
                          />
                          <span>{cat.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Ofis manzili (agar bo'lsa)
                    </label>
                    <input
                      className={publicFieldClass}
                      value={officeAddress}
                      onChange={(e) => setOfficeAddress(e.target.value)}
                      placeholder="Masalan: Toshkent, Yunusobod, 12-uy"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                      Malaka va tajriba
                    </label>
                    <textarea
                      className="min-h-[110px] w-full rounded-2xl border border-stone-200 bg-white/88 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-sky-400 focus:bg-white"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      placeholder="Malaka, sertifikatlar yoki tajriba haqida"
                    />
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
                  {t({
                    en: "Seller mode keeps the signup lighter. Product/storefront setup can continue after account creation.",
                    uz: "Seller rejim signup'ni yengilroq saqlaydi. Product/storefront setup akkaunt yaratilgandan keyin davom etadi.",
                    ru: "Seller режим оставляет signup более легким. Product/storefront настройку можно продолжить после создания аккаунта.",
                    ko: "판매자 모드는 가입을 더 가볍게 유지합니다. 상품/스토어 설정은 계정 생성 후 이어갈 수 있습니다."
                  })}
                </div>
              )}
            </div>
          ) : null}

          {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">{error}</div> : null}

          <div className="flex flex-wrap gap-3">
            {role === "AGENT" && agentStep === 2 ? (
              <button
                type="button"
                onClick={() => setAgentStep(1)}
                className="inline-flex flex-1 items-center justify-center rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                {t({ en: "Back", uz: "Orqaga", ru: "Назад", ko: "뒤로" })}
              </button>
            ) : null}

            {role === "AGENT" && agentStep === 1 ? (
              <button
                type="button"
                onClick={handleContinueToAgentDetails}
                className="inline-flex flex-1 items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.2)] transition hover:bg-slate-800"
              >
                {t({ en: "Continue to agent details", uz: "Agent tafsilotlariga o'tish", ru: "Продолжить к данным агента", ko: "에이전트 정보로 계속" })}
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_rgba(15,23,42,0.2)] transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {loading ? <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white" /> : null}
                {loading
                  ? t("auth.signup.loading")
                  : role === "AGENT"
                    ? t({ en: "Create agent account", uz: "Agent akkaunt yaratish", ru: "Создать аккаунт агента", ko: "에이전트 계정 만들기" })
                    : t("auth.signup.submit")}
              </button>
            )}
          </div>
        </form>
      </PublicAuthCard>
    </PublicAuthShell>
  );
}
