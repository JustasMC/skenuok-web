import type { Locale } from "@/lib/i18n/config";
import { analysisLanguageInstruction } from "@/lib/i18n/analysis-locale";
import { scoreSeoHtml, SEO_SCORE_MIN_WORDS } from "@/lib/seo-score";

export type ArticleGenerationContext = {
  siteNiche?: string | null;
  brandVoice?: string | null;
  locale?: Locale;
};

const SEO_WORD_TARGET = Math.max(SEO_SCORE_MIN_WORDS + 60, 760);

function getArticleMaxTokens(): number {
  const n = Number.parseInt(process.env.OPENAI_ARTICLE_MAX_TOKENS ?? "", 10);
  if (Number.isFinite(n) && n >= 2000 && n <= 16_000) return n;
  return 8000;
}

function buildSystemPrompt(locale: Locale): string {
  const lang = analysisLanguageInstruction(locale);
  return `You are a senior SEO content professor and editor. You write original, useful long-form articles that rank AND help readers — not keyword spam.
${lang}
Return ONLY an HTML fragment — no markdown fences, no preamble.

Quality bar (think like a university lecturer + SEO lead):
1) One <h1> that naturally includes the user's topic phrase.
2) At least 5 distinct <h2> sections; use <h3> where it clarifies structure.
3) Length: at least ${SEO_WORD_TARGET} words of substantive content (definitions, steps, pitfalls, examples, decision criteria, FAQ-style Q&A).
4) Topic phrase: use the user's exact phrase naturally 4–8 times across intro, body and conclusion — never stuff.
5) E-E-A-T: show expertise — cite mechanisms, trade-offs, and when NOT to apply advice. Be accurate; do not invent statistics with fake precision.
6) Structure: short <p> paragraphs; at least two practical <ul> or <ol> lists (3–6 items each); use <strong> sparingly for key terms.
7) Internal links: include at least two contextual relative links that help the reader next, choosing from:
   <a href="/tools/scanner">…</a>, <a href="/tools/course-scanner">…</a>, <a href="/irankiai/seo-generatorius">…</a>, <a href="/pricing">…</a>, <a href="/svetainiu-kurimas">…</a>, <a href="/#kontaktai">…</a>
   Anchors must be descriptive (not “click here”).
8) Forbidden: <html>, <body>, <head>, <script>, <style>, fluff filler, repeated identical paragraphs.
9) Match niche/tone from the user message when provided.`;
}

function buildUserContent(topic: string, ctx?: ArticleGenerationContext): string {
  const niche = ctx?.siteNiche?.trim();
  const voice = ctx?.brandVoice?.trim();
  const lines = [
    `Primary topic / phrase (must appear naturally in H1 and body): "${topic}"`,
    "",
    `Target length: ≥ ${SEO_WORD_TARGET} words of real analysis — not padded filler.`,
    "Write as if advising a serious business owner: clear, precise, prioritised.",
  ];
  if (niche) lines.push("", `Site niche (from scan): ${niche}`);
  if (voice) lines.push("", `Tone / audience — stay consistent: ${voice}`);
  return lines.join("\n");
}

function normalizeModelHtml(topic: string, html: string): string {
  let out = html.trim();
  out = out.replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/```\s*$/i, "").trim();
  if (!out.includes("<h1")) {
    out = `<h1>${escapeHtml(topic)}</h1>\n${out}`;
  }
  return out;
}

async function openaiChatHtml(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  maxTokens: number,
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY for article generation.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.42,
      max_tokens: maxTokens,
      messages,
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content?.trim() ?? "";
}

async function runSingleExpandPass(
  html: string,
  topic: string,
  ctx: ArticleGenerationContext | undefined,
  maxTokens: number,
  breakdown: ReturnType<typeof scoreSeoHtml>,
  locale: Locale,
): Promise<string> {
  const failed = breakdown.checks.filter((c) => !c.pass).map((c) => `${c.label} (${c.fixHint})`);
  const niche = ctx?.siteNiche?.trim();
  const voice = ctx?.brandVoice?.trim();
  const ctxBlock = [niche ? `Niche: ${niche}` : "", voice ? `Tone: ${voice}` : ""].filter(Boolean).join("\n");
  const lang = analysisLanguageInstruction(locale);

  const wordsNeeded = Math.max(220, SEO_WORD_TARGET - breakdown.wordCount);
  const lenHint =
    breakdown.wordCount < SEO_SCORE_MIN_WORDS
      ? [
          "",
          `CRITICAL: ~${breakdown.wordCount} words now. Need ≥ ${SEO_SCORE_MIN_WORDS}.`,
          `Add at least ~${wordsNeeded} new words: new <p> paragraphs and/or H2/H3 sections with real guidance.`,
          "Do not dilute meaning; deepen analysis (examples, edge cases, checklist).",
        ].join("\n")
      : "";

  const userExpand = [
    `Topic phrase: "${topic}"`,
    "",
    `Now: ~${breakdown.wordCount} words; phrase ×${breakdown.keywordOccurrences}; internal /links: ${breakdown.internalLinks}; H2: ${breakdown.h2Count}.`,
    lenHint,
    "",
    "Return the FULL revised HTML fragment (not a summary). No markdown.",
    failed.length ? `\nFailed checks:\n- ${failed.join("\n- ")}` : "",
    ctxBlock ? `\n${ctxBlock}` : "",
    "",
    "Current HTML:",
    html,
  ].join("\n");

  return openaiChatHtml(
    [
      {
        role: "system",
        content: `You are a senior SEO editor. ${lang} Return only a complete HTML fragment. Preserve accuracy; expand weak sections; keep natural keyword use; ensure ≥2 relative internal links and ≥4 H2 if missing. First priority: reach ≥ ${SEO_SCORE_MIN_WORDS} words of useful content.`,
      },
      { role: "user", content: userExpand },
    ],
    maxTokens,
  );
}

async function expandSeoArticleIfWeak(
  html: string,
  topic: string,
  ctx: ArticleGenerationContext | undefined,
  maxTokens: number,
  locale: Locale,
): Promise<string> {
  let current = html;
  let b = scoreSeoHtml(current, topic, locale);

  for (let pass = 0; pass < 3 && b.score < 92; pass++) {
    try {
      const raw = await runSingleExpandPass(current, topic, ctx, maxTokens, b, locale);
      const next = normalizeModelHtml(topic, raw);
      const nb = scoreSeoHtml(next, topic, locale);
      const betterScore = nb.score > b.score;
      const sameOrBetterScore = nb.score >= b.score;
      const muchLonger = nb.wordCount >= b.wordCount + 80;
      if (betterScore || (sameOrBetterScore && nb.wordCount > b.wordCount) || (muchLonger && nb.score >= b.score - 5)) {
        current = next;
        b = nb;
      } else {
        break;
      }
    } catch {
      break;
    }
  }

  return current;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Generates a professional SEO-oriented HTML article. */
export async function generateSeoArticleHtml(topic: string, ctx?: ArticleGenerationContext): Promise<string> {
  const locale = ctx?.locale ?? "lt";
  const maxTokens = getArticleMaxTokens();
  const raw = await openaiChatHtml(
    [
      { role: "system", content: buildSystemPrompt(locale) },
      { role: "user", content: buildUserContent(topic, ctx) },
    ],
    maxTokens,
  );

  let html = normalizeModelHtml(topic, raw);
  html = await expandSeoArticleIfWeak(html, topic, ctx, maxTokens, locale);
  return html;
}
