"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ServicesHub } from "@/components/ServicesHub";
import { getAgents, type AgentListItem } from "@/api/agent";

const pageSize = 12;

export default function AgentDashboardPage() {
  const view = useSearchParams().get("view");
  const isServicesView = view === "services";
  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState<"recent" | "oldest" | "likes" | "views" | "rating">("rating");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (isServicesView) return;
    const timer = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isServicesView, searchInput]);

  useEffect(() => {
    if (isServicesView) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { items, total } = await getAgents({
          active: true,
          sort,
          page,
          limit: pageSize,
          search: searchValue || undefined
        });
        setAgents(items.filter((item) => item.active !== false));
        setTotal(total);
      } catch (err) {
        console.error("Agents load error", err);
        setError("Agentlarni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isServicesView, page, searchValue, sort]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const pageButtons = useMemo(() => {
    const maxButtons = 6;
    if (totalPages <= maxButtons) {
      return Array.from({ length: totalPages }, (_, idx) => idx + 1);
    }
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    const buttons = [];
    for (let i = start; i <= end; i += 1) buttons.push(i);
    return buttons;
  }, [currentPage, totalPages]);

  if (isServicesView) {
    return <ServicesHub />;
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Agentlar bo'limi</p>
            <h1 className="text-lg font-semibold text-slate-50">Agentlar ro'yxati</h1>
            <p className="mt-1 text-sm text-slate-400">
              Profilni ko'rish va elonlar bo'yicha batafsil ma'lumot oling.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <input
              className="w-60 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              placeholder="Agent qidirish (ism yoki username)"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <select
              className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as typeof sort);
                setPage(1);
              }}
            >
              <option value="rating">Reyting</option>
              <option value="likes">Layklar</option>
              <option value="views">Ko'rishlar</option>
              <option value="recent">Yangi</option>
              <option value="oldest">Eng eski</option>
            </select>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
        {loading ? (
          <p className="text-sm text-slate-400">Yuklanmoqda...</p>
        ) : error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : agents.length === 0 ? (
          <p className="text-sm text-slate-500">Agentlar topilmadi.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {agents.map((agent) => {
              const id = agent.id || agent._id || agent.user?._id || "";
              const displayName = agent.name || agent.user?.name || "Noma'lum agent";
              const displayUsername = agent.nickname || agent.username || agent.user?.username || "agent";
              const avatar = agent.avatarUrl || agent.user?.avatarUrl || "/avatars/agent-01.jpg";
              return (
                <Link
                  key={id}
                  href={`/agents/${id}`}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/60"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={displayName}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{displayName}</p>
                      <p className="text-xs text-slate-400">@{displayUsername}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span className="rounded-full bg-slate-900 px-3 py-1">
                      Reyting: {agent.rating?.toFixed?.(1) ?? agent.rating ?? "—"}
                    </span>
                    <span className="rounded-full bg-slate-900 px-3 py-1">
                      Ko'rishlar: {agent.views ?? 0}
                    </span>
                    <span className="rounded-full bg-slate-900 px-3 py-1">
                      Layklar: {agent.likes ?? 0}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1"
              disabled={currentPage === 1}
            >
              Oldingi
            </button>
            {pageButtons.map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => setPage(btn)}
                className={`rounded-full px-3 py-1 ${
                  currentPage === btn
                    ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                    : "bg-slate-900/70"
                }`}
              >
                {btn}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              className="rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1"
              disabled={currentPage === totalPages}
            >
              Keyingi
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
