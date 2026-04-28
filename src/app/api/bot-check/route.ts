import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userAgent = req.headers.get("user-agent") ?? null;
  const isBot = Boolean(userAgent && /(bot|facebookexternalhit|crawler|spider)/i.test(userAgent));

  return NextResponse.json({
    ok: true,
    isBot,
    userAgent,
  });
}
