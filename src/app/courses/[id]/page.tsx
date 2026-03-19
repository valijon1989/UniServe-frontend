"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { getCourseById, listCourses } from "@/data/coursesStore";
import { PriceValueCard } from "@/components/service-detail/PriceValueCard";
import { ProviderMiniCard } from "@/components/service-detail/ProviderMiniCard";
import { useAuthStore } from "@/store/auth";
import { CourseOutlineBlock } from "@/components/service-detail/CourseOutlineBlock";
import { SessionPlanBlock } from "@/components/service-detail/SessionPlanBlock";
import { ServiceReviews } from "@/components/service-detail/ServiceReviews";
import { TrustSidebar } from "@/components/service-detail/TrustSidebar";
import { VerticalDetailShell } from "@/components/service-detail/VerticalDetailShell";
import { VerticalProcessBlock } from "@/components/service-detail/VerticalProcessBlock";
import { RelatedServicesSection } from "@/components/service-detail/system/RelatedServicesSection";
import { ServiceHeroGallery } from "@/components/service-detail/system/ServiceHeroGallery";

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

  const modules = [
    `${course.subCategory} bo'yicha asosiy tushunchalar`,
    `${course.teachingLanguage} tilida amaliy tushuntirishlar`,
    `${course.scheduleDays} kuni live/session mashg'ulotlari`,
    "Uy vazifalari va individual feedback",
    "Yakuniy natija va certificate prep"
  ];

  const sessionPlan = [
    `${course.weeklyDays} kun dars, haftasiga ${course.weeklyHours} soat`,
    `${course.scheduleDays} • ${course.scheduleTime}`,
    course.location ? `${course.location}${course.room ? ` • ${course.room}` : ""}` : "Online support + material access",
    `${course.durationWeeks} hafta davom etadigan structured flow`
  ];

  const processSteps = [
    {
      title: "Kursni tanlash",
      description: "Schedule, format va teacher profiling asosida mos oqim tanlanadi."
    },
    {
      title: "Ro'yxatdan o'tish",
      description: "Bog'lanish yoki chat orqali seat band qilinadi va boshlanish tafsilotlari aniqlashtiriladi."
    },
    {
      title: "O'qish jarayoni",
      description: "Darslar, amaliy mashqlar va feedback bloklari ketma-ket yuradi."
    },
    {
      title: "Natija va certificate",
      description: "Kurs yakunida outcome review va mavjud bo'lsa certificate topshiriladi."
    }
  ];

  const relatedCourses = listCourses({ category: course.category })
    .filter((item) => item.id !== course.id)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      href: `/courses/${item.id}${returnTo ? `?from=${encodeURIComponent(returnTo)}` : ""}`,
      image: item.images[0],
      title: item.title,
      subtitle: `${item.subCategory} • ${item.mode.toUpperCase()}`,
      priceLabel: item.price,
      rating: item.rating,
      meta: `${item.scheduleDays} • ${item.scheduleTime}`,
      tag: item.teachingLanguage
    }));

  const courseReviews = [
    {
      id: `${course.id}-review-1`,
      author: "Dilnoza K.",
      role: "Bitiruvchi",
      rating: course.rating,
      text: `${course.agentName} kursi schedule va feedback jihatidan juda aniq bo'ldi. ${course.outcomes[0]} bo'yicha sezilarli o'sish oldim.`,
      dateLabel: "2 hafta oldin"
    },
    {
      id: `${course.id}-review-2`,
      author: "Jahongir U.",
      role: "Yangi o'quvchi",
      rating: Math.max(4.2, course.rating - 0.2),
      text: `Curriculum va live sessionlar muvozanatli. ${course.scheduleDays} oqimi ishlash bilan birga o'qishga qulay tushdi.`,
      dateLabel: "1 oy oldin"
    },
    {
      id: `${course.id}-review-3`,
      author: "Madina R.",
      role: "Parents / sponsor",
      rating: Math.max(4.1, course.rating - 0.1),
      text: `Teacher communication aniq, certificate va final outcome kutganimizdek tushuntirildi. Enrollment jarayoni ham sodda.`,
      dateLabel: "5 kun oldin"
    }
  ];

  const courseAudience =
    course.category === "language"
      ? "Til o'rganishni boshlayotgan yoki sertifikat maqsadi bo'lganlar"
      : course.category === "profession"
        ? "Kasbiy ko'nikma va amaliy portfolio qurmoqchi bo'lganlar"
        : "Structured curriculum va amaliy natija qidirayotgan o'quvchilar";

  return (
    <VerticalDetailShell
      eyebrow="Education / Course detail"
      title={course.title}
      subtitle={`${course.agentName} tomonidan olib boriladigan premium course detail: schedule, curriculum, outcomes, certificate va enrollment signallari bir joyda.`}
      tone="learning"
      meta={[
        { label: course.mode.toUpperCase(), tone: "emerald" },
        { label: `${course.scheduleDays} • ${course.scheduleTime}`, tone: "sky" },
        { label: `${course.studentsCount} o'quvchi`, tone: "amber" },
        { label: `⭐ ${course.rating.toFixed(1)}/5`, tone: "slate" }
      ]}
      hero={
        <ServiceHeroGallery
          items={course.images.map((image, index) => ({
            src: image,
            alt: `${course.title} ${index + 1}`
          }))}
          fallbackSrc={course.images[0]}
          stats={[
            { label: "Rating", value: `${course.rating.toFixed(1)} / 5` },
            { label: "Students", value: `${course.studentsCount}` },
            { label: "Duration", value: `${course.durationWeeks} hafta` }
          ]}
        />
      }
      heroAside={
        <>
          <ProviderMiniCard
            name={course.agentName}
            username={course.agentHandle}
            specialty={`${course.subCategory} • ${course.teachingLanguage}`}
            badge="Teacher verified"
            trustLine={`${course.studentsCount} o'quvchi • ${course.scheduleDays}`}
            highlights={[course.mode.toUpperCase(), `${course.durationWeeks} hafta`, course.certificates[0]]}
          />
          <PriceValueCard
            eyebrow="Enrollment value"
            price={course.price}
            period="/kurs"
            description="Schedule, curriculum va certificate expectation upfront ko'rsatilgan."
            bullets={[
              `${course.weeklyDays} kun / ${course.weeklyHours} soat`,
              `${course.scheduleDays} • ${course.scheduleTime}`,
              `Certificate: ${course.certificates[0]}`
            ]}
            accent="amber"
          />
        </>
      }
      left={
        <>
          <section className="rounded-[1.9rem] border border-white/10 bg-white/5 p-6 shadow-xl shadow-slate-950/15">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sky-200/80">Course summary</p>
                <h2 className="mt-2 text-xl font-bold tracking-tight text-white">{course.subCategory}</h2>
              </div>
              <button
                type="button"
                onClick={handleBack}
                className="rounded-full border border-white/10 bg-slate-950/45 px-4 py-2 text-xs text-slate-200"
              >
                Orqaga
              </button>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-300">{course.description}</p>
            <p className="mt-3 text-sm leading-7 text-slate-400">
              Kimlar uchun: {courseAudience}. Enrollmentdan oldin schedule, teacher va certificate expectation shu sahifada ochiq ko'rsatiladi.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Format</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{course.mode.toUpperCase()}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Schedule</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{course.scheduleDays}</p>
                <p className="mt-1 text-xs text-slate-400">{course.scheduleTime}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Duration</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{course.durationWeeks} hafta</p>
                <p className="mt-1 text-xs text-slate-400">{course.weeklyDays} kun / {course.weeklyHours} soat</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Tuition</p>
                <p className="mt-2 text-sm font-semibold text-emerald-200">{course.price}</p>
                <p className="mt-1 text-xs text-slate-400">{course.teachingLanguage}</p>
              </div>
              <div className="rounded-[1.35rem] border border-white/10 bg-slate-950/50 p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Certificate</p>
                <p className="mt-2 text-sm font-semibold text-slate-100">{course.certificates[0]}</p>
                <p className="mt-1 text-xs text-slate-400">{course.studentsCount} o'quvchi ishonchi</p>
              </div>
            </div>
          </section>

          <CourseOutlineBlock
            title="Curriculum, outcomes, and certificates"
            modules={modules}
            outcomes={course.outcomes}
            certificates={course.certificates}
          />

          <SessionPlanBlock
            title="Session plan"
            items={sessionPlan}
            note="Kurs sahifasi oddiy service detail emas: bu o'quvchi uchun qaror qabul qilishni tezlashtiradigan curriculum-first landing page."
          />

          <VerticalProcessBlock
            title="How enrollment works"
            description="Enrollment, study flow, va final delivery bosqichlari aniq ko'rinadi."
            steps={processSteps}
          />

          <ServiceReviews
            rating={course.rating}
            reviewCount={course.studentsCount}
            reviews={courseReviews}
          />

          <RelatedServicesSection title="O'xshash kurslar" items={relatedCourses} />
        </>
      }
      right={
        <>
          <TrustSidebar
            title="Teacher trust summary"
            description="Teacher credibility va course commitment signallari shu blokda ko'rinadi."
            items={[
              { label: "Teacher", value: `${course.agentName} (${course.agentHandle})` },
              { label: "Learners", value: `${course.studentsCount} o'quvchi` },
              { label: "Rating", value: `${course.rating.toFixed(1)}/5` },
              { label: "Certificates", value: course.certificates.join(" • ") }
            ]}
          />

          <section className="rounded-[1.7rem] border border-slate-800 bg-slate-950/72 p-5 shadow-lg shadow-black/20">
            <p className="text-[11px] uppercase tracking-[0.24em] text-slate-500">Enrollment</p>
            <h2 className="mt-2 text-lg font-semibold text-slate-100">Join this course</h2>
            <p className="mt-2 text-sm leading-7 text-slate-400">
              Teacher bilan bog'lanib joy band qiling, schedule, seat availability va boshlanish tafsilotlarini aniqlashtiring.
            </p>
            <div className="mt-5 space-y-3">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className="w-full rounded-full bg-emerald-400/90 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                  >
                    Kursga yozilish
                  </button>
                  {course.chatUrl ? (
                    <Link
                      href={`${course.chatUrl}${course.chatUrl.includes("?") ? "&" : "?"}from=${encodeURIComponent(
                        returnTo || "/services?group=spiritual&category=education"
                      )}`}
                      className="block w-full rounded-full border border-slate-700 px-4 py-3 text-center text-sm font-semibold text-slate-200 transition hover:border-slate-500"
                    >
                      O'qituvchiga yozish
                    </Link>
                  ) : null}
                </>
              ) : (
                <Link
                  href="/login"
                  className="block w-full rounded-full bg-slate-800 px-4 py-3 text-center text-sm font-semibold text-slate-200"
                >
                  Bog'lanish uchun kirish
                </Link>
              )}
            </div>
            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              {course.contactPhone ? (
                <p>
                  Telefon:{" "}
                  <a href={`tel:${course.contactPhone}`} className="text-emerald-200 underline">
                    {course.contactPhone}
                  </a>
                </p>
              ) : null}
              {course.contactTelegram ? (
                <p>
                  Telegram:{" "}
                  <a
                    href={`https://t.me/${course.contactTelegram.replace("@", "")}`}
                    className="text-emerald-200 underline"
                  >
                    {course.contactTelegram}
                  </a>
                </p>
              ) : null}
              {course.location ? (
                <p>
                  Joylashuv: {course.location}
                  {course.room ? ` • ${course.room}` : ""}
                </p>
              ) : null}
            </div>
          </section>
        </>
      }
    />
  );
}
