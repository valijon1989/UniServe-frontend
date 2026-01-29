"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTopAgents, type TopAgent } from "@/api/agent";
import { TrendingShowcase } from "@/components/TrendingShowcase";
import { TopPodium } from "@/components/TopPodium";
import { EventsSection } from "@/components/EventsSection";

export default function HomePage() {
  const [agents, setAgents] = useState<TopAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<TopAgent | null>(null);

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

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),transparent_45%),radial-gradient(circle_at_bottom,_rgba(14,165,233,0.18),transparent_40%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-5">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-emerald-200">
              UniServe
            </p>
            <h1 className="text-4xl font-semibold leading-tight">
              All-in-one services platform for work, life, and growth
            </h1>
            <p className="max-w-2xl text-sm text-slate-200">
              Consulting, translation, legal, psychology, sports coaching, and online shopping — all in one trusted place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/agents?view=services"
                className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/30"
              >
                Find a service
              </Link>
              <Link
                href="/agents?view=services"
                className="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white"
              >
                Become an agent
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-emerald-100/90">
              <span className="rounded-full bg-white/10 px-3 py-1">⭐ Trusted by verified professionals</span>
              <span className="rounded-full bg-white/10 px-3 py-1">🔒 Secure chat & file sharing</span>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { icon: "💼", title: "Consulting", desc: "Career, visa, business", tone: "bg-emerald-500/15 text-emerald-100" },
              { icon: "🌐", title: "Translation", desc: "Official & fast", tone: "bg-sky-500/15 text-sky-100" },
              { icon: "⚖️", title: "Legal", desc: "Verified lawyers", tone: "bg-amber-500/15 text-amber-100" },
              { icon: "🧠", title: "Psychology", desc: "Safe & confidential", tone: "bg-rose-500/15 text-rose-100" },
              { icon: "🏋️", title: "Sports", desc: "Online & offline", tone: "bg-indigo-500/15 text-indigo-100" },
              { icon: "🛒", title: "Products", desc: "Trusted shopping", tone: "bg-slate-100/15 text-slate-100" }
            ].map((item) => (
              <div key={item.title} className={`rounded-2xl border border-white/10 p-4 ${item.tone}`}>
                <div className="text-2xl">{item.icon}</div>
                <p className="mt-2 text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-white/80">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm md:grid-cols-3">
        {[
          { icon: "🔍", title: "Choose a service", desc: "Find a verified expert in seconds" },
          { icon: "💬", title: "Chat & share files securely", desc: "Fast, private, and reliable" },
          { icon: "✅", title: "Get results safely", desc: "Clear outcomes and support" }
        ].map((step) => (
          <div key={step.title} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="text-2xl">{step.icon}</div>
            <p className="mt-2 text-sm font-semibold text-slate-900">{step.title}</p>
            <p className="text-xs text-slate-500">{step.desc}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Trust & Safety</p>
            <h2 className="text-xl font-semibold text-slate-900">Verified agents & secure workflow</h2>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-600">
            <span className="rounded-full bg-emerald-50 px-3 py-1">✅ Verified agents</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">🔒 Secure messaging</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">📁 Safe file sharing</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">💳 Secure payments</span>
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
