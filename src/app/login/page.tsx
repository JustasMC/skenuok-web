import type { Metadata } from "next";
import { Suspense } from "react";
import { isDevLoginConfigured } from "@/auth";
import { PageIntro } from "@/components/PageIntro";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { getRequestDictionary } from "@/lib/i18n/server";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalPath, getSiteOrigin } from "@/lib/site-url";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const { dict, locale } = await getRequestDictionary();
  const title = dict.login.title;
  const description = dict.login.description;
  const canonical = getCanonicalPath("/login");

  return {
    title,
    description,
    keywords: ["login", "prisijungimas", "Google"],
    alternates: { canonical },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: {
      type: "website",
      locale: locale === "en" ? "en_US" : siteConfig.locale,
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

function envSet(name: string): boolean {
  return Boolean(process.env[name]?.trim());
}

export default async function LoginPage() {
  const { dict } = await getRequestDictionary();
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
          <PageIntro variant="page" kicker={dict.login.kicker} title={dict.login.title}>
            <p>
              {dict.login.leadBefore}{" "}
              <span className="font-medium text-zinc-200">{dict.login.leadStrong}</span> {dict.login.leadAfter}
            </p>
          </PageIntro>

          <Suspense
            fallback={
              <div className="site-skeleton mt-8 min-h-[280px] rounded-2xl" role="status" aria-live="polite">
                …
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
