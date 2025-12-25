import type { ServiceCategoryNode } from "@/lib/servicesTypes";

type Props = {
  categories: ServiceCategoryNode[];
  selectedTab?: string;
  selectedCategory?: string;
  onSelect: (tab: string, category?: string) => void;
};

export function CategoryChipsRow({ categories, selectedTab, selectedCategory, onSelect }: Props) {
  const activeTab = categories.find((cat) => cat.slug === selectedTab) || categories[0];

  return (
    <div className="lg:hidden">
      <div className="sticky top-[72px] z-20 -mx-4 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto pb-2 text-xs">
          {categories.map((cat) => {
            const active = selectedTab === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => onSelect(cat.slug)}
                className={`shrink-0 rounded-full px-4 py-2 ${
                  active
                    ? "bg-gradient-to-r from-emerald-500/30 to-sky-500/30 text-emerald-100"
                    : "bg-slate-900/70 text-slate-300"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
        {activeTab?.children && activeTab.children.length > 0 && (
          <div className="flex gap-2 overflow-x-auto text-[11px]">
            {activeTab.children.map((child) => {
              const active = selectedCategory === child.slug;
              return (
                <button
                  key={child.slug}
                  type="button"
                  onClick={() => onSelect(activeTab.slug, child.slug)}
                  className={`shrink-0 rounded-full px-3 py-1 ${
                    active
                      ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                      : "bg-slate-900/60 text-slate-400"
                  }`}
                >
                  {child.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
