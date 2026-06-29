import { SectionHeader } from "@/components/ui/SectionHeader";

const items = [
  {
    name: "Rita K.",
    role: "Paslaugų sektoriaus vadovė",
    quote:
      "Pirmas žingsnis buvo Svetainių analizė — gavome aiškius prioritetus be perteklinio techninio žargono. Paskui lengviau dėliojome SEO strategiją su komanda.",
  },
  {
    name: "Marius T.",
    role: "Nuotolinių kursų kūrėjas",
    quote:
      "Kursų skenavimas atskleidė spragas pasiūlos tekste, ne tik puslapio greitį. Padeda parduoti atsakingai ir laikytis pažadų, ne tik taisyti meta žymes.",
  },
  {
    name: "Eglė ir komanda",
    role: "B2B vidaus skaitmenizacija",
    quote:
      "AI SEO auditas per kelias minutes parodė, ką taisyti pirmiausia. Prioritetai fiksuoti — galėjome planuoti darbus, o ne ginčytis dėl nuomonės.",
  },
] as const;

export function HomeTestimonials() {
  return (
    <section id="atsiliepimai" className="site-section border-t border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-bg)_97%,var(--color-surface))]">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Atsiliepimai"
          title="Ką vertina mūsų klientai"
          description="Įmonės ir kūrėjai, kurie pradėjo nuo nemokamo audito ar skenerio ir tęsė su turiniu, planais ar individualiu projektu."
        />
        <ul
          className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 min-h-[24rem]"
          role="list"
        >
          {items.map((t) => (
            <li key={t.name}>
              <figure className="site-card h-full p-6 sm:p-7">
                <blockquote className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                  <p className="text-pretty italic">{`„${t.quote}"`}</p>
                </blockquote>
                <figcaption className="mt-5 text-xs text-zinc-300">
                  <span className="font-medium text-zinc-200">{t.name}</span>
                  <br />
                  <span>{t.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-zinc-400 sm:mt-10 sm:text-sm">
          Norite įsitikinti patys? Pradėkite nuo{" "}
          <a className="site-link-inline" href="/tools/scanner">
            URL skenerio
          </a>{" "}
          arba{" "}
          <a className="site-link-inline" href="#kontaktai">
            parašykite dėl konsultacijos
          </a>
          .
        </p>
      </div>
    </section>
  );
}
