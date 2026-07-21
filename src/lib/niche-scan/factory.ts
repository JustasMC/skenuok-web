import { affiliatesForNiche } from "@/lib/affiliates/catalog";
import type { Locale } from "@/lib/i18n/config";
import type {
  AffiliateRec,
  NicheId,
  NicheScanError,
  NicheScanReport,
  NicheScanRequest,
} from "@/lib/niche-scan/types";

const MAX_IMAGE_CHARS = 5_500_000;

function visionModel(): string {
  return process.env.OPENAI_VISION_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || "gpt-4o";
}

function textModel(): string {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

function nicheSystemPrompt(niche: NicheId, locale: Locale): string {
  const lang =
    locale === "en"
      ? "Respond in English only. Return ONE JSON object."
      : "Atsakyk TIK lietuvių kalba. Grąžink VIENĄ JSON objektą.";

  const shape = `
JSON shape:
{
  "title": string,
  "summary": string (2-4 sentences),
  "sections": [{ "heading": string, "body": string }],
  "bullets": string[] (4-8 actionable items),
  "productHints": string[] (0-5 short product/service names for affiliates)
}`;

  const nicheHint: Record<NicheId, string> = {
    web: "You are a senior web/SEO auditor. Analyze the URL or description for performance, tech, a11y, SEO. Suggest concrete fixes.",
    crypto:
      "You are a technical analysis educator (not financial advice). Given a symbol/pair, outline indicators (RSI, MA, volume), risk framing, and when custom algo bots help. Disclaim: not investment advice.",
    auto: "You are an automotive analyst. Given VIN and/or listing URL and optional photos: estimate value vs listing, common model faults, visible flaws. Suggest history checks.",
    beauty:
      "You are a skincare advisor (not a doctor). From the face/skin photo describe visible dryness/redness/oiliness carefully, propose a gentle care routine. Suggest product types (not medical diagnosis).",
    home: "You are an interior/yard design consultant. From the photo suggest layout, materials, plants, lighting ideas with practical next steps.",
    tech: "You are a hardware deal advisor. From photo or specs compare categories, note pros/cons, and suggest when to buy vs wait.",
  };

  return `${lang}\n\n${nicheHint[niche]}\n${shape}\nNo markdown fences. Do not invent VIN registry data.`;
}

type AiJson = {
  title?: string;
  summary?: string;
  sections?: { heading?: string; body?: string }[];
  bullets?: string[];
  productHints?: string[];
};

async function callOpenAI(params: {
  niche: NicheId;
  locale: Locale;
  text?: string;
  imageDataUrl?: string;
}): Promise<AiJson | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [
    {
      type: "text",
      text: params.text?.trim()
        ? `User input:\n${params.text.trim()}`
        : "Analyze the attached image for this niche scanner.",
    },
  ];

  const hasImage = Boolean(params.imageDataUrl);
  if (params.imageDataUrl) {
    if (params.imageDataUrl.length > MAX_IMAGE_CHARS) {
      throw new Error("IMAGE_TOO_LARGE");
    }
    userContent.push({
      type: "image_url",
      image_url: { url: params.imageDataUrl },
    });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: hasImage ? visionModel() : textModel(),
      response_format: { type: "json_object" },
      temperature: 0.4,
      max_tokens: 2200,
      messages: [
        { role: "system", content: nicheSystemPrompt(params.niche, params.locale) },
        { role: "user", content: userContent },
      ],
    }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`OpenAI ${res.status}: ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AiJson;
  } catch {
    return null;
  }
}

function fallbackReport(
  niche: NicheId,
  locale: Locale,
  text: string | undefined,
  affiliates: AffiliateRec[],
): NicheScanReport {
  const isLt = locale === "lt";
  return {
    ok: true,
    niche,
    title: isLt ? "Bazinė ataskaita (be AI)" : "Basic report (no AI)",
    summary: isLt
      ? "OpenAI nepasiekiamas arba atsakymas nevalidus. Patikrinkite OPENAI_API_KEY ir bandykite dar kartą. Žemiau — bendros gairės pagal jūsų įvestį."
      : "OpenAI unavailable or invalid response. Check OPENAI_API_KEY and retry. Below are generic guidelines from your input.",
    sections: [
      {
        heading: isLt ? "Įvestis" : "Input",
        body: text?.trim() || (isLt ? "(tik paveikslėlis / tuščia)" : "(image only / empty)"),
      },
    ],
    bullets: isLt
      ? [
          "Įsitikinkite, kad API raktas sukonfigūruotas serveryje.",
          "Pakartokite skenavimą su aiškesne įvestimi.",
          "B2B automatizacijai — žr. partnerių pasiūlymus žemiau.",
        ]
      : [
          "Ensure the API key is configured on the server.",
          "Retry with clearer input.",
          "For B2B automation, see partner offers below.",
        ],
    affiliates,
    source: "fallback",
  };
}

function normalizeReport(
  niche: NicheId,
  locale: Locale,
  ai: AiJson,
  affiliates: AffiliateRec[],
): NicheScanReport {
  const isLt = locale === "lt";
  const sections = (ai.sections ?? [])
    .filter((s) => s?.heading && s?.body)
    .map((s) => ({ heading: String(s.heading), body: String(s.body) }))
    .slice(0, 8);
  const bullets = (ai.bullets ?? []).map(String).filter(Boolean).slice(0, 10);
  return {
    ok: true,
    niche,
    title: ai.title?.trim() || (isLt ? "AI skenavimo ataskaita" : "AI scan report"),
    summary: ai.summary?.trim() || (isLt ? "Ataskaita paruošta." : "Report ready."),
    sections:
      sections.length > 0
        ? sections
        : [{ heading: isLt ? "Santrauka" : "Summary", body: ai.summary?.trim() || "—" }],
    bullets:
      bullets.length > 0
        ? bullets
        : [isLt ? "Peržiūrėkite rekomendacijas ir partnerių pasiūlymus." : "Review recommendations and partner offers."],
    affiliates,
    source: "openai",
  };
}

export async function runNicheScan(
  input: NicheScanRequest,
  locale: Locale,
): Promise<NicheScanReport | NicheScanError> {
  const text = input.text?.trim();
  const image = input.imageDataUrl?.trim();

  if (!text && !image) {
    return {
      ok: false,
      error:
        locale === "en"
          ? "Provide text and/or an image."
          : "Pateikite tekstą ir/arba paveikslėlį.",
      status: 422,
    };
  }

  if (input.niche === "web" && text && /^https?:\/\//i.test(text) && !image) {
    // Soft path: still run AI narrative; UI also links to full PSI scanner.
  }

  try {
    const ai = await callOpenAI({
      niche: input.niche,
      locale,
      text,
      imageDataUrl: image,
    });
    const hints = ai?.productHints?.map(String).filter(Boolean) ?? [];
    const affiliates = affiliatesForNiche(input.niche, locale, hints);
    if (!ai) {
      return fallbackReport(input.niche, locale, text, affiliates);
    }
    return normalizeReport(input.niche, locale, ai, affiliates);
  } catch (e) {
    if (e instanceof Error && e.message === "IMAGE_TOO_LARGE") {
      return {
        ok: false,
        error:
          locale === "en"
            ? "Image too large (max ~4MB)."
            : "Paveikslėlis per didelis (maks. ~4MB).",
        status: 413,
      };
    }
    const affiliates = affiliatesForNiche(input.niche, locale, []);
    return fallbackReport(input.niche, locale, text, affiliates);
  }
}
