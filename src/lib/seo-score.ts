/**
 * Paprastas SEO „balas“ (0–100) pagal taisykles: H1, raktažodžio dažnis, vidinės nuorodos, min. ilgis.
 */

/** Mažiausias žodžių skaičius, kad „ilgis“ patikra būtų žalia (turi sutapti su generavimo promptais). */
export const SEO_SCORE_MIN_WORDS = 600;

export type SeoScoreCheck = {
  id: string;
  pass: boolean;
  label: string;
  /** Kai nepraėjo — ką daryti tolesniam bandymui */
  fixHint: string;
};

export type SeoScoreBreakdown = {
  score: number;
  hasKeywordInH1: boolean;
  keywordOccurrences: number;
  internalLinks: number;
  wordCount: number;
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

export function scoreSeoHtml(html: string, keywordRaw: string): SeoScoreBreakdown {
  const keyword = keywordRaw.trim().toLowerCase();
  const plain = textContent(html);
  const plainLower = plain.toLowerCase();

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const h1Text = h1Match ? stripTags(h1Match[1]).toLowerCase() : "";
  const hasKeywordInH1 = keyword.length > 0 && h1Text.includes(keyword);

  let keywordOccurrences = 0;
  if (keyword.length > 0) {
    const re = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
    const matches = plainLower.match(re);
    keywordOccurrences = matches?.length ?? 0;
  }

  const internalLinks = (html.match(/<a[^>]+href=["']\/[^"']*["']/gi) ?? []).length;

  const wordCount = countWords(plain);

  const checks: SeoScoreCheck[] = [
    {
      id: "h1",
      pass: hasKeywordInH1,
      label: "Raktažodis H1 antraštėje",
      fixHint:
        "Pakeiskite generavimo temą arba po peržiūros įsitikinkite, kad H1 turėtų pagrindinį raktažodį (natūraliai).",
    },
    {
      id: "freq",
      pass: keywordOccurrences >= 3,
      label: "Raktažodis bent 3 kartus tekste",
      fixHint: "Pakartokite generavimą su aiškesniu raktažodžiu arba pridėkite sinonimų į antraštes ir pastraipas.",
    },
    {
      id: "links",
      pass: internalLinks >= 2,
      label: "Bent 2 vidinės nuorodos (href=\"/...\")",
      fixHint: "Įterpkite bent dvi relatyvias nuorodas, pvz. į /paslaugos ir /kontaktai (generatorius dažnai jas įdeda automatiškai).",
    },
    {
      id: "len",
      pass: wordCount >= SEO_SCORE_MIN_WORDS,
      label: `Straipsnis ilgesnis nei ${SEO_SCORE_MIN_WORDS} žodžių`,
      fixHint: `Sugeneruokite iš naujo arba naudokite „Bandyti dar kartą“ — reikia bent ${SEO_SCORE_MIN_WORDS} žodžių.`,
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);

  return {
    score,
    hasKeywordInH1,
    keywordOccurrences,
    internalLinks,
    wordCount,
    checks,
  };
}
