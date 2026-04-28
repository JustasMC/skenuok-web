"use client";

import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  className?: string;
  /** Wider intro text on large screens */
  wide?: boolean;
  /** Optional anchor id for the section <h2> (landmarks, aria-labelledby) */
  id?: string;
};

/**
 * Vienoda sekcijų antraštė: „eyebrow“ + H2 + lead — geresniam skaitomumui ir „premium“ įspūdžiui.
 */
export function SectionHeader({ eyebrow, title, description, className = "", wide, id }: Props) {
  return (
    <div className={cn("space-y-3 sm:space-y-4", wide ? "max-w-3xl" : "max-w-2xl", className)}>
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">{eyebrow}</p>
      ) : null}
      <h2
        id={id}
        className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight"
      >
        {title}
      </h2>
      <p className="text-pretty text-base leading-relaxed text-zinc-300 sm:text-lg sm:leading-relaxed">{description}</p>
    </div>
  );
}
