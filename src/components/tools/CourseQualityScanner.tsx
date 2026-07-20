"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import type { FreeAlternativesBundle } from "@/lib/verify-free-alternatives";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LegalDisclaimer } from "@/components/LegalDisclaimer";
import { CourseVerdictBadge } from "@/components/tools/CourseVerdictBadge";
import { InstructorBadge } from "@/components/tools/InstructorBadge";
import { InstructorTrustStrip } from "@/components/tools/InstructorTrustStrip";
import { TrustSummaryStrip } from "@/components/tools/TrustSummaryStrip";
import { ScoreRing } from "@/components/tools/ScoreRing";
import type { SkepticVerdict } from "@/lib/course-skeptic-types";
import type { InstructorPresence } from "@/lib/course-quality-scan";
import { buildGeneratorUrl } from "@/lib/generator-deeplink";

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

type Pillar = {
  key: string;
  label: string;
  score: number;
  comment: string;
};

type CheckItem = { ok: boolean; text: string };

type VerdictRec = "search_free" | "consider" | "likely_fair" | "unclear";

function estimateModuleCount(text: string): number {
  const m = text.match(/\d+/g);
  if (!m) return 0;
  return m.map((n) => Number.parseInt(n, 10)).filter(Number.isFinite).reduce((a, b) => a + b, 0);
}

function getPriceAiInsight(
  input: {
    priceText: string | null;
    priceQuality: number | null;
    syllabusSummary: string;
  },
  labels: {
    noPrice: string;
    raisePrice: string;
    marketAverage: string;
    highPrice: string;
    default: string;
  },
): string {
  const p = input.priceQuality;
  const modules = estimateModuleCount(input.syllabusSummary);
  if (!input.priceText) return labels.noPrice;
  if (modules >= 12 && (p == null || p < 70)) return labels.raisePrice;
  if (p != null && p >= 75) return labels.marketAverage;
  if (p != null && p < 45) return labels.highPrice;
  return labels.default;
}

export function CourseQualityScanner() {
  const t = useDict().tools.course;
  const r = useDict().tools.courseReport;
  const { locale } = useLocale();
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ScanScores | null>(null);
  const [meta, setMeta] = useState<{ lighthouseVersion: string | null; fetchTime: string | null } | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [page, setPage] = useState<{
    title: string | null;
    description: string | null;
    keywords: string[];
  } | null>(null);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [checklist, setChecklist] = useState<CheckItem[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [assessmentSource, setAssessmentSource] = useState<"openai" | "fallback" | null>(null);
  const [valueIndex, setValueIndex] = useState<number | null>(null);
  const [valueMetrics, setValueMetrics] = useState<{
    uniqueKnowledge: number;
    structureValue: number;
    priceQuality: number;
  } | null>(null);
  const [marketVerdict, setMarketVerdict] = useState<{
    headline: string;
    recommendation: VerdictRec;
    body: string;
  } | null>(null);
  const [extractedOffer, setExtractedOffer] = useState<{
    priceText: string | null;
    syllabusSummary: string;
    outcomesSummary: string;
  } | null>(null);
  const [pageScrape, setPageScrape] = useState<
    { ok: true; charCount: number; truncated: boolean } | { ok: false; error: string } | null
  >(null);
  const [searchTopics, setSearchTopics] = useState<string[]>([]);
  const [freeAlternatives, setFreeAlternatives] = useState<FreeAlternativesBundle | null>(null);
  const [skepticVerdict, setSkepticVerdict] = useState<SkepticVerdict | null>(null);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [priceBenchmarkAnalysis, setPriceBenchmarkAnalysis] = useState<string | null>(null);
  const [contentQualityAssessment, setContentQualityAssessment] = useState<string | null>(null);
  const [skepticFinalRecommendation, setSkepticFinalRecommendation] = useState<string | null>(null);
  const [instructorIdentity, setInstructorIdentity] = useState<string | null>(null);
  const [instructorPresence, setInstructorPresence] = useState<InstructorPresence | null>(null);
  const [instructorCredentialsHint, setInstructorCredentialsHint] = useState<string | null>(null);
  const [instructorAnalysis, setInstructorAnalysis] = useState<string | null>(null);
  const [creditsLeft, setCreditsLeft] = useState<number | null>(null);
  const [creditsCharged, setCreditsCharged] = useState<number | null>(null);
  const [authGate, setAuthGate] = useState<"none" | "login" | "credits">("none");

  const generatorHref = useMemo(() => {
    if (!extractedOffer) return null;
    const topicBase = page?.title?.trim() || r.criteria.generatorTopicDefault;
    const topic = `${topicBase}${r.criteria.generatorTopicSuffix}`;
    const context = extractedOffer.syllabusSummary || extractedOffer.outcomesSummary || scannedUrl || null;
    const tone = extractedOffer.outcomesSummary || page?.description || null;
    return buildGeneratorUrl(topic, context, tone);
  }, [extractedOffer, page?.title, page?.description, scannedUrl, r.criteria]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScores(null);
    setMeta(null);
    setScannedUrl(null);
    setPage(null);
    setOverallScore(null);
    setPillars([]);
    setChecklist([]);
    setSummary(null);
    setAssessmentSource(null);
    setValueIndex(null);
    setValueMetrics(null);
    setMarketVerdict(null);
    setExtractedOffer(null);
    setPageScrape(null);
    setSearchTopics([]);
    setFreeAlternatives(null);
    setSkepticVerdict(null);
    setRedFlags([]);
    setPriceBenchmarkAnalysis(null);
    setContentQualityAssessment(null);
    setSkepticFinalRecommendation(null);
    setInstructorIdentity(null);
    setInstructorPresence(null);
    setInstructorCredentialsHint(null);
    setInstructorAnalysis(null);
    setCreditsLeft(null);
    setCreditsCharged(null);
    setAuthGate("none");

    try {
      const res = await fetch("/api/course-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, strategy, locale }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        scores?: ScanScores;
        url?: string;
        page?: { title: string | null; description: string | null; keywords: string[] };
        meta?: { lighthouseVersion: string | null; fetchTime: string | null };
        overallScore?: number;
        pillars?: Pillar[];
        checklist?: CheckItem[];
        summary?: string;
        assessmentSource?: "openai" | "fallback";
        valueIndex?: number;
        valueMetrics?: { uniqueKnowledge: number; structureValue: number; priceQuality: number };
        marketVerdict?: { headline: string; recommendation: VerdictRec; body: string };
        extractedOffer?: { priceText: string | null; syllabusSummary: string; outcomesSummary: string };
        pageScrape?: { ok: true; charCount: number; truncated: boolean } | { ok: false; error: string };
        searchTopics?: string[];
        freeAlternatives?: FreeAlternativesBundle;
        skepticVerdict?: SkepticVerdict;
        redFlags?: string[];
        priceBenchmarkAnalysis?: string;
        contentQualityAssessment?: string;
        skepticFinalRecommendation?: string;
        instructorIdentity?: string;
        instructorPresence?: InstructorPresence;
        instructorCredentialsHint?: string;
        instructorAnalysis?: string;
        creditsLeft?: number;
        creditsCharged?: number;
        needSession?: boolean;
        needCredits?: boolean;
        creditsRequired?: number;
        credits?: number;
      };

      if (res.status === 401) {
        setAuthGate("login");
        setError(body.error ?? t.loginRequired);
        return;
      }
      if (res.status === 402) {
        setAuthGate("credits");
        setError(
          body.error ??
            `${t.fail} (${body.creditsRequired ?? "?"}/${body.credits ?? 0}).`,
        );
        return;
      }

      if (!res.ok) {
        setError(body.error ?? t.fail);
        return;
      }

      if (typeof body.creditsLeft === "number") setCreditsLeft(body.creditsLeft);
      if (typeof body.creditsCharged === "number") setCreditsCharged(body.creditsCharged);

      if (body.scores) setScores(body.scores);
      if (body.meta) setMeta(body.meta);
      if (body.url) setScannedUrl(body.url);
      setPage(body.page ?? { title: null, description: null, keywords: [] });
      if (typeof body.overallScore === "number") setOverallScore(body.overallScore);
      if (body.pillars) setPillars(body.pillars);
      if (body.checklist) setChecklist(body.checklist);
      if (body.summary) setSummary(body.summary);
      if (body.assessmentSource) setAssessmentSource(body.assessmentSource);
      if (typeof body.valueIndex === "number") setValueIndex(body.valueIndex);
      if (body.valueMetrics) setValueMetrics(body.valueMetrics);
      if (body.marketVerdict) setMarketVerdict(body.marketVerdict);
      if (body.extractedOffer) setExtractedOffer(body.extractedOffer);
      if (body.pageScrape) setPageScrape(body.pageScrape);
      if (body.searchTopics) setSearchTopics(body.searchTopics);
      if (body.freeAlternatives) setFreeAlternatives(body.freeAlternatives);
      if (body.skepticVerdict) setSkepticVerdict(body.skepticVerdict);
      if (body.redFlags) setRedFlags(body.redFlags);
      if (body.priceBenchmarkAnalysis) setPriceBenchmarkAnalysis(body.priceBenchmarkAnalysis);
      if (body.contentQualityAssessment) setContentQualityAssessment(body.contentQualityAssessment);
      if (body.skepticFinalRecommendation) setSkepticFinalRecommendation(body.skepticFinalRecommendation);
      if (body.instructorIdentity) setInstructorIdentity(body.instructorIdentity);
      if (body.instructorPresence) setInstructorPresence(body.instructorPresence);
      if (body.instructorCredentialsHint) setInstructorCredentialsHint(body.instructorCredentialsHint);
      if (body.instructorAnalysis) setInstructorAnalysis(body.instructorAnalysis);
    } catch {
      setError(t.network);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-10">
      <Card>
        <CardHeader>
          <CardTitle>{t.cardTitle}</CardTitle>
          <CardDescription>{t.cardDesc}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-2">
              <label htmlFor="course-scan-url" className="text-sm font-medium text-zinc-300">
                {t.url}
              </label>
              <input
                id="course-scan-url"
                name="url"
                type="text"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.urlPlaceholder}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-electric)]"
                autoComplete="url"
              />
            </div>
            <div className="space-y-2 sm:w-44">
              <label htmlFor="course-scan-strategy" className="text-sm font-medium text-zinc-300">
                {t.strategy}
              </label>
              <select
                id="course-scan-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as "mobile" | "desktop")}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2.5 text-sm text-white outline-none focus:border-[var(--color-electric)]"
              >
                <option value="mobile">{t.mobile}</option>
                <option value="desktop">{t.desktop}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-[var(--color-electric)] px-6 py-2.5 text-sm font-semibold text-[#041014] shadow-[var(--shadow-glow)] transition hover:bg-[var(--color-electric-dim)] disabled:opacity-60"
            >
              {loading ? t.scanning : t.submit}
            </button>
          </form>
          {error ? (
            <div className="mt-4 space-y-2 text-sm text-rose-400">
              <p>{error}</p>
              {authGate === "login" ? (
                <p>
                  <Link href="/login" className="font-semibold text-[var(--color-electric)] hover:underline">
                    {t.login}
                  </Link>
                </p>
              ) : null}
              {authGate === "credits" ? (
                <p>
                  <Link href="/pricing" className="font-semibold text-[var(--color-electric)] hover:underline">
                    {t.buyCredits}
                  </Link>{" "}
                  {t.or}{" "}
                  <Link href="/dashboard" className="font-semibold text-zinc-300 hover:underline">
                    {t.dashboard}
                  </Link>
                  .
                </p>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      {scores && overallScore != null ? (
        <>
          {creditsCharged != null && creditsLeft != null ? (
            <p className="text-center text-sm text-zinc-400">
              {t.charged}{" "}
              <span className="font-mono font-semibold text-[var(--color-lime)]">{creditsCharged}</span>{" "}
              {creditsCharged === 1 ? t.creditOne : t.creditMany} · {t.left}{" "}
              <span className="font-mono font-semibold text-white">{creditsLeft}</span>
            </p>
          ) : null}
          {skepticVerdict && scores ? (
            <TrustSummaryStrip
              skepticVerdict={skepticVerdict}
              instructorPresence={instructorPresence}
              valueIndex={valueIndex}
              overallScore={overallScore}
              scores={scores}
            />
          ) : null}
          {skepticVerdict ? (
            <Card
              className={
                skepticVerdict === "SCAM"
                  ? "border-rose-500/40 bg-[color-mix(in_oklab,var(--color-bg)_88%,#9f1239_12%)]"
                  : skepticVerdict === "RIZIKA"
                    ? "border-orange-500/35 bg-[color-mix(in_oklab,var(--color-bg)_91%,#c2410c_9%)]"
                    : skepticVerdict === "SAUGU"
                      ? "border-[color-mix(in_oklab,var(--color-electric)_45%,transparent)] bg-[color-mix(in_oklab,var(--color-bg)_93%,var(--color-electric)_7%)]"
                      : "border-amber-500/25 bg-[color-mix(in_oklab,var(--color-bg)_92%,#b45309_8%)]"
              }
            >
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle className="text-white">{r.expertVerdict.title}</CardTitle>
                  <CourseVerdictBadge verdict={skepticVerdict} />
                  {instructorIdentity && instructorPresence ? (
                    <InstructorBadge
                      instructorIdentity={instructorIdentity}
                      instructorPresence={instructorPresence}
                      skepticVerdict={skepticVerdict}
                    />
                  ) : null}
                </div>
                <CardDescription className="text-zinc-400">{r.expertVerdict.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{r.expertVerdict.skepticLayer}</p>
                  <p className="mt-1 text-xs text-zinc-500">{r.expertVerdict.skepticHint}</p>
                </div>
                {priceBenchmarkAnalysis ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{r.expertVerdict.priceAssessment}</p>
                    <p className="mt-1 leading-relaxed text-zinc-200">{priceBenchmarkAnalysis}</p>
                  </div>
                ) : null}
                {contentQualityAssessment ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{r.expertVerdict.contentQuality}</p>
                    <p className="mt-1 leading-relaxed text-zinc-200">{contentQualityAssessment}</p>
                  </div>
                ) : null}
                {instructorAnalysis ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{r.expertVerdict.instructorAuthority}</p>
                    <p className="mt-1 leading-relaxed text-zinc-300">{instructorAnalysis}</p>
                  </div>
                ) : null}
                {redFlags.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-rose-300/90">{r.expertVerdict.redFlags}</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-rose-100/90">
                      {redFlags.map((f) => (
                        <li key={f}>{f}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {instructorIdentity && instructorPresence ? (
                  <InstructorTrustStrip
                    instructorIdentity={instructorIdentity}
                    instructorPresence={instructorPresence}
                    instructorCredentialsHint={instructorCredentialsHint ?? undefined}
                    freeAlternatives={freeAlternatives}
                  />
                ) : null}
                {skepticFinalRecommendation ? (
                  <div className="rounded-lg border border-zinc-700/60 bg-black/20 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{r.expertVerdict.skepticRecommendation}</p>
                    <p className="mt-1 font-medium leading-relaxed text-white">{skepticFinalRecommendation}</p>
                  </div>
                ) : null}

                {marketVerdict ? (
                  <div className="border-t border-zinc-700/50 pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-500">{r.expertVerdict.marketContext}</p>
                    <p className="mt-1 text-xs text-zinc-500">{r.expertVerdict.marketContextHint}</p>
                    <p className="mt-3 text-xs font-medium text-amber-200/80">{r.verdictRec[marketVerdict.recommendation]}</p>
                    <p className="mt-2 text-base font-semibold text-white">{marketVerdict.headline}</p>
                    <p className="mt-2 leading-relaxed text-zinc-400">{marketVerdict.body}</p>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : marketVerdict ? (
            <Card className="border-amber-500/25 bg-[color-mix(in_oklab,var(--color-bg)_92%,#b45309_8%)]">
              <CardHeader>
                <CardTitle className="text-amber-100/95">{r.marketVerdict.title}</CardTitle>
                <CardDescription className="text-amber-200/70">
                  {r.verdictRec[marketVerdict.recommendation]}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-lg font-semibold text-white">{marketVerdict.headline}</p>
                <p className="leading-relaxed text-zinc-300">{marketVerdict.body}</p>
              </CardContent>
            </Card>
          ) : null}

          {freeAlternatives ? (
            <Card
              className={
                freeAlternatives.status === "completed" &&
                valueIndex != null &&
                valueIndex < 40 &&
                freeAlternatives.topics.some((t) => t.items.length > 0)
                  ? "border-rose-500/35 bg-[color-mix(in_oklab,var(--color-bg)_90%,#991b1b_10%)]"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle>
                  {freeAlternatives.status === "completed" && freeAlternatives.serperMode === "full"
                    ? r.freeAlternatives.titleFull
                    : r.freeAlternatives.titleDefault}
                </CardTitle>
                <CardDescription>
                  {freeAlternatives.status === "skipped"
                    ? freeAlternatives.reason
                    : freeAlternatives.serperMode === "full"
                      ? r.freeAlternatives.descFull
                      : r.freeAlternatives.descRisk}
                </CardDescription>
              </CardHeader>
              {freeAlternatives.status === "completed" ? (
                <CardContent className="space-y-6 text-sm">
                  {searchTopics.length > 0 ? (
                    <p className="text-xs text-zinc-500">
                      {r.freeAlternatives.topicsLabel}{" "}
                      <span className="text-zinc-300">
                        {searchTopics.join(" · ")}
                      </span>
                    </p>
                  ) : null}
                  <p className="text-zinc-400">{freeAlternatives.note}</p>
                  <ul className="space-y-6">
                    {freeAlternatives.topics.map((block) => (
                      <li key={block.query}>
                        <p className="font-medium text-white">{block.topic}</p>
                        <p className="mt-1 font-mono text-[10px] text-zinc-600 break-all">{block.query}</p>
                        {block.items.length === 0 ? (
                          <p className="mt-2 text-amber-400/90">{r.freeAlternatives.noResults}</p>
                        ) : (
                          <ul className="mt-3 space-y-3 border-l border-[var(--color-border)] pl-4">
                            {block.items.map((it) => (
                              <li key={it.link}>
                                <a
                                  href={it.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-[var(--color-electric)] hover:underline"
                                >
                                  {it.title}
                                </a>
                                {it.snippet ? (
                                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">{it.snippet}</p>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              ) : null}
            </Card>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{r.overall.title}</CardTitle>
                <CardDescription>
                  {scannedUrl ? <span className="break-all text-zinc-400">{scannedUrl}</span> : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{r.overall.qualityIndex}</p>
                    <p className="mt-1 text-4xl font-semibold tabular-nums text-white">{overallScore}</p>
                    <p className="text-xs text-zinc-500">{r.overall.qualityIndexHint}</p>
                  </div>
                  {valueIndex != null ? (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{r.overall.valueIndex}</p>
                      <p className="mt-1 text-3xl font-semibold tabular-nums text-[var(--color-lime)]">{valueIndex}</p>
                      <p className="text-xs text-zinc-500">{r.overall.valueIndexHint}</p>
                    </div>
                  ) : null}
                  <ScoreRing label={r.overall.performance} value={scores.performance} />
                  <ScoreRing label={r.overall.seo} value={scores.seo} />
                  <ScoreRing label={r.overall.accessibility} value={scores.accessibility} />
                </div>
                {meta?.lighthouseVersion ? (
                  <p className="font-mono text-[10px] text-zinc-600">Lighthouse {meta.lighthouseVersion}</p>
                ) : null}
                {assessmentSource ? (
                  <p
                    className={`text-xs ${
                      assessmentSource === "fallback"
                        ? "rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-amber-200"
                        : "text-zinc-500"
                    }`}
                  >
                    {assessmentSource === "openai"
                      ? r.overall.assessmentOpenAi
                      : r.overall.assessmentFallback}
                  </p>
                ) : null}
                {pageScrape ? (
                  <p className="text-xs text-zinc-500">
                    {r.overall.htmlText}{" "}
                    {pageScrape.ok
                      ? `${r.overall.htmlChars.replace("{n}", String(pageScrape.charCount))} ${pageScrape.truncated ? r.overall.htmlTruncated : ""}`
                      : pageScrape.error}
                  </p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>{r.criteria.title}</CardTitle>
                <CardDescription>
                  {summary ? (
                    <span className="text-zinc-400">{summary}</span>
                  ) : (
                    r.criteria.defaultDesc
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {valueMetrics ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_50%,transparent)] p-3 text-sm">
                      <p className="text-xs text-zinc-500">{r.criteria.uniqueKnowledge}</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{valueMetrics.uniqueKnowledge}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_50%,transparent)] p-3 text-sm">
                      <p className="text-xs text-zinc-500">{r.criteria.structureValue}</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{valueMetrics.structureValue}</p>
                    </div>
                    <div className="rounded-lg border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_50%,transparent)] p-3 text-sm">
                      <p className="text-xs text-zinc-500">{r.criteria.priceQuality}</p>
                      <p className="mt-1 text-xl font-semibold tabular-nums text-white">{valueMetrics.priceQuality}</p>
                    </div>
                  </div>
                ) : null}

                {extractedOffer ? (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{r.criteria.extractedTitle}</p>
                    <div className="mt-3 overflow-hidden rounded-lg border border-[var(--color-border)]/80">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          <tr className="border-b border-[var(--color-border)]/70">
                            <th className="w-44 bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              {r.criteria.price}
                            </th>
                            <td className="px-3 py-2 text-white">
                              {extractedOffer.priceText ? (
                                <span className="text-[var(--color-lime)]">{extractedOffer.priceText}</span>
                              ) : (
                                <span className="text-zinc-500">{r.criteria.noPrice}</span>
                              )}
                            </td>
                          </tr>
                          <tr className="border-b border-[var(--color-border)]/70">
                            <th className="w-44 bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              {r.criteria.program}
                            </th>
                            <td className="px-3 py-2 text-zinc-300">{extractedOffer.syllabusSummary}</td>
                          </tr>
                          <tr>
                            <th className="w-44 bg-[var(--color-surface)] px-3 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                              {r.criteria.outcomes}
                            </th>
                            <td className="px-3 py-2 text-zinc-300">{extractedOffer.outcomesSummary}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-3 rounded-md border border-[color-mix(in_oklab,var(--color-electric)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_9%,var(--color-surface))] px-3 py-2.5">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">{r.criteria.priceInsightTitle}</p>
                      <p className="mt-1.5 text-sm leading-relaxed text-zinc-200">
                        {getPriceAiInsight(
                          {
                            priceText: extractedOffer.priceText,
                            priceQuality: valueMetrics?.priceQuality ?? null,
                            syllabusSummary: extractedOffer.syllabusSummary,
                          },
                          r.priceInsight,
                        )}
                      </p>
                    </div>
                    {generatorHref ? (
                      <div className="mt-4">
                        <Link href={generatorHref} className="site-btn-primary w-full sm:w-auto">
                          {r.criteria.generatorCta}
                        </Link>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                {page?.title || page?.description ? (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{r.criteria.metaTitle}</p>
                    {page.title ? <p className="mt-2 font-medium text-white">{page.title}</p> : null}
                    {page.description ? <p className="mt-2 text-zinc-400">{page.description}</p> : null}
                    {page.keywords.length > 0 ? (
                      <p className="mt-3 text-xs text-zinc-500">
                        {r.criteria.keywordsLabel}{" "}
                        <span className="text-[var(--color-electric)]">{page.keywords.join(", ")}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <ul className="space-y-4">
                  {pillars.map((p) => (
                    <li
                      key={p.key}
                      className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_50%,transparent)] p-4"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <p className="font-medium text-zinc-200">{p.label}</p>
                        <span className="tabular-nums text-sm text-[var(--color-lime)]">{p.score}/100</span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{p.comment}</p>
                    </li>
                  ))}
                </ul>

                {checklist.length > 0 ? (
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">{r.criteria.quickCheck}</p>
                    <ul className="mt-3 space-y-2 text-sm">
                      {checklist.map((c, i) => (
                        <li key={`${i}-${c.text.slice(0, 20)}`} className="flex gap-2 text-zinc-300">
                          <span className={c.ok ? "text-[var(--color-lime)]" : "text-amber-400/90"}>
                            {c.ok ? "✓" : "○"}
                          </span>
                          <span>{c.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_60%,transparent)] p-4 text-sm text-zinc-400">
                  <p className="font-medium text-zinc-200">{r.criteria.noteTitle}</p>
                  <p className="mt-2">
                    {r.criteria.noteBefore}{" "}
                    <Link href="/#kontaktai" className="font-semibold text-[var(--color-electric)] hover:underline">
                      {r.criteria.noteContact}
                    </Link>
                    {r.criteria.noteAfter}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <LegalDisclaimer />
        </>
      ) : null}
    </div>
  );
}
