"use client";

import dayjs from "@/lib/dayjs";
import { useEffect, useState } from "react";

import { useI18n } from "@/context/i18n";
import type { CommunityGroup } from "@/data/communityGroups";
import { tx, type LocalizedText } from "@/lib/localization";
import { getGroupPosts } from "@/data/communityPosts";
import type { CommunityPost } from "@/types/community";
import { fetchCommunityPosts, joinCommunityGroup, reportCommunityGroup } from "@/api/community";

const ACTIVITY_META: Record<CommunityPost["type"], { label: LocalizedText; icon: string }> = {
  post: { label: tx("Post", "Post", "Пост", "게시물"), icon: "📝" },
  comment: { label: tx("Comment", "Komment", "Комментарий", "댓글"), icon: "💬" },
  file: { label: tx("File", "Fayl", "Файл", "파일"), icon: "📎" },
  question: { label: tx("Q&A", "Savol-javob", "Вопросы и ответы", "질문과 답변"), icon: "❓" },
  like: { label: tx("Like", "Like", "Лайк", "좋아요"), icon: "❤️" }
};

type Props = {
  group: CommunityGroup;
};

export function CommunityDetailClient({ group }: Props) {
  const { t } = useI18n();
  const [joined, setJoined] = useState(false);
  const [spamCount, setSpamCount] = useState(group.spamReports);
  const [submitting, setSubmitting] = useState(false);
  const [activityItems, setActivityItems] = useState<CommunityPost[]>(() => getGroupPosts(group.id));
  const isClosedGroup = group.privacy === "closed";
  const isChannel = group.channelType === "channel";
  const joinLabel = joined
    ? t(tx("Leave", "Chiqish", "Выйти", "나가기"))
    : group.requiresApproval
      ? t(tx("Request access", "Ruxsat so'rash", "Запросить доступ", "접근 요청"))
      : t(tx("Join", "Qo'shilish", "Присоединиться", "참여"));

  const resolveAuthorLabel = (author: CommunityPost["author"]) => {
    return author || t(tx("User", "Foydalanuvchi", "Пользователь", "사용자"));
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
    const confirmed = window.confirm(
      t(tx("Do you want to report this as spam? Please provide a reason.", "Spam deb belgilamoqchimisiz? Sababini kiriting.", "Отметить это как спам? Укажите причину.", "이 항목을 스팸으로 신고하시겠습니까? 사유를 입력하세요."))
    );
    if (!confirmed) return;
    const reason = window.prompt(
      t(tx("Write a short spam reason", "Spam sababini qisqacha yozing", "Кратко опишите причину спама", "스팸 사유를 간단히 작성하세요")),
      t(tx("Unwanted offer / bot message", "Keraksiz taklif / bot xabari", "Нежелательное предложение / сообщение бота", "원치 않는 제안 / 봇 메시지"))
    );
    if (!reason) return;

    setSubmitting(true);
    try {
      await reportCommunityGroup(group.id, reason);
      setSpamCount((prev) => prev + 1);
      alert(t(tx("Spam report submitted. Thank you.", "Spam hisoboti yuborildi. Rahmat.", "Жалоба на спам отправлена. Спасибо.", "스팸 신고가 접수되었습니다. 감사합니다.")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
            {isChannel
              ? t(tx("Channels", "Kanallar", "Каналы", "채널"))
              : t(tx("Groups", "Guruhlar", "Группы", "그룹"))}
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{group.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{group.description}</p>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              !isClosedGroup ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
            }`}
          >
            {!isClosedGroup
              ? t(tx("Open", "Ochiq", "Открытая", "공개"))
              : t(tx("Closed", "Yopiq", "Закрытая", "비공개"))}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {group.members} {t(tx("members", "a'zo", "участников", "명"))}
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
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{t(tx("Host", "Admin", "Владелец", "운영자"))}</p>
          <p className="mt-1 text-base text-slate-900">{group.host || t(tx("Community team", "Jamoa administratori", "Команда сообщества", "커뮤니티 팀"))}</p>
          <p className="mt-1 text-xs text-slate-500">
            {isChannel
              ? t(tx("Channel owners", "Kanal egalari", "Владельцы канала", "채널 운영진"))
              : t(tx("Group moderators", "Guruh moderatorlari", "Модераторы группы", "그룹 운영진"))}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-600">
          <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">{t(tx("Rating & Spam", "Reyting va spam", "Рейтинг и спам", "평점 및 스팸"))}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-800">{group.rating.toFixed(1)}</p>
          <p className="text-xs text-slate-500">
            {group.category} · {t(tx("Spam", "Spam", "Спам", "스팸"))}: {spamCount}
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
          {joinLabel}
        </button>
        <button
          type="button"
          onClick={handleReportSpam}
          disabled={submitting}
          className="rounded-full border border-rose-500 px-4 py-2 text-xs font-semibold text-rose-600 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {t(tx("Report spam", "Spam haqida xabar berish", "Пожаловаться на спам", "스팸 신고"))}
        </button>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-slate-950/80 p-4 text-sm text-slate-200">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{t(tx("Access notes", "Kirish izohlari", "Примечания по доступу", "접근 안내"))}</p>
        <p className="mt-2 text-sm text-slate-100">
          {isClosedGroup
            ? t(tx(
                "This is a closed group or channel. Only approved members or invited users can join.",
                "Bu yopiq guruh yoki kanal. Faqat ruxsat berilgan a'zolar yoki admin taklif qilgan foydalanuvchilar kira oladi.",
                "Это закрытая группа или канал. Вход доступен только одобренным участникам или по приглашению администратора.",
                "이곳은 비공개 그룹 또는 채널입니다. 승인된 멤버나 관리자 초대를 받은 사용자만 참여할 수 있습니다."
              ))
            : t(tx(
                "This is an open group. Any user can join immediately.",
                "Bu ochiq guruh. Istalgan foydalanuvchi darhol qo'shilishi mumkin.",
                "Это открытая группа. Любой пользователь может присоединиться сразу.",
                "이곳은 공개 그룹입니다. 누구나 바로 참여할 수 있습니다."
              ))}
        </p>
        <p className="mt-2 text-xs text-slate-400">
          {t(tx(
            "Spam count is based on user reports for this group or channel. Please report fairly and responsibly.",
            "Spam ko'rsatkichi bu guruh yoki kanal bo'yicha foydalanuvchi hisobotlariga asoslanadi. Iltimos, adolatli baho bering.",
            "Показатель спама формируется на основе пользовательских жалоб по этой группе или каналу. Пожалуйста, оценивайте справедливо.",
            "스팸 수치는 이 그룹 또는 채널에 대한 사용자 신고를 기반으로 합니다. 공정하게 신고해 주세요."
          ))}
        </p>
      </div>
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-100/60 p-4 text-slate-800 shadow-inner">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-slate-500">{t(tx("Activity feed", "Faoliyat oqimi", "Лента активности", "활동 피드"))}</p>
            <h3 className="text-xl font-semibold text-slate-900">{t(tx("Questions, posts, and media", "Savollar, postlar va media", "Вопросы, посты и медиа", "질문, 게시물 및 미디어"))}</h3>
            <p className="text-xs text-slate-500">
              {t(tx(
                "Each channel can include posts, comments, likes, file uploads, and 3+ relevant Q&A items.",
                "Har bir kanal ichida post, komment, like, fayl yuklash va kamida 3 ta mos savol-javob bo'lishi mumkin.",
                "Каждый канал может содержать посты, комментарии, лайки, загрузку файлов и не менее 3 релевантных Q&A.",
                "각 채널에는 게시물, 댓글, 좋아요, 파일 업로드와 3개 이상의 관련 Q&A가 포함될 수 있습니다."
              ))}
            </p>
          </div>
          <span className="text-[11px] text-slate-500">{t(tx("All activity is visible in detail view", "Barcha faoliyat detail sahifada ko'rinadi", "Вся активность видна в подробном режиме", "상세 보기에서 모든 활동을 확인할 수 있습니다"))}</span>
        </div>
        {activityItems.length === 0 ? (
          <p className="text-xs text-slate-500">{t(tx("No active posts yet.", "Hozircha aktiv postlar yo'q.", "Пока нет активных постов.", "아직 활성 게시물이 없습니다."))}</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {activityItems.map((item) => {
              const meta = ACTIVITY_META[item.type];
              return (
                <article key={item.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-600">
                      {meta.icon} {t(meta.label)}
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
                    <span>💬 {item.replies} {t(tx("replies", "javob", "ответов", "답글"))}</span>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        <div className="rounded-2xl border border-slate-300 bg-slate-900/80 p-4 text-sm text-slate-100">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t(tx("Media & communication", "Media va aloqa", "Медиа и связь", "미디어 및 소통"))}</p>
          <p className="mt-2">
            {t(tx(
              "Within this group or channel, images, video, chat, voice calls, and video calls can be used with admin approval.",
              "Ushbu guruh yoki kanal ichida admin roziligi bilan rasm, video, chat, oddiy va video qo'ng'iroqlardan foydalanishingiz mumkin.",
              "Внутри этой группы или канала с одобрения администратора можно использовать изображения, видео, чат, голосовые и видеозвонки.",
              "이 그룹 또는 채널 안에서는 관리자 승인 후 이미지, 비디오, 채팅, 음성 통화, 영상 통화를 사용할 수 있습니다."
            ))}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {t(tx(
              "Each session can support screen sharing, voice or video calls, and file or video attachments.",
              "Har bir sessiyada screen share, voice yoki video call hamda fayl va video biriktirish imkoniyati mavjud.",
              "В каждой сессии доступны демонстрация экрана, голосовые или видеозвонки, а также вложения файлов и видео.",
              "각 세션에서는 화면 공유, 음성/영상 통화, 파일 및 비디오 첨부를 지원할 수 있습니다."
            ))}
          </p>
        </div>
      </div>
    </div>
  );
}

export default CommunityDetailClient;
