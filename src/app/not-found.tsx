import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Puslapis nerastas (404)",
  description: "Užklausta nuoroda neegzistuoja arba buvo perkelta. Grįžkite į pradžią arba naudokite meniu.",
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title: "404 — puslapis nerastas",
    description: "Nuoroda pasenusi arba neteisinga.",
    siteName: siteConfig.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "404" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "404 — puslapis nerastas",
    description: "Nuoroda pasenusi arba neteisinga.",
    images: ["/opengraph-image"],
  },
};

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell flex min-h-[60dvh] flex-col items-center justify-center py-20 text-center">
        <div className="site-card max-w-md space-y-6 p-8 sm:p-10">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-electric)]">404</p>
            <h1 className="text-balance text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Puslapis nerastas
            </h1>
            <p className="text-pretty text-sm leading-relaxed text-zinc-400">
              Nuoroda gali būti pasenusi, o adresas įvestas su klaida. Patikrinkite URL arba grįžkite į pradžią.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="site-btn-primary min-h-11 w-full sm:w-auto">
              Į pradžią
            </Link>
            <Link href="/#kontaktai" className="site-btn-secondary min-h-11 w-full sm:w-auto">
              Kontaktai
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
