"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth";
import {
  createAgentReview,
  getAgentById,
  getAgentReviews,
  type AgentDetail,
  type AgentReview
} from "@/api/agent";
import { Avatar } from "@/components/ui/Avatar";
import { toAbsoluteMediaUrl } from "@/lib/mediaUrl";

type PageProps = {
  params: { id: string };
};

const formatCount = (value: number) => value.toLocaleString("en-US");

const resolveListingHref = (type: string, id: string) => {
  if (type === "product") return `/products/${id}`;
  if (type === "service") return `/services/${id}`;
  if (type === "education") return `/education/listings/${id}`;
  if (type === "construction") return `/construction/listings/${id}`;
  if (type === "taxi") return `/taxi/listings/${id}`;
  return "#";
};

const getListingFallback = (type: string) => {
  if (type === "service") return "/fallback/service.png";
  if (type === "product") return "/fallback/product.png";
  return "/placeholder.png";
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

export default function AgentDetailPage({ params }: PageProps) {
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [reviews, setReviews] = useState<AgentReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAgentById(params.id);
        setAgent(data);
        const reviews = await getAgentReviews(params.id);
        setReviews(reviews);
      } catch (err) {
        console.error("Agent detail error", err);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [params.id]);

  const listingCards = useMemo(() => agent?.listings?.listingCards || [], [agent]);

  const handleReviewSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewComment.trim()) {
      setReviewError("Izohni kiriting.");
      return;
    }
    setReviewError(null);
    setReviewLoading(true);
    try {
      await createAgentReview(params.id, { rating: reviewRating, comment: reviewComment.trim() });
      setReviewComment("");
      const [updatedAgent, updatedReviews] = await Promise.all([
        getAgentById(params.id),
        getAgentReviews(params.id)
      ]);
      setAgent(updatedAgent);
      setReviews(updatedReviews);
    } catch (err) {
      console.error("Review submit error", err);
      setReviewError("Review yuborishda xatolik yuz berdi.");
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
        Yuklanmoqda...
      </section>
    );
  }

  if (!agent) {
    return (
      <section className="rounded-3xl border border-slate-800 bg-slate-950/70 p-6 text-sm text-slate-300">
        <p>Agent topilmadi.</p>
        <Link href="/agents" className="mt-3 inline-flex rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-200">
          Agentlar bo'limiga qaytish
        </Link>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar
            src={normalizeAvatar(agent.avatarUrl)}
            alt={agent.name || "Agent"}
            fallbackText={agent.name || agent.username || "Agent"}
            size={64}
            className="border border-slate-700/70"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-50">{agent.name || "Noma'lum agent"}</h1>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200">
                Active
              </span>
              {(agent.verifiedByAdmin || agent.isVerified) && (
                <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[11px] text-sky-100">
                  Verified
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">@{agent.nickname || agent.username || "agent"}</p>
            <p className="mt-2 text-sm text-slate-300">{agent.bio || "Biografiya mavjud emas."}</p>
            <p className="text-xs text-slate-500">
              {agent.regionDetail || agent.region || "Hudud ko'rsatilmagan"}
            </p>
          </div>
          <div className="rounded-2xl bg-slate-950/70 px-4 py-3 text-xs text-slate-300">
            <p>Reyting: {agent.rating?.toFixed?.(1) ?? agent.rating ?? "—"}</p>
            <p>Ko'rishlar: {formatCount(agent.views ?? 0)}</p>
            <p>Layklar: {formatCount(agent.likes ?? 0)}</p>
            <p>Elonlar: {formatCount(agent.listingsCount ?? listingCards.length)}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Agent elonlari</h2>
          <Link href="/agents" className="text-xs text-sky-300">
            Agentlar ro'yxatiga qaytish
          </Link>
        </div>

        {listingCards.length === 0 ? (
          <p className="text-sm text-slate-400">Hozircha elonlar yo'q.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {listingCards.map((card) => (
              <Link
                key={`${card.type}-${card.id}`}
                href={resolveListingHref(card.type, String(card.id))}
                className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-400/60"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={card.imageUrl || getListingFallback(card.type)}
                    alt={card.title || "Listing"}
                    className="h-12 w-16 rounded-lg object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-100">{card.title || "Elon"}</p>
                    <p className="text-xs text-slate-400">Tur: {card.type}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-slate-800 bg-slate-950/80 p-6 shadow-xl shadow-black/30">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-100">Fikrlar</h2>
          <span className="text-xs text-slate-400">{reviews.length} ta</span>
        </div>

        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">Hozircha reviewlar yo'q.</p>
        ) : (
          <div className="mt-3 space-y-3">
            {reviews.map((review) => (
              <div
                key={review._id || review.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 text-xs text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <Avatar
                    src={review.user?.avatarUrl}
                    alt={review.user?.name || "User"}
                    fallbackText={review.user?.name || review.user?.username || "User"}
                    size={32}
                    className="border border-slate-700/70"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-100">{review.user?.name || "User"}</p>
                    <p className="text-[11px] text-slate-400">@{review.user?.username || "user"}</p>
                  </div>
                  <span className="ml-auto text-xs text-emerald-200">{review.rating}/5</span>
                </div>
                <p className="mt-2 text-xs text-slate-300">{review.comment}</p>
              </div>
            ))}
          </div>
        )}

        {isAuthenticated ? (
          <form onSubmit={handleReviewSubmit} className="mt-4 space-y-3 text-xs text-slate-300">
            <div className="flex flex-wrap items-center gap-3">
              <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                Reyting
              </label>
              <select
                className="rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-100"
                value={reviewRating}
                onChange={(event) => setReviewRating(Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              className="h-24 w-full rounded-2xl border border-slate-700 bg-slate-900/80 p-3 text-xs text-slate-100"
              placeholder="Izoh yozing..."
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
            />
            {reviewError && <p className="text-xs text-rose-300">{reviewError}</p>}
            <button
              type="submit"
              className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-200"
              disabled={reviewLoading}
            >
              {reviewLoading ? "Yuborilmoqda..." : "Review yuborish"}
            </button>
          </form>
        ) : (
          <p className="mt-4 text-xs text-slate-400">Review qoldirish uchun login qiling.</p>
        )}
      </section>
    </div>
  );
}
