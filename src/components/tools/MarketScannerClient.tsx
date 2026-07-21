"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AffiliateProductCard } from "@/components/affiliates/AffiliateProductCard";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { affiliatesForMarket } from "@/lib/affiliates/catalog";
import { fingerprintHeaders } from "@/lib/device-fingerprint";
import type { MarketCategory, MarketInstrument } from "@/lib/markets/instruments";

type Trigger = { id: string; severity: string; title: string; detail: string };

type Props = { category: MarketCategory; adSlot?: ReactNode };

export function MarketScannerClient({ category, adSlot }: Props) {
  const { locale } = useLocale();
  const dict = useDict();
  const t = dict.markets;
  const [symbol, setSymbol] = useState<string>("");
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [snap, setSnap] = useState<{
    lastClose?: number;
    ema20?: number | null;
    ema50?: number | null;
    rsi14?: number | null;
    triggers?: Trigger[];
    candles?: { t: number; c: number }[];
    instrument?: MarketInstrument;
  } | null>(null);

  const load = useCallback(
    async (sym?: string) => {
      setBusy(true);
      setError(null);
      try {
        await fetch("/api/session", {
          credentials: "include",
          headers: fingerprintHeaders(),
        }).catch(() => {});
        const q = new URLSearchParams({ category });
        if (sym) q.set("symbol", sym);
        const res = await fetch(`/api/markets?${q.toString()}`);
        const data = (await res.json()) as {
          error?: string;
          instruments?: MarketInstrument[];
          instrument?: MarketInstrument;
          lastClose?: number;
          ema20?: number | null;
          ema50?: number | null;
          rsi14?: number | null;
          triggers?: Trigger[];
          candles?: { t: number; c: number }[];
        };
        if (!res.ok) {
          setError(data.error ?? t.loadError);
          return;
        }
        setInstruments(data.instruments ?? []);
        if (data.instrument) setSymbol(data.instrument.symbol);
        setSnap(data);
      } catch {
        setError(t.networkError);
      } finally {
        setBusy(false);
      }
    },
    [category, t.loadError, t.networkError],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function runAi() {
    if (!symbol) return;
    setAiBusy(true);
    setError(null);
    setSummary(null);
    try {
      const res = await fetch("/api/markets/analyze", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...fingerprintHeaders() },
        body: JSON.stringify({ symbol, category, locale }),
      });
      const data = (await res.json()) as {
        error?: string;
        summary?: string;
        creditsLeft?: number;
      };
      if (!res.ok) {
        setError(data.error ?? t.aiError);
        return;
      }
      setSummary(data.summary ?? null);
      if (typeof data.creditsLeft === "number") setCreditsLeft(data.creditsLeft);
    } catch {
      setError(t.networkError);
    } finally {
      setAiBusy(false);
    }
  }

  const maxC = snap?.candles?.length ? Math.max(...snap.candles.map((c) => c.c)) : 1;
  const minC = snap?.candles?.length ? Math.min(...snap.candles.map((c) => c.c)) : 0;
  const range = Math.max(maxC - minC, 1e-9);
  const affiliates = affiliatesForMarket(category, locale);

  return (
    <div className="space-y-8">
      {adSlot}

      <div className="flex flex-wrap gap-2">
        {instruments.map((i) => (
          <button
            key={i.symbol}
            type="button"
            onClick={() => {
              setSymbol(i.symbol);
              void load(i.symbol);
            }}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              symbol === i.symbol
                ? "border-[var(--color-electric)] text-white"
                : "border-[var(--color-border)] text-zinc-400"
            }`}
          >
            {i.label}
          </button>
        ))}
        <button
          type="button"
          disabled={busy}
          onClick={() => void load(symbol || undefined)}
          className="site-btn-secondary rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {busy ? t.refreshing : t.refresh}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-rose-400" role="alert">
          {error}{" "}
          <Link href="/pricing" className="site-link-inline">
            {t.pricing}
          </Link>
        </p>
      ) : null}

      {snap ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:col-span-2">
            <p className="text-xs text-zinc-500">
              {snap.instrument
                ? locale === "lt"
                  ? snap.instrument.hintLt
                  : snap.instrument.hintEn
                : null}
            </p>
            <div className="mt-3 flex h-36 items-end gap-0.5">
              {(snap.candles ?? []).map((c) => (
                <div
                  key={c.t}
                  className="min-w-0 flex-1 rounded-sm bg-[var(--color-lime)]/60"
                  style={{ height: `${Math.max(((c.c - minC) / range) * 100, 4)}%` }}
                />
              ))}
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-zinc-500">Close</dt>
                <dd className="font-mono text-zinc-100">{snap.lastClose?.toFixed(4)}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">EMA20</dt>
                <dd className="font-mono text-zinc-100">{snap.ema20?.toFixed(4) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">EMA50</dt>
                <dd className="font-mono text-zinc-100">{snap.ema50?.toFixed(4) ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">RSI14</dt>
                <dd className="font-mono text-zinc-100">{snap.rsi14?.toFixed(1) ?? "—"}</dd>
              </div>
            </dl>
          </div>
          <ul className="space-y-2">
            {(snap.triggers ?? []).map((tr) => (
              <li
                key={tr.id}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 text-sm"
              >
                <p className="font-medium text-zinc-100">{tr.title}</p>
                <p className="mt-1 text-xs text-zinc-400">{tr.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-lg font-semibold text-white">{t.aiTitle}</h3>
        <p className="mt-1 text-sm text-zinc-400">{t.aiBody}</p>
        <button
          type="button"
          disabled={aiBusy || !symbol}
          onClick={() => void runAi()}
          className="site-btn-primary mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {aiBusy ? t.aiLoading : t.aiCta}
        </button>
        {creditsLeft != null ? (
          <p className="mt-2 text-sm text-[var(--color-lime)]">
            {t.creditsLeft.replace("{n}", String(creditsLeft))}
          </p>
        ) : null}
        {summary ? (
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-200">{summary}</p>
        ) : null}
        <p className="mt-4 text-xs text-zinc-500">{t.disclaimer}</p>
      </div>

      {affiliates.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {t.partners}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {affiliates.map((a) => (
              <AffiliateProductCard key={a.slug} item={a} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
