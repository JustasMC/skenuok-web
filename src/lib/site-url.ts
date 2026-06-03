/**
 * Kanoninis domenas be galo `/` — metadata, sitemap, robots, JSON-LD, Stripe base.
 * NEXT_PUBLIC_SITE_URL turi būti nustatytas produkcijoje; build metu Railway gali suteikti RAILWAY_PUBLIC_DOMAIN.
 */
export function getSiteOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/+$/, "");
  }
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    const host = railway.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
    return `https://${host}`;
  }
  return "http://localhost:3000";
}

/** Saugus metadataBase Next Metadata API. */
export function getMetadataBaseUrl(): URL {
  try {
    return new URL(getSiteOrigin());
  } catch {
    return new URL("http://localhost:3000");
  }
}

/** Absoliutus kanoninis URL maršrutui (pvz. `/tools/scanner`). */
export function getCanonicalPath(path: string): string {
  const origin = getSiteOrigin().replace(/\/+$/, "");
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${suffix}`;
}
