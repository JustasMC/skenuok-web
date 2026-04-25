import { SectionHeader } from "@/components/ui/SectionHeader";

const cases = [
  {
    tag: "E‑komercija · AI",
    title: "AI valdoma e‑komercija ir žiniatinklis",
    badges: ["Next.js", "OpenAI API", "Tailwind"],
    outcomes: [
      "Našumas: orientacija į 95+ Lighthouse ir stiprius Core Web Vitals — dažnai eina koja už kojos su geresniu matomumu.",
      "SEO: organinio srauto pokyčiai priklauso nuo pradinės būklės ir nišos; dažnai matomas augimas pirmųjų mėnesių laikotarpyje.",
      "AI asistentas paieškai ir kontekstui — mažiau paliktų krepšelių ir greitesnis atsakymas be papildomo personalo.",
    ],
  },
  {
    tag: "Automatizacija · Python",
    title: "Verslo procesų įrankis (Python / API)",
    badges: ["Python", "Docker", "PostgreSQL"],
    outcomes: [
      "Pasikartojantis valdymas perkeltas į aiškiai aprašytą verslo logiką su API integracijomis.",
      "Komandai: ~10 val. rankinio darbo per savaitę sutraukiama į kelias minutes automatizuotos eigos.",
      "Stebėsena, klaidų valdymas ir auditas — automatika lieka valdoma, ne „juoda dėžė“.",
    ],
  },
  {
    tag: "Power BI · SQL",
    title: "Duomenų analitikos skydelis",
    badges: ["Power BI", "SQL", "GA4"],
    outcomes: [
      "SQL modelis ir Power BI sluoksnis: vieningi KPI, susieti su pajamomis ir operacijomis.",
      "Sprendimai pagal skaičius, ne tik nuojautą — aiškus savininko vaizdas.",
      "GA4 įvykiai derinami su finansiniu vaizdu, kai reikia pilno piltuvo analizės.",
    ],
  },
] as const;

const badgeClass =
  "inline-block rounded-md border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_75%,var(--color-surface-2))] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-zinc-500";

export function CaseStudies() {
  return (
    <section id="atvejai" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Portfolio"
          title="Atvejai pagal tris kompetencijų kryptis"
          description="Greitas žiniatinklis su AI, automatizuota verslo logika ir sprendimai iš patikimų duomenų — su aiškia vertės logika, ne vien technologijų sąrašu."
          wide
        />

        <ul className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-3">
          {cases.map((c, index) => (
            <li key={c.title}>
              <article className="site-card-interactive flex h-full flex-col p-6 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <span className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                    {c.tag}
                  </span>
                  <span className="font-mono text-xs tabular-nums text-zinc-600">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold leading-snug tracking-tight text-white sm:text-xl">{c.title}</h3>
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Technologijos">
                  {c.badges.map((b) => (
                    <li key={b}>
                      <span className={badgeClass}>{b}</span>
                    </li>
                  ))}
                </ul>
                <ul className="mt-5 flex flex-1 flex-col gap-3.5 text-sm leading-relaxed text-zinc-400">
                  {c.outcomes.map((line) => (
                    <li key={line} className="flex gap-3">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-lime)]" aria-hidden />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-10 max-w-3xl border-l-2 border-[var(--color-border)] pl-4 text-xs leading-relaxed text-zinc-500 sm:mt-12 sm:text-sm">
          <strong className="font-medium text-zinc-400">Pastaba:</strong> rodomi rezultatai yra iliustratyvūs — kiekvienas projektas turi savo bazę ir konkurenciją. Prieš viešus KPI sutariame matavimo modelį (GA4, Search Console, pajamos, operacijos).
        </p>
      </div>
    </section>
  );
}
