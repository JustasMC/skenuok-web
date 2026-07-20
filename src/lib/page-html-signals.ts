/**
 * On-page HTML signals beyond Lighthouse (headings, OG, schema, content volume).
 */

const SCANNER_UA =
  "Mozilla/5.0 (compatible; FSAI-UrlScanner/1.0; +Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type PageHtmlSignals = {
  h1: string | null;
  h1Count: number;
  h2: string[];
  h3: string[];
  canonical: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  robotsMeta: string | null;
  hasJsonLd: boolean;
  wordCount: number;
  imgCount: number;
  imgMissingAlt: number;
  internalLinkApprox: number;
  thinContent: boolean;
};

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function metaContent(html: string, attr: "name" | "property", key: string): string | null {
  const re = new RegExp(
    `<meta[^>]+${attr}=["']${key}["'][^>]*content=["']([^"']*)["'][^>]*>|<meta[^>]+content=["']([^"']*)["'][^>]*${attr}=["']${key}["'][^>]*>`,
    "i",
  );
  const m = html.match(re);
  const v = (m?.[1] ?? m?.[2] ?? "").trim();
  return v || null;
}

function extractHeadings(html: string, tag: "h1" | "h2" | "h3", limit: number): string[] {
  const re = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null && out.length < limit) {
    const t = stripTags(m[1] ?? "").replace(/\s+/g, " ").trim();
    if (t) out.push(t.slice(0, 220));
  }
  return out;
}

function countWords(text: string): number {
  const m = text.match(/[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž0-9]+/g);
  return m?.length ?? 0;
}

export function extractPageHtmlSignalsFromHtml(html: string): PageHtmlSignals {
  const h1s = extractHeadings(html, "h1", 5);
  const h2 = extractHeadings(html, "h2", 12);
  const h3 = extractHeadings(html, "h3", 12);

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    ?? html.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i);
  const canonical = canonicalMatch?.[1]?.trim() || null;

  const robotsMeta = metaContent(html, "name", "robots");
  const ogTitle = metaContent(html, "property", "og:title");
  const ogDescription = metaContent(html, "property", "og:description");
  const hasJsonLd = /application\/ld\+json/i.test(html);

  const bodyMatch = html.match(/<body\b[^>]*>([\s\S]*)<\/body>/i);
  const bodyHtml = bodyMatch?.[1] ?? html;
  const plain = stripTags(
    bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " "),
  );
  const wordCount = countWords(plain);

  const imgs = [...bodyHtml.matchAll(/<img\b[^>]*>/gi)];
  let imgMissingAlt = 0;
  for (const img of imgs) {
    const tag = img[0];
    const alt = tag.match(/\balt=["']([^"']*)["']/i);
    if (!alt || !alt[1].trim()) imgMissingAlt += 1;
  }

  const internalLinkApprox = (bodyHtml.match(/<a\b[^>]+href=["']\/[^"']*["']/gi) ?? []).length;
  const thinContent = wordCount > 0 && wordCount < 120;

  return {
    h1: h1s[0] ?? null,
    h1Count: h1s.length,
    h2,
    h3,
    canonical,
    ogTitle,
    ogDescription,
    robotsMeta,
    hasJsonLd,
    wordCount,
    imgCount: imgs.length,
    imgMissingAlt,
    internalLinkApprox,
    thinContent,
  };
}

export function extractFirstH1FromHtml(html: string): string | null {
  return extractPageHtmlSignalsFromHtml(html).h1;
}

/**
 * Fetches the live page and extracts on-page SEO/content signals.
 * Failure is soft — returns empty signals (never throws for network/parse errors).
 */
export async function fetchPageHtmlSignals(
  pageUrl: string,
  opts?: { signal?: AbortSignal; timeoutMs?: number; acceptLanguage?: string },
): Promise<PageHtmlSignals> {
  const empty: PageHtmlSignals = {
    h1: null,
    h1Count: 0,
    h2: [],
    h3: [],
    canonical: null,
    ogTitle: null,
    ogDescription: null,
    robotsMeta: null,
    hasJsonLd: false,
    wordCount: 0,
    imgCount: 0,
    imgMissingAlt: 0,
    internalLinkApprox: 0,
    thinContent: false,
  };

  const timeoutMs = opts?.timeoutMs ?? 12_000;
  const ac = new AbortController();
  const outer = opts?.signal;
  const onAbort = () => ac.abort();
  if (outer) {
    if (outer.aborted) ac.abort();
    else outer.addEventListener("abort", onAbort, { once: true });
  }
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(pageUrl, {
      signal: ac.signal,
      headers: {
        "User-Agent": SCANNER_UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": opts?.acceptLanguage ?? "en,lt;q=0.8",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) return empty;

    const ct = res.headers.get("content-type") ?? "";
    if (/application\/pdf|application\/json\b|video\/|audio\//i.test(ct)) {
      return empty;
    }

    const raw = await res.text();
    // Cap parse size for pathological pages
    return extractPageHtmlSignalsFromHtml(raw.slice(0, 900_000));
  } catch {
    return empty;
  } finally {
    clearTimeout(timer);
    if (outer) outer.removeEventListener("abort", onAbort);
  }
}
