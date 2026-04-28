import { SectionHeader } from "@/components/ui/SectionHeader";

const pillars = [
  {
    title: "Engineered Performance",
    tech: "C++, Rust, Docker, SQL",
    value:
      "Kuriame sistemas, kurios išlaiko apkrovas be lėtėjimo: greitesnis atsakas vartotojui, stabilesnis veikimas piko metu ir mažesnė infrastruktūros rizika augant verslui.",
    accent: "from-[var(--color-electric)]/18 to-transparent",
  },
  {
    title: "AI & Neural Automation",
    tech: "LLM Agents, Bot Development, Python",
    value:
      "Automatizuojame pasikartojančius procesus, kad komanda sutelktų dėmesį į pardavimus ir sprendimus. Mažiau rankinio darbo, greitesnis aptarnavimas ir aiškesnė operacijų kontrolė.",
    accent: "from-[var(--color-lime)]/16 to-transparent",
  },
  {
    title: "Data Driven Growth",
    tech: "SEO, Google Analytics, PowerBI, UX",
    value:
      "Sprendimus remiame duomenimis, ne nuojauta: aiškiai matote, kas didina srautą ir konversiją, o optimizacijos darbai prioritetizuojami pagal realią verslo grąžą.",
    accent: "from-zinc-400/14 to-transparent",
  },
] as const;

export function Expertise() {
  return (
    <section id="expertise" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Expertise"
          title="Technologinė kompetencija, orientuota į verslo rezultatą"
          description="Sujungiame našumą, AI automatizaciją ir duomenų analitiką į vieną praktinį planą: greitesnė svetainė, efektyvesni procesai ir aiškiai pamatuojamas augimas."
        />

        <ul className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3" role="list">
          {pillars.map((item) => (
            <li key={item.title}>
              <article className="site-card-interactive group relative h-full overflow-hidden p-6 sm:p-7">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex h-full flex-col">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-300">{item.tech}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-tight text-white">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">{item.value}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
