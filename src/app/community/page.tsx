"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getFeed, type FeedItem } from "@/api/feed";
import { useI18n } from "@/context/i18n";
import dayjs from "@/lib/dayjs";
import { fallbackCommunityGroups, type CommunityGroup } from "@/data/communityGroups";
import { tx, type LocalizedText } from "@/lib/localization";
import {
  fetchCommunityGroups,
  joinCommunityGroup,
  rateCommunityGroup,
  reportCommunityGroup
} from "@/api/community";

type Category = {
  id: string;
  label: LocalizedText;
  icon: string;
  agentQuery?: string;
};

type SortFilter = "popular" | "new" | "active" | "rating" | "low-spam";

const COMMUNITY_CATEGORIES: Category[] = [
  { id: "consulting", label: tx("Consulting", "Konsalting", "Консалтинг", "컨설팅"), icon: "🧭", agentQuery: "consulting" },
  { id: "translation", label: tx("Translation", "Tarjima", "Перевод", "번역"), icon: "🌐", agentQuery: "translation" },
  { id: "legal", label: tx("Legal", "Huquq", "Юридическое", "법률"), icon: "⚖️", agentQuery: "legal" },
  { id: "psychology", label: tx("Psychology", "Psixologiya", "Психология", "심리"), icon: "🧠", agentQuery: "psychology" },
  { id: "sports", label: tx("Sports", "Sport", "Спорт", "스포츠"), icon: "🏅", agentQuery: "sports" },
  { id: "products", label: tx("Products & Shopping", "Mahsulotlar va xarid", "Товары и покупки", "상품 및 쇼핑"), icon: "🛍️", agentQuery: "products" },
  { id: "platform", label: tx("Platform Help", "Platforma yordami", "Помощь по платформе", "플랫폼 도움말"), icon: "🧩", agentQuery: "help" }
];

const TYPE_FILTERS: { id: "all" | "group" | "channel"; label: LocalizedText }[] = [
  { id: "all", label: tx("All", "Barchasi", "Все", "전체") },
  { id: "group", label: tx("Groups", "Guruhlar", "Группы", "그룹") },
  { id: "channel", label: tx("Channels", "Kanallar", "Каналы", "채널") }
];

const SORT_FILTERS: { id: SortFilter; label: LocalizedText }[] = [
  { id: "popular", label: tx("Most popular", "Eng mashhur", "Самые популярные", "인기순") },
  { id: "new", label: tx("Newest", "Yangi", "Новые", "최신순") },
  { id: "active", label: tx("Most active", "Eng faol", "Самые активные", "활동순") },
  { id: "rating", label: tx("Top rated", "Reytingi yuqori", "Высокий рейтинг", "평점순") },
  { id: "low-spam", label: tx("Low spam", "Spam kam", "Меньше спама", "스팸 적음") }
];

const GROUPS_PER_PAGE = 6;
const CHANNELS_PER_PAGE = 6;

const CATEGORY_META: Record<string, { label: LocalizedText; icon: string; color: string }> = {
  consulting: { label: tx("Consulting", "Konsalting", "Консалтинг", "컨설팅"), icon: "🧭", color: "#22d3ee" },
  translation: { label: tx("Translation", "Tarjima", "Перевод", "번역"), icon: "🌐", color: "#38bdf8" },
  legal: { label: tx("Legal", "Huquq", "Юридическое", "법률"), icon: "⚖️", color: "#a855f7" },
  psychology: { label: tx("Psychology", "Psixologiya", "Психология", "심리"), icon: "🧠", color: "#f472b6" },
  sports: { label: tx("Sports", "Sport", "Спорт", "스포츠"), icon: "🏅", color: "#fb923c" },
  products: { label: tx("Products", "Mahsulotlar", "Товары", "상품"), icon: "🛍️", color: "#f97316" },
  platform: { label: tx("Platform", "Platforma", "Платформа", "플랫폼"), icon: "🧩", color: "#0ea5e9" }
};

const ACTIVITY_BADGES: LocalizedText[] = [
  tx("Posting", "Post yozish", "Публикации", "게시"),
  tx("Comments", "Komment", "Комментарии", "댓글"),
  tx("Likes", "Like", "Лайки", "좋아요"),
  tx("File uploads", "Fayl yuklash", "Загрузка файлов", "파일 업로드"),
  tx("Q&A", "Savol-javob", "Вопросы и ответы", "질문과 답변")
];

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

const makeTitle = (content: string, fallbackTitle: string) => {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return fallbackTitle;
  const match = normalized.split(/[\.\?\!]/)[0];
  return match.length > 60 ? `${match.slice(0, 60)}…` : match;
};

export default function CommunityPage() {
  const { t } = useI18n();
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

  const getCategoryMeta = (categoryId: string) => CATEGORY_META[categoryId] ?? CATEGORY_META.platform;
  const getCategoryLabel = (categoryId: string) => t(getCategoryMeta(categoryId).label);
  const getJoinLabel = (group: CommunityGroup | null | undefined) => {
    if (!group) return t(tx("Join group", "Guruhga qo'shilish", "Присоединиться к группе", "그룹 참여"));
    if (joinedGroups.has(group.id)) return t(tx("Leave", "Chiqish", "Выйти", "나가기"));
    if (requestedGroups.has(group.id)) return t(tx("Request sent", "So'rov yuborildi", "Запрос отправлен", "요청 전송됨"));
    if (group.requiresApproval) return t(tx("Request access", "Ruxsat so'rash", "Запросить доступ", "접근 요청"));
    return t(tx("Join group", "Guruhga qo'shilish", "Присоединиться к группе", "그룹 참여"));
  };

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
    const categoryMeta = getCategoryMeta(group.category);
    const categoryLabel = t(categoryMeta.label);
    const avatarLetter = (group.title?.trim()?.[0] || categoryLabel?.[0] || "U").toUpperCase();
    const coverStyle = group.coverImageUrl
      ? `linear-gradient(180deg, rgba(15,23,42,0.3), rgba(15,23,42,0.9)), url("${group.coverImageUrl}")`
      : `linear-gradient(135deg, ${categoryMeta.color}40, ${categoryMeta.color}90)`;
    const cardSkin =
      group.channelType === "group"
        ? "border-sky-500/60 bg-gradient-to-br from-slate-900 to-slate-900/60"
        : "border-fuchsia-500/60 bg-gradient-to-br from-slate-950 to-slate-950/60";
    const joinLabel = getJoinLabel(group);
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
              {group.channelType === "group"
                ? t(tx("Group", "Guruh", "Группа", "그룹"))
                : t(tx("Channel", "Kanal", "Канал", "채널"))}
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
                <p className="text-[11px] text-white/80">{categoryLabel}</p>
              </div>
            </div>
            <span className="rounded-full border border-white/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-white/90">
              {group.privacy === "open"
                ? t(tx("Open", "Ochiq", "Открытая", "공개"))
                : t(tx("Closed", "Yopiq", "Закрытая", "비공개"))}
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
              <p className="text-[10px] uppercase text-slate-400">{t(tx("Rating", "Reyting", "Рейтинг", "평점"))}</p>
              <p className="text-base font-semibold text-slate-100">{ratingValue.toFixed(1)} ⭐</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">{t(tx("Members", "A'zolar", "Участники", "멤버"))}</p>
              <p className="text-base font-semibold text-slate-100">{group.members}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-slate-400">{t(tx("Activity", "Faoliyat", "Активность", "활동"))}</p>
              <p className="text-base font-semibold text-slate-100">{lastActivityMarker}</p>
            </div>
          </div>
          <div className="text-[11px] text-slate-300">
            <p>{t(tx("Admin", "Admin", "Админ", "관리자"))}: {group.host || t(tx("Community team", "Jamoadan", "Команда сообщества", "커뮤니티 팀"))}</p>
            <p>{t(tx("Activity score", "Aktivlik darajasi", "Уровень активности", "활동 지수"))}: {group.reviews ?? 0} {t(tx("reviews", "review", "отзывов", "리뷰"))}</p>
          </div>
          {spamCount >= 3 && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-[11px] text-rose-200">
              {t(tx(
                "More than 3 reports: automatic review was triggered.",
                "3 martadan ko'p shikoyat: avtomatik tekshiruv ishga tushdi.",
                "Более 3 жалоб: запущена автоматическая проверка.",
                "3회 이상 신고되어 자동 검토가 시작되었습니다."
              ))}
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
              +{t(tx("Rate", "Baholash", "Оценить", "평가"))}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                handleQuickReportSpam(group.id);
              }}
              className="rounded-full border border-rose-500 px-4 py-2 text-[11px] font-semibold text-rose-300"
            >
              {t(tx("Spam", "Spam", "Спам", "스팸"))}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                setReportTarget(group);
              }}
              className="rounded-full border border-slate-700 px-4 py-2 text-[11px] text-slate-200"
            >
              {t(tx("Report reason", "Shikoyat sababi", "Причина жалобы", "신고 사유"))}
            </button>
          </div>
          {group.requiresApproval && requestedGroups.has(group.id) && !joinedGroups.has(group.id) && (
            <p className="text-[11px] text-amber-200">
              {t(tx(
                "Access requested. Admin approval is required.",
                "Ruxsat so'rovi yuborildi. Admin tasdiqlashi kerak.",
                "Запрос на доступ отправлен. Требуется подтверждение администратора.",
                "접근 요청이 전송되었습니다. 관리자 승인이 필요합니다."
              ))}
            </p>
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
        const title = makeTitle(content, t(tx("Question or topic", "Savol yoki mavzu", "Вопрос или тема", "질문 또는 주제")));
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
  }, [items, searchTerm, activeCategory, t]);

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
  const previewMeta = previewGroup ? getCategoryMeta(previewGroup.category) : CATEGORY_META.platform;
  const previewJoinLabel = getJoinLabel(previewGroup);

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-950/80 to-slate-900/70 p-6 shadow-xl shadow-black/40">
        <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.4em] text-emerald-300">{t(tx("UniServe Community", "UniServe Jamiyati", "Сообщество UniServe", "UniServe 커뮤니티"))}</p>
            <h1 className="text-3xl font-bold text-slate-50">
              {t(tx(
                "Users exchange knowledge, ask questions, and share real service experience.",
                "Foydalanuvchilar o'zaro bilim almashib, savol-javob qiladi va xizmat tajribalarini ulashadi.",
                "Пользователи обмениваются знаниями, задают вопросы и делятся реальным опытом услуг.",
                "사용자들이 지식을 나누고 질문하며 실제 서비스 경험을 공유합니다."
              ))}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {t(tx(
                "This section is more than simple cards. With global search and smart filters, it creates an active interactive ecosystem.",
                "Bu bo'lim oddiy kartochkalar emas. Global qidiruv va aqlli filterlar orqali faol interaktiv ekotizim yaratadi.",
                "Этот раздел больше, чем набор карточек. Глобальный поиск и умные фильтры создают активную интерактивную экосистему.",
                "이 섹션은 단순한 카드 모음이 아닙니다. 글로벌 검색과 스마트 필터로 활발한 인터랙티브 생태계를 만듭니다."
              ))}
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-slate-200">
              <span className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200">{t(tx("Trust + filters", "Ishonch + filter", "Доверие + фильтры", "신뢰 + 필터"))}</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-100">{t(tx("Spam control", "Spam nazorati", "Контроль спама", "스팸 관리"))}</span>
              <span className="rounded-full border border-slate-600 px-3 py-1 text-slate-100">{t(tx("Quick categories", "Tezkor kategoriyalar", "Быстрые категории", "빠른 카테고리"))}</span>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t(tx("Extra info", "Qo'shimcha ma'lumot", "Дополнительная информация", "추가 정보"))}</p>
            <p className="mt-3 text-lg font-semibold text-slate-100">
              {t(tx(
                `${groupsToRender.length} groups/channels`,
                `${groupsToRender.length} ta guruh/kanal`,
                `${groupsToRender.length} групп/каналов`,
                `${groupsToRender.length}개 그룹/채널`
              ))}
            </p>
            <p className="text-xs text-slate-400">{t(tx("Each one supports filtering, ratings, and spam monitoring.", "Har birida filter, reyting va spam monitoring mavjud.", "У каждого есть фильтры, рейтинг и мониторинг спама.", "각 항목에 필터, 평점, 스팸 모니터링이 있습니다."))}</p>
            <p className="mt-3 text-xs text-emerald-200">
              {t(tx(
                `${posts.length} recent Q&A items`,
                `${posts.length} ta so'nggi savol-javob`,
                `${posts.length} последних Q&A`,
                `최근 질문답변 ${posts.length}개`
              ))}
            </p>
            <p className="text-xs text-slate-400">{t(tx("Admins approve moderated communities.", "Moderatsiyali guruhlarda admin tasdiqlaydi.", "В модерируемых сообществах подтверждает администратор.", "운영되는 커뮤니티는 관리자가 승인합니다."))}</p>
          </div>
        </div>
        <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t(tx("Search by text", "Matn orqali izlash", "Поиск по тексту", "텍스트 검색"))}</p>
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
                placeholder={t(tx("Consulting, visa, translation, psychology ...", "Konsalting, visa, tarjima, psixolog ...", "Консалтинг, виза, перевод, психология ...", "컨설팅, 비자, 번역, 심리 ..."))}
                className="flex-1 rounded-full border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSearchTrigger}
                className="rounded-full bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
              >
                {t(tx("Search", "Izlash", "Поиск", "검색"))}
              </button>
            </div>
            <p className="text-xs text-slate-400">
              {t(tx(
                "What are you looking for? Results are based on group, channel, and Q&A content.",
                "Nimani qidirmoqchisiz? Natijalar guruh, kanal va savol-javob mazmuniga qarab chiqadi.",
                "Что вы ищете? Результаты формируются по содержимому групп, каналов и Q&A.",
                "무엇을 찾고 있나요? 결과는 그룹, 채널, 질문답변 내용에 따라 표시됩니다."
              ))}
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
                {t(filter.label)}
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
                {t(option.label)}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-400">{t(tx("Quick categories", "Tezkor kategoriyalar", "Быстрые категории", "빠른 카테고리"))}</p>
            <h2 className="text-2xl font-semibold text-slate-900">{t(tx("Pick a topic instantly", "Qiziq mavzuni bir zumda tanlang", "Выберите тему за секунду", "관심 주제를 바로 선택하세요"))}</h2>
          </div>
          <span className="text-xs text-slate-400">{t(tx("Icon + activity color", "Icon + faollik rang", "Иконка + цвет активности", "아이콘 + 활동 색상"))}</span>
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
              <p className="text-sm font-semibold">{t(tx("All", "Barchasi", "Все", "전체"))}</p>
              <p className="text-[11px] text-slate-500">{t(tx("Show everything", "Hammasi ochiq", "Показать всё", "전체 보기"))}</p>
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
                <p className="text-sm font-semibold">{t(cat.label)}</p>
                <p className="text-[11px] text-slate-500">{t(tx("Q&A", "Savol-javoblar", "Вопросы и ответы", "질문과 답변"))}</p>
              </div>
              <span className="text-2xl">{cat.icon}</span>
            </button>
          ))}
        </div>
        {!joinedGroups.size ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200">
            {t(tx(
              "You have not joined any groups yet. Pick a topic and start following updates.",
              "Siz hali hech bir guruhga qo'shilmagansiz. Mavzuni tanlang va yangiliklarni kuzatib boring.",
              "Вы ещё не вступили ни в одну группу. Выберите тему и следите за обновлениями.",
              "아직 어떤 그룹에도 참여하지 않았습니다. 주제를 선택하고 업데이트를 따라가 보세요."
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-800 bg-slate-950/70 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t(tx("Activity feed", "Faoliyat oqimi", "Лента активности", "활동 피드"))}</p>
            <h2 className="text-2xl font-semibold text-slate-100">{t(tx("Questions and experiences", "Savollar va tajribalar", "Вопросы и опыт", "질문과 경험"))}</h2>
            <p className="text-sm text-slate-400">{t(tx("Each channel can include posts, comments, likes, file uploads, and Q&A.", "Har bir kanal ichida post, komment, like, fayl yuklash va savol-javob bo'ladi.", "В каждом канале могут быть посты, комментарии, лайки, загрузка файлов и Q&A.", "각 채널에는 게시물, 댓글, 좋아요, 파일 업로드, 질문답변이 포함될 수 있습니다."))}</p>
          </div>
          <span className="text-xs text-slate-400">
            {t(tx("Filter", "Filter", "Фильтр", "필터"))}: {activeCategory === "all" ? t(tx("All", "Barchasi", "Все", "전체")) : getCategoryLabel(activeCategory)}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
          {ACTIVITY_BADGES.map((badge) => (
            <span key={t(badge)} className="rounded-full border border-slate-800 px-3 py-1 text-slate-300">
              {t(badge)}
            </span>
          ))}
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">{t(tx("Loading...", "Yuklanmoqda...", "Загрузка...", "불러오는 중..."))}</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-400">{t(tx("No questions yet.", "Hozircha savollar yo'q.", "Пока нет вопросов.", "아직 질문이 없습니다."))}</p>
        ) : (
          <div className="mt-2 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const category = COMMUNITY_CATEGORIES.find((cat) => cat.id === post.categoryId);
              const lastActivity = dayjs(post.createdAt).fromNow();
              const authorName = post.author?.name || t(tx("User", "Foydalanuvchi", "Пользователь", "사용자"));
              const isAgent = (post.author?.role || "").toString().toUpperCase() === "AGENT";
              return (
                <Link
                  key={post.id}
                  href={`/community/${post.id}`}
                  className="group flex h-[220px] flex-col rounded-2xl border border-slate-800 bg-slate-900/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/60"
                >
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span className="rounded-full bg-slate-900/70 px-2 py-0.5">
                      {category?.icon} {category ? t(category.label) : t(tx("Platform", "Platforma", "Платформа", "플랫폼"))}
                    </span>
                    <span>⏱ {lastActivity}</span>
                  </div>
                  <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-slate-100">{post.title}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-400">{post.content}</p>
                  <div className="mt-auto flex items-center justify-between text-[11px] text-slate-300">
                    <span>💬 {post.replies} {t(tx("replies", "javob", "ответов", "답글"))}</span>
                    <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-slate-200">{isAgent ? t(tx("Agent", "Agent", "Агент", "에이전트")) : t(tx("User", "User", "Пользователь", "사용자"))}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>🧑‍💼 {authorName}</span>
                    <span className="text-emerald-200">{t(tx("Find agent", "Agent topish", "Найти агента", "에이전트 찾기"))} →</span>
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
            <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t(tx("Community groups and channels", "Jamiyat guruhlari va kanallar", "Группы и каналы сообщества", "커뮤니티 그룹과 채널"))}</p>
            <h2 className="text-2xl font-semibold text-slate-100">{t(tx("Interactive cards", "Interaktiv kartalar", "Интерактивные карточки", "인터랙티브 카드"))}</h2>
            <p className="text-sm text-slate-400">{t(tx("Search groups, channels, and Q&A in one place.", "Guruhlar, kanallar va savol-javoblarni bir joyda qidiring.", "Ищите группы, каналы и Q&A в одном месте.", "그룹, 채널, 질문답변을 한 곳에서 검색하세요."))}</p>
          </div>
          <span className="text-xs text-slate-400">{t(tx("Filters, join/leave, rating, pagination", "Filter, join/leave, reyting, pagination", "Фильтры, вход/выход, рейтинг, пагинация", "필터, 참여/나가기, 평점, 페이지네이션"))}</span>
        </div>
        <div className="space-y-10">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-amber-400">{t(tx("Groups", "Guruhlar", "Группы", "그룹"))}</p>
                <h3 className="text-xl font-semibold text-white">{t(tx("Open communities for Q&A", "Savol-javobga ochiq jamiyat", "Открытые сообщества для Q&A", "질문답변을 위한 열린 커뮤니티"))}</h3>
              </div>
              <span className="text-xs text-slate-400">
                {t(tx(
                  `${filteredGroupResults.length} results · page ${groupPage}/${totalGroupPages}`,
                  `${filteredGroupResults.length} ta natija · sahifa ${groupPage}/${totalGroupPages}`,
                  `${filteredGroupResults.length} результатов · страница ${groupPage}/${totalGroupPages}`,
                  `${filteredGroupResults.length}개 결과 · 페이지 ${groupPage}/${totalGroupPages}`
                ))}
              </span>
            </div>
            {groupsLoading ? (
              <p className="text-sm text-slate-400">{t(tx("Updating groups...", "Guruhlar yangilanmoqda...", "Группы обновляются...", "그룹을 불러오는 중..."))}</p>
            ) : pagedGroupResults.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedGroupResults.map((group) => renderCommunityCard(group))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {searchTerm
                  ? t(tx("No groups match your search.", "Qidiruvga mos guruhlar topilmadi.", "Группы по запросу не найдены.", "검색과 일치하는 그룹이 없습니다."))
                  : t(tx("No groups are available right now.", "Hozircha guruhlar mavjud emas.", "Сейчас группы недоступны.", "현재 이용 가능한 그룹이 없습니다."))}
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
                  {t(tx("Previous", "Oldingi", "Назад", "이전"))}
                </button>
                <button
                  type="button"
                  onClick={() => setGroupPage((prev) => Math.min(totalGroupPages, prev + 1))}
                  disabled={groupPage === totalGroupPages}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  {t(tx("Next", "Keyingi", "Далее", "다음"))}
                </button>
              </div>
            )}
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-400">{t(tx("Channels", "Kanallar", "Каналы", "채널"))}</p>
                <h3 className="text-xl font-semibold text-white">{t(tx("Relevant experiences", "Tegishli tajribalar", "Полезный опыт", "관련 경험"))}</h3>
              </div>
              <span className="text-xs text-slate-400">
                {t(tx(
                  `${filteredChannelResults.length} results · page ${channelPage}/${totalChannelPages}`,
                  `${filteredChannelResults.length} ta natija · sahifa ${channelPage}/${totalChannelPages}`,
                  `${filteredChannelResults.length} результатов · страница ${channelPage}/${totalChannelPages}`,
                  `${filteredChannelResults.length}개 결과 · 페이지 ${channelPage}/${totalChannelPages}`
                ))}
              </span>
            </div>
            {groupsLoading ? (
              <p className="text-sm text-slate-400">{t(tx("Updating channels...", "Kanallar yangilanmoqda...", "Каналы обновляются...", "채널을 불러오는 중..."))}</p>
            ) : pagedChannelResults.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {pagedChannelResults.map((group) => renderCommunityCard(group))}
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                {searchTerm
                  ? t(tx("No channels match your search.", "Qidiruvga mos kanallar topilmadi.", "Каналы по запросу не найдены.", "검색과 일치하는 채널이 없습니다."))
                  : t(tx("No channels are available right now.", "Hozircha kanallar mavjud emas.", "Сейчас каналы недоступны.", "현재 이용 가능한 채널이 없습니다."))}
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
                  {t(tx("Previous", "Oldingi", "Назад", "이전"))}
                </button>
                <button
                  type="button"
                  onClick={() => setChannelPage((prev) => Math.min(totalChannelPages, prev + 1))}
                  disabled={channelPage === totalChannelPages}
                  className="rounded-full border border-slate-700 px-3 py-1 disabled:opacity-40"
                >
                  {t(tx("Next", "Keyingi", "Далее", "다음"))}
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t(tx("Preview", "Ko'rib chiqish", "Предпросмотр", "미리보기"))}</p>
                <h3 className="text-2xl font-semibold text-white">{previewGroup.title}</h3>
                <p className="text-xs text-slate-400">{t(previewMeta.label)}</p>
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
                <p className="text-[10px] uppercase text-slate-500">{t(tx("Members", "A'zolar", "Участники", "멤버"))}</p>
                <p className="text-base font-semibold text-white">{previewGroup.members}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">{t(tx("Last activity", "Oxirgi faoliyat", "Последняя активность", "최근 활동"))}</p>
                <p className="text-base font-semibold text-white">{dayjs(previewGroup.lastActivity).fromNow()}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-slate-500">{t(tx("Status", "Status", "Статус", "상태"))}</p>
                <p className="text-base font-semibold text-white">
                  {previewGroup.requiresApproval
                    ? t(tx("Moderated", "Moderatsiyali", "С модерацией", "승인 필요"))
                    : t(tx("Open", "Ochiq", "Открыто", "공개"))}
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm text-slate-300">
              <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{t(tx("Recent posts", "So'nggi postlar", "Последние посты", "최근 게시물"))}</p>
              {previewPosts.length ? (
                previewPosts.map((post) => (
                  <div key={post.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">{post.title}</p>
                    <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                    <p className="mt-2 text-[11px] text-slate-500">
                      {dayjs(post.createdAt).fromNow()} · {post.replies} {t(tx("replies", "javob", "ответов", "답글"))}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">{t(tx("No related posts yet.", "Hozircha tegishli postlar yo'q.", "Пока нет связанных постов.", "아직 관련 게시물이 없습니다."))}</p>
              )}
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setPreviewGroup(null)}
                className="rounded-full border border-slate-700 px-4 py-2 text-[11px] text-slate-200"
              >
                {t(tx("Cancel", "Bekor qilish", "Отмена", "취소"))}
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
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{t(tx("Report reason", "Shikoyat sababi", "Причина жалобы", "신고 사유"))}</p>
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
              placeholder={t(tx("Spam reason: unclear offer, bot, unsafe link...", "Spam sababi: noaniq taklif, bot, ishonchsiz havola...", "Причина спама: непонятное предложение, бот, небезопасная ссылка...", "스팸 사유: 불분명한 제안, 봇, 위험한 링크..."))}
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
                {t(tx("Cancel", "Bekor qilish", "Отмена", "취소"))}
              </button>
              <button
                type="button"
                onClick={handleReportReasonSubmit}
                disabled={reportSubmitting || !reportReason.trim()}
                className="rounded-full bg-rose-500 px-4 py-2 text-slate-50 disabled:opacity-60"
              >
                {reportSubmitting
                  ? t(tx("Submitting...", "Yuborilmoqda...", "Отправка...", "전송 중..."))
                  : t(tx("Submit reason", "Sababni yuborish", "Отправить причину", "사유 제출"))}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
