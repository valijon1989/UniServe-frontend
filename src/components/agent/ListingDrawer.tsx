"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "@/api/agent";
import { useI18n } from "@/context/i18n";

export type ListingDrawerMode = "create" | "edit";
export type ListingSubmitIntent = "save_draft" | "publish" | "update";

export interface ListingFormValues {
  title: string;
  description: string;
  category: string;
  price: number;
  currency: string;
  imageUrl: string;
  location: string;
  tagsInput: string;
}

interface Props {
  open: boolean;
  mode: ListingDrawerMode;
  initial?: Listing | null;
  saving?: boolean;
  onClose: () => void;
  onSubmit: (values: ListingFormValues, intent: ListingSubmitIntent) => Promise<void>;
}

const emptyValues: ListingFormValues = {
  title: "",
  description: "",
  category: "SERVICE",
  price: 0,
  currency: "USD",
  imageUrl: "",
  location: "",
  tagsInput: ""
};

const toFormValues = (initial?: Listing | null): ListingFormValues => {
  if (!initial) return emptyValues;
  return {
    title: initial.title || "",
    description: initial.description || "",
    category: initial.category || "SERVICE",
    price: typeof initial.price === "number" ? initial.price : Number(initial.price || 0) || 0,
    currency: initial.currency || "USD",
    imageUrl: initial.imageUrl || initial.images?.[0]?.url || "",
    location: initial.location || "",
    tagsInput: Array.isArray(initial.tags) ? initial.tags.join(", ") : ""
  };
};

export function ListingDrawer({ open, mode, initial, saving = false, onClose, onSubmit }: Props) {
  const { t } = useI18n();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [values, setValues] = useState<ListingFormValues>(emptyValues);

  const defaultIntent = useMemo<ListingSubmitIntent>(() => {
    return mode === "edit" ? "update" : "publish";
  }, [mode]);

  useEffect(() => {
    if (!open) return;
    setValues(toFormValues(initial));
  }, [open, initial, mode]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || saving) return;
      onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open, saving]);

  if (!open) return null;

  const handleChange = (field: keyof ListingFormValues, value: string | number) => {
    setValues((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const submitWithIntent = async (intent: ListingSubmitIntent) => {
    if (saving) return;
    if (!formRef.current?.reportValidity()) return;
    await onSubmit(values, intent);
  };

  const handleFormSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    void submitWithIntent(defaultIntent);
  };

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label={t({ en: "Close drawer", uz: "Panelni yopish", ru: "Закрыть", ko: "닫기" })}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
        disabled={saving}
      />
      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950 shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-950/95 px-4 py-3 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-slate-100">
              {mode === "edit"
                ? t({ en: "Edit listing", uz: "E'lonni tahrirlash", ru: "Редактировать объявление", ko: "목록 수정" })
                : t({ en: "Create listing", uz: "Yangi e'lon", ru: "Создать объявление", ko: "새 목록 생성" })}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === "edit"
                ? t({
                    en: "Update listing details and publish state.",
                    uz: "E'lon tafsilotlari va holatini yangilang.",
                    ru: "Обновите детали объявления и состояние публикации.",
                    ko: "목록 정보와 게시 상태를 업데이트하세요."
                  })
                : t({
                    en: "Fill the details and save as draft or publish.",
                    uz: "Ma'lumotlarni kiriting va draft yoki publish qiling.",
                    ru: "Заполните данные и сохраните как черновик или опубликуйте.",
                    ko: "세부 정보를 입력하고 초안 저장 또는 게시하세요."
                  })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t({ en: "Close", uz: "Yopish", ru: "Закрыть", ko: "닫기" })}
          </button>
        </div>

        <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-3 p-4 text-sm">
          <fieldset disabled={saving} className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-300">{t("form.title")}</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                  value={values.title}
                  onChange={(event) => handleChange("title", event.target.value)}
                  placeholder={t("form.titlePlaceholder")}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">{t("form.category")}</label>
                <select
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                  value={values.category}
                  onChange={(event) => handleChange("category", event.target.value)}
                >
                  <option value="SOCIAL_SERVICE">{t("form.category.social")}</option>
                  <option value="MATERIAL_SERVICE">{t("form.category.material")}</option>
                  <option value="PRODUCT">{t("form.category.product")}</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs text-slate-300">{t("form.description")}</label>
              <textarea
                className="min-h-[100px] w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                value={values.description}
                onChange={(event) => handleChange("description", event.target.value)}
                placeholder={t("form.descriptionPlaceholder")}
                required
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.5fr,1fr]">
              <div>
                <label className="mb-1 block text-xs text-slate-300">{t("form.price")}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                    value={values.price}
                    onChange={(event) => handleChange("price", Number(event.target.value) || 0)}
                    placeholder="100"
                    required
                  />
                  <select
                    className="w-24 rounded-lg border border-slate-700 bg-slate-900/80 px-2 py-2 text-xs text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                    value={values.currency}
                    onChange={(event) => handleChange("currency", event.target.value)}
                  >
                    <option value="USD">USD</option>
                    <option value="KRW">KRW</option>
                    <option value="UZS">UZS</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">{t("form.image")}</label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                  value={values.imageUrl}
                  onChange={(event) => handleChange("imageUrl", event.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  {t({ en: "Location", uz: "Lokatsiya", ru: "Локация", ko: "위치" })}
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                  value={values.location}
                  onChange={(event) => handleChange("location", event.target.value)}
                  placeholder={t({ en: "Optional", uz: "Ixtiyoriy", ru: "Опционально", ko: "선택 사항" })}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-slate-300">
                  {t({ en: "Tags", uz: "Taglar", ru: "Теги", ko: "태그" })}
                </label>
                <input
                  className="w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/60 focus:border-sky-500 focus:ring-1"
                  value={values.tagsInput}
                  onChange={(event) => handleChange("tagsInput", event.target.value)}
                  placeholder={t({
                    en: "cleaning, home, fast",
                    uz: "cleaning, home, fast",
                    ru: "cleaning, home, fast",
                    ko: "cleaning, home, fast"
                  })}
                />
              </div>
            </div>
          </fieldset>

          <div className="flex flex-wrap gap-2 border-t border-slate-800 pt-3">
            {mode === "create" && (
              <button
                type="button"
                onClick={() => void submitWithIntent("save_draft")}
                disabled={saving}
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? t({ en: "Saving...", uz: "Saqlanmoqda...", ru: "Сохранение...", ko: "저장 중..." })
                  : t({ en: "Save Draft", uz: "Draft saqlash", ru: "Сохранить черновик", ko: "초안 저장" })}
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-lg shadow-sky-500/30 hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {saving
                ? t({ en: "Saving...", uz: "Saqlanmoqda...", ru: "Сохранение...", ko: "저장 중..." })
                : mode === "edit"
                  ? t({ en: "Update", uz: "Yangilash", ru: "Обновить", ko: "업데이트" })
                  : t({ en: "Publish", uz: "Publish", ru: "Опубликовать", ko: "게시" })}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}
