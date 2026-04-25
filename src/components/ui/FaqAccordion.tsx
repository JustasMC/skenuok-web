import { cn } from "@/lib/cn";

export type FaqItem = { q: string; a: string };

type Props = {
  items: readonly FaqItem[];
  className?: string;
  /** Class for each <details> wrapper */
  itemClassName?: string;
  /** If true, first item opens with open attribute (optional UX) */
  firstOpen?: boolean;
};

const defaultDetails = "group rounded-xl border border-[var(--color-border)]/90 bg-[color-mix(in_oklab,var(--color-surface)_85%,black)] p-0";

/**
 * Reusable native <details> FAQ block — RSC-friendly, no JS. SEO: questions as visible text.
 */
export function FaqAccordion({ items, className, itemClassName, firstOpen }: Props) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, i) => (
        <details
          key={item.q}
          className={cn(defaultDetails, itemClassName)}
          open={firstOpen && i === 0 ? true : undefined}
        >
          <summary
            className="flex w-full cursor-pointer list-none items-start justify-between gap-2 p-4 pr-5 text-left text-sm font-medium leading-snug text-zinc-100 sm:p-5 sm:text-base [&::-webkit-details-marker]:hidden"
            aria-label={item.q}
          >
            {item.q}
            <span
              className="shrink-0 text-[10px] text-[var(--color-electric)] group-open:rotate-180 motion-safe:transition-transform"
              aria-hidden
            >
              ▼
            </span>
          </summary>
          <p className="border-t border-[var(--color-border)]/60 px-4 py-3 text-sm leading-relaxed text-zinc-400 sm:px-5 sm:py-4 sm:text-base">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
