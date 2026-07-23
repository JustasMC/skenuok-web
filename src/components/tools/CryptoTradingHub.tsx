"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { AffiliateProductCard } from "@/components/affiliates/AffiliateProductCard";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { affiliatesForMarket } from "@/lib/affiliates/catalog";
import { fingerprintHeaders } from "@/lib/device-fingerprint";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT"] as const;
const INTERVALS = ["15m", "1h", "4h"] as const;

type SetupPayload = {
  lastClose?: number;
  ema20?: number | null;
  ema50?: number | null;
  rsi14?: number | null;
  volumeSpike?: boolean;
  setup?: {
    trend: string;
    momentum: string;
    orderFlow: string;
    capitalFlow: string;
    confirmations: number;
  };
  risk?: {
    entryZone: { low: number; high: number };
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskReward: number;
    riskPct: number;
  };
  validation?: {
    setupScore: string;
    validated: boolean;
    bias: string;
    reasons: string[];
  };
  candles?: { t: number; c: number }[];
  error?: string;
};

type AlertRow = {
  id: string;
  source: string;
  symbol: string;
  interval: string | null;
  title: string;
  message: string;
  severity: string;
  createdAt: string;
};

type ChartAnalysis = {
  structure: string;
  patterns: string[];
  support: (number | string)[];
  resistance: (number | string)[];
  entryZone: string | { low?: number; high?: number };
  invalidation: number | string;
  takeProfit: number | string | (number | string)[];
  riskReward: number | string;
  setupScore: string;
  bias: string;
  summaryLt: string;
  summaryEn: string;
};

type Props = { adSlot?: ReactNode };

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]/50 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-zinc-100">{value}</p>
    </div>
  );
}

export function CryptoTradingHub({ adSlot }: Props) {
  const { locale } = useLocale();
  const dict = useDict();
  const t = dict.cryptoHub;
  const [symbol, setSymbol] = useState<(typeof SYMBOLS)[number]>("BTCUSDT");
  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("15m");
  const [setup, setSetup] = useState<SetupPayload | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [alertStatus, setAlertStatus] = useState<{
    telegram: boolean;
    tradingViewWebhook: boolean;
    cron: boolean;
  } | null>(null);
  const [visionBusy, setVisionBusy] = useState(false);
  const [vision, setVision] = useState<ChartAnalysis | null>(null);
  const [visionSummary, setVisionSummary] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);

  const loadSetup = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      await fetch("/api/session", {
        credentials: "include",
        headers: fingerprintHeaders(),
      }).catch(() => {});
      const q = new URLSearchParams({ symbol, interval });
      const res = await fetch(`/api/crypto/setup?${q}`);
      const data = (await res.json()) as SetupPayload;
      if (!res.ok) {
        setError(data.error ?? t.loadError);
        return;
      }
      setSetup(data);
    } catch {
      setError(t.networkError);
    } finally {
      setBusy(false);
    }
  }, [symbol, interval, t.loadError, t.networkError]);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/crypto/alerts?limit=20");
      const data = (await res.json()) as {
        alerts?: AlertRow[];
        status?: { telegram: boolean; tradingViewWebhook: boolean; cron: boolean };
      };
      if (res.ok) {
        setAlerts(data.alerts ?? []);
        setAlertStatus(data.status ?? null);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    void loadSetup();
  }, [loadSetup]);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  async function onChartFile(file: File | null) {
    if (!file) return;
    setVisionBusy(true);
    setError(null);
    setVision(null);
    setVisionSummary(null);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("read"));
        reader.readAsDataURL(file);
      });
      const res = await fetch("/api/chart-scan", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...fingerprintHeaders() },
        body: JSON.stringify({
          imageDataUrl: dataUrl,
          symbol,
          timeframe: interval,
          locale,
        }),
      });
      const data = (await res.json()) as {
        error?: string;
        analysis?: ChartAnalysis;
        summary?: string;
        creditsLeft?: number;
      };
      if (!res.ok) {
        setError(data.error ?? t.visionError);
        return;
      }
      setVision(data.analysis ?? null);
      setVisionSummary(data.summary ?? null);
      if (data.creditsLeft != null) setCreditsLeft(data.creditsLeft);
    } catch {
      setError(t.networkError);
    } finally {
      setVisionBusy(false);
    }
  }

  const partners = affiliatesForMarket("signals", locale);
  const candles = setup?.candles ?? [];
  const maxC = Math.max(...candles.map((c) => c.c), 1);
  const minC = Math.min(...candles.map((c) => c.c), 0);

  return (
    <div className="space-y-10">
      {adSlot}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-3">
          <label className="block text-xs text-zinc-500">
            {t.symbol}
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value as (typeof SYMBOLS)[number])}
              className="mt-1 block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white"
            >
              {SYMBOLS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-xs text-zinc-500">
            {t.interval}
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as (typeof INTERVALS)[number])}
              className="mt-1 block rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-white"
            >
              {INTERVALS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() => void loadSetup()}
            className="site-btn-primary self-end rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
          >
            {busy ? t.refreshing : t.refresh}
          </button>
        </div>
        <Link href="/academy/patterns" className="site-link-inline text-sm">
          {t.academyLink}
        </Link>
      </div>

      {error ? (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </p>
      ) : null}

      {setup?.validation ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className={`rounded-md px-2.5 py-1 text-xs font-bold tracking-wide ${
                setup.validation.validated
                  ? "bg-[color-mix(in_oklab,var(--color-lime)_25%,transparent)] text-[var(--color-lime)]"
                  : "bg-zinc-800 text-zinc-400"
              }`}
            >
              {t.score}: {setup.validation.setupScore}
            </span>
            <span className="text-sm text-zinc-400">
              {t.bias}: {setup.validation.bias}
              {setup.validation.validated ? ` · ${t.validated}` : ` · ${t.notValidated}`}
            </span>
            {setup.lastClose != null ? (
              <span className="font-mono text-sm text-white">{setup.lastClose}</span>
            ) : null}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Metric label={t.trend} value={setup.setup?.trend ?? "—"} />
            <Metric label={t.momentum} value={setup.setup?.momentum ?? "—"} />
            <Metric label={t.orderFlow} value={setup.setup?.orderFlow ?? "—"} />
            <Metric label={t.capitalFlow} value={setup.setup?.capitalFlow ?? "—"} />
          </div>

          {setup.risk ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label={t.entry}
                value={`${setup.risk.entryZone.low} – ${setup.risk.entryZone.high}`}
              />
              <Metric label={t.stopLoss} value={String(setup.risk.stopLoss)} />
              <Metric
                label={t.takeProfit}
                value={`${setup.risk.takeProfit1} / ${setup.risk.takeProfit2}`}
              />
              <Metric label={t.rr} value={`${setup.risk.riskReward}R (${setup.risk.riskPct}%)`} />
            </div>
          ) : null}

          {setup.validation.reasons?.length ? (
            <p className="text-sm text-zinc-400">{setup.validation.reasons.join(" · ")}</p>
          ) : null}

          {candles.length > 0 ? (
            <div
              className="flex h-24 items-end gap-px overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-2"
              aria-hidden
            >
              {candles.map((c) => {
                const h = ((c.c - minC) / (maxC - minC || 1)) * 100;
                return (
                  <div
                    key={c.t}
                    className="flex-1 rounded-sm bg-[color-mix(in_oklab,var(--color-electric)_55%,transparent)]"
                    style={{ height: `${Math.max(8, h)}%` }}
                  />
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-lg font-semibold text-white">{t.visionTitle}</h3>
        <p className="mt-1 text-sm text-zinc-400">{t.visionBody}</p>
        <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-[var(--color-border)] px-4 py-3 text-sm text-zinc-300 hover:border-[var(--color-electric)]/50">
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={visionBusy}
            onChange={(e) => void onChartFile(e.target.files?.[0] ?? null)}
          />
          {visionBusy ? t.visionLoading : t.visionCta}
        </label>
        {creditsLeft != null ? (
          <p className="mt-2 text-sm text-[var(--color-lime)]">
            {t.creditsLeft.replace("{n}", String(creditsLeft))}
          </p>
        ) : null}
        {vision ? (
          <div className="mt-4 space-y-3 text-sm">
            {visionSummary ? (
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-200">{visionSummary}</p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              <Metric label={t.score} value={vision.setupScore} />
              <Metric label={t.bias} value={vision.bias} />
              <Metric
                label={t.entry}
                value={
                  typeof vision.entryZone === "string"
                    ? vision.entryZone
                    : `${vision.entryZone.low ?? "—"} – ${vision.entryZone.high ?? "—"}`
                }
              />
              <Metric label={t.stopLoss} value={String(vision.invalidation)} />
              <Metric label={t.rr} value={String(vision.riskReward)} />
              <Metric
                label={t.patterns}
                value={vision.patterns.length ? vision.patterns.join(", ") : "—"}
              />
            </div>
            <p className="text-zinc-400">
              <span className="text-zinc-500">{t.structure}: </span>
              {vision.structure}
            </p>
          </div>
        ) : null}
        <p className="mt-4 text-xs text-zinc-500">{t.disclaimer}</p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-white">{t.alertsTitle}</h3>
          {alertStatus ? (
            <p className="text-xs text-zinc-500">
              TG {alertStatus.telegram ? "●" : "○"} · TV{" "}
              {alertStatus.tradingViewWebhook ? "●" : "○"} · Cron{" "}
              {alertStatus.cron ? "●" : "○"}
            </p>
          ) : null}
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.alertsEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium text-zinc-100">{a.title}</p>
                  <time className="text-[10px] text-zinc-500">
                    {new Date(a.createdAt).toLocaleString(locale === "en" ? "en-US" : "lt-LT")}
                  </time>
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-zinc-400">{a.message}</p>
                <p className="mt-1 text-[10px] uppercase tracking-wide text-zinc-600">
                  {a.source} · {a.symbol}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {partners.length > 0 ? (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
            {t.partners}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {partners.map((a) => (
              <AffiliateProductCard key={a.slug} item={a} locale={locale} />
            ))}
          </div>
        </div>
      ) : null}

      <p className="text-center text-sm">
        <Link href="/pricing" className="site-link-inline">
          {t.pricing}
        </Link>
      </p>
    </div>
  );
}
