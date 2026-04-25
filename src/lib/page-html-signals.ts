/**
 * Papildomi signalai iš HTML (Lighthouse jų neturi): pvz. pirmoji <h1>.
 */

const SCANNER_UA =
  "Mozilla/5.0 (compatible; FSAI-UrlScanner/1.0; +Windows NT 10.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function extractFirstH1FromHtml(html: string): string | null {
  const re = /<h1\b[^>]*>([\s\S]*?)<\/h1>/gi;
  const m = re.exec(html);
  if (!m?.[1]) return null;
  const t = stripTags(m[1]).replace(/\s+/g, " ").trim();
  return t ? t.slice(0, 400) : null;
}

/**
 * Nuskaito puslapį ir ištraukia pirmąją H1 (jei yra). Nesėkmė nekelia klaidos — grąžinama h1: null.
 */
export async function fetchPageHtmlSignals(
  pageUrl: string,
  opts?: { signal?: AbortSignal; timeoutMs?: number },
): Promise<{ h1: string | null }> {
  const timeoutMs = opts?.timeoutMs ?? 12_000;
  const ac = new AbortController();
  const outer = opts?.signal;
  const onAbort = () => ac.abort();
  if (outer) {
    if (outer.aborted) {
      ac.abort();
    } else {
      outer.addEventListener("abort", onAbort, { once: true });
    }
  }
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

    if (!res.ok) return { h1: null };

    const ct = res.headers.get("content-type") ?? "";
    if (/application\/pdf|application\/json\b|video\/|audio\//i.test(ct)) {
      return { h1: null };
    }

    const raw = await res.text();
    return { h1: extractFirstH1FromHtml(raw) };
  } catch {
    return { h1: null };
  } finally {
    clearTimeout(timer);
    if (outer) outer.removeEventListener("abort", onAbort);
  }
}
