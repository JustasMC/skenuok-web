"use client";

import { lazy, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useDict } from "@/components/i18n/LocaleProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildGeneratorUrl, defaultGeneratorTopicFromScan } from "@/lib/generator-deeplink";
import type { ScanPayload } from "@/components/tools/TopicSuggestions";

const UrlScannerReport = lazy(() => import("@/components/tools/UrlScannerReport").then((m) => ({ default: m.UrlScannerReport })));

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

type PageMeta = {
  title: string | null;
  description: string | null;
  keywords: string[];
  h1: string | null;
};

export function UrlScanner() {
  const t = useDict().tools.scanner;
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ScanScores | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [source, setSource] = useState<"openai" | "fallback" | null>(null);
  const [meta, setMeta] = useState<{ lighthouseVersion: string | null; fetchTime: string | null } | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [page, setPage] = useState<PageMeta | null>(null);
  const [siteTopic, setSiteTopic] = useState<string | null>(null);
  const [siteDescription, setSiteDescription] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScores(null);
    setInsights([]);
    setSource(null);
    setMeta(null);
    setScannedUrl(null);
    setPage(null);
    setSiteTopic(null);
    setSiteDescription(null);

    try {
      const res = await fetch("/api/scan/heavy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, strategy }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        scores?: ScanScores;
        insights?: string[];
        insightsSource?: "openai" | "fallback";
        url?: string;
        siteTopic?: string;
        siteDescription?: string;
        page?: PageMeta;
        meta?: { lighthouseVersion: string | null; fetchTime: string | null };
      };

      if (!res.ok) {
        setError(body.error ?? t.fail);
        return;
      }

      if (body.scores) setScores(body.scores);
      if (body.insights) setInsights(body.insights);
      if (body.insightsSource) setSource(body.insightsSource);
      if (body.meta) setMeta(body.meta);
      if (body.url) setScannedUrl(body.url);
      setSiteTopic(body.siteTopic ?? null);
      setSiteDescription(body.siteDescription ?? null);
      setPage(body.page ?? { title: null, description: null, keywords: [], h1: null });
    } catch {
      setError(t.network);
    } finally {
      setLoading(false);
    }
  }

  const topicPayload: ScanPayload | null = useMemo(() => {
    if (!scores || !scannedUrl) return null;
    return {
      url: scannedUrl,
      title: page?.title ?? null,
      description: page?.description ?? null,
      keywords: page?.keywords ?? [],
      scores,
      insights,
    };
  }, [scores, scannedUrl, page, insights]);

  const generatorFromThemeHref = useMemo(() => {
    if (!scores || !scannedUrl) return null;
    let scannedHost: string | null = null;
    try {
      scannedHost = new URL(scannedUrl).hostname;
    } catch {
      scannedHost = null;
    }
    const topic = defaultGeneratorTopicFromScan({
      siteTopic,
      siteDescription,
      pageTitle: page?.title ?? null,
      pageH1: page?.h1 ?? null,
      scannedHost,
    });
    return buildGeneratorUrl(topic, siteTopic, siteDescription);
  }, [scores, scannedUrl, siteTopic, siteDescription, page]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <Card className="overflow-hidden border-[var(--color-border)]/80">
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>
            {t.cardDescBefore}{" "}
            <Link href="/#kontaktai" className="text-[var(--color-electric)] hover:underline">
              {t.cardDescContacts}
            </Link>{" "}
            {t.cardDescAfter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid gap-4 lg:grid-cols-12 lg:items-end">
            <div className="min-w-0 space-y-2 lg:col-span-7">
              <label htmlFor="scan-url" className="text-sm font-medium text-zinc-300">
                {t.url}
              </label>
              <input
                id="scan-url"
                name="url"
                type="text"
                inputMode="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.urlPlaceholder}
                className="site-input min-h-12 w-full text-base sm:min-h-11 sm:text-sm"
                autoComplete="url"
              />
            </div>
            <div className="w-full space-y-2 lg:col-span-2">
              <label htmlFor="scan-strategy" className="text-sm font-medium text-zinc-300">
                {t.strategy}
              </label>
              <select
                id="scan-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as "mobile" | "desktop")}
                className="site-input min-h-12 w-full cursor-pointer sm:min-h-11"
                aria-label={t.strategy}
              >
                <option value="mobile">{t.mobile}</option>
                <option value="desktop">{t.desktop}</option>
              </select>
            </div>
            <div className="lg:col-span-3">
              <button
                type="submit"
                disabled={loading}
                className="site-btn-primary w-full min-h-12 min-w-0 text-[#001018] sm:min-h-11"
              >
                {loading ? t.scanning : t.run}
              </button>
            </div>
          </form>
          {error ? (
            <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {scores ? (
        <Suspense
          fallback={
            <div className="min-h-[26rem] animate-pulse rounded-2xl border border-[var(--color-border)]/50 bg-[var(--color-surface)]/30" />
          }
        >
          <UrlScannerReport
            scores={scores}
            scannedUrl={scannedUrl}
            insights={insights}
            source={source}
            meta={meta}
            page={page}
            siteTopic={siteTopic}
            siteDescription={siteDescription}
            generatorFromThemeHref={generatorFromThemeHref}
            topicPayload={topicPayload}
          />
        </Suspense>
      ) : null}
    </div>
  );
}
