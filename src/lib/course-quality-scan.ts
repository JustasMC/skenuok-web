import { z } from "zod";
import { extractCoursePagePlainText } from "@/lib/course-page-extract";
import type { Locale } from "@/lib/i18n/config";
import { analysisLanguageInstruction } from "@/lib/i18n/analysis-locale";
import type { ScanRequest } from "@/lib/scan-schema";
import { runSeoScan } from "@/lib/seo-scan-service";
import type { FreeAlternativesBundle } from "@/lib/verify-free-alternatives";
import {
  explainSerperSkipped,
  extractEurAmountFromText,
  shouldRunSerperVerification,
  verifyFreeAlternatives,
} from "@/lib/verify-free-alternatives";

import { SKEPTIC_VERDICTS, type SkepticVerdict } from "@/lib/course-skeptic-types";

const verdictRecommendationSchema = z.enum(["search_free", "consider", "likely_fair", "unclear"]);
const skepticVerdictSchema = z.enum(SKEPTIC_VERDICTS);
const instructorPresenceSchema = z.enum(["named_real", "pseudonym", "anonymous", "unclear"]);

const aiCourseSchema = z.object({
  overallScore: z.number().min(0).max(100),
  /** Vertės indeksas: žinių unikalumas, struktūra, kaina vs turinys */
  valueIndex: z.number().min(0).max(100),
  valueMetrics: z.object({
    /** 100 = aiškiai unikalus / gilesnis turinys; žemiau = daug „bazinių“ dalykų */
    uniqueKnowledge: z.number().min(0).max(100),
    /** Ar struktūrizuotas turinys (moduliai) pateisina laiką / kainą */
    structureValue: z.number().min(0).max(100),
    /** Kaina vs apimtis ir aiškumas, palyginti su tipine nemokama alternatyva */
    priceQuality: z.number().min(0).max(100),
  }),
  marketVerdict: z.object({
    headline: z.string().min(3),
    recommendation: verdictRecommendationSchema,
    body: z.string().min(40),
  }),
  extractedOffer: z.object({
    priceText: z.string().nullable(),
    syllabusSummary: z.string(),
    outcomesSummary: z.string(),
  }),
  pillars: z
    .array(
      z.object({
        key: z.string(),
        label: z.string(),
        score: z.number().min(0).max(100),
        comment: z.string(),
      }),
    )
    .min(4)
    .max(6),
  checklist: z.array(
    z.object({
      ok: z.boolean(),
      text: z.string(),
    }),
  ),
  /** Skeptiko / investicijų analitiko sluoksnis – ne SEO, o piniginės apsauga */
  skepticVerdict: skepticVerdictSchema,
  redFlags: z.array(z.string()).max(20),
  priceBenchmarkAnalysis: z.string().min(20),
  contentQualityAssessment: z.string().min(20),
  skepticFinalRecommendation: z.string().min(30),
  summary: z.string().min(30),
  /** Lektoriaus vardas ir pavardė, slapyvardis arba „Anonymous“ jei nerasta */
  instructorIdentity: z.string().min(1).max(120),
  /** Ar matomas tikras asmuo, slapyvardis, ar visiškai anonimiška */
  instructorPresence: instructorPresenceSchema,
  /** Trumpai: sertifikatai, licencijos, patirtis žinomose įmonėse – arba tuščia */
  instructorCredentialsHint: z.string().max(400).nullish(),
  /** 2–5 sakinių santrauka: ar matomas autoritetas (LinkedIn, patirtis, sertifikatai), ar anonimiškumas kelia riziką */
  instructorAnalysis: z.string().min(40).max(1400),
  /** Paieškos frazės Serper (Google) – nemokamoms alternatyvoms */
  searchTopics: z.array(z.string()).max(5).optional(),
});

export type InstructorPresence = z.infer<typeof instructorPresenceSchema>;
export type AiCourseAssessment = z.infer<typeof aiCourseSchema>;

export type CoursePillar = z.infer<typeof aiCourseSchema>["pillars"][number];
export type CourseChecklistItem = z.infer<typeof aiCourseSchema>["checklist"][number];
export type MarketVerdict = z.infer<typeof aiCourseSchema>["marketVerdict"];
export type ValueMetrics = z.infer<typeof aiCourseSchema>["valueMetrics"];
export type ExtractedOffer = z.infer<typeof aiCourseSchema>["extractedOffer"];

export type CourseQualityPayload = {
  ok: true;
  url: string;
  strategy: "mobile" | "desktop";
  scores: {
    performance: number | null;
    seo: number | null;
    accessibility: number | null;
  };
  page: {
    title: string | null;
    description: string | null;
    keywords: string[];
  };
  meta: { lighthouseVersion: string | null; fetchTime: string | null };
  assessmentSource: "openai" | "fallback";
  pageScrape: { ok: true; charCount: number; truncated: boolean } | { ok: false; error: string };
  overallScore: number;
  valueIndex: number;
  valueMetrics: ValueMetrics;
  marketVerdict: MarketVerdict;
  extractedOffer: ExtractedOffer;
  pillars: CoursePillar[];
  checklist: CourseChecklistItem[];
  skepticVerdict: SkepticVerdict;
  redFlags: string[];
  priceBenchmarkAnalysis: string;
  contentQualityAssessment: string;
  skepticFinalRecommendation: string;
  summary: string;
  instructorIdentity: string;
  instructorPresence: InstructorPresence;
  instructorCredentialsHint?: string;
  instructorAnalysis: string;
  searchTopics: string[];
  freeAlternatives: FreeAlternativesBundle;
};

export type CourseQualityFailure = { ok: false; error: string; status: number };

/** Serper pilname režime: ieškoti pagal vardą, ne „Anonymous“. */
export function resolveInstructorSearchName(ai: Pick<AiCourseAssessment, "instructorIdentity" | "instructorPresence">): string | null {
  if (ai.instructorPresence === "anonymous") return null;
  const id = ai.instructorIdentity.trim();
  if (!id || /^anonymous$/i.test(id) || /^nežinoma$/i.test(id)) return null;
  return id;
}

/** Anonimiškumo / slapyvardžio taisyklės – pakoreguoja skeptiko verdiktą ir vėliavas. */
export function applyInstructorPresencePenalty(ai: AiCourseAssessment): AiCourseAssessment {
  const next: AiCourseAssessment = {
    ...ai,
    redFlags: [...ai.redFlags],
  };

  if (next.instructorPresence === "anonymous") {
    if (next.skepticVerdict === "SAUGU" || next.skepticVerdict === "ATSARGIAI") {
      next.skepticVerdict = "RIZIKA";
    }
    if (!next.redFlags.some((x) => /anonimišk|tapatyb|nerasta.*vard/i.test(x))) {
      next.redFlags.push(
        "Lektorius neidentifikuojamas arba slepiama tapatybė — sunku patikrinti atsakomybę ir reputaciją.",
      );
    }
  } else if (next.instructorPresence === "pseudonym") {
    if (next.skepticVerdict === "SAUGU") {
      next.skepticVerdict = "ATSARGIAI";
    }
    if (!next.redFlags.some((x) => /slapyvard|pseudonim/i.test(x))) {
      next.redFlags.push(
        "Naudojamas slapyvardis arba tik prekybinis vardas — ribota reputacinė ir teisinė atsakomybė.",
      );
    }
  }

  return next;
}

function fallbackAssessment(input: {
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  title: string | null;
  description: string | null;
  priceCandidates: string[];
  pageTextOk: boolean;
}): Omit<
  CourseQualityPayload,
  | "ok"
  | "url"
  | "strategy"
  | "page"
  | "meta"
  | "assessmentSource"
  | "scores"
  | "pageScrape"
> {
  const { performance: p, seo: s, accessibility: a } = input.scores;
  const avg = [p, s, a].filter((x): x is number => x != null);
  const base = avg.length ? Math.round(avg.reduce((x, y) => x + y, 0) / avg.length) : 50;

  const pillars: CoursePillar[] = [
    {
      key: "tech",
      label: "Techninis našumas",
      score: p ?? 50,
      comment:
        p != null && p >= 85
          ? "Puslapis kraunasi pakankamai greitai."
          : "Našumas gali veikti mokymosi patirtį.",
    },
    {
      key: "a11y",
      label: "Prieinamumas",
      score: a ?? 50,
      comment: a != null && a >= 85 ? "Geras prieinamumo pagrindas." : "Prieinamumas gali būti stipresnis.",
    },
    {
      key: "seo",
      label: "SEO ir matomumas",
      score: s ?? 50,
      comment: s != null && s >= 85 ? "Techninis SEO neblogas." : "SEO gali būti rezervas.",
    },
    {
      key: "content",
      label: "Meta ir antraštės",
      score: input.title && input.description && input.description.length > 40 ? 72 : 48,
      comment:
        input.title && input.description
          ? "Yra title ir description."
          : "Trūksta aiškaus title/description.",
    },
  ];

  const checklist: CourseChecklistItem[] = [
    { ok: p != null && p >= 70, text: "Lighthouse našumas neblogas." },
    { ok: a != null && a >= 70, text: "Prieinamumo pagrindai neblogi." },
    { ok: s != null && s >= 70, text: "SEO techninis pagrindas pakankamas." },
    { ok: Boolean(input.title?.trim()), text: "Yra puslapio antraštė." },
    {
      ok: Boolean(input.description && input.description.length > 50),
      text: "Aprašas pakankamai išsamus (meta).",
    },
    { ok: input.pageTextOk, text: "Pavyko nuskaityti puslapio HTML tekstą (turinio analizei)." },
    { ok: input.priceCandidates.length > 0, text: "Tekste aptikta galimų kainos užuominų (heuristika)." },
  ];

  const valueIndex = Math.round(base * 0.65);
  const valueMetrics: ValueMetrics = {
    uniqueKnowledge: input.pageTextOk ? 45 : 35,
    structureValue: input.pageTextOk ? 50 : 40,
    priceQuality: input.priceCandidates.length > 0 ? 48 : 40,
  };

  const marketVerdict: MarketVerdict = {
    headline: "Nepilnas vertinimas be AI",
    recommendation: "unclear",
    body:
      "Įjungus OPENAI_API_KEY ir sėkmingai nuskaičius puslapį, čia bus „rinkos eksperto“ verdiktas: ar turinys panašus į nemokamai prieinamą medžiagą (YouTube, dokumentacija), ir ar kaina atrodo pagrįsta. Dabar matomi tik Lighthouse balai ir meta duomenys.",
  };

  const extractedOffer: ExtractedOffer = {
    priceText: input.priceCandidates[0] ?? null,
    syllabusSummary: input.pageTextOk
      ? "Programa iš teksto neanalizuota (reikia AI)."
      : "Puslapio teksto nepavyko pilnai nuskaityti — patikrinkite URL.",
    outcomesSummary: "Pažadai po kurso neidentifikuoti be AI analizės.",
  };

  return {
    overallScore: Math.min(100, Math.max(0, base)),
    valueIndex,
    valueMetrics,
    marketVerdict,
    extractedOffer,
    pillars,
    checklist,
    skepticVerdict: "ATSARGIAI",
    redFlags: [
      "Be AI neįmanoma patikimai aptikti nerealų pelno pažadų, dirbtinio FOMO ir „cash-grab“ požymių.",
    ],
    priceBenchmarkAnalysis:
      "Kainos ir rinkos palyginimas neįmanomas šiame režime. Įjunkite OPENAI_API_KEY — AI palygins kainą su tipiniais intervalais (pvz., Udemy, Coursera, bootcampai) ir įvertins mentorystę / bendruomenę.",
    contentQualityAssessment:
      "Programos detalumas, lektoriaus autoritetas ir „tik nuorodos į nemokamą YouTube“ rizika neįvertinami be AI analizės puslapio teksto.",
    skepticFinalRecommendation:
      "Pakartokite skenavimą su aktyviu OpenAI raktu — tada gausite pilną „Skeptiko“ verdiktą: raudonos vėliavos, kainos komentaras ir aiški rekomendacija pirkti / laukti / vengti.",
    instructorIdentity: "Nežinoma",
    instructorPresence: "unclear",
    instructorCredentialsHint: undefined,
    instructorAnalysis:
      "Be AI analizės neįmanoma įvertinti lektoriaus autoriteto: ar minimas vardas, LinkedIn, sertifikatai ar patirtis. Įjunkite OPENAI_API_KEY ir pakartokite skenavimą.",
    summary:
      "Šis rezultatas sugeneruotas be OpenAI arba AI atsakymas nepraėjo validacijos. Pridėkite OPENAI_API_KEY ir bandykite dar kartą — tada bus vertinama ir parduodama vertė, ne tik technika.",
    searchTopics: [],
    freeAlternatives: {
      status: "skipped",
      reason:
        "Serper paieška galima po sėkmingo AI vertinimo (temų sąrašas + SERPER_API_KEY + aktyvavimo sąlygos).",
    },
  };
}

async function analyzeWithOpenAI(ctx: {
  url: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  insights: string[];
  pageText: string;
  pageTextTruncated: boolean;
  priceCandidates: string[];
  locale: Locale;
}): Promise<z.infer<typeof aiCourseSchema> | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const lang = analysisLanguageInstruction(ctx.locale);

  const system = `You are a world-class digital education auditor and consumer-protection analyst (professor of instructional design + marketplace pricing). Your job: decide whether a course is worth the money, low-value cash-grab, or likely scam. Protect the buyer's wallet — never sell.

${lang}

ANALYSIS FRAMEWORK (apply rigorously):
0) PAGE TYPE FIRST: Decide if this is truly a course/training sales page (curriculum, modules, enrolment, course price). If it is clearly a services/agency/portfolio/company page WITHOUT a sellable course — do NOT evaluate it as a paid-course investment. Explicitly state that in summary + marketVerdict.body + skepticFinalRecommendation. Set syllabusSummary to say no curriculum exists. Do not invent high "course value" scores for a services landing page.

1) Price vs value benchmark: compare to typical bands (mass courses ~€15–80, Coursera-like ~€30–100, mentored bootcamps often €1500–5000). Weigh duration, mentorship, live calls, community, certificate.
2) Red flags: >10%/mo investment/crypto returns without risk; absurd ROI; "job in 2 weeks" for beginners; passive income with no effort; fake FOMO (timers, "2 seats left"); screenshots without audits; anonymity without LinkedIn/GitHub/licences where expected.
3) Niche heuristics: crypto/forex — profit promises + risk disclosure; programming — concrete stack/projects vs YouTube-level theory; business/AI — concrete tools/case studies vs get-rich-quick.
4) Instructor identity from pageText: real name, public profile hints, or only a handle. anonymous → instructorIdentity "Anonymous". Pseudonym → "pseudonym". Clear real name → "named_real".
5) instructorAnalysis: 2–5 sentences on authority signals (LinkedIn, known employers, certificates) vs guru marketing with no footprint. Informational, not legal advice.
6) Content quality: syllabus specificity, outcome measurability, prerequisites, refund policy signals, sample lesson depth.
7) Use Lighthouse insights only as secondary technical context — money/value and claim realism come first.

If price is unclear, still evaluate claims; marketVerdict.recommendation may be "unclear".

Return ONLY valid JSON (no markdown). All human-readable strings in the required language. Schema MUST include:
{
  "overallScore": 0-100,
  "valueIndex": 0-100,
  "valueMetrics": { "uniqueKnowledge": 0-100, "structureValue": 0-100, "priceQuality": 0-100 },
  "marketVerdict": {
    "headline": "short market verdict",
    "recommendation": "search_free" | "consider" | "likely_fair" | "unclear",
    "body": "2–6 concrete sentences"
  },
  "extractedOffer": {
    "priceText": "price as on page or null",
    "syllabusSummary": "modules / topics / duration",
    "outcomesSummary": "promised outcomes"
  },
  "pillars": [ { "key", "label", "score", "comment" } ] — 4–6 pillars (tech, access, seo, trust, content…),
  "checklist": 6–10 items { "ok": boolean, "text": string },
  "skepticVerdict": "SAUGU" | "ATSARGIAI" | "RIZIKA" | "SCAM",
  "redFlags": ["clear issues or empty array"],
  "priceBenchmarkAnalysis": "≥20 chars — price vs market",
  "contentQualityAssessment": "≥20 chars — curriculum, authority, practice",
  "skepticFinalRecommendation": "≥30 chars — buy / wait / seek free / avoid",
  "instructorIdentity": "name, handle, or Anonymous",
  "instructorPresence": "named_real" | "pseudonym" | "anonymous" | "unclear",
  "instructorCredentialsHint": "short or empty",
  "instructorAnalysis": "≥40 chars",
  "summary": "2–4 sentence wrap-up",
  "searchTopics": [ "1–5 concrete free-learning search phrases" ]
}`;

  const userPayload = {
    url: ctx.url,
    title: ctx.title,
    description: ctx.description,
    keywords: ctx.keywords,
    scores: ctx.scores,
    insights: ctx.insights,
    pageText: ctx.pageText,
    pageTextTruncated: ctx.pageTextTruncated,
    priceCandidates: ctx.priceCandidates,
    note: "pageText is extracted HTML text. priceCandidates are heuristic price hints. Fill searchTopics (1–5) for free tutorials if possible.",
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.28,
      max_tokens: 4500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(userPayload) },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const safe = aiCourseSchema.safeParse(parsed);
  if (!safe.success) return null;
  return applyInstructorPresencePenalty(safe.data);
}

/**
 * Course page: Lighthouse + HTML text + AI market/skeptic verdict.
 */
export async function runCourseQualityScan(
  validated: ScanRequest,
  opts?: { locale?: Locale },
): Promise<CourseQualityPayload | CourseQualityFailure> {
  const locale = opts?.locale ?? validated.locale ?? "lt";
  const base = await runSeoScan(validated, { locale, skipAiInsights: true });
  if (!base.ok) {
    return { ok: false, error: base.error, status: base.status };
  }

  const scrape = await extractCoursePagePlainText(base.url);

  const scores = {
    performance: base.scores.performance,
    seo: base.scores.seo,
    accessibility: base.scores.accessibility,
  };

  const pageScrape: CourseQualityPayload["pageScrape"] = scrape.ok
    ? { ok: true, charCount: scrape.charCount, truncated: scrape.truncated }
    : { ok: false, error: scrape.error };

  const ai = await analyzeWithOpenAI({
    url: base.url,
    title: base.page.title,
    description: base.page.description,
    keywords: base.page.keywords,
    scores,
    insights: base.insights.slice(0, 10),
    pageText: scrape.ok ? scrape.text : "",
    pageTextTruncated: scrape.ok ? scrape.truncated : false,
    priceCandidates: scrape.ok ? scrape.priceCandidates : [],
    locale,
  });

  const pageBlock = {
    title: base.page.title,
    description: base.page.description,
    keywords: base.page.keywords,
  };

  if (ai) {
    const searchTopics = (ai.searchTopics ?? []).map((t) => t.trim()).filter(Boolean);
    const priceEur = extractEurAmountFromText(ai.extractedOffer.priceText);
    const serperKey = process.env.SERPER_API_KEY;
    const instructorSearchName = resolveInstructorSearchName(ai);

    let freeAlternatives: FreeAlternativesBundle;
    if (
      shouldRunSerperVerification({
        serperApiKey: serperKey,
        topics: searchTopics,
        valueIndex: ai.valueIndex,
        priceEur,
        recommendation: ai.marketVerdict.recommendation,
        skepticVerdict: ai.skepticVerdict,
      })
    ) {
      freeAlternatives = await verifyFreeAlternatives(searchTopics, serperKey!, {
        skepticVerdict: ai.skepticVerdict,
        instructorSearchName,
      });
    } else {
      freeAlternatives = {
        status: "skipped",
        reason: explainSerperSkipped({
          serperApiKey: serperKey,
          topics: searchTopics,
          valueIndex: ai.valueIndex,
          priceEur,
          recommendation: ai.marketVerdict.recommendation,
          skepticVerdict: ai.skepticVerdict,
        }),
      };
    }

    return {
      ok: true,
      url: base.url,
      strategy: base.strategy,
      scores,
      page: pageBlock,
      meta: base.meta,
      assessmentSource: "openai",
      pageScrape,
      overallScore: ai.overallScore,
      valueIndex: ai.valueIndex,
      valueMetrics: ai.valueMetrics,
      marketVerdict: ai.marketVerdict,
      extractedOffer: ai.extractedOffer,
      pillars: ai.pillars,
      checklist: ai.checklist,
      skepticVerdict: ai.skepticVerdict,
      redFlags: ai.redFlags,
      priceBenchmarkAnalysis: ai.priceBenchmarkAnalysis,
      contentQualityAssessment: ai.contentQualityAssessment,
      skepticFinalRecommendation: ai.skepticFinalRecommendation,
      summary: ai.summary,
      instructorIdentity: ai.instructorIdentity,
      instructorPresence: ai.instructorPresence,
      instructorCredentialsHint: ai.instructorCredentialsHint ?? undefined,
      instructorAnalysis: ai.instructorAnalysis,
      searchTopics,
      freeAlternatives,
    };
  }

  const fb = fallbackAssessment({
    scores,
    title: base.page.title,
    description: base.page.description,
    priceCandidates: scrape.ok ? scrape.priceCandidates : [],
    pageTextOk: scrape.ok && scrape.text.length > 80,
  });

  return {
    ok: true,
    url: base.url,
    strategy: base.strategy,
    scores,
    page: pageBlock,
    meta: base.meta,
    assessmentSource: "fallback",
    pageScrape,
    overallScore: fb.overallScore,
    valueIndex: fb.valueIndex,
    valueMetrics: fb.valueMetrics,
    marketVerdict: fb.marketVerdict,
    extractedOffer: fb.extractedOffer,
    pillars: fb.pillars,
    checklist: fb.checklist,
    skepticVerdict: fb.skepticVerdict,
    redFlags: fb.redFlags,
    priceBenchmarkAnalysis: fb.priceBenchmarkAnalysis,
    contentQualityAssessment: fb.contentQualityAssessment,
    skepticFinalRecommendation: fb.skepticFinalRecommendation,
    summary: fb.summary,
    instructorIdentity: fb.instructorIdentity,
    instructorPresence: fb.instructorPresence,
    instructorCredentialsHint: fb.instructorCredentialsHint,
    instructorAnalysis: fb.instructorAnalysis,
    searchTopics: fb.searchTopics,
    freeAlternatives: fb.freeAlternatives,
  };
}
