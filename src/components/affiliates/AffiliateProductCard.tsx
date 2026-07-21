"use client";

import Link from "next/link";
import type { AffiliateRec } from "@/lib/niche-scan/types";

type Props = {
  item: AffiliateRec;
  locale?: string;
};

export function AffiliateProductCard({ item, locale }: Props) {
  async function trackClick() {
    try {
      await fetch("/api/affiliate/click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: item.category,
          productSlug: item.slug,
          locale: locale ?? null,
        }),
      });
    } catch {
      /* fire-and-forget */
    }
  }

  const external = item.href.startsWith("http");

  return (
    <article className="flex flex-col gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-100">{item.title}</h3>
        <p className="mt-1 text-sm text-zinc-400">{item.description}</p>
      </div>
      {external ? (
        <a
          href={item.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => void trackClick()}
          className="site-btn-lime inline-flex w-fit items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
        >
          {item.ctaLabel}
        </a>
      ) : (
        <Link
          href={item.href}
          onClick={() => void trackClick()}
          className="site-btn-primary inline-flex w-fit items-center justify-center rounded-lg px-3 py-2 text-sm font-semibold"
        >
          {item.ctaLabel}
        </Link>
      )}
    </article>
  );
}
