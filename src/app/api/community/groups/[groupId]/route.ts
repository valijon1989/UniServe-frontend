import { NextRequest, NextResponse } from "next/server";
import { fallbackCommunityGroups, type CommunityGroup } from "@/data/communityGroups";

export async function GET(request: NextRequest) {
  const groupId = request.nextUrl.pathname.split("/").at(-1) || "";
  const group = fallbackCommunityGroups.find((item) => item.id === groupId);
  if (!group) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }
  return NextResponse.json(group as CommunityGroup, {
    headers: {
      "Cache-Control": "public, max-age=60"
    }
  });
}
