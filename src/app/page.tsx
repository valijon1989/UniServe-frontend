"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getFeed, type FeedItem } from "@/api/feed";
import { getTopAgents, type TopAgent } from "@/api/agent";
import { useI18n } from "@/context/i18n";
import { TrendingShowcase } from "@/components/TrendingShowcase";
import { TopPodium } from "@/components/TopPodium";
import { EventsSection } from "@/components/EventsSection";

export default function HomePage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [agents, setAgents] = useState<TopAgent[]>([]);
  const [activePanel, setActivePanel] = useState<"search" | "agents" | "community" | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [communityPage, setCommunityPage] = useState(0);
  const [selectedAgent, setSelectedAgent] = useState<TopAgent | null>(null);
  const { t } = useI18n();

  const heroSlides = useMemo(
    () => [
      {
        title: t("home.hero.slide.products.title"),
        desc: t("home.hero.slide.products.desc"),
        badge: t("home.hero.slide.products.badge"),
        image: "https://images.unsplash.com/photo-1542293787938-4d273c37b00c?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.services.title"),
        desc: t("home.hero.slide.services.desc"),
        badge: t("home.hero.slide.services.badge"),
        image: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.community.title"),
        desc: t("home.hero.slide.community.desc"),
        badge: t("home.hero.slide.community.badge"),
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.agents.title"),
        desc: t("home.hero.slide.agents.desc"),
        badge: t("home.hero.slide.agents.badge"),
        image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80"
      },
      {
        title: t("home.hero.slide.feed.title"),
        desc: t("home.hero.slide.feed.desc"),
        badge: t("home.hero.slide.feed.badge"),
        image: "https://images.unsplash.com/photo-1527443224154-d777c966ebb5?auto=format&fit=crop&w=800&q=80"
      }
    ],
    [t]
  );

  const query = searchQuery.trim().toLowerCase();

  const filteredFeedItems = useMemo(() => {
    if (!query) return items;
    return items.filter((item) => {
      const combined = [
        item.content,
        item.text,
        item.type,
        item.category,
        item.author?.name
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return combined.includes(query);
    });
  }, [items, query]);

  const searchResults = useMemo(
    () => (query ? filteredFeedItems.slice(0, 5) : []),
    [filteredFeedItems, query]
  );

  const topAgents = useMemo(() => {
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        avatar?: string;
        rating: number;
        score: number;
        snippet?: string;
        media?: string;
        posts: number;
      }
    >();

    items.forEach((item, idx) => {
      const role = (item.author?.role || "").toString().toUpperCase();
      if (role !== "AGENT") return;

      const id = item.author?._id || item.author?.name || `agent-${idx}`;
      const likes = item.likesCount || 0;
      const comments = item.commentsCount || 0;
      const engagement = likes + comments;
      const rating = Math.min(5, 3.6 + engagement / 25);

      const existing = map.get(id);
      if (existing) {
        existing.score += engagement;
        existing.posts += 1;
        existing.rating = Math.max(existing.rating, rating);
        existing.snippet = existing.snippet || item.content || item.text || "";
        existing.media = existing.media || item.mediaUrl || item.images?.[0];
        return;
      }

      map.set(id, {
        id,
        name: item.author?.name || "Agent",
        avatar: item.author?.avatarUrl,
        rating,
        score: engagement,
        snippet: item.content || item.text || "",
        media: item.mediaUrl || item.images?.[0],
        posts: 1
      });
    });

    const sorted = Array.from(map.values()).sort((a, b) => {
      if (b.rating === a.rating) return b.score - a.score;
      return b.rating - a.rating;
    });

    return sorted.slice(0, 10);
  }, [items]);

  const agentMatches = useMemo(() => {
    if (!query) return topAgents;
    return topAgents.filter((agent) =>
      [agent.name, agent.snippet].some((value) => value?.toLowerCase().includes(query))
    );
  }, [query, topAgents]);

  const communityThreads = useMemo(() => {
    const relevant = items.filter((item) => {
      const tag = (item.type || item.category || "").toLowerCase();
      return (
        tag.includes("community") ||
        tag.includes("forum") ||
        tag.includes("discussion") ||
        tag.includes("social")
      );
    });

    const pool = relevant.length ? relevant : items;
    return [...pool].sort((a, b) => {
      const scoreA = (a.likesCount || 0) + (a.commentsCount || 0);
      const scoreB = (b.likesCount || 0) + (b.commentsCount || 0);
      return scoreB - scoreA;
    });
  }, [items]);

  const threadsPerPage = 5;
  const totalCommunityPages = Math.max(1, Math.ceil(communityThreads.length / threadsPerPage));
  const visibleThreads = communityThreads.slice(
    communityPage * threadsPerPage,
    communityPage * threadsPerPage + threadsPerPage
  );

  const sampleSellerAgents = useMemo<TopAgent[]>(
    () => [
      { id: "s1", name: "Dilshod Karimov", rating: 4.9, score: 132, posts: 12, snippet: "Elektronika va texnika sotuvlari" },
      { id: "s2", name: "Madina Omonova", rating: 4.8, score: 118, posts: 10, snippet: "Kiyim-kechak premium toifasi" },
      { id: "s3", name: "Javohir Usmonov", rating: 4.7, score: 102, posts: 9, snippet: "Uy jihozlari va mebel" },
      { id: "s4", name: "Saodat Ergasheva", rating: 4.6, score: 95, posts: 8, snippet: "Bolalar o'yinchoqlari" },
      { id: "s5", name: "Otabek Rustamov", rating: 4.5, score: 88, posts: 7, snippet: "Foto/video uskunalar" },
      { id: "s6", name: "Malika Rakhmatova", rating: 4.5, score: 84, posts: 7, snippet: "Sport anjomlari" },
      { id: "s7", name: "Akmal Sobirov", rating: 4.4, score: 80, posts: 6, snippet: "Avto aksessuarlar" },
      { id: "s8", name: "Kamola Karimova", rating: 4.4, score: 78, posts: 6, snippet: "Parfyumeriya va kosmetika" },
      { id: "s9", name: "Rustam Xolmurodov", rating: 4.3, score: 72, posts: 6, snippet: "Qishloq xo'jaligi mahsulotlari" },
      { id: "s10", name: "Sevinch Sattorova", rating: 4.3, score: 70, posts: 5, snippet: "Yengil sanoat tovarlari" }
    ],
    []
  );

  const sampleServiceAgents = useMemo<TopAgent[]>(
    () => [
      { id: "sv1", name: "Diyorbek Raximov", rating: 4.9, score: 140, posts: 14, snippet: "SMM va marketing xizmatlari" },
      { id: "sv2", name: "Aziza Tursunova", rating: 4.8, score: 126, posts: 12, snippet: "Grafik dizayn va brending" },
      { id: "sv3", name: "Shahzod Aliyev", rating: 4.7, score: 110, posts: 11, snippet: "Veb va mobil dasturlash" },
      { id: "sv4", name: "Muslima Bozorova", rating: 4.6, score: 98, posts: 9, snippet: "Konsalting va audit" },
      { id: "sv5", name: "Zafarbek Rahmatov", rating: 4.6, score: 95, posts: 9, snippet: "Ta'lim va mentorlik" },
      { id: "sv6", name: "Sabina Ahmedova", rating: 4.5, score: 90, posts: 8, snippet: "HR va kadrlar boshqaruvi" },
      { id: "sv7", name: "Shuhrat Ergashev", rating: 4.4, score: 85, posts: 7, snippet: "Foto/video xizmatlari" },
      { id: "sv8", name: "Nilufar Abdullayeva", rating: 4.4, score: 80, posts: 7, snippet: "UX/UI dizayn" },
      { id: "sv9", name: "Elyor Po'latov", rating: 4.3, score: 76, posts: 6, snippet: "Qurilish va ta'mirlash" },
      { id: "sv10", name: "Gulnoza Umarova", rating: 4.3, score: 72, posts: 5, snippet: "Tibbiy konsultatsiya" }
    ],
    []
  );

  const saleProducts = useMemo(
    () => [
      { id: "sp1", title: "Smartfon X12", category: "Elektronika", price: 280, oldPrice: 350, off: 20, tag: "Flash sale" },
      { id: "sp2", title: "Gaming laptop", category: "Kompyuterlar", price: 950, oldPrice: 1100, off: 14, tag: "Limited" },
      { id: "sp3", title: "Noise-cancelling quloqchin", category: "Aksessuar", price: 120, oldPrice: 180, off: 33, tag: "Hot deal" }
    ],
    []
  );

  const saleServices = useMemo(
    () => [
      { id: "ss1", title: "SMM paket (premium)", category: "Marketing", price: 180, oldPrice: 260, off: 31, tag: "Chegirma" },
      { id: "ss2", title: "UI/UX dizayn sprint", category: "Dizayn", price: 220, oldPrice: 300, off: 27, tag: "Limited" },
      { id: "ss3", title: "Backend audit", category: "Dasturlash", price: 150, oldPrice: 210, off: 29, tag: "Yangi taklif" }
    ],
    []
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await getTopAgents(20);
        setAgents(data || []);
      } catch (err) {
        console.error("Top agents load error", err);
      }
    })();
  }, []);

  const fallbackAgents: TopAgent[] = [
    {
      id: "fb-s1",
      kind: "SELLER",
      rating: 4.9,
      user: { name: "Akmal Seller", region: "Tashkent", bio: "Logistika va elektronika" }
    },
    {
      id: "fb-s2",
      kind: "SELLER",
      rating: 4.7,
      user: { name: "Malika Market", region: "Samarkand", bio: "Moda va aksessuarlar" }
    },
    {
      id: "fb-s3",
      kind: "SELLER",
      rating: 4.6,
      user: { name: "Bekzod Store", region: "Bukhara", bio: "Uy jihozlari" }
    },
    {
      id: "fb-s4",
      kind: "SELLER",
      rating: 4.5,
      user: { name: "Sabina Sales", region: "Fergana", bio: "Bolalar tovarlari" }
    },
    {
      id: "fb-s5",
      kind: "SELLER",
      rating: 4.4,
      user: { name: "Javlon Trade", region: "Namangan", bio: "Texnika va IT" }
    },
    {
      id: "fb-v1",
      kind: "SERVICE",
      rating: 4.9,
      user: { name: "Nodira Service", region: "Tashkent", bio: "Dizayn va marketing" }
    },
    {
      id: "fb-v2",
      kind: "SERVICE",
      rating: 4.8,
      user: { name: "Ulug'bek Support", region: "Andijan", bio: "Yuridik maslahat" }
    },
    {
      id: "fb-v3",
      kind: "SERVICE",
      rating: 4.6,
      user: { name: "Laylo Care", region: "Khiva", bio: "SMM va kontent" }
    },
    {
      id: "fb-v4",
      kind: "SERVICE",
      rating: 4.5,
      user: { name: "Aziz Tech", region: "Nukus", bio: "IT xizmatlari" }
    },
    {
      id: "fb-v5",
      kind: "SERVICE",
      rating: 4.4,
      user: { name: "Diyor Consult", region: "Jizzakh", bio: "Konsalting" }
    }
  ];

  const computeTopAgentsByCategory = (kind: "SELLER" | "SERVICE") => {
    const source = (agents && agents.length > 0 ? agents : fallbackAgents).filter(
      (a) => (a.kind || "").toUpperCase() === kind
    );
    return source
      .sort((a, b) => {
        const ra = a.rating || 0;
        const rb = b.rating || 0;
        if (rb === ra) return (b.user?.name || "").localeCompare(a.user?.name || "");
        return rb - ra;
      })
      .slice(0, 10);
  };

  const topSellerAgents = useMemo(() => computeTopAgentsByCategory("SELLER"), [agents]);
  const topServiceAgents = useMemo(() => computeTopAgentsByCategory("SERVICE"), [agents]);

  const handleTogglePanel = (panel: "search" | "agents" | "community") => {
    setActivePanel((prev) => (prev === panel ? null : panel));
    if (panel !== "search") {
      setSearchQuery("");
    }
    setCommunityPage(0);
  };

  useEffect(() => {
    if (communityPage > totalCommunityPages - 1) {
      setCommunityPage(0);
    }
  }, [communityPage, totalCommunityPages]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-sky-900/50 via-slate-900/70 to-amber-900/40 p-8 shadow-2xl shadow-black/30">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_45%),radial-gradient(circle_at_bottom,_rgba(248,113,113,0.12),transparent_40%)]" />
        <div className="relative grid gap-6 lg:grid-cols-2 lg:items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/60 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-sky-200 ring-1 ring-sky-500/30">
              {t("home.hero.platform")}
            </div>
            <h1 className="text-3xl font-bold leading-tight text-slate-50 sm:text-4xl">
              {t("home.hero.title")}
            </h1>
            <p className="max-w-2xl text-base text-slate-300">
              {t("home.hero.description")}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => handleTogglePanel("search")}
                className={`inline-flex items-center gap-2 rounded-full bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 ring-1 ring-sky-500/40 transition hover:bg-sky-500/25 ${
                  activePanel === "search" ? "ring-2 ring-sky-400/70" : ""
                }`}
              >
                <span className="text-sky-200">[Qidiruv]</span>
                {t("home.hero.tag.search")}
              </button>
              <button
                type="button"
                onClick={() => handleTogglePanel("agents")}
                className={`inline-flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 ring-1 ring-emerald-500/40 transition hover:bg-emerald-500/25 ${
                  activePanel === "agents" ? "ring-2 ring-emerald-400/70" : ""
                }`}
              >
                {t("home.hero.tag.verified")}
              </button>
              <button
                type="button"
                onClick={() => handleTogglePanel("community")}
                className={`inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 ring-1 ring-amber-500/40 transition hover:bg-amber-500/25 ${
                  activePanel === "community" ? "ring-2 ring-amber-300/70" : ""
                }`}
              >
                {t("home.hero.tag.community")}
              </button>
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full bg-slate-100/10 px-4 py-2 text-sm font-semibold text-slate-100 ring-1 ring-slate-300/30 transition hover:bg-slate-200/20"
              >
                Yangiliklar lentasiga o‘tish
              </Link>
            </div>

            {activePanel === "search" && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-inner shadow-black/30">
                <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2">
                  <span className="text-sky-300">[Qidiruv]</span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Mahsulot, agent yoki postni qidiring"
                    className="w-full bg-transparent text-sm text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Qidiruv natijalari
                  </p>
                  {query && searchResults.length === 0 && (
                    <p className="text-sm text-slate-400">Hech narsa topilmadi.</p>
                  )}
                  {!query && (
                    <p className="text-sm text-slate-400">
                      Yoyiqdagi istalgan ma&apos;lumotni qidirish uchun matn kiriting.
                    </p>
                  )}
                  {searchResults.map((item) => (
                    <div
                      key={item.id || item._id}
                      className="flex items-start gap-3 rounded-lg border border-slate-800/80 bg-slate-900/70 px-3 py-2 text-sm"
                    >
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/20 text-xs text-sky-200">
                        {(item.author?.name || "U")[0]}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="line-clamp-1 font-medium text-slate-100">
                          {item.author?.name || "Foydalanuvchi"}
                        </p>
                        <p className="line-clamp-2 text-xs text-slate-400">
                          {item.content || item.text}
                        </p>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">
                          {item.type || item.category}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Agentlar
                  </p>
                  {agentMatches.length === 0 ? (
                    <p className="text-sm text-slate-400">
                      Agentlar topilmadi.
                    </p>
                  ) : (
                    <div className="flex gap-3 overflow-x-auto pb-1">
                      {agentMatches.map((agent) => (
                        <div
                          key={agent.id}
                          className="min-w-[220px] rounded-lg border border-slate-800/80 bg-slate-900/70 p-3 text-sm"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-100">{agent.name}</p>
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-200">
                              * {agent.rating.toFixed(1)}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                            {agent.snippet || "Agent faoliyati"}
                          </p>
                          <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                            {agent.posts} post - {agent.score} reyting balli
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activePanel === "agents" && (
              <div className="mt-4 space-y-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-emerald-100">
                    Top 10 tasdiqlangan agentlar
                  </p>
                  <span className="text-xs text-emerald-200/90">
                    Reyting bo'yicha tartiblangan
                  </span>
                </div>
                {topAgents.length === 0 ? (
                  <p className="text-sm text-emerald-100/80">
                    Agentlar ro'yxati hozircha bo'sh.
                  </p>
                ) : (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {topAgents.map((agent, idx) => (
                      <div
                        key={agent.id}
                        className="group relative min-w-[220px] overflow-hidden rounded-xl border border-emerald-500/30 bg-slate-950/70 p-3 shadow-lg shadow-emerald-500/15"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                              #{idx + 1}
                            </span>
                            <p className="font-semibold text-slate-100">{agent.name}</p>
                          </div>
                          <span className="rounded-full bg-emerald-500/25 px-2 py-0.5 text-xs text-emerald-50">
                            * {agent.rating.toFixed(1)}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                          {agent.snippet || "Agentning oxirgi faoliyati."}
                        </p>
                        <p className="mt-2 text-[11px] uppercase tracking-wide text-emerald-200">
                          {agent.posts} post - {agent.score} reaksiya
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activePanel === "community" && (
              <div className="mt-4 space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-amber-50">
                    Eng ko'p muhokama qilingan mavzular
                  </p>
                  <span className="text-xs text-amber-100/80">
                    {communityPage + 1} / {totalCommunityPages}
                  </span>
                </div>
                {visibleThreads.length === 0 ? (
                  <p className="text-sm text-amber-100/80">
                    Muhokamalar hozircha mavjud emas.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {visibleThreads.map((thread) => (
                      <div
                        key={thread.id || thread._id}
                        className="flex gap-3 rounded-lg border border-amber-500/30 bg-slate-950/60 p-3"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/20 text-xs font-semibold text-amber-100">
                          {(thread.author?.name || "C")[0]}
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="line-clamp-1 font-semibold text-slate-100">
                            {thread.author?.name || "Foydalanuvchi"}
                          </p>
                          <p className="line-clamp-2 text-xs text-slate-300">
                            {thread.content || thread.text}
                          </p>
                          <p className="text-[11px] uppercase tracking-wide text-amber-200">
                            Love {thread.likesCount || 0} - Comments {thread.commentsCount || 0}
                          </p>
                        </div>
                        {thread.mediaUrl && (
                          <img
                            src={thread.mediaUrl}
                            alt="media"
                            className="hidden h-16 w-20 rounded-md object-cover sm:block"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {totalCommunityPages > 1 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCommunityPage((prev) => Math.max(0, prev - 1))
                      }
                      className="rounded-lg border border-amber-500/40 px-3 py-1 text-xs text-amber-50 disabled:opacity-50"
                      disabled={communityPage === 0}
                    >
                      Oldingi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setCommunityPage((prev) =>
                          Math.min(totalCommunityPages - 1, prev + 1)
                        )
                      }
                      className="rounded-lg border border-amber-500/40 px-3 py-1 text-xs text-amber-50 disabled:opacity-50"
                      disabled={communityPage >= totalCommunityPages - 1}
                    >
                      Keyingi
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-xl">
            <div className="marquee-track">
              {[...heroSlides, ...heroSlides].map((slide, idx) => (
                <div
                  key={`${slide.title}-${idx}`}
                  className="relative min-w-[220px] min-h-[180px] overflow-hidden rounded-xl border border-slate-600/70 bg-gradient-to-b from-slate-900/60 via-slate-950/60 to-black/70 px-4 py-5 shadow-lg shadow-black/25"
                >
                  <div className="absolute inset-0">
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="h-full w-full object-cover opacity-95"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/40" />
                  </div>
                  <div className="relative">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-[11px] uppercase tracking-wide text-slate-300">
                      {slide.badge}
                    </div>
                    <p className="text-lg font-semibold text-slate-100">{slide.title}</p>
                    <p className="mt-1 text-xs text-slate-300">{slide.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      

      <TrendingShowcase />

      <EventsSection saleProducts={saleProducts} saleServices={saleServices} />

      <TopPodium />

      <div className="-mx-4 sm:-mx-6 lg:-mx-8 mt-6 mb-8">
        <video
          className="block w-full h-auto"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          controls={false}
        >
          <source src="/video/Uni.mp4" type="video/mp4" />
          <source src="https://storage.googleapis.com/coverr-main/mp4/Mt_Baker.mp4" type="video/mp4" />
          Brauzeringiz video ko‘rsatishni qo‘llab-quvvatlamaydi.
        </video>
      </div>

      <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
              Top Agents (haftalik)
            </p>
            <h2 className="text-2xl font-bold text-slate-50">Sotuv va xizmat agentlari</h2>
            <p className="text-sm text-slate-400">
              Layklar, sharhlar va faoliyatga kora saralangan top 10. Top 3 pastdan yuqoriga podiumda, qolganlari skrollda.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: "Top Seller Agents", data: topSellerAgents.length ? topSellerAgents : sampleSellerAgents, tone: "amber" as const },
            { title: "Top Service Agents", data: topServiceAgents.length ? topServiceAgents : sampleServiceAgents, tone: "emerald" as const }
          ].map((block) => {
            const podium = block.data.slice(0, 3);
            const rest = block.data.slice(3);
            const heights = [170, 140, 120];
            const order = [1, 0, 2]; // 2-o'rin, 1-o'rin, 3-o'rin
            const badgeColor =
              block.tone === "amber"
                ? "bg-amber-500/20 text-amber-100 ring-1 ring-amber-500/40"
                : "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/40";

            return (
              <div
                key={block.title}
                className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/40 p-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-50">{block.title}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                    Top 10
                  </span>
                </div>

                <div className="flex items-end gap-2">
                  {order.map((idx) => {
                    const agent = podium[idx];
                    const displayName = agent?.name || agent?.user?.name || "Agent";
                    const snippet =
                      agent?.snippet || agent?.user?.bio || agent?.user?.region || "Faol agent";
                    const rating = (agent?.rating ?? 0).toFixed(1);
                    const score = agent?.score ?? 0;
                    const posts = agent?.posts ?? agent?.user?.postsCount ?? 0;
                    return (
                      <div
                        key={agent?.id || `empty-${block.title}-${idx}`}
                        style={{ minHeight: heights[idx] }}
                        className="flex-1 rounded-xl border border-slate-800/70 bg-slate-950/80 p-3 shadow-lg shadow-black/25 cursor-pointer transition hover:border-sky-500/60"
                        onClick={() =>
                          agent &&
                          setSelectedAgent({
                            id: agent.id || agent.user?._id || String(idx),
                            name: displayName,
                            rating: agent.rating ?? 0,
                            score,
                            snippet,
                            posts
                          })
                        }
                      >
                        {agent ? (
                          <div className="flex h-full flex-col justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <div className="h-10 w-10 rounded-full bg-slate-800 text-center text-sm font-semibold text-slate-100 flex items-center justify-center">
                                {displayName.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-100 line-clamp-2">
                                  {displayName}
                                </p>
                                <p className="text-[11px] text-slate-400 line-clamp-2">
                                  {snippet}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2 text-[11px] text-slate-200">
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                                Reyting {rating}
                              </span>
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                                Reaksiya {score}
                              </span>
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                                Post {posts}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">Malumot yo'q</p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {rest.map((agent, idx) => {
                    const displayName = agent.name || agent.user?.name || "Agent";
                    const snippet =
                      agent.snippet || agent.user?.bio || agent.user?.region || "Faol agent";
                    const rating = (agent.rating ?? 0).toFixed(1);
                    const score = agent.score ?? 0;
                    return (
                      <div
                        key={agent.id || idx}
                        className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-sm cursor-pointer transition hover:border-sky-500/60"
                        onClick={() =>
                          setSelectedAgent({
                            id: agent.id || agent.user?._id || String(idx),
                            name: displayName,
                            rating: agent.rating ?? 0,
                            score,
                            snippet,
                            posts: agent.posts ?? agent.user?.postsCount ?? 0
                          })
                        }
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-9 w-9 rounded-full bg-slate-800 text-center text-xs font-semibold text-slate-100 flex items-center justify-center">
                            {displayName.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-100">{displayName}</p>
                            <p className="truncate text-xs text-slate-400">
                              {snippet}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 text-[11px] text-slate-200">
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">
                            Reyting {rating}
                          </span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">
                            Reaksiya {score}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  {rest.length === 0 && (
                    <p className="text-sm text-slate-400">Qoshimcha agentlar topilmadi.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {selectedAgent && (
          <div className="rounded-2xl border border-sky-500/40 bg-slate-900/60 p-4 shadow-lg shadow-sky-500/20">
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-500/20 text-sm font-semibold text-sky-100">
                  {(selectedAgent.name || "A").charAt(0)}
                </div>
                <div>
                  <p className="text-base font-semibold text-slate-100">
                    {selectedAgent.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {selectedAgent.snippet || "Agent haqida qisqa ma'lumot."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-300 hover:border-sky-500/60"
                onClick={() => setSelectedAgent(null)}
              >
                Yopish
              </button>
            </div>
            <div className="flex flex-wrap gap-2 text-[12px] md:text-sm text-slate-200">
              <span className="rounded-full bg-slate-800 px-2 py-0.5">
                Reyting {(selectedAgent.rating ?? 0).toFixed(1)}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5">
                Reaksiya {selectedAgent.score ?? 0}
              </span>
              <span className="rounded-full bg-slate-800 px-2 py-0.5">
                Post {selectedAgent.posts ?? selectedAgent.user?.postsCount ?? 0}
              </span>
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
