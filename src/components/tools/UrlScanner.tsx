"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { buildGeneratorUrl, defaultGeneratorTopicFromScan } from "@/lib/generator-deeplink";
import { ScoreRing } from "@/components/tools/ScoreRing";
import { SeoTaskPanel } from "@/components/tools/SeoTaskPanel";
import { TopicSuggestions, type ScanPayload } from "@/components/tools/TopicSuggestions";

type ScanScores = {
  performance: number | null;
  seo: number | null;
  accessibility: number | null;
};

type PageMeta = {
  title: string | null;
  description: string | null;
  keywords: string[];
  h1: string | null;
};

export function UrlScanner() {
  const [url, setUrl] = useState("");
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("mobile");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<ScanScores | null>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [source, setSource] = useState<"openai" | "fallback" | null>(null);
  const [meta, setMeta] = useState<{ lighthouseVersion: string | null; fetchTime: string | null } | null>(null);
  const [scannedUrl, setScannedUrl] = useState<string | null>(null);
  const [page, setPage] = useState<PageMeta | null>(null);
  const [siteTopic, setSiteTopic] = useState<string | null>(null);
  const [siteDescription, setSiteDescription] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setScores(null);
    setInsights([]);
    setSource(null);
    setMeta(null);
    setScannedUrl(null);
    setPage(null);
    setSiteTopic(null);
    setSiteDescription(null);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, strategy }),
      });
      const body = (await res.json()) as {
        ok?: boolean;
        error?: string;
        scores?: ScanScores;
        insights?: string[];
        insightsSource?: "openai" | "fallback";
        url?: string;
        siteTopic?: string;
        siteDescription?: string;
        page?: PageMeta;
        meta?: { lighthouseVersion: string | null; fetchTime: string | null };
      };

      if (!res.ok) {
        setError(body.error ?? "Skanavimas nepavyko");
        return;
      }

      if (body.scores) setScores(body.scores);
      if (body.insights) setInsights(body.insights);
      if (body.insightsSource) setSource(body.insightsSource);
      if (body.meta) setMeta(body.meta);
      if (body.url) setScannedUrl(body.url);
      setSiteTopic(body.siteTopic ?? null);
      setSiteDescription(body.siteDescription ?? null);
      setPage(body.page ?? { title: null, description: null, keywords: [], h1: null });
    } catch {
      setError("Tinklo klaida. Bandykite dar kartą.");
    } finally {
      setLoading(false);
    }
  }

  const issueCount =
    scores == null
      ? null
      : [scores.performance, scores.seo, scores.accessibility].filter((s) => s != null && s < 90).length;

  const topicPayload: ScanPayload | null = useMemo(() => {
    if (!scores || !scannedUrl) return null;
    return {
      url: scannedUrl,
      title: page?.title ?? null,
      description: page?.description ?? null,
      keywords: page?.keywords ?? [],
      scores,
      insights,
    };
  }, [scores, scannedUrl, page, insights]);

  const generatorFromThemeHref = useMemo(() => {
    if (!scores || !scannedUrl) return null;
    let scannedHost: string | null = null;
    try {
      scannedHost = new URL(scannedUrl).hostname;
    } catch {
      scannedHost = null;
    }
    const topic = defaultGeneratorTopicFromScan({
      siteTopic,
      siteDescription,
      pageTitle: page?.title ?? null,
      pageH1: page?.h1 ?? null,
      scannedHost,
    });
    return buildGeneratorUrl(topic, siteTopic, siteDescription);
  }, [scores, scannedUrl, siteTopic, siteDescription, page]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <Card className="overflow-hidden border-[var(--color-border)]/80">
        <CardHeader>
          <CardTitle>Įveskite svetainės adresą</CardTitle>
          <CardDescription>
            SEO URL skenavimas per Google PageSpeed (Lighthouse). Rezultatas — Svetainių analizė su balais, meta, H1 ir rekomendacijomis; toliau galite eiti į SEO strategiją, generatorių ar <Link href="/#kontaktai" className="text-[var(--color-electric)] hover:underline">Kontaktus</Link> dėl įgyvendinimo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <label htmlFor="scan-url" className="text-sm font-medium text-zinc-300">
                URL
              </label>
              <input
                id="scan-url"
                name="url"
                type="text"
                inputMode="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="example.com arba https://example.com"
                className="site-input min-h-12 w-full text-base sm:min-h-11 sm:text-sm"
                autoComplete="url"
              />
            </div>
            <div className="w-full space-y-2 sm:w-44 sm:shrink-0">
              <label htmlFor="scan-strategy" className="text-sm font-medium text-zinc-300">
                Strategija
              </label>
              <select
                id="scan-strategy"
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as "mobile" | "desktop")}
                className="site-input min-h-12 w-full cursor-pointer sm:min-h-11"
                aria-label="Lighthouse: mobilusis ar stalinis vaizdas"
              >
                <option value="mobile">Mobile</option>
                <option value="desktop">Desktop</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="site-btn-primary w-full min-h-12 min-w-0 sm:min-h-11 sm:min-w-[9.5rem] sm:shrink-0"
            >
              {loading ? "Skenuojama…" : "Paleisti skaną"}
            </button>
          </form>
          {error ? (
            <p className="mt-4 rounded-lg border border-rose-500/30 bg-rose-500/5 px-3 py-2 text-sm text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {scores ? (
        <section aria-label="Skenavimo ataskaita" className="space-y-6 sm:space-y-8">
          <div className="flex flex-col gap-2 border-b border-[var(--color-border)]/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-electric)]">Ataskaita</h2>
              <p className="mt-1 text-xs text-zinc-500 sm:text-sm">Lighthouse · Svetainių analizė · rekomendacijos</p>
            </div>
            {scannedUrl ? <p className="max-w-full break-all font-mono text-xs text-zinc-500 sm:max-w-md sm:text-left sm:text-right">{scannedUrl}</p> : null}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Balai</CardTitle>
                <CardDescription>
                  {scannedUrl ? (
                    <span className="break-all text-zinc-400">{scannedUrl}</span>
                  ) : (
                    "Lighthouse kategorijos (0–100)."
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <ScoreRing label="Našumas" value={scores.performance} />
                  <ScoreRing label="SEO" value={scores.seo} />
                  <ScoreRing label="Prieiga" value={scores.accessibility} />
                </div>
                {meta?.lighthouseVersion ? (
                  <p className="mt-4 font-mono text-[10px] text-zinc-600">Lighthouse {meta.lighthouseVersion}</p>
                ) : null}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Analizė ir meta</CardTitle>
                <CardDescription>
                  {source === "openai" ? "AI įžvalgos (OpenAI)" : "Automatinės įžvalgos iš auditų"}
                  {issueCount != null ? (
                    <span className="mt-2 block text-[var(--color-lime)]">
                      {issueCount > 0
                        ? `Rasta ${issueCount} kategorijų žemiau 90 balų — verta optimizuoti.`
                        : "Kategorijos atrodo stipriai — vis tiek verta peržiūrėti smulkmenas."}
                    </span>
                  ) : null}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {siteTopic || siteDescription ? (
                  <div className="group relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_28%,var(--color-border))] bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-electric)_14%,var(--color-surface))_0%,var(--color-surface)_42%,color-mix(in_oklab,var(--color-lime)_10%,var(--color-surface))_100%)] p-[1px] shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--color-electric)_45%,transparent),0_0_1px_color-mix(in_oklab,var(--color-lime)_20%,transparent)] transition-shadow duration-300 hover:shadow-[0_0_40px_-6px_color-mix(in_oklab,var(--color-electric)_55%,transparent)]">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-24 h-48 w-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-electric)_22%,transparent)_0%,transparent_70%)] opacity-90 blur-px transition-opacity group-hover:opacity-100"
                    />
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -bottom-20 -left-10 h-40 w-40 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-lime)_12%,transparent)_0%,transparent_70%)] opacity-70"
                    />
                    <div className="relative flex gap-4 rounded-[15px] bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] p-4 sm:p-5 md:gap-5">
                      <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_oklab,var(--color-electric)_35%,var(--color-border))] bg-[linear-gradient(160deg,color-mix(in_oklab,var(--color-electric)_18%,var(--color-surface-2)),var(--color-surface))] shadow-[inset_0_1px_0_color-mix(in_oklab,white_8%,transparent),0_0_20px_-4px_color-mix(in_oklab,var(--color-electric)_50%,transparent)]">
                        <svg
                          className="h-6 w-6 text-[var(--color-electric)]"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden
                        >
                          <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                          <path d="M20 3v4" />
                          <path d="M22 5h-4" />
                          <path d="M4 17v2" />
                          <path d="M5 18H3" />
                        </svg>
                      </div>

                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--color-electric)_40%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_10%,transparent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">
                            Svetainės esmė
                          </span>
                          {source === "openai" ? (
                            <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--color-lime)_35%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_8%,transparent)] px-2 py-0.5 text-[10px] font-medium text-[var(--color-lime-dim)]">
                              AI kontekstas
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full border border-zinc-700/80 bg-zinc-900/50 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                              Meta + H1
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-[13px] font-semibold leading-tight text-white">Apie ką ši svetainė?</p>
                          {siteTopic ? (
                            <p className="mt-2 border-l-2 border-[color-mix(in_oklab,var(--color-electric)_70%,transparent)] pl-3 text-base font-semibold leading-snug text-[var(--color-lime)] [text-shadow:0_0_24px_color-mix(in_oklab,var(--color-lime)_25%,transparent)]">
                              {siteTopic}
                            </p>
                          ) : null}
                          {siteDescription ? (
                            <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-300">{siteDescription}</p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {page?.title || page?.description || page?.h1 ? (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4 text-sm">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Title / description / H1</p>
                    {page.title ? <p className="mt-2 font-medium text-white">{page.title}</p> : null}
                    {page.description ? <p className="mt-2 text-zinc-400">{page.description}</p> : null}
                    {page.h1 ? (
                      <p className="mt-2 text-zinc-300">
                        <span className="text-zinc-500">H1: </span>
                        {page.h1}
                      </p>
                    ) : null}
                    {page.keywords.length > 0 ? (
                      <p className="mt-3 text-xs text-zinc-500">
                        Raktažodžių kandidatai:{" "}
                        <span className="text-[var(--color-electric)]">{page.keywords.join(", ")}</span>
                      </p>
                    ) : null}
                  </div>
                ) : null}

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Rekomendacijos</p>
                  <ul className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
                    {insights.map((line, i) => (
                      <li key={`${i}-${line.slice(0, 24)}`} className="flex gap-3">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_60%,transparent)] p-4 sm:p-5 text-sm text-zinc-400">
                  <p className="font-medium text-zinc-200">Kitas žingsnis</p>
                  <p className="mt-2 leading-relaxed">
                    Žemiau — greitas kelias į{" "}
                    {generatorFromThemeHref ? (
                      <Link href={generatorFromThemeHref} className="font-semibold text-[var(--color-electric)] hover:underline">
                        SEO generatorių su parinkta tema
                      </Link>
                    ) : (
                      <Link href="/irankiai/seo-generatorius" className="font-semibold text-[var(--color-electric)] hover:underline">
                        SEO generatorių
                      </Link>
                    )}
                    . Taip pat peržiūrėkite <Link href="/#paslaugos" className="font-semibold text-[var(--color-electric)] hover:underline">Paslaugas</Link> arba <Link href="/#kontaktai" className="font-semibold text-[var(--color-electric)] hover:underline">Kontaktus</Link> — jei
                    reikia, kad techninį ir web SEO sutvarkytume pagal ataskaitą.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {generatorFromThemeHref ? (
            <Card className="border-[color-mix(in_oklab,var(--color-electric)_38%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-electric)_12%,var(--color-surface))_0%,var(--color-surface)_55%,color-mix(in_oklab,var(--color-lime)_8%,var(--color-surface))_100%)] shadow-[0_0_36px_-12px_color-mix(in_oklab,var(--color-electric)_40%,transparent)]">
              <CardHeader className="sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="space-y-1">
                  <CardTitle className="text-lg sm:text-xl">SEO turinio generatorius pagal šią svetainę</CardTitle>
                  <CardDescription className="max-w-2xl text-base leading-relaxed text-zinc-400">
                    {siteTopic ? (
                      <>
                        Temą parinkome iš AI aptiktos <span className="font-medium text-[var(--color-lime)]">svetainės esmės</span> ir
                        skenavimo duomenų — generatoriuje galėsite pataisyti antraštę ir iškart generuoti straipsnį su SEO
                        balu.
                      </>
                    ) : (
                      <>
                        Pagal puslapio pavadinimą, H1 ar domeną paruošėme pradinę straipsnio temą — toliau tikslinkite
                        generatoriuje ir generuokite HTML su vidinėmis nuorodomis.
                      </>
                    )}
                  </CardDescription>
                </div>
                <Link
                  href={generatorFromThemeHref}
                  className="mt-4 inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-electric)] px-5 py-3 text-sm font-semibold text-[#041014] shadow-[var(--shadow-glow)] transition hover:bg-[var(--color-electric-dim)] sm:mt-0"
                >
                  Atidaryti generatorių su tema
                </Link>
              </CardHeader>
              <CardContent className="border-t border-[var(--color-border)]/80 pt-4 text-sm text-zinc-500">
                Žemiau — papildomos <span className="text-zinc-400">AI temų idėjos</span> pagal Lighthouse įžvalgas; šis mygtukas jau perduoda{" "}
                <span className="font-mono text-xs text-[var(--color-electric)]">context</span> ir{" "}
                <span className="font-mono text-xs text-[var(--color-electric)]">tone</span> iš skenavimo.
              </CardContent>
            </Card>
          ) : null}

          <SeoTaskPanel insights={insights} scannedUrl={scannedUrl} siteTopic={siteTopic} />

          <TopicSuggestions payload={topicPayload} siteTopic={siteTopic} siteDescription={siteDescription} />
        </section>
      ) : null}
    </div>
  );
}
