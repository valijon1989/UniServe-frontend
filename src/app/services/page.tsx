"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CategorySidebar } from "@/components/services/CategorySidebar";
import { CategoryChipsRow } from "@/components/services/CategoryChipsRow";
import { ServicesTopBar } from "@/components/services/ServicesTopBar";
import { ServicesFilterPanel } from "@/components/services/ServicesFilterPanel";
import { ServicesFeed } from "@/components/services/ServicesFeed";
import { DeliveryServiceSection } from "@/components/services/DeliveryServiceSection";
import { TechnicalServiceSection } from "@/components/services/TechnicalServiceSection";
import { EmploymentServiceSection } from "@/components/services/EmploymentServiceSection";
import { ConstructionServiceSection } from "@/components/services/ConstructionServiceSection";
import { useServiceCategories } from "@/hooks/useServiceCategories";
import { useServicesFeed } from "@/hooks/useServicesFeed";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { toQuery } from "@/lib/fetcher";
import { useI18n } from "@/context/i18n";

type FilterState = {
  providerType: string;
  deliveryMode: string;
  minRating: string;
  priceMin: string;
  priceMax: string;
};

const emptyFilters: FilterState = {
  providerType: "",
  deliveryMode: "",
  minRating: "",
  priceMin: "",
  priceMax: ""
};

const getParam = (params: URLSearchParams, key: string) => params.get(key) || "";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { categories } = useServiceCategories();
  const { t } = useI18n();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const [selectedTab, setSelectedTab] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("popular");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [draftFilters, setDraftFilters] = useState<FilterState>(emptyFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [optimisticMap, setOptimisticMap] = useState<Record<string, { liked?: boolean; saved?: boolean; likes?: number; saves?: number }>>({});
  const debouncedQuery = useDebouncedValue(query, 400);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const isDeliveryCategory = selectedTab === "material" && selectedCategory === "delivery";
  const isTechnicalCategory = selectedTab === "material" && selectedCategory === "technical";
  const isEmploymentCategory = selectedTab === "material" && selectedCategory === "employment";
  const isConstructionCategory = selectedTab === "material" && selectedCategory === "construction";

  useEffect(() => {
    if (filterOpen) {
      setDraftFilters(filters);
    }
  }, [filterOpen, filters]);

  useEffect(() => {
    const tabParam = getParam(searchParams, "tab");
    const category = getParam(searchParams, "category");
    const subCategory = getParam(searchParams, "subCategory");
    const q = getParam(searchParams, "q");
    const nextSort = getParam(searchParams, "sort") || "popular";
    const providerType = getParam(searchParams, "providerType");
    const deliveryMode = getParam(searchParams, "deliveryMode");
    const minRating = getParam(searchParams, "minRating");
    const priceMin = getParam(searchParams, "minPrice");
    const priceMax = getParam(searchParams, "maxPrice");
    const normalizedTab = tabParam === "social" ? "spiritual" : tabParam;

    if (normalizedTab && normalizedTab !== selectedTab) setSelectedTab(normalizedTab);
    if (category && category !== selectedCategory) setSelectedCategory(category);
    if (subCategory !== selectedSubCategory) setSelectedSubCategory(subCategory);
    if (q !== query) setQuery(q);
    if (nextSort !== sort) setSort(nextSort);
    const nextFilters = {
      providerType,
      deliveryMode,
      minRating,
      priceMin,
      priceMax
    };
    if (
      nextFilters.providerType !== filters.providerType ||
      nextFilters.deliveryMode !== filters.deliveryMode ||
      nextFilters.minRating !== filters.minRating ||
      nextFilters.priceMin !== filters.priceMin ||
      nextFilters.priceMax !== filters.priceMax
    ) {
      setFilters(nextFilters);
      setDraftFilters(nextFilters);
    }
  }, [filters, query, searchParams, selectedCategory, selectedSubCategory, selectedTab, sort]);

  useEffect(() => {
    if (categories.length === 0) return;
    const tabExists = selectedTab && categories.some((cat) => cat.slug === selectedTab);
    if (!selectedTab || !tabExists) {
      setSelectedTab(categories[0].slug);
      setSelectedCategory(categories[0].children?.[0]?.slug || "");
      setSelectedSubCategory("");
      return;
    }
    const activeTab = categories.find((cat) => cat.slug === selectedTab) || categories[0];
    if (!selectedCategory || !activeTab.children?.some((child) => child.slug === selectedCategory)) {
      setSelectedCategory(activeTab.children?.[0]?.slug || "");
      setSelectedSubCategory("");
    }
  }, [categories, selectedCategory, selectedTab]);

  useEffect(() => {
    if (selectedCategory === "construction" && !selectedSubCategory) {
      setSelectedSubCategory("construction-exterior");
    }
    if (selectedCategory !== "construction" && selectedSubCategory) {
      setSelectedSubCategory("");
    }
  }, [selectedCategory, selectedSubCategory]);

  const queryString = useMemo(() => {
    return toQuery({
      tab: selectedTab === "spiritual" ? "social" : selectedTab,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      q: debouncedQuery,
      sort,
      providerType: filters.providerType,
      deliveryMode: filters.deliveryMode,
      minRating: filters.minRating,
      minPrice: filters.priceMin,
      maxPrice: filters.priceMax
    });
  }, [debouncedQuery, filters, selectedCategory, selectedSubCategory, selectedTab, sort]);

  useEffect(() => {
    if (!queryString) {
      router.replace("/services");
    } else {
      router.replace(`/services?${queryString}`, { scroll: false });
    }
  }, [queryString, router]);

  const mapCategoryLabel = (slug: string, fallback: string) => {
    const labels: Record<string, string> = {
      material: t("services.group.material"),
      spiritual: t("services.group.spiritual"),
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
    return labels[slug] || fallback;
  };

  const translatedCategories = useMemo(() => {
    return categories.map((cat) => ({
      ...cat,
      name: mapCategoryLabel(cat.slug, cat.name),
      children: cat.children?.map((child) => ({
        ...child,
        name: mapCategoryLabel(child.slug, child.name)
      }))
    }));
  }, [categories, t]);

  const serviceParams = useMemo(
    () => ({
      tab: selectedTab,
      category: selectedCategory,
      subCategory: selectedSubCategory,
      q: debouncedQuery,
      sort,
      providerType: filters.providerType,
      deliveryMode: filters.deliveryMode,
      minRating: filters.minRating ? Number(filters.minRating) : undefined,
      priceMin: filters.priceMin ? Number(filters.priceMin) : undefined,
      priceMax: filters.priceMax ? Number(filters.priceMax) : undefined,
      limit: 12
    }),
    [debouncedQuery, filters, selectedCategory, selectedSubCategory, selectedTab, sort]
  );

  const {
    items,
    isLoading,
    error,
    size,
    setSize,
    hasMore,
    isValidating,
    mutate
  } = useServicesFeed(serviceParams);

  const renderedItems = useMemo(() => {
    return items.map((item) => {
      const override = optimisticMap[item.id] || {};
      return {
        ...item,
        liked: override.liked ?? item.liked,
        saved: override.saved ?? item.saved,
        stats: {
          ...item.stats,
          likes: override.likes ?? item.stats.likes,
          saves: override.saves ?? item.stats.saves
        }
      };
    });
  }, [items, optimisticMap]);

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) return;
    const node = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && hasMore && !isValidating) {
          setSize((prev) => prev + 1);
        }
      });
    }, { rootMargin: "300px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isValidating, setSize]);

  const handleCategorySelect = (tab: string, category?: string, subCategory?: string) => {
    setSelectedTab(tab);
    if (category) {
      setSelectedCategory(category);
      setSelectedSubCategory(subCategory || "");
      return;
    }
    const activeTab = categories.find((cat) => cat.slug === tab);
    setSelectedCategory(activeTab?.children?.[0]?.slug || "");
    setSelectedSubCategory("");
  };

  const handleApplyFilters = () => {
    setFilters(draftFilters);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilters(emptyFilters);
    setDraftFilters(emptyFilters);
    setFilterOpen(false);
  };

  const updateOptimistic = (id: string, next: { liked?: boolean; saved?: boolean; likes?: number; saves?: number }) => {
    setOptimisticMap((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...next
      }
    }));
  };

  const handleToggleLike = (id: string, next: boolean) => {
    const current = renderedItems.find((item) => item.id === id);
    const delta = next ? 1 : -1;
    const previous = {
      liked: current?.liked ?? false,
      likes: current?.stats.likes ?? 0
    };
    updateOptimistic(id, {
      liked: next,
      likes: Math.max(0, (current?.stats.likes ?? 0) + delta)
    });
    fetch(`/api/services/${id}/like`, {
      method: next ? "POST" : "DELETE",
      body: JSON.stringify({ liked: next })
    }).catch(() => {
      updateOptimistic(id, previous);
    });
  };

  const handleToggleSave = (id: string, next: boolean) => {
    const current = renderedItems.find((item) => item.id === id);
    const delta = next ? 1 : -1;
    const previous = {
      saved: current?.saved ?? false,
      saves: current?.stats.saves ?? 0
    };
    updateOptimistic(id, {
      saved: next,
      saves: Math.max(0, (current?.stats.saves ?? 0) + delta)
    });
    fetch(`/api/services/${id}/save`, {
      method: next ? "POST" : "DELETE",
      body: JSON.stringify({ saved: next })
    }).catch(() => {
      updateOptimistic(id, previous);
    });
  };

  const sortOptions = [
    { value: "popular", label: t("services.sort.top") },
    { value: "new", label: t("services.sort.new") },
    { value: "price_low", label: t("services.sort.priceLow") },
    { value: "price_high", label: t("services.sort.priceHigh") },
    { value: "rating", label: t("services.sort.rating") }
  ];

  const emptyState = (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-6 text-center text-sm text-slate-300">
      <p>{t("services.empty.title")}</p>
      <button
        type="button"
        onClick={handleClearFilters}
        className="mt-3 rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-200"
      >
        {t("services.empty.clear")}
      </button>
    </div>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 pb-10 pt-6">
      <aside className="hidden w-72 shrink-0 lg:block">
        <CategorySidebar
          categories={translatedCategories}
          selectedTab={selectedTab}
          selectedCategory={selectedCategory}
          onSelect={handleCategorySelect}
          title={t("services.sidebar.title")}
        />
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        <div className="lg:hidden">
          <CategoryChipsRow
            categories={translatedCategories}
            selectedTab={selectedTab}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
          />
        </div>

        <ServicesTopBar
          query={query}
          onQueryChange={setQuery}
          sort={sort}
          onSortChange={setSort}
          onOpenFilters={() => setFilterOpen(true)}
          sortLabels={sortOptions}
          searchPlaceholder={t("services.search.placeholder")}
          filterLabel={t("services.filter.button")}
        />

        {error && (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-200">
            <p>{t("services.error.title")}</p>
            <button
              type="button"
              onClick={() => mutate()}
              className="mt-2 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-200"
            >
              {t("services.error.retry")}
            </button>
          </div>
        )}

        {isDeliveryCategory ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
            <DeliveryServiceSection />
          </div>
        ) : isEmploymentCategory ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
            <EmploymentServiceSection />
          </div>
        ) : isConstructionCategory ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
            <ConstructionServiceSection
              selectedSection={selectedSubCategory || "construction-exterior"}
              onSectionChange={(next) => setSelectedSubCategory(next)}
            />
          </div>
        ) : isTechnicalCategory ? (
          <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-4">
            <TechnicalServiceSection />
          </div>
        ) : isLoading && renderedItems.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div key={idx} className="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/60" />
            ))}
          </div>
        ) : renderedItems.length === 0 ? (
          emptyState
        ) : (
          <ServicesFeed
            items={renderedItems}
            onLike={handleToggleLike}
            onSave={handleToggleSave}
            layout={isDesktop ? "grid" : "list"}
          />
        )}

        <div ref={loadMoreRef} className="h-8" />
        {isValidating && renderedItems.length > 0 && (
          <p className="text-center text-xs text-slate-400">{t("services.loading.more")}</p>
        )}
      </main>

      <ServicesFilterPanel
        open={filterOpen}
        variant={isDesktop ? "drawer" : "sheet"}
        filters={draftFilters}
        onChange={setDraftFilters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
        onClose={() => setFilterOpen(false)}
        labels={{
          title: t("services.filter.title"),
          providerType: t("services.filter.provider"),
          deliveryMode: t("services.filter.delivery"),
          minRating: t("services.filter.rating"),
          priceRange: t("services.filter.price"),
          apply: t("services.filter.apply"),
          clear: t("services.filter.clear"),
          close: t("services.filter.close"),
          any: t("services.filter.any"),
          all: t("services.filter.all"),
          providerSocial: t("services.filter.provider.social"),
          providerMaterial: t("services.filter.provider.material"),
          deliveryOnline: t("services.filter.delivery.online"),
          deliveryOffline: t("services.filter.delivery.offline"),
          deliveryBoth: t("services.filter.delivery.both"),
          priceMin: t("services.filter.priceMin"),
          priceMax: t("services.filter.priceMax")
        }}
      />
      <div className="fixed bottom-3 right-3 z-[9999] rounded bg-black px-3 py-2 text-xs text-white">
        ServicesPage v2
      </div>
    </div>
  );
}
