"use client";

import { useMemo } from "react";

import type { DetailFeedbackValue } from "@/api/detailInteractions";

type FeedbackAction = {
  label: string;
  value: DetailFeedbackValue;
  count: number;
};

export function FeedbackWidget({
  title,
  description,
  actions,
  activeValue,
  disabled,
  loading,
  onSelect,
  saved,
  onToggleSaved,
  onShare,
  reportReason,
  onReportReasonChange,
  onSubmitReport,
  reportSubmitting,
  showUtilityActions = true,
  showReportForm = true
}: {
  title: string;
  description?: string;
  actions: FeedbackAction[];
  activeValue: DetailFeedbackValue | null;
  disabled?: boolean;
  loading?: boolean;
  onSelect: (value: DetailFeedbackValue) => void;
  saved: boolean;
  onToggleSaved: () => void;
  onShare: () => void;
  reportReason: string;
  onReportReasonChange: (value: string) => void;
  onSubmitReport: () => void;
  reportSubmitting?: boolean;
  showUtilityActions?: boolean;
  showReportForm?: boolean;
}) {
  const reportPlaceholder = useMemo(
    () => (title.toLowerCase().includes("tavsif") ? "Nima yetishmayapti yoki noto'g'ri?" : "Nima sababli mos emas deb hisoblaysiz?"),
    [title]
  );

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        {description && <p className="mt-1 text-xs text-slate-500">{description}</p>}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {actions.map((action) => {
          const active = activeValue === action.value;
          return (
            <button
              key={action.value}
              type="button"
              onClick={() => onSelect(action.value)}
              disabled={disabled || loading}
              className={`rounded-2xl border px-3 py-3 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                  : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
              }`}
            >
              <p className="text-sm font-semibold">{action.label}</p>
              <p className="mt-1 text-xs text-slate-500">{action.count.toLocaleString("en-US")}</p>
            </button>
          );
        })}
      </div>

      {showUtilityActions ? (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onToggleSaved}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              saved
                ? "border-amber-300 bg-amber-50 text-amber-800"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {saved ? "Saqlangan" : "Saqlash"}
          </button>
          <button
            type="button"
            onClick={onShare}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300"
          >
            Ulashish
          </button>
        </div>
      ) : null}

      {showReportForm ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-800">Shikoyat yoki izoh</p>
          <textarea
            value={reportReason}
            onChange={(event) => onReportReasonChange(event.target.value)}
            placeholder={reportPlaceholder}
            className="mt-2 min-h-[84px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-400"
          />
          <button
            type="button"
            onClick={onSubmitReport}
            disabled={reportSubmitting || !reportReason.trim()}
            className="mt-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 disabled:opacity-60"
          >
            {reportSubmitting ? "Yuborilmoqda..." : "Shikoyat yuborish"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
