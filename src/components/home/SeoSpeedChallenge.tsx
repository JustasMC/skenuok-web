"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useDict } from "@/components/i18n/LocaleProvider";
import { SectionHeader } from "@/components/ui/SectionHeader";

const CORRECT = [1, 1, 0, 1] as const;

export function SeoSpeedChallenge() {
  const t = useDict().challenge;
  const questions = useMemo(
    () => [
      { prompt: t.q1, options: [t.q1a, t.q1b, t.q1c] },
      { prompt: t.q2, options: [t.q2a, t.q2b, t.q2c] },
      { prompt: t.q3, options: [t.q3a, t.q3b, t.q3c] },
      { prompt: t.q4, options: [t.q4a, t.q4b, t.q4c] },
    ],
    [t],
  );

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null]);
  const [done, setDone] = useState(false);

  const current = questions[step]!;
  const selected = answers[step];
  const score = answers.reduce<number>((sum, a, i) => sum + (a === CORRECT[i] ? 1 : 0), 0);

  const verdict = score <= 1 ? t.verdict0 : score <= 3 ? t.verdict2 : t.verdict4;

  function pick(optionIndex: number) {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = optionIndex;
      return next;
    });
  }

  function restart() {
    setStep(0);
    setAnswers([null, null, null, null]);
    setDone(false);
  }

  return (
    <section
      id="seo-issukis"
      className="site-section border-t border-[var(--color-border)]/60"
      aria-labelledby="seo-challenge-title"
    >
      <div className="site-shell">
        <SectionHeader
          id="seo-challenge-title"
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
        />

        <div className="mt-10 max-w-2xl sm:mt-12">
          {!done ? (
            <div className="space-y-6">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                {step + 1} / {questions.length}
              </p>
              <fieldset>
                <legend className="text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {current.prompt}
                </legend>
                <div className="mt-4 space-y-2" role="radiogroup" aria-label={current.prompt}>
                  {current.options.map((opt, i) => {
                    const active = selected === i;
                    return (
                      <button
                        key={opt}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => pick(i)}
                        className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm leading-relaxed motion-safe:transition-colors motion-safe:duration-200 sm:text-base ${
                          active
                            ? "border-[var(--color-electric)] bg-[color-mix(in_oklab,var(--color-electric)_12%,transparent)] text-white"
                            : "border-[var(--color-border)] bg-[var(--color-surface)]/40 text-zinc-300 hover:border-[var(--color-electric)]/50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold ${
                            active
                              ? "border-[var(--color-electric)] bg-[var(--color-electric)] text-[#041014]"
                              : "border-zinc-500 text-zinc-500"
                          }`}
                          aria-hidden
                        >
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              <div className="flex flex-wrap gap-3">
                {step > 0 ? (
                  <button type="button" className="site-btn-secondary min-h-11 px-4" onClick={() => setStep((s) => s - 1)}>
                    {t.back}
                  </button>
                ) : null}
                {step < questions.length - 1 ? (
                  <button
                    type="button"
                    className="site-btn-primary min-h-11 px-5"
                    disabled={selected == null}
                    onClick={() => setStep((s) => s + 1)}
                  >
                    {t.next}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="site-btn-primary min-h-11 px-5"
                    disabled={selected == null}
                    onClick={() => setDone(true)}
                  >
                    {t.finish}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-5" aria-live="polite">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-zinc-400">{t.scoreLabel}</p>
              <p className="text-4xl font-semibold tabular-nums text-white sm:text-5xl">
                {score}{" "}
                <span className="text-xl font-medium text-zinc-500 sm:text-2xl">
                  {t.of} {questions.length}
                </span>
              </p>
              <p className="max-w-xl text-base leading-relaxed text-zinc-300">{verdict}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/tools/scanner" className="site-btn-primary min-h-11 px-5">
                  {t.cta}
                </Link>
                <button type="button" className="site-btn-secondary min-h-11 px-4" onClick={restart}>
                  {t.restart}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
