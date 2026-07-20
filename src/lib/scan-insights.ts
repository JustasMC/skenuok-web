import type { Locale } from "@/lib/i18n/config";
import { analysisLanguageInstruction } from "@/lib/i18n/analysis-locale";
import type { PageHtmlSignals } from "@/lib/page-html-signals";
import type { CategoryKey } from "@/lib/pagespeed";

type Audit = {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  displayValue?: string;
  numericValue?: number;
};

/** Meta + on-page signals for AI context and fallback site identity. */
export type ScanPageContext = {
  title: string | null;
  description: string | null;
  h1: string | null;
  keywords: string[];
  html?: PageHtmlSignals | null;
  vitals?: CoreWebVitalsSnapshot | null;
};

export type CoreWebVitalsSnapshot = {
  lcp: string | null;
  cls: string | null;
  tbt: string | null;
  fcp: string | null;
  speedIndex: string | null;
};

function pickTopAudits(raw: unknown, limit = 8): { id: string; title: string; detail: string }[] {
  const lh = raw as { lighthouseResult?: { audits?: Record<string, Audit> } };
  const audits = lh?.lighthouseResult?.audits ?? {};
  const rows: { id: string; title: string; detail: string; score: number | null }[] = [];

  for (const [id, a] of Object.entries(audits)) {
    if (!a || typeof a.title !== "string") continue;
    const sc = a.score;
    if (sc === null || sc === undefined) continue;
    if (sc >= 1) continue;
    const detail = [a.displayValue, a.description?.slice(0, 280)].filter(Boolean).join(" — ") || a.title;
    rows.push({ id, title: a.title, detail, score: sc ?? 0 });
  }

  rows.sort((a, b) => (a.score ?? 0) - (b.score ?? 0));
  return rows.slice(0, limit).map(({ id, title, detail }) => ({ id, title, detail }));
}

export function extractCoreWebVitals(raw: unknown): CoreWebVitalsSnapshot {
  const lh = raw as { lighthouseResult?: { audits?: Record<string, Audit> } };
  const audits = lh?.lighthouseResult?.audits ?? {};
  const dv = (id: string) => {
    const a = audits[id];
    if (!a) return null;
    if (typeof a.displayValue === "string" && a.displayValue.trim()) return a.displayValue.trim();
    return null;
  };
  return {
    lcp: dv("largest-contentful-paint"),
    cls: dv("cumulative-layout-shift"),
    tbt: dv("total-blocking-time"),
    fcp: dv("first-contentful-paint"),
    speedIndex: dv("speed-index"),
  };
}

export function buildFallbackInsights(
  raw: unknown,
  scores: Record<CategoryKey, number | null>,
  locale: Locale = "lt",
  ctx?: ScanPageContext,
): string[] {
  const tips: string[] = [];
  const en = locale === "en";
  const perf = scores.performance;
  const seo = scores.seo;
  const a11y = scores.accessibility;
  const vitals = ctx?.vitals ?? extractCoreWebVitals(raw);
  const html = ctx?.html;

  if (perf != null && perf < 90) {
    tips.push(
      en
        ? `Performance (${perf}/100): prioritise LCP/TBT — compress media (WebP/AVIF), defer non-critical JS, and set caching headers.${vitals.lcp ? ` Current LCP: ${vitals.lcp}.` : ""}`
        : `Našumas (${perf}/100): prioritetas LCP/TBT — kompresuokite mediją (WebP/AVIF), atidėkite nekritinį JS, nustatykite cache antraštes.${vitals.lcp ? ` Dabartinis LCP: ${vitals.lcp}.` : ""}`,
    );
  }
  if (seo != null && seo < 95) {
    tips.push(
      en
        ? `SEO (${seo}/100): verify unique title/meta description, crawlability, and structured data (JSON-LD) in Search Console.`
        : `SEO (${seo}/100): patikrinkite unikalius title ir meta description, indeksavimą ir struktūrizuotus duomenis (JSON-LD) Search Console.`,
    );
  }
  if (a11y != null && a11y < 95) {
    tips.push(
      en
        ? `Accessibility (${a11y}/100): fix contrast, focus states, and missing labels on interactive controls.`
        : `Prieinamumas (${a11y}/100): pagerinkite kontrastą, fokuso būsenas ir etiketes interaktyviems elementams.`,
    );
  }
  if (html?.h1Count === 0) {
    tips.push(
      en
        ? "On-page: no H1 found — add one clear primary heading that matches search intent."
        : "On-page: nerasta H1 — pridėkite vieną aiškią pagrindinę antraštę pagal paieškos intenciją.",
    );
  } else if ((html?.h1Count ?? 0) > 1) {
    tips.push(
      en
        ? `On-page: ${html!.h1Count} H1 headings detected — keep a single primary H1 for clearer topical focus.`
        : `On-page: rasta ${html!.h1Count} H1 antraštės — palikite vieną pagrindinę H1 aiškesniam teminiam fokusui.`,
    );
  }
  if (html && !html.hasJsonLd) {
    tips.push(
      en
        ? "Structured data: no JSON-LD detected — add Organization/WebSite/Product schema where relevant."
        : "Struktūriniai duomenys: JSON-LD nerastas — pridėkite Organization/WebSite/Product schemą, kur tinka.",
    );
  }
  if (html?.thinContent) {
    tips.push(
      en
        ? `Content depth: ~${html.wordCount} visible words — thin pages rarely rank; expand with useful sections and FAQ.`
        : `Turinio gylis: ~${html.wordCount} matomų žodžių — plonas turinys retai ranguoja; išplėskite naudingomis sekcijomis ir DUK.`,
    );
  }
  if (html && html.imgMissingAlt > 0) {
    tips.push(
      en
        ? `Images: ${html.imgMissingAlt}/${html.imgCount} missing alt text — hurts accessibility and image SEO.`
        : `Paveikslėliai: ${html.imgMissingAlt}/${html.imgCount} be alt teksto — kenkia prieinamumui ir image SEO.`,
    );
  }

  for (const row of pickTopAudits(raw, 5)) {
    tips.push(`${row.title}: ${row.detail.replace(/\s+/g, " ").slice(0, 220)}`);
  }

  return tips.slice(0, 10);
}

/** When OpenAI is unavailable — short identity from title / meta / H1. */
export function buildFallbackSiteIdentity(
  ctx: ScanPageContext,
  locale: Locale = "lt",
): { siteTopic: string; siteDescription: string } {
  const fromTitle = ctx.title?.split(/\s*[|–—]\s*/)[0]?.trim() ?? "";
  const siteTopic = (fromTitle || ctx.h1?.trim() || (locale === "en" ? "Website" : "Svetainė")).slice(0, 160);

  const descParts = [
    ctx.description,
    ctx.html?.ogDescription && ctx.html.ogDescription !== ctx.description ? ctx.html.ogDescription : null,
    ctx.h1 && ctx.h1 !== fromTitle ? ctx.h1 : null,
  ].filter(Boolean) as string[];
  let siteDescription = descParts.join(" ").replace(/\s+/g, " ").trim();
  if (!siteDescription) {
    siteDescription =
      locale === "en"
        ? "Could not auto-describe the business — technical metrics below still help prioritise fixes."
        : "Nepavyko automatiškai apibūdinti veiklos — žemiau pateikti techniniai duomenys vis tiek naudingi prioritetams.";
  }
  return { siteTopic, siteDescription: siteDescription.slice(0, 480) };
}

function parseJsonFromAssistant(raw: string): unknown {
  let t = raw.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  }
  try {
    return JSON.parse(t) as unknown;
  } catch {
    return null;
  }
}

function normalizeInsightsList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v
    .filter((x): x is string => typeof x === "string")
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 10);
}

/**
 * One OpenAI call: actionable recommendations + site topic/summary (JSON).
 */
export async function buildAiScanAnalysis(
  raw: unknown,
  scores: Record<CategoryKey, number | null>,
  ctx: ScanPageContext,
  locale: Locale = "lt",
): Promise<{ insights: string[]; siteTopic: string; siteDescription: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const vitals = ctx.vitals ?? extractCoreWebVitals(raw);
  const top = pickTopAudits(raw, 12);
  const html = ctx.html;

  const payload = {
    scores,
    coreWebVitals: vitals,
    failingAudits: top.map((t) => ({ id: t.id, title: t.title, detail: t.detail.slice(0, 400) })),
    pageSignals: {
      documentTitle: ctx.title,
      metaDescription: ctx.description,
      mainHeadingH1: ctx.h1,
      h1Count: html?.h1Count ?? null,
      h2Sample: html?.h2?.slice(0, 8) ?? [],
      h3Sample: html?.h3?.slice(0, 6) ?? [],
      ogTitle: html?.ogTitle ?? null,
      ogDescription: html?.ogDescription ?? null,
      canonical: html?.canonical ?? null,
      robotsMeta: html?.robotsMeta ?? null,
      hasJsonLd: html?.hasJsonLd ?? null,
      approximateWordCount: html?.wordCount ?? null,
      images: html ? { total: html.imgCount, missingAlt: html.imgMissingAlt } : null,
      thinContent: html?.thinContent ?? null,
      keywordHints: ctx.keywords.slice(0, 12),
    },
  };

  const lang = analysisLanguageInstruction(locale);

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.28,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a senior SEO + web performance professor and consultant (15+ years). Think like a technical auditor who also teaches clients business impact.
${lang}

Return ONE JSON object with:
- "insights": array of 6–8 strings. Each insight MUST be specific, prioritised, and actionable (what to fix first, why it matters for rankings/conversions, and a concrete next step). Tie Lighthouse failures AND on-page signals (H1/H2, word count, JSON-LD, CWV) to the site's apparent business (title/meta/H1). Avoid generic filler. Prefer impact order: indexing/intent → CWV → content depth → a11y.
- "siteTopic": short phrase (3–10 words) naming the business/site type.
- "siteDescription": 1–2 sentences: what the site does, who it serves, and communication tone — usable later as brand context for a content writer.

Rules:
- Do not invent metrics that are not in the payload.
- If signals are thin (SPA shell / low word count), say so and recommend verification with rendered HTML / Search Console.
- No markdown inside JSON string values.`,
        },
        {
          role: "user",
          content: `Analyse this scan payload and fill the JSON:\n${JSON.stringify(payload)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return null;

  const parsed = parseJsonFromAssistant(text);
  if (!parsed || typeof parsed !== "object") return null;
  const obj = parsed as Record<string, unknown>;

  const insights = normalizeInsightsList(obj.insights);
  const siteTopic = typeof obj.siteTopic === "string" ? obj.siteTopic.replace(/\s+/g, " ").trim().slice(0, 200) : "";
  const siteDescription =
    typeof obj.siteDescription === "string" ? obj.siteDescription.replace(/\s+/g, " ").trim().slice(0, 520) : "";

  if (insights.length < 3 || !siteTopic || !siteDescription) return null;

  return { insights, siteTopic, siteDescription };
}
