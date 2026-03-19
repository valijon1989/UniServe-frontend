"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import dayjs from "@/lib/dayjs";
import Link from "next/link";
import type { JobListing, LocalizedText } from "@/data/jobListings";
import { initialJobListings } from "@/data/jobListings";
import { useAuthStore } from "@/store/auth";
import { useI18n } from "@/context/i18n";
import { ServiceActions } from "@/components/service-detail/ServiceActions";
import { ServiceAgentCard } from "@/components/service-detail/ServiceAgentCard";
import { ServiceGallery } from "@/components/service-detail/ServiceGallery";
import { ServiceHeader } from "@/components/service-detail/ServiceHeader";
import { ServiceRelated } from "@/components/service-detail/ServiceRelated";
import { ServiceReviews } from "@/components/service-detail/ServiceReviews";
import type { DetailContactMethod, DetailReview, DetailTrustIndicator, RelatedDetailItem } from "@/components/service-detail/types";

const JOB_SAVE_KEY = "uniserve_saved_jobs_v1";
const EMPLOYMENT_IMAGES = Array.from(
  { length: 12 },
  (_, index) => `/services/employment/${String(index + 1).padStart(2, "0")}.jpg`
);

const seedFromText = (value: string) => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33 + value.charCodeAt(index)) % 2147483647;
  }
  return hash;
};

const readSavedJobs = () => {
  if (typeof window === "undefined") return new Set<string>();
  try {
    const raw = window.localStorage.getItem(JOB_SAVE_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw) as string[];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set<string>();
  }
};

const writeSavedJobs = (saved: Set<string>) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(JOB_SAVE_KEY, JSON.stringify(Array.from(saved)));
};

const buildJobGallery = (job: JobListing, title: string) => {
  const seed = seedFromText(job.id);
  const seen = new Set<string>([job.image]);
  const sources = [{ src: job.image, alt: title }];

  for (let index = 0; sources.length < 4 && index < EMPLOYMENT_IMAGES.length; index += 1) {
    const candidate = EMPLOYMENT_IMAGES[(seed + index) % EMPLOYMENT_IMAGES.length];
    if (seen.has(candidate)) continue;
    seen.add(candidate);
    sources.push({
      src: candidate,
      alt: `${title} ${index + 2}`
    });
  }

  return sources;
};

const buildJobReviews = (job: JobListing, title: string, company: string, rating: number): DetailReview[] => {
  const baseRating = Math.max(4, Math.min(5, rating));
  return [
    {
      id: `${job.id}-review-1`,
      author: "Azizbek T.",
      role: "Nomzod",
      rating: Number(baseRating.toFixed(1)),
      text: `${company} bo'yicha javob tez bo'ldi. Vakansiya shartlari ${title.toLowerCase()} e'loni bilan mos tushdi va kontakt jarayoni aniq yuritildi.`,
      dateLabel: "2 hafta oldin"
    },
    {
      id: `${job.id}-review-2`,
      author: "Soojin K.",
      role: "HR coordinator",
      rating: Number(Math.max(4, baseRating - 0.1).toFixed(1)),
      text: "Profilni yuborish, chat orqali aniqlik kiritish va keyingi bosqichlar tushunarli ko'rinishda berilgan. UniServe orqali xavfsiz aloqa qilish qulay.",
      dateLabel: "1 oy oldin"
    },
    {
      id: `${job.id}-review-3`,
      author: "Dilshoda M.",
      role: "Nomzod",
      rating: Number(Math.max(4, baseRating - 0.2).toFixed(1)),
      text: "Ish vaqti, yashash sharoiti va ovqat masalalari oldindan yozib qo'yilgani sababli qaror qabul qilish oson bo'ldi.",
      dateLabel: "6 hafta oldin"
    }
  ];
};

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated, hydrateFromStorage } = useAuthStore();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const { language } = useI18n();

  const resolveLocalizedText = (value?: string | LocalizedText) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value[language] ?? value.en ?? value.uz ?? value.ru ?? value.ko ?? "";
  };

  const returnTo = useMemo(() => searchParams.get("from"), [searchParams]);
  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const redirectToLogin = () => {
    router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
  };

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    router.back();
  };

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/jobs/${params?.id}`);
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
    void load();
  }, [params?.id]);

  useEffect(() => {
    if (!job) return;
    setSaved(readSavedJobs().has(job.id));
  }, [job]);

  const title = resolveLocalizedText(job?.title);
  const company = resolveLocalizedText(job?.company);
  const location = resolveLocalizedText(job?.location);
  const schedule = resolveLocalizedText(job?.schedule);
  const salary = resolveLocalizedText(job?.salary);
  const jobType = resolveLocalizedText(job?.jobType);
  const housing = resolveLocalizedText(job?.housing);
  const meals = resolveLocalizedText(job?.meals);

  const jobSeed = useMemo(() => (job ? seedFromText(job.id) : 0), [job]);
  const rating = useMemo(() => Number((4.5 + (jobSeed % 4) * 0.12).toFixed(1)), [jobSeed]);
  const reviewCount = useMemo(() => (job ? 18 + (jobSeed % 17) + job.requirements.length * 3 + job.visaTypes.length * 2 : 0), [job, jobSeed]);
  const completedJobs = useMemo(() => (job ? (job.kind === "temporary" ? 80 + (jobSeed % 70) : 220 + (jobSeed % 140)) : 0), [job, jobSeed]);
  const responseTime = useMemo(() => (job?.kind === "temporary" ? "15 daqiqa" : "1 soat"), [job?.kind]);
  const pricePeriod = useMemo(() => (job?.kind === "temporary" ? "Qisqa smena / kunlik to'lov" : "Oylik yoki uzoq muddatli shartnoma"), [job?.kind]);

  const galleryItems = useMemo(() => (job ? buildJobGallery(job, title) : []), [job, title]);
  const reviews = useMemo(() => (job ? buildJobReviews(job, title, company, rating) : []), [company, job, rating, title]);

  const relatedJobs = useMemo<RelatedDetailItem[]>(() => {
    if (!job) return [];
    return initialJobListings
      .filter((item) => item.id !== job.id && (item.kind === job.kind || resolveLocalizedText(item.location) === location))
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        href: `/jobs/${item.id}?from=${encodeURIComponent(currentPath)}`,
        image: item.image,
        title: resolveLocalizedText(item.title),
        subtitle: resolveLocalizedText(item.company),
        priceLabel: resolveLocalizedText(item.salary),
        rating: Number((4.4 + (seedFromText(item.id) % 5) * 0.1).toFixed(1)),
        meta: `${resolveLocalizedText(item.location)} · ${dayjs(item.postedAt).fromNow()}`,
        tag: item.kind === "temporary" ? "Temporary" : "Permanent"
      }));
  }, [currentPath, job, location]);

  const toggleSaved = () => {
    if (!job) return;
    const nextSaved = !saved;
    const items = readSavedJobs();
    if (nextSaved) {
      items.add(job.id);
    } else {
      items.delete(job.id);
    }
    writeSavedJobs(items);
    setSaved(nextSaved);
    setNotice(nextSaved ? "E'lon saqlandi." : "Saqlangan e'lonlardan olib tashlandi.");
  };

  const handleOrder = () => {
    if (!isAuthenticated) {
      setNotice("Buyurtma berish uchun oldin login qiling.");
      redirectToLogin();
      return;
    }
    setShowContacts(true);
    setNotice("Kontaktlar ochildi. Endi telefon, Telegram yoki ichki chat orqali bog'lanishingiz mumkin.");
  };

  const handleWriteAgent = () => {
    if (!job?.chatUrl) {
      setNotice("Ichki chat havolasi mavjud emas.");
      return;
    }
    if (!isAuthenticated) {
      setNotice("Agentga yozish uchun oldin login qiling.");
      redirectToLogin();
      return;
    }
    router.push(`${job.chatUrl}${job.chatUrl.includes("?") ? "&" : "?"}from=${encodeURIComponent(currentPath)}`);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-500">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-[2rem] border border-rose-200 bg-white/90 p-8 shadow-sm">
          <p className="text-sm font-semibold text-rose-600">Ish e'loni topilmadi.</p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-4 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
          >
            Orqaga qaytish
          </button>
        </div>
      </div>
    );
  }

  const recruiterName = `${company} HR`;
  const recruiterHandle = job.contactTelegram?.replace("@", "") || company.toLowerCase().replace(/[^a-z0-9]+/g, "_");
  const contactMethods: DetailContactMethod[] = [
    {
      key: "phone",
      label: "Telefon",
      value: showContacts && job.contactPhone ? job.contactPhone : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi",
      href: showContacts && job.contactPhone ? `tel:${job.contactPhone}` : undefined,
      locked: !showContacts || !job.contactPhone
    },
    {
      key: "telegram",
      label: "Telegram",
      value: showContacts && job.contactTelegram ? job.contactTelegram : isAuthenticated ? "Buyurtmadan keyin" : "Login talab qilinadi",
      href:
        showContacts && job.contactTelegram
          ? `https://t.me/${job.contactTelegram.replace("@", "")}`
          : undefined,
      locked: !showContacts || !job.contactTelegram
    },
    {
      key: "chat",
      label: "In-platform chat",
      value: isAuthenticated ? "Agentga yozish" : "Login orqali ochiladi",
      href:
        isAuthenticated && job.chatUrl
          ? `${job.chatUrl}${job.chatUrl.includes("?") ? "&" : "?"}from=${encodeURIComponent(currentPath)}`
          : undefined,
      locked: !isAuthenticated || !job.chatUrl
    }
  ];

  const trustIndicators: DetailTrustIndicator[] = [
    { label: "Verified agent", value: "Tekshirilgan", tone: "emerald" },
    { label: "UniServe secure transaction", value: "Protected", tone: "sky" },
    { label: "Response time", value: responseTime, tone: "amber" }
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50"
        >
          Orqaga
        </button>
        {notice ? (
          <p className="rounded-full bg-amber-50 px-4 py-2 text-xs font-medium text-amber-800">
            {notice}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(320px,3fr)]">
        <div className="space-y-6">
          <ServiceGallery items={galleryItems} fallbackSrc={job.image} />

          <ServiceHeader
            eyebrow={job.kind === "temporary" ? "Temporary Job" : "Permanent Job"}
            title={title}
            subtitle={company}
            rating={rating}
            reviewCount={reviewCount}
            location={location}
            postedDate={dayjs(job.postedAt).format("MMM D, YYYY")}
          />

          <section className="rounded-[2rem] border border-emerald-100 bg-[linear-gradient(135deg,rgba(16,185,129,0.10),rgba(255,255,255,0.92),rgba(56,189,248,0.10))] p-6 shadow-sm">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Price</p>
                <p className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{salary}</p>
                <p className="mt-2 text-sm text-slate-600">{pricePeriod}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Jadval</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{schedule}</p>
                </div>
                <div className="rounded-2xl bg-white/80 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Ish turi</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{jobType}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white/88 p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Job Details</p>
                <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Vakansiya tafsilotlari</h2>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                Masofa: {job.distanceKm} km
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Lokatsiya", value: location },
                { label: "Housing", value: housing },
                { label: "Meals", value: meals },
                { label: "Posted", value: dayjs(job.postedAt).fromNow() }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-slate-50 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-900">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
              <div>
                <p className="text-sm font-semibold text-slate-950">Vazifa va sharoitlar</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {title} pozitsiyasi uchun {company} ish jadvali, kompensatsiya va aloqa jarayonini aniq ko'rsatadi.
                  UniServe orqali nomzod avval shartlarni ko'radi, keyin xavfsiz kanal orqali agent yoki HR bilan bog'lanadi.
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">Talablar va feature'lar</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {job.requirements.map((item) => (
                    <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700">
                      {item}
                    </span>
                  ))}
                  {job.visaTypes.map((item) => (
                    <span key={item} className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-semibold text-sky-700">
                      Visa: {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <ServiceReviews rating={rating} reviewCount={reviewCount} reviews={reviews} />
          <ServiceRelated title="O'xshash ishlar" items={relatedJobs} />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <ServiceAgentCard
            avatarSrc={undefined}
            fallbackText={recruiterName}
            name={recruiterName}
            handle={recruiterHandle}
            roleLabel="HR coordinator"
            rating={rating}
            verified
            completedJobs={completedJobs}
            contacts={contactMethods}
            trustIndicators={trustIndicators}
          />

          <ServiceActions
            actions={[
              {
                key: "order",
                label: "Buyurtma berish",
                tone: "primary",
                onClick: handleOrder
              },
              {
                key: "message",
                label: "Agentga yozish",
                tone: "secondary",
                onClick: handleWriteAgent
              },
              {
                key: "save",
                label: saved ? "Saqlangan" : "Saqlash",
                tone: "ghost",
                onClick: toggleSaved
              }
            ]}
          />

          <div className="rounded-[1.75rem] border border-slate-200 bg-white/88 p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Contact block</p>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>Telefon: {showContacts && job.contactPhone ? job.contactPhone : "Buyurtmadan keyin ochiladi"}</p>
              <p>Telegram: {showContacts && job.contactTelegram ? job.contactTelegram : "Buyurtmadan keyin ochiladi"}</p>
              <p>Chat: {isAuthenticated ? "Platforma ichida mavjud" : "Login orqali ochiladi"}</p>
            </div>
            {!isAuthenticated ? (
              <Link
                href={`/login?redirect=${encodeURIComponent(currentPath)}`}
                className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
              >
                Login qilib davom etish
              </Link>
            ) : null}
          </div>
        </aside>
      </div>
    </div>
  );
}
