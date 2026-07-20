/**
 * Professional SEO checklist score for generated HTML (0–100).
 * Weighted checks — not a toy binary game, but still deterministic for expand loops.
 */

import type { Locale } from "@/lib/i18n/config";

/** Minimum words for the length check (must stay aligned with generation prompts). */
export const SEO_SCORE_MIN_WORDS = 700;

export type SeoScoreCheck = {
  id: string;
  pass: boolean;
  label: string;
  fixHint: string;
  weight: number;
};

export type SeoScoreBreakdown = {
  score: number;
  hasKeywordInH1: boolean;
  keywordOccurrences: number;
  internalLinks: number;
  wordCount: number;
  h2Count: number;
  listCount: number;
  checks: SeoScoreCheck[];
};

function stripTags(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ");
}

function textContent(html: string): string {
  return stripTags(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(text: string): number {
  const m = text.match(/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž0-9]+/g);
  return m?.length ?? 0;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count phrase hits; also count significant tokens (≥4 chars) when phrase is multi-word. */
function countKeywordHits(plainLower: string, keyword: string): number {
  if (!keyword) return 0;
  const exact = plainLower.match(new RegExp(escapeRegExp(keyword), "gi"));
  let n = exact?.length ?? 0;
  if (n === 0 && keyword.includes(" ")) {
    const tokens = keyword.split(/\s+/).filter((t) => t.length >= 4);
    if (tokens.length >= 2) {
      const tokenHits = tokens.map((t) => (plainLower.match(new RegExp(`\\b${escapeRegExp(t)}`, "gi")) ?? []).length);
      n = Math.min(...tokenHits);
    }
  }
  return n;
}

function labels(locale: Locale) {
  if (locale === "en") {
    return {
      h1: "Primary keyword present in H1",
      h1Fix: "Ensure the H1 naturally includes the main topic phrase.",
      freq: "Topic phrase used enough times (3–14) without stuffing",
      freqFix: "Use the phrase naturally in intro, mid sections and conclusion — avoid keyword stuffing.",
      links: "At least 2 contextual internal links (href=\"/...\")",
      linksFix: "Add relative links to related pages (services, tools, contact) with descriptive anchors.",
      len: `Article length ≥ ${SEO_SCORE_MIN_WORDS} words`,
      lenFix: `Expand with examples, steps, FAQs and risks until ≥ ${SEO_SCORE_MIN_WORDS} words.`,
      h2: "At least 4 H2 sections for clear structure",
      h2Fix: "Split the article into logical H2 sections (and H3 where useful).",
      lists: "At least one bullet/numbered list for scannability",
      listsFix: "Add a practical checklist or steps list (<ul>/<ol>).",
    };
  }
  return {
    h1: "Raktažodis / tema H1 antraštėje",
    h1Fix: "Įsitikinkite, kad H1 natūraliai turi pagrindinę temą.",
    freq: "Tema pakartota 3–14 kartų (be stuffingo)",
    freqFix: "Naudokite frazę įžangoje, viduryje ir išvadoje — be dirbtinio kartojimo.",
    links: "Bent 2 kontekstinės vidinės nuorodos (href=\"/...\")",
    linksFix: "Įterpkite relatyvias nuorodas į susijusius puslapius su aiškiais ankorais.",
    len: `Straipsnis ≥ ${SEO_SCORE_MIN_WORDS} žodžių`,
    lenFix: `Išplėskite pavyzdžiais, žingsniais, DUK ir rizikomis iki ≥ ${SEO_SCORE_MIN_WORDS} žodžių.`,
    h2: "Bent 4 H2 skyriai aiškiai struktūrai",
    h2Fix: "Suskaidykite straipsnį į loginius H2 (ir H3, kur tinka).",
    lists: "Bent vienas sąrašas (ul/ol) skaitomumui",
    listsFix: "Pridėkite praktinį checklist arba žingsnių sąrašą.",
  };
}

export function scoreSeoHtml(html: string, keywordRaw: string, locale: Locale = "lt"): SeoScoreBreakdown {
  const L = labels(locale);
  const keyword = keywordRaw.trim().toLowerCase();
  const plain = textContent(html);
  const plainLower = plain.toLowerCase();

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? stripTags(h1Match[1]).toLowerCase() : "";
  const hasKeywordInH1 =
    keyword.length > 0 &&
    (h1Text.includes(keyword) || countKeywordHits(h1Text, keyword) >= 1);

  const keywordOccurrences = countKeywordHits(plainLower, keyword);
  const densityOk = keywordOccurrences >= 3 && keywordOccurrences <= 14;

  const internalLinks = (html.match(/<a[^>]+href=["']\/[^"']*["']/gi) ?? []).length;
  const wordCount = countWords(plain);
  const h2Count = (html.match(/<h2\b/gi) ?? []).length;
  const listCount = (html.match(/<(ul|ol)\b/gi) ?? []).length;

  const checks: SeoScoreCheck[] = [
    {
      id: "h1",
      pass: hasKeywordInH1,
      label: L.h1,
      fixHint: L.h1Fix,
      weight: 20,
    },
    {
      id: "freq",
      pass: densityOk,
      label: L.freq,
      fixHint: L.freqFix,
      weight: 18,
    },
    {
      id: "links",
      pass: internalLinks >= 2,
      label: L.links,
      fixHint: L.linksFix,
      weight: 15,
    },
    {
      id: "len",
      pass: wordCount >= SEO_SCORE_MIN_WORDS,
      label: L.len,
      fixHint: L.lenFix,
      weight: 27,
    },
    {
      id: "h2",
      pass: h2Count >= 4,
      label: L.h2,
      fixHint: L.h2Fix,
      weight: 12,
    },
    {
      id: "lists",
      pass: listCount >= 1,
      label: L.lists,
      fixHint: L.listsFix,
      weight: 8,
    },
  ];

  const totalW = checks.reduce((s, c) => s + c.weight, 0);
  const earned = checks.reduce((s, c) => s + (c.pass ? c.weight : 0), 0);
  const score = Math.round((earned / totalW) * 100);

  return {
    score,
    hasKeywordInH1,
    keywordOccurrences,
    internalLinks,
    wordCount,
    h2Count,
    listCount,
    checks,
  };
}
