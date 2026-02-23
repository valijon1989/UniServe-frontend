import { NextResponse } from "next/server";
import { fallbackCommunityGroups } from "@/data/communityGroups";

export async function GET() {
  return NextResponse.json(fallbackCommunityGroups, {
    headers: {
      "Cache-Control": "public, max-age=60"
    }
  });
}
