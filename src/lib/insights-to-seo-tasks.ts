import type { SeoTask, SeoTaskPriority } from "@/lib/seo-task-types";

function newId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function normalizeInsightTitle(line: string): string {
  return line.replace(/^[-*•\d.)]+\s*/, "").replace(/\s+/g, " ").trim();
}

/** Heuristika pagal raktažodžius auditų tekste (LT/EN). */
export function inferPriority(text: string): SeoTaskPriority {
  const t = text.toLowerCase();
  if (
    /\b(lcp|cls|fid|inp|ttfb|performance|našum|bundle|javascript|cache|webp|avif|paveiksl|image|png|jpg|svg|lėt|slow|critical)\b/i.test(
      t,
    )
  ) {
    return "high";
  }
  if (/\b(seo|meta|title|description|schema|json-ld|indeks|search console|hreflang|canonical)\b/i.test(t)) {
    return "high";
  }
  if (/\b(prieiga|accessibility|kontrast|aria|focus|fokus|keyboard|screen reader)\b/i.test(t)) {
    return "medium";
  }
  return "medium";
}

export function buildSeoTasksFromInsights(insights: string[], sourceUrl: string): SeoTask[] {
  const now = new Date().toISOString();
  const out: SeoTask[] = [];

  for (const raw of insights) {
    const cleaned = normalizeInsightTitle(raw);
    const title = cleaned.slice(0, 500) || raw.slice(0, 500);
    if (!title) continue;

    out.push({
      id: newId(),
      title,
      priority: inferPriority(raw),
      sourceUrl,
      createdAt: now,
      done: false,
      source: "insight",
    });
  }

  return out;
}

export function taskDedupeKey(title: string, sourceUrl: string, source: "insight" | "manual"): string {
  const n = title.toLowerCase().replace(/\s+/g, " ").trim();
  return `${source}::${sourceUrl}::${n}`;
}

export function buildManualSeoTask(title: string, sourceUrl: string): SeoTask | null {
  const t = title.replace(/\s+/g, " ").trim().slice(0, 500);
  if (!t) return null;
  return {
    id: newId(),
    title: t,
    priority: "medium",
    sourceUrl,
    createdAt: new Date().toISOString(),
    done: false,
    source: "manual",
  };
}
