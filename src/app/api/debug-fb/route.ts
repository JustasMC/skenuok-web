import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request) {
  const userAgent = req.headers.get("user-agent") ?? null;
  const forwardedFor = req.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim() ?? null;

  return NextResponse.json(
    {
      ok: true,
      source: "facebook-debug",
      request: {
        userAgent,
        ip,
      },
    },
    { status: 200 },
  );
}
