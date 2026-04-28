import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { scanRequestSchema } from "@/lib/scan-schema";
import { runSeoScan } from "@/lib/seo-scan-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
  }

  const parsed = scanRequestSchema.safeParse(json);
  if (!parsed.success) {
    const msg = parsed.error.flatten().fieldErrors.url?.[0] ?? "Patikrinkite URL";
    return NextResponse.json({ error: msg }, { status: 422 });
  }

  const clientKey = getRateLimitClientKey(req);
  const limited = assertScanRateLimit(clientKey);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug skenavimų. Palaukite ir bandykite vėliau.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  try {
    const result = await runSeoScan(parsed.data);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (e) {
    return jsonApiError("scan/heavy", e, 502);
  }
}
