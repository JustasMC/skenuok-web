import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { getHomeFaqJsonLd, homeFaqContent } from "@/lib/home-seo";

export function HomeFaq() {
  const faqJsonLd = getHomeFaqJsonLd();

  return (
    <section id="duk" className="site-section border-t border-[var(--color-border)]/60" aria-labelledby="home-faq-heading">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="site-shell max-w-3xl">
        <SectionHeader
          id="home-faq-heading"
          eyebrow="D.U.K."
          title="SEO URL skeneris, Svetainių analizė ir techninis SEO"
          description="Atsakymai apie skenerio naudą, Next.js / React ir SEO, optimizacijos žingsnius po ataskaitos, URL ir kursų režimus bei saugumą. Apie kainas ir projektus — Paslaugos ir Kontaktai toliau puslapyje."
        />
        <FaqAccordion
          className="mt-10 sm:mt-12"
          items={homeFaqContent}
        />
        <p className="mt-8 text-center text-sm text-zinc-300 sm:mt-10">
          <a className="site-link-inline font-medium" href="#paslaugos">
            Paslaugos
          </a>{" "}
          · Palyginkite{" "}
          <a className="site-link-inline font-medium" href="/pricing">
            kainas
          </a>{" "}
          ·{" "}
          <a className="site-link-inline font-medium" href="#kontaktai">
            Kontaktai
          </a>
        </p>
      </div>
    </section>
  );
}
