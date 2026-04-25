import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Temporary Facebook crawler diagnostics — logs full request headers to Railway.
 * Remove or protect after debugging (exposes incoming headers in JSON).
 */
export async function GET(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());
  const userAgent = req.headers.get("user-agent") ?? "(none)";

  console.log("[api:debug-fb]", JSON.stringify({ userAgent, headers }, null, 2));

  return NextResponse.json({ message: "As matau tave!", headers }, { status: 200 });
}
