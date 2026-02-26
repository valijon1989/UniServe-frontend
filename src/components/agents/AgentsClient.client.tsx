"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ServicesHub } from "@/components/ServicesHub";
import { getAgents, type AgentListItem } from "@/api/agent";
import { Avatar } from "@/components/ui/Avatar";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

const DEFAULT_PAGE_SIZE = 24;
const PAGE_SIZES = [12, 24, 48];
const SECTION_PAGE_SIZE = 6;

type SortKey = "best_match" | "rating" | "likes" | "views" | "recent" | "oldest";


const toNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^0-9.-]+/g, "");
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const normalizeAvatar = (value?: string) => {
  if (!value) return "";
  if (value.startsWith("/avatars/")) {
    const filename = value.split("/").pop() || "";
    const match = filename.match(/^agent(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (match) {
      const num = Number(match[1]);
      const padded = Number.isFinite(num) ? String(num).padStart(2, "0") : match[1];
      return `/avatars/agent-${padded}.jpg`;
    }
    return value;
  }
  if (value.startsWith("/static/avatars/")) {
    const filename = value.split("/").pop() || "";
    const match = filename.match(/^agent(\d+)\.(jpg|jpeg|png|webp)$/i);
    if (match) {
      const num = Number(match[1]);
      const padded = Number.isFinite(num) ? String(num).padStart(2, "0") : match[1];
      return `/avatars/agent-${padded}.jpg`;
    }
    return value.replace("/static/avatars/", "/avatars/");
  }
  return toAbsoluteMediaUrl(value) || value;
};

const getAvatar = (agent: AgentListItem) => {
  const normalized =
    normalizeAvatar(agent.avatarUrl) ||
    normalizeAvatar(agent.user?.avatarUrl) ||
    "";
  return normalized;
};

const getDisplayName = (agent: AgentListItem) => {
  return agent.name || agent.user?.name || "Noma'lum agent";
};

const getUsername = (agent: AgentListItem) => {
  return agent.nickname || agent.username || agent.user?.username || "agent";
};

const getCompletedJobs = (agent: AgentListItem) => {
  return toNumber((agent as any).completedJobs ?? (agent as any).jobsDone ?? agent.user?.postsCount ?? 0);
};

const getResponseMinutes = (agent: AgentListItem) => {
  const raw = (agent as any).responseTime ?? (agent as any).responseMinutes;
  const parsed = toNumber(raw);
  if (parsed > 0) return parsed;
  return null;
};

const getRecentActivity = (agent: AgentListItem) => {
  return toNumber(agent.views) + toNumber(agent.likes);
};

const getListingsCount = (agent: AgentListItem) => {
  const baseCount = agent.listingsCount ?? (agent as any).productsCount ?? 0;
  const serviceCount = (agent as any).servicesCount ?? 0;
  return toNumber(baseCount) + toNumber(serviceCount);
};

const getComplaintRate = (agent: AgentListItem) => {
  return toNumber((agent as any).complaintRate ?? (agent as any).cancelRate ?? 0);
};

const computeScore = (agent: AgentListItem) => {
  const rating = toNumber(agent.rating);
  const completed = getCompletedJobs(agent);
  const activity = getRecentActivity(agent);
  const complaint = getComplaintRate(agent);

  const score =
    rating * 20 +
    Math.log10(completed + 1) * 12 +
    Math.log10(activity + 1) * 6 -
    complaint * 15;

  return score;
};

const getRoleLabel = (agent: AgentListItem) => {
  return agent.kind === "SELLER" ? "Savdo agenti" : "Xizmat agenti";
};

const getStatusLabel = (agent: AgentListItem) => {
  const raw = (agent as any).status ?? (agent as any).onlineStatus ?? (agent as any).availability;
  if (typeof raw === "string") {
    const value = raw.toLowerCase();
    if (["online", "available", "active"].includes(value)) return "Online";
    if (["busy", "band"].includes(value)) return "Band";
    if (["offline", "away"].includes(value)) return "Offline";
  }
  if (raw === true) return "Online";
  if (raw === false) return "Offline";
  return "Offline";
};

const getLastActiveLabel = (agent: AgentListItem) => {
  const raw =
    (agent as any).lastActiveAt ||
    (agent as any).lastActive ||
    (agent as any).updatedAt ||
    agent.user?.updatedAt ||
    agent.user?.createdAt;
  if (!raw) return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMin < 60) return `${diffMin} daqiqa oldin`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} soat oldin`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} kun oldin`;
};

const getTags = (agent: AgentListItem) => {
  const tags: string[] = [];
  const socials = (agent as any).socialServices || [];
  const materials = (agent as any).materialServices || [];
  const serviceCategory = (agent as any).serviceCategory;
  if (Array.isArray(socials)) tags.push(...socials);
  if (Array.isArray(materials)) tags.push(...materials);
  if (serviceCategory) tags.push(serviceCategory);
  if (agent.region) tags.push(agent.region);
  return Array.from(new Set(tags)).filter(Boolean);
};

const getPriceLabel = (agent: AgentListItem) => {
  const price =
    (agent as any).hourlyRate ??
    (agent as any).priceHourly ??
    (agent as any).price ??
    (agent as any).rate;
  const currency = (agent as any).currency || (agent as any).priceCurrency;
  if (!price) return "Kelishiladi";
  if (currency) return `${price} ${currency}/soat`;
  return `${price} / soat`;
};

const getVerifiedLabel = (agent: AgentListItem) => {
  if (agent.verifiedByAdmin) return "Admin verified";
  if (agent.isVerified || agent.user?.isVerified) return "ID verified";
  return null;
};


const buildQueryString = (params: Record<string, string | number | boolean | undefined>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === "") return;
    sp.set(key, String(value));
  });
  const query = sp.toString();
  return query ? `?${query}` : "";
};

export function AgentsClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const view = searchParams.get("view");
  const isServicesView = view === "services";

  const [agents, setAgents] = useState<AgentListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const [searchInput, setSearchInput] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [sort, setSort] = useState<SortKey>("best_match");
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [page, setPage] = useState(1);
  const [ratingMin, setRatingMin] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sellerPage, setSellerPage] = useState(1);
  const [servicePage, setServicePage] = useState(1);

  useEffect(() => {
    if (isServicesView) return;
    const fromQuery = (key: string) => searchParams.get(key) || "";
    const qPage = Math.max(1, Number(fromQuery("page")) || 1);
    const qLimit = Number(fromQuery("limit")) || DEFAULT_PAGE_SIZE;
    const qSort = (fromQuery("sort") as SortKey) || "best_match";
    const qRating = Number(fromQuery("ratingMin")) || 0;
    const qVerified = fromQuery("verified") === "1";
    const qSearch = fromQuery("search");

    setPage(qPage);
    setPageSize(PAGE_SIZES.includes(qLimit) ? qLimit : DEFAULT_PAGE_SIZE);
    setSort(qSort);
    setRatingMin(qRating);
    setVerifiedOnly(qVerified);
    setSearchInput(qSearch);
    setSearchValue(qSearch);
  }, [isServicesView, searchParams]);

  useEffect(() => {
    if (isServicesView) return;
    const timer = window.setTimeout(() => {
      setSearchValue(searchInput.trim());
      setPage(1);
      setSellerPage(1);
      setServicePage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [isServicesView, searchInput]);

  useEffect(() => {
    if (isServicesView) return;
    const query = buildQueryString({
      page,
      limit: pageSize,
      sort,
      ratingMin: ratingMin || undefined,
      verified: verifiedOnly ? 1 : undefined,
      search: searchValue || undefined,
      view: view || undefined
    });
    router.replace(`/agents${query}`);
  }, [isServicesView, page, pageSize, ratingMin, router, searchValue, sort, verifiedOnly, view]);

  useEffect(() => {
    if (isServicesView) return;
    setSellerPage(1);
    setServicePage(1);
  }, [isServicesView, ratingMin, sort, verifiedOnly]);

  useEffect(() => {
    if (isServicesView) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const apiSort = sort === "best_match" ? "rating" : sort;
        const fetchLimit = Math.max(pageSize, 200);
        const { items, total } = await getAgents({
          active: true,
          sort: apiSort as any,
          page: 1,
          limit: fetchLimit,
          search: searchValue || undefined,
          verified: verifiedOnly ? 1 : undefined,
          withListings: 1
        });
        const activeAgents = items.filter((item) => item.active !== false);
        setAgents(activeAgents);
        setTotal(total);
      } catch (err) {
        console.error("Agents load error", err);
        setError("Agentlarni yuklashda xatolik yuz berdi.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [isServicesView, page, pageSize, searchValue, sort, verifiedOnly]);

  const filteredAgents = useMemo(() => {
    const byListings = agents.filter((agent) => getListingsCount(agent) > 0);
    const byRating = byListings.filter((agent) => toNumber(agent.rating) >= ratingMin);
    const verifiedFiltered = byRating.filter(
      (agent) => agent.verifiedByAdmin || agent.isVerified || agent.user?.isVerified
    );
    const effective = verifiedOnly
      ? verifiedFiltered.length
        ? verifiedFiltered
        : byRating
      : byRating;
    const normalized = [...effective];
    if (sort === "best_match") return normalized.sort((a, b) => computeScore(b) - computeScore(a));
    if (sort === "rating") return normalized.sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
    if (sort === "likes") return normalized.sort((a, b) => toNumber(b.likes) - toNumber(a.likes));
    if (sort === "views") return normalized.sort((a, b) => toNumber(b.views) - toNumber(a.views));
    return normalized;
  }, [agents, ratingMin, sort, verifiedOnly]);

  const hasVerified = useMemo(
    () => agents.some((agent) => agent.verifiedByAdmin || agent.isVerified || agent.user?.isVerified),
    [agents]
  );


  if (isServicesView) {
    return <ServicesHub />;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-emerald-200">Agentlar bo'limi</p>
            <h1 className="text-xl font-semibold text-slate-50">Agentlar ro'yxati</h1>
            <p className="mt-1 text-sm text-slate-400">
              Top agentlar, keyin esa barcha aktiv agentlar ro'yxati.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-slate-300">
            <input
              className="w-60 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              placeholder="Agent qidirish (ism, username, keyword)"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
            <select
              className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              value={sort}
              onChange={(event) => {
                setSort(event.target.value as SortKey);
                setPage(1);
              }}
            >
              <option value="best_match">Best match</option>
              <option value="rating">Reyting</option>
              <option value="likes">Layklar</option>
              <option value="views">Ko'rishlar</option>
              <option value="recent">Yangi</option>
              <option value="oldest">Eng eski</option>
            </select>
            <select
              className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              value={ratingMin}
              onChange={(event) => {
                setRatingMin(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value={0}>Reyting: hammasi</option>
              <option value={4}>4.0+</option>
              <option value={4.5}>4.5+</option>
              <option value={4.8}>4.8+</option>
            </select>
            <select
              className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2 text-xs text-slate-100"
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size} / sahifa
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-2">
              <input
                type="checkbox"
                className="h-3 w-3"
                checked={verifiedOnly}
                onChange={(event) => {
                  setVerifiedOnly(event.target.checked);
                  setPage(1);
                }}
              />
              Verified
            </label>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">All Active Agents</p>
            <h2 className="text-xl font-semibold text-slate-50">Barcha aktiv agentlar</h2>
            <p className="text-sm text-slate-400">Best match bo'yicha tartiblangan ro'yxat.</p>
          </div>
        </div>
        {verifiedOnly && !hasVerified && (
          <div className="mb-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
            Hozircha tasdiqlangan (verified) agentlar yo'q. Shuning uchun umumiy agentlar ko'rsatilmoqda.
          </div>
        )}

        {loading ? (
          <p className="text-sm text-slate-400">Yuklanmoqda...</p>
        ) : error ? (
          <p className="text-sm text-rose-300">{error}</p>
        ) : filteredAgents.length === 0 ? (
          <p className="text-sm text-slate-500">Agentlar topilmadi.</p>
        ) : (
          <div className="space-y-8">
            {(() => {
              const sortAgents = (list: AgentListItem[]) => {
                const normalized = [...list];
                if (sort === "best_match") return normalized.sort((a, b) => computeScore(b) - computeScore(a));
                if (sort === "rating") return normalized.sort((a, b) => toNumber(b.rating) - toNumber(a.rating));
                if (sort === "likes") return normalized.sort((a, b) => toNumber(b.likes) - toNumber(a.likes));
                if (sort === "views") return normalized.sort((a, b) => toNumber(b.views) - toNumber(a.views));
                return normalized;
              };

              const sellersAll = sortAgents(filteredAgents.filter((agent) => agent.kind === "SELLER"));
              const servicesAll = sortAgents(filteredAgents.filter((agent) => agent.kind === "SERVICE"));

              const sellerPages = Math.max(1, Math.ceil(sellersAll.length / SECTION_PAGE_SIZE));
              const servicePages = Math.max(1, Math.ceil(servicesAll.length / SECTION_PAGE_SIZE));
              const safeSellerPage = Math.min(sellerPage, sellerPages);
              const safeServicePage = Math.min(servicePage, servicePages);

              const sellers = sellersAll.slice(
                (safeSellerPage - 1) * SECTION_PAGE_SIZE,
                safeSellerPage * SECTION_PAGE_SIZE
              );
              const services = servicesAll.slice(
                (safeServicePage - 1) * SECTION_PAGE_SIZE,
                safeServicePage * SECTION_PAGE_SIZE
              );

              const renderGrid = (list: AgentListItem[]) => (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {list.map((agent) => {
                    const id = agent.user?._id || agent.id || agent._id || "";
                    const name = getDisplayName(agent);
                    const username = getUsername(agent);
                    const rating = toNumber(agent.rating).toFixed(1);
                    const completed = getCompletedJobs(agent);
                    const listingsCount = getListingsCount(agent);
                    const verified = agent.verifiedByAdmin || agent.isVerified;
                    return (
                      <Link
                        key={id}
                        href={`/agents/${id}`}
                        className="flex h-[260px] items-stretch gap-4 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-left transition hover:-translate-y-0.5 hover:border-emerald-400/60"
                      >
                        <div className="flex w-[40%] items-center justify-center rounded-2xl bg-slate-950/60 p-3">
                          <Avatar
                            src={getAvatar(agent)}
                            alt={name}
                            fallbackText={name}
                            size={112}
                            className="border border-slate-700/70 shadow-lg shadow-black/30"
                          />
                        </div>

                        <div className="flex w-[60%] min-w-0 flex-col">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-100">{name}</p>
                              <p className="truncate text-[11px] text-slate-400">@{username}</p>
                            </div>
                            <div className="flex items-center gap-2 text-[10px]">
                              {getVerifiedLabel(agent) && (
                                <span
                                  title="Verified"
                                  className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-200"
                                >
                                  ✔
                                </span>
                              )}
                              <span
                                title={`Status: ${getStatusLabel(agent)}`}
                                className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-300"
                              >
                                {getStatusLabel(agent) === "Online"
                                  ? "●"
                                  : getStatusLabel(agent) === "Band"
                                    ? "◐"
                                    : "○"}
                              </span>
                            </div>
                          </div>

                          <div className="mt-2 grid grid-cols-3 gap-2 text-[11px] text-slate-300">
                            <span title="Rating">{Number(rating) > 0 ? `⭐ ${rating}` : "🆕"}</span>
                            <span title="Completed">✅ {completed}</span>
                            <span title="Response time">
                              ⏱ {getResponseMinutes(agent) ? `~${getResponseMinutes(agent)}m` : "—"}
                            </span>
                            <span title="Last active">🕒 {getLastActiveLabel(agent)}</span>
                            <span title="Listings">📄 {listingsCount}</span>
                            <span title="Views">👁 {agent.views ?? 0}</span>
                          </div>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {(() => {
                              const tags = getTags(agent);
                              const visible = tags.slice(0, 2);
                              const rest = tags.length - visible.length;
                              return (
                                <>
                                  {visible.map((tag) => (
                                    <span
                                      key={tag}
                                      className="rounded-full border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                  {rest > 0 && (
                                    <span className="rounded-full border border-slate-700/70 bg-slate-800/60 px-2 py-0.5 text-[10px] text-slate-300">
                                      +{rest}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>

                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300">
                            <span title="Price">💰 {getPriceLabel(agent)}</span>
                            <span title="Likes">❤ {agent.likes ?? 0}</span>
                          </div>

                          <div className="mt-auto flex items-center gap-2 pt-3">
                            <span
                              title="Chat"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-sm text-emerald-100"
                            >
                              💬
                            </span>
                            <span
                              title="Profile"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 text-sm text-slate-200"
                            >
                              👤
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              );

              const renderPager = (current: number, totalPages: number, onChange: (value: number) => void) => {
                if (totalPages <= 1) return null;
                const buttons = Array.from({ length: totalPages }, (_, idx) => idx + 1).slice(0, 6);
                return (
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-300">
                    <button
                      type="button"
                      onClick={() => onChange(Math.max(1, current - 1))}
                      className="rounded-full border border-slate-700 px-3 py-1 transition hover:border-emerald-400/60"
                    >
                      Oldingi
                    </button>
                    {buttons.map((btn) => (
                      <button
                        key={btn}
                        type="button"
                        onClick={() => onChange(btn)}
                        className={`rounded-full border px-3 py-1 transition ${
                          btn === current
                            ? "border-emerald-400/70 bg-emerald-500/10 text-emerald-200"
                            : "border-slate-700 hover:border-emerald-400/60"
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => onChange(Math.min(totalPages, current + 1))}
                      className="rounded-full border border-slate-700 px-3 py-1 transition hover:border-emerald-400/60"
                    >
                      Keyingi
                    </button>
                  </div>
                );
              };

              return (
                <>
                  <div>
                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Savdo agentlari</p>
                      <h3 className="text-lg font-semibold text-slate-100">Savdo agentlari (6 ta)</h3>
                    </div>
                    {renderGrid(sellers)}
                    {renderPager(safeSellerPage, sellerPages, (value) => setSellerPage(value))}
                  </div>
                  <div>
                    <div className="mb-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-300">Xizmat agentlari</p>
                      <h3 className="text-lg font-semibold text-slate-100">Xizmat agentlari (6 ta)</h3>
                    </div>
                    {renderGrid(services)}
                    {renderPager(safeServicePage, servicePages, (value) => setServicePage(value))}
                  </div>
                </>
              );
            })()}
          </div>
        )}

      </section>
    </div>
  );
}

export default AgentsClient;
