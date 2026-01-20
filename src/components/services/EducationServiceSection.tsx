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
import { useAuthStore } from "@/store/auth";

const modeLabels: Record<CourseMode | "all", string> = {
  all: "Barchasi",
  online: "Online",
  offline: "Offline"
};

const formatRating = (value: number) => `${value.toFixed(1)}/5`;

export function EducationServiceSection() {
  const { isAuthenticated } = useAuthStore();
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
        <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Ta'lim (o'quv kurslari)</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Til, kasb va maxsus bilimlar</h2>
        <p className="mt-2 text-sm text-slate-300">
          Har bir agent o'z yo'nalishi bo'yicha to'liq ma'lumot beradi: darslar online/offline
          rejimi, jadval, davomiylik, natijalar va sertifikatlar.
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
          Barcha kurslar
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
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Kategoriya ichida</p>
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
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Dars formati</label>
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
                  {modeLabels[item]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Dars tili</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              value={teachingLanguage}
              onChange={(event) => setTeachingLanguage(event.target.value)}
            >
              <option value="">Barchasi</option>
              {teachingLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Vaqt</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              value={scheduleTime}
              onChange={(event) => setScheduleTime(event.target.value)}
            >
              <option value="">Barchasi</option>
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
              Filtrni tozalash
            </button>
          </div>
        </div>
      )}

      {courses.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5 text-sm text-slate-300">
          Bu filtr bo'yicha kurslar topilmadi.
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
                aria-label={`${course.title} tafsilotlari`}
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
                    <span className="block text-[10px] text-slate-500">{course.studentsCount} o'quvchi</span>
                  </div>
                </div>

                <div className="grid gap-2 text-[11px] text-slate-300">
                  <p>
                    <span className="text-slate-400">Yo'nalish:</span> {course.subCategory}
                  </p>
                  {activeCategory === "all" && (
                    <p>
                      <span className="text-slate-400">Bo'lim:</span> {educationCategories[course.category]}
                    </p>
                  )}
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
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 pointer-events-auto">
                  <span className="rounded-full bg-slate-900/70 px-3 py-1">{course.price}</span>
                  {isAuthenticated ? (
                    <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-emerald-100">
                      Batafsil ko'rish
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">
                      Batafsil ko'rish
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
