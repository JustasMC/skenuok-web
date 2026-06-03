import { SectionHeader } from "@/components/ui/SectionHeader";

const items = [
  {
    name: "React",
    role: "Interaktyvios sąsajos ir dizaino sistema",
    accent: "from-[#61dafb]/20 to-transparent",
  },
  {
    name: "Python",
    role: "AI agentai, backend logika, automatizacija",
    accent: "from-[#ffd43b]/15 to-transparent",
  },
  {
    name: "Rust",
    role: "Našumas, saugumas, kritiniai moduliai",
    accent: "from-[#dea584]/20 to-transparent",
  },
  {
    name: "Docker",
    role: "Deterministinė infrastruktūra ir diegimas",
    accent: "from-[#2496ed]/18 to-transparent",
  },
  {
    name: "SQL",
    role: "Modeliavimas, ETL, ataskaitos",
    accent: "from-[var(--color-electric)]/15 to-transparent",
  },
] as const;

export function TechStack() {
  return (
    <section id="stack" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Technologijos"
          title="Ekosistema nuo sąsajos iki duomenų"
          description="Įrankiai susiejami į vieną pasiūlymą: UI, verslo logika, duomenų sluoksnis ir produkcijos konteineriai — su aiškia atsakomybe už kiekvieną sluoksnį."
        />

        <ul className="mt-12 grid grid-cols-1 gap-3 sm:mt-14 sm:grid-cols-2 sm:gap-4 lg:grid-cols-5">
          {items.map((item) => (
            <li key={item.name}>
              <article className="site-card-interactive group relative flex h-full flex-col overflow-hidden p-5 motion-safe:hover:shadow-[var(--shadow-glow)]">
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${item.accent} opacity-0 motion-safe:transition-opacity motion-safe:duration-300 group-hover:opacity-100`}
                />
                <div className="relative flex flex-1 flex-col">
                  <h3 className="text-lg font-semibold tracking-tight text-white">{item.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-300">{item.role}</p>
                  <span className="mt-6 inline-flex text-[11px] font-semibold uppercase tracking-wider text-[var(--color-lime)]">
                    Pipeline dalis
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
