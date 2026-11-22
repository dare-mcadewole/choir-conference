import { NextRequest, NextResponse } from "next/server";
import { lookupRegistrant } from "@/features/registration/service";

const attempts = new Map<string, { count: number; resetAt: number }>();
export async function GET(request: NextRequest) {
  const address = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "anonymous"; const hit = attempts.get(address); const now = Date.now();
  if (hit && hit.resetAt > now && hit.count >= 8) return NextResponse.json({ state: "new" }, { status: 429 });
  attempts.set(address, { count: hit && hit.resetAt > now ? hit.count + 1 : 1, resetAt: now + 60_000 });
  const query = request.nextUrl.searchParams.get("q")?.trim(); if (!query || query.length > 255) return NextResponse.json({ state: "new" });
  try { const result = await lookupRegistrant(query); return NextResponse.json(result.state === "historical" ? result : { state: result.state }); } catch { return NextResponse.json({ state: "new" }); }
}
