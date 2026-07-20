import type { Metadata } from "next";
import { Suspense } from "react";
import { isDevLoginConfigured } from "@/auth";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";
import { LoginForm } from "./LoginForm";

/** Runtime env (AUTH_GOOGLE_*) — never bake at Docker build. */
export const dynamic = "force-dynamic";

const title = "Prisijungimas";
const description =
  "Prisijunkite su Google arba el. pašto nuoroda — 3 dovanų kreditai pirmą kartą, SEO generatorius ir darbo vieta.";

function envSet(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export async function generateMetadata(): Promise<Metadata> {
  const canonical = getCanonicalPath("/login");

  return {
    title,
    description,
    keywords: [
      "prisijungimas",
      "Google",
      "prisijungimo nuoroda",
      "saugus prisijungimas"
    ],
    alternates: { canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title,
      description,
      images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/opengraph-image"],
    },
  };
}

export default function LoginPage() {
  const googleConfigured = envSet("AUTH_GOOGLE_ID") && envSet("AUTH_GOOGLE_SECRET");
  const emailConfigured =
    envSet("EMAIL_SERVER_HOST") &&
    envSet("EMAIL_FROM") &&
    envSet("EMAIL_SERVER_USER") &&
    envSet("EMAIL_SERVER_PASSWORD");
  const devLoginEmailHint = process.env.DEV_LOGIN_EMAIL?.trim() ?? "";
  const siteBase = getSiteOrigin();
  const oauthCallbackUrl = `${siteBase}/api/auth/callback/google`;
  const isProd = process.env.NODE_ENV === "production";

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-shell-wide py-16 sm:py-24">
        <div className="mx-auto w-full max-w-lg">
          <PageIntro variant="page" kicker="Paskyra" title={title}>
            <p>
              Naudokite Google paskyrą arba gaukite vienkartinę prisijungimo nuorodą el. paštu. Pirmą kartą —{" "}
              <span className="font-medium text-zinc-200">3 dovanų kreditai</span> generatoriui.
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton mt-8 min-h-[280px] rounded-2xl" role="status" aria-live="polite">
                Kraunama…
              </div>
            }
          >
            <LoginForm
              googleConfigured={googleConfigured}
              emailConfigured={emailConfigured}
              devLoginConfigured={isDevLoginConfigured}
              devLoginEmailHint={devLoginEmailHint}
              oauthCallbackUrl={oauthCallbackUrl}
              isProduction={isProd}
              contactEmail={siteConfig.contactEmail}
            />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
