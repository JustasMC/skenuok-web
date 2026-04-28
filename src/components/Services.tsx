import { SectionHeader } from "@/components/ui/SectionHeader";

const modules = [
  {
    title: "Žiniatinklio sprendimai (Next.js / Rust)",
    body: "Serveriniai komponentai SEO tikslams, aiški maršrutizacija ir tipų saugumas. Rust — ten, kur svarbiausias našumas ar deterministinė logika.",
    tag: "Fullstack",
  },
  {
    title: "Verslo logika ir automatizacija (Python / AI)",
    body: "Taisyklės užkoduojamos aiškiai, su stebėsena ir testais. AI agentai atlieka pasikartojančius sprendimus — su žmogaus patvirtinimu, kai reikia.",
    tag: "Automatizacija",
  },
  {
    title: "Duomenų analitika (SQL / Power BI / GA4)",
    body: "Vieningas tiesos šaltinis, GA4 įvykiai, Power BI ataskaitos ir SQL modeliai, kuriais galima pasitikėti sprendimuose.",
    tag: "Duomenys",
  },
  {
    title: "Kritinės sistemos ir realaus laiko duomenys",
    body: "Sprendimai, kuriose milisekundės ir duomenų vientisumas yra kritiniai. Rust ir C++ — našumui, API stabilumui ir saugumui dideliuose srautuose.",
    tag: "Našumas",
  },
] as const;

const badgeClass =
  "inline-block rounded-md border border-[var(--color-border)] bg-[color-mix(in_oklab,var(--color-bg)_75%,var(--color-surface-2))] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide text-zinc-300";

export function Services() {
  return (
    <section id="moduliai" className="site-section">
      <div className="site-shell">
        <SectionHeader
          eyebrow="Projektai"
          title="Keturi moduliai, kai reikia pilno ciklo"
          description="Jau turite strategiją iš Svetainių analizės ir kursų sluoksnio — čia pilnas kūrimas, automatizacija, duomenys ir kritiniai srautai. Nuo vieno bloko arba jungtinis kelias: aiškus planas, ne tik rekomendacijų PDF."
        />

        <div className="mt-12 grid gap-5 sm:mt-14 sm:gap-6 lg:grid-cols-2">
          {modules.map((m, i) => (
            <article
              key={m.title}
              className="site-card-interactive relative overflow-hidden p-6 sm:p-8"
            >
              <span className="pointer-events-none absolute -right-2 -top-4 select-none font-mono text-7xl font-bold text-[color-mix(in_oklab,var(--color-border)_65%,transparent)] sm:text-8xl">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="relative inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-electric)]">
                {m.tag}
              </span>
              <h3 className="relative mt-5 text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">{m.title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base sm:leading-relaxed">{m.body}</p>
              {m.tag === "Našumas" ? (
                <ul className="relative mt-5 flex flex-wrap gap-2" aria-label="Technologijos">
                  {(["Rust", "C++", "gRPC", "Real-time"] as const).map((b) => (
                    <li key={b}>
                      <span className={badgeClass}>{b}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
