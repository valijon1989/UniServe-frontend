"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  getCategoryImagePool,
  serviceCatalog,
  type ServiceAgent,
  type ServiceCategory,
  type ServiceItem
} from "@/data/serviceCatalog";
import { useAuthStore } from "@/store/auth";
import { getServiceById, type TrendService } from "@/api/services";
import { normalizeImageUrl } from "@/lib/imageUrl";

type ServiceRecord = {
  service: ServiceItem;
  agent: ServiceAgent;
  category: ServiceCategory;
  groupTitle: string;
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const ServiceImageGrid = ({ images }: { images: { src: string; alt: string }[] }) => (
  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {images.map((image) => (
      <img
        key={`service-img-${image.src}`}
        src={image.src}
        alt={image.alt}
        className="h-40 w-full rounded-xl object-cover"
        loading="lazy"
      />
    ))}
  </div>
);
const hashValue = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return hash;
};
const convertCurrency = (price: number, currency: string, target: "UZS" | "KRW") => {
  if (currency === target) return { amount: price, label: currency };
  const uzsPerKrw = 9.5;
  if (currency === "UZS" && target === "KRW") {
    return { amount: Math.max(1, Math.round(price / uzsPerKrw)), label: target };
  }
  if (currency === "KRW" && target === "UZS") {
    return { amount: Math.round(price * uzsPerKrw), label: target };
  }
  return { amount: price, label: currency };
};
const getAvailabilityLabel = (agent: ServiceAgent) => {
  const options = [
    { id: "today", label: "Bugun bo'sh" },
    { id: "48h", label: "48 soat ichida" },
    { id: "soon", label: "Tez orada" }
  ];
  const seed = hashValue(agent.id || agent.name);
  return options[seed % options.length];
};

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
const OBJECT_ID_RE = /^[a-fA-F0-9]{24}$/;
const FALLBACK_CATEGORY_BY_SERVICE_ID: Record<string, string> = {
  "build-brick-1": "construction",
  "build-brick-2": "construction",
  "build-brick-3": "construction"
};

const normalizeCatalogImageSrc = (
  src: string | undefined,
  serviceId: string,
  imageIndex: number,
  fallbackCategory: string
) => {
  const raw = (src || "").trim();
  if (!raw) {
    const pool = getCategoryImagePool(fallbackCategory);
    return pool[imageIndex % pool.length]?.src || "/placeholder.png";
  }
  if (!raw.startsWith("/images/remote/remote-")) return raw;

  const match = raw.match(/remote-(\d{4})\.jpg$/i);
  if (!match) return "/placeholder.png";
  const pool = getCategoryImagePool(fallbackCategory);
  const remoteNumber = Number(match[1]);
  const safeIndex = Number.isFinite(remoteNumber) ? remoteNumber % pool.length : imageIndex % pool.length;
  return pool[safeIndex]?.src || "/placeholder.png";
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
  const searchParams = useSearchParams();
  const routeId = useMemo(() => String(params?.id || ""), [params]);
  const [apiService, setApiService] = useState<TrendService | null>(null);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<"idle" | "loading" | "success">("idle");
  const [showChat, setShowChat] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [matchTopic, setMatchTopic] = useState("");
  const [matchDescription, setMatchDescription] = useState("");
  const [matchLanguage, setMatchLanguage] = useState("UZ");
  const [matchDeadline, setMatchDeadline] = useState("");
  const [matchFormat, setMatchFormat] = useState("chat");
  const [matchConsent, setMatchConsent] = useState(false);
  const [matchStatus, setMatchStatus] = useState<"idle" | "sent" | "accepted" | "declined" | "need">("idle");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [consultingCurrency, setConsultingCurrency] = useState<"UZS" | "KRW">("UZS");
  const [translationUploadOpen, setTranslationUploadOpen] = useState(false);
  const [translationStep, setTranslationStep] = useState(1);
  const [translationFiles, setTranslationFiles] = useState<Array<{ file: File; note: string }>>([]);
  const [translationOfficialChoice, setTranslationOfficialChoice] = useState("oddiy");
  const [translationSpeedChoice, setTranslationSpeedChoice] = useState("normal");
  const [translationExtraNote, setTranslationExtraNote] = useState("");
  const [translationConsent, setTranslationConsent] = useState(false);
  const [psychologyModalOpen, setPsychologyModalOpen] = useState(false);
  const [psychologyConcern, setPsychologyConcern] = useState("");
  const [psychologyFormat, setPsychologyFormat] = useState("chat");
  const [psychologyFiles, setPsychologyFiles] = useState<File[]>([]);
  const [sportFiles, setSportFiles] = useState<File[]>([]);
  const [legalRequestOpen, setLegalRequestOpen] = useState(false);
  const [legalBrief, setLegalBrief] = useState("");
  const [legalJurisdiction, setLegalJurisdiction] = useState("UZ");
  const [legalServiceType, setLegalServiceType] = useState("Og'zaki maslahat");
  const [legalDeadline, setLegalDeadline] = useState("");
  const [legalFiles, setLegalFiles] = useState<File[]>([]);
  const [legalStatus, setLegalStatus] = useState<"sent" | "accepted" | "review" | "answered" | "closed">("sent");
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (timeZone.includes("Seoul")) {
      setConsultingCurrency("KRW");
    }
  }, []);

  useEffect(() => {
    if (!searchParams) return;
    if (searchParams.get("upload") === "1") {
      setTranslationUploadOpen(true);
      setTranslationStep(1);
    }
    if (searchParams.get("secure") === "1") {
      setPsychologyModalOpen(true);
    }
  }, [searchParams]);

  const record = useMemo(() => findServiceById(routeId), [routeId]);

  const service = record?.service;
  const agent = record?.agent;
  const category = record?.category;
  const groupTitle = record?.groupTitle ?? "";
  const isConstruction = category?.id === "construction";
  const isMoving = category?.id === "moving";
  const isCleaning = category?.id === "cleaning";
  const isNanny = category?.id === "nanny";
  const isMarketing = category?.id === "marketing";
  const isConsulting = category?.id === "consulting";
  const isTranslation = category?.id === "translation";
  const isPsychology = category?.id === "psychology";
  const isLegal = category?.id === "legal";
  const isSport = category?.id === "sport";
  const fallbackCategoryId = category?.id || FALLBACK_CATEGORY_BY_SERVICE_ID[service?.id || ""] || "construction";
  const serviceImages = useMemo(
    () =>
      (service?.images || []).map((image, idx) => ({
        ...image,
        src: normalizeCatalogImageSrc(image?.src, service?.id || routeId, idx, fallbackCategoryId)
      })),
    [fallbackCategoryId, routeId, service?.id, service?.images]
  );
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
    const images = serviceImages ?? [];
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
  }, [isMarketing, marketingPool, service?.id, serviceImages]);

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

  useEffect(() => {
    if (!routeId) return;
    if (!OBJECT_ID_RE.test(routeId)) {
      setApiService(null);
      setApiError(null);
      setApiLoading(false);
      return;
    }
    let active = true;
    setApiLoading(true);
    setApiError(null);
    getServiceById(routeId)
      .then((data) => {
        if (!active) return;
        setApiService(data);
      })
      .catch(() => {
        if (!active) return;
        setApiService(null);
        setApiError("Xizmat topilmadi.");
      })
      .finally(() => {
        if (active) setApiLoading(false);
      });
    return () => {
      active = false;
    };
  }, [routeId]);

  if (apiLoading && !apiService && !record) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      </div>
    );
  }

  if (apiService) {
    const agentName = apiService.createdBy?.name || "Agent";
    const agentId = apiService.createdBy?._id;
    const apiImage =
      normalizeImageUrl((apiService as any)?.coverImageUrl)
      || normalizeImageUrl((apiService as any)?.images?.[0])
      || "/fallback/service.png";
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10">
        <Link href="/services" className="text-xs text-sky-400">
          Xizmatlar ro'yxatiga qaytish
        </Link>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
          <h1 className="text-2xl font-semibold text-slate-50">{apiService.title}</h1>
          <p className="mt-2 text-sm text-slate-400">{apiService.description || "Tavsif mavjud emas."}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
            <span className="rounded-full bg-slate-900 px-3 py-1">
              Kategoriya: {apiService.category || "—"}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1">
              Lokatsiya: {apiService.location || "—"}
            </span>
            <span className="rounded-full bg-slate-900 px-3 py-1">
              {apiService.hourlyRate ?? "—"} {apiService.currency || ""} / soat
            </span>
            {agentId && (
              <span className="rounded-full bg-slate-900 px-3 py-1">
                Agent: {agentName}
              </span>
            )}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <button className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs text-emerald-100 ring-1 ring-emerald-400/40">
              Buyurtma berish
            </button>
            <button className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200">
              Chat boshlash
            </button>
            {agentId && (
              <Link
                href={`/agents/${agentId}`}
                className="rounded-full border border-slate-700 px-4 py-2 text-xs text-slate-200"
              >
                Agent profiliga o‘tish
              </Link>
            )}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6">
          <h2 className="text-lg font-semibold text-slate-100">Xizmat rasmi</h2>
          <img
            src={apiImage}
            alt={apiService.title}
            className="mt-3 h-56 w-full rounded-2xl object-cover"
          />
        </div>
      </div>
    );
  }

  if (!record || !service || !agent || !category) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-red-400/70">{apiError || "Xizmat topilmadi."}</p>
      </div>
    );
  }

  const exteriorImages = serviceImages.slice(0, 2);
  const interiorImages = serviceImages.slice(2);
  const nannyTypeLabels: Record<string, string> = {
    "nanny-child": "Bolalar enagasi",
    "nanny-elderly": "Qariyalar parvarishi",
    "nanny-hospital": "Shifoxona bemorlari",
    "nanny-homecare": "Uy sharoitidagi kasallar",
    "nanny-pet": "Uy hayvonlari enagasi"
  };
  const nannyTypeLabel = nannyTypeLabels[service.subCategory || "nanny-child"] || "Enaga";

  const getCertificateImage = (serviceId: string, cert: string, idx: number) => {
    let hash = 0;
    const token = `${serviceId}-${cert}-${idx}`;
    for (let i = 0; i < token.length; i += 1) {
      hash = (hash * 47 + token.charCodeAt(i)) % 2147483647;
    }
    const seed = (hash % 900) + 1;
    return `/placeholder.png`;
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

  const handleLegalRequestOpen = () => {
    if (!isAuthenticated) {
      setNotice("Maslahat so'rash uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    setNotice(null);
    setLegalRequestOpen(true);
  };

  const handleLegalRequestSubmit = () => {
    if (!isAuthenticated) {
      setNotice("Maslahat so'rash uchun oldin login buling.");
      setTimeout(() => router.push("/login"), 600);
      return;
    }
    if (!legalBrief.trim()) {
      setNotice("Muammo qisqacha tavsifini kiriting.");
      return;
    }
    setNotice("So'rov yuborildi. Huquqshunos javobini kuting.");
    setLegalStatus("sent");
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
                  src={serviceImages[0]?.src || getConstructionFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
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

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
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
                  src={serviceImages[0]?.src || getMovingFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
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

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Ko'chirish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
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
                  src={serviceImages[0]?.src || getCleaningFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
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

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Tozalash jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
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
                  src={serviceImages[0]?.src || getNannyFallback(service.id, 0)}
                  alt={serviceImages[0]?.alt || service.title}
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

              {serviceImages.length > 1 && (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                  <p className="text-sm font-semibold text-slate-100">Parvarish jarayoni</p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    {serviceImages.slice(1).map((image, idx) => (
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
    const consultingTopics = [
      "Ta'lim",
      "Ish & kar'yera",
      "Viza",
      "Til & moslashuv",
      "Biznes",
      "Huquqiy",
      "Sog'liq"
    ];
    const availability = getAvailabilityLabel(agent);
    const responseHours = (hashValue(agent.id) % 8) + 1;
    const trustScore = Math.min(
      100,
      (agent.verified ? 20 : 0) +
        Math.round(service.rating * 4) +
        Math.min(20, Math.floor(service.reviewCount / 5)) +
        Math.min(20, Math.floor((agent.completedOrders ?? service.usedCount) / 6)) +
        Math.min(15, consultingLanguages.length * 3)
    );
    const monthsOnPlatform = Math.max(
      1,
      Math.floor((Date.now() - new Date(service.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30))
    );
    const converted = convertCurrency(service.price, service.currency, consultingCurrency);

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{category.title} · KST</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Service summary</p>
              <p className="text-lg font-semibold text-slate-900">{service.title}</p>
              <p className="text-sm text-slate-600">{service.description}</p>
              <div className="mt-2 grid gap-2 text-sm text-slate-700">
                <span>• Natija: aniq yo'l xarita va tekshiruv ro'yxati</span>
                <span>• Yo'nalish: {category.title}</span>
                <span>• Format: {consultingFormat.join(", ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                {consultingLanguages.map((item) => (
                  <span key={`lang-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
                {consultingDurations.map((item) => (
                  <span key={`duration-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
                {consultingPackages.map((item) => (
                  <span key={`pack-${item}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Konsultant haqida</p>
              <div className="flex items-center gap-3">
                <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-600">{agent.specialty}</p>
                  <p className="text-[11px] text-slate-500">{agent.region || agent.location}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Tasdiqlangan ID</span>
                {service.certificates.length > 0 && (
                  <span className="rounded-full bg-slate-100 px-3 py-1">Sertifikat tekshirildi</span>
                )}
                <span className="rounded-full bg-slate-100 px-3 py-1">Platformada: {monthsOnPlatform} oy</span>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>⭐ Reyting: {agent.rating.toFixed(1)}</span>
                <span>Sharhlar: {formatCount(agent.reviewCount)}</span>
                <span>Tugallangan ish: {formatCount(agent.completedOrders ?? service.usedCount)}</span>
                <span>Javob vaqti: ~{responseHours} soat</span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                  Trust Score: {trustScore}/100
                </span>
                <Link href={`/agents/${agent.id}`} className="text-sky-600 underline">
                  Profilni ko'rish
                </Link>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Moslik tekshiruvi</p>
                <button
                  type="button"
                  onClick={() => setMatchOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {matchOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {matchOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">So'rov mavzusi</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchTopic}
                        onChange={(event) => setMatchTopic(event.target.value)}
                      >
                        <option value="">Tanlang</option>
                        {consultingTopics.map((topic) => (
                          <option key={topic} value={topic}>
                            {topic}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
                      <input
                        type="date"
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchDeadline}
                        onChange={(event) => setMatchDeadline(event.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Til</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchLanguage}
                        onChange={(event) => setMatchLanguage(event.target.value)}
                      >
                        {consultingLanguages.map((lang) => (
                          <option key={lang} value={lang}>
                            {lang}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Format</label>
                      <select
                        className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        value={matchFormat}
                        onChange={(event) => setMatchFormat(event.target.value)}
                      >
                        <option value="chat">Chat</option>
                        <option value="call">Qo'ng'iroq</option>
                        <option value="video">Video</option>
                        <option value="offline">Oflayn</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Qisqa tavsif</label>
                    <textarea
                      value={matchDescription}
                      onChange={(event) => setMatchDescription(event.target.value)}
                      className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                      placeholder="Muammo yoki maqsadni qisqacha yozing..."
                    />
                  </div>
                  <label className="flex items-center gap-2 text-[11px] text-slate-500">
                    <input
                      type="checkbox"
                      checked={matchConsent}
                      onChange={(event) => setMatchConsent(event.target.checked)}
                    />
                    Maxfiylikga roziman
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setMatchStatus("sent")}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                    >
                      So'rov yuborish
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("accepted")}
                      className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-700"
                    >
                      ✅ Qabul qilaman
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("declined")}
                      className="rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs text-rose-700"
                    >
                      ❌ Qabul qila olmayman
                    </button>
                    <button
                      type="button"
                      onClick={() => setMatchStatus("need")}
                      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-700"
                    >
                      🔄 Qo'shimcha ma'lumot kerak
                    </button>
                  </div>
                  {matchStatus !== "idle" && (
                    <p className="rounded-lg bg-slate-50 px-3 py-2 text-[11px] text-slate-600">
                      Status:{" "}
                      {matchStatus === "sent"
                        ? "So'rov yuborildi"
                        : matchStatus === "accepted"
                          ? "Agent qabul qildi"
                          : matchStatus === "declined"
                            ? "Agent mos emas deb topdi"
                            : "Agent qo'shimcha ma'lumot so'radi"}
                    </p>
                  )}
                </div>
              )}
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Narx & mavjudlik</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(converted.amount)} {converted.label}
              </p>
              {service.currency !== consultingCurrency && (
                <p className="text-xs text-slate-500">
                  Asl: {formatCount(service.price)} {service.currency} / {service.unit}
                </p>
              )}
              <p className="text-xs text-slate-600">Mavjudlik: {availability.label}</p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOrder}
                  disabled={submitState === "loading"}
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  {submitState === "loading" ? "Yuborilmoqda..." : "So'rov yuborish"}
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
                <button
                  type="button"
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Qo'ng'iroqni bron qilish
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <button
                  type="button"
                  onClick={() => setConsultingCurrency("UZS")}
                  className={`rounded-full px-3 py-1 ${
                    consultingCurrency === "UZS"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  UZS
                </button>
                <button
                  type="button"
                  onClick={() => setConsultingCurrency("KRW")}
                  className={`rounded-full px-3 py-1 ${
                    consultingCurrency === "KRW"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  KRW
                </button>
                <span className="rounded-full bg-slate-100 px-3 py-1">KST</span>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Chat & hujjatlar</p>
              <p className="text-xs text-slate-600">
                So'rov yaratilgach, chat va fayl almashinuvi xavfsiz saqlanadi.
              </p>
              <textarea
                placeholder="Xabaringiz..."
                className="h-24 w-full rounded-lg border border-slate-200 bg-white p-3 text-xs"
              />
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(event) => setUploadedFiles(Array.from(event.target.files || []))}
                className="w-full text-xs text-slate-600"
              />
              {uploadedFiles.length > 0 && (
                <div className="grid gap-2 text-[11px] text-slate-500">
                  {uploadedFiles.map((file) => (
                    <span key={file.name}>📎 {file.name}</span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Xabar yuborish
              </button>
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Platforma qoidalari</p>
              <p>• Off-platform to'lov taqiqlanadi.</p>
              <p>• Disput/refund siyosati aniq va yozma.</p>
              <p>• Telefon/email yashirish ixtiyoriy, lekin tavsiya etiladi.</p>
              <p className="text-[11px] text-slate-500">
                Visa/huquqiy bo'limda: bu huquqiy vakillik emas.
              </p>
            </div>

            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isLegal) {
    const jurisdictionLabel =
      service.legalJurisdiction === "KR"
        ? "🇰🇷 Koreya"
        : service.legalJurisdiction === "INT"
          ? "Xalqaro"
          : "🇺🇿 O‘zbekiston";
    const formats = service.legalFormat?.length ? service.legalFormat : ["chat"];
    const included = service.legalIncluded?.length ? service.legalIncluded : ["Maslahat va yo'naltirish"];
    const excluded = service.legalExcluded?.length
      ? service.legalExcluded
      : ["Noqonuniy masalalar", "Sudda vakillik"];
    const education = agent.legalEducation?.length ? agent.legalEducation : ["Yurisprudensiya"];
    const specialties = agent.legalSpecialties?.length ? agent.legalSpecialties : [service.legalArea || "Huquqiy"];
    const excludedMatters = agent.legalExcludedMatters?.length
      ? agent.legalExcludedMatters
      : ["Noqonuniy masalalar"];
    const responseTime = service.legalResponseTime || "24 soat ichida";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">Huquqiy maslahat va xizmatlar</h1>
          <p className="text-sm text-slate-700">
            Sertifikatlangan huquqshunoslardan rasmiy va ishonchli maslahatlar.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">{service.title}</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Masala: {service.legalArea || "Huquqiy masala"}</span>
                <span>Yurisdiksiya: {jurisdictionLabel}</span>
                <span>Xizmat turi: {service.legalServiceType || "Maslahat"}</span>
                <span>Format: {formats.join(", ")}</span>
              </div>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Bu xizmat nimani o'z ichiga oladi</p>
                <div className="mt-2 grid gap-1">
                  {included.map((item) => (
                    <span key={`inc-${item}`}>• {item}</span>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-slate-800">Bu xizmat nimani olmaydi</p>
                <div className="mt-2 grid gap-1">
                  {excluded.map((item) => (
                    <span key={`exc-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Huquqshunos profili</p>
              <div className="text-sm text-slate-700">
                <p>Ism: {agent.name}</p>
                <p>Litsenziya raqami: {agent.legalLicenseMasked || "Tekshirilgan"}</p>
                <p>Litsenziya bergan organ: {agent.legalLicenseAuthority || "—"}</p>
                <p>Tajriba: {agent.experienceYears} yil</p>
              </div>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Ta'lim: {education.join(", ")}</span>
                <span>Ixtisosliklar: {specialties.join(", ")}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi ishlarni qabul qilmaydi:
                <div className="mt-2 grid gap-1">
                  {excludedMatters.map((item) => (
                    <span key={`exm-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
              <p className="mt-3 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                🔒 Platforma tomonidan tekshirilgan
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Maslahat so'rash</p>
                <button
                  type="button"
                  onClick={() => setLegalRequestOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {legalRequestOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {legalRequestOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                      Muammo qisqacha tavsifi
                    </label>
                    <textarea
                      value={legalBrief}
                      onChange={(event) => setLegalBrief(event.target.value)}
                      className="mt-2 h-24 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                      placeholder="Masalangizni qisqacha yozing..."
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Yurisdiksiya
                      </label>
                      <select
                        className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                        value={legalJurisdiction}
                        onChange={(event) => setLegalJurisdiction(event.target.value)}
                      >
                        <option value="UZ">🇺🇿 O‘zbekiston</option>
                        <option value="KR">🇰🇷 Koreya</option>
                        <option value="INT">Xalqaro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                        Xizmat turi
                      </label>
                      <select
                        className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                        value={legalServiceType}
                        onChange={(event) => setLegalServiceType(event.target.value)}
                      >
                        <option value="Og'zaki maslahat">Og'zaki maslahat</option>
                        <option value="Yozma huquqiy xulosa">Yozma huquqiy xulosa</option>
                        <option value="Hujjat tayyorlash">Hujjat tayyorlash</option>
                        <option value="Hujjat tekshirish">Hujjat tekshirish</option>
                        <option value="Vakillik">Vakillik</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
                    <input
                      type="date"
                      value={legalDeadline}
                      onChange={(event) => setLegalDeadline(event.target.value)}
                      className="mt-2 w-full rounded-full border border-slate-200 bg-white px-3 py-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Fayl biriktirish</label>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(event) => setLegalFiles(Array.from(event.target.files || []))}
                      className="mt-2 w-full text-xs"
                    />
                    {legalFiles.length > 0 && (
                      <div className="mt-2 grid gap-1 text-[11px] text-slate-500">
                        {legalFiles.map((file) => (
                          <span key={file.name}>📎 {file.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="rounded-lg border border-amber-400/40 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
                    Bu umumiy maslahat bo'lib, sudda vakillikni anglatmaydi.
                  </p>
                  <button
                    type="button"
                    onClick={handleLegalRequestSubmit}
                    className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                  >
                    So'rov yuborish
                  </button>
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Statuslar</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "sent", label: "So'rov yuborildi" },
                  { id: "accepted", label: "Qabul qilindi" },
                  { id: "review", label: "Ko'rib chiqilmoqda" },
                  { id: "answered", label: "Javob berildi" },
                  { id: "closed", label: "Yakunlandi" }
                ].map((step) => (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => setLegalStatus(step.id as typeof legalStatus)}
                    className={`rounded-full px-3 py-1 text-[11px] ${
                      legalStatus === step.id
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {step.label}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500">
                Chat va hujjatlar faqat siz va huquqshunosga ko'rinadi.
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Narx</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency}
                </p>
              </div>
              <p className="text-xs text-slate-500">/{service.unit}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Javob: {responseTime}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Format: {formats.join(", ")}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleLegalRequestOpen}
                  className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Maslahat so'rash
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                To'lov escrow'da. Disput bo'lsa hujjatlar dalil bo'ladi.
              </p>
            </div>
            {notice && (
              <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-800">
                {notice}
              </p>
            )}
          </aside>
        </div>
      </div>
    );
  }

  if (isSport) {
    const sportType = service.sportType || "Sport";
    const sportAudience = service.sportAudience?.length
      ? service.sportAudience
      : agent.audiences?.length
        ? agent.audiences
        : ["Kattalar"];
    const sportFormat = service.sportFormat?.length ? service.sportFormat : ["online"];
    const plan = service.sportPlan?.length ? service.sportPlan : ["Reja", "Progress tracking"];
    const achievements = agent.sportAchievements?.length ? agent.sportAchievements : ["—"];
    const certificates = agent.sportCertificates?.length ? agent.sportCertificates : ["—"];
    const excludedCases = agent.sportExcludedCases?.length ? agent.sportExcludedCases : ["Tibbiy cheklovlar"];
    const duration = service.sportDuration || "60 daqiqa";
    const weekly = service.sportWeeklySessions ? `${service.sportWeeklySessions} marta` : "—";
    const result = service.sportResult || "Individuallik va barqaror natija";
    const location = service.sportLocation || agent.location;
    const gym = service.sportGym || "—";
    const courseModules = service.sportCourseModules || [];
    const courseLength = service.sportCourseLength || "—";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">
            {sportType} · {service.sportLevel || "Daraja"} · {sportFormat.join(", ")}
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {serviceImages.map((image) => (
                  <img
                    key={`sport-img-${image.src}`}
                    src={image.src}
                    alt={image.alt}
                    className="h-40 w-full rounded-xl object-cover"
                    loading="lazy"
                  />
                ))}
              </div>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Sport turi: {sportType}</span>
                <span>Kimlar uchun: {sportAudience.join(", ")}</span>
                <span>Daraja: {service.sportLevel || "Boshlovchi"}</span>
                <span>Format: {sportFormat.join(", ")}</span>
                <span>Trening davomiyligi: {duration}</span>
                <span>Haftasiga: {weekly}</span>
              </div>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-semibold text-slate-800">Trening rejasi</p>
                <div className="mt-2 grid gap-1">
                  {plan.map((item) => (
                    <span key={`sport-plan-${item}`}>• {item}</span>
                  ))}
                </div>
                <p className="mt-3 font-semibold text-slate-800">Kutiladigan natija</p>
                <p className="mt-1">{result}</p>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Murabbiy profili</p>
              <div className="flex items-center gap-3">
                <img
                  src={agent.avatar.src}
                  alt={agent.avatar.alt}
                  className="h-12 w-12 rounded-full object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-xs text-slate-600">{agent.specialty}</p>
                </div>
              </div>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>O‘quvchilar: {agent.sportStudentsCount ?? 0}</span>
                <span>Sertifikatlar: {certificates.join(", ")}</span>
                <span>Yutuqlar: {achievements.join(", ")}</span>
              </div>
              <p className="text-xs text-slate-600">
                Murabbiylik falsafasi: {agent.sportPhilosophy || "Natija — intizom natijasi."}
              </p>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi holatlarda qabul qilmaydi:
                <div className="mt-2 grid gap-1">
                  {excludedCases.map((item) => (
                    <span key={`sport-ex-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat tafsilotlari</p>
              {service.sportServiceType?.includes("kurs") || service.sportServiceType?.includes("Kurs") ? (
                <div className="grid gap-2 text-sm text-slate-700">
                  <span>Kurs davomiyligi: {courseLength}</span>
                  <span>Kimlar uchun: {sportAudience.join(", ")}</span>
                  <span>Nima o‘rganiladi:</span>
                  <div className="grid gap-1 text-[11px] text-slate-600">
                    {(courseModules.length ? courseModules : ["Modullar mavjud emas"]).map((item) => (
                      <span key={`sport-module-${item}`}>• {item}</span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid gap-2 text-sm text-slate-700">
                  <span>Haftasiga: {weekly}</span>
                  <span>Reja: {plan.join(", ")}</span>
                  <span>Kuzatuv: {service.sportTracking ? "Progress tracking" : "Yo‘q"}</span>
                  <span>Diet tavsiyalari: {service.sportDiet ? "Bor" : "Yo‘q"}</span>
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Online / Offline</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>Online: Video platforma + chat savollar</span>
                <span>Offline: {location} · {gym}</span>
                <span>Jadval: Kelishilgan</span>
              </div>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Chat + fayl almashish</p>
              <textarea
                placeholder="Savolingiz..."
                className="h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
              />
              <input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.mp4"
                onChange={(event) => setSportFiles(Array.from(event.target.files || []))}
                className="w-full text-xs text-slate-600"
              />
              {sportFiles.length > 0 && (
                <div className="grid gap-2 text-[11px] text-slate-500">
                  {sportFiles.map((file) => (
                    <span key={file.name}>📎 {file.name}</span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenChat}
                className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
              >
                Xabar yuborish
              </button>
              <p className="text-[11px] text-slate-500">
                Progress uchun rasm/video yuklash mumkin.
              </p>
            </div>
          </section>

          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-600">Narx</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatCount(service.price)} {service.currency}
                </p>
              </div>
              <p className="text-xs text-slate-500">/{service.unit}</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">Davomiylik: {duration}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  Joy: {location}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full bg-sky-600 px-4 py-2 text-xs font-semibold text-white"
                >
                  Yozilish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Kurs tugagach sertifikat va video yozuvlar taqdim etiladi (agar mavjud bo‘lsa).
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (isPsychology) {
    const issueLabels: Record<string, string> = {
      "psy-stress": "Stress va bezovtalik",
      "psy-depression": "Depressiya",
      "psy-family": "Oilaviy munosabatlar",
      "psy-children": "Bolalar psixologiyasi",
      "psy-adaptation": "Moslashuv (Koreya)",
      "psy-trauma": "Travma",
      "psy-confidence": "O'ziga ishonch",
      "psy-burnout": "Kasbiy burnout"
    };
    const formats = agent.consultationFormats?.length ? agent.consultationFormats : ["Chat", "Video"];
    const durations = agent.consultationDurations?.length ? agent.consultationDurations : ["50 daqiqa"];
    const languages = agent.consultationLanguages?.length
      ? agent.consultationLanguages
      : agent.languages?.length
        ? agent.languages
        : ["UZ"];
    const audiences = agent.audiences?.length ? agent.audiences : ["Kattalar"];
    const methods = ["CBT", "Gestalt", "Mindfulness"];
    const boundaries = [
      "Favqulodda holatlarda ishlamaydi",
      "Rasmiy tibbiy tashxis qo'ymaydi",
      "Noqonuniy so'rovlarni qabul qilmaydi"
    ];

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">🔒 Maxfiy va xavfsiz muloqot</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <p className="text-sm text-slate-700">{service.description}</p>
              <div className="grid gap-2 text-sm text-slate-700">
                <span>
                  Muammolar: {issueLabels[service.subCategory || ""] || "Stress, munosabatlar, moslashuv"}
                </span>
                <span>Kimlar uchun: {audiences.join(", ")}</span>
                <span>Formatlar: {formats.join(", ")}</span>
                <span>Sessiya davomiyligi: {durations.join(", ")}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                {languages.map((lang) => (
                  <span key={`psy-lang-${lang}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {lang}
                  </span>
                ))}
              </div>
              <p className="mt-2 rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                🔒 Maxfiylik kafolatlangan
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Psixolog profili</p>
              <p className="text-sm text-slate-600">
                Mutaxassis haqida: {agent.bio || "Yumshoq va professional yondashuv, xavfsiz muloqot muhiti."}
              </p>
              <div className="mt-2 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>✅ Sertifikat tasdiqlangan</span>
                <span>Metodlar: {methods.join(", ")}</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500">
                Qaysi holatlarda ishlamaydi:
                <div className="mt-2 grid gap-1">
                  {boundaries.map((item) => (
                    <span key={`bound-${item}`}>• {item}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Xavfsiz yozish</p>
                <button
                  type="button"
                  onClick={() => setPsychologyModalOpen((prev) => !prev)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {psychologyModalOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {psychologyModalOpen && (
                <div className="space-y-3 text-xs text-slate-600">
                  <textarea
                    value={psychologyConcern}
                    onChange={(event) => setPsychologyConcern(event.target.value)}
                    className="h-24 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    placeholder="Sizni nima bezovta qilmoqda? (ixtiyoriy)"
                  />
                  <select
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                    value={psychologyFormat}
                    onChange={(event) => setPsychologyFormat(event.target.value)}
                  >
                    <option value="chat">Chat</option>
                    <option value="audio">Audio</option>
                    <option value="video">Video</option>
                    <option value="offline">Oflayn</option>
                  </select>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) => setPsychologyFiles(Array.from(event.target.files || []))}
                    className="w-full text-xs"
                  />
                  <p className="text-[11px] text-amber-600">
                    Bu favqulodda holatlar uchun emas. Agar xavf bo'lsa, zudlik bilan mahalliy yordam xizmatiga murojaat qiling.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenChat}
                    className="rounded-full bg-sky-500 px-4 py-2 text-xs text-white"
                  >
                    Suhbatni boshlash
                  </button>
                </div>
              )}
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Sessiya jarayoni</p>
              <div className="grid gap-2 text-[11px]">
                <span>1. Suhbat boshlandi</span>
                <span>2. Sessiya rejalashtirildi</span>
                <span>3. Sessiya o'tkazildi</span>
                <span>4. Yakunlandi</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat butun jarayon davomida ochiq qoladi.
              </p>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Fayllar & tavsiyalar</p>
              <p>PDF mashqlar, tavsiyalar, kundalik topshiriqlar.</p>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
                Watermark + "Faqat user uchun"
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Sessiya</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(service.price)} {service.currency}
              </p>
              <p className="text-xs text-slate-600">Davomiylik: {durations.join(", ")}</p>
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Format</label>
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"
                value={psychologyFormat}
                onChange={(event) => setPsychologyFormat(event.target.value)}
              >
                <option value="chat">Chat</option>
                <option value="audio">Audio</option>
                <option value="video">Video</option>
                <option value="offline">Oflayn</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setPsychologyModalOpen(true)}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Xavfsiz yozish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Chat va fayllar faqat siz va psixologga ko'rinadi.
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (isTranslation) {
    const translationCategoryLabels: Record<string, string> = {
      "translation-official": "Rasmiy hujjatlar",
      "translation-education": "Ta'lim hujjatlari",
      "translation-visa": "Visa / Migratsiya",
      "translation-business": "Biznes",
      "translation-medical": "Tibbiy",
      "translation-technical": "Texnik",
      "translation-oral": "Og'zaki",
      "translation-personal": "Shaxsiy"
    };
    const translationCategory =
      translationCategoryLabels[service.subCategory || ""] || "Tarjimonlik xizmati";
    const translationPair = `${service.sourceLang || "—"} → ${service.targetLang || "—"}`;
    const slaLabel =
      service.translationSpeed === "shoshilinch"
        ? "2-6 soat"
        : hashValue(service.id) % 3 === 0
          ? "24 soat"
          : "2-3 ish kuni";
    const officialTags = [
      service.notarization ? "Notarial" : "Oddiy",
      service.translationFormat === "Original" ? "Muhrli" : "Oddiy"
    ].filter((value, idx, arr) => arr.indexOf(value) === idx);
    const deliveryLabel =
      translationSpeedChoice === "fast" ? "Tezkor: 2-6 soat" : "Oddiy: 2-3 ish kuni";

    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-6 space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-900">{groupTitle}</p>
          <h1 className="text-2xl font-semibold text-slate-900">{service.title}</h1>
          <p className="text-sm text-slate-700">{translationCategory}</p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-4">
            <div className="card space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Tarjimonlik xizmati</p>
                  <h2 className="mt-1 text-lg font-semibold text-slate-900">{service.title}</h2>
                  <p className="text-sm text-slate-600">{translationCategory}</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
                  ⏱ {slaLabel}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="rounded-full bg-slate-100 px-3 py-1">{translationPair}</span>
                {officialTags.map((tag) => (
                  <span key={`tag-${tag}`} className="rounded-full bg-slate-100 px-3 py-1">
                    {tag}
                  </span>
                ))}
                <span className="rounded-full bg-slate-100 px-3 py-1">
                  {service.translationMode === "oral" ? "Og'zaki" : "Yozma"}
                </span>
              </div>
              <p className="text-sm text-slate-600">
                Bu xizmat kimlar uchun: talaba, ishchi, tadbirkor va rasmiy hujjat egalari.
              </p>
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Xizmat rasmlari</p>
              <ServiceImageGrid images={serviceImages} />
            </div>

            <div className="card space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Tarjimon ishonchliligi</p>
              <div className="flex items-center gap-3">
                <img src={agent.avatar.src} alt={agent.avatar.alt} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{agent.name}</p>
                  <p className="text-[11px] text-slate-600">{agent.region || agent.location}</p>
                  <p className="text-[11px] text-slate-500">{(agent.languages || []).join(" · ")}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 text-[11px] text-slate-600 sm:grid-cols-2">
                <span>Tajriba: {agent.experienceYears} yil</span>
                <span>✅ Tasdiqlangan tarjimon</span>
                <span>Reyting: {agent.rating.toFixed(1)}</span>
                <span>Tugallangan: {formatCount(agent.completedOrders ?? service.usedCount)}</span>
                <span>O'rtacha topshirish: {slaLabel}</span>
              </div>
              {service.certificates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  {service.certificates.map((cert) => (
                    <span key={`cert-${cert}`} className="rounded-full bg-slate-100 px-3 py-1">
                      {cert}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="card space-y-3 p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-slate-900">Hujjat yuborish oqimi</p>
                <button
                  type="button"
                  onClick={() => {
                    setTranslationUploadOpen((prev) => !prev);
                    setTranslationStep(1);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-700"
                >
                  {translationUploadOpen ? "Yopish" : "Boshlash"}
                </button>
              </div>
              {translationUploadOpen && (
                <div className="space-y-4 text-xs text-slate-600">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className={`rounded-full px-3 py-1 ${translationStep === 1 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      1-qadam
                    </span>
                    <span className={`rounded-full px-3 py-1 ${translationStep === 2 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      2-qadam
                    </span>
                    <span className={`rounded-full px-3 py-1 ${translationStep === 3 ? "bg-emerald-100 text-emerald-700" : "bg-slate-100"}`}>
                      3-qadam
                    </span>
                  </div>

                  {translationStep === 1 && (
                    <div className="space-y-3">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        onChange={(event) => {
                          const files = Array.from(event.target.files || []);
                          setTranslationFiles(files.map((file) => ({ file, note: "" })));
                        }}
                        className="w-full text-xs"
                      />
                      {translationFiles.length > 0 && (
                        <div className="space-y-2">
                          {translationFiles.map((item, idx) => (
                            <div key={`${item.file.name}-${idx}`} className="rounded-lg border border-slate-200 bg-white p-2">
                              <p className="text-[11px] text-slate-600">📎 {item.file.name}</p>
                              <input
                                value={item.note}
                                onChange={(event) => {
                                  const next = [...translationFiles];
                                  next[idx] = { ...next[idx], note: event.target.value };
                                  setTranslationFiles(next);
                                }}
                                placeholder="Izoh: pasport, diplom..."
                                className="mt-2 w-full rounded-full border border-slate-200 px-3 py-1 text-xs"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setTranslationStep(2)}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                      >
                        Keyingi qadam
                      </button>
                    </div>
                  )}

                  {translationStep === 2 && (
                    <div className="space-y-3">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Rasmiylik</label>
                          <select
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                            value={translationOfficialChoice}
                            onChange={(event) => setTranslationOfficialChoice(event.target.value)}
                          >
                            <option value="oddiy">Oddiy</option>
                            <option value="notarial">Notarial</option>
                            <option value="muhrli">Muhrli</option>
                            <option value="guvohnoma">Guvohnoma bilan</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Tezlik</label>
                          <select
                            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                            value={translationSpeedChoice}
                            onChange={(event) => setTranslationSpeedChoice(event.target.value)}
                          >
                            <option value="normal">Oddiy (2-3 ish kuni)</option>
                            <option value="fast">Tezkor (2-6 soat)</option>
                          </select>
                        </div>
                      </div>
                      <textarea
                        value={translationExtraNote}
                        onChange={(event) => setTranslationExtraNote(event.target.value)}
                        className="h-20 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs"
                        placeholder="Qo'shimcha izoh..."
                      />
                      <button
                        type="button"
                        onClick={() => setTranslationStep(3)}
                        className="rounded-full bg-emerald-500 px-4 py-2 text-xs text-white"
                      >
                        Tasdiqlash
                      </button>
                    </div>
                  )}

                  {translationStep === 3 && (
                    <div className="space-y-3">
                      <p className="text-sm font-semibold text-slate-900">Tasdiqlash</p>
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-600">
                        <p>Narx: {formatCount(service.price)} {service.currency} / {service.unit}</p>
                        <p>Deadline: {deliveryLabel}</p>
                        <p>Rasmiylik: {translationOfficialChoice}</p>
                      </div>
                      <label className="flex items-center gap-2 text-[11px] text-slate-500">
                        <input
                          type="checkbox"
                          checked={translationConsent}
                          onChange={(event) => setTranslationConsent(event.target.checked)}
                        />
                        Maxfiylik roziligi
                      </label>
                      <button
                        type="button"
                        className="rounded-full bg-sky-500 px-4 py-2 text-xs text-white"
                        onClick={handleOrder}
                      >
                        Order yaratish + chat
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="card space-y-2 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Ish jarayoni</p>
              <div className="grid gap-2 text-[11px]">
                <span>✅ Qabul qilindi</span>
                <span>🔄 Tarjima jarayonda</span>
                <span>🧾 Tekshiruv</span>
                <span>📦 Tayyor</span>
              </div>
            </div>

            <div className="card space-y-3 p-5 text-xs text-slate-600">
              <p className="text-sm font-semibold text-slate-900">Natijani topshirish</p>
              <p>Yuklanadigan fayllar: PDF / DOCX</p>
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-center text-[11px] text-slate-500">
                QR CODE (secure download)
              </div>
              <div className="grid gap-1 text-[11px] text-slate-500">
                <span>Tarjimon: {agent.name}</span>
                <span>Sana: {new Date().toLocaleDateString("en-GB")}</span>
                <span>Tarjima ID: {service.id}</span>
                <span>UniServe orqali bajarilgan</span>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="card sticky top-24 space-y-3 p-5">
              <p className="text-sm font-semibold text-slate-900">Narx & deadline</p>
              <p className="text-2xl font-semibold text-emerald-600">
                {formatCount(service.price)} {service.currency}
              </p>
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Deadline</label>
              <select
                className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-xs"
                value={translationSpeedChoice}
                onChange={(event) => setTranslationSpeedChoice(event.target.value)}
              >
                <option value="normal">Oddiy (2-3 ish kuni)</option>
                <option value="fast">Tezkor (2-6 soat)</option>
              </select>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTranslationUploadOpen(true);
                    setTranslationStep(1);
                  }}
                  className="rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Hujjat yuklab berish
                </button>
                <button
                  type="button"
                  onClick={handleOpenChat}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-800"
                >
                  Savol berish
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                To'lov escrow'da, tarjima topshirilgach agentga o'tadi.
              </p>
            </div>

            {showChat && isAuthenticated && (
              <div className="card space-y-2 p-5 text-xs text-slate-600">
                <p className="text-sm font-semibold text-slate-900">Chat</p>
                <textarea
                  placeholder="Xabaringiz..."
                  className="h-20 w-full rounded-lg border border-slate-200 bg-white p-2 text-xs"
                />
                <button
                  type="button"
                  className="rounded-full bg-emerald-500 px-3 py-1 text-[11px] text-white"
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
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceImages.map((image) => (
              <img
                key={`service-img-${image.src}`}
                src={image.src}
                alt={image.alt}
                className="h-40 w-full rounded-xl object-cover"
                loading="lazy"
              />
            ))}
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
                  {serviceImages.map((image, idx) => (
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
