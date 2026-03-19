"use client";

export interface RelatedProductCardItem {
  id: string;
  title: string;
  category?: string;
  price?: number | null;
  image: string;
}

export function RelatedProductsSection({
  title,
  items
}: {
  title: string;
  items: RelatedProductCardItem[];
}) {
  if (!items.length) return null;

  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-[0_24px_48px_rgba(15,23,42,0.08)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Related products</p>
          <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{items.length} ta variant</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {items.map((item) => (
          <article key={item.id} className="overflow-hidden rounded-[1.5rem] border border-slate-100 bg-slate-50">
            <img
              src={item.image}
              alt={item.title}
              className="h-40 w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.png";
              }}
            />
            <div className="space-y-2 p-4">
              {item.category ? <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">{item.category}</p> : null}
              <h3 className="line-clamp-2 text-sm font-semibold text-slate-900">{item.title}</h3>
              {typeof item.price === "number" ? (
                <p className="text-sm font-black text-slate-950">${item.price.toLocaleString("en-US", { maximumFractionDigits: 2 })}</p>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

