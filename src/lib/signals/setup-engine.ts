/** Multi-layer setup → risk → validation engine (Binance candles, no CCXT). */

import {
  analyzeCandles,
  ema,
  rsi,
  type Candle,
  type SignalTrigger,
} from "@/lib/signals/ta";

export type SetupScore = "A+" | "A" | "B" | "C" | "D" | "F";
export type Bias = "bullish" | "bearish" | "neutral";

export type SetupAnalysis = {
  symbol: string;
  interval: string;
  lastClose: number;
  ema20: number | null;
  ema50: number | null;
  rsi14: number | null;
  volumeSpike: boolean;
  triggers: SignalTrigger[];
  setup: {
    trend: Bias;
    momentum: Bias;
    orderFlow: Bias;
    capitalFlow: Bias;
    confirmations: number;
  };
  risk: {
    entryZone: { low: number; high: number };
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskReward: number;
    riskPct: number;
  };
  validation: {
    setupScore: SetupScore;
    validated: boolean;
    bias: Bias;
    reasons: string[];
  };
};

function obvSlope(candles: Candle[], lookback = 14): number {
  if (candles.length < 2) return 0;
  let obv = 0;
  const series: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1]!;
    const cur = candles[i]!;
    if (cur.close > prev.close) obv += cur.volume;
    else if (cur.close < prev.close) obv -= cur.volume;
    series.push(obv);
  }
  if (series.length < lookback + 1) return 0;
  const a = series[series.length - 1 - lookback]!;
  const b = series[series.length - 1]!;
  return b - a;
}

function closeInRange(candle: Candle): number {
  const range = candle.high - candle.low;
  if (range <= 0) return 0.5;
  return (candle.close - candle.low) / range;
}

function scoreFromConfirmations(n: number, aligned: boolean): SetupScore {
  if (!aligned || n <= 0) return "F";
  if (n >= 4) return "A+";
  if (n === 3) return "A";
  if (n === 2) return "B";
  return "C";
}

function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/** Full multi-layer analysis from OHLCV candles. */
export function buildSetupAnalysis(
  candles: Candle[],
  symbol: string,
  interval: string,
): SetupAnalysis {
  const base = analyzeCandles(candles, symbol, interval);
  const last = candles[candles.length - 1];
  const closes = candles.map((c) => c.close);
  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const r14 = rsi(closes, 14);
  const i = closes.length - 1;
  const ema20v = e20[i] ?? null;
  const ema50v = e50[i] ?? null;
  const rsiV = r14[i] ?? null;
  const price = base.lastClose;

  let trend: Bias = "neutral";
  if (ema20v != null && ema50v != null) {
    if (price > ema20v && ema20v > ema50v) trend = "bullish";
    else if (price < ema20v && ema20v < ema50v) trend = "bearish";
  }

  let momentum: Bias = "neutral";
  if (rsiV != null) {
    if (rsiV >= 55) momentum = "bullish";
    else if (rsiV <= 45) momentum = "bearish";
    if (rsiV < 30) momentum = "bullish";
    if (rsiV > 70) momentum = "bearish";
  }

  const loc = last ? closeInRange(last) : 0.5;
  let orderFlow: Bias = "neutral";
  if (base.volumeSpike) {
    orderFlow = loc >= 0.55 ? "bullish" : loc <= 0.45 ? "bearish" : "neutral";
  } else if (loc >= 0.7) orderFlow = "bullish";
  else if (loc <= 0.3) orderFlow = "bearish";

  const slope = obvSlope(candles);
  let capitalFlow: Bias = "neutral";
  if (slope > 0) capitalFlow = "bullish";
  else if (slope < 0) capitalFlow = "bearish";

  const layers: Bias[] = [trend, momentum, orderFlow, capitalFlow];
  const bull = layers.filter((b) => b === "bullish").length;
  const bear = layers.filter((b) => b === "bearish").length;
  const bias: Bias =
    bull > bear && bull >= 2 ? "bullish" : bear > bull && bear >= 2 ? "bearish" : "neutral";
  const confirmations = bias === "bullish" ? bull : bias === "bearish" ? bear : 0;

  const lookback = candles.slice(-20);
  const recentLow = Math.min(...lookback.map((c) => c.low));
  const recentHigh = Math.max(...lookback.map((c) => c.high));
  const atrProxy =
    lookback.reduce((s, c) => s + (c.high - c.low), 0) / Math.max(lookback.length, 1);

  let entryLow: number;
  let entryHigh: number;
  let stopLoss: number;
  let tp1: number;
  let tp2: number;

  if (bias === "bullish") {
    entryLow = round4(Math.max(recentLow, price - atrProxy * 0.35));
    entryHigh = round4(price);
    stopLoss = round4(recentLow - atrProxy * 0.15);
    const risk = Math.max(price - stopLoss, atrProxy * 0.2);
    tp1 = round4(price + risk);
    tp2 = round4(price + risk * 2);
  } else if (bias === "bearish") {
    entryHigh = round4(Math.min(recentHigh, price + atrProxy * 0.35));
    entryLow = round4(price);
    stopLoss = round4(recentHigh + atrProxy * 0.15);
    const risk = Math.max(stopLoss - price, atrProxy * 0.2);
    tp1 = round4(price - risk);
    tp2 = round4(price - risk * 2);
  } else {
    entryLow = round4(price - atrProxy * 0.25);
    entryHigh = round4(price + atrProxy * 0.25);
    stopLoss = round4(price - atrProxy);
    tp1 = round4(price + atrProxy);
    tp2 = round4(price + atrProxy * 2);
  }

  const riskAbs =
    bias === "bearish"
      ? Math.abs(stopLoss - price)
      : Math.abs(price - stopLoss);
  const rewardAbs = Math.abs(tp1 - price);
  const riskReward = riskAbs > 0 ? round4(rewardAbs / riskAbs) : 0;
  const riskPct = price > 0 ? round4((riskAbs / price) * 100) : 0;

  const reasons: string[] = [];
  if (trend !== "neutral") reasons.push(`Trend ${trend}`);
  if (momentum !== "neutral") reasons.push(`Momentum ${momentum}`);
  if (orderFlow !== "neutral") reasons.push(`Order flow ${orderFlow}`);
  if (capitalFlow !== "neutral") reasons.push(`Capital flow ${capitalFlow}`);
  if (base.volumeSpike) reasons.push("Volume spike");

  const validated = confirmations >= 2 && bias !== "neutral";
  const setupScore = scoreFromConfirmations(confirmations, validated);

  return {
    symbol,
    interval,
    lastClose: base.lastClose,
    ema20: base.ema20,
    ema50: base.ema50,
    rsi14: base.rsi14,
    volumeSpike: base.volumeSpike,
    triggers: base.triggers,
    setup: {
      trend,
      momentum,
      orderFlow,
      capitalFlow,
      confirmations,
    },
    risk: {
      entryZone: { low: entryLow, high: entryHigh },
      stopLoss,
      takeProfit1: tp1,
      takeProfit2: tp2,
      riskReward,
      riskPct,
    },
    validation: {
      setupScore,
      validated,
      bias,
      reasons,
    },
  };
}

/** True if price is within pct of entry zone edge or stop loss. */
export function isNearKeyLevel(
  setup: SetupAnalysis,
  pct = 0.003,
): { near: boolean; kind: "entry" | "stop" | null } {
  const p = setup.lastClose;
  const { entryZone, stopLoss } = setup.risk;
  const near = (level: number) => Math.abs(p - level) / Math.max(p, 1e-9) <= pct;
  if (near(stopLoss)) return { near: true, kind: "stop" };
  if (near(entryZone.low) || near(entryZone.high)) return { near: true, kind: "entry" };
  return { near: false, kind: null };
}

export function parseWatchlistSymbols(env = process.env.MARKET_ALERT_SYMBOLS): string[] {
  const raw =
    env?.trim() ||
    "BTCUSDT,ETHUSDT,SOLUSDT,BNBUSDT,XRPUSDT,ADAUSDT,DOGEUSDT,AVAXUSDT,LINKUSDT,DOTUSDT";
  return [
    ...new Set(
      raw
        .split(/[,;\s]+/)
        .map((s) => s.replace("/", "").toUpperCase())
        .filter((s) => s.length >= 5 && s.length <= 20),
    ),
  ].slice(0, 20);
}
