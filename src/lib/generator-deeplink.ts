/**
 * Nuoroda į SEO generatorių su užpildyta tema ir (pasirinktinai) kontekstu iš URL skanerio.
 */
export function buildGeneratorUrl(
  topic: string,
  siteTopic?: string | null,
  siteDescription?: string | null,
): string {
  const params = new URLSearchParams();
  params.set("topic", topic);
  const ctx = siteTopic?.trim();
  if (ctx) params.set("context", ctx.slice(0, 400));
  const tone = siteDescription?.trim();
  if (tone) params.set("tone", tone.slice(0, 520));
  return `/irankiai/seo-generatorius?${params.toString()}`;
}

/** Numatytoji straipsnio tema pagal skenavimo duomenis. */
export function defaultGeneratorTopicFromScan(input: {
  siteTopic: string | null;
  siteDescription: string | null;
  pageTitle: string | null;
  pageH1: string | null;
  scannedHost: string | null;
}): string {
  const st = input.siteTopic?.trim();
  if (st) return `${st}: SEO straipsnio planas ir raktažodžiai`;
  const h1 = input.pageH1?.trim();
  if (h1) return `SEO straipsnis pagal H1: ${h1}`;
  const t = input.pageTitle?.trim();
  if (t) return `SEO straipsnis pagal puslapį: ${t}`;
  const host = input.scannedHost?.trim();
  if (host) return `SEO turinys svetainei ${host}`;
  return "SEO straipsnis jūsų nišai";
}
