"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import { buildGeneratorUrl } from "@/lib/generator-deeplink";
import type { TopicIdea } from "@/lib/topics-openai";

export type ScanPayload = {
  url: string;
  title: string | null;
  description: string | null;
  keywords: string[];
  scores: { performance: number | null; seo: number | null; accessibility: number | null };
  insights: string[];
};

export function TopicSuggestions({
  payload,
  siteTopic,
  siteDescription,
}: {
  payload: ScanPayload | null;
  siteTopic?: string | null;
  siteDescription?: string | null;
}) {
  const { locale } = useLocale();
  const t = useDict().tools.topics;
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState<TopicIdea[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!payload) {
      setTopics([]);
      setError(null);
      return;
    }

    const snapshot = payload;
    let cancelled = false;
    async function run() {
      setLoading(true);
      setError(null);
      setTopics([]);
      const bodyPayload = JSON.stringify({
        url: snapshot.url,
        title: snapshot.title,
        description: snapshot.description,
        keywords: snapshot.keywords,
        scores: snapshot.scores,
        insights: snapshot.insights,
        locale,
      });

      try {
        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const res = await fetch("/api/topics/suggest", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: bodyPayload,
            });
            let body: { ok?: boolean; topics?: TopicIdea[]; error?: string };
            try {
              body = (await res.json()) as typeof body;
            } catch {
              if (attempt === 0) {
                await new Promise((r) => setTimeout(r, 500));
                continue;
              }
              if (!cancelled) setError(t.badJson);
              return;
            }
            if (!res.ok) {
              if (attempt === 0 && res.status >= 502) {
                await new Promise((r) => setTimeout(r, 500));
                continue;
              }
              if (!cancelled) setError(body.error ?? t.fail);
              return;
            }
            if (body.topics && !cancelled) setTopics(body.topics);
            return;
          } catch {
            if (attempt === 0) {
              await new Promise((r) => setTimeout(r, 600));
              continue;
            }
            if (!cancelled) setError(t.network);
            return;
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [payload, locale, t.badJson, t.fail, t.network]);

  if (!payload) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.title}</CardTitle>
        <CardDescription>
          {t.description} <span className="text-zinc-300">{payload.url}</span>
          {payload.title ? (
            <>
              {" "}
              · <span className="font-medium text-[var(--color-lime)]">{payload.title}</span>
            </>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--color-border)]">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-[var(--color-electric)] to-[var(--color-lime)]" />
            </div>
            <p className="text-sm text-zinc-500">{t.loading}</p>
          </div>
        ) : null}

        {error ? <p className="text-sm text-rose-400">{error}</p> : null}

        {!loading && topics.length > 0 ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {topics.map((topic, idx) => (
              <li key={`${idx}-${topic.title}`}>
                <div className="flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_55%,transparent)] p-4">
                  <h4 className="font-semibold text-white">{topic.title}</h4>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400">{topic.description}</p>
                  {topic.seoKampas ? (
                    <div className="mt-3 rounded-lg border border-[color-mix(in_oklab,var(--color-lime)_25%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-lime)_6%,transparent)] px-3 py-2 text-xs leading-relaxed text-zinc-300">
                      <span className="font-semibold text-[var(--color-lime)]">{t.seoAngle} </span>
                      {topic.seoKampas}
                    </div>
                  ) : null}
                  <Link
                    href={buildGeneratorUrl(topic.title, siteTopic, siteDescription)}
                    className="mt-4 inline-flex justify-center rounded-lg bg-[var(--color-electric)] px-3 py-2 text-xs font-semibold text-[#041014] transition hover:bg-[var(--color-electric-dim)]"
                  >
                    {t.generate}
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {!loading && !error && topics.length === 0 ? (
          <p className="text-sm text-zinc-500">{t.empty}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
