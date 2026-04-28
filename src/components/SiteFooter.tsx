import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

const footerLinkClass =
  "rounded-md px-1 py-0.5 text-sm text-zinc-500 motion-safe:transition-colors motion-safe:duration-200 hover:text-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-border)]/90 bg-[color-mix(in_oklab,var(--color-bg)_96%,black)] py-12 sm:py-14">
      <div className="site-shell flex flex-col gap-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <div className="max-w-md">
            <p className="font-semibold tracking-tight text-zinc-200">{siteConfig.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Next.js · serveriniai komponentai · SEO pirmiausia
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm" aria-label="Poraštės nuorodos">
            <Link href="/#paslaugos" className={footerLinkClass}>
              AI SEO auditas
            </Link>
            <Link href="/#atsiliepimai" className={footerLinkClass}>
              Atsiliepimai
            </Link>
            <Link href="/#duk" className={footerLinkClass}>
              DUK
            </Link>
            <Link href="/#kontaktai" className={footerLinkClass}>
              Kontaktai
            </Link>
            <Link href="/tools/scanner" className={footerLinkClass}>
              URL skaneris
            </Link>
            <Link href="/tools/course-scanner" className={footerLinkClass}>
              Kursų skaneris
            </Link>
            <Link href="/irankiai/seo-generatorius" className={footerLinkClass}>
              SEO generatorius
            </Link>
            <Link href="/pricing" className={footerLinkClass}>
              Kainos
            </Link>
            <Link href="/terms" className={footerLinkClass}>
              Paslaugų sąlygos
            </Link>
            <Link href="/privacy" className={footerLinkClass}>
              Privatumas
            </Link>
          </nav>
        </div>
        <div className="flex flex-col gap-3 border-t border-[var(--color-border)]/80 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 sm:justify-end">
            <p className="font-mono text-[11px] text-zinc-500">FS·AI</p>
            <nav className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]" aria-label="Teisinės nuorodos">
              <Link href="/terms" className="text-zinc-500 hover:text-[var(--color-electric)]">
                Terms
              </Link>
              <Link href="/privacy" className="text-zinc-500 hover:text-[var(--color-electric)]">
                Privacy
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
