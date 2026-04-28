import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath } from "@/lib/site-url";

const title = "Svetainių kūrimas ir SEO auditas: planas 2026-iesiems";
const description =
  "Praktinis 2026 planas: kaip sujungti svetainių kūrimą, techninį SEO auditą, AI automatizaciją ir analitiką į vieną augimo strategiją.";

const toc = [
  { id: "kontekstas", label: "Kontekstas 2026" },
  { id: "techninis-pagrindas", label: "Techninis pagrindas" },
  { id: "seo-auditas", label: "SEO auditas" },
  { id: "ai-sluoksnis", label: "AI sluoksnis" },
  { id: "matavimas", label: "Matavimas ir KPI" },
  { id: "90-dienu-planas", label: "90 dienų planas" },
] as const;

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/blog/svetainiu-kurimas-ir-seo-auditas-planas-2026");
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
    openGraph: {
      type: "article",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/og-image.png", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default function BlogPostPage() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-page-main">
        <div className="site-shell-wide py-12 sm:py-16">
          <header className="mb-10 max-w-3xl space-y-4 sm:mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">Blogas · 2026</p>
            <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
            <p className="text-base leading-relaxed text-zinc-400 sm:text-lg">{description}</p>
          </header>

          <div className="grid gap-8 lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-12">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <nav
                aria-label="Straipsnio turinys"
                className="rounded-xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_78%,transparent)] p-4"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Turinys</p>
                <ul className="mt-3 space-y-1.5">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        className="block rounded-md px-2 py-1.5 text-sm text-zinc-300 transition hover:bg-white/5 hover:text-[var(--color-electric)]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
                <Link href="/blog" className="site-link-inline mt-4 inline-flex text-xs">
                  ← Visi straipsniai
                </Link>
              </nav>
            </aside>

            <article className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-headings:text-white prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-li:text-zinc-300">
              <section id="kontekstas">
                <h2>Kontekstas 2026: kodėl „graži svetainė“ nebepakanka</h2>
                <p>
                  2026-aisiais laimi ne tie, kas greičiau nupiešia dizainą, o tie, kas greičiau paleidžia veikiančią
                  sistemą: aiški vertės žinutė, techniškai tvarkingas SEO, aukštas našumas ir duomenimis grįstos
                  iteracijos. Kitaip tariant — svetainė turi tapti augimo platforma, o ne statiniu lankstinuku.
                </p>
              </section>

              <section id="techninis-pagrindas">
                <h2>1) Techninis pagrindas: Next.js, našumas ir stabilumas</h2>
                <p>
                  Pirmas etapas yra inžinerinis: informacijos architektūra, maršrutų logika, serverinio renderinimo
                  strategija ir našumo biudžetas. Tvirtas techninis pagrindas leidžia ne tik greičiau krauti puslapį,
                  bet ir sumažina kaštus, kai projektas pradeda augti.
                </p>
                <ul>
                  <li>Core Web Vitals tikslai nustatomi prieš dizaino finalą.</li>
                  <li>Turinio šablonai optimizuojami indeksacijai ir konversijai.</li>
                  <li>Integracijos planuojamos taip, kad neardytų našumo.</li>
                </ul>
              </section>

              <section id="seo-auditas">
                <h2>2) SEO auditas: technika + semantika + prioritetai</h2>
                <p>
                  SEO auditas turi baigtis ne PDF ataskaita, o konkrečiu backlogu su prioritetais. Pirmiausia tvarkomi
                  baziniai blokatoriai (crawl/index), tada semantika (title, H1-H3, vidinės nuorodos), o galiausiai
                  turinio klasteriai pagal realias užklausas.
                </p>
              </section>

              <section id="ai-sluoksnis">
                <h2>3) AI sluoksnis: greitesnės iteracijos ir mažesnė kaina</h2>
                <p>
                  AI automatizuoja pasikartojančius darbus: turinio draftus, QA checklistus, vidinių nuorodų pasiūlymus,
                  rizikos signalus prieš publikavimą. Tai leidžia komandai daugiau laiko skirti strategijai ir UX
                  sprendimams.
                </p>
              </section>

              <section id="matavimas">
                <h2>4) Matavimas ir KPI: kas realiai rodo progresą</h2>
                <p>
                  Jei neturite KPI, neturite ir strategijos. Minimalus rinkinys: organinis srautas pagal klasterius,
                  konversijų rodiklis, kvalifikuotų užklausų skaičius, puslapio greitis ir grįžtančių vartotojų dalis.
                </p>
              </section>

              <section id="90-dienu-planas">
                <h2>90 dienų planas</h2>
                <ol>
                  <li><strong>1-30 d.</strong> techninė bazė + kritinių SEO klaidų sutvarkymas.</li>
                  <li><strong>31-60 d.</strong> turinio architektūra + AI palaikoma publikavimo rutina.</li>
                  <li><strong>61-90 d.</strong> analitika, CRO patobulinimai ir mastelio planas.</li>
                </ol>
                <p>
                  Toks ritmas leidžia pasiekti apčiuopiamą progresą per vieną ketvirtį ir išvengti „amžino
                  perprojektavimo“ ciklo.
                </p>
              </section>
            </article>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
