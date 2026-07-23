import { NextResponse } from "next/server";
import { listRecentAlerts } from "@/lib/markets/alerts";
import { isTelegramConfigured } from "@/lib/notify";
import { getRateLimitClientKey } from "@/lib/rate-limit";
import { assertScanRateLimit } from "@/lib/scan-rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/** Recent MarketAlert feed for crypto hub UI. */
export async function GET(req: Request) {
  const limited = assertScanRateLimit(`crypto-alerts:${getRateLimitClientKey(req)}`);
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Per daug užklausų.", retryAfterSec: limited.retryAfterSec },
      { status: 429 },
    );
  }

  const url = new URL(req.url);
  const limit = Number(url.searchParams.get("limit") ?? "30");

  try {
    const alerts = await listRecentAlerts(Number.isFinite(limit) ? limit : 30);
    return NextResponse.json({
      ok: true as const,
      alerts,
      status: {
        telegram: isTelegramConfigured(),
        tradingViewWebhook: Boolean(process.env.TRADINGVIEW_WEBHOOK_SECRET?.trim()),
        cron: Boolean(process.env.CRON_SECRET?.trim()),
      },
    });
  } catch {
    return NextResponse.json({
      ok: true as const,
      alerts: [],
      status: {
        telegram: isTelegramConfigured(),
        tradingViewWebhook: Boolean(process.env.TRADINGVIEW_WEBHOOK_SECRET?.trim()),
        cron: Boolean(process.env.CRON_SECRET?.trim()),
      },
    });
  }
}
