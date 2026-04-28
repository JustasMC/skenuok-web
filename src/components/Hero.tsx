import Link from "next/link";
import Image from "next/image";
import { homePageH1 } from "@/lib/home-seo";

const stats = [
  { k: "AI SEO auditas", v: "Lighthouse + AI pastabos" },
  { k: "Svetainių analizė", v: "CWV, SEO, prieinamumas" },
  { k: "Kursų skenavimas", v: "Turinys, pažadai, metrikos" },
  { k: "SEO strategija", v: "Įrankis → tęsinys / projektas" },
  { k: "Svetainių kūrimas", v: "Next.js + SEO + AI integracijos" },
] as const;

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-border)]/90">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_18%,color-mix(in_oklab,var(--color-electric)_14%,transparent),transparent_58%)]" />
      <div className="site-shell relative flex flex-col gap-10 pb-16 pt-14 sm:gap-12 sm:pb-24 sm:pt-20 md:pb-28 lg:flex-row lg:items-stretch lg:justify-between lg:gap-16 lg:pt-24">
        <div className="site-enter flex max-w-2xl flex-col justify-center space-y-7 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <p className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-surface)_92%,transparent)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--color-electric)] shadow-sm shadow-black/20 backdrop-blur-sm">
              Skenuok.com · AI skeneris
            </p>
            <h1 className="text-balance text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-white min-[400px]:text-4xl sm:text-5xl sm:leading-[1.08] lg:text-[3.25rem] lg:leading-[1.06]">
              {homePageH1}
            </h1>
            <p className="text-pretty pt-1 text-sm font-medium text-zinc-400 sm:text-base">
              Kuriame žaibiškas Next.js svetaines ir skenuojame esamas, kad pasiektumėte Google viršūnę.
            </p>
          </div>

          <div className="space-y-3 text-[0.9375rem] leading-relaxed text-zinc-300 sm:space-y-4 sm:text-lg sm:leading-relaxed">
            <p>
              <strong className="font-medium text-zinc-100">AI SEO auditas</strong> prasideda nuo Svetainių analizės: ką rodo
              Google Lighthouse, kur silpsta Core Web Vitals, ir ką pirmiausia daryti, kad{" "}
              <strong className="font-medium text-zinc-100">SEO strategija</strong> turėtų tvirtą techninę bazę.
            </p>
            <p className="text-zinc-400">
              Jei parduodate mokymus, <strong className="font-medium text-zinc-200">Kursų kokybės skenavimas</strong> papildo
              klasikinę Svetainių analizę turinio ir pasiūlos prasme. Tada galite tęsti su generatoriumi, planais ar
              individualiu fullstack / AI projektu — <Link href="#moduliai" className="font-medium text-[var(--color-electric)] underline-offset-2 hover:underline">žr. modulius toliau</Link>.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link href="#kontaktai" className="site-btn-primary w-full min-h-11 sm:w-auto">
              Pradėkime projektą
            </Link>
            <Link href="#roi" className="site-btn-secondary w-full min-h-11 sm:w-auto">
              Apskaičiuokite sutaupymą
            </Link>
          </div>

          <div className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_88%,transparent)] px-4 py-3.5 text-sm leading-relaxed text-zinc-300 backdrop-blur-sm sm:px-5">
            <span className="text-zinc-400">Išbandykite:</span>{" "}
            <Link
              href="/tools/scanner"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-lime)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/70"
            >
              URL skaneris (Svetainių analizė)
            </Link>
            <span className="text-zinc-400"> arba </span>
            <Link
              href="/tools/course-scanner"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-lime)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/70"
            >
              kursų skenavimą
            </Link>
            <span className="text-zinc-400"> — tada peržiūrėkite </span>
            <a
              href="#duk"
              className="font-medium text-[var(--color-electric)] underline-offset-4 motion-safe:transition-colors motion-safe:duration-200 hover:underline"
            >
              DUK
            </a>
            <span className="text-zinc-400">.</span>
          </div>
        </div>

        <div className="site-enter-delay w-full shrink-0 sm:max-w-md lg:max-w-sm lg:self-center">
          <div className="mb-3 overflow-hidden rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-surface)]/60 sm:mb-4">
            <Image
              src="/og-image.png"
              alt="Svetainių kūrimas ir SEO auditas su Next.js"
              width={1200}
              height={630}
              priority={true}
              fetchPriority="high"
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
              <dt className="text-[10px] font-semibold uppercase tracking-wide text-zinc-400">{item.k}</dt>
              <dd className="mt-2 text-xs font-medium leading-snug text-[var(--color-lime)] sm:text-sm">{item.v}</dd>
            </div>
          ))}
        </dl>
        </div>
      </div>
    </section>
  );
}
