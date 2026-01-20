"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCourseById } from "@/data/coursesStore";
import { useAuthStore } from "@/store/auth";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const courseId = String(params?.id || "");
  const course = useMemo(() => getCourseById(courseId), [courseId]);
  const returnTo = searchParams.get("from");

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    router.back();
  };

  if (!course) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-rose-300">Kurs topilmadi.</p>
        <button
          type="button"
          onClick={handleBack}
          className="mt-3 rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-200"
        >
          Orqaga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-6">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-300"
        >
          Orqaga
        </button>

        <div className="mt-4 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              {course.images.map((image, idx) => (
                <img
                  key={`${course.id}-${idx}`}
                  src={image}
                  alt={course.title}
                  className="h-32 w-full rounded-xl object-cover"
                />
              ))}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">{course.title}</h1>
              <p className="text-sm text-slate-300">{course.agentName} • {course.agentHandle}</p>
              <p className="mt-2 text-xs text-slate-400">{course.description}</p>
            </div>

            <div className="grid gap-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Yo'nalish:</span> {course.subCategory}
              </p>
              <p>
                <span className="text-slate-400">Dars formati:</span> {course.mode.toUpperCase()}
              </p>
              <p>
                <span className="text-slate-400">Jadval:</span> {course.scheduleDays} • {course.scheduleTime}
              </p>
              <p>
                <span className="text-slate-400">Haftalik:</span> {course.weeklyDays} kun • {course.weeklyHours} soat
              </p>
              <p>
                <span className="text-slate-400">Davomiylik:</span> {course.durationWeeks} hafta
              </p>
              <p>
                <span className="text-slate-400">Dars tili:</span> {course.teachingLanguage}
              </p>
              <p>
                <span className="text-slate-400">O'quvchilar:</span> {course.studentsCount}
              </p>
              <p>
                <span className="text-slate-400">Baho:</span> {course.rating.toFixed(1)}/5
              </p>
              <p>
                <span className="text-slate-400">Narx:</span> {course.price}
              </p>
              {course.location && (
                <p>
                  <span className="text-slate-400">Manzil:</span> {course.location} {course.room ? `• ${course.room}` : ""}
                </p>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Natijalar</p>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-slate-300">
                {course.outcomes.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Sertifikatlar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                {course.certificates.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/70 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                  >
                    Agent bilan bog'lanish
                  </button>
                  <div className="space-y-2 text-xs text-slate-300">
                    {course.contactPhone && (
                      <p>
                        Telefon:{" "}
                        <a href={`tel:${course.contactPhone}`} className="text-emerald-200 underline">
                          {course.contactPhone}
                        </a>
                      </p>
                    )}
                    {course.contactTelegram && (
                      <p>
                        Telegram:{" "}
                        <a
                          href={`https://t.me/${course.contactTelegram.replace("@", "")}`}
                          className="text-emerald-200 underline"
                        >
                          {course.contactTelegram}
                        </a>
                      </p>
                    )}
                    {course.chatUrl && (
                      <p>
                        Chat:{" "}
                        <Link
                          href={`${course.chatUrl}${course.chatUrl.includes("?") ? "&" : "?"}from=${encodeURIComponent(
                            returnTo || "/services?group=spiritual&category=education"
                          )}`}
                          className="text-emerald-200 underline"
                        >
                          Xabar yozish
                        </Link>
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full rounded-full bg-slate-800 px-4 py-2 text-center text-xs font-semibold text-slate-200"
                  >
                    Bog'lanish uchun kirish
                  </Link>
                  <p className="mt-2 text-[11px] text-slate-400">
                    Chat va bog'lanish faqat login bo'lganlarga ochiq.
                  </p>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
