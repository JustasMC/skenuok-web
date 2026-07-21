/** Lightweight OHLCV + EMA / RSI technical signals (no CCXT dependency). */

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type SignalTrigger = {
  id: string;
  severity: "info" | "bullish" | "bearish";
  title: string;
  detail: string;
};

export function ema(values: number[], period: number): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length < period) return out;
  const k = 2 / (period + 1);
  let prev = values.slice(0, period).reduce((a, b) => a + b, 0) / period;
  out[period - 1] = prev;
  for (let i = period; i < values.length; i++) {
    prev = values[i]! * k + prev * (1 - k);
    out[i] = prev;
  }
  return out;
}

export function rsi(values: number[], period = 14): (number | null)[] {
  const out: (number | null)[] = Array(values.length).fill(null);
  if (values.length <= period) return out;
  let gain = 0;
  let loss = 0;
  for (let i = 1; i <= period; i++) {
    const d = values[i]! - values[i - 1]!;
    if (d >= 0) gain += d;
    else loss -= d;
  }
  let avgGain = gain / period;
  let avgLoss = loss / period;
  out[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  for (let i = period + 1; i < values.length; i++) {
    const d = values[i]! - values[i - 1]!;
    const g = d > 0 ? d : 0;
    const l = d < 0 ? -d : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
    out[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }
  return out;
}

export function analyzeCandles(candles: Candle[], symbol: string, interval: string): {
  lastClose: number;
  ema20: number | null;
  ema50: number | null;
  rsi14: number | null;
  volumeSpike: boolean;
  triggers: SignalTrigger[];
} {
  const closes = candles.map((c) => c.close);
  const volumes = candles.map((c) => c.volume);
  const e20 = ema(closes, 20);
  const e50 = ema(closes, 50);
  const r14 = rsi(closes, 14);
  const i = closes.length - 1;
  const lastClose = closes[i] ?? 0;
  const ema20v = e20[i] ?? null;
  const ema50v = e50[i] ?? null;
  const rsiV = r14[i] ?? null;

  const volWindow = volumes.slice(-21, -1);
  const avgVol =
    volWindow.length > 0 ? volWindow.reduce((a, b) => a + b, 0) / volWindow.length : 0;
  const lastVol = volumes[i] ?? 0;
  const volumeSpike = avgVol > 0 && lastVol > avgVol * 2;

  const triggers: SignalTrigger[] = [];
  const prevE20 = e20[i - 1];
  const prevE50 = e50[i - 1];
  if (
    ema20v != null &&
    ema50v != null &&
    prevE20 != null &&
    prevE50 != null &&
    prevE20 <= prevE50 &&
    ema20v > ema50v
  ) {
    triggers.push({
      id: "ema_cross_bull",
      severity: "bullish",
      title: `${symbol} · Bullish EMA cross (${interval})`,
      detail: `EMA20 crossed above EMA50. Close ${lastClose.toFixed(4)}.`,
    });
  }
  if (
    ema20v != null &&
    ema50v != null &&
    prevE20 != null &&
    prevE50 != null &&
    prevE20 >= prevE50 &&
    ema20v < ema50v
  ) {
    triggers.push({
      id: "ema_cross_bear",
      severity: "bearish",
      title: `${symbol} · Bearish EMA cross (${interval})`,
      detail: `EMA20 crossed below EMA50. Close ${lastClose.toFixed(4)}.`,
    });
  }
  if (rsiV != null && rsiV < 30) {
    triggers.push({
      id: "rsi_oversold",
      severity: "bullish",
      title: `${symbol} · RSI oversold`,
      detail: `RSI(14)=${rsiV.toFixed(1)} (<30). Not financial advice.`,
    });
  }
  if (rsiV != null && rsiV > 70) {
    triggers.push({
      id: "rsi_overbought",
      severity: "bearish",
      title: `${symbol} · RSI overbought`,
      detail: `RSI(14)=${rsiV.toFixed(1)} (>70). Not financial advice.`,
    });
  }
  if (volumeSpike) {
    triggers.push({
      id: "volume_spike",
      severity: "info",
      title: `${symbol} · Volume spike`,
      detail: `Last volume ${lastVol.toFixed(0)} vs avg ${avgVol.toFixed(0)} (~2×).`,
    });
  }
  if (triggers.length === 0) {
    triggers.push({
      id: "neutral",
      severity: "info",
      title: `${symbol} · No strong trigger`,
      detail: `EMA20=${ema20v?.toFixed(4) ?? "—"}, EMA50=${ema50v?.toFixed(4) ?? "—"}, RSI=${rsiV?.toFixed(1) ?? "—"}.`,
    });
  }

  return { lastClose, ema20: ema20v, ema50: ema50v, rsi14: rsiV, volumeSpike, triggers };
}

/** Fetch public Binance USDT klines (no API key). */
export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit = 120,
): Promise<Candle[]> {
  const pair = symbol.replace("/", "").toUpperCase();
  const url = `https://api.binance.com/api/v3/klines?symbol=${encodeURIComponent(pair)}&interval=${encodeURIComponent(interval)}&limit=${limit}`;
  const res = await fetch(url, { next: { revalidate: 30 } });
  if (!res.ok) {
    throw new Error(`Binance ${res.status}`);
  }
  const raw = (await res.json()) as unknown[];
  return raw.map((row) => {
    const r = row as (string | number)[];
    return {
      time: Number(r[0]),
      open: Number(r[1]),
      high: Number(r[2]),
      low: Number(r[3]),
      close: Number(r[4]),
      volume: Number(r[5]),
    };
  });
}
