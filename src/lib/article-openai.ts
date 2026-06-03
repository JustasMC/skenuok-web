import { scoreSeoHtml, SEO_SCORE_MIN_WORDS } from "@/lib/seo-score";

export type ArticleGenerationContext = {
  /** Svetainės niša / veikla (iš URL skanerio, pvz. siteTopic) */
  siteNiche?: string | null;
  /** Tonas, auditorija, veiklos santrauka (iš skanerio siteDescription) */
  brandVoice?: string | null;
};

/** Tikslas virš slenksčio — palieka maržą, kad po redagavimo vis tiek būtų ≥ SEO_SCORE_MIN_WORDS. */
const SEO_WORD_TARGET = Math.max(SEO_SCORE_MIN_WORDS + 40, 640);

function getArticleMaxTokens(): number {
  const n = Number.parseInt(process.env.OPENAI_ARTICLE_MAX_TOKENS ?? "", 10);
  if (Number.isFinite(n) && n >= 2000 && n <= 16_000) return n;
  return 7000;
}

function buildSystemPrompt(): string {
  return `Tu esi profesionalus SEO turinio rašytojas. Tavo HTML bus automatiškai vertinamas balais (0–100): H1 su raktažodžiu, frazės pasikartojimai, vidinės nuorodos, žodžių skaičius.
Grąžink TIK HTML fragmentą lietuvių kalba — be markdown, be \`\`\`, be paaiškinimų.

GRIEŽTI REIKALAVIMAI (kad balas būtų 100):
1) Vienas <h1> — tekstas turi aiškiai turėti vartotojo nurodytą pagrindinę frazę (tą pačią arba labai artimą formuluotę).
2) Bent 6 skirtingi <h2> skyriai; kur tinka — po H2 naudok <h3>.
3) Ilgis: bent ${SEO_WORD_TARGET} žodžių (įskaitant lietuviškas raides). Skaičiuojami atskiri žodžiai; trumpi fragmentai neprideda balo. Jei abejoji — rašyk ilgiau: pavyzdžiai, žingsniai, rizikos, santrauka.
4) Raktažodis: vartotojo TIKSLIĄ frazę panaudok pilname tekste (be HTML žymų) bent 4 kartus natūraliai: įžangoje, keliose vidurinėse dalyse, išvadoje.
5) Vidinės nuorodos: PRIVALO būti bent dvi: <a href="/paslaugos">…</a> ir <a href="/kontaktai">…</a> (ankoras lietuviškai).
6) Formatavimas: dažnai <strong>; bent du <ul> sąrašai su po 3–5 <li>.
7) Kiekviena pastraipa <p>; logiškas srautas.
8) Draudžiama: <html>, <body>, <head>, <script>, <style>.
9) Tonas / niša iš vartotojo — derink žodyną.`;
}

function buildUserContent(topic: string, ctx?: ArticleGenerationContext): string {
  const niche = ctx?.siteNiche?.trim();
  const voice = ctx?.brandVoice?.trim();
  const lines = [
    `Pagrindinė frazė / tema (PRIVALAI pakartoti pilname tekste bent 4 kartus, įskaitant H1): "${topic}"`,
    "",
    `PRIORITETAS: bent ${SEO_WORD_TARGET} žodžių — tai būtina 100 balų vertinime (žemiau ${SEO_SCORE_MIN_WORDS} = nepraeina).`,
    "Straipsnio H1 turi atitikti šią temą.",
  ];
  if (niche) lines.push("", `Svetainės niša (iš skenavimo): ${niche}`);
  if (voice) lines.push("", `Tonas ir auditorija — laikykis nuosekliai: ${voice}`);
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
    throw new Error("Trūksta OPENAI_API_KEY straipsniui generuoti.");
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.38,
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
): Promise<string> {
  const failed = breakdown.checks.filter((c) => !c.pass).map((c) => `${c.label} (${c.fixHint})`);
  const niche = ctx?.siteNiche?.trim();
  const voice = ctx?.brandVoice?.trim();
  const ctxBlock = [niche ? `Niša: ${niche}` : "", voice ? `Tonas: ${voice}` : ""].filter(Boolean).join("\n");

  const wordsNeeded = Math.max(280, SEO_WORD_TARGET - breakdown.wordCount);
  const lenHint = breakdown.wordCount < SEO_SCORE_MIN_WORDS
    ? [
        "",
        `KRITIŠKA: Dabar ~${breakdown.wordCount} žodžių. AUTOMATINIS vertinimas reikalauja bent ${SEO_SCORE_MIN_WORDS}.`,
        `PRIVALAI pridėti mažiausiai ${wordsNeeded} naujų žodžių (naujos <p> pastraipos ir/ar nauji H2/H3 skyriai su turiniu).`,
        "Nekeisk esamų nuorodų ir H1 prasmės; plėsk turinį: praktiniai patarimai, klaidos, checklist, FAQ stiliaus pastraipos.",
      ].join("\n")
    : "";

  const userExpand = [
    `Tema / frazė (lieka ta pati, min. 4 pasikartojimai tekste): "${topic}"`,
    "",
    `Dabar: ~${breakdown.wordCount} žodžių; frazė ${breakdown.keywordOccurrences}×; vidinės nuorodos su href="/..." — ${breakdown.internalLinks}.`,
    `Taisyklės: ≥${SEO_SCORE_MIN_WORDS} žodžių, frazė ≥3×, ≥2 vidinės nuorodos (/...), H1 su frazė.`,
    lenHint,
    "",
    "Grąžink VISĄ pataisytą HTML (ne santrauką). Markdown draudžiamas.",
    failed.length ? `\nNeįvykdyta:\n- ${failed.join("\n- ")}` : "",
    ctxBlock ? `\n${ctxBlock}` : "",
    "",
    "Dabartinis HTML:",
    html,
  ].join("\n");

  return openaiChatHtml(
    [
      {
        role: "system",
        content: `Tu SEO redaktorius. Grąžink tik pilną HTML fragmentą lietuviškai. Privalai išlaikyti / įterpti <a href="/paslaugos"> ir <a href="/kontaktai">. Pirmiausia užtikrink bent ${SEO_SCORE_MIN_WORDS} žodžių.`,
      },
      { role: "user", content: userExpand },
    ],
    maxTokens,
  );
}

/**
 * Kelios plėtimo iteracijos, kol balas ≥100 arba nebėra progreso (žodžių skaičius / bendras balas).
 */
async function expandSeoArticleIfWeak(
  html: string,
  topic: string,
  ctx: ArticleGenerationContext | undefined,
  maxTokens: number,
): Promise<string> {
  let current = html;
  let b = scoreSeoHtml(current, topic);

  for (let pass = 0; pass < 3 && b.score < 100; pass++) {
    try {
      const raw = await runSingleExpandPass(current, topic, ctx, maxTokens, b);
      const next = normalizeModelHtml(topic, raw);
      const nb = scoreSeoHtml(next, topic);
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

/**
 * Generates SEO-oriented HTML article in Lithuanian. Returns raw HTML string.
 */
export async function generateSeoArticleHtml(topic: string, ctx?: ArticleGenerationContext): Promise<string> {
  const maxTokens = getArticleMaxTokens();
  const raw = await openaiChatHtml(
    [
      { role: "system", content: buildSystemPrompt() },
      { role: "user", content: buildUserContent(topic, ctx) },
    ],
    maxTokens,
  );

  let html = normalizeModelHtml(topic, raw);
  html = await expandSeoArticleIfWeak(html, topic, ctx, maxTokens);
  return html;
}
