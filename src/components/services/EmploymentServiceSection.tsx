"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { toQuery } from "@/lib/fetcher";
import { initialJobListings, type JobKind, type JobListing } from "@/data/jobListings";

const kindLabels: Record<JobKind, string> = {
  permanent: "Doimiy ishlar",
  temporary: "Vaqtinchalik ishlar"
};

type JobResponse = {
  items: JobListing[];
  page: number;
  totalPages: number;
  total: number;
};

export function EmploymentServiceSection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { isAuthenticated, token } = useAuthStore();
  const [filters, setFilters] = useState({ location: "", maxDistance: "" });
  const [permanentState, setPermanentState] = useState<JobResponse>({
    items: initialJobListings.filter((job) => job.kind === "permanent"),
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [temporaryState, setTemporaryState] = useState<JobResponse>({
    items: initialJobListings.filter((job) => job.kind === "temporary"),
    page: 1,
    totalPages: 1,
    total: 0
  });
  const [permanentPage, setPermanentPage] = useState(1);
  const [temporaryPage, setTemporaryPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const lastRequestRef = useRef<{ permanent: string; temporary: string } | null>(null);
  const [formState, setFormState] = useState({
    kind: "permanent" as JobKind,
    title: "",
    company: "",
    location: "",
    distanceKm: "",
    schedule: "",
    salary: "",
    jobType: "",
    housing: "Yotoqxona yo'q",
    meals: "Ovqat: yo'q",
    requirements: "",
    visaTypes: "",
    contactPhone: "",
    contactTelegram: ""
  });

  const buildQuery = (kind: JobKind, page: number) =>
    toQuery({
      kind,
      location: filters.location,
      maxDistance: filters.maxDistance ? Number(filters.maxDistance) : undefined,
      page,
      limit: 4
    });

  const returnTo = useMemo(() => {
    const query = searchParams.toString();
    return `${pathname}${query ? `?${query}` : ""}`;
  }, [pathname, searchParams]);

  const fetchJobs = async (kind: JobKind, page: number) => {
    const query = buildQuery(kind, page);
    const res = await fetch(`/api/jobs?${query}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
    if (!res.ok) {
      throw new Error("Jobs load failed");
    }
    return (await res.json()) as JobResponse;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) return;
    if (!formState.title || !formState.company || !formState.location || !formState.salary) return;
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({
        title: formState.title,
        company: formState.company,
        location: formState.location,
        distanceKm: Number(formState.distanceKm || 0),
        schedule: formState.schedule,
        salary: formState.salary,
        jobType: formState.jobType,
        housing: formState.housing,
        meals: formState.meals,
        requirements: formState.requirements
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        visaTypes: formState.visaTypes
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        contactPhone: formState.contactPhone,
        contactTelegram: formState.contactTelegram,
        chatUrl: "",
        kind: formState.kind
      })
    });
    if (!res.ok) return;
    setFormState((prev) => ({
      ...prev,
      title: "",
      company: "",
      location: "",
      distanceKm: "",
      schedule: "",
      salary: "",
      jobType: "",
      requirements: "",
      visaTypes: "",
      contactPhone: "",
      contactTelegram: ""
    }));
    setPermanentPage(1);
    setTemporaryPage(1);
  };

  useEffect(() => {
    setPermanentPage(1);
    setTemporaryPage(1);
  }, [filters.location, filters.maxDistance]);

  useEffect(() => {
    const permanentKey = buildQuery("permanent", permanentPage);
    const temporaryKey = buildQuery("temporary", temporaryPage);
    const last = lastRequestRef.current;
    if (last && last.permanent === permanentKey && last.temporary === temporaryKey) {
      return;
    }
    lastRequestRef.current = { permanent: permanentKey, temporary: temporaryKey };
    setIsLoading(true);
    Promise.all([fetchJobs("permanent", permanentPage), fetchJobs("temporary", temporaryPage)])
      .then(([permanent, temporary]) => {
        setPermanentState(permanent);
        setTemporaryState(temporary);
      })
      .catch(() => {
        // Keep existing data on failure.
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [permanentPage, temporaryPage, filters.location, filters.maxDistance]);

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Ish topib berish xizmati</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Doimiy va vaqtinchalik ishlar bozori</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">
            Vakansiya topish va kadrlar tanlash. Bu bo'limda ish beruvchilar e'lon qo'yadi, ish
            qidiruvchilar esa o'ziga mos vakansiyani topib, e'lon egasi bilan bog'lanishi mumkin.
          </p>
        </div>
        {isAuthenticated ? (
          <button
            type="button"
            className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
          >
            E'lon qo'yish
          </button>
        ) : (
          <Link
            href="/login"
            className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200"
          >
            E'lon qo'yish uchun kirish
          </Link>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chap qism</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{kindLabels.permanent}</h3>
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300">
              {permanentState.total || permanentState.items.length} ta e'lon
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Zavod, qurilish va doimiy ishlar shu bo'limda joylanadi.
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">O'ng qism</p>
          <div className="mt-2 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white">{kindLabels.temporary}</h3>
            <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300">
              {temporaryState.total || temporaryState.items.length} ta e'lon
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Bir kunlik, bir haftalik yoki bir necha soatlik ishlar shu bo'limda.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
        <div className="flex flex-1 flex-col gap-2">
          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Lokatsiya</label>
          <input
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
            placeholder="Masalan: Toshkent"
            value={filters.location}
            onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Masofa (km)</label>
          <input
            type="number"
            min="0"
            className="w-40 rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
            placeholder="Masofa"
            value={filters.maxDistance}
            onChange={(event) => setFilters((prev) => ({ ...prev, maxDistance: event.target.value }))}
          />
        </div>
        <button
          type="button"
          onClick={() => {
            setFilters({ location: "", maxDistance: "" });
          }}
          className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200"
        >
          Filtrni tozalash
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Yangi ish e'loni</h3>
          <span className="text-xs text-slate-400">Faqat login bo'lganlar qo'ya oladi</span>
        </div>
        {isAuthenticated ? (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              value={formState.kind}
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, kind: event.target.value as JobKind }))
              }
            >
              <option value="permanent">Doimiy ish</option>
              <option value="temporary">Vaqtinchalik ish</option>
            </select>
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Ish nomi"
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Kompaniya"
              value={formState.company}
              onChange={(event) => setFormState((prev) => ({ ...prev, company: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Manzil"
              value={formState.location}
              onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Masofa (km)"
              value={formState.distanceKm}
              onChange={(event) => setFormState((prev) => ({ ...prev, distanceKm: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Ish vaqti"
              value={formState.schedule}
              onChange={(event) => setFormState((prev) => ({ ...prev, schedule: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Ish haqi"
              value={formState.salary}
              onChange={(event) => setFormState((prev) => ({ ...prev, salary: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Ish turi"
              value={formState.jobType}
              onChange={(event) => setFormState((prev) => ({ ...prev, jobType: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Yotoqxona (bor/yo'q)"
              value={formState.housing}
              onChange={(event) => setFormState((prev) => ({ ...prev, housing: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Ovqat (masalan: 2 mahal)"
              value={formState.meals}
              onChange={(event) => setFormState((prev) => ({ ...prev, meals: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 md:col-span-2"
              placeholder="Talablar (vergul bilan)"
              value={formState.requirements}
              onChange={(event) => setFormState((prev) => ({ ...prev, requirements: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200 md:col-span-2"
              placeholder="Viza turlari (vergul bilan)"
              value={formState.visaTypes}
              onChange={(event) => setFormState((prev) => ({ ...prev, visaTypes: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Aloqa telefoni"
              value={formState.contactPhone}
              onChange={(event) => setFormState((prev) => ({ ...prev, contactPhone: event.target.value }))}
            />
            <input
              className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-200"
              placeholder="Telegram (masalan: @username)"
              value={formState.contactTelegram}
              onChange={(event) => setFormState((prev) => ({ ...prev, contactTelegram: event.target.value }))}
            />
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
              >
                E'lonni qo'shish
              </button>
              <p className="mt-2 text-[11px] text-slate-400">
                Har bir yangi e'lon uchun alohida rasm biriktiriladi.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 text-sm text-slate-300">
            E'lon qo'yish uchun <Link href="/login" className="text-emerald-200 underline">login</Link> qiling.
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {(
          [
            ["permanent", permanentState, permanentPage, setPermanentPage],
            ["temporary", temporaryState, temporaryPage, setTemporaryPage]
          ] as [JobKind, JobResponse, number, (page: number) => void][]
        ).map(([kind, state, page, setPage]) => (
            <div
              key={kind}
              className="rounded-3xl border border-slate-800/80 bg-slate-950/70 p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">{kindLabels[kind]}</h3>
                <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300">
                  {state.total || state.items.length} ta e'lon
                </span>
              </div>

              <div className="mt-4 space-y-4">
                {state.items.map((job) => (
                  <article
                    key={job.id}
                    className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/80 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-400/60"
                  >
                    <Link
                      href={`/jobs/${job.id}?from=${encodeURIComponent(returnTo)}`}
                      aria-label={`${job.title} tafsilotlari`}
                      className="absolute inset-0 z-10"
                    />
                    <div className="relative h-40 w-full overflow-hidden bg-slate-900">
                      <img src={job.image} alt={job.title} className="h-full w-full object-cover" />
                      <span className="absolute right-3 top-3 rounded-full bg-slate-950/80 px-3 py-1 text-[11px] text-slate-100">
                        {job.postedAt}
                      </span>
                    </div>

                    <div className="relative z-20 space-y-3 p-4 pointer-events-none">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{job.title}</h4>
                          <p className="text-xs text-slate-300">{job.company}</p>
                        </div>
                        <span className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300">
                          {job.salary}
                        </span>
                      </div>

                      <div className="grid gap-2 text-[11px] text-slate-300">
                        <p>
                          <span className="text-slate-400">Manzil:</span> {job.location} • Masofa: {job.distanceKm} km
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

                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Talablar</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                          {job.requirements.map((item) => (
                            <span key={item} className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>

                      {job.visaTypes.length > 0 && (
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Viza turlari</p>
                          <div className="mt-2 flex flex-wrap gap-2 text-[10px]">
                            {job.visaTypes.map((visa) => (
                              <span key={visa} className="rounded-full bg-slate-900/70 px-3 py-1 text-slate-300">
                                {visa}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-3 pointer-events-auto">
                        {isAuthenticated ? (
                          <button
                            type="button"
                            className="rounded-full bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-400/40"
                          >
                            Bog'lanish
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => router.push("/login")}
                            className="rounded-full bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200"
                          >
                            Bog'lanish uchun kirish
                          </button>
                        )}
                        <span className="text-[11px] text-slate-400">
                          E'lon va bog'lanish faqat login bo'lganlarga ochiq.
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(Math.max(1, page - 1))}
                    className="rounded-full bg-slate-900 px-3 py-1 text-slate-300 disabled:opacity-40"
                    disabled={page <= 1 || isLoading}
                  >
                    Oldingi
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage(Math.min(state.totalPages, page + 1))}
                    className="rounded-full bg-slate-900 px-3 py-1 text-slate-300 disabled:opacity-40"
                    disabled={page >= state.totalPages || isLoading}
                  >
                    Keyingi
                  </button>
                </div>
                <span>
                  Sahifa {page} / {state.totalPages}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
