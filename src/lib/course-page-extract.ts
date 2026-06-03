/**
 * Lengvas HTML → tekstas kurso skaneriui (be cheerio), kad AI matytų kainą, programą, pažadus.
 */

const SCANNER_UA =
  "Mozilla/5.0 (compatible; FSAI-CourseScanner/1.0; +Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export type CoursePageExtract =
  | {
      ok: true;
      /** Išvalytas puslapio tekstas (apkarpytas) */
      text: string;
      charCount: number;
      truncated: boolean;
      /** Heuristika: galimos kainos eilutės (€, EUR, USD, „kaina“) */
      priceCandidates: string[];
    }
  | { ok: false; error: string };

function htmlToPlainText(html: string): string {
  let s = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
    .replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  s = s.replace(/<[^>]+>/g, " ");
  s = s
    .replace(/\s+/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .trim();
  return s;
}

/** Iš teksto ieško trumpų eilučių, kur gali būti kaina */
function extractPriceCandidates(text: string, max = 8): string[] {
  const lines = text.split(/(?<=[.!?])\s+/).flatMap((p) => p.split("\n"));
  const candidates: string[] = [];
  const priceLike =
    /(?:€|EUR|eur|usd|\$|£|gbp|\bEUR\b|\bUSD\b|\bGBP\b|\bkaina\b|\bprice\b|\bnuo\b|\b\d+[,.]?\d*\s*(?:€|EUR|usd|\$))/i;

  for (const line of lines) {
    const t = line.trim();
    if (t.length < 8 || t.length > 220) continue;
    if (priceLike.test(t)) {
      candidates.push(t.slice(0, 200));
      if (candidates.length >= max) break;
    }
  }

  if (candidates.length === 0) {
    const m = text.match(
      /(?:€|\$|EUR|USD)\s*[:\s]?\s*[\d.,]+\s*(?:€|EUR|usd|\$)?|[\d.,]+\s*(?:€|EUR|usd|\$)/gi,
    );
    if (m) {
      for (const x of m.slice(0, max)) {
        candidates.push(x.trim());
      }
    }
  }

  return [...new Set(candidates)];
}

export async function extractCoursePagePlainText(
  pageUrl: string,
  maxChars = 14_000,
  timeoutMs = 15_000,
): Promise<CoursePageExtract> {
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(pageUrl, {
      signal: ac.signal,
      headers: {
        "User-Agent": SCANNER_UA,
        Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "lt,en;q=0.9",
      },
      redirect: "follow",
      cache: "no-store",
    });

    if (!res.ok) {
      return { ok: false, error: `Puslapio užklausa ${res.status}` };
    }

    const ct = res.headers.get("content-type") ?? "";
    if (/application\/pdf|application\/json\b|video\/|audio\//i.test(ct)) {
      return { ok: false, error: "URL ne HTML puslapis (pvz. PDF ar medija)." };
    }

    const raw = await res.text();
    const plain = htmlToPlainText(raw);
    const truncated = plain.length > maxChars;
    const text = truncated ? plain.slice(0, maxChars) : plain;
    const priceCandidates = extractPriceCandidates(plain);

    return {
      ok: true,
      text,
      charCount: plain.length,
      truncated,
      priceCandidates,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Nepavyko nuskaityti puslapio";
    if (msg.includes("abort") || msg.includes("Aborted")) {
      return { ok: false, error: "Puslapio nuskaitymas nutrauktas (laukimas per ilgas)." };
    }
    return { ok: false, error: msg };
  } finally {
    clearTimeout(timer);
  }
}
