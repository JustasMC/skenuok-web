import { NextResponse } from "next/server";
import { z } from "zod";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { buildSetupAnalysis } from "@/lib/signals/setup-engine";
import { fetchBinanceKlines } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  symbol: z
    .string()
    .trim()
    .min(3)
    .max(20)
    .transform((s) => s.replace("/", "").toUpperCase()),
  interval: z.enum(["15m", "1h", "4h"]).default("15m"),
});

/** Multi-layer setup analysis for crypto hub (rate-limited, free). */
export async function GET(req: Request) {
  const limited = assertScanRateLimit(`crypto-setup:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    symbol: url.searchParams.get("symbol") ?? "BTCUSDT",
    interval: url.searchParams.get("interval") ?? "15m",
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Neteisingas simbolis / intervalas" }, { status: 422 });
  }

  try {
    const candles = await fetchBinanceKlines(parsed.data.symbol, parsed.data.interval);
    const setup = buildSetupAnalysis(candles, parsed.data.symbol, parsed.data.interval);
    return NextResponse.json({
      ok: true as const,
      ...setup,
      candles: candles.slice(-60).map((c) => ({ t: c.time, c: c.close, v: c.volume })),
      disclaimer: "Educational only — not investment advice.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
