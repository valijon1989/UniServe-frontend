"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  educationCategories,
  educationSubCategories,
  type CourseMode,
  type EducationCategory,
  type EducationCourse
} from "@/data/educationCourses";
import { getDefaultSubCategory, listCourses } from "@/data/coursesStore";
import { useI18n } from "@/context/i18n";
import { useAuthStore } from "@/store/auth";

type TranslatedText = { en: string; uz: string; ru: string; ko: string };

const modeLabels: Record<CourseMode | "all", TranslatedText> = {
  all: { en: "All", uz: "Barchasi", ru: "Все", ko: "전체" },
  online: { en: "Online", uz: "Online", ru: "Онлайн", ko: "온라인" },
  offline: { en: "Offline", uz: "Offline", ru: "Оффлайн", ko: "오프라인" }
};

const formatRating = (value: number) => `${value.toFixed(1)}/5`;

export function EducationServiceSection() {
  const { isAuthenticated } = useAuthStore();
  const { t } = useI18n();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<EducationCategory | "all">("all");
  const [activeSubCategory, setActiveSubCategory] = useState("");
  const [mode, setMode] = useState<CourseMode | "all">("all");
  const [teachingLanguage, setTeachingLanguage] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const courses = useMemo(
    () =>
      listCourses({
        category: activeCategory === "all" ? undefined : activeCategory,
        subCategory: activeCategory === "all" ? undefined : activeSubCategory,
        mode,
        teachingLanguage: teachingLanguage || undefined,
        scheduleTime: scheduleTime || undefined
      }),
    [activeCategory, activeSubCategory, mode, teachingLanguage, scheduleTime]
  );

  const teachingLanguages = useMemo(() => {
    if (activeCategory === "all") return [];
    const items = listCourses({ category: activeCategory, subCategory: activeSubCategory });
    const unique = Array.from(new Set(items.map((item) => item.teachingLanguage)));
    return unique;
  }, [activeCategory, activeSubCategory]);

  const scheduleTimes = useMemo(() => {
    if (activeCategory === "all") return [];
    const items = listCourses({
      category: activeCategory,
      subCategory: activeSubCategory,
      mode
    });
    return Array.from(new Set(items.map((item) => item.scheduleTime)));
  }, [activeCategory, activeSubCategory, mode]);

  const returnTo = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const handleCategoryChange = (category: EducationCategory) => {
    setActiveCategory(category);
    const nextSub = getDefaultSubCategory(category);
    setActiveSubCategory(nextSub);
    setTeachingLanguage("");
  };

  const handleShowAll = () => {
    setActiveCategory("all");
    setActiveSubCategory("");
    setMode("all");
    setTeachingLanguage("");
    setScheduleTime("");
  };

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">
          {t({ en: "Education (courses)", uz: "Ta'lim (o'quv kurslari)", ru: "Обучение (курсы)", ko: "교육 (과정)" })}
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          {t({ en: "Languages, skills, and expertise", uz: "Til, kasb va maxsus bilimlar", ru: "Языки, профессии и навыки", ko: "언어, 직업, 전문 지식" })}
        </h2>
        <p className="mt-2 text-sm text-slate-300">
          {t({
            en: "Each agent provides full details: online/offline mode, schedule, duration, outcomes, and certificates.",
            uz: "Har bir agent o'z yo'nalishi bo'yicha to'liq ma'lumot beradi: darslar online/offline rejimi, jadval, davomiylik, natijalar va sertifikatlar.",
            ru: "Каждый агент дает полную информацию: онлайн/оффлайн режим, расписание, длительность, результаты и сертификаты.",
            ko: "각 에이전트는 온라인/오프라인, 일정, 기간, 결과, 인증서 등 상세 정보를 제공합니다."
          })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleShowAll}
          className={`rounded-full px-4 py-2 text-xs font-medium ${
            activeCategory === "all"
              ? "bg-gradient-to-r from-emerald-500/30 to-sky-500/30 text-emerald-100"
              : "bg-slate-900/70 text-slate-300"
          }`}
        >
          {t({ en: "All courses", uz: "Barcha kurslar", ru: "Все курсы", ko: "전체 과정" })}
        </button>
        {(Object.keys(educationCategories) as EducationCategory[]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => handleCategoryChange(key)}
            className={`rounded-full px-4 py-2 text-xs font-medium ${
              activeCategory === key
                ? "bg-gradient-to-r from-emerald-500/30 to-sky-500/30 text-emerald-100"
                : "bg-slate-900/70 text-slate-300"
            }`}
          >
            {educationCategories[key]}
          </button>
        ))}
      </div>

      {activeCategory !== "all" && (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
            {t({ en: "Within category", uz: "Kategoriya ichida", ru: "Внутри категории", ko: "카테고리 내" })}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {educationSubCategories[activeCategory].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveSubCategory(item)}
                className={`rounded-full px-3 py-1 ${
                  activeSubCategory === item
                    ? "bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/40"
                    : "bg-slate-900/60 text-slate-300"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}

      {activeCategory !== "all" && (
        <div className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 md:grid-cols-[1fr_1fr_1fr_auto]">
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {t({ en: "Lesson format", uz: "Dars formati", ru: "Формат урока", ko: "수업 형식" })}
            </label>
            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              {(Object.keys(modeLabels) as (CourseMode | "all")[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMode(item)}
                  className={`rounded-full px-3 py-1 ${
                    mode === item
                      ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40"
                      : "bg-slate-900/60 text-slate-300"
                  }`}
                >
                  {t(modeLabels[item])}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {t({ en: "Teaching language", uz: "Dars tili", ru: "Язык обучения", ko: "수업 언어" })}
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              value={teachingLanguage}
              onChange={(event) => setTeachingLanguage(event.target.value)}
            >
              <option value="">{t({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
              {teachingLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
              {t({ en: "Time", uz: "Vaqt", ru: "Время", ko: "시간" })}
            </label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
            >
              <option value="">{t({ en: "All", uz: "Barchasi", ru: "Все", ko: "전체" })}</option>
              {scheduleTimes.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => {
                setMode("all");
                setTeachingLanguage("");
                setScheduleTime("");
              }}
              className="rounded-full bg-slate-800 px-4 py-2 text-xs text-slate-200"
            >
              {t({ en: "Clear filters", uz: "Filtrni tozalash", ru: "Очистить фильтры", ko: "필터 초기화" })}
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 text-sm text-slate-300">
          {t({ en: "No courses found for this filter.", uz: "Bu filtr bo'yicha kurslar topilmadi.", ru: "По этому фильтру курсы не найдены.", ko: "이 필터에 해당하는 курс가 없습니다." })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course: EducationCourse) => (
            <article
              key={course.id}
              className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80"
            >
              <Link
                href={`/courses/${course.id}?from=${encodeURIComponent(returnTo)}`}
                aria-label={`${course.title} ${t({
                  en: "details",
                  uz: "tafsilotlari",
                  ru: "подробности",
                  ko: "상세 정보"
                })}`}
                className="absolute inset-0 z-10"
              />
              <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                <img src={course.images[0]} alt={course.title} className="h-full w-full object-cover" />
                <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] text-slate-100">
                  {course.mode.toUpperCase()}
                </span>
              </div>
              <div className="relative z-20 space-y-3 p-4 pointer-events-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                    <p className="text-xs text-slate-300">{course.agentName}</p>
                    <p className="text-[11px] text-slate-400">{course.agentHandle}</p>
                  </div>
                  <div className="text-right text-xs text-amber-200">
                    ⭐ {formatRating(course.rating)}
                    <span className="block text-[10px] text-slate-500">
                      {course.studentsCount} {t({ en: "students", uz: "o'quvchi", ru: "студентов", ko: "수강생" })}
                    </span>
                  </div>
                </div>

                <div className="grid gap-2 text-[11px] text-slate-300">
                  <p>
                    <span className="text-slate-400">
                      {t({ en: "Track:", uz: "Yo'nalish:", ru: "Направление:", ko: "분야:" })}
                    </span>{" "}
                    {course.subCategory}
                  </p>
                  {activeCategory === "all" && (
                    <p>
                      <span className="text-slate-400">
                        {t({ en: "Category:", uz: "Bo'lim:", ru: "Раздел:", ko: "카테고리:" })}
                      </span>{" "}
                      {educationCategories[course.category]}
                    </p>
                  )}
                  <p>
                    <span className="text-slate-400">
                      {t({ en: "Schedule:", uz: "Jadval:", ru: "Расписание:", ko: "일정:" })}
                    </span>{" "}
                    {course.scheduleDays} • {course.scheduleTime}
                  </p>
                  <p>
                    <span className="text-slate-400">
                      {t({ en: "Weekly:", uz: "Haftalik:", ru: "В неделю:", ko: "주간:" })}
                    </span>{" "}
                    {course.weeklyDays} {t({ en: "days", uz: "kun", ru: "дн.", ko: "일" })} • {course.weeklyHours}{" "}
                    {t({ en: "hours", uz: "soat", ru: "часов", ko: "시간" })}
                  </p>
                  <p>
                    <span className="text-slate-400">
                      {t({ en: "Duration:", uz: "Davomiylik:", ru: "Длительность:", ko: "기간:" })}
                    </span>{" "}
                    {course.durationWeeks} {t({ en: "weeks", uz: "hafta", ru: "нед.", ko: "주" })}
                  </p>
                  <p>
                    <span className="text-slate-400">
                      {t({ en: "Language:", uz: "Dars tili:", ru: "Язык:", ko: "언어:" })}
                    </span>{" "}
                    {course.teachingLanguage}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pointer-events-auto">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">{course.price}</span>
                  {isAuthenticated ? (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
                      {t({ en: "View details", uz: "Batafsil ko'rish", ru: "Подробнее", ko: "상세 보기" })}
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">
                      {t({ en: "View details", uz: "Batafsil ko'rish", ru: "Подробнее", ko: "상세 보기" })}
                    </span>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
