"use client";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { useDict } from "@/components/i18n/LocaleProvider";

export function HomeFaq() {
  const dict = useDict();
  const items = [
    { q: dict.faq.q1, a: dict.faq.a1 },
    { q: dict.faq.q2, a: dict.faq.a2 },
    { q: dict.faq.q3, a: dict.faq.a3 },
    { q: dict.faq.q4, a: dict.faq.a4 },
    { q: dict.faq.q5, a: dict.faq.a5 },
    { q: dict.faq.q6, a: dict.faq.a6 },
    { q: dict.faq.q7, a: dict.faq.a7 },
  ];

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section id="duk" className="site-section border-t border-[var(--color-border)]/60" aria-labelledby="home-faq-heading">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <div className="site-shell max-w-3xl">
        <SectionHeader
          id="home-faq-heading"
          eyebrow={dict.faq.eyebrow}
          title={dict.faq.title}
          description={dict.faq.description}
        />
        <FaqAccordion className="mt-10 sm:mt-12" items={items} />
        <p className="mt-8 text-center text-sm text-zinc-300 sm:mt-10">
          <a className="site-link-inline font-medium" href="#paslaugos">
            {dict.faq.services}
          </a>{" "}
          · {dict.faq.compare}{" "}
          <a className="site-link-inline font-medium" href="/pricing">
            {dict.faq.prices}
          </a>{" "}
          ·{" "}
          <a className="site-link-inline font-medium" href="#kontaktai">
            {dict.faq.contacts}
          </a>
        </p>
      </div>
    </section>
  );
}
