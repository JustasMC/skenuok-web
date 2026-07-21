import type { Candle } from "@/lib/signals/ta";

type YahooChartResult = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          open?: (number | null)[];
          high?: (number | null)[];
          low?: (number | null)[];
          close?: (number | null)[];
          volume?: (number | null)[];
        }>;
      };
    }>;
    error?: unknown;
  };
};

/** Free Yahoo Finance chart endpoint (no API key). */
export async function fetchYahooCandles(
  symbol: string,
  range: "1mo" | "3mo" | "6mo" = "3mo",
  interval: "1d" | "1h" = "1d",
): Promise<Candle[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "skenuok-markets/1.0" },
    next: { revalidate: 300 },
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status} for ${symbol}`);
  const data = (await res.json()) as YahooChartResult;
  const result = data.chart?.result?.[0];
  const ts = result?.timestamp ?? [];
  const q = result?.indicators?.quote?.[0];
  if (!ts.length || !q?.close) throw new Error(`No data for ${symbol}`);

  const candles: Candle[] = [];
  for (let i = 0; i < ts.length; i++) {
    const close = q.close[i];
    if (close == null || !Number.isFinite(close)) continue;
    candles.push({
      time: (ts[i] ?? 0) * 1000,
      open: Number(q.open?.[i] ?? close),
      high: Number(q.high?.[i] ?? close),
      low: Number(q.low?.[i] ?? close),
      close: Number(close),
      volume: Number(q.volume?.[i] ?? 0),
    });
  }
  return candles;
}

export type MarketInstrument = {
  symbol: string;
  label: string;
  hintLt: string;
  hintEn: string;
};

export const ETF_INSTRUMENTS: MarketInstrument[] = [
  { symbol: "SPY", label: "S&P 500 (SPY)", hintLt: "JAV indeksas", hintEn: "US large-cap" },
  { symbol: "QQQ", label: "Nasdaq 100 (QQQ)", hintLt: "Tech sunkus", hintEn: "Tech-heavy" },
  { symbol: "VWCE.DE", label: "VWCE (UCITS)", hintLt: "Pasaulio ETF", hintEn: "World UCITS ETF" },
  { symbol: "VTI", label: "VTI", hintLt: "Visas JAV rinka", hintEn: "Total US market" },
];

export const METALS_INSTRUMENTS: MarketInstrument[] = [
  { symbol: "GC=F", label: "Gold", hintLt: "Auksas (futures)", hintEn: "Gold futures" },
  { symbol: "SI=F", label: "Silver", hintLt: "Sidabras", hintEn: "Silver futures" },
  { symbol: "CL=F", label: "WTI Oil", hintLt: "Nafta WTI", hintEn: "Crude oil WTI" },
  { symbol: "NG=F", label: "NatGas", hintLt: "Gamtinės dujos", hintEn: "Natural gas" },
];

export const FX_INSTRUMENTS: MarketInstrument[] = [
  { symbol: "EURUSD=X", label: "EUR/USD", hintLt: "ECB / FED kontekstas", hintEn: "ECB / Fed context" },
  { symbol: "GBPUSD=X", label: "GBP/USD", hintLt: "Svaras", hintEn: "Cable" },
  { symbol: "USDJPY=X", label: "USD/JPY", hintLt: "Jena", hintEn: "Yen pair" },
  { symbol: "EURGBP=X", label: "EUR/GBP", hintLt: "Euro / svaras", hintEn: "Euro / pound" },
];

export type MarketCategory = "etf" | "metals" | "fx";

export function instrumentsFor(category: MarketCategory): MarketInstrument[] {
  if (category === "etf") return ETF_INSTRUMENTS;
  if (category === "metals") return METALS_INSTRUMENTS;
  return FX_INSTRUMENTS;
}
