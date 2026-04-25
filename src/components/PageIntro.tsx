import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Props = {
  kicker: string;
  title: string;
  children: ReactNode;
  /** Įrankių puslapiai: centruota ant mobile. Vidiniai / kainodara: visada iš kairės. */
  variant?: "tool" | "page";
  className?: string;
};

/** Bendras puslapių hero blokas — sutampa su marketingo sekcijų tipografija. */
export function PageIntro({ kicker, title, children, variant = "tool", className }: Props) {
  return (
    <header
      className={cn(
        "mb-10 space-y-3 sm:mb-12 sm:space-y-4",
        variant === "tool" && "mx-auto max-w-3xl text-center md:mx-0 md:text-left",
        variant === "page" && "max-w-2xl text-left",
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">{kicker}</p>
      <h1 className="text-balance text-3xl font-semibold tracking-tight text-white sm:text-4xl md:text-5xl">{title}</h1>
      <div
        className={cn(
          "leading-relaxed text-zinc-400",
          variant === "tool" && "text-base md:text-lg",
          variant === "page" && "text-sm sm:text-base",
        )}
      >
        {children}
      </div>
    </header>
  );
}
