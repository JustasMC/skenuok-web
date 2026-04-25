import { NextResponse } from "next/server";
import { jsonApiError, publicApiErrorMessage } from "@/lib/api-errors";
import { suggestTopicsWithOpenAI } from "@/lib/topics-openai";
import { topicsRequestSchema } from "@/lib/topics-schema";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    let json: unknown;
    try {
      json = await req.json();
    } catch {
      return NextResponse.json({ error: "Neteisingas JSON" }, { status: 400 });
    }

    const parsed = topicsRequestSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Neteisingi duomenys" }, { status: 422 });
    }

    const clientKey = getRateLimitClientKey(req);
    const limited = assertScanRateLimit(clientKey);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Per daug užklausų. Palaukite.", retryAfterSec: limited.retryAfterSec },
        { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
      );
    }

    try {
      const topics = await suggestTopicsWithOpenAI({
        url: parsed.data.url,
        title: parsed.data.title ?? null,
        description: parsed.data.description ?? null,
        keywords: parsed.data.keywords ?? [],
        scores: parsed.data.scores,
        insights: parsed.data.insights ?? [],
      });
      return NextResponse.json({ ok: true as const, topics });
    } catch (e) {
      return NextResponse.json({ error: publicApiErrorMessage(e) }, { status: 502 });
    }
  } catch (e) {
    return jsonApiError("topics/suggest", e);
  }
}
