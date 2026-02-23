"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { JobListing, LocalizedText } from "@/data/jobListings";
import { useAuthStore } from "@/store/auth";
import { getCourseById } from "@/data/coursesStore";
import type { EducationCourse } from "@/data/educationCourses";
import { useI18n } from "@/context/i18n";

type ChatMessage = {
  id: string;
  author: "agent" | "user";
  text: string;
  time: string;
};

const formatTime = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
};

export function ChatClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job");
  const courseId = searchParams.get("course");
  const returnTo = searchParams.get("from");
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();
  const [job, setJob] = useState<JobListing | null>(null);
  const [course, setCourse] = useState<EducationCourse | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const { language } = useI18n();

  const resolveLocalizedText = (value?: string | LocalizedText) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[language] ?? value.en ?? value.uz ?? value.ru ?? value.ko ?? "";
  };

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const load = async () => {
      if (courseId) {
        const foundCourse = getCourseById(courseId);
        setCourse(foundCourse);
        setJob(null);
        setLoading(false);
        return;
      }
      if (!jobId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/jobs/${jobId}`);
        if (!res.ok) {
          setJob(null);
          return;
        }
        const data = await res.json();
        setJob(data.item as JobListing);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [courseId, jobId]);

  useEffect(() => {
    if (!job) return;
    setMessages([
      {
        id: "m1",
        author: "agent",
        text: `Assalomu alaykum! ${resolveLocalizedText(job.title)} bo'yicha savollaringiz bo'lsa yozing.`,
        time: "09:12"
      },
      {
        id: "m2",
        author: "agent",
        text: "Ish joyi va shartlar haqida qisqacha ma'lumot bera olaman.",
        time: "09:13"
      }
    ]);
  }, [job]);

  useEffect(() => {
    if (!course) return;
    setMessages([
      {
        id: "c1",
        author: "agent",
        text: `Salom! ${course.title} kursi haqida savollaringiz bormi?`,
        time: "10:05"
      },
      {
        id: "c2",
        author: "agent",
        text: "Dars jadvali va davomiyligi bo'yicha batafsil tushuntirib beraman.",
        time: "10:06"
      }
    ]);
  }, [course]);

  const headerSubtitle = useMemo(() => {
    if (course) return `${course.agentName} • ${course.subCategory}`;
    if (!job) return "Chat";
    return `${resolveLocalizedText(job.company)} • ${resolveLocalizedText(job.location)}`;
  }, [course, job, language]);

  const handleSend = () => {
    if (!draft.trim()) return;
    const next: ChatMessage = {
      id: `m-${Date.now()}`,
      author: "user",
      text: draft.trim(),
      time: formatTime()
    };
    setMessages((prev) => [...prev, next]);
    setDraft("");
  };

  if (!isAuthenticated) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
          <h1 className="text-xl font-semibold text-white">Chatga kirish</h1>
          <p className="mt-2 text-sm text-slate-300">
            Ish e'lon egasi bilan muloqot qilish uchun login bo'lishingiz kerak.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/login"
              className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
            >
              Kirish
            </Link>
            <button
              type="button"
              onClick={() => {
                if (returnTo) {
                  router.push(returnTo);
                  return;
                }
                router.back();
              }}
              className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-200"
            >
              Orqaga
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-slate-400">Chat yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Chat</p>
            <h1 className="text-xl font-semibold text-white">
              {course?.title || resolveLocalizedText(job?.title) || "Chat"}
            </h1>
            <p className="text-xs text-slate-400">{headerSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (returnTo) {
                router.push(returnTo);
                return;
              }
              router.back();
            }}
            className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300"
          >
            Orqaga
          </button>
        </div>

        <div className="mt-6 h-[420px] overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-400">Xabarlar yo'q. Birinchi bo'lib yozing.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.author === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-slate-100 ${
                      msg.author === "user"
                        ? "bg-emerald-500/20 ring-1 ring-emerald-400/40"
                        : "bg-slate-900/70 ring-1 ring-slate-700/80"
                    }`}
                  >
                    <p>{msg.text}</p>
                    <p className="mt-1 text-[11px] text-slate-400">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex gap-2">
          <input
            className="flex-1 rounded-full border border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-200"
            placeholder="Xabar yozing..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            type="button"
            onClick={handleSend}
            className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
          >
            Yuborish
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatClient;
