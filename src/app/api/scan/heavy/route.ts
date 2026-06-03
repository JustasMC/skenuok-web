import { NextResponse } from "next/server";
import { jsonApiError } from "@/lib/api-errors";
import { getRateLimitClientKey, isSyntheticCrawler } from "@/lib/rate-limit";
import { getCombinedRouteAbortSignal, isAbortError } from "@/lib/route-abort";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { scanRequestSchema } from "@/lib/scan-schema";
import { runSeoScan } from "@/lib/seo-scan-service";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

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

  if (!isSyntheticCrawler(req)) {
    const clientKey = getRateLimitClientKey(req);
    const limited = assertScanRateLimit(clientKey);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Per daug skenavimų. Palaukite ir bandykite vėliau.", retryAfterSec: limited.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }
  }

  const signal = getCombinedRouteAbortSignal(req, 58_000);
  try {
    const result = await runSeoScan(parsed.data, { signal });
    if (!result.ok) {
      if (result.status >= 500) {
        console.error("[scan/heavy] upstream scan failure", {
          status: result.status,
          error: result.error,
          url: parsed.data.url,
          strategy: parsed.data.strategy,
        });
      }
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json(result);
  } catch (e) {
    if (isAbortError(e)) {
      return NextResponse.json(
        { error: "Skenavimas užtruko per ilgai (timeout). Bandykite dar kartą po kelių sekundžių." },
        { status: 504 },
      );
    }
    return jsonApiError("scan/heavy", e, 502);
  }
}
