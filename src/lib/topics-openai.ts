import { z } from "zod";
import type { Locale } from "@/lib/i18n/config";
import { analysisLanguageInstruction } from "@/lib/i18n/analysis-locale";

const responseSchema = z.object({
  topics: z.array(
    z.object({
      title: z.string().min(3),
      description: z.string().min(10),
      seoKampas: z.string().min(15),
    }),
  ),
});

export type TopicIdea = { title: string; description: string; seoKampas: string };

export async function suggestTopicsWithOpenAI(input: {
  url: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  insights: string[];
  locale?: Locale;
}): Promise<TopicIdea[]> {
  const locale = input.locale ?? "lt";
  const outputLanguage = locale === "en" ? "en" : "lt";
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackTopics(input, locale);
  }

  const payload = {
    url: input.url,
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    scores: input.scores,
    insights: input.insights.slice(0, 8),
    outputLanguage,
  };

  const controller = new AbortController();
  const timeoutMs = 55_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const lang = analysisLanguageInstruction(locale);

  const systemLt = `${lang}

Tu esi vyresnysis SEO turinio strategas. Grąžink TIK validų JSON:
{"topics":[{"title":"...","description":"...","seoKampas":"..."}, ...]} — tiksliai 5 temos.

VISOS string reikšmės — lietuvių kalba.
"title": konkretus H1 antraštės hook'as (8–120 simb.).
"description": 2–4 sakiniai — ką straipsnis apima ir kam naudinga.
"seoKampas": 2–4 sakiniai — kodėl tema tinka ŠIAI svetainei DABAR (title/meta + Lighthouse).`;

  const systemEn = `${lang}

You are a senior SEO content strategist. Return ONLY valid JSON:
{"topics":[{"title":"...","description":"...","seoKampas":"..."}, ...]} — exactly 5 topics.

ALL string values in English only.
"title": concrete H1-ready headline (8–120 chars).
"description": 2–4 sentences on coverage and audience.
"seoKampas": 2–4 sentences on why this topic fits THIS site NOW.`;

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        temperature: 0.5,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: locale === "en" ? systemEn : systemLt,
          },
          {
            role: "user",
            content:
              locale === "en"
                ? `outputLanguage=en. From this scan summary, produce 5 content topics in English:\n\n${JSON.stringify(payload)}`
                : `outputLanguage=lt. Pagal šią skenavimo santrauką sukurk 5 turinio temas TIK lietuvių kalba:\n\n${JSON.stringify(payload)}`,
          },
        ],
      }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return fallbackTopics(input, locale);
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const raw = data.choices?.[0]?.message?.content?.trim() ?? "{}";
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return fallbackTopics(input, locale);
  }

  const safe = responseSchema.safeParse(parsed);
  if (!safe.success || safe.data.topics.length < 3) {
    return fallbackTopics(input, locale);
  }

  return safe.data.topics.slice(0, 5);
}

function kampasForScore(
  label: string,
  scores: { performance: number | null; seo: number | null; accessibility: number | null },
  locale: Locale,
): string {
  const en = locale === "en";
  const parts: string[] = [];
  if (scores.seo != null && scores.seo < 85) {
    parts.push(
      en
        ? "SEO still has headroom — this topic strengthens visibility."
        : "SEO kategorija dar turi rezervą — tema padeda sutvirtinti matomumą.",
    );
  }
  if (scores.performance != null && scores.performance < 85) {
    parts.push(
      en
        ? "Performance score suggests content should stay light and fast."
        : "Našumo balas rodo, kad turinys turi būti lengvas ir greitai kraunamas.",
    );
  }
  if (scores.accessibility != null && scores.accessibility < 85) {
    parts.push(
      en
        ? "Accessibility affects conversion — topic can bridge UX and clarity."
        : "Prieiga svarbi konversijai — tema gali apjungti UX ir turinio aiškumą.",
    );
  }
  if (parts.length === 0) {
    parts.push(
      en
        ? "Strong foundations — topic helps defend rankings and grow long-tail."
        : "Stiprūs pagrindai — tema padeda išlaikyti pozicijas ir plėsti ilgąjį uodegą.",
    );
  }
  return `${label}: ${parts.join(" ")}`;
}

function fallbackTopics(
  input: {
    title: string | null;
    description: string | null;
    keywords: string[];
    scores: { performance: number | null; seo: number | null; accessibility: number | null };
  },
  locale: Locale = "lt",
): TopicIdea[] {
  const en = locale === "en";
  const base = input.title ?? (en ? "website" : "svetainė");
  const k = input.keywords.slice(0, 3).join(", ") || (en ? "SEO, performance, conversions" : "SEO, našumas, konversijos");
  const scores = input.scores;

  if (en) {
    return [
      {
        title: `SEO for ${base}: 7 steps that actually grow organic traffic (2026)`,
        description: `Practical guide: technical SEO, internal links and a content plan around: ${k}.`,
        seoKampas: kampasForScore("Organic growth", scores, locale),
      },
      {
        title: "5 meta description & H1 mistakes that kill Google conversions",
        description: "Checklist: title, description, CTA, speed and accessibility — what to fix this week.",
        seoKampas: kampasForScore("Conversion diagnostics", scores, locale),
      },
      {
        title: `Beginners: ${base} — long-form article structure with H2 and FAQ`,
        description: "Structure with H2/H3, FAQ block and internal links to key pages.",
        seoKampas: kampasForScore("Content depth", scores, locale),
      },
      {
        title: "GA4 and Search Console: 8 KPIs worth tracking after content changes",
        description: "Which events to track and how to connect them to revenue and queries.",
        seoKampas: kampasForScore("Measurement & ROI", scores, locale),
      },
      {
        title: "30-day content calendar: sample table with keyword clusters",
        description: "Template with topics, publishing cadence and internal linking.",
        seoKampas: kampasForScore("Consistency & planning", scores, locale),
      },
    ];
  }

  return [
    {
      title: `SEO ${base}: 7 žingsniai, kurie realiai kelia organinį srautą (2026)`,
      description: `Praktinis gidas: techninis SEO, vidinės nuorodos ir turinio planas pagal raktažodžius: ${k}.`,
      seoKampas: kampasForScore("Organinis augimas", scores, locale),
    },
    {
      title: "5 klaidos meta aprašuose ir H1, kurios žudo konversijas iš Google",
      description: "Checklist: title, description, CTA, greitis ir prieiga — ką pataisyti šią savaitę.",
      seoKampas: kampasForScore("Konversijų diagnostika", scores, locale),
    },
    {
      title: `Pradedantiesiems: ${base} — ilgojo formato straipsnio struktūra su H2 ir FAQ`,
      description: "Struktūra su H2/H3, FAQ bloku ir vidinėmis nuorodomis į pagrindinius puslapius.",
      seoKampas: kampasForScore("Turinio gylis", scores, locale),
    },
    {
      title: "GA4 ir Search Console: 8 KPI, kuriuos verta stebėti po turinio pakeitimų",
      description: "Kokius įvykius fiksuoti ir kaip susieti su pajamomis bei užklausomis.",
      seoKampas: kampasForScore("Matavimas ir ROI", scores, locale),
    },
    {
      title: "30 dienų turinio kalendorius: pavyzdinė lentelė su raktažodžių klasteriais",
      description: "Šablono pavyzdys su temomis, publikavimo ritmu ir vidinėmis nuorodomis.",
      seoKampas: kampasForScore("Nuoseklumas ir planavimas", scores, locale),
    },
  ];
}
