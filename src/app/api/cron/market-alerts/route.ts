import { NextResponse } from "next/server";
import { createMarketAlert, recentAlertExists } from "@/lib/markets/alerts";
import {
  buildSetupAnalysis,
  isNearKeyLevel,
  parseWatchlistSymbols,
} from "@/lib/signals/setup-engine";
import { fetchBinanceKlines } from "@/lib/signals/ta";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 60;

function assertCron(req: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  return auth === `Bearer ${secret}`;
}

/** Railway/cron: scan watchlist, alert on validated setups or near entry/SL. */
export async function GET(req: Request) {
  if (!assertCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const symbols = parseWatchlistSymbols();
  const interval = "15m";
  const emitted: string[] = [];
  const errors: string[] = [];

  for (const symbol of symbols) {
    try {
      const candles = await fetchBinanceKlines(symbol, interval);
      const setup = buildSetupAnalysis(candles, symbol, interval);
      const near = isNearKeyLevel(setup, 0.003);

      let title: string | null = null;
      let message: string | null = null;
      let severity = "info";

      if (setup.validation.validated) {
        title = `${symbol} · Setup ${setup.validation.setupScore} (${setup.validation.bias})`;
        message = [
          `Price ${setup.lastClose}`,
          `Entry ${setup.risk.entryZone.low}-${setup.risk.entryZone.high}`,
          `SL ${setup.risk.stopLoss}`,
          `TP1 ${setup.risk.takeProfit1} · R:R ${setup.risk.riskReward}`,
          setup.validation.reasons.join(", "),
          "Educational only — not investment advice.",
        ].join("\n");
        severity = setup.validation.bias === "bullish" ? "bullish" : "bearish";
      } else if (near.near && near.kind) {
        title = `${symbol} · Near ${near.kind}`;
        message = `Price ${setup.lastClose} near ${near.kind}. SL=${setup.risk.stopLoss}. Not advice.`;
        severity = near.kind === "stop" ? "bearish" : "info";
      }

      if (title && message) {
        const dup = await recentAlertExists(symbol, title);
        if (!dup) {
          await createMarketAlert({
            source: "cron",
            symbol,
            interval,
            title,
            message,
            severity,
            payload: {
              setupScore: setup.validation.setupScore,
              bias: setup.validation.bias,
              validated: setup.validation.validated,
              risk: setup.risk,
            },
            notify: true,
          });
          emitted.push(symbol);
        }
      }
    } catch (e) {
      errors.push(`${symbol}: ${e instanceof Error ? e.message : "err"}`);
    }
  }

  return NextResponse.json({
    ok: true as const,
    scanned: symbols.length,
    emitted,
    errors,
  });
}
