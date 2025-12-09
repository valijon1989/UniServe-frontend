"use client";

import { useCategories } from "@/hooks/useCategories";

interface CategoriesSidebarProps {
  selected?: string;
  onSelect: (slug: string) => void;
}

export default function CategoriesSidebar({ selected, onSelect }: CategoriesSidebarProps) {
  const { items, loading } = useCategories();
  if (loading) return null;

  return (
    <aside className="categories-sidebar">
      {items.map((cat) => {
        const active = selected === cat.slug;
        return (
          <div
            key={cat._id || cat.id || cat.slug}
            className={active ? "cat-item active" : "cat-item"}
            onClick={() => onSelect(cat.slug)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(cat.slug);
              }
            }}
          >
            <span className="icon">
              <i className={cat.icon || "ri-store-2-line"}></i>
            </span>
            <span className="text">{cat.name}</span>
          </div>
        );
      })}
    </aside>
  );
}
