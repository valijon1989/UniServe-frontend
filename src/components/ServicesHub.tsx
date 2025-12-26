"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getCategoryImagePool,
  serviceCatalog,
  type ServiceAgent,
  type ServiceCatalogGroup
} from "@/data/serviceCatalog";
import {
  taxiClassOptions,
  taxiSeatOptions,
  type TaxiSeatCount,
  type TaxiVehicleClass
} from "@/data/taxiOptions";
import { useRideSocket } from "@/hooks/useRideSocket";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

type ServiceFormState = {
  type: "material" | "spiritual";
  categoryId: string;
  title: string;
  price: string;
  currency: "UZS" | "USD";
  certificates: string;
  description: string;
  images: File[];
  agree: boolean;
};

type DisplayService = {
  displayId: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  unit: string;
  certificates: string[];
  images: { src: string; alt: string }[];
  rating: number;
  reviewCount: number;
  usedCount: number;
  niceCount: number;
  shareCount: number;
  canRate: boolean;
  createdAt: string;
  agent: ServiceAgent;
};

const emptyForm: ServiceFormState = {
  type: "material",
  categoryId: "taxi",
  title: "",
  price: "",
  currency: "UZS",
  certificates: "",
  description: "",
  images: [],
  agree: false
};

const toWordsCount = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const formatCount = (value: number) => value.toLocaleString("en-US");

export function ServicesHub() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const taxiSeatStorageKey = "uniserve_taxi_seat";
  const taxiClassStorageKey = "uniserve_taxi_class";
  const [activeGroup, setActiveGroup] = useState<ServiceCatalogGroup["id"]>("material");
  const [activeCategoryId, setActiveCategoryId] = useState<string>("taxi");
  const [sortMode, setSortMode] = useState<"top" | "new">("top");
  const [currentPage, setCurrentPage] = useState(1);
  const [form, setForm] = useState<ServiceFormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [agentKind, setAgentKind] = useState<"SERVICE" | "SELLER" | null>(null);
  const [agentGroup, setAgentGroup] = useState<"material" | "spiritual" | null>(null);
  const [agentCategory, setAgentCategory] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<"all" | TaxiSeatCount>("all");
  const [selectedClass, setSelectedClass] = useState<"all" | TaxiVehicleClass>("all");
  const { t } = useI18n();
  const { role, isAuthenticated, hydrateFromStorage, token } = useAuthStore();
  const { status: rideSocketStatus, latestRide, sendRideEvent } = useRideSocket({
    token,
    enabled: activeCategoryId === "taxi"
  });

  const getParam = (params: URLSearchParams, key: string) => params.get(key) || "";

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedKind = window.localStorage.getItem("uniserve_agent_kind");
    if (storedKind === "SERVICE" || storedKind === "SELLER") {
      setAgentKind(storedKind);
    } else {
      setAgentKind(null);
    }
    const storedGroup = window.localStorage.getItem("uniserve_agent_group");
    const storedCategory = window.localStorage.getItem("uniserve_agent_category");
    if (storedGroup === "material" || storedGroup === "spiritual") {
      setAgentGroup(storedGroup);
    } else {
      setAgentGroup(null);
    }
    if (storedCategory) {
      setAgentCategory(storedCategory);
    } else {
      setAgentCategory(null);
    }
  }, [isAuthenticated, role]);

  const formGroup = useMemo(
    () => serviceCatalog.find((item) => item.id === form.type) ?? serviceCatalog[0],
    [form.type]
  );

  const group = useMemo(
    () => serviceCatalog.find((item) => item.id === activeGroup) ?? serviceCatalog[0],
    [activeGroup]
  );

  const categories = useMemo(() => group.categories, [group]);

  const activeCategory = useMemo(
    () => group.categories.find((cat) => cat.id === activeCategoryId) ?? group.categories[0],
    [activeCategoryId, group.categories]
  );

  const wordCount = useMemo(() => toWordsCount(form.description), [form.description]);

  const getGroupLabel = (id: ServiceCatalogGroup["id"]) =>
    id === "material" ? t("services.group.material") : t("services.group.spiritual");

  const getGroupDescription = (id: ServiceCatalogGroup["id"]) =>
    id === "material" ? t("services.group.material.desc") : t("services.group.spiritual.desc");

  const getCategoryLabel = (id: string, fallback: string) => {
    const map: Record<string, string> = {
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
    return map[id] || fallback;
  };

  const getCategoryDescription = (id: string, fallback: string) => {
    const map: Record<string, string> = {
      taxi: t("services.category.taxi.desc"),
      delivery: t("services.category.delivery.desc"),
      technical: t("services.category.technical.desc"),
      construction: t("services.category.construction.desc"),
      moving: t("services.category.moving.desc"),
      cleaning: t("services.category.cleaning.desc"),
      nanny: t("services.category.nanny.desc"),
      marketing: t("services.category.marketing.desc"),
      employment: t("services.category.employment.desc"),
      education: t("services.category.education.desc"),
      consulting: t("services.category.consulting.desc"),
      translation: t("services.category.translation.desc"),
      psychology: t("services.category.psychology.desc"),
      legal: t("services.category.legal.desc"),
      sport: t("services.category.sport.desc")
    };
    return map[id] || fallback;
  };

  const handleFormChange = <K extends keyof ServiceFormState>(key: K, value: ServiceFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormError(null);
  };

  useEffect(() => {
    if (!formGroup.categories.find((cat) => cat.id === form.categoryId)) {
      setForm((prev) => ({ ...prev, categoryId: formGroup.categories[0]?.id || "" }));
    }
  }, [form.categoryId, formGroup.categories]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const errors: string[] = [];
    if (!form.title.trim()) errors.push(t("services.add.errors.name"));
    if (!form.categoryId) errors.push(t("services.add.errors.category"));
    if (!form.price || Number(form.price) <= 0) errors.push(t("services.add.errors.price"));
    if (wordCount === 0 || wordCount > 500) errors.push(t("services.add.errors.description"));
    if (!form.certificates.trim()) errors.push(t("services.add.errors.cert"));
    if (form.images.length < 3 || form.images.length > 20) {
      errors.push(t("services.add.errors.images"));
    }
    if (!form.agree) errors.push(t("services.add.errors.agree"));

    if (errors.length > 0) {
      setFormError(errors[0]);
      return;
    }

    setFormSuccess(t("services.add.success"));
    setForm({
      ...emptyForm,
      type: form.type,
      categoryId: formGroup.categories[0]?.id || ""
    });
  };

  useEffect(() => {
    setActiveCategoryId(group.categories[0]?.id || "");
  }, [group.categories]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeGroup, activeCategoryId, sortMode, selectedClass, selectedSeat]);

  useEffect(() => {
    if (!agentGroup || !agentCategory) return;
    setForm((prev) => ({
      ...prev,
      type: agentGroup,
      categoryId: agentCategory
    }));
  }, [agentCategory, agentGroup]);

  useEffect(() => {
    if (activeCategoryId !== "taxi") {
      if (selectedSeat !== "all") setSelectedSeat("all");
      if (selectedClass !== "all") setSelectedClass("all");
      return;
    }

    const seatParam = getParam(searchParams, "seat");
    const classParam = getParam(searchParams, "class");
    let nextSeat: "all" | TaxiSeatCount = "all";
    let nextClass: "all" | TaxiVehicleClass = "all";

    if (seatParam || classParam) {
      nextSeat = taxiSeatOptions.includes(Number(seatParam) as TaxiSeatCount)
        ? (Number(seatParam) as TaxiSeatCount)
        : "all";
      nextClass = taxiClassOptions.some((option) => option.value === classParam)
        ? (classParam as TaxiVehicleClass)
        : "all";
    } else if (typeof window !== "undefined") {
      const storedSeat = window.localStorage.getItem(taxiSeatStorageKey) || "";
      const storedClass = window.localStorage.getItem(taxiClassStorageKey) || "";
      nextSeat = taxiSeatOptions.includes(Number(storedSeat) as TaxiSeatCount)
        ? (Number(storedSeat) as TaxiSeatCount)
        : "all";
      nextClass = taxiClassOptions.some((option) => option.value === storedClass)
        ? (storedClass as TaxiVehicleClass)
        : "all";
    }

    if (nextSeat !== selectedSeat) setSelectedSeat(nextSeat);
    if (nextClass !== selectedClass) setSelectedClass(nextClass);
  }, [activeCategoryId, searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    const nextSeat = activeCategoryId === "taxi" && selectedSeat !== "all" ? String(selectedSeat) : "";
    const nextClass = activeCategoryId === "taxi" && selectedClass !== "all" ? selectedClass : "";

    if (nextSeat) params.set("seat", nextSeat);
    else params.delete("seat");

    if (nextClass) params.set("class", nextClass);
    else params.delete("class");

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery === currentQuery) return;
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
  }, [activeCategoryId, pathname, router, searchParams, selectedClass, selectedSeat]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeCategoryId !== "taxi") return;
    if (selectedSeat === "all") {
      window.localStorage.removeItem(taxiSeatStorageKey);
    } else {
      window.localStorage.setItem(taxiSeatStorageKey, String(selectedSeat));
    }
    if (selectedClass === "all") {
      window.localStorage.removeItem(taxiClassStorageKey);
    } else {
      window.localStorage.setItem(taxiClassStorageKey, selectedClass);
    }
  }, [activeCategoryId, selectedClass, selectedSeat, taxiClassStorageKey, taxiSeatStorageKey]);

  const taxiAgents = useMemo(() => {
    if (!activeCategory) return [];
    if (activeCategory.id !== "taxi") return activeCategory.agents;

    return activeCategory.agents.filter((agent) => {
      if (selectedSeat !== "all" && agent.seatCount !== selectedSeat) return false;
      if (selectedClass !== "all" && agent.vehicleClass !== selectedClass) return false;
      return true;
    });
  }, [activeCategory, selectedClass, selectedSeat]);

  const displayServices = useMemo<DisplayService[]>(() => {
    if (!activeCategory) return [];
    const baseServices: DisplayService[] = taxiAgents.flatMap((agent) =>
      agent.services.map((service) => ({
        displayId: service.id,
        title: service.title,
        description: service.description,
        price: service.price,
        currency: service.currency,
        unit: service.unit,
        certificates: service.certificates,
        images: service.images,
        rating: service.rating,
        reviewCount: service.reviewCount,
        usedCount: service.usedCount,
        niceCount: service.niceCount,
        shareCount: service.shareCount,
        canRate: service.canRate,
        createdAt: service.createdAt,
        agent
      }))
    );

    if (baseServices.length === 0) return [];

    const targetCount = Math.max(12, baseServices.length);
    const pool = getCategoryImagePool(activeCategory.id);
    const expanded: DisplayService[] = [];

    for (let i = 0; i < targetCount; i += 1) {
      const base = baseServices[i % baseServices.length];
      const variantIndex = i - baseServices.length + 1;
      const isVariant = i >= baseServices.length;
      const baseDate = new Date(base.createdAt);
      const createdAt = new Date(baseDate.getTime() + i * 86400000).toISOString();
      const imageStart = i * 3;
      expanded.push({
        ...base,
        displayId: `${base.displayId}-v${i + 1}`,
        title: isVariant
          ? `${base.title} · ${t("services.service.variant")} ${variantIndex}`
          : base.title,
        images: [
          pool[imageStart % pool.length],
          pool[(imageStart + 1) % pool.length],
          pool[(imageStart + 2) % pool.length]
        ],
        createdAt
      });
    }

    const sorted = [...expanded].sort((a, b) => {
      if (sortMode === "new") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (b.rating !== a.rating) return b.rating - a.rating;
      return b.reviewCount - a.reviewCount;
    });

    return sorted;
  }, [activeCategory, sortMode, t, taxiAgents]);

  const pageSize = 8;
  const totalPages = Math.min(100, Math.max(1, Math.ceil(displayServices.length / pageSize)));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const pagedServices = displayServices.slice(startIndex, startIndex + pageSize);

  const pageButtons = useMemo(() => {
    const maxButtons = 7;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const half = Math.floor(maxButtons / 2);
    let start = Math.max(1, safePage - half);
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = end - maxButtons + 1;
    }
    return Array.from({ length: maxButtons }, (_, idx) => start + idx);
  }, [safePage, totalPages]);

  const canShowAddService = isAuthenticated && role === "AGENT" && agentKind === "SERVICE";
  const isSellerAgent = isAuthenticated && role === "AGENT" && agentKind === "SELLER";
  const isServiceAgentLocked = canShowAddService && agentGroup && agentCategory;

  const renderRating = (rating: number) => `${t("services.agent.rating")}: ${rating.toFixed(1)}/5`;

  const renderAgentStats = (agent: ServiceAgent) => [
    `${t("services.agent.clients")}: ${formatCount(agent.totalClients)}`,
    `${t("services.agent.followers")}: ${formatCount(agent.followers)}`,
    `${t("services.agent.nice")}: ${formatCount(agent.niceCount)}`,
    `${t("services.agent.shares")}: ${formatCount(agent.shareCount)}`,
    `${t("services.agent.reviews")}: ${formatCount(agent.reviewCount)}`
  ];

  const formatTaxiClassLabel = (value: TaxiVehicleClass) =>
    taxiClassOptions.find((option) => option.value === value)?.label ?? value;

  const formatRideStatus = (status: string) => {
    const map: Record<string, string> = {
      requested: "So'rov yuborildi",
      assigned: "Haydovchi biriktirildi",
      taken: "Haydovchi qabul qildi",
      confirmed: "Mijoz tasdiqladi",
      completed: "Safar yakunlandi"
    };
    return map[status] || status;
  };

  const formatSocketStatus = (status: string) => {
    const map: Record<string, string> = {
      idle: "To'xtatilgan",
      connecting: "Ulanmoqda",
      open: "Onlayn",
      closed: "Ulanish uzildi",
      error: "Xatolik"
    };
    return map[status] || status;
  };

  const handleConfirmRide = () => {
    if (!latestRide) return;
    sendRideEvent("ride_confirmed", { rideId: latestRide.rideId });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{t("services.hub.label")}</p>
            <h1 className="text-2xl font-semibold text-slate-50">{t("services.hub.title")}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{t("services.hub.description")}</p>
          </div>
          <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-100">
            <p className="font-semibold">{t("services.hub.noteTitle")}</p>
            <p className="mt-1 text-amber-200/90">{t("services.hub.noteBody")}</p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-xs">
          {serviceCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveGroup(item.id)}
              className={`rounded-full px-4 py-2 transition ${
                activeGroup === item.id
                  ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/60"
                  : "bg-slate-900/70 text-slate-300 ring-1 ring-slate-700/70 hover:text-slate-100"
              }`}
            >
              {getGroupLabel(item.id)}
            </button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{t("services.list.title")}</p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{t("services.sort.label")}:</span>
              <select
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                value={sortMode}
                onChange={(e) => setSortMode(e.target.value as "top" | "new")}
              >
                <option value="top">{t("services.sort.top")}</option>
                <option value="new">{t("services.sort.new")}</option>
              </select>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategoryId(cat.id)}
                className={`rounded-full px-3 py-1 transition ${
                  activeCategoryId === cat.id
                    ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/60"
                    : "bg-slate-900/60 text-slate-300 ring-1 ring-slate-700/70 hover:text-slate-100"
                }`}
              >
                {getCategoryLabel(cat.id, cat.title)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-lg shadow-black/20">
        {canShowAddService ? (
          <>
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-sky-200">{t("services.add.badge")}</p>
                <h2 className="text-xl font-semibold text-slate-50">{t("services.add.title")}</h2>
                <p className="mt-1 text-sm text-slate-400">{t("services.add.description")}</p>
              </div>
              <div className="text-xs text-slate-400">
                {t("services.hub.wordLabel")}:{" "}
                <span className={wordCount > 500 ? "text-red-400" : "text-slate-200"}>{wordCount}</span>/500
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 grid gap-4 text-sm md:grid-cols-[1.2fr,1fr]">
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">{t("services.add.typeLabel")}</label>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                      value={form.type}
                      onChange={(e) =>
                        handleFormChange("type", e.target.value as ServiceFormState["type"])
                      }
                      disabled={isServiceAgentLocked}
                    >
                      <option value="material">{t("services.add.type.material")}</option>
                      <option value="spiritual">{t("services.add.type.spiritual")}</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">{t("services.add.categoryLabel")}</label>
                    <select
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                      value={form.categoryId}
                      onChange={(e) => handleFormChange("categoryId", e.target.value)}
                      disabled={isServiceAgentLocked}
                    >
                      {(isServiceAgentLocked
                        ? formGroup.categories.filter((cat) => cat.id === agentCategory)
                        : formGroup.categories
                      ).map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {getCategoryLabel(cat.id, cat.title)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">{t("services.add.nameLabel")}</label>
                    <input
                      className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                      value={form.title}
                      onChange={(e) => handleFormChange("title", e.target.value)}
                      placeholder={t("services.add.namePlaceholder")}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-slate-300">{t("services.add.priceLabel")}</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                        value={form.price}
                        onChange={(e) => handleFormChange("price", e.target.value)}
                        placeholder="150000"
                      />
                      <select
                        className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100"
                        value={form.currency}
                        onChange={(e) =>
                          handleFormChange("currency", e.target.value as ServiceFormState["currency"])
                        }
                      >
                        <option value="UZS">UZS</option>
                        <option value="USD">USD</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">{t("services.add.certLabel")}</label>
                  <input
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                    value={form.certificates}
                    onChange={(e) => handleFormChange("certificates", e.target.value)}
                    placeholder={t("services.add.certPlaceholder")}
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-slate-300">{t("services.add.descLabel")}</label>
                  <textarea
                    className="min-h-[120px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100"
                    value={form.description}
                    onChange={(e) => handleFormChange("description", e.target.value)}
                    placeholder={t("services.add.descPlaceholder")}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-xs font-semibold text-slate-200">{t("services.add.imagesTitle")}</p>
                  <p className="mt-1 text-xs text-slate-400">{t("services.add.imagesDesc")}</p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="mt-3 block w-full text-xs text-slate-300"
                    onChange={(e) => handleFormChange("images", Array.from(e.target.files || []))}
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {t("services.add.imagesSelected")}: {form.images.length}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <label className="flex items-start gap-3 text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={form.agree}
                      onChange={(e) => handleFormChange("agree", e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-400"
                    />
                    <span>{t("services.add.agree")}</span>
                  </label>
                </div>

                {formError && <p className="text-xs text-red-400">{formError}</p>}
                {formSuccess && <p className="text-xs text-emerald-300">{formSuccess}</p>}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-400/90 py-2 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-300"
                >
                  {t("services.add.submit")}
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-sm text-slate-300">
            <p className="text-base font-semibold text-slate-100">
              {isSellerAgent ? t("services.add.sellerTitle") : t("services.add.restrictedTitle")}
            </p>
            <p className="mt-2 text-sm text-slate-400">
              {isSellerAgent ? t("services.add.sellerDesc") : t("services.add.restrictedDesc")}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              {!isAuthenticated && (
                <Link
                  href="/login"
                  className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100"
                >
                  {t("services.add.loginCta")}
                </Link>
              )}
              {isSellerAgent && (
                <Link
                  href="/products"
                  className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
                >
                  {t("services.add.sellerCta")}
                </Link>
              )}
              {isAuthenticated && !isSellerAgent && role === "AGENT" && !agentKind && (
                <Link
                  href="/profile"
                  className="rounded-full bg-slate-800 px-3 py-1 text-slate-200"
                >
                  {t("nav.profile")}
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">{getGroupLabel(group.id)}</p>
          <p className="mt-2 text-sm text-slate-300">{getGroupDescription(group.id)}</p>
        </div>

        {activeCategory && (
          <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/60 p-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-100">
                {getCategoryLabel(activeCategory.id, activeCategory.title)}
              </h3>
              <p className="text-sm text-slate-400">
                {getCategoryDescription(activeCategory.id, activeCategory.description)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-200">{t("services.list.title")}</p>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    className="rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                  >
                    {t("services.pagination.prev")}
                  </button>
                  <div className="flex items-center gap-1">
                    {pageButtons.map((page) => (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`h-7 w-7 rounded-full text-xs ${
                          page === safePage
                            ? "bg-emerald-400/20 text-emerald-100 ring-1 ring-emerald-400/60"
                            : "bg-slate-900 text-slate-300"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    className="rounded-full bg-slate-900 px-3 py-1 text-slate-200"
                  >
                    {t("services.pagination.next")}
                  </button>
                  <span className="text-xs text-slate-500">
                    {t("services.pagination.page")} {safePage} {t("services.pagination.of")} {totalPages}
                  </span>
                </div>
              </div>
            </div>

            {activeCategory.id === "taxi" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>O'rinlar:</span>
                    <select
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                      value={selectedSeat}
                      onChange={(e) => {
                        const value = e.target.value;
                        setSelectedSeat(value === "all" ? "all" : Number(value) as TaxiSeatCount);
                      }}
                    >
                      <option value="all">Barchasi</option>
                      {taxiSeatOptions.map((seat) => (
                        <option key={seat} value={seat}>
                          {seat} kishi
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Tur:</span>
                    <select
                      className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                      value={selectedClass}
                      onChange={(e) => setSelectedClass(e.target.value as "all" | TaxiVehicleClass)}
                    >
                      <option value="all">Barchasi</option>
                      {taxiClassOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                    {taxiAgents.length} ta agent topildi
                  </span>
                </div>
              </div>
            )}

            {activeCategory.id === "taxi" && (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-xs text-slate-400">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-200">Real-time buyurtma holati</p>
                  <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300">
                    {formatSocketStatus(rideSocketStatus)}
                  </span>
                </div>
                {latestRide ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Ride ID</p>
                      <p className="text-sm text-slate-100">{latestRide.rideId}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Holat</p>
                      <p className="text-sm text-emerald-200">{formatRideStatus(latestRide.status)}</p>
                    </div>
                    {latestRide.pickupLocation && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Qayerdan</p>
                        <p className="text-sm text-slate-200">{latestRide.pickupLocation}</p>
                      </div>
                    )}
                    {latestRide.dropoffLocation && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Qayerga</p>
                        <p className="text-sm text-slate-200">{latestRide.dropoffLocation}</p>
                      </div>
                    )}
                    {(latestRide.seatCount || latestRide.taxiClass) && (
                      <div className="flex flex-wrap gap-2 text-[11px]">
                        {latestRide.seatCount && (
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                            {latestRide.seatCount} kishi
                          </span>
                        )}
                        {latestRide.taxiClass && (
                          <span className="rounded-full bg-slate-900 px-2 py-1 text-slate-300">
                            {formatTaxiClassLabel(latestRide.taxiClass as TaxiVehicleClass)}
                          </span>
                        )}
                      </div>
                    )}
                    {(latestRide.offeredFare || latestRide.estimatedFare || latestRide.finalFare) && (
                      <div>
                        <p className="text-[11px] uppercase tracking-wide text-slate-500">Narx</p>
                        <p className="text-sm text-slate-100">
                          {latestRide.finalFare
                            ? `${formatCount(latestRide.finalFare)} ${latestRide.currency || "UZS"}`
                            : latestRide.offeredFare
                            ? `${formatCount(latestRide.offeredFare)} ${latestRide.currency || "UZS"}`
                            : latestRide.estimatedFare
                            ? `${formatCount(latestRide.estimatedFare)} ${latestRide.currency || "UZS"}`
                            : "—"}
                        </p>
                      </div>
                    )}
                    {["assigned", "taken"].includes(latestRide.status) && (
                      <div className="sm:col-span-2">
                        <button
                          type="button"
                          onClick={handleConfirmRide}
                          className="rounded-full bg-emerald-400/20 px-4 py-1 text-xs text-emerald-200"
                          disabled={rideSocketStatus !== "open"}
                        >
                          Safarni tasdiqlash
                        </button>
                        {rideSocketStatus !== "open" && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            Tasdiqlash uchun real-time ulanish kerak.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-xs text-slate-500">
                    Hozircha real-time buyurtma yo'q.
                  </p>
                )}
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              {pagedServices.map((service) => (
                <div key={service.displayId} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <Link href={`/agents/${service.agent.id}`} className="flex items-center gap-3">
                      <img
                        src={service.agent.avatar.src}
                        alt={service.agent.avatar.alt}
                        className="h-10 w-10 rounded-full object-cover"
                        loading="lazy"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{service.agent.name}</p>
                        <p className="text-[11px] text-slate-400">@{service.agent.nickname}</p>
                      </div>
                    </Link>
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">
                      {t("services.agent.verified")}
                    </span>
                  </div>

                  {activeCategory.id === "taxi" && (service.agent.vehicleClass || service.agent.seatCount) && (
                    <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                      {service.agent.vehicleClass && (
                        <span className="rounded-full bg-slate-900 px-2 py-1">
                          {formatTaxiClassLabel(service.agent.vehicleClass)}
                        </span>
                      )}
                      {service.agent.seatCount && (
                        <span className="rounded-full bg-slate-900 px-2 py-1">
                          {service.agent.seatCount} kishi
                        </span>
                      )}
                      {service.agent.vehicleModel && (
                        <span className="rounded-full bg-slate-900 px-2 py-1">
                          {service.agent.vehicleModel}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{service.title}</p>
                      <p className="text-xs text-slate-400">{service.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-emerald-200">
                        {formatCount(service.price)} {service.currency}
                      </p>
                      <p className="text-[11px] text-slate-500">/{service.unit}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-400">
                    {service.certificates.map((cert) => (
                      <span key={`${service.displayId}-${cert}`} className="rounded-full bg-slate-900 px-2 py-1">
                        {cert}
                      </span>
                    ))}
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {service.images.map((image, idx) => (
                      <img
                        key={`${service.displayId}-${idx}`}
                        src={image.src}
                        alt={image.alt}
                        className="h-20 w-full rounded-lg object-cover"
                        loading="lazy"
                      />
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-900 px-2 py-1">
                        {renderRating(service.rating)}
                      </span>
                      <span className="rounded-full bg-slate-900 px-2 py-1">
                        {t("services.service.used")}: {formatCount(service.usedCount)}
                      </span>
                      <span className="rounded-full bg-slate-900 px-2 py-1">
                        {t("services.service.reviews")}: {formatCount(service.reviewCount)}
                      </span>
                    </div>
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1 ${
                        service.canRate
                          ? "bg-emerald-400/20 text-emerald-200"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {service.canRate ? t("services.service.rate") : t("services.service.rateOnly")}
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                      {t("services.actions.nice")} ({formatCount(service.niceCount)})
                    </button>
                    <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                      {t("services.actions.followAgent")}
                    </button>
                    <button className="rounded-full bg-slate-800 px-3 py-1 text-slate-200">
                      {t("services.actions.share")} ({formatCount(service.shareCount)})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
