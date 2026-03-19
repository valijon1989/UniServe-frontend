"use client";

import type { Listing, ListingStatus } from "@/api/agent";
import { useI18n } from "@/context/i18n";

interface Props {
  items: Listing[];
  loading: boolean;
  busyId?: string | null;
  onEdit: (item: Listing) => void;
  onToggleStatus: (item: Listing) => void;
  onDelete: (item: Listing) => void;
}

const resolveListingId = (item: Listing) => String(item._id || item.id || "");

const statusBadgeClass: Record<ListingStatus, string> = {
  ACTIVE: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30",
  PAUSED: "bg-amber-500/15 text-amber-200 ring-amber-500/30",
  DRAFT: "bg-slate-500/15 text-slate-300 ring-slate-500/30",
  ARCHIVED: "bg-rose-500/15 text-rose-200 ring-rose-500/30",
  SOLD: "bg-violet-500/15 text-violet-200 ring-violet-500/30"
};

const formatMoney = (price: number, currency: string) => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 0
    }).format(Number(price || 0));
  } catch {
    return `${Number(price || 0).toLocaleString("en-US")} ${currency || "USD"}`;
  }
};

const formatDate = (value?: string) => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

export function ListingsGrid({ items, loading, busyId, onEdit, onToggleStatus, onDelete }: Props) {
  const { t } = useI18n();

  const getStatusLabel = (status: ListingStatus) => {
    switch (status) {
      case "ACTIVE":
        return t({ en: "Active", uz: "Faol", ru: "Активно", ko: "활성" });
      case "PAUSED":
        return t({ en: "Paused", uz: "Pauza", ru: "Пауза", ko: "일시중지" });
      case "ARCHIVED":
        return t({ en: "Archived", uz: "Arxiv", ru: "Архив", ko: "보관" });
      case "SOLD":
        return t({ en: "Sold", uz: "Sotilgan", ru: "Продано", ko: "판매됨" });
      case "DRAFT":
      default:
        return t({ en: "Draft", uz: "Qoralama", ru: "Черновик", ko: "초안" });
    }
  };

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <div key={idx} className="animate-pulse rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="h-4 w-2/3 rounded bg-slate-800" />
            <div className="mt-2 h-3 w-1/2 rounded bg-slate-800" />
            <div className="mt-4 h-7 w-24 rounded bg-slate-800" />
            <div className="mt-4 flex gap-2">
              <div className="h-7 w-16 rounded bg-slate-800" />
              <div className="h-7 w-20 rounded bg-slate-800" />
              <div className="h-7 w-16 rounded bg-slate-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => {
        const id = resolveListingId(item);
        const status = (item.status || "DRAFT") as ListingStatus;
        const isBusy = busyId === id;
        return (
          <article key={id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-slate-100">
                  {item.title || t({ en: "Untitled", uz: "Nomsiz", ru: "Без названия", ko: "제목 없음" })}
                </h3>
                <p className="mt-1 truncate text-xs text-slate-400">{item.category || "—"}</p>
              </div>
              <span className={`inline-flex rounded-full px-2 py-1 text-[11px] font-medium ring-1 ${statusBadgeClass[status]}`}>
                {getStatusLabel(status)}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-200">{formatMoney(item.price, item.currency)}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {t({ en: "Updated", uz: "Yangilangan", ru: "Обновлено", ko: "업데이트" })}: {formatDate(item.updatedAt || item.createdAt)}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => onToggleStatus(item)}
                disabled={isBusy}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "ACTIVE"
                  ? t({ en: "Pause", uz: "Pauza", ru: "Пауза", ko: "일시중지" })
                  : t({ en: "Activate", uz: "Faollashtirish", ru: "Активировать", ko: "활성화" })}
              </button>
              <button
                type="button"
                onClick={() => onEdit(item)}
                disabled={isBusy}
                className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t({ en: "Edit", uz: "Tahrirlash", ru: "Редактировать", ko: "수정" })}
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                disabled={isBusy}
                className="rounded-md border border-rose-500/40 px-2 py-1 text-xs text-rose-200 hover:bg-rose-500/15 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t({ en: "Delete", uz: "O'chirish", ru: "Удалить", ko: "삭제" })}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
