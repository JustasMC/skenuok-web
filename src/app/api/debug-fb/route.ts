import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Temporary Facebook crawler diagnostics — logs full request headers to Railway.
 * Remove or protect after debugging (exposes incoming headers in JSON).
 */
export async function GET(req: Request) {
  const headers = Object.fromEntries(req.headers.entries());
  console.log("FB DEBUG:", headers);
  return NextResponse.json({ labas: "as tave matau", headers }, { status: 200 });
}
