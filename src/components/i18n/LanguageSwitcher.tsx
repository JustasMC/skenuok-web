"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

function setLocaleCookie(locale: Locale) {
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale) return;
    setLocaleCookie(next);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-0.5 text-sm",
        pending && "opacity-70",
        className,
      )}
      role="group"
      aria-label={dict.lang.label}
    >
      {(["lt", "en"] as const).map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            disabled={pending}
            onClick={() => switchTo(code)}
            className={cn(
              "min-h-8 min-w-9 rounded-md px-2 font-semibold motion-safe:transition-colors",
              active
                ? "bg-[color-mix(in_oklab,var(--color-electric)_18%,transparent)] text-[var(--color-electric)]"
                : "text-zinc-400 hover:text-zinc-200",
            )}
            aria-pressed={active}
          >
            {code === "lt" ? dict.lang.lt : dict.lang.en}
          </button>
        );
      })}
    </div>
  );
}
