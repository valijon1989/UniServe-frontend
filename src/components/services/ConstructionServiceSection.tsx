"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { serviceCatalog } from "@/data/serviceCatalog";
import { useAuthStore } from "@/store/auth";

type ConstructionSection = {
  id: string;
  title: string;
  description: string;
  subCategories: Array<{ id: string; title: string; description: string }>;
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
    title: "Tashqi qurilish ishlari",
    description: "Fasad, tom yopish va tashqi konstruksiya ishlari.",
    subCategories: [
      { id: "exterior-facade", title: "Fasad ishlari", description: "Fasad bo'yash, suvoq va himoya." },
      { id: "exterior-concrete", title: "Beton ishlari", description: "Monolit va poydevor quyish." },
      { id: "exterior-brick", title: "G'isht terish", description: "Devor va ustunlar terish." },
      { id: "exterior-roofing", title: "Tom yopish", description: "Metall va shifer tom ishlari." },
      { id: "exterior-roof-repair", title: "Tom ta'mirlash", description: "Tom oqishlarini bartaraf." }
    ]
  },
  {
    id: "construction-interior",
    title: "Ichki qurilish ishlari",
    description: "Ichki ta'mir, bezak va montaj ishlari.",
    subCategories: [
      { id: "interior-paint", title: "Bo'yoqchilik", description: "Ichki bo'yoq va sirt tekislash." },
      { id: "interior-wallpaper", title: "Gul qog'oz", description: "Gul qog'oz yopishtirish." },
      { id: "interior-design", title: "Dizayner xizmati", description: "3D va dizayn konsept." },
      { id: "interior-doors-windows", title: "Eshik/deraza romlari", description: "Rom o'rnatish va sozlash." },
      { id: "interior-ceiling", title: "Shift ta'mirlash", description: "Shift montaji va yoritish." }
    ]
  }
];

type Props = {
  selectedSection?: string;
  onSectionChange?: (sectionId: string) => void;
};

const toTime = (value: string) => new Date(value).getTime() || 0;

export function ConstructionServiceSection({ selectedSection, onSectionChange }: Props) {
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
        map.set(sub.id, sub.title);
      });
    });
    return map;
  }, []);

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

  const chatTemplates = [
    "Salom! Xizmat tafsilotlarini bilmoqchiman.",
    "Ishni qachon boshlashingiz mumkin?",
    "Narx va muddatni aniqlashtirsak bo'ladimi?"
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
      setNotice("Iltimos, buyurtma berish uchun login qiling.");
      return;
    }
    setNotice("Buyurtma qabul qilindi. Agent siz bilan bog'lanadi.");
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice("Chat uchun oldin login qiling.");
      return;
    }
    setShowChat(true);
  };

  const sidebar = (
    <aside className="space-y-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kategoriya</p>
        <p className="mt-1 text-sm font-semibold text-white">{activeSection.title}</p>
        <p className="mt-2 text-xs text-slate-400">{activeSection.description}</p>
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
          Barcha bo'limlar
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
              {sub.title}
              <span className="ml-2 text-[10px] text-slate-400">{count} ta</span>
            </button>
          );
        })}
      </div>
      <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 text-xs text-slate-300">
        <p className="font-semibold text-slate-200">Login sharti</p>
        <p className="mt-1 text-[11px] text-slate-400">
          Buyurtma va chat faqat login bo'lgan foydalanuvchilarga ochiladi.
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
              <span>{section.title}</span>
              <span className="rounded-full border border-slate-700 px-3 py-1 text-[11px] text-slate-300">
                Bo'limga o'tish
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
            Barcha bo'limlar
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
              {sub.title}
            </button>
          ))}
        </div>
      </div>

      <div className={isExterior ? "grid gap-4 lg:grid-cols-[220px_1fr]" : "grid gap-4 lg:grid-cols-[1fr_220px]"}>
        {isExterior && sidebar}
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex min-w-[220px] flex-1 flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Qidiruv</label>
              <input
                className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                placeholder="Usta yoki xizmat nomi"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Reyting</label>
              <select
                className="w-44 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                value={minRating}
                onChange={(event) => setMinRating(event.target.value)}
              >
                <option value="all">Barcha</option>
                <option value="4.5">4.5+</option>
                <option value="4.7">4.7+</option>
                <option value="4.9">4.9+</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Saralash</label>
              <select
                className="w-44 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
                value={sortMode}
                onChange={(event) => setSortMode(event.target.value as "rating" | "new")}
              >
                <option value="rating">Eng yuqori reyting</option>
                <option value="new">Eng yangi e'lonlar</option>
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Eng yuqori baholanganlar</h3>
              <span className="text-xs text-slate-400">4 ta tanlangan ustalar</span>
            </div>
            {topRated.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Mos ustalar topilmadi.</p>
            ) : (
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {topRated.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleOpenCard(card)}
                    className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 text-left transition hover:border-slate-600"
                  >
                    <div className="group">
                      <img
                        src={card.image.src}
                        alt={card.image.alt}
                        className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 p-3 text-xs text-slate-300">
                      <div>
                        <p className="text-sm font-semibold text-white">{card.title}</p>
                        <p className="text-[11px] text-slate-400">{card.agent.specialty}</p>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{card.price.toLocaleString("en-US")} {card.currency}</span>
                        <span className="text-amber-300">{card.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <img src={card.agent.avatar} alt={card.agent.name} className="h-6 w-6 rounded-full object-cover" />
                        <span>{card.agent.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-white">Boshqa e'lonlar</h3>
              <span className="text-xs text-slate-400">Yon tomonga scroll</span>
            </div>
            {remainder.length === 0 ? (
              <p className="mt-3 text-sm text-slate-400">Qo'shimcha e'lonlar topilmadi.</p>
            ) : (
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {remainder.map((card) => (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => handleOpenCard(card)}
                    className="min-w-[240px] overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 text-left transition hover:border-slate-600"
                  >
                    <div className="group">
                      <img
                        src={card.image.src}
                        alt={card.image.alt}
                        className="h-32 w-full object-cover transition group-hover:scale-[1.02]"
                        loading="lazy"
                      />
                    </div>
                    <div className="space-y-2 p-3 text-xs text-slate-300">
                      <p className="text-sm font-semibold text-white">{card.title}</p>
                      <p className="text-[11px] text-slate-400">{card.agent.name} · {card.agent.location}</p>
                      <div className="flex items-center justify-between text-[11px]">
                        <span>{card.price.toLocaleString("en-US")} {card.currency}</span>
                        <span className="text-amber-300">{card.rating.toFixed(1)}</span>
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
                  {subCategoryLabelMap.get(selectedCard.subCategory) || "Qurilish xizmati"}
                </p>
                <h3 className="mt-2 text-xl font-semibold">{selectedCard.title}</h3>
                <p className="text-sm text-slate-400">{selectedCard.agent.specialty}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseCard}
                className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300"
              >
                Yopish
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
                    <span>Narx</span>
                    <span className="text-emerald-200">
                      {selectedCard.price.toLocaleString("en-US")} {selectedCard.currency} / {selectedCard.unit}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Baho</span>
                    <span className="text-slate-100">{selectedCard.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{selectedCard.agent.location}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                  <p className="mt-2 text-xs text-slate-400">{selectedCard.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Usta haqida</p>
                  <div className="mt-3 flex items-center gap-3">
                    <img
                      src={selectedCard.agent.avatar}
                      alt={selectedCard.agent.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{selectedCard.agent.name}</p>
                      <p className="text-xs text-slate-400">@{selectedCard.agent.nickname}</p>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Tajriba</span>
                      <span className="text-slate-100">{selectedCard.agent.experienceYears} yil</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Mutaxassislik</span>
                      <span className="text-slate-100">{selectedCard.agent.specialty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Reyting</span>
                      <span className="text-slate-100">{selectedCard.agent.rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Holat</span>
                      <span className="text-slate-100">
                        {selectedCard.agent.verified ? "Tasdiqlangan usta" : "Tasdiqlanmagan"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Ustaning malakasi va tasdiqlovchi hujjatlari ro'yxati.
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
                      <span className="text-[11px] text-slate-500">Hujjatlar kiritilmagan.</span>
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
                        Buyurtma berish
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenChat}
                        className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                      >
                        Xabarlashish
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/login"
                      className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                    >
                      Buyurtma uchun kirish
                    </Link>
                  )}
                </div>

                {showChat && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                    <p className="text-sm font-semibold text-slate-100">Xabar yozish</p>
                    <p className="mt-2 text-xs text-slate-400">
                      Ustaga kerakli savolni yuboring yoki tayyor matndan foydalaning.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chatTemplates.map((template) => (
                        <button
                          key={template}
                          type="button"
                          onClick={() => setMessageDraft(template)}
                          className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-[11px] text-slate-300"
                        >
                          {template}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={messageDraft}
                      onChange={(event) => setMessageDraft(event.target.value)}
                      placeholder="Xabaringiz..."
                      className="mt-3 h-20 w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-200 focus:border-sky-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      className="mt-3 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-200"
                    >
                      Xabar yuborish
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
