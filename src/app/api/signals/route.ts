import { NextResponse } from "next/server";
import { z } from "zod";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { analyzeCandles, fetchBinanceKlines } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.replace("/", "").toUpperCase()),
  interval: z.enum(["15m", "1h", "4h"]),
});

/** Public technical snapshot (rate-limited). AI analysis is a separate credited endpoint. */
export async function GET(req: Request) {
  const limited = assertScanRateLimit(`signals:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const url = new URL(req.url);
  const symbolRaw = (url.searchParams.get("symbol") ?? "BTCUSDT").replace("/", "").toUpperCase();
  const intervalRaw = url.searchParams.get("interval") ?? "15m";
  const parsed = querySchema.safeParse({
    symbol: symbolRaw,
    interval: intervalRaw,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Neteisingas simbolis / intervalas" }, { status: 422 });
  }

  try {
    const candles = await fetchBinanceKlines(parsed.data.symbol, parsed.data.interval);
    const analysis = analyzeCandles(candles, parsed.data.symbol, parsed.data.interval);
    return NextResponse.json({
      ok: true as const,
      symbol: parsed.data.symbol,
      interval: parsed.data.interval,
      ...analysis,
      disclaimer: "Educational only — not investment advice.",
      candles: candles.slice(-60).map((c) => ({
        t: c.time,
        c: c.close,
        v: c.volume,
      })),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
