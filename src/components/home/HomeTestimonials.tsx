import { SectionHeader } from "@/components/ui/SectionHeader";

const items = [
  {
    name: "Rita K.",
    role: "Direktorė (paslaugų sektorius)",
    quote:
      "Skenuok.com pirmas žingsnis buvo Svetainių analizė — gavome aiškius prioritetus be „techninio žargono“ ant kūno. Paskui lengviau dėliojame SEO strategiją su komanda.",
  },
  {
    name: "Marius T.",
    role: "Kursų kūrimas, nuotolinis",
    quote:
      "Kursų skenavimas atskleidė spragas pasiūlos tekste, ne tik „greitumą“. Padeda parduoti atsakingai ir pagal pažadus, ne tik pataisyti meta žymes.",
  },
  {
    name: "B2B komanda (pavyzdys)",
    role: "Įmonės vidaus projektas",
    quote:
      "AI SEO auditas per kelias minutes parodė, ką taisyti pirmiausia. Iki pilnos transformacijos dar savaitės, bet prioritetai fiksuoti. Skaičiai — kaip priedas, o ne atvirkščiai.",
  },
] as const;

export function HomeTestimonials() {
  return (
    <section id="atsiliepimai" className="site-section border-t border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-bg)_97%,var(--color-surface))]">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Atsiliepimai"
          title="Ką sako pirmi bandymai (iliustratyvūs pavyzdžiai)"
          description="Žemiau — pavyzdiniai citatų laukai; publikuodami realius vardus, sutarsime dėl leidimų. Strategija, aiški eiga ir matau pokytį, ne tik ataskaita."
        />
        <ul
          className="mt-10 grid list-none gap-5 sm:mt-12 sm:grid-cols-2 lg:grid-cols-3 min-h-[24rem]"
          role="list"
        >
          {items.map((t) => (
            <li key={t.name}>
              <figure className="site-card h-full p-6 sm:p-7">
                <blockquote className="text-sm leading-relaxed text-zinc-300 sm:text-base">
                  <p className="text-pretty italic">„{t.quote}“</p>
                </blockquote>
                <figcaption className="mt-5 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">{t.name}</span>
                  <br />
                  <span>{t.role}</span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-8 text-xs leading-relaxed text-zinc-600 sm:mt-10 sm:text-sm">
          <strong className="font-medium text-zinc-500">Skaidrumas:</strong> šios citatos yra placeholderiai demonstracijai. Norėdami matyti tikras rekomendacijas,
          pirmiausia paleiskite{" "}
          <a className="site-link-inline" href="#paslaugos">
            AI SEO auditą ar kursų skenavimą
          </a>{" "}
          ir įvertinkite rezultatą patys.
        </p>
      </div>
    </section>
  );
}
