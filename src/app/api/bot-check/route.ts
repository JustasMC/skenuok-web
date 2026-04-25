import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());
  return NextResponse.json({ ok: true, headers });
}
