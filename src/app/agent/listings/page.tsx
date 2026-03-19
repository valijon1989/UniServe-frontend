"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import {
  createListing,
  deleteListing,
  getMyListings,
  type Listing,
  type ListingStatus,
  type MyListingsSort,
  updateListing,
  updateListingStatus
} from "@/api/agent";
import {
  ListingDrawer,
  type ListingFormValues,
  type ListingSubmitIntent
} from "@/components/agent/ListingDrawer";
import { ListingsGrid } from "@/components/agent/ListingsGrid";
import { AgentRoute } from "@/components/guards/AgentRoute";
import { useI18n } from "@/context/i18n";

type ListingFilterStatus = "ALL" | "ACTIVE" | "PAUSED" | "DRAFT" | "ARCHIVED";
type DrawerMode = "create" | "edit" | null;

const PAGE_SIZE = 12;

const resolveListingId = (item: Listing) => String(item._id || item.id || "");

const normalizeFilterStatus = (raw: string | null): ListingFilterStatus => {
  if (!raw) return "ALL";
  const normalized = raw.toUpperCase();
  if (normalized === "ACTIVE" || normalized === "PAUSED" || normalized === "DRAFT" || normalized === "ARCHIVED") {
    return normalized;
  }
  return "ALL";
};

const normalizeSort = (raw: string | null): MyListingsSort => {
  return raw === "newest" ? "newest" : "updated";
};

const extractErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
  if (typeof responseMessage === "string" && responseMessage.trim()) {
    return responseMessage;
  }
  const genericMessage = (error as { message?: string })?.message;
  if (typeof genericMessage === "string" && genericMessage.trim()) {
    return genericMessage;
  }
  return fallback;
};

type ListingWritePayload = Pick<Listing, "title" | "description" | "category" | "price" | "currency" | "imageUrl">;

const toListingPayload = (values: ListingFormValues): ListingWritePayload => {
  return {
    title: values.title.trim(),
    description: values.description.trim(),
    category: values.category.trim() || "SERVICE",
    price: Number(values.price || 0) || 0,
    currency: values.currency || "USD",
    imageUrl: values.imageUrl.trim()
  };
};

function AgentListingsPageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCreateQuery = searchParams.get("create") === "1";
  const editId = (searchParams.get("edit") || "").trim();
  const drawerMode: DrawerMode = editId ? "edit" : isCreateQuery ? "create" : null;

  const statusFilter = normalizeFilterStatus(searchParams.get("status"));
  const sort = normalizeSort(searchParams.get("sort"));
  const query = (searchParams.get("q") || "").trim();
  const page = Math.max(1, Number(searchParams.get("page") || 1) || 1);

  const [searchInput, setSearchInput] = useState(query);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [reloadTick, setReloadTick] = useState(0);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const replaceQuery = useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          params.delete(key);
          return;
        }
        params.set(key, value);
      });
      const next = params.toString();
      router.replace(next ? `/agent/listings?${next}` : "/agent/listings", { scroll: false });
    },
    [router, searchParams]
  );

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getMyListings({
      status: statusFilter === "ALL" ? undefined : statusFilter,
      q: query || undefined,
      page,
      limit: PAGE_SIZE,
      sort
    })
      .then((res) => {
        if (!active) return;
        setItems(res.items);
        setTotal(res.total);
        setLimit(res.limit || PAGE_SIZE);
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = extractErrorMessage(error, t("form.error"));
        toast.error(message);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [page, query, reloadTick, sort, statusFilter, t]);

  const activeEditItem = useMemo(() => {
    if (drawerMode !== "edit") return null;
    return items.find((item) => resolveListingId(item) === editId) || null;
  }, [drawerMode, editId, items]);

  useEffect(() => {
    if (drawerMode !== "edit" || loading || activeEditItem) return;
    toast.error(
      t({
        en: "Listing not found. Please open edit from list again.",
        uz: "E'lon topilmadi. Ro'yxatdan qayta Edit bosing.",
        ru: "Объявление не найдено. Откройте Edit из списка снова.",
        ko: "목록을 찾을 수 없습니다. 목록에서 다시 수정 버튼을 누르세요."
      })
    );
    router.replace("/agent/listings", { scroll: false });
  }, [activeEditItem, drawerMode, loading, router, t]);

  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const refresh = () => setReloadTick((prev) => prev + 1);

  const openCreateDrawer = () => {
    replaceQuery({ create: "1", edit: null });
  };

  const openEditDrawer = (item: Listing) => {
    const id = resolveListingId(item);
    if (!id) return;
    replaceQuery({ edit: id, create: null });
  };

  const closeDrawer = () => {
    router.replace("/agent/listings", { scroll: false });
  };

  const handleDrawerSubmit = async (values: ListingFormValues, intent: ListingSubmitIntent) => {
    setSaving(true);
    try {
      const payload = toListingPayload(values);

      if (drawerMode === "edit" && editId) {
        await updateListing(editId, payload);
        toast.success(
          t({
            en: "Listing updated",
            uz: "E'lon yangilandi",
            ru: "Объявление обновлено",
            ko: "목록이 업데이트되었습니다"
          })
        );
      } else {
        const created = await createListing({ ...payload, status: "DRAFT" });
        const createdId = resolveListingId(created);

        if (intent === "publish") {
          if (!createdId) {
            throw new Error(
              t({
                en: "Created as draft, but publish failed. Try again from list.",
                uz: "Draft yaratildi, lekin publish bo'lmadi. Ro'yxatdan qayta urinib ko'ring.",
                ru: "Черновик создан, но публикация не удалась. Попробуйте снова из списка.",
                ko: "초안은 생성되었지만 게시에 실패했습니다. 목록에서 다시 시도하세요."
              })
            );
          }
          await updateListingStatus(createdId, "ACTIVE");
          toast.success(
            t({
              en: "Listing published",
              uz: "E'lon publish qilindi",
              ru: "Объявление опубликовано",
              ko: "목록이 게시되었습니다"
            })
          );
        } else {
          toast.success(
            t({
              en: "Draft saved",
              uz: "Draft saqlandi",
              ru: "Черновик сохранен",
              ko: "초안이 저장되었습니다"
            })
          );
        }
      }

      closeDrawer();
      refresh();
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t("form.error")));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (item: Listing) => {
    const id = resolveListingId(item);
    if (!id) return;

    const currentStatus = (item.status || "DRAFT") as ListingStatus;
    const nextStatus: ListingStatus = currentStatus === "ACTIVE" ? "PAUSED" : "ACTIVE";

    setBusyId(id);
    setItems((prev) => prev.map((entry) => (resolveListingId(entry) === id ? { ...entry, status: nextStatus } : entry)));

    try {
      const updated = await updateListingStatus(id, nextStatus);
      setItems((prev) => prev.map((entry) => (resolveListingId(entry) === id ? { ...entry, ...updated } : entry)));
      toast.success(
        nextStatus === "ACTIVE"
          ? t({ en: "Activated", uz: "Faollashtirildi", ru: "Активировано", ko: "활성화됨" })
          : t({ en: "Paused", uz: "Pauza qilindi", ru: "Приостановлено", ko: "일시중지됨" })
      );
    } catch (error: unknown) {
      setItems((prev) => prev.map((entry) => (resolveListingId(entry) === id ? { ...entry, status: currentStatus } : entry)));
      toast.error(extractErrorMessage(error, t("form.error")));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: Listing) => {
    const id = resolveListingId(item);
    if (!id) return;

    const shouldDelete = window.confirm(
      t({
        en: "Delete this listing?",
        uz: "Bu e'lon o'chirilsinmi?",
        ru: "Удалить это объявление?",
        ko: "이 목록을 삭제할까요?"
      })
    );
    if (!shouldDelete) return;

    setBusyId(id);
    try {
      await deleteListing(id);
      toast.success(
        t({
          en: "Listing deleted",
          uz: "E'lon o'chirildi",
          ru: "Объявление удалено",
          ko: "목록이 삭제되었습니다"
        })
      );

      if (items.length === 1 && page > 1) {
        replaceQuery({ page: String(page - 1) });
      } else {
        refresh();
      }
    } catch (error: unknown) {
      toast.error(extractErrorMessage(error, t("form.error")));
    } finally {
      setBusyId(null);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    replaceQuery({ q: searchInput.trim() || null, page: "1" });
  };

  const tabs: Array<{ key: ListingFilterStatus; label: string }> = [
    { key: "ALL", label: t({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" }) },
    { key: "ACTIVE", label: t({ en: "Active", uz: "Faol", ru: "Активные", ko: "활성" }) },
    { key: "PAUSED", label: t({ en: "Paused", uz: "Pauza", ru: "Пауза", ko: "일시중지" }) },
    { key: "DRAFT", label: t({ en: "Draft", uz: "Qoralama", ru: "Черновики", ko: "초안" }) },
    { key: "ARCHIVED", label: t({ en: "Archived", uz: "Arxiv", ru: "Архив", ko: "보관" }) }
  ];

  const isDrawerOpen = drawerMode === "create" || (drawerMode === "edit" && Boolean(activeEditItem));

  return (
    <AgentRoute>
      <div className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-100">{t("agents.myListings")}</h1>
              <p className="text-sm text-slate-400">
                {t({
                  en: "Manage all your listings from one dashboard.",
                  uz: "Barcha e'lonlaringizni bitta paneldan boshqaring.",
                  ru: "Управляйте всеми объявлениями из одной панели.",
                  ko: "하나의 대시보드에서 모든 목록을 관리하세요."
                })}
              </p>
            </div>
            <button
              type="button"
              onClick={openCreateDrawer}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400"
            >
              + {t({ en: "New listing", uz: "Yangi e'lon", ru: "Новое объявление", ko: "새 목록" })}
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {tabs.map((tab) => {
              const active = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => replaceQuery({ status: tab.key === "ALL" ? null : tab.key, page: "1" })}
                  className={`rounded-full px-3 py-1 text-xs transition ${
                    active
                      ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/60"
                      : "bg-slate-900/70 text-slate-300 ring-1 ring-slate-700/70 hover:text-slate-100"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-2 md:grid-cols-[1fr,180px]">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder={t({
                  en: "Search by title",
                  uz: "Sarlavha bo'yicha qidirish",
                  ru: "Поиск по заголовку",
                  ko: "제목 검색"
                })}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              />
              <button
                type="submit"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800"
              >
                {t({ en: "Search", uz: "Qidirish", ru: "Поиск", ko: "검색" })}
              </button>
            </form>

            <select
              value={sort}
              onChange={(event) => replaceQuery({ sort: event.target.value, page: "1" })}
              className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            >
              <option value="updated">
                {t({ en: "Updated", uz: "Yangilangan", ru: "Обновлено", ko: "업데이트" })}
              </option>
              <option value="newest">{t({ en: "Newest", uz: "Eng yangi", ru: "Сначала новые", ko: "최신순" })}</option>
            </select>
          </div>
        </section>

        {!loading && items.length === 0 ? (
          <section className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-4 py-10 text-center">
            <p className="text-sm text-slate-300">
              {t({
                en: "You have no listings yet.",
                uz: "Sizda hali e'lon yo'q.",
                ru: "У вас пока нет объявлений.",
                ko: "아직 등록된 목록이 없습니다."
              })}
            </p>
            <button
              type="button"
              onClick={openCreateDrawer}
              className="mt-3 rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-sky-400"
            >
              + {t({ en: "New listing", uz: "Yangi e'lon", ru: "Новое объявление", ko: "새 목록" })}
            </button>
          </section>
        ) : (
          <ListingsGrid
            items={items}
            loading={loading}
            busyId={busyId}
            onEdit={openEditDrawer}
            onToggleStatus={handleToggleStatus}
            onDelete={handleDelete}
          />
        )}

        {!loading && items.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-slate-800 pt-3 text-sm text-slate-300">
            <p>
              {t({ en: "Page", uz: "Sahifa", ru: "Страница", ko: "페이지" })} {page} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => replaceQuery({ page: String(page - 1) })}
                disabled={page <= 1}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("services.pagination.prev")}
              </button>
              <button
                type="button"
                onClick={() => replaceQuery({ page: String(page + 1) })}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-700 px-3 py-1 text-xs hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("services.pagination.next")}
              </button>
            </div>
          </div>
        )}
      </div>

      <ListingDrawer
        open={isDrawerOpen}
        mode={drawerMode === "edit" ? "edit" : "create"}
        initial={drawerMode === "edit" ? activeEditItem : null}
        saving={saving}
        onClose={closeDrawer}
        onSubmit={handleDrawerSubmit}
      />
    </AgentRoute>
  );
}

export default function AgentListingsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-300">Loading listings...</div>}>
      <AgentListingsPageContent />
    </Suspense>
  );
}
