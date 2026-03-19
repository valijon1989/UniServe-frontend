"use client";

import { useEffect, useMemo, useState } from "react";
import type { Listing } from "@/api/agent";
import { useI18n } from "@/context/i18n";

interface Props {
  onSubmit: (values: Listing) => Promise<void>;
  initial?: Listing | null;
  submitLabel?: string;
  onCancel?: () => void;
}

const emptyListing: Listing = {
  title: "",
  description: "",
  price: 0,
  currency: "USD",
  category: "SERVICE",
  imageUrl: ""
};

export function AgentListingForm({ onSubmit, initial, submitLabel, onCancel }: Props) {
  const normalizedInitial = useMemo<Listing>(() => {
    if (!initial) return emptyListing;
    return {
      ...emptyListing,
      ...initial,
      price: typeof initial.price === "number" ? initial.price : Number(initial.price || 0) || 0,
      imageUrl: initial.imageUrl || initial.images?.[0]?.url || ""
    };
  }, [initial]);
  const syncKey = initial?._id || initial?.id || "__new__";
  const [values, setValues] = useState<Listing>(normalizedInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    setValues(normalizedInitial);
    setError(null);
  }, [normalizedInitial, syncKey]);

  const handleChange = (field: keyof Listing, value: string | number) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(values);
      if (!initial) {
        setValues(emptyListing);
      }
    } catch (err: any) {
      setError(err?.message || t("form.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-sm">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("form.title")}
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            value={values.title}
            onChange={(e) => handleChange("title", e.target.value)}
            placeholder={t("form.titlePlaceholder")}
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("form.category")}
          </label>
          <select
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            value={values.category}
            onChange={(e) => handleChange("category", e.target.value)}
          >
            <option value="SOCIAL_SERVICE">{t("form.category.social")}</option>
            <option value="MATERIAL_SERVICE">{t("form.category.material")}</option>
            <option value="PRODUCT">{t("form.category.product")}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs text-slate-300">
          {t("form.description")}
        </label>
        <textarea
          className="min-h-[80px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
          value={values.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder={t("form.descriptionPlaceholder")}
          required
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-[1.5fr,1fr]">
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("form.price")}
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              value={values.price}
              onChange={(e) =>
                handleChange("price", Number(e.target.value) || 0)
              }
              placeholder="100"
              required
            />
            <select
              className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
              value={values.currency}
              onChange={(e) => handleChange("currency", e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="KRW">KRW</option>
              <option value="UZS">UZS</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-300">
            {t("form.image")}
          </label>
          <input
            className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
            value={values.imageUrl || ""}
            onChange={(e) => handleChange("imageUrl", e.target.value)}
            placeholder="https://..."
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-sky-500 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? t("form.saving") : submitLabel || t("form.save")}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t({ en: "Cancel", uz: "Bekor qilish", ru: "Отмена", ko: "취소" })}
          </button>
        )}
      </div>
    </form>
  );
}
