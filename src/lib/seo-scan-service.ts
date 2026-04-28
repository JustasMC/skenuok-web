import { extractPageMeta } from "@/lib/lighthouse-meta";
import { getPageSpeedApiKey } from "@/lib/env";
import { fetchPageHtmlSignals } from "@/lib/page-html-signals";
import {
  buildAiScanAnalysis,
  buildFallbackInsights,
  buildFallbackSiteIdentity,
  type ScanPageContext,
} from "@/lib/scan-insights";
import type { CategoryKey } from "@/lib/pagespeed";
import { normalizeUrlInput, runPageSpeedInsights } from "@/lib/pagespeed";
import { isAbortError } from "@/lib/route-abort";
import type { ScanRequest } from "@/lib/scan-schema";

export type SeoScanPageMeta = ReturnType<typeof extractPageMeta> & { h1: string | null };

export type SeoScanApiPayload = {
  ok: true;
  url: string;
  strategy: "mobile" | "desktop";
  scores: Record<CategoryKey, number | null>;
  insights: string[];
  insightsSource: "openai" | "fallback";
  /** Trumpa veiklos etiketė ir 1–2 sakinių santrauka (OpenAI arba heuristika). */
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
  /** Suggested HTTP status for API routes */
  status: number;
};

/**
 * Bendras PageSpeed + įžvalgų pipeline (naudoja /api/scan ir agento įrankis).
 */
export async function runSeoScan(
  validated: ScanRequest,
  opts?: { signal?: AbortSignal },
): Promise<SeoScanApiPayload | SeoScanFailure> {
  const apiKey = getPageSpeedApiKey();
  if (!apiKey) {
    return {
      ok: false,
      error: "Serveris neturi PageSpeed API rakto. Pridėkite PSI_API_KEY į .env.",
      status: 503,
    };
  }

  let normalizedUrl: string;
  try {
    normalizedUrl = normalizeUrlInput(validated.url);
  } catch {
    return { ok: false, error: "Neteisingas URL formatas", status: 422 };
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
      return { ok: false, error: "PageSpeed užklausa nutraukta.", status: 502 };
    }
    const message = e instanceof Error ? e.message : "PageSpeed užklausa nepavyko";
    return { ok: false, error: message, status: 502 };
  }

  const meta = extractPageMeta(psi.raw);
  const scanUrl = psi.finalUrl ?? normalizedUrl;
  const head = await fetchPageHtmlSignals(scanUrl, { signal: opts?.signal, timeoutMs: 12_000 });

  const pageContext: ScanPageContext = {
    title: meta.title,
    description: meta.description,
    h1: head.h1,
    keywords: meta.keywords,
  };

  const page: SeoScanPageMeta = { ...meta, h1: head.h1 };

  let insights: string[];
  let insightsSource: "openai" | "fallback";
  let siteTopic: string;
  let siteDescription: string;

  try {
    const ai = await buildAiScanAnalysis(psi.raw, psi.scores, pageContext);
    if (ai) {
      insights = ai.insights;
      insightsSource = "openai";
      siteTopic = ai.siteTopic;
      siteDescription = ai.siteDescription;
    } else {
      insights = buildFallbackInsights(psi.raw, psi.scores);
      insightsSource = "fallback";
      const fb = buildFallbackSiteIdentity(pageContext);
      siteTopic = fb.siteTopic;
      siteDescription = fb.siteDescription;
    }
  } catch {
    insights = buildFallbackInsights(psi.raw, psi.scores);
    insightsSource = "fallback";
    const fb = buildFallbackSiteIdentity(pageContext);
    siteTopic = fb.siteTopic;
    siteDescription = fb.siteDescription;
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
