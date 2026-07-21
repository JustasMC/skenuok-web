"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AffiliateProductCard } from "@/components/affiliates/AffiliateProductCard";
import { useDict, useLocale } from "@/components/i18n/LocaleProvider";
import type { AffiliateRec, NicheId, NicheScanReport } from "@/lib/niche-scan/types";

const MAX_BYTES = 4 * 1024 * 1024;

function deviceFingerprint(): string {
  if (typeof window === "undefined") return "";
  const key = "sk_device_fp";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `fp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return "";
  }
}

type Props = { niche: NicheId };

export function NicheScannerClient({ niche }: Props) {
  const dict = useDict();
  const { locale } = useLocale();
  const t = dict.nicheScan;
  const meta = t.niches[niche];

  const [text, setText] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needCredits, setNeedCredits] = useState(false);
  const [needSession, setNeedSession] = useState(false);
  const [report, setReport] = useState<(NicheScanReport & { creditsLeft?: number }) | null>(null);

  const onFile = useCallback(async (file: File | null) => {
    setError(null);
    if (!file) {
      setImageDataUrl(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError(locale === "en" ? "Please choose an image file." : "Pasirinkite paveikslėlio failą.");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(locale === "en" ? "Image too large (max 4 MB)." : "Paveikslėlis per didelis (maks. 4 MB).");
      return;
    }
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("read failed"));
      reader.readAsDataURL(file);
    });
    setImageDataUrl(dataUrl);
  }, [locale]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNeedCredits(false);
    setNeedSession(false);
    setReport(null);

    try {
      // Ensure anonymous session cookie exists
      await fetch("/api/session", { method: "GET" }).catch(() => {});

      const res = await fetch("/api/niche-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-device-fingerprint": deviceFingerprint(),
        },
        body: JSON.stringify({
          niche,
          locale,
          text: text.trim() || undefined,
          imageDataUrl: imageDataUrl || undefined,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        needCredits?: boolean;
        needSession?: boolean;
        ok?: boolean;
        title?: string;
        summary?: string;
        sections?: { heading: string; body: string }[];
        bullets?: string[];
        affiliates?: AffiliateRec[];
        source?: "openai" | "fallback";
        creditsLeft?: number;
        niche?: NicheId;
      };

      if (!res.ok) {
        if (data.needCredits) setNeedCredits(true);
        if (data.needSession) setNeedSession(true);
        setError(data.error ?? (locale === "en" ? "Scan failed" : "Skenavimas nepavyko"));
        return;
      }

      if (data.ok && data.title && data.summary) {
        setReport({
          ok: true,
          niche,
          title: data.title,
          summary: data.summary,
          sections: data.sections ?? [],
          bullets: data.bullets ?? [],
          affiliates: data.affiliates ?? [],
          source: data.source ?? "openai",
          creditsLeft: data.creditsLeft,
        });
      } else {
        setError(locale === "en" ? "Unexpected response" : "Netikėtas atsakymas");
      }
    } catch {
      setError(locale === "en" ? "Network error" : "Tinklo klaida");
    } finally {
      setBusy(false);
    }
  }

  const prefersImage = niche === "beauty" || niche === "home" || niche === "tech" || niche === "auto";

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:p-6">
        <p className="text-sm text-zinc-400">{t.costHint}</p>

        <div>
          <label htmlFor={`niche-text-${niche}`} className="mb-1.5 block text-sm font-medium text-zinc-200">
            {t.textLabel}
          </label>
          <textarea
            id={`niche-text-${niche}`}
            className="site-input min-h-[5.5rem] w-full"
            placeholder={meta.placeholder || t.textPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4000}
          />
        </div>

        <div>
          <label htmlFor={`niche-img-${niche}`} className="mb-1.5 block text-sm font-medium text-zinc-200">
            {t.imageLabel}
            {prefersImage ? " *" : ""}
          </label>
          <input
            id={`niche-img-${niche}`}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="block w-full text-sm text-zinc-400 file:mr-3 file:rounded-lg file:border-0 file:bg-[var(--color-electric)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#041014]"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
          <p className="mt-1 text-xs text-zinc-500">{t.imageHint}</p>
          {imageDataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageDataUrl}
              alt=""
              className="mt-3 max-h-48 rounded-lg border border-[var(--color-border)] object-contain"
            />
          ) : null}
        </div>

        {error ? (
          <p className="text-sm text-red-400" role="alert">
            {error}
          </p>
        ) : null}

        {(needCredits || needSession) && (
          <div className="flex flex-wrap gap-2">
            {needCredits ? (
              <Link href="/pricing" className="site-btn-primary rounded-lg px-3 py-2 text-sm font-semibold">
                {t.pricingCta}
              </Link>
            ) : null}
            {needSession ? (
              <Link href="/login" className="site-btn-secondary rounded-lg px-3 py-2 text-sm font-semibold">
                {t.loginCta}
              </Link>
            ) : null}
          </div>
        )}

        <button
          type="submit"
          disabled={busy}
          className="site-btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold disabled:opacity-60"
        >
          {busy ? t.scanning : t.submit}
        </button>
      </form>

      {report ? (
        <section className="space-y-5" aria-labelledby="niche-report-heading">
          <div>
            <h2 id="niche-report-heading" className="text-xl font-semibold text-white">
              {report.title}
            </h2>
            {typeof report.creditsLeft === "number" ? (
              <p className="mt-1 text-sm text-[var(--color-lime)]">
                {t.creditsLeft.replace("{n}", String(report.creditsLeft))}
              </p>
            ) : null}
            <p className="mt-3 text-zinc-300">{report.summary}</p>
          </div>

          {report.sections.map((s) => (
            <div key={s.heading}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{s.heading}</h3>
              <p className="mt-1 whitespace-pre-wrap text-zinc-200">{s.body}</p>
            </div>
          ))}

          {report.bullets.length > 0 ? (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-400">{t.bullets}</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-zinc-200">
                {report.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {report.affiliates.length > 0 ? (
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
                {t.affiliates}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {report.affiliates.map((a) => (
                  <AffiliateProductCard key={a.slug} item={a} locale={locale} />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
