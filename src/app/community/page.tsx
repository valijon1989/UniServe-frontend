"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getFeed, type FeedItem } from "@/api/feed";
import dayjs from "@/lib/dayjs";
import { fallbackCommunityGroups, type CommunityGroup } from "@/data/communityGroups";
import {
  fetchCommunityGroups,
  joinCommunityGroup,
  rateCommunityGroup,
  reportCommunityGroup
} from "@/api/community";

type Category = {
  id: string;
  label: string;
  icon: string;
  agentQuery?: string;
};

type SortFilter = "popular" | "new" | "active" | "rating" | "low-spam";

const COMMUNITY_CATEGORIES: Category[] = [
  { id: "consulting", label: "Consulting", icon: "🧭", agentQuery: "consulting" },
  { id: "translation", label: "Translation", icon: "🌐", agentQuery: "translation" },
  { id: "legal", label: "Legal", icon: "⚖️", agentQuery: "legal" },
  { id: "psychology", label: "Psychology", icon: "🧠", agentQuery: "psychology" },
  { id: "sports", label: "Sports", icon: "🏅", agentQuery: "sports" },
  { id: "products", label: "Products & Shopping", icon: "🛍️", agentQuery: "products" },
  { id: "platform", label: "Platform Help", icon: "🧩", agentQuery: "help" }
];

const TYPE_FILTERS: { id: "all" | "group" | "channel"; label: string }[] = [
  { id: "all", label: "All / Barchasi" },
  { id: "group", label: "Guruhlar" },
  { id: "channel", label: "Kanallar" }
];

const SORT_FILTERS: { id: SortFilter; label: string }[] = [
  { id: "popular", label: "Eng mashhur" },
  { id: "new", label: "Yangi" },
  { id: "active", label: "Eng faol" },
  { id: "rating", label: "Reytingi yuqori" },
  { id: "low-spam", label: "Spam kam" }
];

const GROUPS_PER_PAGE = 6;
const CHANNELS_PER_PAGE = 6;

const CATEGORY_META: Record<string, { label: string; icon: string; color: string }> = {
  consulting: { label: "Consulting", icon: "🧭", color: "#22d3ee" },
  translation: { label: "Translation", icon: "🌐", color: "#38bdf8" },
  legal: { label: "Legal", icon: "⚖️", color: "#a855f7" },
  psychology: { label: "Psychology", icon: "🧠", color: "#f472b6" },
  sports: { label: "Sports", icon: "🏅", color: "#fb923c" },
  products: { label: "Products", icon: "🛍️", color: "#f97316" },
  platform: { label: "Platform", icon: "🧩", color: "#0ea5e9" }
};

const ACTIVITY_BADGES = ["Post yozish", "Komment", "Like", "Fayl yuklash", "Savol-javob"];

const resolveCategory = (item: FeedItem) => {
  const raw = (item.category || item.type || "").toString().toLowerCase();
  if (!raw) return "platform";
  if (raw.includes("consult")) return "consulting";
  if (raw.includes("translat")) return "translation";
  if (raw.includes("legal") || raw.includes("law")) return "legal";
  if (raw.includes("psycho")) return "psychology";
  if (raw.includes("sport")) return "sports";
  if (raw.includes("product") || raw.includes("shop")) return "products";
  return "platform";
};

const makeTitle = (content: string) => {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return "Savol yoki mavzu";
  const match = normalized.split(/[\.\?\!]/)[0];
  return match.length > 60 ? `${match.slice(0, 60)}…` : match;
};

export default function CommunityPage() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "group" | "channel">("all");
  const [sortFilter, setSortFilter] = useState<SortFilter>("popular");
  const [groupPage, setGroupPage] = useState(1);
  const [channelPage, setChannelPage] = useState(1);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set());
  const [ratingState, setRatingState] = useState<Record<string, number>>(fallbackCommunityGroups.reduce((acc, group) => {
    acc[group.id] = group.rating;
    return acc;
  }, {} as Record<string, number>));
  const [spamState, setSpamState] = useState<Record<string, number>>(fallbackCommunityGroups.reduce((acc, group) => {
    acc[group.id] = group.spamReports;
    return acc;
  }, {} as Record<string, number>));
  const [apiGroups, setApiGroups] = useState<CommunityGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [reportTarget, setReportTarget] = useState<CommunityGroup | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const router = useRouter();
  const [previewGroup, setPreviewGroup] = useState<CommunityGroup | null>(null);
  const [requestedGroups, setRequestedGroups] = useState<Set<string>>(() => new Set());
  const [joiningGroupId, setJoiningGroupId] = useState<string | null>(null);

  const baseGroups = apiGroups.length ? apiGroups : fallbackCommunityGroups;
  const groupsToRender = useMemo(() => {
    const seen = new Set<string>();
    return baseGroups.filter((group) => {
      const key = `${group.title}-${group.category}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [baseGroups]);

  const updateMembers = (groupId: string, action: "join" | "leave") => {
    setJoinedGroups((prev) => {
      const next = new Set(prev);
      if (action === "join") next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  const setRequestedState = (groupId: string, value: boolean) => {
    setRequestedGroups((prev) => {
      const next = new Set(prev);
      if (value) next.add(groupId);
      else next.delete(groupId);
      return next;
    });
  };

  const handleJoinGroup = async (groupId: string) => {
    const action = joinedGroups.has(groupId) ? "leave" : "join";
    const target = groupsToRender.find((group) => group.id === groupId);
    setJoiningGroupId(groupId);
    try {
      await joinCommunityGroup(groupId, action as "join" | "leave");
      if (action === "join" && target?.requiresApproval) {
        setRequestedState(groupId, true);
      } else if (action === "leave") {
        setRequestedState(groupId, false);
      } else {
        setRequestedState(groupId, false);
      }
    } catch {
      if (action === "join" && target?.requiresApproval) {
        setRequestedState(groupId, true);
      }
    } finally {
      updateMembers(groupId, action as "join" | "leave");
      setJoiningGroupId((prev) => (prev === groupId ? null : prev));
    }
  };

  const handleRateGroup = async (groupId: string) => {
    const current = ratingState[groupId] ?? groupsToRender.find((group) => group.id === groupId)?.rating ?? 0;
    const nextRating = Math.min(5, Number((current + 0.1).toFixed(1)));
    try {
      await rateCommunityGroup(groupId, nextRating);
      setRatingState((prev) => ({ ...prev, [groupId]: nextRating }));
    } catch {
      // ignore
    }
  };

  const handleQuickReportSpam = async (groupId: string) => {
    try {
      await reportCommunityGroup(groupId);
      setSpamState((prev) => ({ ...prev, [groupId]: (prev[groupId] || 0) + 1 }));
    } catch {
      // ignore
    }
  };

  const handleCardClick = (group: CommunityGroup) => {
    if (joinedGroups.has(group.id)) {
      router.push(`/community/${group.id}`);
      return;
    }
    setPreviewGroup(group);
  };

  const handlePreviewJoin = async () => {
    if (!previewGroup) return;
    await handleJoinGroup(previewGroup.id);
    setPreviewGroup(null);
  };

  const handleSearchTrigger = () => {
    setSearchTerm(searchText.trim());
    setGroupPage(1);
    setChannelPage(1);
  };

  useEffect(() => {
    setGroupPage(1);
    setChannelPage(1);
  }, [searchTerm, activeCategory, typeFilter]);

  const renderCommunityCard = (group: CommunityGroup) => {
    const spamCount = spamState[group.id] ?? 0;
    const ratingValue = ratingState[group.id] ?? group.rating;
    const lastActivityMarker = dayjs(group.lastActivity).fromNow();
    const categoryMeta = CATEGORY_META[group.category] ?? CATEGORY_META.platform;
    const avatarLetter = (group.title?.trim()?.[0] || categoryMeta.label?.[0] || "U").toUpperCase();
    const coverStyle = group.coverImageUrl
      ? `linear-gradient(180deg, rgba(15,23,42,0.3), rgba(15,23,42,0.9)), url("${group.coverImageUrl}")`
      : `linear-gradient(135deg, ${categoryMeta.color}40, ${categoryMeta.color}90)`;
    const cardSkin =
      group.channelType === "group"
        ? "border-sky-500/60 bg-gradient-to-br from-slate-900 to-slate-900/60"
        : "border-fuchsia-500/60 bg-gradient-to-br from-slate-950 to-slate-950/60";
    const joinLabel = joinedGroups.has(group.id)
      ? "Chiqish"
      : requestedGroups.has(group.id)
        ? "Request sent"
        : group.requiresApproval
          ? "Request access"
          : "Guruhga qo‘shilish";
    const isJoining = joiningGroupId === group.id;
    return (
      <article
        key={group.id}
        role="button"
        tabIndex={0}
        onClick={() => handleCardClick(group)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleCardClick(group);
          }
        }}
        className={`relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl border p-0 shadow-sm transition hover:-translate-y-1 ${cardSkin}`}
      >
        <div
          className="relative h-36 w-full bg-cover bg-center"
          style={{
            backgroundImage: coverStyle,
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 flex items-start justify-between p-4 text-[10px] text-white/90">
            <span className="rounded-full border border-white/40 bg-white/10 px-3 py-1 uppercase tracking-[0.4em]">
              {categoryMeta.icon}
            </span>
            <span className="text-[10px] uppercase tracking-[0.4em]">
              {group.channelType === "group" ? "GROUP" : "CHANNEL"}
            </span>
          </div>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-full border border-white/40 text-lg font-semibold text-white"
                style={{ backgroundColor: `${categoryMeta.color}` }}
              >
                {avatarLetter}
              </span>
              <div>
                <p className="text-base font-semibold text-white line-clamp-1">{group.title}</p>
                <p className="text-[11px] text-white/80">{categoryMeta.label}</p>
              </div>
            </div>
            <span className="rounded-full border border-white/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/90">
              {group.privacy === "open" ? "Ochiq" : "Yopiq"}
            </span>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <p className="text-sm text-slate-200 line-clamp-2">{group.description}</p>
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
            {group.tags.map((tag) => (
              <span key={`${group.id}-${tag}`} className="rounded-full bg-slate-900/40 px-2 py-1 text-xs">
                #{tag}
              </span>
            ))}
          </div>
          <div className="grid gap-3 text-[11px] text-slate-200 sm:grid-cols-3">
            <div>
              <p className="text-[10px] uppercase text-slate-400">Reyting</p>
              <p className="text-base font-semibold text-slate-100">{ratingValue.toFixed(1)} ⭐</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">A’zolar</p>
              <p className="text-base font-semibold text-slate-100">{group.members}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">Faoliyat</p>
              <p className="text-base font-semibold text-slate-100">{lastActivityMarker}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-300">
            <p>Admin: {group.host || "Jamoadan"}</p>
            <p>Aktivlik darajasi: {group.reviews ?? 0} review</p>
          </div>
          {spamCount >= 3 && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              3 martadan ko‘p shikoyat: avtomatik tekshiruv chaqirildi.
            </div>
          )}
          <div className="mt-auto flex flex-wrap gap-2 text-[11px]">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleJoinGroup(group.id);
              }}
              disabled={isJoining}
              className={`rounded-full px-4 py-2 font-semibold ${
                joinedGroups.has(group.id)
                  ? "bg-emerald-500/20 text-emerald-100"
                  : "border border-slate-800 bg-slate-900 text-slate-200"
              } ${isJoining ? "opacity-60" : ""}`}
            >
              {joinLabel}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleRateGroup(group.id);
              }}
              className="rounded-full border border-slate-800 px-4 py-2 text-[11px] text-slate-200"
            >
              +Rate
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleQuickReportSpam(group.id);
              }}
              className="rounded-full border border-rose-500 px-4 py-2 text-[11px] font-semibold text-rose-300"
            >
              Spam
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setReportTarget(group);
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-[11px] text-slate-200"
            >
              Report reason
            </button>
          </div>
          {group.requiresApproval && requestedGroups.has(group.id) && !joinedGroups.has(group.id) && (
            <p className="text-[11px] text-amber-200">Access requested. Admin tasdiqlashi lozim.</p>
          )}
        </div>
      </article>
    );
  };

  const handleReportReasonSubmit = async () => {
    if (!reportTarget) return;
    const reason = reportReason.trim();
    if (!reason) return;
    setReportSubmitting(true);
    try {
      await reportCommunityGroup(reportTarget.id, reason);
      setSpamState((prev) => ({ ...prev, [reportTarget.id]: (prev[reportTarget.id] || 0) + 1 }));
    } catch {
      // ignore
    } finally {
      setReportSubmitting(false);
      setReportTarget(null);
      setReportReason("");
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const feed = await getFeed();
        if (active) setItems(feed);
      } catch {
        if (active) setItems([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const posts = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase();
    return items
      .map((item, idx) => {
        const content = item.content || item.text || "";
        const title = makeTitle(content);
        const categoryId = resolveCategory(item);
        const createdAt = item.createdAt || new Date().toISOString();
        const comments = item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0);
        return {
          id: item.id || item._id || String(idx),
          title,
          content,
          categoryId,
          createdAt,
          replies: comments,
          author: item.author || {},
          raw: item
        };
      })
      .filter((post) => {
        if (activeCategory !== "all" && post.categoryId !== activeCategory) return false;
        if (!normalized) return true;
        return (
          post.title.toLowerCase().includes(normalized) ||
          post.content.toLowerCase().includes(normalized) ||
          (post.author?.name || "").toLowerCase().includes(normalized)
        );
      });
  }, [items, searchTerm, activeCategory]);

  useEffect(() => {
    let active = true;
    const loadGroups = async () => {
      setGroupsLoading(true);
      try {
        const groups = await fetchCommunityGroups();
        if (active) {
          setApiGroups(groups);
        }
      } catch {
        if (active) setApiGroups([]);
      } finally {
        if (active) setGroupsLoading(false);
      }
    };
    loadGroups();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const source = groupsToRender;
    const nextRating: Record<string, number> = {};
    const nextSpam: Record<string, number> = {};
    source.forEach((group) => {
      nextRating[group.id] = group.rating;
      nextSpam[group.id] = group.spamReports;
    });
    setRatingState(nextRating);
    setSpamState(nextSpam);
  }, [groupsToRender]);

  const visibleGroups = useMemo(() => {
    const filtered = groupsToRender.filter((group) => {
      if (typeFilter !== "all" && group.channelType !== typeFilter) return false;
      if (activeCategory !== "all" && group.category !== activeCategory) return false;
      return true;
    });
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      const aLast = dayjs(a.lastActivity).valueOf();
      const bLast = dayjs(b.lastActivity).valueOf();
      switch (sortFilter) {
        case "popular":
          return b.members - a.members;
        case "new":
          return bLast - aLast;
        case "active":
          return (b.reviews ?? 0) - (a.reviews ?? 0);
        case "rating":
          return b.rating - a.rating;
        case "low-spam":
          return a.spamReports - b.spamReports;
        default:
          return 0;
      }
    });
    return sorted;
  }, [groupsToRender, typeFilter, sortFilter, activeCategory]);

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const matchesSearchTerm = (group: CommunityGroup) => {
    if (!normalizedSearchTerm) return true;
    const haystack = `${group.title} ${group.description} ${group.tags.join(" ")}`.toLowerCase();
    return haystack.includes(normalizedSearchTerm);
  };
  const filteredGroupResults = visibleGroups.filter(
    (group) => group.channelType === "group" && matchesSearchTerm(group)
  );
  const filteredChannelResults = visibleGroups.filter(
    (group) => group.channelType === "channel" && matchesSearchTerm(group)
  );
  const totalGroupPages = Math.max(1, Math.ceil(filteredGroupResults.length / GROUPS_PER_PAGE));
  const totalChannelPages = Math.max(1, Math.ceil(filteredChannelResults.length / CHANNELS_PER_PAGE));
  const pagedGroupResults = filteredGroupResults.slice(
    (groupPage - 1) * GROUPS_PER_PAGE,
    groupPage * GROUPS_PER_PAGE
  );
  const pagedChannelResults = filteredChannelResults.slice(
    (channelPage - 1) * CHANNELS_PER_PAGE,
    channelPage * CHANNELS_PER_PAGE
  );

  useEffect(() => {
    if (groupPage > totalGroupPages) setGroupPage(totalGroupPages);
  }, [groupPage, totalGroupPages]);

  useEffect(() => {
    if (channelPage > totalChannelPages) setChannelPage(totalChannelPages);
  }, [channelPage, totalChannelPages]);

  const previewPosts = useMemo(() => {
    if (!previewGroup) return [];
    const matches = posts.filter((post) => post.categoryId === previewGroup.category);
    return matches.length ? matches.slice(0, 3) : posts.slice(0, 3);
  }, [previewGroup, posts]);
  const previewMeta = previewGroup ? CATEGORY_META[previewGroup.category] ?? CATEGORY_META.platform : CATEGORY_META.platform;
  const previewJoinLabel = previewGroup
    ? joinedGroups.has(previewGroup.id)
      ? "Chiqish"
      : requestedGroups.has(previewGroup.id)
        ? "Request sent"
        : previewGroup.requiresApproval
          ? "Request access"
          : "Guruhga qo‘shilish"
    : "Guruhga qo‘shilish";

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/70 p-6 shadow-xl shadow-black/40">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">UniServe Jamiyati</p>
            <h1 className="text-3xl font-bold text-slate-50">
              Foydalanuvchilar o‘zaro bilim almashib, savol-javob qilib, xizmatlar tajribasini ulashadi.
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              Mini ijtimoiy platforma sifatida bu bo‘lim shunchaki kartochkalar emas, balki global search + filtrlar orqali
              faol interaktiv ekotizim yaratadi.
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-200">
              <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200">Ishonch + filtr</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-100">Spam nazorati</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-100">Tezkor kategoriyalar</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Qo‘shimcha ma’lumot</p>
            <p className="mt-3 text-lg font-semibold text-slate-100">{groupsToRender.length} ta guruh/kanal</p>
            <p className="text-xs text-slate-400">Har birida filtrlash, reyting va spam monitoring mavjud</p>
            <p className="mt-3 text-xs text-emerald-200">{posts.length} ta so‘nggi savol-javob</p>
            <p className="text-xs text-slate-400">Moderatsiyali guruhlarda admin tasdiqlaydi</p>
          </div>
        </div>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Matn orqali izlash</p>
            <div className="flex gap-2">
              <input
                value={searchText}
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    handleSearchTrigger();
                  }
                }}
                placeholder="Consulting visa, tarjima, psixolog ..."
                className="flex-1 rounded-full border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchTrigger}
                className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                Izlash
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Nimalar qidirmoqchisiz? Guruh/kanallar va savol-javoblar mazmuniga qarab natijalar keladi.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setTypeFilter(filter.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  typeFilter === filter.id
                    ? "bg-emerald-500/10 text-emerald-200 ring-1 ring-emerald-400"
                    : "bg-slate-900/60 text-slate-400"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 text-[11px]">
            {SORT_FILTERS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setSortFilter(option.id)}
                className={`rounded-full border px-3 py-1 ${
                  sortFilter === option.id
                    ? "border-emerald-400 bg-emerald-500/10 text-emerald-100"
                    : "border-slate-800 bg-slate-900/40 text-slate-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Tezkor kategoriyalar</p>
            <h2 className="text-2xl font-semibold text-slate-900">Qiziq mavzuni bir zumda tanlang</h2>
          </div>
          <span className="text-xs text-slate-400">Icon + faollik rang</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex h-[88px] items-center justify-between rounded-2xl border px-4 text-left transition ${
              activeCategory === "all"
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                : "border-slate-200 bg-slate-50 text-slate-700 shadow-sm"
            }`}
          >
            <div>
              <p className="text-sm font-semibold">Barchasi</p>
              <p className="text-[11px] text-slate-500">Hammasi ochiq</p>
            </div>
            <span className="text-2xl">✨</span>
          </button>
          {COMMUNITY_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={`flex h-[88px] items-center justify-between rounded-2xl border px-4 text-left transition ${
                activeCategory === cat.id
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-100"
                  : "border-slate-200 bg-white text-slate-700 shadow-sm"
              }`}
            >
              <div>
                <p className="text-sm font-semibold">{cat.label}</p>
                <p className="text-[11px] text-slate-500">Savol-javoblar</p>
              </div>
              <span className="text-2xl">{cat.icon}</span>
            </button>
          ))}
        </div>
        {!joinedGroups.size ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
            Siz hali hech bir guruhga qo‘shilmadingiz – qiziq mavzuni tanlang va yangiliklarni kuzatib boring.
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Activity feed</p>
            <h2 className="text-2xl font-semibold text-slate-100">Savollar va tajribalar</h2>
            <p className="text-sm text-slate-400">Har kanal ichida post, komment, like, fayl yuklash va savol-javob.</p>
          </div>
          <span className="text-xs text-slate-400">Filtr: {activeCategory === "all" ? "Barchasi" : activeCategory}</span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          {ACTIVITY_BADGES.map((badge) => (
            <span key={badge} className="rounded-full border border-slate-800 px-3 py-1 text-slate-300">
              {badge}
            </span>
          ))}
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Yuklanmoqda...</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-400">Hozircha savollar yo‘q.</p>
        ) : (
          <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const category = COMMUNITY_CATEGORIES.find((cat) => cat.id === post.categoryId);
              const lastActivity = dayjs(post.createdAt).fromNow();
              const authorName = post.author?.name || "Foydalanuvchi";
              const isAgent = (post.author?.role || "").toString().toUpperCase() === "AGENT";
              return (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="group flex h-[220px] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/60"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                      {category?.icon} {category?.label || "Platform"}
                    </span>
                    <span>⏱ {lastActivity}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-100">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{post.content}</p>
                  <div className="mt-auto flex items-center justify-between text-[11px] text-slate-300">
                    <span>💬 {post.replies} javob</span>
                    <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-slate-200">{isAgent ? "Agent" : "User"}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>🧑‍💼 {authorName}</span>
                    <span className="text-emerald-200">Agent topish →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-8 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Jamiyat guruhlari va kanallar</p>
            <h2 className="text-2xl font-semibold text-slate-100">Interaktiv kartalar</h2>
            <p className="text-sm text-slate-400">Guruhlar, kanallar va savol-javoblar bir joyda izlash imkoniyati bilan.</p>
          </div>
          <span className="text-xs text-slate-400">Filter, join/leave, rating, pagination</span>
        </div>
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-400">Guruhlar</p>
                <h3 className="text-xl font-semibold text-white">Savol-javobga ochiq jamiyat</h3>
              </div>
              <span className="text-xs text-slate-400">
                {filteredGroupResults.length} ta natija · sahifa {groupPage}/{totalGroupPages}
              </span>
            </div>
            {groupsLoading ? (
              <p className="text-sm text-slate-400">Guruhlar yangilanmoqda...</p>
            ) : pagedGroupResults.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedGroupResults.map((group) => renderCommunityCard(group))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {searchTerm ? "Qidiruvga mos guruhlar topilmadi." : "Hoziroq guruhlar mavjud emas."}
              </p>
            )}
            {filteredGroupResults.length > GROUPS_PER_PAGE && (
              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-200">
                <button
                  type="button"
                  onClick={() => setGroupPage((prev) => Math.max(1, prev - 1))}
                  disabled={groupPage === 1}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  Oldingi
                </button>
                <button
                  type="button"
                  onClick={() => setGroupPage((prev) => Math.min(totalGroupPages, prev + 1))}
                  disabled={groupPage === totalGroupPages}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  Keyingi
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">Kanallar</p>
                <h3 className="text-xl font-semibold text-white">Tegishli tajribalar</h3>
              </div>
              <span className="text-xs text-slate-400">
                {filteredChannelResults.length} ta natija · sahifa {channelPage}/{totalChannelPages}
              </span>
            </div>
            {groupsLoading ? (
              <p className="text-sm text-slate-400">Kanallar yangilanmoqda...</p>
            ) : pagedChannelResults.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedChannelResults.map((group) => renderCommunityCard(group))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {searchTerm ? "Qidiruvga mos kanallar topilmadi." : "Hoziroq kanallar mavjud emas."}
              </p>
            )}
            {filteredChannelResults.length > CHANNELS_PER_PAGE && (
              <div className="flex items-center justify-end gap-2 text-[11px] text-slate-200">
                <button
                  type="button"
                  onClick={() => setChannelPage((prev) => Math.max(1, prev - 1))}
                  disabled={channelPage === 1}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  Oldingi
                </button>
                <button
                  type="button"
                  onClick={() => setChannelPage((prev) => Math.min(totalChannelPages, prev + 1))}
                  disabled={channelPage === totalChannelPages}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  Keyingi
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {previewGroup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setPreviewGroup(null);
            }
          }}
        >
          <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-950 p-6 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Preview</p>
                <h3 className="text-2xl font-semibold text-white">{previewGroup.title}</h3>
                <p className="text-xs text-slate-400">{previewMeta.label}</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewGroup(null)}
                className="text-slate-400"
              >
                ✕
              </button>
            </div>
            <p className="mt-3 text-sm text-slate-300">{previewGroup.description}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[11px] text-slate-300">
              <div>
                <p className="text-[10px] uppercase text-slate-500">A’zolar</p>
                <p className="text-base font-semibold text-white">{previewGroup.members}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Oxirgi faoliyat</p>
                <p className="text-base font-semibold text-white">{dayjs(previewGroup.lastActivity).fromNow()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">Status</p>
                <p className="text-base font-semibold text-white">{previewGroup.requiresApproval ? "Moderatsiyali" : "Ochiq"}</p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">So‘nggi postlar</p>
              {previewPosts.length ? (
                previewPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">{post.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {dayjs(post.createdAt).fromNow()} · {post.replies} javob
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Hozircha tegishli postlar yo‘q.</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewGroup(null)}
                className="rounded-full border border-slate-700 px-4 py-2 text-[11px] text-slate-200"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handlePreviewJoin}
                disabled={joiningGroupId === previewGroup.id}
                className="rounded-full bg-emerald-500 px-4 py-2 text-[11px] font-semibold text-white disabled:opacity-60"
              >
                {previewJoinLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {reportTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-950 p-6 text-slate-100 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Report reason</p>
                <p className="text-lg font-semibold text-slate-50">{reportTarget.title}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReportTarget(null);
                  setReportReason("");
                }}
                className="text-slate-400"
              >
                ✕
              </button>
            </div>
            <textarea
              value={reportReason}
              onChange={(event) => setReportReason(event.target.value)}
              rows={4}
              placeholder="Spam sababi: noaniq taklif, bot, ishonchsiz havola..."
              className="mt-4 w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-rose-400 focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-3 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setReportTarget(null);
                  setReportReason("");
                }}
                className="rounded-full border border-slate-700 px-4 py-2 text-slate-100"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleReportReasonSubmit}
                disabled={reportSubmitting || !reportReason.trim()}
                className="rounded-full bg-rose-500 px-4 py-2 text-slate-50 disabled:opacity-60"
              >
                {reportSubmitting ? "Yuborilmoqda..." : "Sababni yuborish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
