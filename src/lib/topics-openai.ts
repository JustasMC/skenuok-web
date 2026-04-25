import { z } from "zod";

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
}): Promise<TopicIdea[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return fallbackTopics(input);
  }

  const payload = {
    url: input.url,
    title: input.title,
    description: input.description,
    keywords: input.keywords,
    scores: input.scores,
    insights: input.insights.slice(0, 8),
  };

  const controller = new AbortController();
  const timeoutMs = 55_000;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

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
        temperature: 0.55,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'Tu esi SEO strategas. Atsakyk TIK galiojančiu JSON: {"topics":[{"title":"...","description":"...","seoKampas":"..."}, ...]}. Būtinai 5 temos. Lietuvių kalba.\n\nSVARBU — laukas "title": tai turi būti konkreti straipsnio antraštė H1 lygyje (hook), ne bendras raginimas. Blogai: "Rašykite apie fasadų valymą". Gerai: "5 didžiausios klaidos plaunant fasadą aukštu slėgiu: kaip nesugadinti apdailos?". Kiekviena antraštė 8–120 simbolių, su skaičiais, klausimu ar aiškiu pažadu, kad generatorius galėtų iškart rašyti straipsnį.\n\n"description": 2–4 sakiniai — ką tiksliai aptars straipsnis ir kam jis naudingas.\n\n"seoKampas": 2–4 sakiniai — kodėl ši tema DABAR aktuali šiai svetainei (title/description/raktažodžiai, Lighthouse signalai).',
          },
          {
            role: "user",
            content: `Pagal skenavimo santrauką sugeneruok 5 turinio temas su pavadinimu, aprašymu ir SEO kampo logika.\n\n${JSON.stringify(payload)}`,
          },
        ],
      }),
    });
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      return fallbackTopics(input);
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
    return fallbackTopics(input);
  }

  const safe = responseSchema.safeParse(parsed);
  if (!safe.success || safe.data.topics.length < 3) {
    return fallbackTopics(input);
  }

  return safe.data.topics.slice(0, 5);
}

function kampasForScore(
  label: string,
  scores: { performance: number | null; seo: number | null; accessibility: number | null },
): string {
  const parts: string[] = [];
  if (scores.seo != null && scores.seo < 85) parts.push("SEO kategorija dar turi rezervą — tema padeda sutvirtinti matomumą.");
  if (scores.performance != null && scores.performance < 85)
    parts.push("Našumo balas rodo, kad turinys turi būti lengvas ir greitai kraunamas.");
  if (scores.accessibility != null && scores.accessibility < 85)
    parts.push("Prieiga svarbi konversijai — tema gali apjungti UX ir turinio aiškumą.");
  if (parts.length === 0) parts.push("Stiprūs pagrindai — tema padeda išlaikyti pozicijas ir plėsti ilgąjį uodegą.");
  return `${label}: ${parts.join(" ")}`;
}

function fallbackTopics(input: {
  title: string | null;
  description: string | null;
  keywords: string[];
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
}): TopicIdea[] {
  const base = input.title ?? "svetainė";
  const k = input.keywords.slice(0, 3).join(", ") || "SEO, našumas, konversijos";
  const scores = input.scores;
  return [
    {
      title: `SEO ${base}: 7 žingsniai, kurie realiai kelia organinį srautą (2026)`,
      description: `Praktinis gidas: techninis SEO, vidinės nuorodos ir turinio planas pagal raktažodžius: ${k}.`,
      seoKampas: kampasForScore("Organinis augimas", scores),
    },
    {
      title: "5 klaidos meta aprašuose ir H1, kurios žudo konversijas iš Google",
      description: "Checklist: title, description, CTA, greitis ir prieiga — ką pataisyti šią savaitę.",
      seoKampas: kampasForScore("Konversijų diagnostika", scores),
    },
    {
      title: `Pradedantiesiems: ${base} — ilgojo formato straipsnio struktūra su H2 ir FAQ`,
      description: "Struktūra su H2/H3, FAQ bloku ir vidinėmis nuorodomis į pagrindinius puslapius.",
      seoKampas: kampasForScore("Turinio gylis", scores),
    },
    {
      title: "GA4 ir Search Console: 8 KPI, kuriuos verta stebėti po turinio pakeitimų",
      description: "Kokius įvykius fiksuoti ir kaip susieti su pajamomis bei užklausomis.",
      seoKampas: kampasForScore("Matavimas ir ROI", scores),
    },
    {
      title: "30 dienų turinio kalendorius: pavyzdinė lentelė su raktažodžių klasteriais",
      description: "Šablono pavyzdys su temomis, publikavimo ritmu ir vidinėmis nuorodomis.",
      seoKampas: kampasForScore("Nuoseklumas ir planavimas", scores),
    },
  ];
}
