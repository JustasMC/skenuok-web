import Link from "next/link";
import type { ReactNode } from "react";
import { PageIntro } from "@/components/PageIntro";
import { siteConfig } from "@/lib/site-config";

export type LegalTocItem = { id: string; label: string };

type Props = {
  kicker: string;
  title: string;
  description: string;
  toc: readonly LegalTocItem[];
  children: ReactNode;
  backHref?: string;
  backLabel?: string;
};

/** Teisinių puslapių layout su TOC ir profesionaliu skaitymo stiliumi. */
export function LegalPageShell({
  kicker,
  title,
  description,
  toc,
  children,
  backHref = "/",
  backLabel = "← Grįžti į pagrindinį",
}: Props) {
  return (
    <div className="site-shell-wide py-10 sm:py-14">
      <PageIntro variant="page" kicker={kicker} title={title}>
        <p>{description}</p>
      </PageIntro>

      <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <nav
            aria-label="Dokumento turinys"
            className="rounded-2xl border border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-surface)_82%,transparent)] p-4 shadow-lg shadow-black/15"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-electric)]">
              Turinys
            </p>
            <ul className="mt-3 space-y-0.5">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="block rounded-lg px-2.5 py-2 text-sm text-zinc-300 motion-safe:transition-colors hover:bg-white/[0.04] hover:text-[var(--color-electric)]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
            <Link href={backHref} className="site-link-inline mt-5 inline-flex text-xs">
              {backLabel}
            </Link>
          </nav>

          <div className="mt-4 hidden rounded-2xl border border-[var(--color-border)]/60 bg-[color-mix(in_oklab,var(--color-electric)_6%,var(--color-surface))] p-4 lg:block">
            <p className="text-xs font-medium text-zinc-200">Reikia pagalbos?</p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">
              Klausimais dėl duomenų ar sąlygų rašykite{" "}
              <a href={`mailto:${siteConfig.contactEmail}`} className="site-link-inline">
                {siteConfig.contactEmail}
              </a>
              .
            </p>
          </div>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
