"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getCategoryImagePool,
  serviceCatalog,
  type ServiceAgent,
  type ServiceCategory,
  type ServiceItem
} from "@/data/serviceCatalog";
import { useAuthStore } from "@/store/auth";

type ServiceRecord = {
  service: ServiceItem;
  agent: ServiceAgent;
  category: ServiceCategory;
  groupTitle: string;
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const vehicleClassLabel = (value?: ServiceAgent["vehicleClass"]) => {
  if (!value) return "";
  if (value === "comfort") return "Comfort";
  if (value === "business") return "Business";
  return "Limuzin";
};

const renderStars = (rating: number) => {
  const filled = Math.min(5, Math.max(1, Math.round(rating)));
  return Array.from({ length: 5 }, (_, idx) => (idx < filled ? "★" : "☆")).join("");
};

const findServiceById = (rawId: string): ServiceRecord | null => {
  if (!rawId) return null;
  const baseId = rawId.includes("-v") ? rawId.split("-v")[0] : rawId;
  for (const group of serviceCatalog) {
    for (const category of group.categories) {
      for (const agent of category.agents) {
        const service = agent.services.find((item) => item.id === baseId);
        if (service) {
          return { service, agent, category, groupTitle: group.title };
        }
      }
    }
  }
  return null;
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [notice, setNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  const record = useMemo(() => findServiceById(String(params?.id || "")), [params]);

  const service = record?.service;
  const agent = record?.agent;
  const category = record?.category;
  const groupTitle = record?.groupTitle ?? "";
  const exteriorImages = service?.images.slice(0, 2) ?? [];
  const interiorImages = service?.images.slice(2) ?? [];
  const isConstruction = category?.id === "construction";
  const isMoving = category?.id === "moving";
  const isCleaning = category?.id === "cleaning";
  const isNanny = category?.id === "nanny";
  const isMarketing = category?.id === "marketing";
  const isConsulting = category?.id === "consulting";
  const isTranslation = category?.id === "translation";
  const nannyTypeLabels: Record<string, string> = {
    "nanny-child": "Bolalar enagasi",
    "nanny-elderly": "Qariyalar parvarishi",
    "nanny-hospital": "Shifoxona bemorlari",
    "nanny-homecare": "Uy sharoitidagi kasallar",
    "nanny-pet": "Uy hayvonlari enagasi"
  };
  const nannyTypeLabel = nannyTypeLabels[service.subCategory || "nanny-child"] || "Enaga";
  const constructionFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/construction/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const movingFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/moving/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const cleaningFallbacks = Array.from(
    { length: 36 },
    (_, idx) => `/services/cleaning/${String(idx + 1).padStart(2, "0")}.jpg`
  );
  const nannyFallbacks = getCategoryImagePool("nanny");
  const getConstructionFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 31 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % constructionFallbacks.length;
    return constructionFallbacks[(start + idx) % constructionFallbacks.length];
  };
  const getMovingFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 33 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % movingFallbacks.length;
    return movingFallbacks[(start + idx) % movingFallbacks.length];
  };
  const getCleaningFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 37 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % cleaningFallbacks.length;
    return cleaningFallbacks[(start + idx) % cleaningFallbacks.length];
  };
  const getNannyFallback = (serviceId: string, idx: number) => {
    let hash = 0;
    for (let i = 0; i < serviceId.length; i += 1) {
      hash = (hash * 41 + serviceId.charCodeAt(i)) % 2147483647;
    }
    const start = hash % nannyFallbacks.length;
    return nannyFallbacks[(start + idx) % nannyFallbacks.length]?.src;
  };

  const marketingPool = getCategoryImagePool("marketing");
  const marketingPosts = useMemo(() => {
    if (!isMarketing) return [];
    const images = service?.images ?? [];
    const base = images.length > 0 ? images : marketingPool;
    const posts = [...base];
    let hash = 0;
    const seed = service?.id ?? "";
    for (let i = 0; i < seed.length; i += 1) {
      hash = (hash * 53 + seed.charCodeAt(i)) % 2147483647;
    }
    const start = hash % marketingPool.length;
    for (let i = 0; posts.length < 9; i += 1) {
      posts.push(marketingPool[(start + i) % marketingPool.length]);
    }
    return posts.slice(0, 9);
  }, [isMarketing, marketingPool, service?.id, service?.images]);

  const [postStats, setPostStats] = useState(() =>
    marketingPosts.map((_, idx) => ({
      likes: Math.max(12, Math.round((service?.niceCount ?? 0) / 3) + idx * 3),
      dislikes: Math.max(1, Math.round((service?.niceCount ?? 0) / 18) + idx),
      comments: Math.max(2, Math.round((service?.reviewCount ?? 0) / 3) + idx),
      shares: Math.max(1, Math.round((service?.shareCount ?? 0) / 4) + idx),
      liked: false,
      disliked: false
    }))
  );
  const [activeComment, setActiveComment] = useState<number | null>(null);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!isMarketing) return;
    setPostStats(
      marketingPosts.map((_, idx) => ({
        likes: Math.max(12, Math.round((service?.niceCount ?? 0) / 3) + idx * 3),
        dislikes: Math.max(1, Math.round((service?.niceCount ?? 0) / 18) + idx),
        comments: Math.max(2, Math.round((service?.reviewCount ?? 0) / 3) + idx),
        shares: Math.max(1, Math.round((service?.shareCount ?? 0) / 4) + idx),
        liked: false,
        disliked: false
      }))
    );
    setActiveComment(null);
    setCommentDrafts({});
  }, [isMarketing, marketingPosts, service?.niceCount, service?.reviewCount, service?.shareCount]);

  if (!record || !service || !agent || !category) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-red-400/70">Xizmat topilmadi.</p>
      </div>
    );
  }

  const getCertificateImage = (serviceId: string, cert: string, idx: number) => {
    let hash = 0;
    const token = `${serviceId}-${cert}-${idx}`;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 47 + token.charCodeAt(i)) % 2147483647;
    }
    const seed = (hash % 900) + 1;
    return `https://source.unsplash.com/800x600/?certificate,document&sig=${seed}`;
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      setNotice("Iltimos, oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setSubmitState("loading");
    setTimeout(() => {
      setSubmitState("success");
      setShowContacts(true);
      setShowChat(true);
      setNotice("Buyurtma qabul qilindi.");
    }, 700);
  };

  const handleOpenChat = () => {
    if (!isAuthenticated) {
      setNotice("Chat uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setShowChat(true);
  };

  const handlePostLike = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextLiked = !item.liked;
        return {
          ...item,
          liked: nextLiked,
          disliked: nextLiked ? false : item.disliked,
          likes: item.likes + (nextLiked ? 1 : -1),
          dislikes: nextLiked && item.disliked ? Math.max(0, item.dislikes - 1) : item.dislikes
        };
      })
    );
  };

  const handlePostDislike = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const nextDisliked = !item.disliked;
        return {
          ...item,
          disliked: nextDisliked,
          liked: nextDisliked ? false : item.liked,
          dislikes: item.dislikes + (nextDisliked ? 1 : -1),
          likes: nextDisliked && item.liked ? Math.max(0, item.likes - 1) : item.likes
        };
      })
    );
  };

  const handlePostShare = (index: number) => {
    setPostStats((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, shares: item.shares + 1 } : item))
    );
  };

  const handleCommentToggle = (index: number) => {
    setActiveComment((prev) => (prev === index ? null : index));
  };

  const handleCommentSubmit = (index: number) => {
    const message = (commentDrafts[index] || "").trim();
    if (!message) return;
    setPostStats((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, comments: item.comments + 1 } : item))
    );
    setCommentDrafts((prev) => ({ ...prev, [index]: "" }));
    setActiveComment(null);
  };

  if (isConstruction) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={service.images[0]?.src || getConstructionFallback(service.id, 0)}
                  alt={service.images[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getConstructionFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {service.images.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {service.images.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-work-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getConstructionFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Usta haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Mutaxassislik</span>
                    <span className="text-slate-100">{agent.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {notice && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {notice}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Usta bilan tafsilotlarni kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isMoving) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={service.images[0]?.src || getMovingFallback(service.id, 0)}
                  alt={service.images[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getMovingFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {service.images.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ko'chirish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {service.images.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-move-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getMovingFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Ko'chiruvchi haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Transport turi</span>
                    <span className="text-slate-100">{agent.movingTruckType || "Ko'rsatilmagan"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Yuk sig'imi</span>
                    <span className="text-slate-100">
                      {agent.movingCapacityTons ? `${agent.movingCapacityTons} tonna` : "Ko'rsatilmagan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {notice && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {notice}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Ko'chirish tafsilotlarini kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isCleaning) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={service.images[0]?.src || getCleaningFallback(service.id, 0)}
                  alt={service.images[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getCleaningFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {service.images.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Tozalash jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {service.images.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-clean-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getCleaningFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Tozalovchi haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Mutaxassislik</span>
                    <span className="text-slate-100">{agent.specialty}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">{agent.region || agent.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Reyting</span>
                    <span className="text-slate-100">{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
                    </span>
                  ))}
                </div>
              </div>

              {notice && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {notice}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Tozalash tafsilotlarini kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isNanny) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800 bg-slate-950 text-slate-100 shadow-2xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 px-6 py-5">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{category.title}</p>
              <h1 className="mt-2 text-2xl font-semibold text-white">{service.title}</h1>
              <p className="text-sm text-slate-400">{groupTitle}</p>
            </div>
            <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-300">
              Reyting: {service.rating.toFixed(1)}
            </div>
          </div>

          <div className="grid gap-6 px-6 py-6 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-slate-800">
                <img
                  src={service.images[0]?.src || getNannyFallback(service.id, 0)}
                  alt={service.images[0]?.alt || service.title}
                  className="h-52 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = getNannyFallback(service.id, 0);
                  }}
                />
              </div>

              <div className="grid gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Narx</span>
                  <span className="text-emerald-200">
                    {formatCount(service.price)} {service.currency} / {service.unit}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Buyurtmalar</span>
                  <span className="text-slate-100">{formatCount(agent.completedOrders ?? service.usedCount)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Baho</span>
                  <span className="text-slate-100">{formatCount(service.reviewCount)}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Xizmat tavsifi</p>
                <p className="mt-2 text-xs text-slate-400">{service.description}</p>
              </div>

              {service.images.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Parvarish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {service.images.slice(1).map((image, idx) => (
                      <img
                        key={`${service.id}-nanny-${idx}`}
                        src={image.src}
                        alt={image.alt || service.title}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = getNannyFallback(service.id, idx + 1);
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {agent.bio && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Enaga tarjimai holi</p>
                  <p className="mt-2 text-xs text-slate-400">{agent.bio}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Enaga haqida</p>
                <div className="mt-3 flex items-center gap-3">
                  <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{agent.name}</p>
                    <p className="text-xs text-slate-400">@{agent.nickname}</p>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Enaga turi</span>
                    <span className="text-slate-100">{nannyTypeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Yosh</span>
                    <span className="text-slate-100">{agent.age ?? "—"} yosh</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Oilaviy holat</span>
                    <span className="text-slate-100">{agent.maritalStatus || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Salomatlik</span>
                    <span className="text-slate-100">{agent.healthStatus || "Ko'rsatilmagan"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Sudlanganlik</span>
                    <span className="text-slate-100">
                      {agent.hasCriminalRecord ? "Sudlangan" : "Sudlanmagan"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tajriba</span>
                    <span className="text-slate-100">{agent.experienceYears} yil</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Hudud</span>
                    <span className="text-slate-100">
                      {agent.regionDetail || agent.region || agent.location}
                    </span>
                  </div>
                </div>
              </div>

              {agent.identityImage && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Shaxsni tasdiqlovchi rasm</p>
                  <div className="mt-3 overflow-hidden rounded-xl border border-slate-800">
                    <img
                      src={agent.identityImage.src}
                      alt={agent.identityImage.alt}
                      className="h-40 w-full bg-slate-950 object-contain"
                      onError={(event) => {
                        event.currentTarget.src = agent.avatar.src;
                      }}
                    />
                  </div>
                </div>
              )}

              {agent.availability && agent.availability.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ishlash vaqti</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.availability.map((slot) => (
                      <span key={`${service.id}-slot-${slot}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {slot}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.careFocus && agent.careFocus.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Parvarish yo'nalishi</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.careFocus.map((item) => (
                      <span key={`${service.id}-focus-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {agent.equipment && agent.equipment.length > 0 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Texnika va jihozlar</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {agent.equipment.map((item) => (
                      <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                <p className="text-sm font-semibold text-slate-100">Malaka va sertifikatlar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {service.certificates.map((cert) => (
                    <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-800 px-3 py-1 text-[11px] text-slate-200">
                      {cert}
                    </span>
                  ))}
                </div>
                {service.certificates.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {service.certificates.map((cert, idx) => (
                      <img
                        key={`${service.id}-cert-${idx}`}
                        src={getCertificateImage(service.id, cert, idx)}
                        alt={`${cert} rasmi`}
                        className="h-24 w-full rounded-lg object-cover"
                        loading="lazy"
                        onError={(event) => {
                          const fallback = getNannyFallback(service.id, idx + 2);
                          if (fallback) {
                            event.currentTarget.src = fallback;
                          }
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {notice && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
                  {notice}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-200"
                >
                  Xabarlashish
                </button>
              </div>

              {showChat && isAuthenticated && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Chat oynasi</p>
                  <p className="mt-2 text-xs text-slate-400">
                    Enagalik tafsilotlarini kelishish uchun yozing.
                  </p>
                  <textarea
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
    );
  }

  if (isMarketing) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{category.title}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card space-y-5 p-5">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <img
                src={agent.avatar.src}
                alt={agent.avatar.alt}
                className="h-72 w-full object-cover"
              />
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Kontentlar</p>
              <p className="mt-1 text-sm text-slate-700">
                Blogerning odatiy postlari va video roliklari.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {marketingPosts.map((post, idx) => {
                const stats = postStats[idx];
                return (
                  <div
                    key={`${service.id}-post-${idx}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
                  >
                    <div className="relative aspect-square">
                      <img src={post.src} alt={post.alt} className="h-full w-full object-cover" />
                      <span className="absolute left-3 top-3 rounded-full bg-white/80 px-2 py-1 text-[10px] text-slate-700">
                        VIDEO
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-2 p-3 text-[11px] text-slate-600">
                      <button
                        type="button"
                        onClick={() => handlePostLike(idx)}
                        className={stats?.liked ? "text-emerald-700" : "text-slate-600"}
                      >
                        👍 {stats?.likes ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePostDislike(idx)}
                        className={stats?.disliked ? "text-rose-600" : "text-slate-600"}
                      >
                        👎 {stats?.dislikes ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCommentToggle(idx)}
                        className="text-slate-600"
                      >
                        💬 {stats?.comments ?? 0}
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePostShare(idx)}
                        className="text-slate-600"
                      >
                        ↗ {stats?.shares ?? 0}
                      </button>
                    </div>
                    {activeComment === idx && (
                      <div className="border-t border-slate-200 p-3">
                        <textarea
                          value={commentDrafts[idx] || ""}
                          onChange={(event) =>
                            setCommentDrafts((prev) => ({ ...prev, [idx]: event.target.value }))
                          }
                          placeholder="Izoh yozing..."
                          className="h-20 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(idx)}
                          className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                        >
                          Izoh yuborish
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <aside className="card space-y-4 p-5">
            <div className="flex items-center gap-3">
              <img
                src={agent.avatar.src}
                alt={agent.avatar.alt}
                className="h-12 w-12 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                <p className="text-xs text-slate-700">@{agent.nickname}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <p>Kontent yo'nalishi: {agent.specialty}</p>
              <p>Manzil: {agent.region || agent.location}</p>
              <p>Tajriba: {agent.experienceYears} yil</p>
              <p>
                Tarif: {agent.bio || "Bloger o'z kontenti va auditoriyasi haqida qisqa ma'lumot beradi."}
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-[11px] text-slate-700">
              <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                Reyting: {agent.rating.toFixed(1)}/5
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                Layklar: {formatCount(agent.niceCount)}
              </span>
              <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                Ulashish: {formatCount(agent.shareCount)}
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
              <p className="font-semibold text-slate-900">Bog'lanish</p>
              {showContacts ? (
                <>
                  {agent.contactPhone && <p>Tel: {agent.contactPhone}</p>}
                  {agent.contactTelegram && <p>Telegram: {agent.contactTelegram}</p>}
                </>
              ) : (
                <p className="text-slate-600">Kontaktlar buyurtmadan keyin ko'rinadi.</p>
              )}
            </div>

            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOrder}
                disabled={submitState === "loading"}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
              </button>
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
              >
                Xabarlashish
              </button>
            </div>

            {showChat && isAuthenticated && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Chat oynasi</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Bloger bilan reklamani kelishish uchun yozing.
                </p>
                <textarea
                  placeholder="Xabaringiz..."
                  className="mt-2 h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"
                />
                <button
                  type="button"
                  className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                >
                  Xabar yuborish
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isConsulting) {
    const consultingFormat = agent.consultationFormats?.length
      ? agent.consultationFormats
      : ["Online", "Offline"];
    const consultingDurations = agent.consultationDurations?.length
      ? agent.consultationDurations
      : ["30 min", "60 min"];
    const consultingLanguages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const consultingPackages = agent.consultationPackages?.length
      ? agent.consultationPackages
      : ["1 martalik", "Paket"];

    const mustHave = [
      "Kamida 1-3 yil real tajriba",
      "O'zbekiston-Koreya tizimini bilish",
      "Aniq yo'nalish bo'yicha ixtisos",
      "Koreys yoki ingliz tili (o'rta daraja)",
      "Mas'uliyat va halol maslahat"
    ];
    const niceToHave = [
      "Koreyada yashagan yoki ishlagan bo'lish",
      "TOPIK yoki sertifikat bilan tajriba",
      "Oldingi mijozlardan real natijalar",
      "Online konsultatsiya tajribasi"
    ];
    const forbidden = [
      "Noto'g'ri va'dalar (100% kafolat)",
      "Rasmiy bo'lmagan maslahatlar",
      "Mijoz hujjatlarini suiste'mol qilish",
      "Oldindan pul olish taqiqlanadi"
    ];
    const howItWorks = [
      "So'rov yuborasiz",
      "Konsultant bog'lanadi",
      "Aniq yo'l xarita olasiz"
    ];
    const includes = [
      "Muammo tahlili va yo'nalish",
      "Qadam-baqadam reja",
      "Qisqa xulosa va keyingi bosqich"
    ];
    const faq = [
      {
        q: "Natija kafolatlanadimi?",
        a: "Yo'q, faqat aniq yo'l xarita va maslahat beriladi."
      },
      {
        q: "Qanday tayyorlanaman?",
        a: "Savollar ro'yxati va mavjud hujjatlarni tayyorlang."
      },
      {
        q: "Hujjatlar kerakmi?",
        a: "Bosqichga qarab minimal hujjatlar talab qilinadi."
      }
    ];

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{category.title}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card space-y-5 p-5">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Konsultatsiya formati</p>
              <div className="flex flex-wrap gap-2">
                {consultingFormat.map((item) => (
                  <span key={`format-${item}`} className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {consultingDurations.map((item) => (
                  <span key={`duration-${item}`} className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {consultingLanguages.map((item) => (
                  <span key={`lang-${item}`} className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {consultingPackages.map((item) => (
                  <span key={`pack-${item}`} className="rounded-full bg-white px-3 py-1 text-[11px] text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Konsultant haqida</p>
              <div className="mt-3 flex items-center gap-3">
                <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-[11px] text-slate-600">{agent.specialty}</p>
                </div>
              </div>
              <div className="mt-3 space-y-2 text-[11px] text-slate-600">
                <p>Tajriba: {agent.experienceYears} yil</p>
                <p>Asosiy yutuq: {agent.achievement || "Koreya bozorida amaliy tajriba"}</p>
                <p>Reyting: {agent.rating.toFixed(1)} / 5</p>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Talablar</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                {mustHave.map((item) => (
                  <span key={`must-${item}`}>{item}</span>
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">Afzal talablar</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                {niceToHave.map((item) => (
                  <span key={`nice-${item}`}>{item}</span>
                ))}
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-900">Taqiqlanadi</p>
              <div className="mt-2 grid gap-2 text-[11px] text-rose-600">
                {forbidden.map((item) => (
                  <span key={`no-${item}`}>{item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Qanday ishlaydi?</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                {howItWorks.map((item, idx) => (
                  <span key={`step-${item}`}>{idx + 1}. {item}</span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Narx va qiymat</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {formatCount(service.price)} {service.currency} / {service.unit}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                {includes.map((item) => (
                  <span key={`inc-${item}`} className="rounded-full bg-white px-3 py-1">
                    {item}
                  </span>
                ))}
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  Yashirin to'lov yo'q
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">FAQ</p>
              <div className="mt-2 grid gap-3 text-[11px] text-slate-600">
                {faq.map((item) => (
                  <div key={item.q}>
                    <p className="font-semibold text-slate-900">{item.q}</p>
                    <p className="mt-1">{item.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="card space-y-4 p-5">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Konsultant bilan bog'lanish</p>
              <div className="mt-2 space-y-2 text-[11px] text-slate-600">
                <p>Manzil: {agent.region || agent.location}</p>
                {agent.languages && agent.languages.length > 0 && (
                  <p>Til: {agent.languages.join(", ")}</p>
                )}
                {agent.audiences && agent.audiences.length > 0 && (
                  <p>Kim uchun: {agent.audiences.join(", ")}</p>
                )}
              </div>
            </div>

            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOrder}
                disabled={submitState === "loading"}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {submitState === "loading" ? "Yuborilmoqda..." : "Hozir yozilish"}
              </button>
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
              >
                Bepul 10 daqiqa baholash
              </button>
            </div>

            {showChat && isAuthenticated && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Chat oynasi</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Konsultatsiya bo'yicha savollaringizni yozing.
                </p>
                <textarea
                  placeholder="Xabaringiz..."
                  className="mt-2 h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"
                />
                <button
                  type="button"
                  className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                >
                  Xabar yuborish
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isTranslation) {
    const translationCategoryLabels: Record<string, string> = {
      "translation-official": "Rasmiy hujjatlar",
      "translation-education": "Ta'lim hujjatlari",
      "translation-visa": "Viza va migratsiya",
      "translation-business": "Biznes & yuridik",
      "translation-medical": "Tibbiy tarjima",
      "translation-technical": "Texnik & IT",
      "translation-oral": "Og'zaki tarjima",
      "translation-personal": "Shaxsiy tarjima"
    };
    const translationCategory =
      translationCategoryLabels[service.subCategory || ""] || "Tarjimonlik xizmati";
    const translationPair = `${service.sourceLang || "—"} ↔ ${service.targetLang || "—"}`;
    const avgTime =
      service.translationSpeed === "shoshilinch" ? "6-12 soat" : "1-2 kun";
    const modeLabel = service.translationMode === "oral" ? "Og'zaki" : "Yozma";
    const notarizationLabel =
      typeof service.notarization === "boolean" ? (service.notarization ? "Ha" : "Yo'q") : "—";
    const samples = service.images.length > 0 ? service.images : getCategoryImagePool("translation");
    const reviews = [
      {
        name: "Dilorom",
        type: "Talaba",
        text: "Hujjatlarimni tez va aniq tarjima qilib berdi."
      },
      {
        name: "Azamat",
        type: "Ishchi",
        text: "Koreys tili bo'yicha og'zaki tarjima juda professional bo'ldi."
      },
      {
        name: "Zarina",
        type: "Ota-ona",
        text: "Maxfiylikka rioya qilgani uchun rahmat."
      }
    ];

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{translationCategory}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="card space-y-5 p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-14 w-14 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-[11px] text-slate-600">{translationCategory}</p>
                  <p className="text-[11px] text-slate-500">{translationPair}</p>
                </div>
              </div>
              <div className="text-right text-xs text-slate-700">
                <p>⭐ {agent.rating.toFixed(1)} ({formatCount(agent.reviewCount)} baho)</p>
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="mt-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Qisqa profil</p>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>Tarjimalar soni: {formatCount(service.usedCount)}+</span>
                <span>Ish tillari: {translationPair}</span>
                <span>Tasdiqlar: ✅ ID / ✅ Email / ✅ Hujjat</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Xizmat turlari</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {agent.services.map((item) => {
                  const cat = translationCategoryLabels[item.subCategory || ""] || "Tarjimonlik";
                  const duration = item.translationSpeed === "shoshilinch" ? "6-12 soat" : "1-2 kun";
                  return (
                    <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-slate-900">{cat}</p>
                      <p className="mt-1 text-[11px] text-slate-600">
                        {formatCount(item.price)} {item.currency} / {item.unit}
                      </p>
                      <p className="text-[11px] text-slate-500">O'rtacha muddat: {duration}</p>
                      <button
                        type="button"
                        onClick={handleOrder}
                        className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                      >
                        Buyurtma berish
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Ixtisos & Tajriba</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                <span>Hujjatlar: pasport, diplom, viza, shartnoma</span>
                <span>Sohalar: ta'lim, migratsiya, biznes, tibbiy</span>
                <span>Murakkab ishlar: shoshilinch va notarial topshiriqlar</span>
                <span>Formatlar: {service.translationFormat || "PDF"} / Scan / Original</span>
                <span>Maxfiylik: default ON</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Ish namunalari</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {samples.slice(0, 3).map((sample, idx) => (
                  <div key={`${service.id}-sample-${idx}`} className="relative overflow-hidden rounded-xl border border-slate-200">
                    <img src={sample.src} alt={sample.alt} className="h-32 w-full object-cover blur-sm" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] text-slate-700">
                        Namuna ko'rish
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[11px] text-slate-500">Maxfiylik siyosati asosida blur qilingan.</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Ishlash tartibi</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                <span>1. Hujjat yuklaysiz</span>
                <span>2. Narx va muddat tasdiqlanadi</span>
                <span>3. Tarjima topshiriladi</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Baholar & Sharhlar</p>
              <p className="mt-1 text-[11px] text-slate-600">
                O'rtacha reyting: {agent.rating.toFixed(1)} ({formatCount(agent.reviewCount)} baho)
              </p>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600">
                {reviews.map((review) => (
                  <div key={review.name} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <p className="font-semibold text-slate-800">{review.name} · {review.type}</p>
                    <p className="mt-1">{review.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <aside className="card space-y-4 p-5 lg:sticky lg:top-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">Narx siyosati & qo'shimcha</p>
              <p className="mt-1 text-lg font-semibold text-emerald-700">
                {formatCount(service.price)} {service.currency} / {service.unit}
              </p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                <span>Tezlik: {service.translationSpeed === "shoshilinch" ? "Shoshilinch" : "Oddiy"}</span>
                <span>Notarial tasdiq: {notarizationLabel}</span>
                <span>Format: {service.translationFormat || "PDF"}</span>
                <span>Tur: {modeLabel}</span>
                <span>Tahrir: kiritilgan</span>
                <span>Maxfiylik: default ON</span>
                <span>Har buyurtma loglanadi</span>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-700">
              <p className="text-sm font-semibold text-slate-900">FAQ</p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600">
                <div>
                  <p className="font-semibold text-slate-800">Original hujjat kerakmi?</p>
                  <p className="mt-1">Scan yoki PDF yetarli, original faqat notarial bo'lsa.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Maxfiylik bormi?</p>
                  <p className="mt-1">Ha, maxfiylik default ON.</p>
                </div>
                <div>
                  <p className="font-semibold text-slate-800">Tahrir necha marta?</p>
                  <p className="mt-1">1 marta bepul tahrir kiritiladi.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOrder}
                disabled={submitState === "loading"}
                className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
              >
                {submitState === "loading" ? "Yuborilmoqda..." : "Hujjat yuklab buyurtma berish"}
              </button>
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
              >
                Savol berish
              </button>
            </div>

            {showChat && isAuthenticated && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">Chat oynasi</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  Tarjima bo'yicha savollaringizni yozing.
                </p>
                <textarea
                  placeholder="Xabaringiz..."
                  className="mt-2 h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"
                />
                <button
                  type="button"
                  className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
                >
                  Xabar yuborish
                </button>
              </div>
            )}
          </aside>
        </div>

        <div className="fixed bottom-4 left-0 right-0 z-40 flex justify-center px-4 lg:hidden">
          <div className="flex w-full max-w-md items-center justify-between gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs shadow-lg">
            <span className="text-slate-600">{formatCount(service.price)} {service.currency} / {service.unit}</span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleOrder}
                className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
              >
                Buyurtma
              </button>
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] text-slate-700"
              >
                Savol
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-6 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
        <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
        <p className="text-sm text-slate-700">{category.title}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="card p-5">
          {isConstruction ? (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Narx</span>
                <span className="font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency} / {service.unit}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Buyurtmalar soni</span>
                <span className="font-semibold text-slate-900">
                  {formatCount(agent.completedOrders ?? service.usedCount)}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Baho</span>
                <span className="font-semibold text-slate-900">{formatCount(service.reviewCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="sr-only">Baho</span>
                <span className="text-lg text-amber-700">{renderStars(service.rating)}</span>
              </div>
            </div>
          ) : (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Narx</span>
                <span className="font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency} / {service.unit}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Transport turi</span>
                <span className="font-semibold text-slate-900">
                  {vehicleClassLabel(agent.vehicleClass) || "Ko'rsatilmagan"}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Model.</span>
                <span className="font-semibold text-slate-900">{agent.vehicleModel || "Ko'rsatilmagan"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">O'rinlar</span>
                <span className="font-semibold text-slate-900">{agent.seatCount ?? "Noma'lum"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Davlat raqami</span>
                <span className="font-semibold text-slate-900">{agent.vehiclePlate || "Ko'rsatilmagan"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Foydalanganlar</span>
                <span className="font-semibold text-slate-900">{formatCount(service.usedCount)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-800">Baho</span>
                <span className="font-semibold text-slate-900">{formatCount(service.reviewCount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="sr-only">Baho</span>
                <span className="text-lg text-amber-700">{renderStars(service.rating)}</span>
              </div>
            </div>
          )}

          {!isConstruction && agent.vehicleOptions && agent.vehicleOptions.length > 0 && (
            <div className="mt-4 text-sm text-slate-800">
              <p className="text-xs uppercase tracking-wide text-sky-900">Qisqacha opsionlar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {agent.vehicleOptions.map((item) => (
                  <span key={`${service.id}-${item}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 text-sm text-slate-800">
            <p className="text-xs uppercase tracking-wide text-sky-900">Tavsif</p>
            <p className="mt-2 leading-relaxed">{service.description}</p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-slate-700">
            {service.certificates.map((cert) => (
              <span key={`${service.id}-${cert}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                {cert}
              </span>
            ))}
          </div>

          {isConstruction && agent.equipment && agent.equipment.length > 0 && (
            <div className="mt-4 text-sm text-slate-800">
              <p className="text-xs uppercase tracking-wide text-sky-900">Texnika va jihozlar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px]">
                {agent.equipment.map((item) => (
                  <span key={`${service.id}-eq-${item}`} className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 space-y-3">
            {isConstruction ? (
              <div>
                <p className="text-xs uppercase tracking-wide text-sky-900">Ish jarayoni</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {service.images.map((image, idx) => (
                    <img
                      key={`${service.id}-work-${idx}`}
                      src={image.src}
                      alt={image.alt}
                      className="h-28 w-full rounded-lg object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              </div>
            ) : (
              <>
                {exteriorImages.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-900">Tashqi ko'rinish</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {exteriorImages.map((image, idx) => (
                        <img
                          key={`${service.id}-ext-${idx}`}
                          src={image.src}
                          alt={image.alt}
                          className="h-28 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
                {interiorImages.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wide text-sky-900">Ichki salon</p>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {interiorImages.map((image, idx) => (
                        <img
                          key={`${service.id}-int-${idx}`}
                          src={image.src}
                          alt={image.alt}
                          className="h-28 w-full rounded-lg object-cover"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        <aside className="card p-5">
          <div className="flex items-center gap-3">
            <img
              src={agent.avatar.src}
              alt={agent.avatar.alt}
              className="h-12 w-12 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
              <p className="text-xs text-slate-700">@{agent.nickname}</p>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs text-slate-700">
            <p>{agent.specialty}</p>
            <p>Manzil: {agent.location}</p>
            {(agent.region || agent.distanceKm) && (
              <p>
                Hudud: {agent.region || "—"} · {agent.distanceKm ?? "—"} km
              </p>
            )}
            <p>Tajriba: {agent.experienceYears} yil</p>
            {agent.gender && <p>Jinsi: {agent.gender}</p>}
            {isConstruction && agent.equipment && agent.equipment.length > 0 && (
              <p>Texnika: {agent.equipment.join(", ")}</p>
            )}
            {isConstruction && (
              <p>Buyurtmalar: {formatCount(agent.completedOrders ?? service.usedCount)}</p>
            )}
            {showContacts ? (
              <>
                {agent.contactPhone && <p>Tel: {agent.contactPhone}</p>}
                {agent.contactTelegram && <p>Telegram: {agent.contactTelegram}</p>}
              </>
            ) : (
              (agent.contactPhone || agent.contactTelegram) && (
                <p className="text-slate-600">Kontaktlar buyurtmadan keyin ko'rinadi.</p>
              )
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-800">
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Yulduz: {agent.rating.toFixed(1)}/5
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Nice ({formatCount(agent.niceCount)})
            </span>
            <span className="rounded-full bg-slate-200 px-2 py-1 text-slate-900">
              Ulashish ({formatCount(agent.shareCount)})
            </span>
          </div>

          {notice && (
            <p className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200/70">
              {notice}
            </p>
          )}

          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
            <p className="font-semibold text-slate-900">Foydalanganlar uchun</p>
            <p className="mt-1 text-[11px] text-slate-700">
              Faqat ushbu agent xizmatidan foydalanganlar minnatdorchilik yoki shikoyat qila oladi.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={!service.canRate}
                className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-900 disabled:opacity-50"
              >
                Minnatdorchilik bildirish
              </button>
              <button
                type="button"
                disabled={!service.canRate}
                className="rounded-full bg-rose-100 px-3 py-1 text-[11px] text-rose-900 disabled:opacity-50"
              >
                Shikoyat qilish
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOrder}
            disabled={submitState === "loading"}
            className="mt-4 w-full rounded-lg bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950/70 shadow hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            {submitState === "loading" ? "Yuborilmoqda..." : "Buyurtma berish"}
          </button>
          <button
            type="button"
            onClick={handleOpenChat}
            className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
          >
            Xabarlashish
          </button>
          {showChat && isAuthenticated && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800">
              <p className="font-semibold text-slate-900">Chat oynasi</p>
              <p className="mt-1 text-[11px] text-slate-700">
                Usta bilan tafsilotlarni kelishish uchun yozing.
              </p>
              <textarea
                placeholder="Xabaringiz..."
                className="mt-2 h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800"
              />
              <button
                type="button"
                className="mt-2 rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
              >
                Xabar yuborish
              </button>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
