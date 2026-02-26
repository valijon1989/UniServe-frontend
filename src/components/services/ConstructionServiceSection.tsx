"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { serviceCatalog } from "@/data/serviceCatalog";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";
import { Avatar } from "@/components/ui/Avatar";

type TranslatedText = { en: string; uz: string; ru: string; ko: string };

type ConstructionSection = {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  subCategories: Array<{ id: string; title: TranslatedText; description: TranslatedText }>;
};

type ConstructionCard = {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  rating: number;
  createdAt: string;
  image: { src: string; alt: string };
  subCategory: string;
  certificates: string[];
  agent: {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    specialty: string;
    location: string;
    experienceYears: number;
    rating: number;
    verified: boolean;
  };
};

const sections: ConstructionSection[] = [
  {
    id: "construction-exterior",
    title: {
      en: "Exterior construction",
      uz: "Tashqi qurilish ishlari",
      ru: "Наружные строительные работы",
      ko: "외부 건설 작업"
    },
    description: {
      en: "Facade, roofing, and exterior construction work.",
      uz: "Fasad, tom yopish va tashqi konstruksiya ishlari.",
      ru: "Фасад, кровля и наружные конструкции.",
      ko: "파사드, 지붕, 외부 구조 작업."
    },
    subCategories: [
      {
        id: "exterior-facade",
        title: { en: "Facade works", uz: "Fasad ishlari", ru: "Фасадные работы", ko: "파사드 작업" },
        description: {
          en: "Facade painting, plastering, and protection.",
          uz: "Fasad bo'yash, suvoq va himoya.",
          ru: "Покраска, штукатурка и защита фасада.",
          ko: "파사드 도장, 미장 및 보호."
        }
      },
      {
        id: "exterior-concrete",
        title: { en: "Concrete works", uz: "Beton ishlari", ru: "Бетонные работы", ko: "콘크리트 작업" },
        description: {
          en: "Monolithic and foundation pouring.",
          uz: "Monolit va poydevor quyish.",
          ru: "Монолит и заливка фундамента.",
          ko: "모놀리식 및 기초 타설."
        }
      },
      {
        id: "exterior-brick",
        title: { en: "Bricklaying", uz: "G'isht terish", ru: "Кладка кирпича", ko: "벽돌 쌓기" },
        description: {
          en: "Walls and columns masonry.",
          uz: "Devor va ustunlar terish.",
          ru: "Кладка стен и колонн.",
          ko: "벽과 기둥 시공."
        }
      },
      {
        id: "exterior-roofing",
        title: { en: "Roofing", uz: "Tom yopish", ru: "Кровельные работы", ko: "지붕 작업" },
        description: {
          en: "Metal and slate roofing.",
          uz: "Metall va shifer tom ishlari.",
          ru: "Металлическая и шиферная кровля.",
          ko: "금속 및 슬레이트 지붕 작업."
        }
      },
      {
        id: "exterior-roof-repair",
        title: { en: "Roof repair", uz: "Tom ta'mirlash", ru: "Ремонт крыши", ko: "지붕 수리" },
        description: {
          en: "Fixing roof leaks.",
          uz: "Tom oqishlarini bartaraf.",
          ru: "Устранение протечек крыши.",
          ko: "지붕 누수 수리."
        }
      }
    ]
  },
  {
    id: "construction-interior",
    title: {
      en: "Interior construction",
      uz: "Ichki qurilish ishlari",
      ru: "Внутренние строительные работы",
      ko: "내부 건설 작업"
    },
    description: {
      en: "Interior renovation, decoration, and installation.",
      uz: "Ichki ta'mir, bezak va montaj ishlari.",
      ru: "Внутренний ремонт, отделка и монтаж.",
      ko: "내부 리모델링, 마감 및 설치."
    },
    subCategories: [
      {
        id: "interior-paint",
        title: { en: "Painting", uz: "Bo'yoqchilik", ru: "Покраска", ko: "페인팅" },
        description: {
          en: "Interior painting and surface leveling.",
          uz: "Ichki bo'yoq va sirt tekislash.",
          ru: "Внутренняя покраска и выравнивание.",
          ko: "내부 페인팅 및 표면 정리."
        }
      },
      {
        id: "interior-wallpaper",
        title: { en: "Wallpaper", uz: "Gul qog'oz", ru: "Обои", ko: "벽지" },
        description: {
          en: "Wallpaper installation.",
          uz: "Gul qog'oz yopishtirish.",
          ru: "Поклейка обоев.",
          ko: "벽지 부착."
        }
      },
      {
        id: "interior-design",
        title: { en: "Design service", uz: "Dizayner xizmati", ru: "Дизайн", ko: "디자인 서비스" },
        description: {
          en: "3D and design concept.",
          uz: "3D va dizayn konsept.",
          ru: "3D и дизайн-концепт.",
          ko: "3D 및 디자인 컨셉."
        }
      },
      {
        id: "interior-doors-windows",
        title: { en: "Doors/windows frames", uz: "Eshik/deraza romlari", ru: "Рамы дверей/окон", ko: "문/창 프레임" },
        description: {
          en: "Frame installation and adjustment.",
          uz: "Rom o'rnatish va sozlash.",
          ru: "Установка и регулировка рам.",
          ko: "프레임 설치 및 조정."
        }
      },
      {
        id: "interior-ceiling",
        title: { en: "Ceiling repair", uz: "Shift ta'mirlash", ru: "Ремонт потолка", ko: "천장 수리" },
        description: {
          en: "Ceiling installation and lighting.",
          uz: "Shift montaji va yoritish.",
          ru: "Монтаж потолка и освещение.",
          ko: "천장 설치 및 조명."
        }
      }
    ]
  }
];

type Props = {
  selectedSection?: string;
  onSectionChange?: (sectionId: string) => void;
};

const toTime = (value: string) => new Date(value).getTime() || 0;

export function ConstructionServiceSection({ selectedSection, onSectionChange }: Props) {
  const { t } = useI18n();
  const [localSection, setLocalSection] = useState(sections[0].id);
  const [activeSubCategory, setActiveSubCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [minRating, setMinRating] = useState("all");
  const [sortMode, setSortMode] = useState<"rating" | "new">("rating");
  const [selectedCard, setSelectedCard] = useState<ConstructionCard | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [messageDraft, setMessageDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (selectedSection) {
      setLocalSection(selectedSection);
    }
  }, [selectedSection]);

  const activeSectionId = selectedSection || localSection;
  const activeSection = sections.find((section) => section.id === activeSectionId) || sections[0];
  const isExterior = activeSection.id === "construction-exterior";

  useEffect(() => {
    setActiveSubCategory("all");
  }, [activeSectionId]);

  const subCategoryLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    sections.forEach((section) => {
      section.subCategories.forEach((sub) => {
        map.set(sub.id, t(sub.title));
      });
    });
    return map;
  }, [t]);

  const cards = useMemo<ConstructionCard[]>(() => {
    const group = serviceCatalog.find((item) => item.id === "material");
    const category = group?.categories.find((item) => item.id === "construction");
    if (!category) return [];
    return category.agents.flatMap((agent) =>
      agent.services
        .filter((service) => Boolean(service.subCategory))
        .map((service) => ({
          id: service.id,
          title: service.title,
          description: service.description,
          price: service.price,
          currency: service.currency,
          unit: service.unit,
          rating: service.rating,
          createdAt: service.createdAt,
          image: service.images[0],
          subCategory: service.subCategory || "general",
          certificates: service.certificates,
          agent: {
            id: agent.id,
            name: agent.name,
            nickname: agent.nickname,
            avatar: agent.avatar.src,
            specialty: agent.specialty,
            location: agent.location,
            experienceYears: agent.experienceYears,
            rating: agent.rating,
            verified: agent.verified
          }
        }))
    );
  }, []);

  const sectionSubCategoryIds = useMemo(
    () => new Set(activeSection.subCategories.map((item) => item.id)),
    [activeSection.subCategories]
  );

  const sectionCards = useMemo(
    () => cards.filter((card) => sectionSubCategoryIds.has(card.subCategory)),
    [cards, sectionSubCategoryIds]
  );

  const ratingThreshold = minRating === "all" ? 0 : Number(minRating);
  const filteredCards = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return sectionCards.filter((card) => {
      if (activeSubCategory !== "all" && card.subCategory !== activeSubCategory) return false;
      if (ratingThreshold && card.rating < ratingThreshold) return false;
      if (!normalizedQuery) return true;
      return (
        card.title.toLowerCase().includes(normalizedQuery) ||
        card.agent.name.toLowerCase().includes(normalizedQuery) ||
        card.agent.specialty.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeSubCategory, query, ratingThreshold, sectionCards]);

  const sortedCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => {
      if (sortMode === "rating") {
        const ratingDiff = b.rating - a.rating;
        if (ratingDiff !== 0) return ratingDiff;
        return toTime(b.createdAt) - toTime(a.createdAt);
      }
      const timeDiff = toTime(b.createdAt) - toTime(a.createdAt);
      if (timeDiff !== 0) return timeDiff;
      return b.rating - a.rating;
    });
  }, [filteredCards, sortMode]);

  const topRated = useMemo(() => {
    return [...filteredCards].sort((a, b) => b.rating - a.rating).slice(0, 4);
  }, [filteredCards]);

  const topRatedIds = useMemo(() => new Set(topRated.map((card) => card.id)), [topRated]);
  const remainder = sortedCards.filter((card) => !topRatedIds.has(card.id));

  const handleSectionChange = (sectionId: string) => {
    onSectionChange?.(sectionId);
    if (!onSectionChange) {
      setLocalSection(sectionId);
    }
  };

  const chatTemplates: TranslatedText[] = [
    {
      en: "Hi! I'd like to know the service details.",
      uz: "Salom! Xizmat tafsilotlarini bilmoqchiman.",
      ru: "Здравствуйте! Хочу узнать детали услуги.",
      ko: "안녕하세요! 서비스 상세를 알고 싶어요."
    },
    {
      en: "When can you start the work?",
      uz: "Ishni qachon boshlashingiz mumkin?",
      ru: "Когда можете начать работу?",
      ko: "작업을 언제 시작할 수 있나요?"
    },
    {
      en: "Can we confirm the price and timeline?",
      uz: "Narx va muddatni aniqlashtirsak bo'ladimi?",
      ru: "Можно уточнить цену и сроки?",
      ko: "가격과 일정을 확인할 수 있을까요?"
    }
  ];

  const handleOpenCard = (card: ConstructionCard) => {
    setSelectedCard(card);
    setShowChat(false);
    setMessageDraft("");
    setNotice(null);
  };

  const handleCloseCard = () => {
    setSelectedCard(null);
    setShowChat(false);
    setMessageDraft("");
    setNotice(null);
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      setNotice(
        t({
          en: "Please log in to place an order.",
          uz: "Iltimos, buyurtma berish uchun login qiling.",
          ru: "Пожалуйста, войдите, чтобы оформить заказ.",
          ko: "주문하려면 로그인하세요."
        })
      );
      return;
    }
    setNotice(
      t({
        en: "Order received. The agent will contact you.",
        uz: "Buyurtma qabul qilindi. Agent siz bilan bog'lanadi.",
        ru: "Заказ принят. Агент свяжется с вами.",
        ko: "주문이 접수되었습니다. 에이전트가 연락드립니다."
      })
    );
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice(
        t({
          en: "Please log in to use chat.",
          uz: "Chat uchun oldin login qiling.",
          ru: "Пожалуйста, войдите для чата.",
          ko: "채팅을 사용하려면 로그인하세요."
        })
      );
      return;
    }
    setShowChat(true);
  };

  const sidebar = (
    <aside className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          {t({ en: "Category", uz: "Kategoriya", ru: "Категория", ko: "카테고리" })}
        </p>
        <p className="mt-1 text-sm font-semibold text-white">{t(activeSection.title)}</p>
        <p className="mt-2 text-xs text-slate-400">{t(activeSection.description)}</p>
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setActiveSubCategory("all")}
          className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
            activeSubCategory === "all"
              ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
              : "bg-slate-900/70 text-slate-300"
          }`}
        >
          {t({ en: "All sections", uz: "Barcha bo'limlar", ru: "Все разделы", ko: "모든 섹션" })}
        </button>
        {activeSection.subCategories.map((sub) => {
          const count = sectionCards.filter((card) => card.subCategory === sub.id).length;
          return (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubCategory(sub.id)}
              className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                activeSubCategory === sub.id
                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                  : "bg-slate-900/70 text-slate-300"
              }`}
            >
              {t(sub.title)}
              <span className="ml-2 text-[10px] text-slate-400">
                {count} {t({ en: "items", uz: "ta", ru: "шт.", ko: "개" })}
              </span>
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">
          {t({ en: "Login required", uz: "Login sharti", ru: "Требуется вход", ko: "로그인 필요" })}
        </p>
        <p className="mt-1 text-[11px] text-slate-400">
          {t({
            en: "Orders and chat are available only to logged-in users.",
            uz: "Buyurtma va chat faqat login bo'lgan foydalanuvchilarga ochiladi.",
            ru: "Заказы и чат доступны только авторизованным пользователям.",
            ko: "주문과 채팅은 로그인 사용자에게만 제공됩니다."
          })}
        </p>
      </div>
    </aside>
  );

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => handleSectionChange(section.id)}
              className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold ${
                activeSection.id === section.id
                  ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                  : "bg-slate-900/70 text-slate-300"
              }`}
            >
              <span>{t(section.title)}</span>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
                {t({ en: "Open section", uz: "Bo'limga o'tish", ru: "Открыть раздел", ko: "섹션 열기" })}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveSubCategory("all")}
            className={`rounded-full px-3 py-1 ${
              activeSubCategory === "all"
                ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                : "bg-slate-900/70 text-slate-300"
          }`}
        >
          {t({ en: "All sections", uz: "Barcha bo'limlar", ru: "Все разделы", ko: "모든 섹션" })}
        </button>
          {activeSection.subCategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => setActiveSubCategory(sub.id)}
              className={`rounded-full px-3 py-1 ${
                activeSubCategory === sub.id
                  ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                  : "bg-slate-900/70 text-slate-300"
              }`}
            >
              {t(sub.title)}
            </button>
          ))}
        </div>
      </div>

      <div className={isExterior ? "grid gap-4 lg:grid-cols-[220px_1fr]" : "grid gap-4 lg:grid-cols-[1fr_220px]"}>
        {isExterior && sidebar}
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex min-w-[220px] flex-1 flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {t({ en: "Search", uz: "Qidiruv", ru: "Поиск", ko: "검색" })}
              </label>
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                placeholder={t({
                  en: "Master or service name",
                  uz: "Usta yoki xizmat nomi",
                  ru: "Имя мастера или услуги",
                  ko: "마스터 또는 서비스 이름"
                })}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {t({ en: "Rating", uz: "Reyting", ru: "Рейтинг", ko: "평점" })}
              </label>
              <select
                className="w-44 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              >
                <option value="all">{t({ en: "All", uz: "Barcha", ru: "Все", ko: "전체" })}</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
                <option value="4.9">4.9+</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                {t({ en: "Sort", uz: "Saralash", ru: "Сортировка", ko: "정렬" })}
              </label>
              <select
                className="w-44 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as "rating" | "new")}
              >
                <option value="rating">
                  {t({ en: "Top rating", uz: "Eng yuqori reyting", ru: "Высокий рейтинг", ko: "높은 평점" })}
                </option>
                <option value="new">
                  {t({ en: "Newest listings", uz: "Eng yangi e'lonlar", ru: "Новые объявления", ko: "최신 목록" })}
                </option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {t({ en: "Top rated", uz: "Eng yuqori baholanganlar", ru: "Лучшие по рейтингу", ko: "상위 평점" })}
              </h3>
              <span className="text-xs text-slate-400">
                {t({ en: "4 selected masters", uz: "4 ta tanlangan ustalar", ru: "4 выбранных мастера", ko: "선정된 4명" })}
              </span>
            </div>
            {topRated.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                {t({ en: "No matching masters found.", uz: "Mos ustalar topilmadi.", ru: "Подходящие мастера не найдены.", ko: "적합한 마스터를 찾지 못했습니다." })}
              </p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {topRated.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleOpenCard(card)}
                    className="flex h-[230px] w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 text-left transition hover:border-slate-600"
                  >
                    <div className="group">
                      <img
                        src={card.image.src}
                        alt={card.image.alt}
                        className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3 text-xs text-slate-300">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-white">{card.title}</p>
                        <p className="line-clamp-1 text-[11px] text-slate-400">🧰 {card.agent.specialty}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>💰 {card.price.toLocaleString("en-US")} {card.currency}</span>
                        <span className="text-amber-300">⭐ {card.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Avatar
                          src={card.agent.avatar}
                          alt={card.agent.name}
                          fallbackText={card.agent.name}
                          size={24}
                          className="border border-slate-700/70"
                        />
                        <span className="truncate">👤 {card.agent.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">
                {t({ en: "Other listings", uz: "Boshqa e'lonlar", ru: "Другие объявления", ko: "다른 목록" })}
              </h3>
              <span className="text-xs text-slate-400">
                {t({ en: "Scroll horizontally", uz: "Yon tomonga scroll", ru: "Скролл вправо", ko: "옆으로 스크롤" })}
              </span>
            </div>
            {remainder.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">
                {t({ en: "No additional listings.", uz: "Qo'shimcha e'lonlar topilmadi.", ru: "Дополнительных объявлений нет.", ko: "추가 목록 없음." })}
              </p>
            ) : (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {remainder.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleOpenCard(card)}
                    className="min-w-[240px] h-[230px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 text-left transition hover:border-slate-600"
                  >
                    <div className="group">
                      <img
                        src={card.image.src}
                        alt={card.image.alt}
                        className="h-28 w-full object-cover transition group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex h-[120px] flex-col justify-between space-y-2 p-3 text-xs text-slate-300">
                      <p className="line-clamp-1 text-sm font-semibold text-white">{card.title}</p>
                      <p className="line-clamp-1 text-[11px] text-slate-400">📍 {card.agent.location}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>💰 {card.price.toLocaleString("en-US")} {card.currency}</span>
                        <span className="text-amber-300">⭐ {card.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {!isExterior && sidebar}
      </div>

      {selectedCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
          <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 px-6 py-4">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  {subCategoryLabelMap.get(selectedCard.subCategory) ||
                    t({ en: "Construction service", uz: "Qurilish xizmati", ru: "Строительная услуга", ko: "건설 서비스" })}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{selectedCard.title}</h3>
                <p className="text-sm text-slate-400">{selectedCard.agent.specialty}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCard}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
              >
                {t({ en: "Close", uz: "Yopish", ru: "Закрыть", ko: "닫기" })}
              </button>
            </div>
            <div className="grid gap-6 px-6 py-5 md:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-4">
                <div className="overflow-hidden rounded-2xl border border-slate-800">
                  <img
                    src={selectedCard.image.src}
                    alt={selectedCard.image.alt}
                    className="h-48 w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span>{t({ en: "Price", uz: "Narx", ru: "Цена", ko: "가격" })}</span>
                    <span className="text-emerald-200">
                      {selectedCard.price.toLocaleString("en-US")} {selectedCard.currency} / {selectedCard.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t({ en: "Rating", uz: "Baho", ru: "Оценка", ko: "평점" })}</span>
                    <span className="text-slate-100">{selectedCard.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t({ en: "Region", uz: "Hudud", ru: "Регион", ko: "지역" })}</span>
                    <span className="text-slate-100">{selectedCard.agent.location}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">
                    {t({ en: "Service description", uz: "Xizmat tavsifi", ru: "Описание услуги", ko: "서비스 설명" })}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">{selectedCard.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">
                    {t({ en: "About the master", uz: "Usta haqida", ru: "О мастере", ko: "마스터 정보" })}
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <Avatar
                      src={selectedCard.agent.avatar}
                      alt={selectedCard.agent.name}
                      fallbackText={selectedCard.agent.name}
                      size={48}
                      className="border border-slate-700/70"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{selectedCard.agent.name}</p>
                      <p className="text-xs text-slate-400">@{selectedCard.agent.nickname}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>{t({ en: "Experience", uz: "Tajriba", ru: "Опыт", ko: "경력" })}</span>
                      <span className="text-slate-100">
                        {selectedCard.agent.experienceYears} {t({ en: "years", uz: "yil", ru: "лет", ko: "년" })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t({ en: "Specialty", uz: "Mutaxassislik", ru: "Специализация", ko: "전문분야" })}</span>
                      <span className="text-slate-100">{selectedCard.agent.specialty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t({ en: "Rating", uz: "Reyting", ru: "Рейтинг", ko: "평점" })}</span>
                      <span className="text-slate-100">{selectedCard.agent.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t({ en: "Status", uz: "Holat", ru: "Статус", ko: "상태" })}</span>
                      <span className="text-slate-100">
                        {selectedCard.agent.verified
                          ? t({ en: "Verified master", uz: "Tasdiqlangan usta", ru: "Проверенный мастер", ko: "검증된 마스터" })
                          : t({ en: "Not verified", uz: "Tasdiqlanmagan", ru: "Не проверен", ko: "미검증" })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">
                    {t({ en: "Qualifications and certificates", uz: "Malaka va sertifikatlar", ru: "Квалификация и сертификаты", ko: "자격 및 증명서" })}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    {t({
                      en: "List of the master's qualifications and supporting documents.",
                      uz: "Ustaning malakasi va tasdiqlovchi hujjatlari ro'yxati.",
                      ru: "Список квалификаций и подтверждающих документов мастера.",
                      ko: "마스터의 자격 및 증빙 문서 목록."
                    })}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCard.certificates.length > 0 ? (
                      selectedCard.certificates.map((item) => (
                        <span
                          key={`${selectedCard.id}-${item}`}
                          className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-[11px] text-slate-200"
                        >
                          {item}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500">
                        {t({ en: "No documents provided.", uz: "Hujjatlar kiritilmagan.", ru: "Документы не добавлены.", ko: "문서가 없습니다." })}
                      </span>
                    )}
                  </div>
                </div>

                {notice && (
                  <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                    {notice}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {isAuthenticated ? (
                    <>
                      <button
                        type="button"
                        onClick={handleOrder}
                        className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                      >
                        {t({ en: "Place order", uz: "Buyurtma berish", ru: "Оформить заказ", ko: "주문하기" })}
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                      >
                        {t({ en: "Chat", uz: "Xabarlashish", ru: "Чат", ko: "채팅" })}
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                      {t({ en: "Login to order", uz: "Buyurtma uchun kirish", ru: "Войти для заказа", ko: "주문하려면 로그인" })}
                    </Link>
                  )}
                </div>

                {showChat && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p className="text-sm font-semibold text-slate-100">
                      {t({ en: "Write a message", uz: "Xabar yozish", ru: "Написать сообщение", ko: "메시지 작성" })}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      {t({
                        en: "Send your question or use a template.",
                        uz: "Ustaga kerakli savolni yuboring yoki tayyor matndan foydalaning.",
                        ru: "Отправьте вопрос или используйте готовый шаблон.",
                        ko: "질문을 보내거나 템플릿을 사용하세요."
                      })}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chatTemplates.map((template) => (
                        <button
                          key={template.uz}
                          type="button"
                          onClick={() => setMessageDraft(t(template))}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300"
                        >
                          {t(template)}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      placeholder={t({ en: "Your message...", uz: "Xabaringiz...", ru: "Ваше сообщение...", ko: "메시지..." })}
                      className="mt-3 h-20 w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="mt-3 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200"
                    >
                      {t({ en: "Send message", uz: "Xabar yuborish", ru: "Отправить сообщение", ko: "메시지 보내기" })}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
