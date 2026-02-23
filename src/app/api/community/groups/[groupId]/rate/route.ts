import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    await request.json();
  } catch (error) {
    console.error("rate payload parse error", error);
  }
  return NextResponse.json({ ok: true });
}
