"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthHeaderActions } from "@/components/AuthHeaderActions";

const links = [
  { href: "/#paslaugos", label: "Paslaugos" },
  { href: "/#atsiliepimai", label: "Atsiliepimai" },
  { href: "/#atvejai", label: "Atvejai" },
  { href: "/#duk", label: "DUK" },
  { href: "/svetainiu-kurimas", label: "Svetainių kūrimas" },
  { href: "/irankiai/seo-generatorius", label: "SEO generatorius" },
  { href: "/pricing", label: "Kainos" },
  { href: "/#stack", label: "Stack" },
  { href: "/#roi", label: "ROI" },
  { href: "/#kontaktai", label: "Kontaktai" },
] as const;

const scannerLinks = [
  { href: "/tools/scanner", label: "URL skaneris" },
  { href: "/tools/course-scanner", label: "Kursų skaneris" },
] as const;

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

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
      <div className="site-shell-wide flex flex-wrap items-center justify-between gap-3 py-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 rounded-md font-semibold tracking-tight text-white motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/60"
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
          <span className="leading-none">
            FS<span className="text-[var(--color-electric)]">·</span>AI
          </span>
        </Link>

        <nav
          className="hidden flex-wrap items-center gap-x-1 gap-y-1 text-sm md:flex lg:gap-x-0.5"
          aria-label="Pagrindinė navigacija"
        >
          <div className="group relative">
            <button
              type="button"
              className="site-nav-link inline-flex items-center gap-1"
              aria-haspopup="true"
              aria-label="Skeneriai meniu"
            >
              Skeneriai
              <span aria-hidden className="text-[10px] text-zinc-300 group-hover:text-zinc-200">
                ▾
              </span>
            </button>
            <div className="pointer-events-none invisible absolute left-0 top-full z-50 mt-1 min-w-44 rounded-lg border border-[var(--color-border)]/80 bg-[var(--color-surface)] p-1 opacity-0 shadow-lg shadow-black/30 transition group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
              {scannerLinks.map((l) => (
                <Link key={l.href} href={l.href} className="block rounded-md px-2.5 py-2 text-sm text-zinc-200 hover:bg-white/5 hover:text-[var(--color-lime)]">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="site-nav-link">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2">
          <AuthHeaderActions />
          <Link
            href="/#kontaktai"
            className="hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1.5 text-xs font-medium text-zinc-100 motion-safe:transition-[border-color,transform] motion-safe:duration-200 hover:border-[var(--color-electric)] sm:inline-flex sm:px-3 sm:text-sm"
          >
            Užklausa
          </Link>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-zinc-200 motion-safe:transition-[border-color,transform] motion-safe:duration-200 hover:border-[var(--color-electric)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/60 active:scale-95 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Uždaryti meniu" : "Atidaryti meniu"}
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

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-zinc-950/70 backdrop-blur-sm supports-[backdrop-filter]:bg-zinc-950/45 md:hidden"
            aria-label="Uždaryti meniu"
            onClick={() => setMobileOpen(false)}
          />
          <div
            id="mobile-nav"
            className="relative z-50 max-h-[min(70vh,calc(100dvh-4rem))] overflow-y-auto overscroll-contain border-t border-[var(--color-border)]/80 bg-[color-mix(in_oklab,var(--color-bg)_96%,#0a1620_4%)] shadow-lg shadow-black/40 md:hidden"
          >
            <nav className="site-shell-wide flex flex-col gap-0.5 py-4" aria-label="Mobilioji navigacija">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-3 text-sm text-zinc-200 motion-safe:transition-colors motion-safe:duration-200 hover:bg-white/5 hover:text-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 active:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <p className="mt-2 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-300">Skeneriai</p>
              {scannerLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-lg px-3 py-3 text-sm text-zinc-200 motion-safe:transition-colors motion-safe:duration-200 hover:bg-white/5 hover:text-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 active:bg-white/10"
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/#kontaktai"
                className="mt-1 rounded-lg px-3 py-3 text-sm font-medium text-zinc-100 motion-safe:transition-colors motion-safe:duration-200 hover:bg-white/5 hover:text-[var(--color-lime)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/50 sm:hidden"
                onClick={() => setMobileOpen(false)}
              >
                Kontaktai / užklausa
              </Link>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  );
}
