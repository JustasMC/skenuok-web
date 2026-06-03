/** Extract visible page title and meta description from Lighthouse PSI JSON. */

type Audit = {
  displayValue?: string;
  explanation?: string;
  details?: {
    items?: { node?: { snippet?: string; type?: string } }[];
  };
};

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractPageMeta(raw: unknown): {
  title: string | null;
  description: string | null;
  keywords: string[];
} {
  const lh = raw as { lighthouseResult?: { audits?: Record<string, Audit> } } | undefined;
  const audits = lh?.lighthouseResult?.audits ?? {};

  const titleAudit = audits["document-title"];
  let title: string | null = null;
  if (titleAudit?.displayValue) {
    title = stripTags(titleAudit.displayValue).slice(0, 300);
  }
  const titleSnippet = titleAudit?.details?.items?.[0]?.node?.snippet;
  if (!title && titleSnippet) {
    const m = titleSnippet.match(/<title[^>]*>([^<]*)<\/title>/i);
    title = m?.[1]?.trim() ?? stripTags(titleSnippet).slice(0, 300);
  }

  const metaAudit = audits["meta-description"];
  let description: string | null = null;
  if (metaAudit?.displayValue) {
    description = stripTags(metaAudit.displayValue).slice(0, 500);
  }
  const metaSnippet = metaAudit?.details?.items?.[0]?.node?.snippet;
  if (!description && metaSnippet) {
    const m = metaSnippet.match(/content=["']([^"']+)["']/i);
    description = m?.[1]?.trim() ?? stripTags(metaSnippet).slice(0, 500);
  }

  const keywords = heuristicKeywords(title, description);

  return { title, description, keywords };
}

const STOP = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "our",
  "are",
  "was",
  "has",
  "have",
  "not",
  "but",
  "what",
  "all",
  "can",
  "how",
  "when",
  "where",
  "which",
  "who",
  "will",
  "just",
  "more",
  "about",
  "into",
  "than",
  "then",
  "also",
  "very",
  "here",
  "there",
  "been",
  "their",
  "they",
  "them",
  "its",
  "www",
  "http",
  "https",
  "com",
  "ir",
  "bei",
  "kad",
  "su",
  "iš",
  "o",
  "kaip",
  "tai",
  "jūsų",
  "mes",
  "yra",
  "ar",
  "apie",
  "visi",
  "tik",
  "jau",
  "ne",
  "nuo",
  "iki",
  "per",
  "po",
  "prie",
  "ant",
  "už",
]);

function heuristicKeywords(title: string | null, description: string | null): string[] {
  const text = `${title ?? ""} ${description ?? ""}`.toLowerCase();
  const words = text.match(/[a-ząčęėįšųūž0-9-]{3,}/gi) ?? [];
  const freq = new Map<string, number>();
  for (const w of words) {
    const k = w.toLowerCase();
    if (STOP.has(k)) continue;
    freq.set(k, (freq.get(k) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([w]) => w);
}
