import { NextResponse } from "next/server";

export const revalidate = 60;
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ status: "ok" });
}
