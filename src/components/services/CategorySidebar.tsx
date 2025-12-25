"use client";

import { useEffect, useState } from "react";
import type { ServiceCategoryNode } from "@/lib/servicesTypes";

type Props = {
  categories: ServiceCategoryNode[];
  selectedTab?: string;
  selectedCategory?: string;
  onSelect: (tab: string, category?: string, subCategory?: string) => void;
  title: string;
};

export function CategorySidebar({
  categories,
  selectedTab,
  selectedCategory,
  onSelect,
  title
}: Props) {
  const [openTabs, setOpenTabs] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!selectedTab) return;
    setOpenTabs((prev) => ({ ...prev, [selectedTab]: true }));
  }, [selectedTab]);

  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[88px] h-[calc(100vh-88px)] overflow-auto rounded-3xl border border-slate-800 bg-slate-950/70 p-4">
        <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        <div className="mt-3 space-y-2">
          {categories.map((cat) => {
            const isActive = selectedTab === cat.slug;
            const isOpen = openTabs[cat.slug] ?? isActive;
            return (
              <div key={cat.slug} className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpenTabs((prev) => ({ ...prev, [cat.slug]: !isOpen }));
                    onSelect(cat.slug);
                  }}
                  className={`w-full rounded-xl px-3 py-2 text-left text-sm transition ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-sky-500/20 text-emerald-100"
                      : "bg-slate-900/70 text-slate-300 hover:text-slate-100"
                  }`}
                >
                  {cat.name}
                </button>
                {isOpen && cat.children && cat.children.length > 0 && (
                  <div className="mt-3 space-y-1 pl-2">
                    {cat.children.map((child) => {
                      const childActive = isActive && selectedCategory === child.slug;
                      return (
                        <button
                          key={child.slug}
                          type="button"
                          onClick={() => onSelect(cat.slug, child.slug)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-xs ${
                            childActive
                              ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                              : "text-slate-400 hover:text-slate-200"
                          }`}
                        >
                          {child.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
