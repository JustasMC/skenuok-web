"use client";

import Link from "next/link";
import Image from "next/image";
import { useDict } from "@/components/i18n/LocaleProvider";
import { DEFAULT_OG_IMAGE_PATH } from "@/lib/site-url";

export function Hero() {
  const dict = useDict();
  const stats = [
    { k: dict.hero.stats.audit, v: dict.hero.stats.auditV },
    { k: dict.hero.stats.analysis, v: dict.hero.stats.analysisV },
    { k: dict.hero.stats.courses, v: dict.hero.stats.coursesV },
    { k: dict.hero.stats.strategy, v: dict.hero.stats.strategyV },
    { k: dict.hero.stats.build, v: dict.hero.stats.buildV },
  ] as const;

  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]/90">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,color-mix(in_oklab,var(--color-electric)_14%,transparent),transparent_58%)]" />
      <div className="site-shell relative flex flex-col gap-10 pb-16 pt-14 sm:gap-12 sm:pb-24 sm:pt-20 md:pb-28 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16 lg:pt-24">
        <div className="site-enter flex max-w-2xl flex-col justify-center space-y-7 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-electric)] shadow-sm shadow-black/20 backdrop-blur-sm">
              {dict.hero.badge}
            </p>
            <h1 className="text-balance text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-white min-[400px]:text-4xl sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] lg:leading-[1.06]">
              {dict.hero.h1}
            </h1>
            <p className="text-pretty pt-1 text-sm font-medium text-zinc-300 sm:text-base">{dict.hero.lead}</p>
          </div>

          <div className="space-y-3 text-[0.9375rem] leading-relaxed text-zinc-300 sm:space-y-4 sm:text-lg sm:leading-relaxed">
            <p>
              <strong className="font-medium text-zinc-100">{dict.hero.p1Before}</strong> {dict.hero.p1Mid}{" "}
              <strong className="font-medium text-zinc-100">{dict.hero.p1Strong}</strong> {dict.hero.p1After}
            </p>
            <p className="text-zinc-300">
              {dict.hero.p2Before} <strong className="font-medium text-zinc-200">{dict.hero.p2Strong}</strong>{" "}
              {dict.hero.p2After}{" "}
              <Link
                href="#moduliai"
                className="font-medium text-[var(--color-electric)] underline-offset-2 hover:underline"
              >
                {dict.hero.modulesLink}
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="/scan/web" className="site-btn-primary w-full min-h-11 sm:w-auto">
              {dict.hero.ctaScanner}
            </Link>
            <Link href="#kontaktai" className="site-btn-secondary w-full min-h-11 sm:w-auto">
              {dict.hero.ctaProject}
            </Link>
          </div>

          <div className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-4 py-3.5 text-sm leading-relaxed text-zinc-200 backdrop-blur-sm sm:px-5">
            <span className="text-zinc-300">{dict.hero.tryLabel}</span>{" "}
            <Link
              href="/scan/web"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-lime)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/70"
            >
              {dict.hero.tryScanner}
            </Link>
            <span className="text-zinc-300"> {dict.hero.tryOr} </span>
            <a
              href="#seo-issukis"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:underline"
            >
              {dict.hero.tryChallenge}
            </a>
            <span className="text-zinc-300"> {dict.hero.tryOr} </span>
            <Link
              href="/tools/course-scanner"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-lime)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/70"
            >
              {dict.hero.tryCourse}
            </Link>
            <span className="text-zinc-300"> {dict.hero.tryThen} </span>
            <a
              href="#duk"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:underline"
            >
              {dict.hero.tryFaq}
            </a>
            <span className="text-zinc-300">.</span>
          </div>
        </div>

        <div className="site-enter-delay w-full shrink-0 sm:max-w-md lg:max-w-sm lg:self-center">
          <div className="mb-3 overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/60 sm:mb-4">
            <Image
              src={DEFAULT_OG_IMAGE_PATH}
              alt={dict.hero.h1}
              width={1200}
              height={630}
              priority={true}
              fetchPriority="high"
              loading="eager"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 22rem"
              className="h-auto w-full"
            />
          </div>
          <dl className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {stats.map((item) => (
              <div
                key={item.k}
                className="site-card-interactive flex flex-col justify-between rounded-xl p-3.5 backdrop-blur-sm sm:p-4"
              >
                <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{item.k}</dt>
                <dd className="mt-2 text-sm font-medium leading-snug text-[var(--color-lime)]">{item.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
