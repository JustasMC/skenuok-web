import { NextResponse } from "next/server";
import { z } from "zod";
import {
  instrumentsFor,
  type MarketCategory,
  fetchYahooCandles,
} from "@/lib/markets/instruments";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";
import { analyzeCandles } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const querySchema = z.object({
  category: z.enum(["etf", "metals", "fx"]),
  symbol: z.string().trim().min(1).max(24).optional(),
});

export async function GET(req: Request) {
  const limited = assertScanRateLimit(`markets:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const url = new URL(req.url);
  const parsed = querySchema.safeParse({
    category: url.searchParams.get("category"),
    symbol: url.searchParams.get("symbol") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Neteisinga kategorija" }, { status: 422 });
  }

  const category = parsed.data.category as MarketCategory;
  const list = instrumentsFor(category);
  const pick =
    list.find((i) => i.symbol === parsed.data.symbol) ?? list[0];
  if (!pick) {
    return NextResponse.json({ error: "Nėra instrumentų" }, { status: 404 });
  }

  try {
    const candles = await fetchYahooCandles(pick.symbol);
    const analysis = analyzeCandles(candles, pick.symbol, "1d");
    return NextResponse.json({
      ok: true as const,
      category,
      instrument: pick,
      instruments: list,
      ...analysis,
      candles: candles.slice(-60).map((c) => ({ t: c.time, c: c.close, v: c.volume })),
      disclaimer: "Educational only — not investment advice.",
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Fetch failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
