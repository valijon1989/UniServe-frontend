"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTopAgents, type TopAgent } from "@/api/agent";
import { client } from "@/api/client";
import { getProducts } from "@/api/products";
import { TopPodium } from "@/components/TopPodium";
import { EventsSection, type EventItem } from "@/components/EventsSection";
import { useI18n } from "@/context/i18n";

export default function HomePage() {
  const [agents, setAgents] = useState<TopAgent[]>([]);
  const [saleProducts, setSaleProducts] = useState<EventItem[]>([]);
  const [saleServices, setSaleServices] = useState<EventItem[]>([]);
  const { t } = useI18n();

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

  const parseNumber = (value: unknown) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const cleaned = value.replace(/[^0-9.-]+/g, "");
      const parsed = Number(cleaned);
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const pickNumber = (...values: unknown[]) => {
    for (const value of values) {
      const parsed = parseNumber(value);
      if (parsed !== null) return parsed;
    }
    return null;
  };

  const getCategoryLabel = (value: any) => {
    if (!value) return "Kategoriya yo'q";
    if (typeof value === "string") return value;
    if (typeof value?.name === "string") return value.name;
    if (Array.isArray(value)) {
      const first = value[0];
      if (typeof first === "string") return first;
      if (typeof first?.name === "string") return first.name;
    }
    return "Kategoriya yo'q";
  };

  const buildSaleItem = (item: any, idx: number, kind: "product" | "service", allowSynthetic = false): EventItem | null => {
    const price = pickNumber(item.salePrice, item.discountPrice, item.price, item.cost, item.amount, item.hourlyRate);
    let oldPrice = pickNumber(
      item.oldPrice,
      item.old_price,
      item.originalPrice,
      item.basePrice,
      item.listPrice,
      item.priceBeforeDiscount,
      item.preDiscountPrice,
      item.priceOld
    );
    let off = pickNumber(item.discountPercent, item.discount, item.off, item.percentOff);

    if (price !== null && oldPrice === null && off !== null && off > 0 && off < 100) {
      oldPrice = Math.round((price * 100) / (100 - off));
    }

    if (allowSynthetic && price !== null && (oldPrice === null || oldPrice <= price)) {
      oldPrice = Math.round(price * 1.25);
      off = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    if (price === null || oldPrice === null || oldPrice <= price) return null;

    if (off === null || off <= 0 || off >= 100) {
      off = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    return {
      id: item.id || item._id || `${kind}-${idx}`,
      title: item.title || item.name || (kind === "product" ? "Mahsulot" : "Xizmat"),
      category: getCategoryLabel(item.category),
      price,
      oldPrice,
      off,
      tag: item.tag || item.label || item.badge || "Chegirma",
      kind,
      href: kind === "service"
        ? `/services/${item.slug || item._id || item.id || `${kind}-${idx}`}`
        : `/products/${item.slug || item._id || item.id || `${kind}-${idx}`}`,
      image: typeof item.coverImageUrl === "string" && item.coverImageUrl.trim() ? item.coverImageUrl.trim() : undefined
    };
  };

  const buildLatestFallbackItem = (item: any, idx: number, kind: "product" | "service"): EventItem | null => {
    const price = pickNumber(item.price, item.cost, item.amount, item.hourlyRate);
    if (price === null) return null;
    return {
      id: item.id || item._id || `${kind}-latest-${idx}`,
      title: item.title || item.name || (kind === "product" ? "Mahsulot" : "Xizmat"),
      category: getCategoryLabel(item.category),
      price,
      oldPrice: price,
      off: 0,
      tag: "Yangi",
      kind,
      href: kind === "service"
        ? `/services/${item.slug || item._id || item.id || `${kind}-${idx}`}`
        : `/products/${item.slug || item._id || item.id || `${kind}-${idx}`}`,
      image: typeof item.coverImageUrl === "string" && item.coverImageUrl.trim() ? item.coverImageUrl.trim() : undefined
    };
  };

  useEffect(() => {
    let active = true;

    const loadSales = async () => {
      try {
        const productsResponse = await getProducts({ limit: 50 });
        const discountedProductsRaw = productsResponse.products
          .map((item, idx) => buildSaleItem(item, idx, "product"))
          .filter((item): item is EventItem => Boolean(item))
          .slice(0, 3);
        const fallbackLatestProducts = productsResponse.products
          .map((item, idx) => buildLatestFallbackItem(item, idx, "product"))
          .filter((item): item is EventItem => Boolean(item))
          .slice(0, 3);
        if (active) setSaleProducts(discountedProductsRaw.length > 0 ? discountedProductsRaw : fallbackLatestProducts);
      } catch (err) {
        console.error("Sale products load error", err);
        if (active) setSaleProducts([]);
      }

      try {
        const res = await client.get("/services", { params: { limit: 50 } });
        const raw = res.data?.services || res.data?.items || res.data || [];
        const discountedServicesRaw = raw
          .map((item: any, idx: number) => buildSaleItem(item, idx, "service"))
          .filter((item: EventItem | null): item is EventItem => Boolean(item))
          .slice(0, 3);
        const fallbackLatestServices = raw
          .map((item: any, idx: number) => buildLatestFallbackItem(item, idx, "service"))
          .filter((item: EventItem | null): item is EventItem => Boolean(item))
          .slice(0, 3);
        if (active) setSaleServices(discountedServicesRaw.length > 0 ? discountedServicesRaw : fallbackLatestServices);
      } catch (err) {
        console.error("Sale services load error", err);
        if (active) setSaleServices([]);
      }
    };

    loadSales();

    return () => {
      active = false;
    };
  }, []);

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

  const resolveKind = (agent: TopAgent) => {
    if (agent.kind) return agent.kind.toUpperCase();
    if (agent.serviceCategory) return "SERVICE";
    const role = (agent as any)?.role || (agent as any)?.user?.role;
    if (typeof role === "string" && role.toUpperCase().includes("SERVICE")) return "SERVICE";
    return "SELLER";
  };

  const resolveAvatar = (agent: TopAgent) => {
    return (
      agent.avatarUrl ||
      agent.user?.avatarUrl ||
      (agent as any)?.profile?.avatarUrl ||
      (agent as any)?.image ||
      (agent as any)?.photo?.url ||
      (agent as any)?.photo
    );
  };

  const resolveAgentId = (agent?: TopAgent | null) => {
    if (!agent) return "";
    return String(
      agent.id ||
        agent._id ||
        agent.user?._id ||
        agent.user?.username ||
        agent.name ||
        ""
    );
  };

  const resolveAgentRouteId = (agent?: TopAgent | null) => {
    if (!agent) return null;
    const value = agent._id || agent.user?._id || agent.id || agent.user?.username || (agent as any)?.username || null;
    return value ? String(value) : null;
  };

  const getSortedAgents = () => {
    return [...(agents || [])].sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      const sa = a.score || 0;
      const sb = b.score || 0;
      if (sb !== sa) return sb - sa;
      const pa = a.posts || a.user?.postsCount || 0;
      const pb = b.posts || b.user?.postsCount || 0;
      if (pb !== pa) return pb - pa;
      return (b.user?.name || "").localeCompare(a.user?.name || "");
    });
  };

  const computeTopAgentsByCategory = (kind: "SELLER" | "SERVICE") => {
    const source = (agents || []).filter((a) => resolveKind(a) === kind);
    const sorted = [...source].sort((a, b) => {
      const ra = a.rating || 0;
      const rb = b.rating || 0;
      if (rb !== ra) return rb - ra;
      const sa = a.score || 0;
      const sb = b.score || 0;
      if (sb !== sa) return sb - sa;
      const pa = a.posts || a.user?.postsCount || 0;
      const pb = b.posts || b.user?.postsCount || 0;
      if (pb !== pa) return pb - pa;
      return (b.user?.name || "").localeCompare(a.user?.name || "");
    });

    if (sorted.length >= 10) return sorted.slice(0, 10);

    const used = new Set(sorted.map((a) => a.id || a._id));
    const filler = getSortedAgents().filter((a) => !used.has(a.id || a._id));
    return [...sorted, ...filler].slice(0, 10);
  };

  const topSellerAgents = useMemo(() => computeTopAgentsByCategory("SELLER"), [agents]);
  const topServiceAgents = useMemo(() => computeTopAgentsByCategory("SERVICE"), [agents]);

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),transparent_40%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
              {t("home.hero.kicker")}
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              {t("home.hero.title.v2")}
            </h1>
            <p className="max-w-2xl text-sm text-slate-200">
              {t("home.hero.subtitle.v2")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/services?from=home_hero"
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:shadow-emerald-500/50"
              >
                {t("home.hero.cta.primary")}
              </Link>
              <Link
                href="/become-agent"
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-white/60"
              >
                {t("home.hero.cta.secondary")}
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-emerald-100/90">
              <span className="rounded-full bg-white/10 px-3 py-1">{t("home.hero.tag.trusted")}</span>
              <span className="rounded-full bg-white/10 px-3 py-1">{t("home.hero.tag.secure")}</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: "💼",
                title: t("home.category.consulting.title"),
                desc: t("home.category.consulting.desc"),
                href: "/agents?category=consulting&tags=career,visa,business&from=home_category_consulting",
                tone: "bg-emerald-500/15 text-emerald-100"
              },
              {
                icon: "🌐",
                title: t("home.category.translation.title"),
                desc: t("home.category.translation.desc"),
                href: "/agents?category=translation&tags=official,fast&from=home_category_translation",
                tone: "bg-sky-500/15 text-sky-100"
              },
              {
                icon: "⚖️",
                title: t("home.category.legal.title"),
                desc: t("home.category.legal.desc"),
                href: "/agents?category=legal&tags=verified,lawyers&from=home_category_legal",
                tone: "bg-amber-500/15 text-amber-100"
              },
              {
                icon: "🧠",
                title: t("home.category.psychology.title"),
                desc: t("home.category.psychology.desc"),
                href: "/agents?category=psychology&tags=safe,confidential&from=home_category_psychology",
                tone: "bg-rose-500/15 text-rose-100"
              },
              {
                icon: "🏋️",
                title: t("home.category.sports.title"),
                desc: t("home.category.sports.desc"),
                href: "/agents?category=sports&tags=online,offline&from=home_category_sports",
                tone: "bg-indigo-500/15 text-indigo-100"
              },
              {
                icon: "🛒",
                title: t("home.category.products.title"),
                desc: t("home.category.products.desc"),
                href: "/products?from=home_category_products",
                tone: "bg-slate-100/15 text-slate-100"
              }
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className={`group rounded-2xl border border-white/10 p-4 transition hover:-translate-y-0.5 hover:border-white/30 hover:shadow-lg hover:shadow-white/10 ${item.tone}`}
              >
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-white/80">{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm md:grid-cols-3">
          {[
            {
              icon: "🔍",
              title: t("home.info.choose.title"),
              desc: t("home.info.choose.desc"),
              href: "/services?step=choose&from=home_info_choose"
            },
            {
              icon: "💬",
              title: t("home.info.chat.title"),
              desc: t("home.info.chat.desc"),
              href: "/how-it-works#chat"
            },
            {
              icon: "✅",
              title: t("home.info.results.title"),
              desc: t("home.info.results.desc"),
              href: "/trust-and-safety?from=home_info_results"
            }
          ].map((step) => (
            <Link
              key={step.title}
              href={step.href}
              className="rounded-2xl border border-slate-100 bg-white p-4 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
            >
              <div className="text-2xl">{step.icon}</div>
              <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
              <p className="text-xs text-slate-500">{step.desc}</p>
            </Link>
          ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("home.trust.kicker")}</p>
            <h2 className="text-xl font-semibold text-slate-900">{t("home.trust.title")}</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <Link
              href="/agents?verified=1&from=home_trust_verified"
              className="rounded-full bg-emerald-50 px-3 py-1 transition hover:-translate-y-0.5 hover:bg-emerald-100"
            >
              {t("home.trust.verified")}
            </Link>
            <Link
              href="/trust-and-safety?from=home_trust_chat#chat"
              className="rounded-full bg-slate-100 px-3 py-1 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              {t("home.trust.messaging")}
            </Link>
            <Link
              href="/trust-and-safety?from=home_trust_files#files"
              className="rounded-full bg-slate-100 px-3 py-1 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              {t("home.trust.files")}
            </Link>
            <Link
              href="/trust-and-safety?from=home_trust_payments#payments"
              className="rounded-full bg-slate-100 px-3 py-1 transition hover:-translate-y-0.5 hover:bg-slate-200"
            >
              {t("home.trust.payments")}
            </Link>
          </div>
        </div>
      </section>

      

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
          {t("home.video.fallback")}
        </video>
      </div>

      <section className="space-y-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300">
              {t("home.top.kicker")}
            </p>
            <h2 className="text-2xl font-bold text-slate-50">{t("home.top.title")}</h2>
            <p className="text-sm text-slate-400">
              {t("home.top.subtitle")}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            { title: t("home.top.block.seller"), data: topSellerAgents, tone: "amber" as const },
            { title: t("home.top.block.service"), data: topServiceAgents, tone: "emerald" as const }
          ].map((block) => {
            const podium = block.data.slice(0, 3);
            const rest = block.data.slice(3);
            const heights = [170, 140, 120];
            const order = [0, 1, 2]; // 1-o'rin, 2-o'rin, 3-o'rin
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
                    {t("home.top.badge.top10")}
                  </span>
                </div>

                <div className="flex items-end gap-2">
                  {order.map((idx) => {
                    const agent = podium[idx];
                    const agentId = resolveAgentId(agent);
                    const routeId = resolveAgentRouteId(agent);
                    const displayName = agent?.name || agent?.user?.name || t("home.top.agentLabel");
                    const stableId = agentId || `${block.title}-${displayName}`.replace(/\s+/g, "-").toLowerCase();
                    const cardKey = `agent-top-${block.tone}-${idx}-${stableId}`;
                    const snippet =
                      agent?.snippet || agent?.user?.bio || agent?.user?.region || t("home.top.activeAgent");
                    const rating = (agent?.rating ?? 0).toFixed(1);
                    const score = agent?.score ?? 0;
                    const posts = agent?.posts ?? agent?.user?.postsCount ?? 0;
                    return (
                      <Link
                        key={cardKey}
                        href={routeId ? `/agents/${routeId}` : "/agents"}
                        style={{ minHeight: heights[idx] }}
                        className="relative flex-1 rounded-xl border border-slate-800/70 bg-slate-950/80 p-3 shadow-lg shadow-black/25 cursor-pointer transition hover:border-sky-500/60"
                      >
                        <span className="absolute right-2 top-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[11px] text-slate-200">
                          {idx + 1}
                          {t("home.top.rankSuffix")}
                        </span>
                        {agent ? (
                          <div className="flex h-full flex-col justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {resolveAvatar(agent) ? (
                                <img
                                  key={`${cardKey}-img`}
                                  src={resolveAvatar(agent)}
                                  alt={displayName}
                                  className="h-10 w-10 rounded-full object-cover"
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-slate-800 text-center text-sm font-semibold text-slate-100 flex items-center justify-center">
                                  {displayName.charAt(0)}
                                </div>
                              )}
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
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">⭐ {rating}</span>
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">👍 {score}</span>
                              <span className="rounded-full bg-slate-900/70 px-2 py-0.5">🧾 {posts}</span>
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500">{t("home.top.noData")}</p>
                        )}
                      </Link>
                    );
                  })}
                </div>

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {rest.map((agent, idx) => {
                    const agentId = resolveAgentId(agent);
                    const routeId = resolveAgentRouteId(agent);
                    const displayName = agent.name || agent.user?.name || t("home.top.agentLabel");
                    const stableId = agentId || `${block.title}-${displayName}`.replace(/\s+/g, "-").toLowerCase();
                    const cardKey = `agent-rest-${block.tone}-${idx}-${stableId}`;
                    const snippet =
                      agent.snippet || agent.user?.bio || agent.user?.region || t("home.top.activeAgent");
                    const rating = (agent.rating ?? 0).toFixed(1);
                    const score = agent.score ?? 0;
                    return (
                      <Link
                        key={cardKey}
                        href={routeId ? `/agents/${routeId}` : "/agents"}
                        className="flex items-center justify-between rounded-lg border border-slate-800/70 bg-slate-900/60 px-3 py-2 text-sm cursor-pointer transition hover:border-sky-500/60"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {resolveAvatar(agent) ? (
                            <img
                              key={`${cardKey}-img`}
                              src={resolveAvatar(agent)}
                              alt={displayName}
                              className="h-9 w-9 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-slate-800 text-center text-xs font-semibold text-slate-100 flex items-center justify-center">
                              {displayName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-100">{displayName}</p>
                            <p className="truncate text-xs text-slate-400">
                              {snippet}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2 text-[11px] text-slate-200">
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">⭐ {rating}</span>
                          <span className="rounded-full bg-slate-800 px-2 py-0.5">👍 {score}</span>
                        </div>
                      </Link>
                    );
                  })}
                  {rest.length === 0 && (
                    <p className="text-sm text-slate-400">{t("home.top.noMore")}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
