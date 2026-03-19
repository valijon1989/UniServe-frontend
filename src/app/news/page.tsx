"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  createFeedPost,
  dislikePost,
  getFeed,
  likePost,
  sharePost,
  type CreateFeedInput,
  type FeedItem
} from "@/api/feed";
import { PostCard, type PostReaction } from "@/components/posts/PostCard";
import { PostComposer } from "@/components/posts/PostComposer";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

const toNumber = (value: unknown, fallback = 0) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.trunc(numeric)) : fallback;
};

const getPostId = (post: FeedItem) => String(post.id || post._id || post.slug || "");

const sortOldestFirst = (items: FeedItem[]) => {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.createdAt || 0).getTime();
    const bTime = new Date(b.createdAt || 0).getTime();
    return aTime - bTime;
  });
};

const getLikeCount = (post: FeedItem) => {
  if (typeof post.likesCount === "number") return Math.max(0, post.likesCount);
  if (Array.isArray(post.likes)) return post.likes.length;
  return 0;
};

const getDislikeCount = (post: FeedItem) => {
  if (typeof post.dislikesCount === "number") return Math.max(0, post.dislikesCount);
  if (Array.isArray(post.dislikes)) return post.dislikes.length;
  return 0;
};

const getCommentCount = (post: FeedItem) => {
  if (typeof post.commentsCount === "number") return Math.max(0, post.commentsCount);
  if (Array.isArray(post.comments)) return post.comments.length;
  return 0;
};

const getShareCount = (post: FeedItem) => {
  if (typeof post.sharesCount === "number") return Math.max(0, post.sharesCount);
  if (Array.isArray(post.shares)) return post.shares.length;
  return 0;
};

const updatePostCounts = (post: FeedItem, patch: Partial<Pick<FeedItem, "likesCount" | "dislikesCount" | "commentsCount" | "sharesCount">>) => {
  return {
    ...post,
    likesCount: patch.likesCount ?? getLikeCount(post),
    dislikesCount: patch.dislikesCount ?? getDislikeCount(post),
    commentsCount: patch.commentsCount ?? getCommentCount(post),
    sharesCount: patch.sharesCount ?? getShareCount(post)
  };
};

const mergeServerPost = (current: FeedItem, incoming: FeedItem) => {
  return {
    ...current,
    ...incoming,
    likesCount: getLikeCount(incoming),
    dislikesCount: getDislikeCount(incoming),
    commentsCount: getCommentCount(incoming),
    sharesCount: getShareCount(incoming)
  };
};

export default function NewsPage() {
  const router = useRouter();
  const { t } = useI18n();
  const { isHydrated, isAuthenticated, hydrateFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [reactions, setReactions] = useState<Record<string, PostReaction>>({});

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!isAuthenticated) {
      setLoading(false);
      setPosts([]);
      return;
    }

    let active = true;
    const loadFeed = async () => {
      setLoading(true);
      try {
        const feed = await getFeed({ sort: "oldest_first" });
        if (!active) return;
        setPosts(sortOldestFirst(feed));
      } catch (error) {
        if (!active) return;
        setPosts([]);
        toast.error(
          t({
            en: "Unable to load the post feed.",
            uz: "Postlar lentasini yuklab bo'lmadi.",
            ru: "Не удалось загрузить ленту постов.",
            ko: "게시물 피드를 불러오지 못했습니다."
          })
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadFeed();
    return () => {
      active = false;
    };
  }, [isAuthenticated, isHydrated]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return posts;
    return posts.filter((post) => {
      const haystack = [
        post.text,
        post.content,
        post.author?.name,
        post.author?.username,
        post.type,
        post.category
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, search]);

  const handleCreatePost = async (payload: CreateFeedInput) => {
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in to publish a post.",
          uz: "Post joylash uchun login qiling.",
          ru: "Войдите, чтобы опубликовать пост.",
          ko: "게시물을 올리려면 로그인하세요."
        })
      );
      router.push("/login");
      return;
    }

    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const now = new Date().toISOString();
    const text = (payload.text || payload.content || "").trim();

    const optimisticPost: FeedItem = {
      id: tempId,
      _id: tempId,
      author: {
        name: t({
          en: "You",
          uz: "Siz",
          ru: "Вы",
          ko: "나"
        }),
        username: "me"
      },
      text,
      content: text,
      category: "social",
      type: "social",
      linkUrl: payload.linkUrl,
      createdAt: now,
      likesCount: 0,
      dislikesCount: 0,
      commentsCount: 0,
      sharesCount: 0,
      images: [],
      mediaUrl: undefined
    };

    setPosting(true);
    setPosts((prev) => sortOldestFirst([...prev, optimisticPost]));

    try {
      const created = await createFeedPost(payload);
      const createdId = getPostId(created) || tempId;
      setPosts((prev) =>
        sortOldestFirst(
          prev.map((item) => {
            if (getPostId(item) !== tempId) return item;
            return {
              ...created,
              id: createdId,
              _id: created._id || createdId,
              likesCount: getLikeCount(created),
              dislikesCount: getDislikeCount(created),
              commentsCount: getCommentCount(created),
              sharesCount: getShareCount(created)
            };
          })
        )
      );
      toast.success(
        t({
          en: "Post published.",
          uz: "Post joylandi.",
          ru: "Пост опубликован.",
          ko: "게시물이 업로드되었습니다."
        })
      );
    } catch (error) {
      setPosts((prev) => prev.filter((item) => getPostId(item) !== tempId));
      setPosting(false);
      throw error;
    } finally {
      setPosting(false);
    }
  };

  const applyReaction = async (post: FeedItem, nextReaction: PostReaction) => {
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in to react to posts.",
          uz: "Reaksiya uchun login qiling.",
          ru: "Войдите, чтобы поставить реакцию.",
          ko: "반응을 남기려면 로그인하세요."
        })
      );
      router.push("/login");
      return;
    }

    const postId = getPostId(post);
    if (!postId) return;

    const prevReaction = reactions[postId] || null;
    const prevLikes = getLikeCount(post);
    const prevDislikes = getDislikeCount(post);

    let nextLikes = prevLikes;
    let nextDislikes = prevDislikes;

    if (prevReaction === "like") nextLikes = Math.max(0, nextLikes - 1);
    if (prevReaction === "dislike") nextDislikes = Math.max(0, nextDislikes - 1);
    if (nextReaction === "like") nextLikes += 1;
    if (nextReaction === "dislike") nextDislikes += 1;

    setReactions((prev) => ({ ...prev, [postId]: nextReaction }));
    setPosts((prev) =>
      prev.map((item) => {
        if (getPostId(item) !== postId) return item;
        return updatePostCounts(item, {
          likesCount: nextLikes,
          dislikesCount: nextDislikes
        });
      })
    );

    try {
      const updated = nextReaction === "dislike" ? await dislikePost(postId) : await likePost(postId);
      if (updated) {
        setPosts((prev) => prev.map((item) => (getPostId(item) === postId ? mergeServerPost(item, updated) : item)));
      }
    } catch (error) {
      setReactions((prev) => ({ ...prev, [postId]: prevReaction }));
      setPosts((prev) =>
        prev.map((item) => {
          if (getPostId(item) !== postId) return item;
          return updatePostCounts(item, {
            likesCount: prevLikes,
            dislikesCount: prevDislikes
          });
        })
      );
      toast.error(
        t({
          en: "Unable to save the reaction.",
          uz: "Reaksiyani saqlab bo'lmadi.",
          ru: "Не удалось сохранить реакцию.",
          ko: "반응을 저장하지 못했습니다."
        })
      );
    }
  };

  const handleLike = async (post: FeedItem) => {
    const postId = getPostId(post);
    if (!postId) return;
    const currentReaction = reactions[postId] || null;
    const nextReaction: PostReaction = currentReaction === "like" ? null : "like";
    await applyReaction(post, nextReaction);
  };

  const handleDislike = async (post: FeedItem) => {
    const postId = getPostId(post);
    if (!postId) return;
    const currentReaction = reactions[postId] || null;
    const nextReaction: PostReaction = currentReaction === "dislike" ? null : "dislike";
    await applyReaction(post, nextReaction);
  };

  const handleComment = (post: FeedItem) => {
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in to write a comment.",
          uz: "Izoh yozish uchun login qiling.",
          ru: "Войдите, чтобы оставить комментарий.",
          ko: "댓글을 작성하려면 로그인하세요."
        })
      );
      router.push("/login");
      return;
    }
    const postId = getPostId(post);
    if (!postId) return;
    router.push(`/posts/${postId}#comments`);
  };

  const handleShare = async (post: FeedItem) => {
    if (!isAuthenticated) {
      toast.error(
        t({
          en: "Sign in to share posts.",
          uz: "Ulashish uchun login qiling.",
          ru: "Войдите, чтобы поделиться постом.",
          ko: "게시물을 공유하려면 로그인하세요."
        })
      );
      router.push("/login");
      return;
    }
    const postId = getPostId(post);
    if (!postId || typeof window === "undefined") return;

    const url = `${window.location.origin}/posts/${postId}`;
    const shareText = (post.content || post.text || "").trim().slice(0, 140);

    try {
      if (navigator.share) {
        await navigator.share({
          title: t({
            en: "UniServe post",
            uz: "UniServe posti",
            ru: "Пост UniServe",
            ko: "UniServe 게시물"
          }),
          text: shareText,
          url
        });
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        toast.success(
          t({
            en: "Post link copied.",
            uz: "Post havolasi nusxalandi.",
            ru: "Ссылка на пост скопирована.",
            ko: "게시물 링크가 복사되었습니다."
          })
        );
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      toast.error(
        t({
          en: "Unable to share the post.",
          uz: "Ulashishda xatolik yuz berdi.",
          ru: "Не удалось поделиться постом.",
          ko: "게시물을 공유하지 못했습니다."
        })
      );
      return;
    }

    const previousShares = getShareCount(post);
    setPosts((prev) =>
      prev.map((item) => (getPostId(item) === postId ? updatePostCounts(item, { sharesCount: previousShares + 1 }) : item))
    );

    try {
      const updated = await sharePost(postId);
      if (updated) {
        setPosts((prev) => prev.map((item) => (getPostId(item) === postId ? mergeServerPost(item, updated) : item)));
      }
    } catch {
      setPosts((prev) =>
        prev.map((item) => (getPostId(item) === postId ? updatePostCounts(item, { sharesCount: previousShares }) : item))
      );
      toast.error(
        t({
          en: "Unable to update the share count.",
          uz: "Share hisobini yangilab bo'lmadi.",
          ru: "Не удалось обновить счетчик репостов.",
          ko: "공유 수를 업데이트하지 못했습니다."
        })
      );
    }
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl border border-slate-800 shadow-xl shadow-black/30">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "linear-gradient(120deg, rgba(2,6,23,0.85), rgba(2,132,199,0.25)), url('/images/news-header.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
          aria-hidden="true"
        />
        <div className="relative p-6 md:p-8">
          <p className="text-xs uppercase tracking-[0.25em] text-sky-200">
            {t({
              en: "News / Social Feed",
              uz: "Yangiliklar / Ijtimoiy lenta",
              ru: "Новости / Социальная лента",
              ko: "뉴스 / 소셜 피드"
            })}
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-50">
            {t({
              en: "Instagram-style post feed",
              uz: "Instagram uslubidagi post lentasi",
              ru: "Лента постов в стиле Instagram",
              ko: "인스타그램 스타일의 게시물 피드"
            })}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            {t({
              en: "Posts are ordered from oldest to newest by time. New posts are always added to the end of the feed.",
              uz: "Postlar vaqt bo'yicha eskidan yangiga tartibda ketadi. Yangi postlar doim lentaning oxiriga qo'shiladi.",
              ru: "Посты идут по времени от старых к новым. Новые посты всегда добавляются в конец ленты.",
              ko: "게시물은 오래된 순서에서 최신 순서로 정렬되며, 새 게시물은 항상 피드 맨 끝에 추가됩니다."
            })}
          </p>
        </div>
      </header>

      <div className="rounded-3xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-black/25">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t({
              en: "Search by post, author, or category...",
              uz: "Post, muallif yoki kategoriya bo'yicha qidiring...",
              ru: "Ищите по посту, автору или категории...",
              ko: "게시물, 작성자 또는 카테고리로 검색하세요..."
            })}
            className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm text-slate-100 outline-none ring-1 ring-transparent transition focus:border-sky-500/70 focus:ring-sky-500/30 md:max-w-xl"
          />
          <span className="rounded-full bg-slate-900/70 px-3 py-1 text-xs text-slate-200 ring-1 ring-slate-800">
            {filtered.length}{" "}
            {t({
              en: "posts",
              uz: "post",
              ru: "постов",
              ko: "게시물"
            })}
          </span>
        </div>
      </div>

      {!isHydrated ? (
        <p className="text-sm text-slate-400">
          {t({
            en: "Loading...",
            uz: "Yuklanmoqda...",
            ru: "Загрузка...",
            ko: "불러오는 중..."
          })}
        </p>
      ) : !isAuthenticated ? (
        <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-center shadow-lg shadow-black/25">
          <h2 className="text-lg font-semibold text-slate-100">
            {t({
              en: "Login required",
              uz: "Login talab qilinadi",
              ru: "Требуется вход",
              ko: "로그인이 필요합니다"
            })}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {t({
              en: "Sign in first to browse the news feed and interact with posts.",
              uz: "News lentasi va postlar bilan ishlash uchun avval tizimga kiring.",
              ru: "Сначала войдите в систему, чтобы просматривать ленту новостей и работать с постами.",
              ko: "뉴스 피드를 보고 게시물과 상호작용하려면 먼저 로그인하세요."
            })}
          </p>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="mt-4 rounded-xl bg-sky-600 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-500"
          >
            {t({
              en: "Go to login",
              uz: "Loginga o'tish",
              ru: "Перейти ко входу",
              ko: "로그인으로 이동"
            })}
          </button>
        </section>
      ) : (
        <PostComposer onSubmit={handleCreatePost} pending={posting} />
      )}

      <section className="space-y-4">
        {loading && (
          <p className="text-sm text-slate-400">
            {t({
              en: "Loading...",
              uz: "Yuklanmoqda...",
              ru: "Загрузка...",
              ko: "불러오는 중..."
            })}
          </p>
        )}
        {!loading && filtered.length === 0 && (
          <p className="text-sm text-slate-400">
            {t({
              en: "No posts yet.",
              uz: "Hozircha post yo'q.",
              ru: "Постов пока нет.",
              ko: "아직 게시물이 없습니다."
            })}
          </p>
        )}

        {filtered.map((post) => {
          const postId = getPostId(post);
          return (
            <PostCard
              key={postId || `${post.createdAt}-${post.content}`}
              post={post}
              likes={getLikeCount(post)}
              dislikes={getDislikeCount(post)}
              comments={toNumber(post.commentsCount, getCommentCount(post))}
              shares={getShareCount(post)}
              reaction={reactions[postId] || null}
              onLike={() => handleLike(post)}
              onDislike={() => handleDislike(post)}
              onComment={() => handleComment(post)}
              onShare={() => handleShare(post)}
            />
          );
        })}
      </section>
    </div>
  );
}
