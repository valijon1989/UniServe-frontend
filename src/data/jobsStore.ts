import {
  initialJobListings,
  type JobKind,
  type JobListing,
  type LocalizedText,
  tx
} from "@/data/jobListings";

type ListParams = {
  kind?: JobKind;
  location?: string;
  maxDistance?: number;
  page?: number;
  limit?: number;
};

type ListResponse = {
  items: JobListing[];
  page: number;
  totalPages: number;
  total: number;
};

let jobListings: JobListing[] = [...initialJobListings];
let nextImageIndex = 13;

const toNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const resolveLocalizedText = (value?: string | LocalizedText) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.en || value.uz || value.ru || value.ko || "";
};

const matchesLocation = (job: JobListing, query: string) => {
  if (!query) return true;
  return resolveLocalizedText(job.location).toLowerCase().includes(query.toLowerCase());
};

export const listJobs = (params: ListParams): ListResponse => {
  const {
    kind,
    location = "",
    maxDistance = 0,
    page = 1,
    limit = 4
  } = params;
  let items = jobListings;
  if (kind === "permanent" || kind === "temporary") {
    items = items.filter((job) => job.kind === kind);
  }
  if (location) {
    items = items.filter((job) => matchesLocation(job, location));
  }
  if (maxDistance > 0) {
    items = items.filter((job) => job.distanceKm <= maxDistance);
  }
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * limit;
  const paged = items.slice(start, start + limit);
  return {
    items: paged,
    page: safePage,
    totalPages,
    total
  };
};

export const getJobById = (id: string) => jobListings.find((job) => job.id === id) || null;

export const addJob = (payload: {
  title: string;
  company: string;
  location: string;
  distanceKm?: number;
  schedule?: string;
  salary: string;
  jobType?: string;
  housing?: string;
  meals?: string;
  requirements?: string[];
  visaTypes?: string[];
  contactPhone?: string;
  contactTelegram?: string;
  chatUrl?: string;
  kind: JobKind;
}): JobListing | null => {
  if (nextImageIndex > 36) return null;
  const image = `/services/employment/${String(nextImageIndex).padStart(2, "0")}.jpg`;
  nextImageIndex += 1;
  const newJob: JobListing = {
    id: `custom-${Date.now()}`,
    image,
    title: tx(payload.title, payload.title, payload.title, payload.title),
    company: tx(payload.company, payload.company, payload.company, payload.company),
    location: tx(payload.location, payload.location, payload.location, payload.location),
    distanceKm: Number(payload.distanceKm || 0),
    schedule: tx(payload.schedule || "-", payload.schedule || "-", payload.schedule || "-", payload.schedule || "-"),
    salary: tx(payload.salary, payload.salary, payload.salary, payload.salary),
    jobType: tx(payload.jobType || "-", payload.jobType || "-", payload.jobType || "-", payload.jobType || "-"),
    housing: tx(
      payload.housing || "Yotoqxona yo'q",
      payload.housing || "Yotoqxona yo'q",
      payload.housing || "Yotoqxona yo'q",
      payload.housing || "Yotoqxona yo'q"
    ),
    meals: tx(
      payload.meals || "Ovqat: yo'q",
      payload.meals || "Ovqat: yo'q",
      payload.meals || "Ovqat: yo'q",
      payload.meals || "Ovqat: yo'q"
    ),
    requirements: payload.requirements || [],
    visaTypes: payload.visaTypes || [],
    contactPhone: payload.contactPhone,
    contactTelegram: payload.contactTelegram,
    chatUrl: payload.chatUrl,
    kind: payload.kind,
    postedAt: new Date().toISOString().slice(0, 10)
  };
  jobListings = [newJob, ...jobListings];
  return newJob;
};

export const parseQuery = (searchParams: URLSearchParams) => {
  const kind = (searchParams.get("kind") || "") as JobKind;
  const location = searchParams.get("location") || "";
  const maxDistance = toNumber(searchParams.get("maxDistance"), 0);
  const page = toNumber(searchParams.get("page"), 1);
  const limit = toNumber(searchParams.get("limit"), 4);
  return { kind, location, maxDistance, page, limit };
};
