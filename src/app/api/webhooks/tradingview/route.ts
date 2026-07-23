import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { createMarketAlert } from "@/lib/markets/alerts";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z
  .object({
    ticker: z.string().optional(),
    symbol: z.string().optional(),
    message: z.string().optional(),
    text: z.string().optional(),
    price: z.union([z.string(), z.number()]).optional(),
    interval: z.string().optional(),
    timeframe: z.string().optional(),
    strategy: z.string().optional(),
  })
  .passthrough();

function assertSecret(req: Request): boolean {
  const expected = process.env.TRADINGVIEW_WEBHOOK_SECRET?.trim();
  if (!expected) return false;
  const url = new URL(req.url);
  const q = url.searchParams.get("secret");
  const h = req.headers.get("x-tradingview-secret") ?? req.headers.get("authorization");
  const bearer = h?.startsWith("Bearer ") ? h.slice(7) : h;
  return q === expected || bearer === expected;
}

/** TradingView alert webhook → MarketAlert + Telegram. */
export async function POST(req: Request) {
  if (!assertSecret(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const limited = assertScanRateLimit(`tv-webhook:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limited", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  let raw: unknown;
  const ct = req.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      raw = await req.json();
    } else {
      const text = await req.text();
      try {
        raw = JSON.parse(text);
      } catch {
        raw = { message: text };
      }
    }
  } catch {
    return NextResponse.json({ error: "Bad body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 422 });
  }

  const d = parsed.data;
  const symbol = (d.ticker ?? d.symbol ?? "UNKNOWN")
    .toString()
    .replace("/", "")
    .toUpperCase()
    .slice(0, 24);
  const message =
    (d.message ?? d.text ?? JSON.stringify(d)).toString().slice(0, 4000) || "TradingView alert";
  const interval = (d.interval ?? d.timeframe)?.toString().slice(0, 16) ?? null;
  const title = d.strategy
    ? `TV · ${d.strategy}`.slice(0, 120)
    : `TradingView · ${symbol}`.slice(0, 120);

  const alert = await createMarketAlert({
    source: "tradingview",
    symbol,
    interval,
    title,
    message,
    severity: "info",
    payload: d as Prisma.InputJsonValue,
    notify: true,
  });

  return NextResponse.json({ ok: true as const, id: alert.id });
}
