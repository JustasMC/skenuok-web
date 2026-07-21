"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { MobileMenu } from "@/components/MobileMenu";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useDict } from "@/components/i18n/LocaleProvider";
import { buildNavGroups } from "@/lib/nav-links";
import { siteConfig } from "@/lib/site-config";

function DesktopDropdown({
  label,
  links,
}: {
  label: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className="site-nav-link inline-flex items-center gap-1"
        aria-haspopup="true"
        aria-label={label}
      >
        {label}
        <span aria-hidden className="text-xs text-zinc-400 group-hover:text-zinc-200">
          ▾
        </span>
      </button>
      <div className="pointer-events-none invisible absolute left-0 top-full z-50 mt-1 min-w-60 rounded-lg border border-[var(--color-border)]/80 bg-[var(--color-surface)] p-1 opacity-0 shadow-lg shadow-black/30 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
        {links.map((l) => (
          <Link
            key={`${l.href}-${l.label}`}
            href={l.href}
            className="block rounded-md px-2.5 py-2 text-sm text-zinc-200 hover:bg-white/5 hover:text-[var(--color-lime)]"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function SiteHeader() {
  const dict = useDict();
  const [mobileOpen, setMobileOpen] = useState(false);
  const groups = buildNavGroups(dict.nav);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-bg)_88%,transparent)] backdrop-blur-md supports-[backdrop-filter]:bg-[color-mix(in_oklab,var(--color-bg)_78%,transparent)]">
      <div className="site-shell-wide flex flex-nowrap items-center justify-between gap-2 py-2.5 sm:gap-3 sm:py-3">
        <Link
          href="/"
          className="flex min-w-0 shrink items-center gap-2 rounded-md font-semibold tracking-tight text-white motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/60 sm:gap-2.5"
          onClick={() => setMobileOpen(false)}
        >
          <Image
            src="/images/fs-ai-mark.svg"
            alt=""
            width={32}
            height={32}
            sizes="32px"
            className="h-8 w-8 shrink-0"
            priority
          />
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold sm:text-base">{siteConfig.name}</span>
            <span className="hidden text-xs font-normal tracking-wide text-zinc-500 xl:block">
              {dict.common.tagline}
            </span>
          </span>
        </Link>

        <nav
          className="hidden items-center gap-x-1 text-sm xl:flex"
          aria-label="Primary"
        >
          <DesktopDropdown label={dict.nav.scanners} links={groups.scanners} />
          <DesktopDropdown label={dict.nav.otherTools} links={groups.otherTools} />
          <DesktopDropdown label={dict.nav.moreServices} links={groups.moreServices} />
          {groups.primary.map((l) => (
            <Link
              key={`${l.href}-${l.label}`}
              href={l.href}
              className="site-nav-link whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center justify-end gap-1.5 sm:gap-2">
          <ThemeToggle />
          <LanguageSwitcher className="hidden sm:inline-flex" />
          <AuthHeaderActions />
          <Link
            href="/#kontaktai"
            className="hidden rounded-lg bg-[var(--color-electric)] px-3 py-1.5 text-sm font-semibold text-[#041014] motion-safe:transition-[filter,transform] motion-safe:duration-200 hover:brightness-110 lg:inline-flex"
          >
            {dict.nav.inquiry}
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-200 motion-safe:transition-[border-color,transform] motion-safe:duration-200 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/60 active:scale-95 xl:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? dict.nav.closeMenu : dict.nav.openMenu}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        labels={{
          scanners: dict.nav.scanners,
          otherTools: dict.nav.otherTools,
          moreServices: dict.nav.moreServices,
          inquiry: dict.nav.inquiry,
          closeMenu: dict.nav.closeMenu,
        }}
        scanners={groups.scanners}
        otherTools={groups.otherTools}
        moreServices={groups.moreServices}
      />
    </header>
  );
}
