"use client";

import Link from "next/link";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import type { NavLink } from "@/lib/nav-links";

type Props = {
  open: boolean;
  onClose: () => void;
  labels: {
    scanners: string;
    otherTools: string;
    moreServices: string;
    inquiry: string;
    closeMenu: string;
  };
  scanners: NavLink[];
  otherTools: NavLink[];
  moreServices: NavLink[];
};

function Section({
  title,
  links,
  onClose,
}: {
  title: string;
  links: NavLink[];
  onClose: () => void;
}) {
  return (
    <>
      <p className="mt-2 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </p>
      {links.map((l) => (
        <Link
          key={`${l.href}-${l.label}`}
          href={l.href}
          className="rounded-lg px-3 py-3 text-sm text-zinc-200 hover:bg-white/5 hover:text-[var(--color-lime)]"
          onClick={onClose}
        >
          {l.label}
        </Link>
      ))}
    </>
  );
}

export function MobileMenu({
  open,
  onClose,
  labels,
  scanners,
  otherTools,
  moreServices,
}: Props) {
  if (!open) return null;

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm supports-[backdrop-filter]:bg-zinc-950/45 xl:hidden"
        aria-label={labels.closeMenu}
        onClick={onClose}
      />
      <div
        id="mobile-nav"
        className="relative z-50 max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain border-t border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-bg)_96%,#0a1620_4%)] shadow-lg shadow-black/40 xl:hidden"
      >
        <nav className="site-shell-wide flex flex-col gap-0.5 py-4" aria-label="Mobile">
          <div className="mb-2 px-3">
            <LanguageSwitcher />
          </div>

          <Section title={labels.scanners} links={scanners} onClose={onClose} />
          <Section title={labels.otherTools} links={otherTools} onClose={onClose} />
          <Section title={labels.moreServices} links={moreServices} onClose={onClose} />

          <Link
            href="/#kontaktai"
            className="mt-3 rounded-xl bg-[var(--color-electric)] px-3 py-3 text-center text-sm font-semibold text-[#041014] lg:hidden"
            onClick={onClose}
          >
            {labels.inquiry}
          </Link>
        </nav>
      </div>
    </>
  );
}
