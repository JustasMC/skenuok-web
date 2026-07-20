"use client";

import { useDict } from "@/components/i18n/LocaleProvider";
import { useTheme } from "@/components/theme/ThemeProvider";
import { cn } from "@/lib/cn";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const dict = useDict();
  const isDark = theme === "dark";
  const label = isDark ? dict.theme.toLight : dict.theme.toDark;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-electric)] motion-safe:transition-[border-color,background-color,color] motion-safe:duration-200",
        "hover:border-[var(--color-electric)]/60 hover:bg-[color-mix(in_oklab,var(--color-electric)_10%,transparent)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-electric)]/60",
        className,
      )}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" fill="currentColor" />
          <path
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            d="M12 3v1.5M12 19.5V21M3 12h1.5M19.5 12H21M5.6 5.6l1.1 1.1M17.3 17.3l1.1 1.1M5.6 18.4l1.1-1.1M17.3 6.7l1.1-1.1"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
          <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3Z" />
        </svg>
      )}
    </button>
  );
}
