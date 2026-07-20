import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Health + deploy versija — patikrinti ar Railway įdiegė naują commit. */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    version: "2026-07-20-prices-engage",
    commit: process.env.RAILWAY_GIT_COMMIT_SHA?.slice(0, 7) ?? process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "unknown",
    branch: process.env.RAILWAY_GIT_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF ?? "unknown",
    site: process.env.NEXT_PUBLIC_SITE_URL ?? "unset",
  });
}
