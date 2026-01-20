"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";
import type { JobListing } from "@/data/jobListings";
import { useAuthStore } from "@/store/auth";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const [job, setJob] = useState<JobListing | null>(null);
  const [loading, setLoading] = useState(true);

  const returnTo = useMemo(() => searchParams.get("from"), [searchParams]);
  const currentPath = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const handleBack = () => {
    if (returnTo) {
      router.push(returnTo);
      return;
    }
    router.back();
  };

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
    load();
  }, [params?.id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-slate-400">Yuklanmoqda...</p>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-10">
        <p className="text-sm text-rose-300">Ish e'loni topilmadi.</p>
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
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
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
            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              <img src={job.image} alt={job.title} className="h-64 w-full object-cover" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">{job.title}</h1>
              <p className="text-sm text-slate-300">{job.company}</p>
              <p className="mt-2 text-xs text-slate-400">
                {job.location} • Masofa: {job.distanceKm} km • {job.postedAt}
              </p>
            </div>

            <div className="grid gap-2 text-sm text-slate-300">
              <p>
                <span className="text-slate-400">Ish haqi:</span> {job.salary}
              </p>
              <p>
                <span className="text-slate-400">Ish vaqti:</span> {job.schedule}
              </p>
              <p>
                <span className="text-slate-400">Ish turi:</span> {job.jobType}
              </p>
              <p>
                <span className="text-slate-400">Yotoqxona:</span> {job.housing} •{" "}
                <span className="text-slate-400">Ovqat:</span> {job.meals}
              </p>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Talablar</p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                {job.requirements.map((item) => (
                  <span key={item} className="rounded-full bg-slate-900/70 px-3 py-1">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {job.visaTypes.length > 0 && (
              <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Viza turlari</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-300">
                  {job.visaTypes.map((item) => (
                    <span key={item} className="rounded-full bg-slate-900/70 px-3 py-1">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <button
                    type="button"
                    className="w-full rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                  >
                    Bog'lanish
                  </button>
                  <div className="space-y-2 text-xs text-slate-300">
                    {job.contactPhone && (
                      <p>
                        Telefon:{" "}
                        <a href={`tel:${job.contactPhone}`} className="text-emerald-200 underline">
                          {job.contactPhone}
                        </a>
                      </p>
                    )}
                    {job.contactTelegram && (
                      <p>
                        Telegram:{" "}
                        <a
                          href={`https://t.me/${job.contactTelegram.replace("@", "")}`}
                          className="text-emerald-200 underline"
                        >
                          {job.contactTelegram}
                        </a>
                      </p>
                    )}
                    {job.chatUrl && (
                      <p>
                        Chat:{" "}
                        <Link
                          href={`${job.chatUrl}${job.chatUrl.includes("?") ? "&" : "?"}from=${encodeURIComponent(currentPath)}`}
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
                    E'lon va bog'lanish faqat login bo'lganlarga ochiq.
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
