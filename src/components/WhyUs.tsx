import { SectionHeader } from "@/components/ui/SectionHeader";

const pillars = [
  {
    title: "Aukšto našumo žiniatinklis",
    body: "Kuriame svetaines, kurios ne tik atrodo moderniai, bet ir veikia greitai. Next.js, Tailwind ir serveriniai komponentai — SEO, prieinamumas ir Core Web Vitals kaip standartas, ne papildomas darbas.",
    accent: "border-[var(--color-electric)]/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(0,212,255,0.35)]",
    tag: "Žiniatinklis",
  },
  {
    title: "AI ir procesų automatizacija",
    body: "Integruojame AI agentus ir automatizaciją ten, kur tai sumažina rankinį darbą: turinys, SEO užduotys, duomenų apdorojimas. Visada su aiškia verslo logika ir žmogaus kontrole kritinėse vietose.",
    accent: "border-[var(--color-lime)]/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(200,255,0,0.3)]",
    tag: "AI",
  },
  {
    title: "Sprendimai pagal duomenis",
    body: "Kiekvienas prioritetas turi pagrindimą: SQL, GA4, Power BI ir techniniai auditai. SEO strategija remiasi faktais — ne spėjimais ar „gražiais“ ataskaitų skaičiais be konteksto.",
    accent: "border-sky-400/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(56,189,248,0.35)]",
    tag: "Duomenys",
  },
] as const;

export function WhyUs() {
  return (
    <section id="kodel-mes" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Kodėl mes"
          title="Rezultatai, kuriuos matuojame skaičiais"
          description="Ne spėliojame — matuojame. Platforma sukurta pagal tuos pačius SEO ir našumo principus, kuriuos taikome klientų projektuose."
        />

        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className={`site-card-interactive group flex flex-col border-t-2 ${p.accent} p-6 sm:p-8 ${p.glow} min-h-[18rem]`}
            >
              <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-electric)]">
                {p.tag}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:text-xl">{p.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
