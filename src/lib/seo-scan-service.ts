import { extractPageMeta } from "@/lib/lighthouse-meta";
import { getPageSpeedApiKey } from "@/lib/env";
import type { Locale } from "@/lib/i18n/config";
import { fetchPageHtmlSignals, type PageHtmlSignals } from "@/lib/page-html-signals";
import {
  buildAiScanAnalysis,
  buildFallbackInsights,
  buildFallbackSiteIdentity,
  extractCoreWebVitals,
  type ScanPageContext,
} from "@/lib/scan-insights";
import type { CategoryKey } from "@/lib/pagespeed";
import { normalizeUrlInput, runPageSpeedInsights } from "@/lib/pagespeed";
import { isAbortError } from "@/lib/route-abort";
import type { ScanRequest } from "@/lib/scan-schema";

export type SeoScanPageMeta = ReturnType<typeof extractPageMeta> & {
  h1: string | null;
  signals?: PageHtmlSignals;
};

export type SeoScanApiPayload = {
  ok: true;
  url: string;
  strategy: "mobile" | "desktop";
  scores: Record<CategoryKey, number | null>;
  insights: string[];
  insightsSource: "openai" | "fallback";
  siteTopic: string;
  siteDescription: string;
  page: SeoScanPageMeta;
  meta: {
    lighthouseVersion: string | null;
    fetchTime: string | null;
  };
};

export type SeoScanFailure = {
  ok: false;
  error: string;
  status: number;
};

export type RunSeoScanOptions = {
  signal?: AbortSignal;
  locale?: Locale;
  /** Skip OpenAI insights (PSI + HTML signals + heuristic tips only). Used by course scan to avoid double LLM. */
  skipAiInsights?: boolean;
};

/**
 * Shared PageSpeed + insights pipeline (URL scanner API and agent tool).
 */
export async function runSeoScan(
  validated: ScanRequest,
  opts?: RunSeoScanOptions,
): Promise<SeoScanApiPayload | SeoScanFailure> {
  const locale = opts?.locale ?? "lt";
  const apiKey = getPageSpeedApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Server is missing the PageSpeed API key. Add PSI_API_KEY to the environment."
          : "Serveris neturi PageSpeed API rakto. Pridėkite PSI_API_KEY į .env.",
      status: 503,
    };
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrlInput(validated.url);
  } catch {
    return {
      ok: false,
      error: locale === "en" ? "Invalid URL format" : "Neteisingas URL formatas",
      status: 422,
    };
  }

  let psi;
  try {
    psi = await runPageSpeedInsights({
      url: normalizedUrl,
      strategy: validated.strategy,
      apiKey,
      signal: opts?.signal,
    });
  } catch (e) {
    if (isAbortError(e)) {
      return {
        ok: false,
        error: locale === "en" ? "PageSpeed request aborted." : "PageSpeed užklausa nutraukta.",
        status: 502,
      };
    }
    const message = e instanceof Error ? e.message : locale === "en" ? "PageSpeed request failed" : "PageSpeed užklausa nepavyko";
    return { ok: false, error: message, status: 502 };
  }

  const meta = extractPageMeta(psi.raw);
  const scanUrl = psi.finalUrl ?? normalizedUrl;
  const htmlSignals = await fetchPageHtmlSignals(scanUrl, {
    signal: opts?.signal,
    timeoutMs: 12_000,
    acceptLanguage: locale === "en" ? "en,lt;q=0.5" : "lt,en;q=0.8",
  });
  const vitals = extractCoreWebVitals(psi.raw);

  const pageContext: ScanPageContext = {
    title: meta.title,
    description: meta.description,
    h1: htmlSignals.h1,
    keywords: meta.keywords,
    html: htmlSignals,
    vitals,
  };

  const page: SeoScanPageMeta = { ...meta, h1: htmlSignals.h1, signals: htmlSignals };

  let insights: string[];
  let insightsSource: "openai" | "fallback";
  let siteTopic: string;
  let siteDescription: string;

  if (opts?.skipAiInsights) {
    insights = buildFallbackInsights(psi.raw, psi.scores, locale, pageContext);
    insightsSource = "fallback";
    const fb = buildFallbackSiteIdentity(pageContext, locale);
    siteTopic = fb.siteTopic;
    siteDescription = fb.siteDescription;
  } else {
    try {
      const ai = await buildAiScanAnalysis(psi.raw, psi.scores, pageContext, locale);
      if (ai) {
        insights = ai.insights;
        insightsSource = "openai";
        siteTopic = ai.siteTopic;
        siteDescription = ai.siteDescription;
      } else {
        insights = buildFallbackInsights(psi.raw, psi.scores, locale, pageContext);
        insightsSource = "fallback";
        const fb = buildFallbackSiteIdentity(pageContext, locale);
        siteTopic = fb.siteTopic;
        siteDescription = fb.siteDescription;
      }
    } catch {
      insights = buildFallbackInsights(psi.raw, psi.scores, locale, pageContext);
      insightsSource = "fallback";
      const fb = buildFallbackSiteIdentity(pageContext, locale);
      siteTopic = fb.siteTopic;
      siteDescription = fb.siteDescription;
    }
  }

  return {
    ok: true,
    url: scanUrl,
    strategy: psi.strategy,
    scores: psi.scores,
    insights,
    insightsSource,
    siteTopic,
    siteDescription,
    page,
    meta: {
      lighthouseVersion: psi.lighthouseVersion,
      fetchTime: psi.fetchTimeMs,
    },
  };
}
