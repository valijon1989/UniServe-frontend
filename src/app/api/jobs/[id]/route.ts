import { NextResponse } from "next/server";
import { getJobById } from "@/data/jobsStore";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const job = getJobById(params.id);
  if (!job) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ item: job });
}
