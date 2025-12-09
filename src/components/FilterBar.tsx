"use client";

type FilterState = {
  category?: string;
  order?: string;
};

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (next: FilterState) => void;
}

export default function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const handleChange = (key: keyof FilterState, value: string) => {
    onFilterChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 shadow-sm backdrop-blur">
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Kategoriya</span>
        <select
          value={filters.category ?? ""}
          onChange={(e) => handleChange("category", e.target.value)}
          className="min-w-[160px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-inner outline-none focus:border-emerald-500"
        >
          <option value="">Barchasi</option>
          <option value="electronics">Elektronika</option>
          <option value="beauty">Go‘zallik</option>
          <option value="auto">Avto ehtiyot qismlar</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="font-medium">Saralash</span>
        <select
          value={filters.order ?? "popular"}
          onChange={(e) => handleChange("order", e.target.value)}
          className="min-w-[180px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-inner outline-none focus:border-emerald-500"
        >
          <option value="popular">Ommabop</option>
          <option value="priceLow">Narx — arzon</option>
          <option value="priceHigh">Narx — qimmat</option>
          <option value="rating">Eng yuqori reyting</option>
        </select>
      </label>
    </div>
  );
}
