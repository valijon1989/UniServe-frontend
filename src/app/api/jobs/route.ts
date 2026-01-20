import { NextResponse } from "next/server";
import { addJob, listJobs, parseQuery } from "@/data/jobsStore";
import type { JobKind } from "@/data/jobListings";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const { kind, location, maxDistance, page, limit } = parseQuery(searchParams);
  const response = listJobs({
    kind,
    location,
    maxDistance,
    page: Math.max(1, page),
    limit: Math.max(1, limit)
  });
  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const auth = request.headers.get("authorization") || "";
  if (!auth.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const {
    title,
    company,
    location,
    distanceKm,
    schedule,
    salary,
    jobType,
    housing,
    meals,
    requirements,
    visaTypes,
    contactPhone,
    contactTelegram,
    chatUrl,
    kind
  } = payload || {};

  if (!title || !company || !location || !salary || (kind !== "permanent" && kind !== "temporary")) {
    return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
  }

  const newJob = addJob({
    title,
    company,
    location,
    distanceKm,
    schedule,
    salary,
    jobType,
    housing,
    meals,
    requirements: Array.isArray(requirements) ? requirements : [],
    visaTypes: Array.isArray(visaTypes) ? visaTypes : [],
    contactPhone,
    contactTelegram,
    chatUrl,
    kind
  });

  if (!newJob) {
    return NextResponse.json({ message: "Image pool exhausted" }, { status: 409 });
  }

  return NextResponse.json({ item: newJob }, { status: 201 });
}
