import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Shared readable column for Terms / Privacy (RSC). */
export function LegalArticle({ children }: Props) {
  return (
    <div className="mx-auto max-w-3xl space-y-8 text-sm leading-relaxed text-zinc-300 sm:text-[0.9375rem] sm:leading-relaxed">
      {children}
    </div>
  );
}

type SectionProps = { id?: string; title: string; children: ReactNode };

export function LegalSection({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
