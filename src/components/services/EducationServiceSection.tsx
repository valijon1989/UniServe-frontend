"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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
import { VerticalFilterPanel } from "@/components/services/VerticalFilterPanel";
import { VerticalHubShell } from "@/components/services/VerticalHubShell";
import { VerticalServiceCard } from "@/components/services/VerticalServiceCard";

type TranslatedText = { en: string; uz: string; ru: string; ko: string };

const categoryLabels: Record<EducationCategory, TranslatedText> = {
  language: { en: "Languages", uz: "Til o'rganish", ru: "Языки", ko: "언어" },
  profession: { en: "Job skills", uz: "Kasb o'rganish", ru: "Профессии", ko: "직무 스킬" },
  special: { en: "Specialized topics", uz: "Maxsus bilimlar", ru: "Спецтемы", ko: "전문 주제" }
};

const subCategoryLabels: Record<string, TranslatedText> = {
  "Koreys tili": { en: "Korean language", uz: "Koreys tili", ru: "Корейский язык", ko: "한국어" },
  "Ingliz tili": { en: "English language", uz: "Ingliz tili", ru: "Английский язык", ko: "영어" },
  "O'zbek tili": { en: "Uzbek language", uz: "O'zbek tili", ru: "Узбекский язык", ko: "우즈베크어" },
  "Rus tili": { en: "Russian language", uz: "Rus tili", ru: "Русский язык", ko: "러시아어" },
  "Ispan tili": { en: "Spanish language", uz: "Ispan tili", ru: "Испанский язык", ko: "스페인어" },
  "Xitoy tili": { en: "Chinese language", uz: "Xitoy tili", ru: "Китайский язык", ko: "중국어" },
  "Arab tili": { en: "Arabic language", uz: "Arab tili", ru: "Арабский язык", ko: "아랍어" },
  "Avtomobil ta'mirlash": { en: "Auto repair", uz: "Avtomobil ta'mirlash", ru: "Авторемонт", ko: "자동차 정비" },
  Payvandlash: { en: "Welding", uz: "Payvandlash", ru: "Сварка", ko: "용접" },
  "Elektr energiya": { en: "Electrical work", uz: "Elektr energiya", ru: "Электрика", ko: "전기" },
  Oshpazlik: { en: "Culinary arts", uz: "Oshpazlik", ru: "Кулинария", ko: "요리" },
  "Go'zallik": { en: "Beauty", uz: "Go'zallik", ru: "Красота", ko: "뷰티" },
  Hamshiralik: { en: "Nursing", uz: "Hamshiralik", ru: "Сестринское дело", ko: "간호" },
  Santexnika: { en: "Plumbing", uz: "Santexnika", ru: "Сантехника", ko: "배관" },
  "IT va dasturlash": { en: "IT and programming", uz: "IT va dasturlash", ru: "IT и программирование", ko: "IT 및 프로그래밍" },
  Informatika: { en: "Computer science", uz: "Informatika", ru: "Информатика", ko: "컴퓨터 기초" },
  Traderlik: { en: "Trading", uz: "Traderlik", ru: "Трейдинг", ko: "트레이딩" },
  "Data analitika": { en: "Data analytics", uz: "Data analitika", ru: "Аналитика данных", ko: "데이터 분석" }
};

const teachingLanguageLabels: Record<string, TranslatedText> = {
  "O'zbek": { en: "Uzbek", uz: "O'zbek", ru: "Узбекский", ko: "우즈베크어" },
  English: { en: "English", uz: "Ingliz", ru: "Английский", ko: "영어" },
  Rus: { en: "Russian", uz: "Rus", ru: "Русский", ko: "러시아어" }
};

const scheduleDayLabels: Record<string, TranslatedText> = {
  "Du/Ch/Ju": { en: "Mon/Wed/Fri", uz: "Du/Ch/Ju", ru: "Пн/Ср/Пт", ko: "월/수/금" },
  "Se/Ch/Ju/Ya": { en: "Tue/Thu/Fri/Sun", uz: "Se/Ch/Ju/Ya", ru: "Вт/Чт/Пт/Вс", ko: "화/목/금/일" },
  "Du/Pu": { en: "Mon/Thu", uz: "Du/Pu", ru: "Пн/Чт", ko: "월/목" },
  "Sh/Ya": { en: "Sat/Sun", uz: "Sh/Ya", ru: "Сб/Вс", ko: "토/일" }
};

const modeLabels: Record<CourseMode | "all", TranslatedText> = {
  all: { en: "All", uz: "Barchasi", ru: "Все", ko: "전체" },
  online: { en: "Online", uz: "Online", ru: "Онлайн", ko: "온라인" },
  offline: { en: "Offline", uz: "Offline", ru: "Оффлайн", ko: "오프라인" }
};

const formatRating = (value: number) => `${value.toFixed(1)}/5`;

export function EducationServiceSection() {
  const router = useRouter();
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
    return Array.from(new Set(items.map((item) => item.teachingLanguage)));
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

  const translateCategory = (category: EducationCategory) => t(categoryLabels[category]);

  const translateSubCategory = (value: string) =>
    t(subCategoryLabels[value] || { en: value, uz: value, ru: value, ko: value });

  const translateTeachingLanguage = (value: string) =>
    value
      .split("/")
      .map((item) => {
        const trimmed = item.trim();
        return t(teachingLanguageLabels[trimmed] || { en: trimmed, uz: trimmed, ru: trimmed, ko: trimmed });
      })
      .join(" / ");

  const translateScheduleDays = (value: string) =>
    t(scheduleDayLabels[value] || { en: value, uz: value, ru: value, ko: value });

  const formatCourseTitle = (course: EducationCourse) =>
    t({
      en: `${translateSubCategory(course.subCategory)} ${course.mode === "online" ? "online course" : "offline course"}`,
      uz: course.title,
      ru: `${translateSubCategory(course.subCategory)} ${course.mode === "online" ? "онлайн курс" : "офлайн курс"}`,
      ko: `${translateSubCategory(course.subCategory)} ${course.mode === "online" ? "온라인 코스" : "오프라인 코스"}`
    });

  const formatCourseDescription = (course: EducationCourse) =>
    t({
      en: `Structured ${course.mode === "online" ? "online" : "offline"} learning track for ${translateSubCategory(course.subCategory).toLowerCase()}.`,
      uz: course.description,
      ru: `Структурированный ${course.mode === "online" ? "онлайн" : "офлайн"} курс по направлению "${translateSubCategory(course.subCategory)}".`,
      ko: `${translateSubCategory(course.subCategory)} 분야를 위한 구조화된 ${course.mode === "online" ? "온라인" : "오프라인"} 코스입니다.`
    });

  const formatCoursePrice = (course: EducationCourse) =>
    course.mode === "online"
      ? t({
          en: "850,000 UZS / month",
          uz: "oyiga 850 000 so'm",
          ru: "850 000 сум / месяц",
          ko: "월 850,000숨"
        })
      : t({
          en: "2,200,000 UZS / course",
          uz: "kurs: 2 200 000 so'm",
          ru: "2 200 000 сум / курс",
          ko: "코스당 2,200,000숨"
        });

  const handleCategoryChange = (category: EducationCategory) => {
    setActiveCategory(category);
    setActiveSubCategory(getDefaultSubCategory(category));
    setTeachingLanguage("");
  };

  const handleShowAll = () => {
    setActiveCategory("all");
    setActiveSubCategory("");
    setMode("all");
    setTeachingLanguage("");
    setScheduleTime("");
  };

  const handleOpenCourse = (courseId: string) => {
    router.push(`/courses/${courseId}?from=${encodeURIComponent(returnTo)}`);
  };

  return (
    <VerticalHubShell
      eyebrow={t({ en: "Education (courses)", uz: "Ta'lim (o'quv kurslari)", ru: "Обучение (курсы)", ko: "교육 (과정)" })}
      title={t({ en: "Languages, skills, and expertise", uz: "Til, kasb va maxsus bilimlar", ru: "Языки, профессии и навыки", ko: "언어, 직업, 전문 지식" })}
      subtitle={t({
        en: "Course-style catalog with schedules, durations, outcomes, and trust signals before the learner commits.",
        uz: "O'quvchi qaror berishidan oldin jadval, davomiylik, natijalar va trust signallari ko'rsatiladigan course-style katalog.",
        ru: "Каталог в стиле лендинга курса: расписание, длительность, результаты и сигналы доверия до покупки.",
        ko: "수강 전 일정, 기간, 결과, 신뢰 신호를 확인할 수 있는 코스형 카탈로그입니다."
      })}
      bannerTitle={t({ en: "Structured learning flow", uz: "Tartibli o'quv oqimi", ru: "Структурированный учебный поток", ko: "구조화된 학습 흐름" })}
      bannerDescription={t({
        en: "Every course card shows the mode, teacher, schedule, duration, outcomes, and certificates up front.",
        uz: "Har bir kurs kartasi format, o'qituvchi, jadval, davomiylik, natijalar va sertifikatlarni oldindan ko'rsatadi.",
        ru: "Каждая карточка курса заранее показывает формат, преподавателя, расписание, длительность, результаты и сертификаты.",
        ko: "각 코스 카드는 형식, 강사, 일정, 기간, 결과, 인증서를 미리 보여줍니다."
      })}
      highlights={[
        {
          label: t({ en: "Track", uz: "Yo'nalish", ru: "Направление", ko: "트랙" }),
          value:
            activeCategory === "all"
              ? t({ en: "All learning tracks", uz: "Barcha o'quv yo'nalishlari", ru: "Все треки", ko: "전체 학습 트랙" })
              : translateCategory(activeCategory),
          tone: "emerald"
        },
        {
          label: t({ en: "Courses", uz: "Kurslar", ru: "Курсы", ko: "코스" }),
          value: `${courses.length}`,
          tone: "sky"
        },
        {
          label: t({ en: "Formats", uz: "Formatlar", ru: "Форматы", ko: "형식" }),
          value:
            activeCategory === "all"
              ? t({ en: "Online + offline", uz: "Online + offline", ru: "Онлайн + офлайн", ko: "온라인 + 오프라인" })
              : mode === "all"
                ? t({ en: "Flexible", uz: "Moslashuvchan", ru: "Гибко", ko: "유연함" })
                : t(modeLabels[mode]),
          tone: "amber"
        },
        {
          label: t({ en: "Certificates", uz: "Sertifikatlar", ru: "Сертификаты", ko: "인증서" }),
          value: t({ en: "Visible on card", uz: "Kartada ko'rinadi", ru: "Видны на карточке", ko: "카드에서 확인 가능" }),
          tone: "slate"
        }
      ]}
      filters={
        <VerticalFilterPanel
          title={t({ en: "Find the right course", uz: "Mos kursni toping", ru: "Найдите подходящий курс", ko: "맞는 코스를 찾으세요" })}
          description={t({
            en: "Choose a track first, then narrow by learning format, language, and schedule.",
            uz: "Avval yo'nalishni tanlang, keyin format, til va jadval bo'yicha aniqlashtiring.",
            ru: "Сначала выберите направление, затем уточните формат, язык и расписание.",
            ko: "먼저 분야를 고른 뒤 형식, 언어, 일정을 좁히세요."
          })}
          footer={
            activeCategory !== "all" ? (
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
            ) : null
          }
        >
          <div className="space-y-4">
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
                  {translateCategory(key)}
                </button>
              ))}
            </div>

            {activeCategory !== "all" ? (
              <>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">
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
                        {translateSubCategory(item)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-[1fr_1fr_1fr]">
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
                          {translateTeachingLanguage(lang)}
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
                </div>
              </>
            ) : null}
          </div>
        </VerticalFilterPanel>
      }
      resultsTitle={t({ en: "Course catalog", uz: "Kurs katalogi", ru: "Каталог курсов", ko: "코스 카탈로그" })}
      resultsMeta={
        courses.length
          ? t({
              en: `${courses.length} courses available for the selected filters.`,
              uz: `Tanlangan filtrlar bo'yicha ${courses.length} ta kurs mavjud.`,
              ru: `По выбранным фильтрам доступно ${courses.length} курсов.`,
              ko: `선택한 필터에 대해 ${courses.length}개의 코스가 있습니다.`
            })
          : t({ en: "No matching courses yet.", uz: "Mos kurs topilmadi.", ru: "Подходящих курсов пока нет.", ko: "일치하는 코스가 없습니다." })
      }
    >
      {courses.length === 0 ? (
        <div className="rounded-[1.6rem] border border-slate-800/80 bg-slate-950/72 p-6 text-sm text-slate-300">
          {t({ en: "No courses found for this filter.", uz: "Bu filtr bo'yicha kurslar topilmadi.", ru: "По этому фильтру курсы не найдены.", ko: "이 필터에 해당하는 курс가 없습니다." })}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {courses.map((course: EducationCourse) => (
            <VerticalServiceCard
              key={course.id}
              title={formatCourseTitle(course)}
              description={formatCourseDescription(course)}
              priceLabel={formatCoursePrice(course)}
              unitLabel={`${course.durationWeeks} ${t({ en: "weeks", uz: "hafta", ru: "нед.", ko: "주" })}`}
              agentName={course.agentName}
              agentHandle={course.agentHandle.replace(/^@/, "")}
              avatarFallback={course.agentName}
              identityMeta={[t(modeLabels[course.mode]), `${translateScheduleDays(course.scheduleDays)} • ${course.scheduleTime}`]}
              descriptor={translateSubCategory(course.subCategory)}
              topChips={[
                { label: `⭐ ${formatRating(course.rating)}`, tone: "amber" },
                {
                  label: `${course.studentsCount} ${t({ en: "students", uz: "o'quvchi", ru: "студентов", ko: "수강생" })}`,
                  tone: "sky"
                }
              ]}
              metaChips={[
                {
                  label: `${course.weeklyDays} ${t({ en: "days", uz: "kun", ru: "дн.", ko: "일" })} / ${course.weeklyHours} ${t({ en: "hours", uz: "soat", ru: "часов", ko: "시간" })}`,
                  tone: "slate"
                },
                {
                  label: `${t({ en: "Language", uz: "Til", ru: "Язык", ko: "언어" })}: ${translateTeachingLanguage(course.teachingLanguage)}`,
                  tone: "slate"
                },
                {
                  label:
                    activeCategory === "all"
                      ? `${t({ en: "Category", uz: "Bo'lim", ru: "Категория", ko: "카테고리" })}: ${translateCategory(course.category)}`
                      : `${t({ en: "Track", uz: "Yo'nalish", ru: "Направление", ko: "트랙" })}: ${translateSubCategory(course.subCategory)}`,
                  tone: "slate"
                }
              ]}
              trustChips={course.certificates.slice(0, 3).map((item) => ({
                label: item,
                tone: "emerald"
              }))}
              previewImages={course.images.slice(0, 3).map((src) => ({ src, alt: formatCourseTitle(course) }))}
              stats={[
                {
                  label: isAuthenticated
                    ? t({ en: "View details", uz: "Batafsil ko'rish", ru: "Подробнее", ko: "상세 보기" })
                    : t({ en: "Login for contact", uz: "Bog'lanish uchun login", ru: "Войдите для связи", ko: "문의하려면 로그인" }),
                  tone: isAuthenticated ? "emerald" : "slate"
                }
              ]}
              actions={[
                {
                  label: t({ en: "Open course", uz: "Kursni ochish", ru: "Открыть курс", ko: "코스 열기" }),
                  tone: "primary",
                  href: `/courses/${course.id}?from=${encodeURIComponent(returnTo)}`
                }
              ]}
              onOpen={() => handleOpenCourse(course.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleOpenCourse(course.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </VerticalHubShell>
  );
}
