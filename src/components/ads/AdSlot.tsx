import Link from "next/link";
import { getActiveAds } from "@/lib/ads";
import { getRequestDictionary } from "@/lib/i18n/server";

type Props = { location: string };

/** Server-rendered B2B ad slot; shows sell CTA when empty. */
export async function AdSlot({ location }: Props) {
  const ads = await getActiveAds(location);
  const { dict, locale } = await getRequestDictionary();
  const isLt = locale === "lt";

  if (ads.length === 0) {
    return (
      <aside className="rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface-2)]/60 px-4 py-3 text-sm text-zinc-400">
        <span className="text-zinc-300">
          {isLt ? "Čia gali būti jūsų reklama." : "Your ad could be here."}
        </span>{" "}
        <Link href="/reklama" className="site-link-inline">
          {dict.ads.cta}
        </Link>
      </aside>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 motion-safe:transition-colors hover:border-[var(--color-electric)]/50"
        >
          {ad.sponsorName ? (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {isLt ? "Rėmėjas" : "Sponsored"} · {ad.sponsorName}
            </p>
          ) : (
            <p className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {isLt ? "Rėmėjas" : "Sponsored"}
            </p>
          )}
          <p className="mt-1 font-medium text-zinc-100">{ad.title}</p>
          {ad.description ? (
            <p className="mt-1 text-sm text-zinc-400">{ad.description}</p>
          ) : null}
        </a>
      ))}
    </div>
  );
}
