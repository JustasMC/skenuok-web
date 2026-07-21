"use client";

import Link from "next/link";
import { useDict } from "@/components/i18n/LocaleProvider";
import { siteConfig } from "@/lib/site-config";

const footerLinkClass =
  "rounded-md text-sm text-zinc-400 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50";

export function SiteFooter() {
  const dict = useDict();
  const columns = [
    {
      title: dict.footer.services,
      links: [
        { href: "/svetainiu-kurimas", label: dict.footer.webBuild },
        { href: "/#paslaugos", label: dict.footer.modules },
        { href: "/#paketai", label: dict.nav.packages },
        { href: "/#atvejai", label: dict.footer.cases },
        { href: "/pricing", label: dict.footer.pricing },
        { href: "/#kontaktai", label: dict.footer.contact },
      ],
    },
    {
      title: dict.footer.tools,
      links: [
        { href: "/scan/web", label: dict.footer.urlScanner },
        { href: "/tools/course-scanner", label: dict.footer.courseScanner },
        { href: "/irankiai/seo-generatorius", label: dict.footer.seoGenerator },
        { href: "/#roi", label: dict.footer.roi },
        { href: "/#seo-issukis", label: dict.footer.challenge },
      ],
    },
    {
      title: dict.footer.info,
      links: [
        { href: "/blog", label: dict.footer.blog },
        { href: "/#duk", label: dict.footer.faq },
        { href: "/#atsiliepimai", label: dict.footer.reviews },
        { href: "/terms", label: dict.footer.terms },
        { href: "/privacy", label: dict.footer.privacy },
      ],
    },
  ] as const;

  return (
    <footer className="border-t border-[var(--color-border)]/90 bg-[color-mix(in_oklab,var(--color-bg)_96%,black)] py-12 sm:py-16">
      <div className="site-shell flex flex-col gap-10">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:gap-8">
          <div className="max-w-sm">
            <p className="text-lg font-semibold tracking-tight text-white">{siteConfig.name}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
              {dict.common.tagline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{dict.footer.blurb}</p>
            <p className="mt-4">
              <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline text-sm">
                {siteConfig.contactEmail}
              </a>
            </p>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-300">{col.title}</p>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLinkClass}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-[var(--color-border)]/80 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <p className="flex flex-wrap gap-x-4 gap-y-1">
            <Link href="/privacy" className="hover:text-zinc-300">
              {dict.footer.privacyShort}
            </Link>
            <Link href="/terms" className="hover:text-zinc-300">
              {dict.footer.termsShort}
            </Link>
            <span>Next.js · TypeScript · Tailwind</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
