import { SectionHeader } from "@/components/ui/SectionHeader";

const pillars = [
  {
    title: "High-Performance Web Engineering",
    body: "Kuriu svetaines, kurios ne tik atrodo moderniai, bet ir veikia žaibiškai. Mano stack\u2019as (Next.js, Tailwind v4, Docker) optimizuotas nuliui klaidų ir maksimaliam Google pasitikėjimui (100/100 SEO & Accessibility).",
    accent: "border-[var(--color-electric)]/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(0,212,255,0.35)]",
    tag: "Web",
  },
  {
    title: "AI Orchestration & Automation",
    body: "Nerašau kodo rankomis \u2014 aš jam diriguoju. Naudodamas pažangiausius AI agentus, integruoju LLM modelius bei automatizuoju verslo procesus (nuo YouTube turinio iki MEV botų architektūros).",
    accent: "border-[var(--color-lime)]/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(200,255,0,0.3)]",
    tag: "AI",
  },
  {
    title: "Data-Driven Decisions",
    body: "Kiekvienas pikselis turi pagrindimą. Naudoju SQL, MongoDB ir PowerBI, kad verslo sprendimai būtų grįsti skaičiais, o ne spėjimais. SEO optimizacija pasiekiama per techninį tikslumą, o ne tik raktažodžius.",
    accent: "border-sky-400/40",
    glow: "group-hover:shadow-[0_0_36px_-12px_rgba(56,189,248,0.35)]",
    tag: "Data",
  },
] as const;

export function WhyUs() {
  return (
    <section id="kodel-mes" className="site-section border-t border-[var(--color-border)]/60">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Kodėl mes?"
          title="Rezultatai, kuriuos matuojame realiais skaičiais"
          description="Mes ne spėliojame, o matuojame. Mūsų pačių platformos SEO balas yra 100/100, o prieinamumas — 97/100. Kuriame svetaines, kurias Google botai dievina, o vartotojai pasiekia akimirksniu."
        />

        <div className="mt-10 grid gap-5 sm:mt-12 md:grid-cols-3">
          {pillars.map((p) => (
            <article
              key={p.title}
              className={`site-card-interactive group flex flex-col border-t-2 ${p.accent} p-6 sm:p-8 ${p.glow} min-h-[18rem]`}
            >
              <span className="inline-flex w-fit rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-electric)]">
                {p.tag}
              </span>
              <h3 className="mt-4 text-lg font-semibold tracking-tight text-white sm:text-xl">
                {p.title}
              </h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-300 sm:text-base">
                {p.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
