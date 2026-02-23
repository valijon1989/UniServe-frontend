"use client";

import dayjs from "@/lib/dayjs";
import { useEffect, useMemo, useState } from "react";

import type { CommunityGroup } from "@/data/communityGroups";
import { getGroupPosts } from "@/data/communityPosts";
import type { CommunityPost } from "@/types/community";
import { fetchCommunityPosts, joinCommunityGroup, reportCommunityGroup } from "@/api/community";

const ACTIVITY_META: Record<CommunityPost["type"], { label: string; icon: string }> = {
  post: { label: "Post", icon: "📝" },
  comment: { label: "Comment", icon: "💬" },
  file: { label: "File/Fayl", icon: "📎" },
  question: { label: "Savol-javob", icon: "❓" },
  like: { label: "Like", icon: "❤️" }
};

type Props = {
  group: CommunityGroup;
};

export function CommunityDetailClient({ group }: Props) {
  const [joined, setJoined] = useState(false);
  const [spamCount, setSpamCount] = useState(group.spamReports);
  const [submitting, setSubmitting] = useState(false);
  const [activityItems, setActivityItems] = useState<CommunityPost[]>(() => getGroupPosts(group.id));

  const resolveAuthorLabel = (author: CommunityPost["author"]) => {
    return author || "Foydalanuvchi";
  };

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const posts = await fetchCommunityPosts(group.id);
        if (active && posts.length > 0) {
          setActivityItems(posts);
        }
      } catch {
        // keep fallback posts
      }
    })();
    return () => {
      active = false;
    };
  }, [group.id]);

  const handleJoinToggle = async () => {
    setSubmitting(true);
    const action = joined ? "leave" : "join";
    try {
      await joinCommunityGroup(group.id, action);
      setJoined(!joined);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSpam = async () => {
    const confirmed = window.confirm("Spamni tasdiqlaysizmi? Sababni keltiring.");
    if (!confirmed) return;
    const reason = window.prompt("Spam sababini qisqacha yozing", "Keraksiz taklif / bot xabari");
    if (!reason) return;

    setSubmitting(true);
    try {
      await reportCommunityGroup(group.id, reason);
      setSpamCount((prev) => prev + 1);
      alert("Spam hisobi qayd etildi. Rahmat.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {group.channelType === "channel" ? "Kanallar" : "Guruhlar"}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{group.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{group.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              group.privacy === "open" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
            }`}
          >
            {group.privacy === "open" ? "Ochiq" : "Yopiq"}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {group.members} a'zo
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {group.tags.map((tag) => (
          <span key={tag} className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
            #{tag}
          </span>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Host</p>
          <p className="mt-1 text-base text-slate-900">{group.host || "Hoziroq maxsus jamoadan"}</p>
          <p className="mt-1 text-xs text-slate-500">
            {group.channelType === "channel" ? "Kanal egalari" : "Guruh moderatorlari"}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Rating & Spam</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{group.rating.toFixed(1)}</p>
          <p className="text-xs text-slate-500">
            {group.category} · Spam: {spamCount}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleJoinToggle}
          disabled={submitting}
          className="rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {joined ? "Leave" : group.requiresApproval ? "Request access" : "Join"}
        </button>
        <button
          type="button"
          onClick={handleReportSpam}
          disabled={submitting}
          className="rounded-full border border-rose-500 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          Report spam
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-950/80 p-4 text-sm text-slate-200">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Access notes</p>
        <p className="mt-2 text-sm text-slate-100">
          {group.privacy === "closed"
            ? "Yopiq guruh/kanal. Faqat ruxsat berilgan a'zolar va admin taklifiga ko‘ra kirish mumkin."
            : "Ochiq guruh. Xohlagan foydalanuvchi darhol qo‘shilishi mumkin."}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          Spam hisobi: bu guruh/yoki kanal haqidagi foydalanuvchi baholari asosida yaratiladi. Adolatli baho yozish uchun sabrli bo‘ling.
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-100/60 p-4 text-slate-800 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">Activity feed</p>
            <h3 className="text-xl font-semibold text-slate-900">Savollar, postlar va media</h3>
            <p className="text-xs text-slate-500">
              Har kanal ichida post, komment, like, fayl yuklash va savol-javob qismida loyihaga mos 3+ ta savol-javob.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">Detallarda barcha faoliyat ko‘rinadi</span>
        </div>
        {activityItems.length === 0 ? (
          <p className="text-xs text-slate-500">Hozircha aktiv postlar yo‘q.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {activityItems.map((item) => {
              const meta = ACTIVITY_META[item.type];
              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">
                      {meta.icon} {meta.label}
                    </span>
                    <span>{dayjs(item.createdAt).fromNow()}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-semibold text-slate-900 line-clamp-2">{item.title}</h4>
                  <p className="mt-1 text-[12px] text-slate-600 line-clamp-2">{item.body}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                    <span>
                      🧑‍💼 {resolveAuthorLabel(item.author)} ({item.role})
                    </span>
                    <span>🏷 {item.category}</span>
                  </div>
                  {item.attachments?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-slate-500">
                      {item.attachments.map((attachment) => (
                        <span key={attachment.id} className="rounded-full border border-slate-200 px-2 py-0.5">
                          {attachment.type === "video" ? "🎥" : attachment.type === "image" ? "🖼️" : "📁"}{" "}
                          {attachment.label}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-3 flex items-center gap-3 text-[12px] text-slate-500">
                    <span>❤ {item.likes}</span>
                    <span>💬 {item.replies}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="rounded-2xl border border-slate-300 bg-slate-900/80 p-4 text-sm text-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Media & aloqa</p>
          <p className="mt-2">
            Ushbu guruh/kanal doirasida rasm, video, chat, oddiy va video qo‘ng‘iroqlarni (screen-share, kamera, mikrofon)
            admin roziligi bilan amalga oshirishingiz mumkin.
          </p>
          <p className="mt-2 text-xs text-slate-400">
            Har bir sessiyada ekran ulashish va telefoncha qo‘ng‘iroq – video/voice call funksiyasi mavjud, shu bilan birga
            fayl va video qo‘shish mumkin.
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommunityDetailClient;
