import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  return NextResponse.redirect(new URL("/api/scan/heavy", req.url), 307);
}
