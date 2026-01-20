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

  if (!record) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-red-400/70">Xizmat topilmadi.</p>
      </div>
    );
  }

  const { service, agent, category, groupTitle } = record;
  const exteriorImages = service.images.slice(0, 2);
  const interiorImages = service.images.slice(2);
  const isConstruction = category.id === "construction";
  const isMoving = category.id === "moving";
  const isCleaning = category.id === "cleaning";
  const isNanny = category.id === "nanny";
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
