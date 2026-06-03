export type CategoryKey = "performance" | "seo" | "accessibility";

export type ParsedPsiResult = {
  requestedUrl: string;
  finalUrl: string;
  strategy: "mobile" | "desktop";
  scores: Record<CategoryKey, number | null>;
  fetchTimeMs: string | null;
  lighthouseVersion: string | null;
  userAgent: string | null;
  raw: unknown;
};

function scoreTo100(score: number | null | undefined): number | null {
  if (score == null || Number.isNaN(score)) return null;
  return Math.round(score * 100);
}

export async function runPageSpeedInsights(params: {
  url: string;
  strategy: "mobile" | "desktop";
  apiKey: string;
  /** Nutraukia ilgą PageSpeed užklausą (pvz., vartotojas uždarė skirtuką). */
  signal?: AbortSignal;
}): Promise<ParsedPsiResult> {
  const { url, strategy, apiKey, signal } = params;
  console.log("[pagespeed] request", { url, strategy, hasApiKey: Boolean(apiKey) });
  const u = new URL("https://www.googleapis.com/pagespeedonline/v5/runPagespeed");
  u.searchParams.set("url", url);
  u.searchParams.set("key", apiKey);
  u.searchParams.set("strategy", strategy);
  u.searchParams.append("category", "performance");
  u.searchParams.append("category", "seo");
  u.searchParams.append("category", "accessibility");

  const res = await fetch(u.toString(), {
    method: "GET",
    headers: { Accept: "application/json" },
    next: { revalidate: 0 },
    signal,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`PageSpeed API ${res.status}: ${text.slice(0, 500)}`);
  }

  const json = (await res.json()) as Record<string, unknown>;
  const lh = json.lighthouseResult as Record<string, unknown> | undefined;
  const categories = (lh?.categories ?? {}) as Record<string, { score?: number | null }>;
  const env = (lh?.environment ?? {}) as Record<string, unknown>;
  const finalUrl =
    typeof lh?.finalUrl === "string" ? lh.finalUrl : typeof json.id === "string" ? json.id : url;
  const timing = json.analysisUTCTiming as { fetchTime?: string } | undefined;
  const fetchTime = timing?.fetchTime ?? null;

  const scores: Record<CategoryKey, number | null> = {
    performance: scoreTo100(categories.performance?.score ?? null),
    seo: scoreTo100(categories.seo?.score ?? null),
    accessibility: scoreTo100(categories.accessibility?.score ?? null),
  };

  return {
    requestedUrl: typeof json.id === "string" ? json.id : url,
    finalUrl,
    strategy,
    scores,
    fetchTimeMs: fetchTime,
    lighthouseVersion: typeof lh?.lighthouseVersion === "string" ? lh.lighthouseVersion : null,
    userAgent: typeof env.userAgent === "string" ? env.userAgent : null,
    raw: json,
  };
}

export function normalizeUrlInput(input: string): string {
  const t = input.trim();
  if (!t) throw new Error("Tuščias URL");
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}
