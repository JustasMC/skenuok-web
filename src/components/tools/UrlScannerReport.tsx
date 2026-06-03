"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

type Props = {
  scores: ScanScores;
  scannedUrl: string | null;
  insights: string[];
  source: "openai" | "fallback" | null;
  meta: { lighthouseVersion: string | null; fetchTime: string | null } | null;
  page: PageMeta | null;
  siteTopic: string | null;
  siteDescription: string | null;
  generatorFromThemeHref: string | null;
  topicPayload: ScanPayload | null;
};

export function UrlScannerReport(props: Props) {
  const { scores, scannedUrl, insights, source, meta, page, siteTopic, siteDescription, generatorFromThemeHref, topicPayload } = props;
  const issueCount = [scores.performance, scores.seo, scores.accessibility].filter((s) => s != null && s < 90).length;

  return (
    <section aria-label="Skenavimo ataskaita" className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-2 border-b border-[var(--color-border)]/70 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-electric)]">Ataskaita</h2>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">Lighthouse · Svetainių analizė · rekomendacijos</p>
        </div>
        {scannedUrl ? (
          <p className="max-w-full break-all font-mono text-xs text-zinc-500 sm:max-w-md sm:text-left sm:text-right">{scannedUrl}</p>
        ) : null}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Balai</CardTitle>
            <CardDescription>
              {scannedUrl ? <span className="break-all text-zinc-400">{scannedUrl}</span> : "Lighthouse kategorijos (0–100)."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <ScoreRing label="Našumas" value={scores.performance} />
              <ScoreRing label="SEO" value={scores.seo} />
              <ScoreRing label="Prieiga" value={scores.accessibility} />
            </div>
            {meta?.lighthouseVersion ? <p className="mt-4 font-mono text-[10px] text-zinc-600">Lighthouse {meta.lighthouseVersion}</p> : null}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Analizė ir meta</CardTitle>
            <CardDescription>
              {source === "openai" ? "AI įžvalgos (OpenAI)" : "Automatinės įžvalgos iš auditų"}
              <span className="mt-2 block text-[var(--color-lime)]">
                {issueCount > 0
                  ? `Rasta ${issueCount} kategorijų žemiau 90 balų — verta optimizuoti.`
                  : "Kategorijos atrodo stipriai — vis tiek verta peržiūrėti smulkmenas."}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {siteTopic || siteDescription ? (
              <div className="group relative overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--color-electric)_28%,var(--color-border))] bg-[linear-gradient(155deg,color-mix(in_oklab,var(--color-electric)_14%,var(--color-surface))_0%,var(--color-surface)_42%,color-mix(in_oklab,var(--color-lime)_10%,var(--color-surface))_100%)] p-[1px] shadow-[0_0_32px_-8px_color-mix(in_oklab,var(--color-electric)_45%,transparent),0_0_1px_color-mix(in_oklab,var(--color-lime)_20%,transparent)] transition-shadow duration-300 hover:shadow-[0_0_40px_-6px_color-mix(in_oklab,var(--color-electric)_55%,transparent)]">
                <div className="relative flex gap-4 rounded-[15px] bg-[color-mix(in_oklab,var(--color-bg)_72%,transparent)] p-4 sm:p-5 md:gap-5">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center rounded-full border border-[color-mix(in_oklab,var(--color-electric)_40%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-electric)_10%,transparent)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-electric)]">
                        Svetainės esmė
                      </span>
                    </div>

                    <div>
                      <p className="text-[13px] font-semibold leading-tight text-white">Apie ką ši svetainė?</p>
                      {siteTopic ? (
                        <p className="mt-2 border-l-2 border-[color-mix(in_oklab,var(--color-electric)_70%,transparent)] pl-3 text-base font-semibold leading-snug text-[var(--color-lime)]">
                          {siteTopic}
                        </p>
                      ) : null}
                      {siteDescription ? <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-300">{siteDescription}</p> : null}
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
                    Raktažodžių kandidatai: <span className="text-[var(--color-electric)]">{page.keywords.join(", ")}</span>
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
                . Taip pat peržiūrėkite <Link href="/#paslaugos" className="font-semibold text-[var(--color-electric)] hover:underline">Paslaugas</Link> arba{" "}
                <Link href="/#kontaktai" className="font-semibold text-[var(--color-electric)] hover:underline">Kontaktus</Link>.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {generatorFromThemeHref ? (
        <Card className="border-[color-mix(in_oklab,var(--color-electric)_38%,var(--color-border))] bg-[linear-gradient(135deg,color-mix(in_oklab,var(--color-electric)_12%,var(--color-surface))_0%,var(--color-surface)_55%,color-mix(in_oklab,var(--color-lime)_8%,var(--color-surface))_100%)]">
          <CardHeader className="sm:flex sm:flex-row sm:items-start sm:justify-between sm:gap-6">
            <div className="space-y-1">
              <CardTitle className="text-lg sm:text-xl">SEO turinio generatorius pagal šią svetainę</CardTitle>
              <CardDescription className="max-w-2xl text-base leading-relaxed text-zinc-400">
                Tema parinkta pagal skenavimo kontekstą — generatoriuje galėsite ją pakoreguoti ir iškart generuoti.
              </CardDescription>
            </div>
            <Link href={generatorFromThemeHref} className="mt-4 inline-flex shrink-0 items-center justify-center rounded-xl bg-[var(--color-electric)] px-5 py-3 text-sm font-semibold text-[#041014] sm:mt-0">
              Atidaryti generatorių su tema
            </Link>
          </CardHeader>
        </Card>
      ) : null}

      <SeoTaskPanel insights={insights} scannedUrl={scannedUrl} siteTopic={siteTopic} />
      <TopicSuggestions payload={topicPayload} siteTopic={siteTopic} siteDescription={siteDescription} />
    </section>
  );
}
