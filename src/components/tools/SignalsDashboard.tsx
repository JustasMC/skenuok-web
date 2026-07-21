"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AffiliateProductCard } from "@/components/affiliates/AffiliateProductCard";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { affiliatesForMarket } from "@/lib/affiliates/catalog";
import { fingerprintHeaders } from "@/lib/device-fingerprint";

type Trigger = {
  id: string;
  severity: "info" | "bullish" | "bearish";
  title: string;
  detail: string;
};

type Snapshot = {
  ok?: boolean;
  symbol?: string;
  interval?: string;
  lastClose?: number;
  ema20?: number | null;
  ema50?: number | null;
  rsi14?: number | null;
  volumeSpike?: boolean;
  triggers?: Trigger[];
  candles?: { t: number; c: number; v: number }[];
  error?: string;
};

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT"] as const;
const INTERVALS = ["15m", "1h", "4h"] as const;

type Props = { adSlot?: ReactNode };

export function SignalsDashboard({ adSlot }: Props) {
  const { locale } = useLocale();
  const dict = useDict();
  const t = dict.signals;
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>("BTCUSDT");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("15m");
  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/session", {
        method: "GET",
        credentials: "include",
        headers: fingerprintHeaders(),
      }).catch(() => {});
      const res = await fetch(
        `/api/signals?symbol=${encodeURIComponent(symbol)}&interval=${encodeURIComponent(interval)}`,
      );
      const data = (await res.json()) as Snapshot;
      if (!res.ok) {
        setError(data.error ?? t.loadError);
        setSnap(null);
        return;
      }
      setSnap(data);
    } catch {
      setError(t.networkError);
    } finally {
      setBusy(false);
    }
  }, [symbol, interval, t.loadError, t.networkError]);

  useEffect(() => {
    void load();
  }, [load]);

  async function runAi() {
    setAiBusy(true);
    setError(null);
    setAiSummary(null);
    try {
      const res = await fetch("/api/signals/analyze", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...fingerprintHeaders() },
        body: JSON.stringify({ symbol, interval, locale }),
      });
      const data = (await res.json()) as {
        error?: string;
        needCredits?: boolean;
        summary?: string;
        creditsLeft?: number;
      };
      if (!res.ok) {
        setError(data.error ?? t.aiError);
        return;
      }
      setAiSummary(data.summary ?? null);
      if (typeof data.creditsLeft === "number") setCreditsLeft(data.creditsLeft);
    } catch {
      setError(t.networkError);
    } finally {
      setAiBusy(false);
    }
  }

  const maxC = snap?.candles?.length
    ? Math.max(...snap.candles.map((c) => c.c))
    : 1;
  const minC = snap?.candles?.length
    ? Math.min(...snap.candles.map((c) => c.c))
    : 0;
  const range = Math.max(maxC - minC, 1e-9);

  return (
    <div className="space-y-8">
      {adSlot}

      <div className="flex flex-wrap gap-2">
        {SYMBOLS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSymbol(s)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              symbol === s
                ? "border-[var(--color-electric)] text-white"
                : "border-[var(--color-border)] text-zinc-400"
            }`}
          >
            {s.replace("USDT", "/USDT")}
          </button>
        ))}
        <span className="mx-1 hidden h-8 w-px bg-[var(--color-border)] sm:inline-block" />
        {INTERVALS.map((iv) => (
          <button
            key={iv}
            type="button"
            onClick={() => setInterval(iv)}
            className={`rounded-lg border px-3 py-1.5 text-sm ${
              interval === iv
                ? "border-[var(--color-lime)] text-white"
                : "border-[var(--color-border)] text-zinc-400"
            }`}
          >
            {iv}
          </button>
        ))}
        <button
          type="button"
          onClick={() => void load()}
          disabled={busy}
          className="site-btn-secondary rounded-lg px-3 py-1.5 text-sm disabled:opacity-50"
        >
          {busy ? t.refreshing : t.refresh}
        </button>
      </div>

      {error ? (
        <p className="text-sm text-rose-400" role="alert">
          {error}{" "}
          {error.includes("kredit") || error.toLowerCase().includes("credit") ? (
            <Link href="/pricing" className="site-link-inline">
              {t.pricing}
            </Link>
          ) : null}
        </p>
      ) : null}

      {snap ? (
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 lg:col-span-2">
            <p className="text-xs uppercase tracking-wide text-zinc-500">{t.chartHint}</p>
            <div className="mt-3 flex h-40 items-end gap-0.5">
              {(snap.candles ?? []).map((c) => {
                const h = ((c.c - minC) / range) * 100;
                return (
                  <div
                    key={c.t}
                    className="min-w-0 flex-1 rounded-sm bg-[var(--color-electric)]/70"
                    style={{ height: `${Math.max(h, 4)}%` }}
                    title={`${c.c}`}
                  />
                );
              })}
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

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">{t.triggers}</h3>
            <ul className="space-y-2">
              {(snap.triggers ?? []).map((tr) => (
                <li
                  key={tr.id}
                  className={`rounded-lg border p-3 text-sm ${
                    tr.severity === "bullish"
                      ? "border-[var(--color-lime)]/40 bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)]"
                      : tr.severity === "bearish"
                        ? "border-rose-500/40 bg-rose-500/10"
                        : "border-[var(--color-border)] bg-[var(--color-surface)]"
                  }`}
                >
                  <p className="font-medium text-zinc-100">{tr.title}</p>
                  <p className="mt-1 text-xs text-zinc-400">{tr.detail}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_30%,var(--color-border))] bg-[var(--color-surface)] p-5">
        <h3 className="text-lg font-semibold text-white">{t.aiTitle}</h3>
        <p className="mt-1 text-sm text-zinc-400">{t.aiBody}</p>
        <button
          type="button"
          disabled={aiBusy || busy}
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
        {aiSummary ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">{aiSummary}</p>
        ) : null}
        <p className="mt-4 text-xs text-zinc-500">{t.disclaimer}</p>
      </div>

      {(() => {
        const partners = affiliatesForMarket("signals", locale);
        if (partners.length === 0) return null;
        return (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
              {locale === "lt" ? "Partnerių pasiūlymai" : "Partner offers"}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {partners.map((a) => (
                <AffiliateProductCard key={a.slug} item={a} locale={locale} />
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
