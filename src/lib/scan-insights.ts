import type { CategoryKey } from "@/lib/pagespeed";

type Audit = {
  id?: string;
  title?: string;
  description?: string;
  score?: number | null;
  displayValue?: string;
};

/** Meta + H1 signalai — AI kontekstui ir fallback „svetainės esmei“. */
export type ScanPageContext = {
  title: string | null;
  description: string | null;
  h1: string | null;
  keywords: string[];
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

export function buildFallbackInsights(raw: unknown, scores: Record<CategoryKey, number | null>): string[] {
  const tips: string[] = [];
  const perf = scores.performance;
  const seo = scores.seo;
  const a11y = scores.accessibility;

  if (perf != null && perf < 90) {
    tips.push(`Performance (${perf}/100): optimizuokite paveikslėlius (WebP/AVIF), įjunkite tinkamus cache antraštes ir sumažinkite kritinio kelio JavaScript.`);
  }
  if (seo != null && seo < 95) {
    tips.push(`SEO (${seo}/100): patikrinkite unikalius title ir meta description, struktūrizuotus duomenis (JSON-LD) ir indeksavimo klaidas Search Console.`);
  }
  if (a11y != null && a11y < 95) {
    tips.push(`Accessibility (${a11y}/100): pagerinkite kontrastą, fokuso būsenas ir ARIA etiketes interaktyviems elementams.`);
  }

  for (const row of pickTopAudits(raw, 6)) {
    tips.push(`${row.title}: ${row.detail.replace(/\s+/g, " ").slice(0, 220)}`);
  }

  return tips.slice(0, 8);
}

/** Kai nėra OpenAI arba JSON nepavyko — trumpa esmė iš title / meta / H1. */
export function buildFallbackSiteIdentity(ctx: ScanPageContext): { siteTopic: string; siteDescription: string } {
  const fromTitle = ctx.title?.split(/\s*[|–—]\s*/)[0]?.trim() ?? "";
  const siteTopic = (fromTitle || ctx.h1?.trim() || "Svetainė").slice(0, 160);

  const descParts = [ctx.description, ctx.h1 && ctx.h1 !== fromTitle ? ctx.h1 : null].filter(Boolean) as string[];
  let siteDescription = descParts.join(" ").replace(/\s+/g, " ").trim();
  if (!siteDescription) {
    siteDescription =
      "Nepavyko automatiškai apibūdinti veiklos — žemiau pateikti techniniai duomenys vis tiek naudingi optimizuojant puslapį.";
  }
  siteDescription = siteDescription.slice(0, 480);

  return { siteTopic, siteDescription };
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
 * Vienas OpenAI kvietimas: rekomendacijos + svetainės tema ir santrauka (JSON).
 * Rekomendacijos turi sieti auditus su tuo, ką daro svetainė (title, meta, H1).
 */
export async function buildAiScanAnalysis(
  raw: unknown,
  scores: Record<CategoryKey, number | null>,
  ctx: ScanPageContext,
): Promise<{ insights: string[]; siteTopic: string; siteDescription: string } | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const top = pickTopAudits(raw, 10);
  const payload = {
    scores,
    audits: top.map((t) => ({ id: t.id, title: t.title, detail: t.detail.slice(0, 400) })),
    pageSignals: {
      documentTitle: ctx.title,
      metaDescription: ctx.description,
      mainHeadingH1: ctx.h1,
      keywordHints: ctx.keywords.slice(0, 12),
    },
  };

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `Tu esi vyresnysis SEO ir web našumo konsultantas. Atsakyk TIK lietuvių kalba.

Tavo užduotis — grąžinti VIENĄ JSON objektą su laukais:
- "insights": masyvas 5–7 eilučių (string). Kiekviena eilutė — konkreti, verslo savininkui suprantama rekomendacija. Sieti Lighthouse problemas su svetainės veikla (documentTitle, metaDescription, mainHeadingH1): vietoj sausų terminų naudok kontekstą (pvz. jei tai paslaugų svetainė — kaip tai veikia klientų pasitikėjimą / konversiją).
- "siteTopic": labai trumpa frazė (pvz. 3–8 žodžiai) — kokia tai svetainė / kokia veikla.
- "siteDescription": 1–2 sakiniai — apie ką verslas / svetainė; remkis title, meta, H1 ir raktažodžių užuominomis. Aiškiai nurodyk tikslinę auditoriją ir bendrą komunikacijos toną (formalus / draugiškas ir pan.) — ši santrauka vėliau gali būti naudojama turinio generatoriui kaip „prekės ženklo“ kontekstas.

Jei trūksta signalų, vis tiek padaryk geriausią įmanomą apibendrinimą pagal tai, kas duota. Nenaudok markdown, tik paprastą tekstą JSON reikšmėse.`,
        },
        {
          role: "user",
          content: `Remiantis šiais duomenimis, užpildyk JSON:\n${JSON.stringify(payload)}`,
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
