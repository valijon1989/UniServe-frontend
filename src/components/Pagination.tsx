"use client";

interface PaginationProps {
  page: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, total = 0, limit = 12, onPageChange }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, limit)));
  const canPrev = page > 1;
  const canNext = page < totalPages;

  const pagesToShow = Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 6);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/90 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => canPrev && onPageChange(page - 1)}
          disabled={!canPrev}
          className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Oldingi
        </button>

        <div className="flex items-center gap-1">
          {pagesToShow.map((num) => (
            <button
              type="button"
              key={num}
              onClick={() => onPageChange(num)}
              className={`h-9 w-9 rounded-full text-center text-sm font-semibold transition ${
                num === page
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
                  : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              {num}
            </button>
          ))}
          {totalPages > pagesToShow.length && <span className="px-2 text-slate-400">…</span>}
        </div>

        <button
          type="button"
          onClick={() => canNext && onPageChange(page + 1)}
          disabled={!canNext}
          className="rounded-xl border border-slate-200 px-3 py-2 font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Keyingi
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Jami: {total} ta mahsulot · {totalPages} sahifa
      </p>
    </div>
  );
}
