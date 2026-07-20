import Link from "next/link";
import { SectionHeader } from "@/components/ui/SectionHeader";

const items = [
  {
    id: "audit-first",
    role: "Paslaugų sektoriaus komanda",
    quote:
      "Pirmas žingsnis buvo Svetainių analizė — gavome aiškius prioritetus be perteklinio techninio žargono. Paskui lengviau dėliojome SEO strategiją su komanda.",
  },
  {
    id: "course-scan",
    role: "Nuotolinių kursų kūrėjai",
    quote:
      "Kursų skenavimas atskleidė spragas pasiūlos tekste, ne tik puslapio greitį. Padeda parduoti atsakingai ir laikytis pažadų, ne tik taisyti meta žymes.",
  },
  {
    id: "ai-audit",
    role: "B2B vidaus skaitmenizacija",
    quote:
      "AI SEO auditas per kelias minutes parodė, ką taisyti pirmiausia. Prioritetai fiksuoti — galėjome planuoti darbus, o ne ginčytis dėl nuomonės.",
  },
] as const;

export function HomeTestimonials() {
  return (
    <section
      id="atsiliepimai"
      className="site-section border-t border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-bg)_97%,var(--color-surface))]"
    >
      <div className="site-shell">
        <SectionHeader
          eyebrow="Kliento perspektyva"
          title="Kaip tipiniai projektai prasideda"
          description="Ilustratyvūs scenarijai pagal dažniausius užsakymus — ne individualūs citatos su vardais. Tikri atsiliepimai ir logotipai papildomi po projekto sutikimo."
        />
        <ul className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3" role="list">
          {items.map((t) => (
            <li key={t.id}>
              <figure className="site-card h-full p-6 sm:p-7">
                <blockquote className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                  <p className="text-pretty italic">{`„${t.quote}“`}</p>
                </blockquote>
                <figcaption className="mt-5 text-xs text-zinc-400">
                  <span className="font-medium text-zinc-200">{t.role}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-wide text-zinc-500">
                    Tipinis scenarijus
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-zinc-400 sm:mt-10 sm:text-sm">
          Norite įsitikinti patys? Pradėkite nuo{" "}
          <Link className="site-link-inline" href="/tools/scanner">
            URL skenerio
          </Link>{" "}
          arba{" "}
          <Link className="site-link-inline" href="/#kontaktai">
            parašykite dėl konsultacijos
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
