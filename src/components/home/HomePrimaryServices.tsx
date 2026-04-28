import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

const cards = [
  {
    title: "AI SEO auditas",
    kicker: "Nemokamas",
    body:
      "Pradėkite nuo greitos Svetainių analizės: Lighthouse, techninė ir prieinamumo diagnostika, AI rekomendacijos lietuvių kalba. Tinka, kai reikia aiškios SEO strategijos techniniam sluoksniui.",
    href: "/tools/scanner",
    cta: "Atidaryti URL skanerį",
  },
  {
    title: "Kursų kokybės skenavimas",
    kicker: "PageSpeed + AI",
    body:
      "Jei parduodate mokymus — ne tik metrikas: papildomai vertiname pasiūlos turinį ir atitikimą pažadams. Tinka ilgalaikei SEO strategijai, kai produktas yra pats kursas.",
    href: "/tools/course-scanner",
    cta: "Bandyti kursų skanerį",
  },
  {
    title: "Svetainių kūrimas",
    kicker: "Nauja",
    body: "Nuo idėjos iki pilnai SEO optimizuoto Next.js sprendimo su AI integracijomis.",
    href: "/svetainiu-kurimas",
    cta: "Peržiūrėti paslaugą",
  },
] as const;

export function HomePrimaryServices() {
  return (
    <section id="paslaugos" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Paslaugos"
          title="Ką galite gauti pirmu žingsniu"
          description="Du aiškūs įrankiai: AI SEO auditas (Svetainių analizė) ir Kursų kokybės skenavimas. Toliau — plėtra su SEO strategija, turinio generatoriumi ar individualiu projektu; žr. modulius ir kontaktus toliau puslapyje."
        />

        <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 min-h-[20rem]" role="list">
          {cards.map((c) => (
            <li key={c.title}>
              <article className="site-card-interactive flex h-full flex-col p-6 sm:p-8">
                <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                  {c.kicker}
                </span>
                <h3 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">{c.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400 sm:text-base">{c.body}</p>
                <Link
                  href={c.href}
                  className="site-link-inline mt-6 inline-flex w-fit font-medium text-[var(--color-electric)] underline-offset-4"
                >
                  {c.cta} →
                </Link>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 text-center text-sm text-zinc-300 sm:mt-12">
          Priedas verslui: lietuviškas{" "}
          <Link className="site-link-inline font-medium" href="/irankiai/seo-generatorius">
            SEO turinio generatorius
          </Link>{" "}
          ir visos{" "}
          <Link className="site-link-inline font-medium" href="/pricing">
            kainodaros
          </Link>{" "}
          plano parinktys. Individualiam projektui —{" "}
          <a className="site-link-inline font-medium" href="#kontaktai">
            kontaktai
          </a>
          .
        </p>
      </div>
    </section>
  );
}
